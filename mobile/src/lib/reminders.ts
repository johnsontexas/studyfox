// Daily study reminders (local notifications, scheduled on this iPhone).
// The next 7 days are kept scheduled. Today's reminder is skipped once you've studied, and the
// text mentions your streak, so the reminder only nags when it's useful.
// Settings are per device (iOS permission is per device), stored in localStorage as sf_reminders.
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { store, today } from './shared';

export type ReminderPrefs = { on: boolean; hour: number; minute: number; asked: boolean };
const KEY = 'sf_reminders';
const DEFAULT: ReminderPrefs = { on: false, hour: 19, minute: 0, asked: false };
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export function getPrefs(): ReminderPrefs {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEFAULT; }
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

export function markAsked() { savePrefs({ ...getPrefs(), asked: true }); }

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
      const [title, body] = keep
        ? [`Keep your ${streak}-day streak`, 'Answer one question to keep it going. It takes a minute.']
        : LINES[(at.getDate() + d) % LINES.length];
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { url: '/' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
    }
  } catch (e) {
    console.warn('Could not schedule reminders', e);
  }
}

export const timeLabel = (p: ReminderPrefs) =>
  new Date(2000, 0, 1, p.hour, p.minute).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
