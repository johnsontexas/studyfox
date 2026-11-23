// Supabase-backed sign-in (Google, Apple) and progress sync. No-ops when js/config.js is blank.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { store } from './store.js';
import { toast } from './util.js';
import { takeAfterLogin } from './views/account.js';

export const cloudEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
let sb = null, pushTimer = null, ready = null;
// Id of the account whose cloud copy has been downloaded and merged. Until then nothing is uploaded,
// so a fresh device can never overwrite newer progress with its own blank or older copy.
let pulledFor = null;
/** True once this cloud account's saved progress has been loaded on this page (or there is no cloud). */
export const cloudSynced = (id) => !cloudEnabled || pulledFor === id;
// The progress JSON last known to match the cloud copy; pushes that would send the same thing are skipped.
let lastPushed = null;

async function client() {
  if (!cloudEnabled) return null;
  if (!sb) {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    // PKCE puts the OAuth result in ?code=, which keeps it out of the hash router.
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
  }
  return sb;
}

// Microsoft is "azure" in Supabase and only returns an email address when asked for the email scope.
const oauthOpts = (provider) => ({ redirectTo: location.origin + location.pathname, ...(provider === 'azure' ? { scopes: 'email' } : {}) });

export async function signInWith(provider) {
  const c = await client();
  if (!c) throw new Error('Social sign-in is not set up on this site yet.');
  const { error } = await c.auth.signInWithOAuth({ provider, options: oauthOpts(provider) });
  if (error) throw error;
}

// Google, Apple and Microsoft on one account: Supabase links them automatically when both share a verified email.
// When they don't (e.g. Apple "Hide My Email"), the student connects the second one here while signed in.
export async function linkedProviders() {
  const c = await client(); if (!c) return [];
  const { data } = await c.auth.getUserIdentities();
  return (data?.identities || []).map((i) => i.provider);
}

export async function linkProvider(provider) {
  const c = await client();
  if (!c) throw new Error('Social sign-in is not set up on this site yet.');
  try { sessionStorage.setItem('sf_after_link', '#/settings'); } catch {}
  const { error } = await c.auth.linkIdentity({ provider, options: oauthOpts(provider) });
  if (error) throw new Error(/manual linking/i.test(error.message) ? 'Connecting accounts is turned off on the server right now.' : error.message);
}

// Shared client for public tables (news, site status). Waits for the session so admin writes carry it.
export async function db() { const c = await client(); if (ready) await ready.catch(() => {}); return c; }

let adminCheck = null;
// Server decides admin rights (public.is_admin); this only hides admin UI from everyone else.
export function isAdmin() {
  const u = store.user();
  if (!cloudEnabled || !u?.cloud) return Promise.resolve(false);
  if (adminCheck?.id !== u.id) adminCheck = { id: u.id, p: db().then((c) => c.rpc('is_admin')).then(({ data }) => data === true).catch(() => false) };
  return adminCheck.p;
}

// Supabase limits how many emails and sign-ins we can use each day. When that runs out, say so plainly.
const OUT_OF_QUOTA = 'Sorry, we ran out of our data plan for today. Please try a different sign-in method or try again later.';
const overQuota = (e) => e?.status === 429 || /rate limit|over_email_send|too many requests|quota/i.test(`${e?.code || ''} ${e?.message || ''}`);

// Email and password accounts, stored in Supabase like Google and Apple ones so progress syncs too.
// Returns { confirm: true } when Supabase wants the address confirmed before the first sign-in.
export async function emailSignUp({ name, email, password }) {
  const c = await client();
  if (!c) throw new Error('Accounts are not set up on this site yet.');
  const { data, error } = await c.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: location.origin + '/verified.html' } });
  if (overQuota(error)) throw new Error(OUT_OF_QUOTA);
  if (error) throw new Error(/registered|exists/i.test(error.message) ? 'An account with that email already exists. Sign in instead.' : error.message);
  return { confirm: !data.session };
}

export async function emailSignIn(email, password) {
  const c = await client();
  if (!c) throw new Error('Accounts are not set up on this site yet.');
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (!error) return { ok: true };
  if (overQuota(error)) throw new Error(OUT_OF_QUOTA);
  if (/confirm/i.test(error.message)) throw new Error('Confirm your email first. Check your inbox for the link we sent.');
  // Accounts made before email sync existed only live on this device: move them to the cloud with the same password.
  if (/invalid/i.test(error.message) && (await store.hasLocalAccount(email, password))) {
    const name = store.localName(email) || email.split('@')[0];
    return { moved: true, ...(await emailSignUp({ name, email, password })) };
  }
  throw new Error(/invalid/i.test(error.message) ? 'Email or password is incorrect.' : error.message);
}

export async function resetPassword(email) {
  const c = await client();
  if (!c) throw new Error('Accounts are not set up on this site yet.');
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + '#/settings' });
  if (overQuota(error)) throw new Error(OUT_OF_QUOTA);
  if (error) throw error;
}

