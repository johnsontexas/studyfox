// Full practice tests, built by the website's js/exams.js so every test (and test code) matches the site.
// A test in progress is kept in store.data().inProgress in the website runner's shape, so it can be
// resumed on either the app or studyfox.org.
import { isRight, type Q } from './questions';
import { createExam, ensureModule, EXAMS, regen, scoreExam, store, uid } from './shared';

export type ExamModule = { name: string; section: string; count: number; minutes: number; adaptive?: number; route?: string | null; questions: Q[] | null; answers: Record<number, number | string | null>; marked: number[]; elim: Record<number, number[]>; timeLeft: number; done: boolean } | { break: number; left?: number };
export type Run = { id: string; kind: 'exam'; examKey: string; title: string; test: 'SAT' | 'ACT'; seed: number; startedAt: number; modules: ExamModule[]; current: number; qi: number; view?: string };

export const examDef = (key: string) => (EXAMS as any)[key] as { test: 'SAT' | 'ACT'; title: string; blurb: string; modules: any[] };
export const codeFor = (key: string, seed: number) => `${key.toUpperCase()}-${seed}`;
export function parseCode(s: string) {
  const m = String(s).trim().toUpperCase().match(/^([A-Z]+(?:-[A-Z]+)+)-(\d+)$/);
  if (!m) return null;
  const key = m[1].toLowerCase();
  return (EXAMS as any)[key] ? { key, seed: +m[2] } : null;
}

let run: Run | null = null;

export const hasInProgress = () => !!store.data().inProgress;
export const inProgressTitle = () => store.data().inProgress?.title as string | undefined;
export function discardInProgress() { run = null; store.data().inProgress = null; store.save(); }

export function startExam(key: string, seed?: number) {
  const r = createExam(key, seed) as Run;
  r.id = uid(); r.current = 0; r.qi = 0; r.view = 'q';
  ensureModule(r, 0);
  run = r;
  persist();
}

/** The current run: the one in memory, or the saved one rebuilt from its question ids. */
export function currentRun(): Run | null {
  if (run) return run;
  const saved = store.data().inProgress;
  if (!saved || saved.kind !== 'exam') return null;
  const o = JSON.parse(JSON.stringify(saved));
  o.modules.forEach((m: any) => { if (!m.break && m.qids) m.questions = m.qids.map(regen).filter(Boolean); });
  run = o;
  return run;
}

export function persist() {
  if (!run) return;
  store.data().inProgress = { ...run, modules: run.modules.map((m: any) => (m.break ? m : { ...m, qids: m.questions ? m.questions.map((q: Q) => q.id) : null, questions: undefined, hl: undefined })) };
  store.save();
}

export function nextModule(r: Run) {
  r.current++; r.qi = 0;
  const m = r.modules[r.current];
  if (m && !('break' in m)) ensureModule(r, r.current);
  persist();
}

export const lastModuleIndex = (r: Run) => { for (let i = r.modules.length - 1; i >= 0; i--) if (!('break' in r.modules[i])) return i; return 0; };

/** Score the test and save it as an attempt, exactly like the website's finishRun. Returns the attempt id. */
export function finishExam(r: Run): string {
  const mods = r.modules.filter((m: any) => !m.break && m.questions) as any[];
  mods.forEach((m) => m.questions.forEach((q: Q, i: number) => store.recordAnswer(q, isRight(q, m.answers[i]))));
  const all = mods.flatMap((m) => m.questions.map((q: Q, i: number) => isRight(q, m.answers[i])));
  const attempt: any = {
    kind: 'exam', title: r.title, test: r.test, examKey: r.examKey, seed: r.seed,
    date: Date.now(), timeSpent: Math.round((Date.now() - r.startedAt) / 1000),
    modules: mods.map((m) => ({ name: m.name, section: m.section, route: m.route || null, qids: m.questions.map((q: Q) => q.id), answers: m.answers, marked: m.marked })),
    correct: all.filter(Boolean).length, total: all.length,
    ...scoreExam(r),
  };
  const id = store.addAttempt(attempt);
  store.data().inProgress = null; store.save();
  run = null;
  return id;
}

export const SECTION_NAMES: Record<string, string> = { rw: 'Reading & Writing', math: 'Math', english: 'English', reading: 'Reading', science: 'Science' };

export const DIRECTIONS: Record<string, string> = {
  math: 'Use of a calculator is permitted for all questions. A reference sheet and calculator are available throughout. For student-produced response questions, enter your answer in the box; fractions and decimals are both accepted.',
  science: 'Each passage is followed by several questions. After reading a passage, choose the best answer to each question. Calculators are not permitted on this section.',
  english: 'Certain words and phrases are underlined. Choose the alternative that best expresses the idea in standard written English. If the original version is best, choose "NO CHANGE."',
  rw: 'Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, then choose the best answer based on the passage(s).',
  reading: 'Each passage is followed by several questions. Choose the best answer to each question. You may refer to the passages as often as necessary.',
};
