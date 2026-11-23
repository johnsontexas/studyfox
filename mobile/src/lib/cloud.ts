// Google / Apple sign-in and progress sync. Same Supabase project, table, and merge rules as the
// website (js/cloud.js), so a student's progress is shared between the site and the app.
import { memberCards } from '../../../js/members.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';
import { SITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, store } from './shared';
import { flush } from './storage';

WebBrowser.maybeCompleteAuthSession();

export const cloudEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
let sb: SupabaseClient | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
// Id of the account whose cloud copy has been downloaded and merged. Until then nothing is uploaded,
// so a fresh device can never overwrite newer progress with its own blank or older copy.
let pulledFor: string | null = null;
/** True once this account's saved progress has loaded on this launch. */
export const cloudSynced = (id: string) => pulledFor === id;
// The progress JSON last known to match the cloud copy; pushes that would send the same thing are skipped.
let lastPushed: string | null = null;

function client() {
  if (!cloudEnabled) return null;
  sb ||= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
  return sb;
}

/** Supabase client for public content (courses, lessons, questions); null when cloud is off. */
export const contentClient = () => client();

// True while a freshly signed-in account's cloud copy is downloading. Until it arrives the app
// can't tell whether onboarding was already done (on the website or another phone).
let pulling = false;
export const isPulling = () => pulling;

// When this device last exchanged progress with the cloud (shown in Me), and whether the last try failed.
let lastSync = 0;
let syncError = false;
export const syncStatus = () => ({ at: lastSync, failed: syncError });

async function pull(user: User) {
  const { data, error } = await sb!.from('progress').select('data').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn(error); syncError = true; store.emit(); setTimeout(() => { if (store.user()?.id === user.id) pull(user).catch(console.warn); }, 30000); return; }
  store.mergeIn(data?.data || null);
  pulledFor = user.id;
  lastPushed = data?.data ? JSON.stringify(data.data) : null;
  logActivity(user.id);
  await push();
}

// One row per student per day so retention can be measured in Supabase; remembered on the device so it writes once a day.
async function logActivity(id: string) {
  const key = 'sf_act_' + id, today = new Date().toISOString().slice(0, 10);
  try { if ((await AsyncStorage.getItem(key)) === today) return; await AsyncStorage.setItem(key, today); } catch {}
  sb!.from('user_activity').upsert({ user_id: id, platform: 'ios' }, { onConflict: 'user_id,day', ignoreDuplicates: true }).then(({ error }) => { if (error) console.warn(error); });
}

async function push() {
  const u = store.user();
  if (!sb || !u?.cloud || pulledFor !== u.id) return;
  const json = JSON.stringify(store.data());
  if (json === lastPushed) { syncError = false; lastSync = Date.now(); return; }
  const { error } = await sb.from('progress').upsert({ user_id: u.id, data: store.data(), updated_at: new Date().toISOString() });
  if (!error) lastPushed = json;
  if (error) { console.warn('Sync failed', error); if (pushTimer) clearTimeout(pushTimer); pushTimer = setTimeout(push, 30000); }
  syncError = !!error;
  if (!error) lastSync = Date.now();
}

/** Pull the latest progress from the website and other devices, then upload this device's. */
export async function syncNow() {
  const c = client(); const u = store.user();
  if (!c || !u?.cloud) return;
  if (pushTimer) clearTimeout(pushTimer);
  const { data } = await c.auth.getUser();
  if (data.user) await pull(data.user);
  store.emit();
}

function adopt(user: User, nameHint?: string) {
  const m = user.user_metadata || {};
  const cur = store.user();
  store.cloudLogin({
    id: user.id,
    email: user.email || '',
    name: cur?.id === user.id ? cur.name : nameHint || m.full_name || m.name || (user.email || 'Student').split('@')[0],
    provider: user.app_metadata?.provider,
  });
  // Defer: Supabase calls made inside the auth callback can deadlock.
  pulling = true;
  store.emit();
  setTimeout(() => {
    // Give up waiting after 8 seconds (offline) so the student isn't stuck on a spinner.
    const giveUp = setTimeout(() => { if (pulling) { pulling = false; store.emit(); } }, 8000);
    pull(user).catch(console.warn).finally(() => { clearTimeout(giveUp); pulling = false; store.emit(); });
  }, 0);
}

