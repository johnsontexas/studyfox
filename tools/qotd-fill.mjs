// Writes SQL that fills public.qotd_days with one shared SAT Question of the Day per day.
// Uses the site's own question generator, so the questions match practice.
// Multiple choice only and no long passages, so the race is about solving, not reading speed.
// Usage: node tools/qotd-fill.mjs 2026-11-22 365 > qotd.sql   (then run it in the Supabase SQL editor)
//    or: SUPABASE_SERVICE_ROLE_KEY=... node tools/qotd-fill.mjs 2026-12-06 365 --upload
// Existing days are left alone (on conflict do nothing).
import { SUPABASE_URL } from '../js/config.js';
import { makeQuestion, keysFor, taxonomy } from '../js/gen/index.js';

const [start = new Date().toISOString().slice(0, 10), n = '365'] = process.argv.slice(2);
const keys = Object.keys(taxonomy('SAT')).flatMap((s) => keysFor('SAT', s));
const rows = [], objs = [];
for (let i = 0; i < +n; i++) {
  const day = new Date(Date.parse(start) + i * 86400000).toISOString().slice(0, 10);
  const seed = Math.floor(Date.parse(day) / 86400000);
  let q = null;
  for (let t = 0; t < 200 && !q; t++) {
    const k = keys[(seed * 7919 + t * 104729) % keys.length];
    const c = makeQuestion(k, 'SAT', 2 + ((seed + t) % 2), seed * 1000 + t);
    if (c && c.type !== 'spr' && Array.isArray(c.choices) && (c.passage || '').length <= 600 && c.stem.length <= 500) q = c;
  }
  if (!q) throw new Error('No question found for ' + day);
  objs.push({ day, question: { ...q, uid: undefined } });
  rows.push(`('${day}', '${JSON.stringify({ ...q, uid: undefined }).replace(/'/g, "''")}'::jsonb)`);
}
if (process.argv.includes('--upload')) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) { console.error('Set SUPABASE_SERVICE_ROLE_KEY.'); process.exit(1); }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/qotd_days`, { method: 'POST', headers: { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }), 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify(objs) });
  console.log(r.ok ? `Added up to ${objs.length} days.` : `Failed: ${r.status} ${await r.text()}`);
} else console.log(`insert into public.qotd_days (day, question) values\n${rows.join(',\n')}\non conflict (day) do nothing;`);