export async function updatePassword(password) {
  const c = await client();
  const { error } = await c.auth.updateUser({ password });
  if (error) throw error;
}

export async function cloudSignOut() { const c = await client(); if (c) await c.auth.signOut(); }

// Deletes the login and everything tied to it (progress, leaderboard times, reports, blocks).
export async function deleteAccount() {
  const c = await client(); const u = store.user();
  if (!c || !u?.cloud) return;
  const { error } = await c.rpc('delete_my_account');
  if (error) throw new Error(error.message);
}

async function pull(user) {
  const { data, error } = await sb.from('progress').select('data').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn(error); setTimeout(() => { if (store.user()?.id === user.id) pull(user); }, 30000); return; }
  store.mergeIn(data?.data || null);
  pulledFor = user.id;
  lastPushed = data?.data ? JSON.stringify(data.data) : null;
  logActivity(user.id);
  await push();
}

// One row per student per day (duplicates ignored) so retention can be measured in Supabase.
// Remembered per device so a page load only writes once a day.
function logActivity(id) {
  const key = 'sf_act_' + id, today = new Date().toISOString().slice(0, 10);
  try { if (localStorage.getItem(key) === today) return; localStorage.setItem(key, today); } catch {}
  sb.from('user_activity').upsert({ user_id: id, platform: 'web' }, { onConflict: 'user_id,day', ignoreDuplicates: true }).then(({ error }) => error && console.warn(error));
}

async function push() {
  const u = store.user();
  if (!sb || !u?.cloud || pulledFor !== u.id) return;
  const json = JSON.stringify(store.data());
  if (json === lastPushed) return;
  const { error } = await sb.from('progress').upsert({ user_id: u.id, data: store.data(), updated_at: new Date().toISOString() });
  if (!error) lastPushed = json;
  // Offline or a server hiccup: try again shortly so no progress is left only on this device.
  if (error) { console.warn('Sync failed', error); clearTimeout(pushTimer); pushTimer = setTimeout(push, 30000); }
}

export function initCloud() {
  if (!cloudEnabled) return;
  ready = (async () => {
    const c = await client();
    // Finish the OAuth code exchange before touching the URL; stripping ?code= early loses the sign-in.
    const { data: { session } } = await c.auth.getSession();
    let back = null; try { back = sessionStorage.getItem('sf_after_link'); sessionStorage.removeItem('sf_after_link'); } catch {}
    const q = new URLSearchParams(location.search);
    // Some provider failures come back in the hash (#error=...), which the router would otherwise swallow.
    const hq = /^#(error|access_token)=|[#&]error_description=/.test(location.hash) ? new URLSearchParams(location.hash.slice(1)) : null;
    if (hq?.get('error_description') && !q.get('error_description')) { q.set('error_description', hq.get('error_description')); q.set('error', hq.get('error') || ''); location.hash = ''; }
    // A failed link (e.g. that Apple ID already has its own StudyFox account) comes back as ?error_description=.
    if (q.get('error_description')) setTimeout(() => toast(/already linked|exists/i.test(q.get('error_description')) ? 'That account is already its own StudyFox account. Sign in with it, delete its data in Settings, then connect it here.' : q.get('error_description'), 'bad'), 300);
    if (q.has('code') || q.has('error')) history.replaceState(null, '', location.pathname + (back || location.hash || '#/dashboard'));
    else if (back) location.hash = back;
    const adopt = (user, fresh) => {
      const m = user.user_metadata || {};
      store.cloudLogin({ id: user.id, email: user.email || '', name: store.user()?.id === user.id ? store.user().name : (m.full_name || m.name || (user.email || 'Student').split('@')[0]), provider: user.app_metadata?.provider });
      // Defer: Supabase calls made inside the auth callback can deadlock.
      setTimeout(() => pull(user).then(() => {
        if (!fresh) return;
        toast('Signed in. Your progress is synced.', 'good');
        if (!location.hash || location.hash === '#/' || location.hash === '#/login' || location.hash === '#/signup') location.hash = takeAfterLogin();
      }), 0);
    };
    // Every load with a session pulls the latest cloud copy, so other devices' progress shows up.
    if (session?.user) adopt(session.user, store.user()?.id !== session.user.id);
    c.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') { if (store.user()?.cloud) store.logout(); return; }
      // Opened a password-reset link: send them to Settings to choose a new password.
      if (event === 'PASSWORD_RECOVERY') setTimeout(() => { location.hash = '#/settings?reset=1'; toast('Choose a new password below.'); }, 0);
      if (event === 'SIGNED_IN' && s?.user && store.user()?.id !== s.user.id) adopt(s.user, true);
    });
  })();
  // Debounced push 20s after the last local save (keeps database writes low); flush when the tab is hidden.
  store.onSave(() => { clearTimeout(pushTimer); pushTimer = setTimeout(push, 20000); });
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(pushTimer); push(); } });
}
