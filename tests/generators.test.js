// Generates thousands of questions and checks each for malformed output.
import { GENS, makeQuestion, regen } from '../js/gen/index.js';
import { EXAMS, buildModule, createExam, ensureModule, scoreExam } from '../js/exams.js';

const N = +process.env.N || 150;
const bad = [];
const seen = {};
function check(q, ctx) {
  const txt = [q.stem, q.passage, q.expl, ...(q.choices || [])].join(' ');
  const fail = (m) => bad.push(`${ctx} [${q.id}] ${m}`);
  if (!q.stem) fail('empty stem');
  if (/(?<!is )undefined|NaN|\[object|Infinity/.test(txt)) fail('bad token: ' + txt.match(/.{0,50}(undefined|NaN|\[object|Infinity).{0,30}/)?.[0]);
  const stemTex = [q.stem, ...(q.choices || [])].join(' ');
  if (/(^|[^0-9.{a-z])1[a-z]\b|[+-] 0[)$ \\]|\+ -|- -/.test(stemTex)) fail('unsimplified math: ' + stemTex.match(/.{0,25}((^|[^0-9.{a-z])1[a-z]\b|[+-] 0[)$ \\]|\+ -|- -).{0,15}/)?.[0]);
  if (q.type === 'mc') {
    if (q.choices.length !== 4) fail(`${q.choices.length} choices`);
    if (new Set(q.choices).size !== q.choices.length) fail('duplicate choices: ' + q.choices.join(' | '));
    if (!(q.answer >= 0 && q.answer < q.choices.length)) fail('answer out of range');
  } else if (q.type === 'spr') {
    if (!q.accept?.length || q.accept.some((v) => !isFinite(v))) fail('bad spr accept ' + q.accept);
    const s = String(q.answerDisplay);
    if (s.replace(/^-/, '').length > 5) fail('spr answer too long to grid: ' + s);
  } else fail('unknown type');
  if (!q.domain || !q.skill) fail('missing taxonomy');
  if (![1, 2, 3].includes(q.difficulty)) fail('difficulty ' + q.difficulty);
}
let count = 0;
for (const [key, g] of Object.entries(GENS)) {
  for (const test of ['SAT', 'ACT']) {
    if (!(test === 'SAT' ? g.sat : g.act)) continue;
    for (let d = 1; d <= 3; d++) for (let s = 1; s <= N; s++) {
      let q;
      try { q = makeQuestion(key, test, d, s * 7919 + d); } catch (e) { bad.push(`${key} ${test} d${d} s${s} THREW ${e.message}`); continue; }
      check(q, key); count++;
      seen[q.type] = (seen[q.type] || 0) + 1;
      if (s <= 3) { const r = regen(q.id); if (!r || r.stem !== q.stem) bad.push(`${q.id} regen mismatch`); }
    }
  }
}
let exams = 0;
for (const key of Object.keys(EXAMS)) for (let seed = 1; seed <= 4; seed++) {
  const ex = createExam(key, seed * 1000);
  ex.modules.forEach((m, i) => {
    if (m.break) return;
    ensureModule(ex, i);
    const spec = EXAMS[key].modules[i];
    if (m.questions.length !== spec.count) bad.push(`${key} module ${i} has ${m.questions.length}/${spec.count}`);
    m.questions.forEach((q, j) => { check(q, key); m.answers[j] = q.type === 'mc' ? (Math.random() < 0.7 ? q.answer : (q.answer + 1) % 4) : String(q.accept[0]); });
  });
  const sc = scoreExam(ex);
  if (!isFinite(sc.headline)) bad.push(`${key} bad headline`);
  exams++;
}
const uniq = [...new Set(bad)];
console.log(`${count} questions + ${exams} exams checked. Types: ${JSON.stringify(seen)}`);
console.log(uniq.length ? `${uniq.length} problems:\n` + uniq.slice(0, 400).join('\n') : 'All good ✓');
process.exit(uniq.length ? 1 : 0);
