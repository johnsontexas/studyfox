// Turn classic lessons (an HTML body + one quick check) into deeper interactive lessons, using the Algebra 1
// course as the model. Drafts blocks with the Claude API, checks every block, and saves them to
// lessons.blocks in Supabase. Only lessons without blocks are touched. Review and edit the results in
// Admin > Content > Courses > (lesson) > Interactive lesson; "Switch back to classic" undoes one.
//
//   ANTHROPIC_API_KEY=...  SUPABASE_SERVICE_ROLE_KEY=...  node tools/deepen-lessons.mjs [options]
//
// Options:
//   --course ap-bio     only one course (default: all)
//   --limit 5           stop after this many lessons (default: all)
//   --dry               print the blocks instead of saving
//   --model NAME        Claude model (default: claude-sonnet-5-5)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../js/config.js';
import { validateBlock } from '../js/content/blocks.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1] ?? true; };
const COURSE = arg('course', ''), LIMIT = +arg('limit', 1e9), DRY = process.argv.includes('--dry'), MODEL = arg('model', 'claude-sonnet-5-5');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY, AKEY = process.env.ANTHROPIC_API_KEY;
if (!AKEY || (!KEY && !DRY)) { console.error('Set ANTHROPIC_API_KEY and SUPABASE_SERVICE_ROLE_KEY (or pass --dry).'); process.exit(1); }

const rest = (path, init = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
  ...init, headers: { apikey: KEY || SUPABASE_ANON_KEY, Authorization: `Bearer ${KEY || SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
}).then(async (r) => { if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.status === 204 ? null : r.json(); });

// One finished lesson goes in the prompt as the example of the depth and style wanted.
const [example] = await rest('lessons?select=title,blocks&course_id=eq.algebra-1&id=eq.equations');

const SYSTEM = `You turn short lessons into interactive lessons for StudyFox, a free study site for high school students (school classes, AP, SAT, ACT).
Return ONLY a JSON array of blocks. Block types and fields:
- {"type":"text","html":"<p>...</p>"}  (HTML: p, b, i, ul/ol/li, h3, table class="data")
- {"type":"callout","kind":"tip|rule|key|example|warning","title":"...","html":"..."}
- {"type":"mcq","q":"...","answer":<index>,"hint":"...","choices":[{"text":"...","why":"..."}]}  4 choices. For the right choice, "why" says why it's right; for each wrong choice, the specific misconception that leads a student there, then why it's wrong.
- {"type":"multi","q":"...","choices":[{"text":"...","correct":true|false,"why":"..."}]}
- {"type":"input","q":"...","answers":["..."],"numeric":true|false,"hint":"...","why":"...","mistakes":[{"answer":"...","why":"the slip that produces this answer"}]}
- {"type":"order","q":"...","items":["in the correct order", ...],"hint":"...","why":"..."}
- {"type":"match","q":"...","pairs":[["left","right"], ...],"hint":"...","why":"..."}
- {"type":"reveal","prompt":"think about this first","label":"Show me","html":"..."}
- {"type":"steps","title":"...","steps":["one step", ...]}
- {"type":"flip","cards":[{"front":"...","back":"..."}]}
- {"type":"break","title":"screen title"}  starts a new screen
Rules: keep every fact from the original lesson and go deeper (why things work, a worked example, the most common mistakes). 4 to 6 screens. Each screen teaches briefly, then makes the student do something. End with a "Quick check" screen. Include at least 4 questions of at least 3 different types, and every wrong answer must have a "why". Math goes between single dollar signs, like $x^2$; escape backslashes for JSON. Plain, friendly, direct language for a 15 to 17 year old. No emojis. Be accurate: if you are not sure of a fact, leave it out.`;

async function draft(lesson, course) {
  const body = {
    model: MODEL, max_tokens: 16000, system: SYSTEM,
    messages: [
      { role: 'user', content: `Example of a finished lesson ("${example.title}"):\n${JSON.stringify(example.blocks)}` },
      { role: 'assistant', content: 'Understood. Send the lesson to convert.' },
      { role: 'user', content: JSON.stringify({ course: course.title, title: lesson.title, body: lesson.body, quick_check: lesson.check }) },
    ],
  };
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': AKEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 5000 * (attempt + 1))); continue; }
    if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
    const text = (await r.json()).content.filter((c) => c.type === 'text').map((c) => c.text).join('');
    return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
  }
  throw new Error('Claude API kept failing; try again later.');
}

const courses = await rest(`courses?select=id,title${COURSE ? `&id=eq.${encodeURIComponent(COURSE)}` : ''}&order=sort`);
let done = 0;
for (const course of courses) {
  if (done >= LIMIT) break;
  const lessons = await rest(`lessons?select=course_id,id,title,body,check&course_id=eq.${course.id}&blocks=is.null&hidden=eq.false&order=sort`);
  for (const l of lessons) {
    if (done >= LIMIT) break;
    process.stdout.write(`${course.id}/${l.id} ... `);
    try {
      const blocks = await draft(l, course);
      const problems = blocks.flatMap((b, i) => validateBlock(b).map((p) => `block ${i + 1}: ${p}`));
      if (!Array.isArray(blocks) || blocks.length < 4 || problems.length) { console.log(`skipped (${problems[0] || 'too short'})`); continue; }
      if (DRY) console.log('\n' + JSON.stringify(blocks, null, 2));
      else { await rest(`lessons?course_id=eq.${course.id}&id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify({ blocks }), headers: { Prefer: 'return=minimal' } }); console.log(`saved ${blocks.length} blocks`); }
      done++;
    } catch (e) { console.log('failed: ' + e.message); }
  }
}
console.log(`Finished: ${done} lessons.`);
