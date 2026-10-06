// AP question bank in the app: the website's js/content/ap-bank.js with the app's Supabase client,
// plus conversion of AP rows into the Q shape that QuestionView draws.
import { contentClient } from './cloud';
import { apCounts as counts, apQuestions as questions, esc } from './shared';
import type { Q } from './types';

export type APRow = { id: number; unit: string; concept: string; difficulty: 1 | 2 | 3; stem: string; choices: string[]; answer: number; expl: string };
export const loadAPCounts = (): Promise<Record<string, Record<string, number>>> => counts(contentClient());
export const loadAP = (cid: string): Promise<APRow[]> => questions(contentClient(), cid);

// AP fields are plain text with $...$ math and \$ for a literal dollar sign; Rich expects HTML.
const html = (s: string) => esc(s).replace(/\\\$/g, '&#36;').replace(/\n/g, '<br>');

/** An AP row as a Q for QuestionView. The original row rides along so results can be recorded. */
export const apQ = (r: APRow): Q & { ap: APRow } => ({
  id: 'ap' + r.id, uid: 'ap' + r.id, key: 'ap', test: 'SAT', section: 'ap', domain: r.unit, skill: r.concept || r.unit, difficulty: r.difficulty,
  type: 'mc', passage: '', figure: '', stem: html(r.stem), choices: r.choices.map(html), answer: r.answer, expl: html(r.expl), ap: r,
});

export type APSession = { cid: string; title: string; rows: APRow[] };
let pending: APSession | null = null;
export const setAPSession = (s: APSession) => { pending = s; };
export const takeAPSession = () => pending;
