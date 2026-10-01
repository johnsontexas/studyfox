// Practice-test definitions, adaptive module building, and score estimation.
import { rng, newSeed, checkSpr } from './util.js';
import { makeQuestion, makeScienceQ, makeActPassageQ, keysFor } from './gen/index.js';
import { ACT_PASSAGES } from './gen/rw.js';
import { SCIENCE_SET } from './gen/science.js';

const rep = (k, n) => Array(n).fill(k);
const SAT_RW_PLAN = [
  ...rep('rw.vocab', 4), ...rep('rw.structure', 2), 'rw.crosstext',
  ...rep('rw.central', 2), ...rep('rw.inference', 2), 'rw.evidence', ...rep('rw.quant', 2),
  ...rep('rw.boundaries', 4), ...rep('rw.form', 3),
  ...rep('rw.transitions', 4), ...rep('rw.synthesis', 2),
];
const SAT_MATH_PLAN = [
  ...rep('alg.linear-eq', 2), ...rep('alg.linear-model', 2), ...rep('alg.systems', 2), 'alg.inequality', 'alg.slope',
  ...rep('adv.quadratic', 2), 'adv.vertex', ...rep('adv.exponential', 2), 'adv.functions', 'adv.equivalent', 'adv.exponents',
  'psda.percent', 'psda.ratio', 'psda.*',
  'geo.*', 'geo.*', 'geo.*',
];
const PSDA_POOL = ['psda.stats', 'psda.probability', 'psda.scatter'];
const GEO_POOL = ['geo.area-volume', 'geo.right-tri', 'geo.trig', 'geo.circles', 'geo.angles'];
const ACT_ENG_PLAN = [...rep('rw.boundaries', 16), ...rep('rw.form', 16), ...rep('rw.transitions', 8), ...rep('rw.vocab', 6), ...rep('rw.synthesis', 4)];
const ACT_READ_SHORT = ['rw.central', 'rw.inference', 'rw.evidence', 'rw.structure', 'rw.crosstext', 'rw.quant'];

export const EXAMS = {
  'sat-full': { test: 'SAT', title: 'SAT Practice Test', blurb: 'Full length · adaptive · 2h 14m', modules: [
    { section: 'rw', name: 'Section 1, Module 1: Reading and Writing', count: 27, minutes: 32 },
    { section: 'rw', name: 'Section 1, Module 2: Reading and Writing', count: 27, minutes: 32, adaptive: 0 },
    { break: 10 },
    { section: 'math', name: 'Section 2, Module 1: Math', count: 22, minutes: 35 },
    { section: 'math', name: 'Section 2, Module 2: Math', count: 22, minutes: 35, adaptive: 3 },
  ] },
  'sat-half': { test: 'SAT', title: 'SAT Half-Length Test', blurb: 'Both sections · adaptive · ~70 min', modules: [
    { section: 'rw', name: 'Section 1, Module 1: Reading and Writing', count: 14, minutes: 17 },
    { section: 'rw', name: 'Section 1, Module 2: Reading and Writing', count: 13, minutes: 16, adaptive: 0 },
    { section: 'math', name: 'Section 2, Module 1: Math', count: 11, minutes: 18 },
    { section: 'math', name: 'Section 2, Module 2: Math', count: 11, minutes: 18, adaptive: 2 },
  ] },
  'sat-rw': { test: 'SAT', title: 'SAT Reading & Writing', blurb: 'Section test · adaptive · 64 min', modules: [
    { section: 'rw', name: 'Module 1: Reading and Writing', count: 27, minutes: 32 },
    { section: 'rw', name: 'Module 2: Reading and Writing', count: 27, minutes: 32, adaptive: 0 },
  ] },
  'sat-math': { test: 'SAT', title: 'SAT Math', blurb: 'Section test · adaptive · 70 min', modules: [
    { section: 'math', name: 'Module 1: Math', count: 22, minutes: 35 },
    { section: 'math', name: 'Module 2: Math', count: 22, minutes: 35, adaptive: 0 },
  ] },
  'act-full': { test: 'ACT', title: 'ACT Practice Test', blurb: 'English, Math, Reading + Science · 2h 45m', modules: [
    { section: 'english', name: 'English', count: 50, minutes: 35 },
    { section: 'math', name: 'Mathematics', count: 45, minutes: 50 },
    { break: 10 },
    { section: 'reading', name: 'Reading', count: 36, minutes: 40 },
    { section: 'science', name: 'Science', count: 40, minutes: 40 },
  ] },
  'act-half': { test: 'ACT', title: 'ACT Half-Length Test', blurb: 'All four sections · ~80 min', modules: [
    { section: 'english', name: 'English', count: 25, minutes: 18 },
    { section: 'math', name: 'Mathematics', count: 23, minutes: 25 },
    { section: 'reading', name: 'Reading', count: 18, minutes: 20 },
    { section: 'science', name: 'Science', count: 16, minutes: 16 },
  ] },
  'act-english': { test: 'ACT', title: 'ACT English', blurb: 'Section test · 50 questions · 35 min', modules: [{ section: 'english', name: 'English', count: 50, minutes: 35 }] },
  'act-math': { test: 'ACT', title: 'ACT Math', blurb: 'Section test · 45 questions · 50 min', modules: [{ section: 'math', name: 'Mathematics', count: 45, minutes: 50 }] },
  'act-reading': { test: 'ACT', title: 'ACT Reading', blurb: 'Section test · 36 questions · 40 min', modules: [{ section: 'reading', name: 'Reading', count: 36, minutes: 40 }] },
  'act-science': { test: 'ACT', title: 'ACT Science', blurb: 'Section test · 40 questions · 40 min', modules: [{ section: 'science', name: 'Science', count: 40, minutes: 40 }] },
};

