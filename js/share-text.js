// What students can share: their streak, their progress, or the site itself.
// No DOM here, so the iOS app uses the same wording and numbers.
import { store } from './store.js';
import { SITE_URL } from './config.js';

export const SHARE_KINDS = [
  ['streak', 'My streak', 'flame'],
  ['progress', 'My progress', 'chart'],
  ['site', 'StudyFox', 'globe'],
];

export function shareStats() {
  const d = store.data();
  const sum = (o) => Object.values(o || {}).reduce((a, s) => a + (s.t || 0), 0);
  const ap = Object.keys(d.ap || {}).length;
  return {
    streak: store.streak(),
    questions: sum(d.stats) + ap,
    lessons: Object.keys(d.learned || {}).length,
    sets: (d.sets || []).length,
  };
}

/** { title, big, small, text } for a share card and message. */
export function shareMessage(kind) {
  const s = shareStats();
  const url = SITE_URL.replace(/\/$/, '');
  if (kind === 'streak') {
    const big = String(s.streak);
    return { title: 'Study streak', big, small: s.streak === 1 ? 'day in a row studying' : 'days in a row studying',
      text: s.streak ? `I'm on a ${s.streak}-day study streak on StudyFox. Free SAT, ACT, and AP prep: ${url}` : `I'm starting a study streak on StudyFox. Join me, it's free: ${url}` };
  }
  if (kind === 'progress') {
    return { title: 'My progress', big: s.questions.toLocaleString(), small: `questions answered · ${s.lessons} lessons done`,
      text: `I've answered ${s.questions.toLocaleString()} practice questions and finished ${s.lessons} lessons on StudyFox. It's free: ${url}` };
  }
  return { title: 'Study for free', big: 'StudyFox', small: 'Free courses, AP practice, SAT and ACT prep',
    text: `StudyFox has free courses, AP practice questions, and SAT and ACT prep. No ads, no paywalls: ${url}` };
}
