// Numbered question bank: a fixed, finite list of questions per test (SAT #1, SAT #2, ...),
// so students can see the whole bank and track how many they've done.
// Each entry is an ordinary generated question with a stable seed, so its id regenerates it exactly.
import { hashStr } from '../util.js';
import { taxonomy, makeQuestion } from './index.js';

const PER_DIFF = 10; // target questions per skill generator per difficulty
const TRIES = 40;    // seeds to try per slot; hand-written banks run out sooner and simply stop

const cache = {};

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
              if (seen.has(q.uid)) continue;
              seen.add(q.uid);
              got++;
              out.push({ no: out.length + 1, id: q.id, section, domain, skill, difficulty: q.difficulty });
            }
          }
        }
      }
    }
  }
  cache[test] = out;
  cache[test + ':ids'] = new Map(out.map((e) => [e.id, e.no]));
  return out;
}

// Bank number for a question id, or null if it isn't a bank question
export function bankNo(id) {
  const test = String(id).split('|')[1];
  if (test !== 'SAT' && test !== 'ACT') return null;
  bank(test);
  return cache[test + ':ids'].get(id) ?? null;
}
