// Question of the Day race (supabase/qotd_race.sql). One shared SAT question a day.
// The card shows only "Start". Starting records the time on the server and reveals the question.
// One answer: right answers are timed on the server and go on the day's leaderboard, fastest first.
// Wrong answers still see the explanation. Data helpers are shared with the iOS app (mobile/src/lib/shared.ts).
import { store } from './store.js';
import { memberCards } from './members.js';

// "Daniel Johnson" shows as "Daniel J." on the public board (same as the Match leaderboards).
export const qotdBoardName = (n) => { const [a, b] = String(n || 'Student').trim().split(/\s+/); return (b ? `${a} ${b[0]}.` : a).slice(0, 40); };
export const fmtMs = (ms) => (ms == null ? '' : ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`);

const rpc = async (client, fn, args) => {
  const sb = await client;
  if (!sb) throw new Error('Sign in to play the Question of the Day race.');
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};

/** Today's state for this student: {available, status: 'new'|'started'|'done', question?, correct?, ms?, rank?, beat?}. */
export const qotdStatus = (client) => rpc(client, 'qotd_status');
/** Start the clock (once a day) and get the question without its answer. */
export const qotdStart = (client) => rpc(client, 'qotd_start', { p_name: qotdBoardName(store.user()?.name) });
/** Lock in the one answer. Returns the 'done' state with the answer and explanation. */
export const qotdAnswer = (client, choice) => rpc(client, 'qotd_answer', { p_choice: choice });

/**
 * Top 10 fastest right answers for a day (today when day is omitted), hiding anyone this student blocked.
 * @param {any} client
 * @param {string | null} [day]
 */
export async function qotdBoard(client, day = null) {
  const sb = await client;
  if (!sb) return [];
  const [{ data, error }, { data: blocks }] = await Promise.all([
    sb.rpc('qotd_board', { p_day: day }),
    store.user()?.cloud ? sb.from('match_blocks').select('blocked') : Promise.resolve({ data: [] }),
  ]);
  if (error) throw new Error(error.message);
  const hide = new Set((blocks || []).map((b) => b.blocked));
  const top = (data || []).filter((r) => !hide.has(r.user_id)).slice(0, 10);
  const cards = await memberCards(sb, top.map((r) => r.user_id)).catch(() => new Map());
  return top.map((r, i) => ({ ...r, rank: i + 1, no: cards.get(r.user_id)?.no, avatar: cards.get(r.user_id)?.avatar }));
}

/** Yesterday in the race's time zone (Central), as YYYY-MM-DD. */
export function qotdYesterday(today) {
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
