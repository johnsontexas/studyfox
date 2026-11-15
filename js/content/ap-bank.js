// AP question bank data (Supabase table ap_questions), shared by the website and the iOS app.
// No DOM here: callers pass their own Supabase client. Each course is cached in localStorage
// and only re-downloaded when the server's ap_bank_version(course) changes.
import { store, today } from '../store.js';
import { CHALLENGE, HARDEST_TITLES } from './challenge-bank.js';

// "Hardest questions": max-difficulty SAT and AP items flagged challenge = true in Supabase
// (tables questions and ap_questions). They are left out of the regular banks and form their own set,
// opened like an AP class with the id 'hardest'. CHALLENGE is the built-in copy used until the server has them.
export const HARDEST_ID = 'hardest';
export const HARDEST = { id: HARDEST_ID, title: 'Hardest questions', subject: 'Test prep', icon: 'flame', lessons: [] };
const HARDEST_ORDER = ['SAT Math', 'SAT Reading and Writing'];
export const hardestUnits = (qs) => [...new Set(qs.map((q) => q.unit))].sort((a, b) => ((HARDEST_ORDER.indexOf(a) + 1 || 99) - (HARDEST_ORDER.indexOf(b) + 1 || 99)) || a.localeCompare(b));
const SAT_UNIT = { math: 'SAT Math', rw: 'SAT Reading and Writing' };
const fromSAT = (q) => ({ id: 'sat' + q.id, unit: SAT_UNIT[q.section] || `${q.test} ${q.section}`, concept: q.skill, difficulty: 3, stem: (q.passage ? q.passage + '\n\n' : '') + q.stem,
  choices: q.choices, answer: q.answer, expl: q.expl || '', choiceExpl: q.choice_expl || null, hint: q.hint || '', steps: q.steps || null });

async function hardestFetch(sb) {
  const [ap, sat] = await Promise.all([
    sb.from('ap_questions').select('*').eq('challenge', true).eq('hidden', false).order('id'),
    sb.from('questions').select('*').eq('challenge', true).eq('hidden', false).order('id'),
  ]);
  if (ap.error) throw ap.error;
  if (sat.error) throw sat.error;
  return [...sat.data.map(fromSAT), ...ap.data.map((q) => ({ id: q.id, unit: HARDEST_TITLES[q.course_id] || q.course_id, concept: q.concept, difficulty: 3, stem: q.stem, choices: q.choices, answer: q.answer, expl: q.expl, choiceExpl: q.choice_expl || null, hint: q.hint || '', steps: q.steps || null }))];
}

async function hardestQuestions(client) {
  const cached = read(CACHE(HARDEST_ID));
  const sb = await client;
  if (sb) {
    try {
      const { data: version, error } = await sb.rpc('ap_bank_version', { cid: HARDEST_ID });
      if (error) throw error;
      if (cached && cached.version === version && cached.qs.length) return cached.qs;
      const qs = await hardestFetch(sb);
      if (qs.length) { write(CACHE(HARDEST_ID), { version, qs, v: 2 }); return qs; }
    } catch (e) { console.warn('Could not load the hardest questions; using the built-in copy.', e); }
  }
  return cached?.qs?.length ? cached.qs : CHALLENGE;
}

const CACHE = (cid) => 'sf_ap_' + cid;
const COUNTS = 'sf_ap_counts';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
let counts = null;

/** Question counts as { course_id: { unit: n } }. */
export async function apCounts(client) {
  if (counts) return counts;
  const sb = await client;
  if (sb) {
    try {
      const { data, error } = await sb.rpc('ap_bank_counts');
      if (error) throw error;
      counts = {};
      for (const r of data) (counts[r.course_id] ||= {})[r.unit] = Number(r.n);
      write(COUNTS, counts);
      return counts;
    } catch (e) { console.warn(e); }
  }
  return read(COUNTS) || {};
}

/** All questions for one AP course: [{ id, unit, concept, difficulty, stem, choices, answer, expl, choiceExpl?, hint, steps }]. */
export async function apQuestions(client, cid) {
  if (cid === HARDEST_ID) return hardestQuestions(client);
  const cached = read(CACHE(cid));
  const sb = await client;
  if (!sb) return cached?.qs || [];
  try {
    const { data: version, error: ve } = await sb.rpc('ap_bank_version', { cid });
    if (ve) throw ve;
    if (cached && cached.version === version && cached.v === 2) return cached.qs;
    const qs = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('ap_questions').select('*')
        .eq('course_id', cid).eq('hidden', false).order('id').range(from, from + 999);
      if (error) throw error;
      qs.push(...data);
      if (data.length < 1000) break;
    }
    // Challenge questions belong to the Hardest set, not the class bank.
    for (let i = qs.length - 1; i >= 0; i--) if (qs[i].challenge) qs.splice(i, 1);
    for (const q of qs) { if (q.choice_expl) q.choiceExpl = q.choice_expl; delete q.choice_expl; delete q.course_id; delete q.hidden; delete q.challenge; delete q.created_at; delete q.updated_at; }
    write(CACHE(cid), { version, qs, v: 2 });
    return qs;
  } catch (e) {
    console.warn('Could not load AP questions; using the saved copy.', e);
    return cached?.qs || [];
  }
}

/** Units in course lesson order (questions are tagged with the lesson title they belong to). */
export function apUnits(course, qs) {
  if (course.id === HARDEST_ID) return hardestUnits(qs);
  const titles = course.lessons.map((l) => l.title);
  return [...new Set(qs.map((q) => q.unit))].sort((a, b) => ((titles.indexOf(a) + 1 || 999) - (titles.indexOf(b) + 1 || 999)) || a.localeCompare(b));
}

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Copy of a question with its choices in a fresh random order (the answer index follows). */
export function shuffled(q) {
  if (q.choices.some((c) => /\b(all|none|both) of the above\b/i.test(c))) return { ...q };
  const order = shuffle(q.choices.map((_, i) => i));
  return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer), ...(q.choiceExpl ? { choiceExpl: order.map((i) => q.choiceExpl[i] ?? '') } : {}) };
}

export const apDone = () => (store.data().ap ||= {});

/** Pick up to n questions. mode: 'smart' (unseen, then missed, then the rest), 'new', or 'missed'. */
export function pickAP(pool, n, mode = 'smart') {
  const done = apDone();
  const fresh = pool.filter((q) => !done[q.id]), missed = pool.filter((q) => done[q.id] && !done[q.id].c), rest = pool.filter((q) => done[q.id]?.c);
  const list = mode === 'missed' ? shuffle(missed) : mode === 'new' ? shuffle(fresh) : [...shuffle(fresh), ...shuffle(missed), ...shuffle(rest)];
  return list.slice(0, n).map(shuffled);
}

/** Remember the latest result for a question and count it toward today's activity. Caller saves. */
export function recordAP(cid, q, ok) {
  apDone()[q.id] = { c: ok ? 1 : 0, ts: Date.now(), cid };
  const d = store.data();
  d.activity[today()] = (d.activity[today()] || 0) + 1;
}

/** { n, did, right } for a set of questions. */
export function apStats(pool) {
  const done = apDone();
  const did = pool.filter((q) => done[q.id]);
  return { n: pool.length, did: did.length, right: did.filter((q) => done[q.id].c).length };
}
