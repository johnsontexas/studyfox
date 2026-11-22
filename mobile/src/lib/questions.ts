// Practice-set helpers built on the website's question bank and generators (js/gen).
import type { Q, Test } from './types';
export type { Q } from './types';
import { bank, buildSet, checkSpr, keysFor, newSeed, regen, rng, store } from './shared';

export const isRight = (q: Q, a: unknown) => (a == null || a === '' ? false : q.type === 'spr' ? checkSpr(a, q.accept) : a === q.answer);

// ---- Practice sessions ----
export type Session = { title: string; test: Test; section: string; questions: Q[] };
let pending: Session | null = null;
export const setSession = (s: Session) => { pending = s; };
export const takeSession = () => pending;

/** Pick `count` bank questions the student hasn't done yet, spread across skills (like the website). */
export function quickSet(test: Test, section: string | null, count: number, pool: 'new' | 'miss' | 'all' = 'new', difficulty?: number): Q[] {
  const done = store.data().bank;
  const all = bank(test).filter((e) => (!section || e.section === section) && (!difficulty || e.difficulty === difficulty));
  let list = all.filter((e) => (pool === 'all' ? true : pool === 'new' ? !done[e.id] : done[e.id] && !done[e.id].c));
  if (!list.length && pool === 'new') list = all;
  const r = rng(newSeed());
  const bySkill: Record<string, any[]> = {};
  for (const x of r.shuffle(list)) (bySkill[x.skill] ||= []).push(x);
  const lists = r.shuffle(Object.values(bySkill));
  const pick: any[] = [];
  for (let i = 0; pick.length < count && lists.some((l: any[]) => l.length); i++) { const l = lists[i % lists.length]; if (l.length) pick.push(l.pop()); }
  return pick.map((x) => regen(x.id)).filter((q): q is Q => !!q);
}

export function skillSet(test: Test, section: string, opts: { skills?: string[]; domains?: string[] }, count = 10): Q[] {
  const keys = keysFor(test, section, opts.domains || null, opts.skills || null);
  if (!keys.length) return [];
  return buildSet({ test, keys, difficulty: 'mixed', count, seed: newSeed() });
}

/** Save a finished practice set in the same shape as the website's runner, so it shows on the web dashboard. */
export function saveAttempt(s: Session, answers: Record<number, number | string | null>, startedAt: number) {
  const right = s.questions.filter((q, i) => isRight(q, answers[i])).length;
  return store.addAttempt({
    kind: 'practice', title: s.title, test: s.test, examKey: null, seed: null,
    date: Date.now(), timeSpent: Math.round((Date.now() - startedAt) / 1000),
    modules: [{ name: s.title, section: s.section, route: null, qids: s.questions.map((q) => q.id), answers, marked: [] }],
    correct: right, total: s.questions.length,
  });
}

export function mistakes(test?: string) {
  return Object.entries(store.data().mistakes as Record<string, any>)
    .filter(([, m]) => !test || m.test === test)
    .sort((a, b) => b[1].ts - a[1].ts);
}