const DW = { base: { 1: 0.33, 2: 0.34, 3: 0.33 }, hard: { 1: 0.1, 2: 0.4, 3: 0.5 }, easy: { 1: 0.5, 2: 0.4, 3: 0.1 } };

function subsample(plan, n) {
  if (n >= plan.length) return plan.slice(0, n);
  return Array.from({ length: n }, (_, i) => plan[Math.floor((i * plan.length) / n)]);
}

function fromPlan(r, plan, test, weights, sortByDiff) {
  const seen = new Set();
  const out = plan.map((k0) => {
    let q;
    for (let t = 0; t < 12; t++) {
      const k = k0 === 'psda.*' ? r.pick(PSDA_POOL) : k0 === 'geo.*' ? r.pick(GEO_POOL) : k0;
      q = makeQuestion(k, test, +r.weighted(weights), r.int(1, 2 ** 30));
      if (!seen.has(q.uid)) break;
    }
    seen.add(q.uid);
    return q;
  });
  if (sortByDiff) out.sort((a, b) => a.difficulty - b.difficulty);
  return out;
}

export function buildModule(examKey, mi, seed, route) {
  const exam = EXAMS[examKey];
  const spec = exam.modules[mi];
  const r = rng(seed * 31 + mi * 7919);
  const w = spec.adaptive != null ? DW[route || 'hard'] : DW.base;
  const n = spec.count;
  if (exam.test === 'SAT') {
    if (spec.section === 'rw') {
      const qs = fromPlan(r, subsample(SAT_RW_PLAN, n), 'SAT', w, false);
      // within each domain, easier first
      const order = ['Craft and Structure', 'Information and Ideas', 'Standard English Conventions', 'Expression of Ideas'];
      return qs.map((q, i) => [q, i]).sort((a, b) => order.indexOf(a[0].domain) - order.indexOf(b[0].domain) || a[0].difficulty - b[0].difficulty || a[1] - b[1]).map((x) => x[0]);
    }
    return fromPlan(r, subsample(SAT_MATH_PLAN, n), 'SAT', w, true);
  }
  // ACT
  if (spec.section === 'english') return fromPlan(r, r.shuffle(subsample(ACT_ENG_PLAN, n)), 'ACT', DW.base, false);
  if (spec.section === 'math') {
    const keys = keysFor('ACT', 'math');
    const plan = Array.from({ length: n }, (_, i) => keys[(i + r.int(0, keys.length - 1)) % keys.length]);
    return fromPlan(r, plan, 'ACT', { 1: 0.35, 2: 0.4, 3: 0.25 }, true);
  }
  if (spec.section === 'reading') {
    const nPass = Math.min(ACT_PASSAGES.length, Math.max(1, Math.round(n / 12)));
    const qs = [];
    for (const p of r.sample(ACT_PASSAGES, nPass)) p.qs.forEach((_, i) => qs.push(makeActPassageQ(p.id, i, r.int(1, 2 ** 30))));
    const rest = n - qs.length;
    if (rest > 0) qs.push(...fromPlan(r, Array.from({ length: rest }, (_, i) => ACT_READ_SHORT[i % ACT_READ_SHORT.length]), 'ACT', DW.base, false));
    return qs.slice(0, n);
  }
  if (spec.section === 'science') {
    const qs = [];
    while (qs.length < n) {
      const sc = r.int(1, 2 ** 30);
      for (const t of SCIENCE_SET) { if (qs.length < n) qs.push(makeScienceQ(t, sc, r.int(1, 2 ** 30))); }
    }
    return qs;
  }
  return [];
}

