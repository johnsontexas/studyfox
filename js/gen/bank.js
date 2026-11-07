// Numbered question bank: a fixed, finite list of questions per test (SAT #1, SAT #2, ...),
// so students can see the whole bank and track how many they've done.
// Each entry is an ordinary generated question with a stable seed, so its id regenerates it exactly.
import { hashStr } from '../util.js';
import { taxonomy, makeQuestion } from './index.js';
import { live, onContent } from '../content/live.js';

const PER_DIFF = 25; // target questions per skill generator per difficulty
const TRIES = 150;   // seeds to try per slot; hand-written banks run out sooner and simply stop

const cache = {};
// Rebuild when admins add or hide questions (js/content/live.js).
onContent(() => { for (const k of Object.keys(cache)) delete cache[k]; });

// [{ no, id, section, domain, skill, difficulty }] in section > domain > skill > difficulty order.
// domain and skill are the question bank's filter names (taxonomy), which the practice page uses.
export function bank(test) {
  if (cache[test]) return cache[test];
  const out = [];
  const seen = new Set();
  for (const [section, doms] of Object.entries(taxonomy(test))) {
    for (const [domain, skills] of Object.entries(doms)) {
      for (const [skill, keys] of Object.entries(skills)) {
        for (const key of keys) {
          for (let d = 1; d <= 3; d++) {
            let got = 0;
            for (let j = 0; j < TRIES && got < PER_DIFF; j++) {
              const seed = (hashStr(`${key}|${test}|${d}|${j}`) % 2 ** 30) + 1;
              const q = makeQuestion(key, test, d, seed);
              // Authored items dedupe by uid; generated ones by their text, so near-identical seeds don't both count.
              const k = q.uid !== q.id ? q.uid : q.passage + q.stem + q.figure;
              if (seen.has(k)) continue;
              seen.add(k);
              got++;
              out.push({ no: out.length + 1, id: q.id, section, domain, skill, difficulty: q.difficulty });
            }
          }
        }
      }
    }
  }
  // Hand-written questions from the admin console come after the generated ones, so numbers never shift.
  for (const q of live.questions) if (q.test === test) out.push({ no: out.length + 1, id: `custom|${test}|${q.id}`, section: q.section, domain: q.domain, skill: q.skill, difficulty: q.difficulty, custom: true });
  cache[test + ':ids'] = new Map(out.map((e) => [e.id, e.no]));
  // Questions an admin removed keep their number but leave the bank.
  cache[test] = live.hidden.size ? out.filter((e) => !live.hidden.has(e.id)) : out;
  // Saved for the home page, which shows the counts without building the bank.
  try {
    const n = JSON.parse(localStorage.getItem('sf_bank_counts') || '{}');
    n[test === 'SAT' ? 'sat' : 'act'] = cache[test].length;
    localStorage.setItem('sf_bank_counts', JSON.stringify(n));
  } catch {}
  return cache[test];
}

// Bank number for a question id, or null if it isn't a bank question
export function bankNo(id) {
  const test = String(id).split('|')[1];
  if (test !== 'SAT' && test !== 'ACT') return null;
  bank(test);
  return cache[test + ':ids'].get(id) ?? null;
}
