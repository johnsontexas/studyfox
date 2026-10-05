// Question registry: taxonomy, deterministic generation from ids, and practice-set building.
import { rng, newSeed } from '../util.js';
import { mathGens } from './math.js';
import { rwGens, actPassageQ, ACT_PASSAGES } from './rw.js';
import { scienceGens, scienceQuestion } from './science.js';
import { live } from '../content/live.js';

export const SECTIONS = {
  SAT: { rw: 'Reading and Writing', math: 'Math' },
  ACT: { english: 'English', math: 'Math', reading: 'Reading', science: 'Science' },
};

const ALL = [...mathGens, ...rwGens, ...scienceGens];
export const GENS = Object.fromEntries(ALL.map((g) => [g.key, g]));

function cfg(g, test) {
  const c = test === 'SAT' ? g.sat : g.act;
  if (!c) return null;
  return { section: c.section || g.section, domain: c.domain, skill: c.skill };
}

// { section: { domain: { skill: [keys] } } } for a test, in a stable order
export function taxonomy(test) {
  const out = {};
  for (const s of Object.keys(SECTIONS[test])) out[s] = {};
  for (const g of ALL) {
    const c = cfg(g, test);
    if (!c) continue;
    const d = (out[c.section][c.domain] ||= {});
    (d[c.skill] ||= []).push(g.key);
  }
  for (const s of Object.keys(out)) {
    out[s] = Object.fromEntries(Object.entries(out[s]).sort(([a], [b]) => domainRank(a) - domainRank(b)));
  }
  return out;
}

// Official reporting order for domains
const DOMAIN_ORDER = [
  'Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions',
  'Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry',
  'Production of Writing', 'Knowledge of Language', 'Conventions of Standard English',
  'Number and Quantity', 'Functions', 'Geometry', 'Statistics and Probability', 'Integrating Essential Skills',
  'Key Ideas and Details', 'Integration of Knowledge and Ideas',
];
const domainRank = (d) => { const i = DOMAIN_ORDER.indexOf(d); return i < 0 ? 99 : i; };

function finalize(base, out, { key, test, d, seed }) {
  const r = rng(seed ^ 0x5bd1e995);
  const q = {
    id: base.id, key, test,
    section: base.section, domain: out.domainOverride || base.domain, skill: base.skill,
    difficulty: out.dOverride || d,
    passage: out.passage || '', stem: out.stem, figure: out.figure || '',
    expl: out.expl, uid: out.uid || base.id, group: out.group || null,
  };
  const useSpr = test === 'SAT' && out.spr && r.chance(out.preferSpr ? 0.75 : 0.2);
  if (useSpr) {
    q.type = 'spr'; q.accept = out.spr.accept; q.answerDisplay = out.spr.display;
  } else {
    q.type = 'mc'; q.choices = out.mc.choices; q.answer = out.mc.answer;
  }
  return q;
}

export function makeQuestion(key, test, d, seed) {
  const g = GENS[key];
  const c = cfg(g, test);
  const out = g.gen(rng(seed), d, test);
  return finalize({ id: `${key}|${test}|${d}|${seed}`, ...c }, out, { key, test, d, seed });
}

// Exam-only grouped questions
export function makeScienceQ(type, scSeed, qSeed) {
  const out = scienceQuestion(scSeed, type, qSeed);
  return finalize({ id: `sciset|ACT|${type}|${scSeed}|${qSeed}`, section: 'science', domain: out.domainOverride, skill: out.domainOverride }, out, { key: 'sciset', test: 'ACT', d: out.dOverride, seed: qSeed });
}
export function makeActPassageQ(pid, i, seed) {
  const p = ACT_PASSAGES.find((x) => x.id === pid);
  const out = actPassageQ(rng(seed), p, p.qs[i], i);
  return finalize({ id: `actp|ACT|${pid}|${i}|${seed}`, section: 'reading', domain: out.domainOverride, skill: 'Long passage' }, out, { key: 'actp', test: 'ACT', d: out.dOverride, seed });
}

// A hand-written question from the admin console (Supabase "questions" table), id "custom|SAT|12".
export function customQuestion(id) {
  const [, test, n] = String(id).split('|');
  const q = live.questions.find((x) => String(x.id) === n && x.test === test);
  if (!q) return null;
  return {
    id, key: 'custom', test, section: q.section, domain: q.domain, skill: q.skill, difficulty: q.difficulty,
    passage: q.passage || '', stem: q.stem, figure: '', expl: q.expl || '', uid: id, group: null,
    type: 'mc', choices: q.choices, answer: q.answer,
  };
}

export function regen(id) {
  const p = id.split('|');
  try {
    if (p[0] === 'sciset') return makeScienceQ(p[2], +p[3], +p[4]);
    if (p[0] === 'actp') return makeActPassageQ(p[2], +p[3], +p[4]);
    if (p[0] === 'custom') return customQuestion(id);
    return makeQuestion(p[0], p[1], +p[2], +p[3]);
  } catch (e) {
    console.warn('Could not regenerate', id, e);
    return null;
  }
}

const pickDiff = (r, diff) => (diff === 'mixed' || !diff ? r.int(1, 3) : +diff);

// Build a practice set. keys: generator keys to draw from (already filtered by the UI).
export function buildSet({ test, keys, difficulty = 'mixed', count = 10, seed = newSeed(), exclude = new Set() }) {
  const r = rng(seed);
  const qs = [];
  const seen = new Set(exclude);
  let guard = 0;
  // Round-robin across keys so every selected skill shows up
  let order = r.shuffle(keys);
  while (qs.length < count && guard++ < count * 25) {
    if (!order.length) order = r.shuffle(keys);
    const key = order.pop();
    const q = makeQuestion(key, test, pickDiff(r, difficulty), r.int(1, 2 ** 30));
    if (live.hidden.has(q.id)) continue;
    if (seen.has(q.uid) && guard < count * 20) continue;
    seen.add(q.uid);
    qs.push(q);
  }
  return qs;
}

export function keysFor(test, section, domains, skills) {
  const tax = taxonomy(test)[section] || {};
  const keys = new Set();
  for (const [dom, sk] of Object.entries(tax)) {
    if (domains && domains.length && !domains.includes(dom)) continue;
    for (const [s, ks] of Object.entries(sk)) {
      if (skills && skills.length && !skills.includes(s)) continue;
      ks.forEach((k) => keys.add(k));
    }
  }
  return [...keys];
}

export function questionOfTheDay(test = 'SAT') {
  const day = Math.floor(Date.now() / 86400000);
  const r = rng(day * 7919 + (test === 'SAT' ? 1 : 2));
  const keys = ALL.filter((g) => cfg(g, test)).map((g) => g.key);
  return makeQuestion(r.pick(keys), test, r.int(2, 3), day);
}
