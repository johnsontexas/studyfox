// StudyFox user numbers and friend referrals (Supabase table members).
// Every account gets the next number when it's created: #1 was the first student, and numbers are never
// reused, even after an account is deleted. A student's referral link is studyfox.org/referral/<number>;
// opening it remembers the number on this device so onboarding can fill in "Which friend sent you?".
// No DOM here beyond localStorage, so the iOS app can use it too (it passes its own client).
import { store } from './store.js';
import { SITE_URL } from './config.js';

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
    if (s.memberNo !== m.no) { s.memberNo = m.no; store.save(); }
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
export async function topSharers(client, lim = 20) {
  const sb = await client;
  if (!sb) return [];
  const { data, error } = await sb.rpc('top_sharers', { lim });
  if (error) { console.warn(error); return []; }
  return (data || []).map((r) => ({ no: Number(r.no), name: r.name, referrals: Number(r.referrals) }));
}

export const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
