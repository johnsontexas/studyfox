// Everything the app shares with the website lives in ../js and is imported from here.
// Edit those files and both the site and the app pick up the change.
import * as content from '../../../js/content/courses.js';
import * as gen from '../../../js/gen/index.js';
import * as bankMod from '../../../js/gen/bank.js';
import type { BankEntry, Course, Q, Test } from './types';

export { store, today } from '../../../js/store.js';
export { BUILTIN_DECKS } from '../../../js/content/decks.js';
export { initContent, onContent, live } from '../../../js/content/live.js';
export { parseImport as parseImportShared, importPrefs } from '../../../js/cardimport.js';
export { isCorrect } from '../../../js/exams.js';
export { checkSpr, rng, newSeed, uid, fmtTime, timeAgo, DIFF_LABEL, esc, tex, passwordProblem, PASSWORD_HINT } from '../../../js/util.js';
export { icon } from '../../../js/icons.js';
export { LANGS, PROFICIENCY } from '../../../js/i18n.js';
export { TERMS_VERSION, privacyView, termsView } from '../../../js/views/legal.js';
export { KOFI, CREATOR, INSTAGRAM, SITE_URL, CONTACT_EMAIL, SUPPORT_EMAIL, SUPPORT_FORM_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../js/config.js';
export { formulasView } from '../../../js/views/formulas.js';
export { DESMOS_KEY } from '../../../js/tools.js';

export const COURSES = content.COURSES as unknown as Course[];
export const SUBJECTS = content.SUBJECTS as string[];
export const getCourse = content.getCourse as unknown as (id: string) => Course | undefined;
export const lessonCount = content.lessonCount as () => number;

export const SECTIONS = gen.SECTIONS as Record<Test, Record<string, string>>;
export const taxonomy = gen.taxonomy as unknown as (test: Test) => Record<string, Record<string, Record<string, string[]>>>;
export const keysFor = gen.keysFor as (test: Test, section: string, domains?: string[] | null, skills?: string[] | null) => string[];
export const buildSet = gen.buildSet as unknown as (o: { test: Test; keys: string[]; difficulty?: string; count?: number; seed?: number; exclude?: Set<string> }) => Q[];
export const regen = gen.regen as unknown as (id: string) => Q | null;
export const questionOfTheDay = gen.questionOfTheDay as unknown as (test: Test) => Q;
export const bank = bankMod.bank as unknown as (test: Test) => BankEntry[];
export const bankNo = bankMod.bankNo as (id: string) => number | null;