let started = false;
export async function initCloud() {
  const c = client();
  if (!c || started) return;
  started = true;
  // Every launch with a session pulls the latest cloud copy, so the website's progress shows up.
  const { data: { session } } = await c.auth.getSession();
  if (session?.user) adopt(session.user);
  c.auth.onAuthStateChange((event, s) => {
    if (event === 'SIGNED_OUT') { if (store.user()?.cloud) store.logout(); return; }
    if (event === 'SIGNED_IN' && s?.user && store.user()?.id !== s.user.id) adopt(s.user, pendingName);
  });
  // Debounced push after every local save; flush when the app goes to the background.
  store.onSave(() => { if (pushTimer) clearTimeout(pushTimer); pushTimer = setTimeout(push, 20000); });
  AppState.addEventListener('change', (st) => {
    if (st === 'active') { c.auth.startAutoRefresh(); const u = store.user(); if (u?.cloud) c.auth.getUser().then(({ data }) => data.user && pull(data.user)); }
    else { c.auth.stopAutoRefresh(); if (pushTimer) clearTimeout(pushTimer); push(); flush(); }
  });
}

let pendingName: string | undefined;

// Supabase always accepts studyfox.org, so the browser returns to studyfox.org/app-auth.html, which hands the
// sign-in code to this app's link (exp://... in Expo Go, studyfox://... in the App Store build).
const appUrl = () => Linking.createURL('auth-callback');
const handoff = () => `${SITE_URL}/app-auth.html?to=${encodeURIComponent(appUrl())}`;

async function finishInBrowser(url: string) {
  const c = client()!;
  const res = await WebBrowser.openAuthSessionAsync(url, appUrl());
  if (res.type !== 'success') return false;
  const u = new URL(res.url);
  const err = u.searchParams.get('error_description');
  if (err) throw new Error(err);
  const code = u.searchParams.get('code');
  if (!code) throw new Error('Sign-in did not finish. Please try again.');
  const { error } = await c.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return true;
}

/** Providers connected to this account (website: Settings → Sign-in methods). */
export async function linkedProviders(): Promise<string[]> {
  const c = client(); if (!c) return [];
  const { data } = await c.auth.getUserIdentities();
  return (data?.identities || []).map((i) => i.provider);
}

/** Connect Google or Apple to the signed-in account, so either one opens the same progress. */
export async function linkProvider(provider: 'google' | 'apple') {
  const c = client();
  if (!c) throw new Error('Sign-in is not set up yet.');
  const { data, error } = await c.auth.linkIdentity({ provider, options: { redirectTo: handoff(), skipBrowserRedirect: true } });
  if (error) throw new Error(/manual linking/i.test(error.message) ? 'Connecting accounts is turned off on the server right now.' : error.message);
  return finishInBrowser(data.url);
}

export async function signInWithGoogle() {
  const c = client();
  if (!c) throw new Error('Google sign-in is not set up yet.');
  const { data, error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: handoff(), skipBrowserRedirect: true } });
  if (error) throw error;
  return finishInBrowser(data.url);
}

export const appleAvailable = () => (Platform.OS === 'ios' ? AppleAuthentication.isAvailableAsync() : Promise.resolve(false));

export async function signInWithApple() {
  const c = client();
  if (!c) throw new Error('Apple sign-in is not set up yet.');
  const cred = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
  });
  if (!cred.identityToken) throw new Error('Apple did not return a sign-in token.');
  // Apple only shares the name on the very first sign-in, so keep it.
  const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
  pendingName = name || undefined;
  const { error } = await c.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken });
  if (error) throw error;
  if (name) await c.auth.updateUser({ data: { full_name: name } });
  return true;
}

// Supabase limits how many emails and sign-ins we can use each day. When that runs out, say so plainly.
const OUT_OF_QUOTA = 'Sorry, we ran out of our data plan for today. Please try a different sign-in method or try again later.';
const overQuota = (e: any) => e?.status === 429 || /rate limit|over_email_send|too many requests|quota/i.test(`${e?.code || ''} ${e?.message || ''}`);

