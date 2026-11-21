// StudyFox user numbers and friend referrals (Supabase table members).
// Every account gets the next number when it's created: #1 was the first student, and numbers are never
// reused, even after an account is deleted. A student's referral link is studyfox.org/referral/<number>;
// opening it remembers the number on this device so onboarding can fill in "Which friend sent you?".
// No DOM here beyond localStorage, so the iOS app can use it too (it passes its own client).
import { store } from './store.js';
import { SITE_URL } from './config.js';
import { cleanAvatar, PARTS, isUnlocked } from './avatar.js';

const REF = 'sf_ref';

/** The referral link for a user number, or the plain site link without one. */
export const referralUrl = (no) => (no ? `${SITE_URL.replace(/\/$/, '')}/referral/${no}` : SITE_URL.replace(/\/$/, ''));

/** The signed-in student's number from the last sync (or null). */
export const myNumber = () => store.data().settings.memberNo || null;

/** The friend's number from a referral link opened on this device, if any. */
export function pendingRef() { try { return localStorage.getItem(REF) || ''; } catch { return ''; } }
export function clearRef() { try { localStorage.removeItem(REF); } catch {} }

/** Remember ?ref=123 (where /referral/123 redirects) and tidy the address bar. Call once at startup. */
export function captureRef() {
  try {
    const q = new URLSearchParams(location.search);
    const m = location.pathname.match(/\/ref+er+al\/(\d{1,9})\/?$/i);
    const ref = q.get('ref') || m?.[1];
    if (!ref || !/^\d{1,9}$/.test(ref)) return;
    localStorage.setItem(REF, ref);
    q.delete('ref');
    const rest = q.toString();
    history.replaceState(null, '', (m ? '/' : location.pathname) + (rest ? '?' + rest : '') + (location.hash || ''));
  } catch {}
}

/**
 * Fetch { no, referred_by, referrals, display_name, show_on_leaderboard, total } for the signed-in student
 * and cache the number in settings (synced with progress). Resolves null without an account.
 */
export async function loadMember(client) {
  const sb = await client;
  if (!sb || !store.user()?.cloud) return null;
  const { data, error } = await sb.rpc('my_member');
  if (error) { console.warn(error); return null; }
  const m = data?.[0] || null;
  if (m) {
    m.no = Number(m.no); m.referrals = Number(m.referrals); m.total = Number(m.total);
    const s = store.data().settings;
    if (s.memberNo !== m.no || s.memberRefs !== m.referrals) { s.memberNo = m.no; s.memberRefs = m.referrals; store.save(); }
  }
  return m;
}

/** Record which friend sent you. Resolves 'ok', 'already', 'self', 'not_found', or 'no_account'. */
export async function setReferrer(client, friend) {
  const sb = await client;
  if (!sb) return 'no_account';
  const { data, error } = await sb.rpc('set_referrer', { friend: Number(friend) });
  if (error) { console.warn(error); return 'error'; }
  return data;
}

/** First name shown on Top sharers, and whether to be listed (leave show out to keep the current choice). */
export async function updateMemberProfile(client, name, show) {
  const sb = await client;
  if (!sb) return;
  const { error } = await sb.rpc('update_member_profile', { p_name: name || '', p_show: typeof show === 'boolean' ? show : null });
  if (error) console.warn(error);
}

/** [{ no, name, referrals }] for the Top sharers list. */
export async function topSharers(client, lim = 5000) {
  const sb = await client;
  if (!sb) return [];
  const { data, error } = await sb.rpc('top_sharers', { lim });
  if (error) { console.warn(error); return []; }
  return (data || []).map((r) => ({ no: Number(r.no), name: r.name, referrals: Number(r.referrals), avatar: r.avatar || null }));
}

/** Standard competition ranks: ties share a place, the next place skips (5,5,1 friends -> 1,1,3). List is sorted. */
export const withRanks = (list) => { let rank = 0; return list.map((r, i) => { if (!i || list[i - 1].referrals !== r.referrals) rank = i + 1; return { ...r, rank }; }); };

export const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

/* ---------- Fox avatars (js/avatar.js) ---------- */

/** The signed-in student's fox: the saved one, else a random starting fox tied to their account. */
export const myAvatar = () => cleanAvatar(store.data().settings.avatar, store.user()?.id || store.user()?.name || 'guest');

/** Save the fox on this device (synced with progress) and on leaderboards when signed in. */
export async function saveAvatar(client, a) {
  const s = store.data().settings;
  s.avatar = cleanAvatar(a);
  store.save();
  const sb = await client;
  if (!sb || !store.user()?.cloud) return;
  const { error } = await sb.rpc('set_my_avatar', { a: s.avatar });
  if (error && !/set_my_avatar/.test(error.message || '')) console.warn(error);
}

/**
 * Player number and fox for leaderboard user ids: Map(user_id -> { no, avatar }).
 * Uses member_cards (supabase/fox_avatars.sql); falls back to member_numbers before that is applied.
 */
export async function memberCards(sb, ids) {
  if (!ids.length) return new Map();
  let { data, error } = await sb.rpc('member_cards', { ids });
  if (error) ({ data } = await sb.rpc('member_numbers', { ids }));
  return new Map((data || []).map((m) => [m.user_id, { no: m.no, avatar: m.avatar || null }]));
}

/** Progress that earns exclusive fox items: friends who joined, streak, questions answered, lessons done. */
export function foxStats() {
  const d = store.data();
  return {
    shares: d.settings.memberRefs || 0,
    streak: store.streak(),
    questions: Object.values(d.stats || {}).reduce((n, x) => n + (x.t || 0), 0),
    lessons: Object.keys(d.learned || {}).length,
  };
}
/** Exclusive items this student has earned. Once earned, an item stays unlocked (settings.foxUnlocked). */
export function foxUnlocked() {
  const s = store.data().settings, stats = foxStats(), had = s.foxUnlocked || [];
  const now = Object.values(PARTS).flat().filter((it) => it.unlock && isUnlocked(it, stats, had)).map((it) => it.id);
  if (now.some((id) => !had.includes(id))) { s.foxUnlocked = [...new Set([...had, ...now])]; store.save(); }
  return s.foxUnlocked || [];
}
