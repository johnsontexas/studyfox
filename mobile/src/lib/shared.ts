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
export { isCorrect, EXAMS, createExam, ensureModule, scoreExam, numberedTests } from '../../../js/exams.js';
export { checkSpr, rng, newSeed, uid, fmtTime, timeAgo, DIFF_LABEL, esc, tex, passwordProblem, PASSWORD_HINT } from '../../../js/util.js';
export { icon, courseIcon } from '../../../js/icons.js';
export { COURSE_ICONS } from '../../../js/course-icons.js';
export { LANGS, PROFICIENCY } from '../../../js/i18n.js';
export { TERMS_VERSION, privacyView, termsView } from '../../../js/views/legal.js';
export { CREATOR, INSTAGRAM, SITE_URL, CONTACT_EMAIL, SUPPORT_EMAIL, SUPPORT_FORM_URL, REVIEW_URL, SUPABASE_URL, SUPABASE_ANON_KEY, STUDYFOX_INSTAGRAM, BETTERU_URL, CREATOR_SITE } from '../../../js/config.js';
export { blocksFor, screens, isQuestion, gradeInput, gradeMulti, gradeOrder, gradeMatch, youtubeId } from '../../../js/content/blocks.js';
export { choiceNotes, hasChoiceNotes, detectSlip } from '../../../js/explain.js';
export { setting, SETTING_DEFAULTS } from '../../../js/content/settings.js';
export { pendingRef, clearRef, setReferrer, updateMemberProfile, loadMember, ordinal, referralUrl, myNumber, topSharers, withRanks, myAvatar, saveAvatar, foxStats, foxUnlocked } from '../../../js/members.js';
export { foxSVG, cleanAvatar, defaultAvatar, PARTS, PART_NAMES, isUnlocked, unlockText, loadAvatarItems } from '../../../js/avatar.js';
export { saveReview, loadReview } from '../../../js/review.js';
export { myClasses, classDetail, createClass, joinClass, leaveClass, updateClass, newJoinCode, removeMember, deleteClass, classSet, shareSet, unshareSet, cleanCode, topicLabel, kindLabel, classTopics } from '../../../js/classes.js';
export { qotdStatus, qotdStart, qotdAnswer, qotdBoard, qotdYesterday, fmtMs } from '../../../js/qotd.js';
export { PEOPLE, bySection, creditLine, SECTIONS as PEOPLE_SECTIONS } from '../../../js/content/people.js';
export { socials, SOCIAL_PLATFORMS } from '../../../js/content/socials.js';
export { SHARE_KINDS, shareMessage } from '../../../js/share-text.js';
export { formulasView } from '../../../js/views/formulas.js';
export { DESMOS_KEY } from '../../../js/tools.js';
export { apCounts, apQuestions, apUnits, apDone, pickAP, recordAP, apStats, HARDEST, HARDEST_ID } from '../../../js/content/ap-bank.js';

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