// Email and password accounts live in Supabase too (same as studyfox.org), so their progress syncs.
// Returns { confirm: true } when the address must be confirmed before the first sign-in.
export async function emailSignUp({ name, email, password }: { name: string; email: string; password: string }) {
  const c = client();
  if (!c) throw new Error('Accounts are not set up yet.');
  pendingName = name || undefined;
  const { data, error } = await c.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${SITE_URL}/verified.html` } });
  if (overQuota(error)) throw new Error(OUT_OF_QUOTA);
  if (error) throw new Error(/registered|exists/i.test(error.message) ? 'An account with that email already exists. Sign in instead.' : error.message);
  return { confirm: !data.session, moved: false };
}

export async function emailSignIn(email: string, password: string): Promise<{ confirm?: boolean; moved?: boolean }> {
  const c = client();
  if (!c) throw new Error('Accounts are not set up yet.');
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (!error) return {};
  if (overQuota(error)) throw new Error(OUT_OF_QUOTA);
  if (/confirm/i.test(error.message)) throw new Error('Confirm your email first. Check your inbox for the link we sent.');
  // Accounts made before email sync only lived on this phone: move them to the cloud with the same password.
  if (/invalid/i.test(error.message) && (await store.hasLocalAccount(email, password))) {
    return { ...(await emailSignUp({ name: store.localName(email) || email.split('@')[0], email, password })), moved: true };
  }
  throw new Error(/invalid/i.test(error.message) ? 'Email or password is incorrect.' : error.message);
}

export async function cloudSignOut() { const c = client(); if (c) await c.auth.signOut(); }

/** Deletes the login and everything tied to it (progress, leaderboard times, reports, blocks). */
export async function deleteAccount() {
  const c = client(); const u = store.user();
  if (!c || !u?.cloud) return;
  const { error } = await c.rpc('delete_my_account');
  if (error) throw new Error(error.message);
}

// News posts and the maintenance switch, written from the website's admin console (js/views/news.js).
export type NewsPost = {
  id: number; title: string; body: string; pinned: boolean; image_url?: string; created_at: string;
  popup?: boolean; popup_until?: string | null; notify?: boolean; cta_label?: string; cta_url?: string;
};
// select('*') so the feed keeps working before or after supabase/announcements.sql adds its columns.
export async function fetchNews(limit = 50): Promise<NewsPost[]> {
  const c = client(); if (!c) return [];
  const { data, error } = await c.from('news').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data as NewsPost[];
}
/** Announcements marked "pop up when people open StudyFox" that haven't expired, newest first. */
export async function fetchPopups(): Promise<NewsPost[]> {
  const c = client(); if (!c) return [];
  const { data, error } = await c.from('news').select('*').eq('popup', true).order('created_at', { ascending: false }).limit(5);
  if (error) return [];
  const now = Date.now();
  return (data as NewsPost[]).filter((n) => !n.popup_until || new Date(n.popup_until).getTime() > now);
}
/** Save this phone's Expo push token so announcements can reach it (supabase/announcements.sql). */
export async function savePushToken(token: string, platform: string) {
  const c = client(); if (!c) return;
  const { error } = await c.rpc('register_push_token', { p_token: token, p_platform: platform });
  if (error) console.warn('Could not save push token', error.message);
}
export async function removePushToken(token: string) {
  const c = client(); if (!c) return;
  await c.rpc('unregister_push_token', { p_token: token });
}
/** Admin kill switch for email sign-up (site_status.email_signup). Assumes on if it can't be read. */
/** Top 10 Match times for a set (one per person), like the website's leaderboard. */
export async function fetchMatchBoard(key: string): Promise<{ user_id: string; name: string; seconds: number; no?: number; avatar?: any }[]> {
  const c = client(); if (!c) return [];
  const [{ data, error }, { data: blocks }] = await Promise.all([
    c.from('match_scores').select('user_id,name,seconds').eq('set_key', key).order('seconds').limit(300),
    c.from('match_blocks').select('blocked'),
  ]);
  if (error) throw error;
  const seen = new Set<string>((blocks || []).map((b: any) => b.blocked));
  const top = (data as any[]).filter((r) => !seen.has(r.user_id) && seen.add(r.user_id)).slice(0, 10);
  // Player numbers, shown instead of names when "Hide other students' names" is on (supabase/member_numbers.sql).
  // Foxes come with them (supabase/fox_avatars.sql).
  const byId = await memberCards(c, top.map((r) => r.user_id));
  return top.map((r) => ({ ...r, no: byId.get(r.user_id)?.no, avatar: byId.get(r.user_id)?.avatar }));
}
export async function reportMatchPlayer(key: string, userId: string, name: string) {
  const { error } = await client()!.from('match_reports').insert({ set_key: key, reported_user: userId, name });
  if (error) throw new Error(error.message);
}
export async function blockMatchPlayer(userId: string) {
  const { error } = await client()!.from('match_blocks').upsert({ blocked: userId });
  if (error) throw new Error(error.message);
}
export async function postMatchTime(key: string, name: string, seconds: number) {
  const c = client(); if (!c) return;
  await c.from('match_scores').insert({ set_key: key, name, seconds });
}

export async function emailSignupOn(): Promise<boolean> {
  const c = client(); if (!c) return true;
  const { data } = await c.from('site_status').select('email_signup').eq('id', 1).maybeSingle();
  return (data as any)?.email_signup !== false;
}
export async function fetchStatus(): Promise<{ maintenance: boolean; message: string; admin: boolean } | null> {
  const c = client(); if (!c) return null;
  const [{ data }, { data: admin }] = await Promise.all([c.from('site_status').select('maintenance,message').eq('id', 1).maybeSingle(), c.rpc('is_admin')]);
  return data ? { ...data, admin: admin === true } : null;
}
