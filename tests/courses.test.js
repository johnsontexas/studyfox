// Checks every course and lesson for structural mistakes: duplicate ids, bad quick checks,
// unbalanced $...$ math (a stray dollar sign breaks KaTeX rendering), and unknown subjects or icons.
import { COURSES, SUBJECTS } from '../js/content/courses.js';
import { icon } from '../js/icons.js';

const bad = [];
const fail = (where, msg) => bad.push(`${where}: ${msg}`);
const blankIcon = icon('__none__');
const dollars = (s) => (String(s).replace(/\\\$/g, '').match(/\$/g) || []).length;

const courseIds = new Set();
let lessons = 0;
for (const c of COURSES) {
  if (courseIds.has(c.id)) fail(c.id, 'duplicate course id');
  courseIds.add(c.id);
  if (!SUBJECTS.includes(c.subject)) fail(c.id, `unknown subject "${c.subject}"`);
  if (icon(c.icon) === blankIcon) fail(c.id, `unknown icon "${c.icon}"`);
  for (const k of ['title', 'blurb', 'level']) if (!c[k]) fail(c.id, `missing ${k}`);
  if (!c.lessons?.length) fail(c.id, 'no lessons');
  const lessonIds = new Set();
  for (const l of c.lessons || []) {
    lessons++;
    const where = `${c.id}/${l.id}`;
    if (lessonIds.has(l.id)) fail(where, 'duplicate lesson id');
    lessonIds.add(l.id);
    if (!l.title || !l.body) fail(where, 'missing title or body');
    if (!(l.mins > 0)) fail(where, 'missing mins');
    const texts = [l.body];
    if (l.check) {
      const k = l.check;
      if (k.choices?.length !== 4) fail(where, `quick check has ${k.choices?.length} choices`);
      if (new Set(k.choices).size !== k.choices?.length) fail(where, 'duplicate choices');
      if (!(k.answer >= 0 && k.answer < k.choices?.length)) fail(where, 'answer out of range');
      if (!k.q || !k.why) fail(where, 'quick check missing q or why');
      texts.push(k.q, k.why, ...(k.choices || []));
    }
    for (const t of texts) {
      if (dollars(t) % 2) fail(where, `odd number of $ (unbalanced math) in: ${String(t).slice(0, 60)}...`);
      if (/\$\{|\[object|\bNaN\b|(^|>)\s*undefined/.test(t)) fail(where, 'bad token in text');
    }
  }
}

console.log(`${COURSES.length} courses, ${lessons} lessons checked.`);
if (bad.length) {
  console.error(`${bad.length} problems:\n` + bad.join('\n'));
  process.exit(1);
}
console.log('All courses OK.');
