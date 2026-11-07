// Daily study reminders (local notifications, scheduled on this iPhone).
// The next 7 days are kept scheduled. Today's reminder is skipped once you've studied, and the
// text mentions your streak, so the reminder only nags when it's useful.
// Settings are per device (iOS permission is per device), stored in localStorage as sf_reminders.
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { recentSets } from './cards';
import { COURSES, store, today } from './shared';

// Kinds of reminder, each with its own switch in Me. Each day's reminder picks something useful from the
// kinds that are on: keep a streak, drill a weak skill, fix mistakes, Rush, review a flashcard set,
// finish or prepare for a practice test, or continue a course.
export const KINDS = {
  streak: ['Streak', 'When your streak is about to break'],
  practice: ['Practice ideas', 'Weak skills to drill and Rush challenges'],
  mistakes: ['Mistakes', 'Questions you missed and should retry'],
  cards: ['Flashcards', 'Sets you were studying'],
  tests: ['Practice tests', 'Tests in progress and your test date'],
  courses: ['Courses', 'The next lesson in a course you started'],
} as const;
export type Kind = keyof typeof KINDS;
export type ReminderPrefs = { on: boolean; hour: number; minute: number; asked: boolean; kinds: Record<Kind, boolean> };
const KEY = 'sf_reminders';
const DEFAULT: ReminderPrefs = { on: false, hour: 19, minute: 0, asked: false, kinds: { streak: true, practice: true, mistakes: true, cards: true, tests: true, courses: true } };
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export function getPrefs(): ReminderPrefs {
  try { const p = JSON.parse(localStorage.getItem(KEY) || '{}'); return { ...DEFAULT, ...p, kinds: { ...DEFAULT.kinds, ...(p.kinds || {}) } }; } catch { return DEFAULT; }
}
function savePrefs(p: ReminderPrefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/** Ask iOS for permission. Returns true if reminders can be shown. */
export async function requestPermission(): Promise<boolean> {
  if (!supported) return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return res.granted;
}

export const openSystemSettings = () => Linking.openSettings();

/** Turn reminders on or off. Turning on asks for permission first. */
export async function setReminders(on: boolean, time?: { hour: number; minute: number }): Promise<{ ok: boolean; denied?: boolean }> {
  const p = { ...getPrefs(), asked: true, ...(time || {}) };
  if (on && !(await requestPermission())) { savePrefs({ ...p, on: false }); await reschedule(); return { ok: false, denied: true }; }
  savePrefs({ ...p, on });
  await reschedule();
  return { ok: true };
}

export async function setKind(k: Kind, on: boolean) { const p = getPrefs(); savePrefs({ ...p, kinds: { ...p.kinds, [k]: on } }); await reschedule(); }

export function markAsked() { savePrefs({ ...getPrefs(), asked: true }); }

type Note = { title: string; body: string; url: string };

/** Useful things to suggest right now, from the kinds that are switched on. */
function ideas(k: Record<Kind, boolean>): Note[] {
  const d = store.data(), s = d.settings, out: Note[] = [];
  const focus = s.focus || 'SAT';
  if (k.tests) {
    if (d.inProgress?.kind === 'exam') out.push({ title: 'Finish your practice test', body: `${d.inProgress.title} is waiting where you left off.`, url: '/exam' });
    const days = s.testDate ? Math.ceil((new Date(s.testDate + 'T08:00').getTime() - Date.now()) / 86400000) : null;
    if (days != null && days > 0 && days <= 60) out.push({ title: `${days} day${days === 1 ? '' : 's'} until test day`, body: 'A timed practice test is the best way to get ready.', url: '/practice/exams' });
    else if (!d.attempts.some((a: any) => a.kind === 'exam')) out.push({ title: `Try ${focus} Practice Test 1`, body: 'See where you stand with a timed, scored practice test.', url: '/practice/exams' });
  }
  if (k.mistakes) {
    const n = Object.values(d.mistakes || {}).filter((m: any) => m.test === focus).length;
    if (n) out.push({ title: `${n} mistake${n === 1 ? '' : 's'} to fix`, body: 'Retry the questions you missed while they are fresh.', url: '/practice/mistakes' });
  }
  if (k.practice) {
    const weak = Object.entries(d.skillStats || {}).filter(([key, v]: any) => key.startsWith(focus + '|') && v.t >= 3).sort((a: any, b: any) => a[1].c / a[1].t - b[1].c / b[1].t)[0];
    if (weak) out.push({ title: `Drill ${weak[0].split('|')[2]}`, body: `It's your weakest ${focus} skill right now. Ten questions will help.`, url: '/practice' });
    out.push({ title: `${focus} Rush`, body: 'Two minutes, as many right as you can. Beat your best.', url: `/speed?test=${focus}&go=1` });
    for (const id of (s.studying || []) as string[]) {
      const c = COURSES.find((x) => x.id === id && x.ap);
      if (c) out.push({ title: `${c.title} Rush`, body: 'A quick round of exam-style questions.', url: `/speed?test=AP&ap=${id}&go=1` });
    }
  }
  if (k.cards) {
    for (const set of recentSets(2)) out.push({ title: `Review ${set.title}`, body: 'A few minutes of flashcards keeps it fresh.', url: `/study/${set.id}` });
  }
  if (k.courses) {
    const learned = (d.learned || {}) as Record<string, number>;
    const last = Object.entries(learned).sort((a, b) => b[1] - a[1])[0];
    const c = last && COURSES.find((x) => x.id === last[0].split('/')[0]);
    const next = c?.lessons.find((l) => !learned[`${c.id}/${l.id}`]);
    if (c && next) out.push({ title: `Next up in ${c.title}`, body: next.title, url: `/courses/${c.id}/${next.id}` });
  }
  return out;
}

const LINES = [
  ['Five minutes of study?', 'A Quick 5 or a few flashcards keeps it fresh.'],
  ['Quick study break', 'Flip through a flashcard set while you have a minute.'],
  ['Beat your best', 'Try a 2-minute Speed Rush and see how many you get right.'],
  ['Your future self says thanks', 'One short lesson or a Quick 5 is plenty for today.'],
  ['Ready when you are', 'Pick up where you left off on StudyFox.'],
];

/** Rebuild the scheduled reminders from the current settings, streak, and today's activity. */
export async function reschedule() {
  if (!supported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const p = getPrefs();
    if (!p.on || !store.user()) return;
    const studiedToday = !!store.data().activity?.[today()];
    const streak = store.streak();
    for (let d = 0; d < 7; d++) {
      const at = new Date();
      at.setDate(at.getDate() + d);
      at.setHours(p.hour, p.minute, 0, 0);
      if (at.getTime() <= Date.now() + 60_000) continue;
      if (d === 0 && studiedToday) continue;
      // A streak is only at risk on the next day it could break.
      const keep = streak > 0 && (d === 0 || (d === 1 && studiedToday));
      const pick = ideas(p.kinds);
      const note: Note = keep && p.kinds.streak
        ? { title: `Keep your ${streak}-day streak`, body: 'Answer one question to keep it going. It takes a minute.', url: '/practice' }
        : pick.length ? pick[(at.getDate() + d) % pick.length]
        : (() => { const [title, body] = LINES[(at.getDate() + d) % LINES.length]; return { title, body, url: '/' }; })();
      await Notifications.scheduleNotificationAsync({
        content: { title: note.title, body: note.body, data: { url: note.url } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
    }
  } catch (e) {
    console.warn('Could not schedule reminders', e);
  }
}

export const timeLabel = (p: ReminderPrefs) =>
  new Date(2000, 0, 1, p.hour, p.minute).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Open the screen a reminder points to when it's tapped (also when the tap launched the app). */
export function wireNotificationTaps() {
  if (!supported) return;
  const open = (r: Notifications.NotificationResponse | null) => {
    const url = r?.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) setTimeout(() => router.push(url as any), 300);
  };
  Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
  Notifications.addNotificationResponseReceivedListener(open);
}
