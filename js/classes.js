// Classes and study groups (supabase/classes.sql). Join with a 6-letter code; the maker is the admin.
// A class: only the admin shares flashcard sets. A study group: everyone can share.
// The leaderboard counts correct answers, only in the class topic when one is set.
// Same calls are used by the iOS app (through mobile/src/lib/shared.ts).
import { store } from './store.js';
import { qotdBoardName } from './qotd.js';
import { COURSES } from './content/courses.js';

// client: the Supabase client (or a promise of one): db() on the website, contentClient() in the app.
const rpc = async (client, fn, args) => {
  if (!store.user()?.cloud) throw new Error('Sign in to use classes.');
  const sb = await client;
  if (!sb) throw new Error('Sign in to use classes.');
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};
const me = (name) => qotdBoardName(name || store.user()?.name);

export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
// Topics a class can focus on: the SAT, the ACT, and every AP course (same list as "What are you studying for?").
export const classTopics = () => [['SAT', 'SAT'], ['ACT', 'ACT'], ...COURSES.filter((c) => c.ap).map((c) => [c.id, c.title])];
export const topicLabel = (id) => (id ? classTopics().find(([k]) => k === id)?.[1] || id : 'All subjects');
export const kindLabel = (k) => (k === 'group' ? 'Study group' : 'Class');

export const myClasses = (client) => rpc(client, 'my_classes');
export const classDetail = (client, id) => rpc(client, 'class_detail', { p_class: id });
export const createClass = (client, name, kind, topic) => rpc(client, 'class_create', { p_name: name, p_kind: kind, p_topic: topic || null, p_member_name: me() });
export const joinClass = (client, code, name) => rpc(client, 'class_join', { p_code: cleanCode(code), p_member_name: me(name) });
export const leaveClass = (client, id) => rpc(client, 'class_leave', { p_class: id });
export const updateClass = (client, id, name, kind, topic) => rpc(client, 'class_update', { p_class: id, p_name: name, p_kind: kind, p_topic: topic || null });
export const newJoinCode = (client, id) => rpc(client, 'class_new_join_code', { p_class: id });
export const removeMember = (client, id, user) => rpc(client, 'class_remove_member', { p_class: id, p_user: user });
export const deleteClass = (client, id) => rpc(client, 'class_delete', { p_class: id });
export const classSet = (client, setId) => rpc(client, 'class_set', { p_set: setId });
export const unshareSet = (client, setId) => rpc(client, 'class_unshare_set', { p_set: setId });
export const shareSet = (client, id, set) => rpc(client, 'class_share_set', {
  p_class: id, p_member_name: me(),
  p_set: { title: set.title, desc: set.desc || '', cards: (set.cards || []).map((c) => ({ t: String(c.t ?? ""), d: String(c.d ?? "") })) },
});

// A code typed during onboarding before the account was ready waits here, then joins.
const PENDING = 'sf_class_code';
export const pendingClassCode = () => { try { return localStorage.getItem(PENDING) || ''; } catch { return ''; } };
export const setPendingClassCode = (c) => { try { c ? localStorage.setItem(PENDING, cleanCode(c)) : localStorage.removeItem(PENDING); } catch {} };
