// Supabase-backed sign-in (Google, Apple) and progress sync. No-ops when js/config.js is blank.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { store } from './store.js';
import { toast } from './util.js';

export const cloudEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
let sb = null, pushTimer = null, ready = null;

async function client() {
  if (!cloudEnabled) return null;
  if (!sb) {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    // PKCE puts the OAuth result in ?code=, which keeps it out of the hash router.
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
  }
  return sb;
}

export async function signInWith(provider) {
  const c = await client();
  if (!c) throw new Error('Google and Apple sign-in are not set up on this site yet.');
  const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } });
  if (error) throw error;
}

export async function cloudSignOut() { const c = await client(); if (c) await c.auth.signOut(); }

export async function deleteCloudData() {
  const c = await client(); const u = store.user();
  if (c && u?.cloud) await c.from('progress').delete().eq('user_id', u.id);
}

async function pull(user) {
  const { data, error } = await sb.from('progress').select('data').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn(error); return; }
  store.mergeIn(data?.data || null);
  await push();
}

async function push() {
  const u = store.user();
  if (!sb || !u?.cloud) return;
  const { error } = await sb.from('progress').upsert({ user_id: u.id, data: store.data(), updated_at: new Date().toISOString() });
  if (error) console.warn('Sync failed', error);
}

export function initCloud() {
  if (!cloudEnabled) return;
  ready = (async () => {
    const c = await client();
    c.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      if (event === 'SIGNED_OUT') { if (store.user()?.cloud) store.logout(); return; }
      if (!user || store.user()?.id === user.id) return;
      const m = user.user_metadata || {};
      store.cloudLogin({ id: user.id, email: user.email || '', name: m.full_name || m.name || (user.email || 'Student').split('@')[0], provider: user.app_metadata?.provider });
      setTimeout(() => pull(user).then(() => { toast('Signed in. Your progress is synced.', 'good'); if (!location.hash || location.hash === '#/login' || location.hash === '#/signup') location.hash = '#/dashboard'; }), 0);
    });
    if (location.search.includes('code=')) history.replaceState(null, '', location.pathname + (location.hash || '#/dashboard'));
  })();
  // Debounced push after every local save; flush when the tab is hidden.
  store.onSave(() => { clearTimeout(pushTimer); pushTimer = setTimeout(push, 2000); });
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(pushTimer); push(); } });
}