export function createExam(examKey, seed = newSeed()) {
  const def = EXAMS[examKey];
  return {
    kind: 'exam', examKey, title: def.title, test: def.test, seed,
    startedAt: Date.now(),
    modules: def.modules.map((m) => (m.break ? { break: m.break } : { ...m, questions: null, answers: {}, marked: [], elim: {}, timeLeft: m.minutes * 60, done: false })),
    current: 0, qi: 0,
  };
}

export const isCorrect = (q, a) => (a == null || a === '' ? false : q.type === 'spr' ? checkSpr(a, q.accept) : a === q.answer);

export function moduleFraction(m) {
  if (!m.questions) return 0;
  const c = m.questions.filter((q, i) => isCorrect(q, m.answers[i])).length;
  return c / m.questions.length;
}

// Ensure the module at index mi has questions (adaptive routing uses the referenced module)
export function ensureModule(exam, mi) {
  const m = exam.modules[mi];
  if (m.break || m.questions) return;
  let route = null;
  const spec = EXAMS[exam.examKey].modules[mi];
  if (spec.adaptive != null) {
    route = moduleFraction(exam.modules[spec.adaptive]) >= 0.6 ? 'hard' : 'easy';
    m.route = route;
  }
  m.questions = buildModule(exam.examKey, mi, exam.seed, route);
}

const W = { 1: 1, 2: 1.3, 3: 1.6 };
function weighted(m) {
  let got = 0, tot = 0;
  m.questions.forEach((q, i) => { tot += W[q.difficulty]; if (isCorrect(q, m.answers[i])) got += W[q.difficulty]; });
  return tot ? got / tot : 0;
}

export function scoreExam(exam) {
  const bySection = {};
  const byDomain = {};
  for (const m of exam.modules) {
    if (m.break || !m.questions) continue;
    (bySection[m.section] ||= []).push(m);
    m.questions.forEach((q, i) => {
      const d = (byDomain[q.section + '|' + q.domain] ||= { section: q.section, domain: q.domain, correct: 0, total: 0 });
      d.total++; if (isCorrect(q, m.answers[i])) d.correct++;
    });
  }
  const sections = {};
  for (const [sec, mods] of Object.entries(bySection)) {
    const correct = mods.reduce((s, m) => s + m.questions.filter((q, i) => isCorrect(q, m.answers[i])).length, 0);
    const total = mods.reduce((s, m) => s + m.questions.length, 0);
    let score;
    if (exam.test === 'SAT') {
      const [m1, m2] = mods;
      const f1 = weighted(m1), f2 = m2 ? weighted(m2) : f1;
      if (!m2 || m2.route !== 'easy') score = 200 + 600 * (0.45 * f1 + 0.55 * f2);
      else score = 200 + 440 * (0.5 * f1 + 0.5 * f2);
      score = Math.max(200, Math.min(800, Math.round(score / 10) * 10));
    } else {
      score = Math.max(1, Math.min(36, Math.round(1 + 35 * (correct / total))));
    }
    sections[sec] = { score, correct, total, route: mods[1]?.route };
  }
  let headline, headlineLabel, extra = null;
  if (exam.test === 'SAT') {
    headline = Object.values(sections).reduce((s, x) => s + x.score, 0);
    headlineLabel = Object.keys(sections).length === 2 ? 'Total score (400–1600)' : 'Section score (200–800)';
  } else {
    const core = ['english', 'math', 'reading'].filter((s) => sections[s]);
    if (core.length === 3) {
      headline = Math.round(core.reduce((s, k) => s + sections[k].score, 0) / 3);
      headlineLabel = 'Composite (1–36)';
      if (sections.science) extra = { label: 'STEM score', value: Math.round((sections.math.score + sections.science.score) / 2) };
    } else {
      const k = Object.keys(sections)[0];
      headline = sections[k].score; headlineLabel = 'Section score (1–36)';
    }
  }
  return { sections, byDomain: Object.values(byDomain), headline, headlineLabel, extra };
}
