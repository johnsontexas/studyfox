// Fill in per-choice explanations, a hint, and a fuller explanation for AP questions that don't have them.
// Uses the Claude API to draft them and writes straight to Supabase (ap_questions.choice_expl, hint, expl).
// Everything it writes is editable afterwards in Admin > Content > AP questions.
//
//   ANTHROPIC_API_KEY=...  SUPABASE_SERVICE_ROLE_KEY=...  node tools/enrich-ap-questions.mjs [options]
//
// Options:
//   --course ap-bio     only one course (default: all)
//   --limit 50          stop after this many questions (default: all)
//   --dry               print what it would write instead of saving
//   --model NAME        Claude model (default: claude-sonnet-5-5)
//
// The service role key is in Supabase > Project Settings > API. Keep it out of the repo and the browser.
import { SUPABASE_URL } from '../js/config.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1] ?? true; };
const COURSE = arg('course', ''), LIMIT = +arg('limit', 1e9), DRY = process.argv.includes('--dry'), MODEL = arg('model', 'claude-sonnet-5-5');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY, AKEY = process.env.ANTHROPIC_API_KEY;
if (!AKEY || (!KEY && !DRY)) { console.error('Set ANTHROPIC_API_KEY and SUPABASE_SERVICE_ROLE_KEY (or pass --dry).'); process.exit(1); }

const rest = (path, init = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
  ...init, headers: { apikey: KEY || '', Authorization: `Bearer ${KEY || ''}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
}).then(async (r) => { if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.status === 204 ? null : r.json(); });

const SYSTEM = `You write answer explanations for StudyFox, a free study site for high school students taking AP exams.
For each multiple-choice question you get, return:
- "expl": 2 to 4 sentences explaining why the correct answer is right, teaching the underlying idea (not just restating the answer).
- "choice_expl": one string per choice, in the same order. For the correct choice, one sentence on why it's right. For each wrong choice, name the specific misconception or slip that leads a student to pick it, then why it's wrong. 1 to 2 sentences each.
- "hint": one short nudge that points toward the right idea without giving away the answer.
Plain, friendly, direct language for a 15 to 17 year old. No emojis. Math goes between single dollar signs, like $x^2$. Don't start with "Correct!" or "Great question".
Return ONLY a JSON array: [{"id": <id>, "expl": "...", "choice_expl": ["...", ...], "hint": "..."}].`;

async function draft(batch) {
  const body = {
    model: MODEL, max_tokens: 8000, system: SYSTEM,
    messages: [{ role: 'user', content: JSON.stringify(batch.map((q) => ({ id: q.id, course: q.course_id, unit: q.unit, question: q.stem, choices: q.choices, correct_index: q.answer, current_explanation: q.expl }))) }],
  };
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': AKEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 5000 * (attempt + 1))); continue; }
    if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const text = j.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
    return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
  }
  throw new Error('Claude API kept failing; try again later.');
}

const filter = `choice_expl=is.null${COURSE ? `&course_id=eq.${encodeURIComponent(COURSE)}` : ''}`;
const skipped = [];
let done = 0;
while (done < LIMIT) {
  const skip = skipped.length ? `&id=not.in.(${skipped.join(',')})` : '';
  const rows = KEY
    ? await rest(`ap_questions?select=id,course_id,unit,stem,choices,answer,expl&${filter}${skip}&order=id&limit=${Math.min(10, LIMIT - done)}`)
    : await fetch(`${SUPABASE_URL}/rest/v1/ap_questions?select=id,course_id,unit,stem,choices,answer,expl&${filter}&order=id&limit=${Math.min(10, LIMIT - done)}&offset=${done}`, { headers: { apikey: (await import('../js/config.js')).SUPABASE_ANON_KEY } }).then((r) => r.json());
  if (!rows.length) break;
  const out = await draft(rows);
  for (const q of rows) {
    const e = out.find((x) => String(x.id) === String(q.id));
    if (!e || !Array.isArray(e.choice_expl) || e.choice_expl.length !== q.choices.length) { console.warn(`  skipped ${q.id} (bad draft)`); skipped.push(q.id); continue; }
    const patch = { expl: String(e.expl || q.expl).trim(), choice_expl: e.choice_expl.map((s) => String(s).trim()), hint: String(e.hint || '').trim() };
    if (DRY) console.log(JSON.stringify({ id: q.id, stem: q.stem, ...patch }, null, 2));
    else await rest(`ap_questions?id=eq.${q.id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { Prefer: 'return=minimal' } });
  }
  done += rows.length;
  console.log(`${done} questions done`);
  if (DRY && done >= Math.min(LIMIT, 10)) break;
}
console.log('Finished.');
