// Announcements from the admin console (news posts with "pop up" and/or "push notification" on).
// Pop-ups show once each when the app opens or comes back to the front; which ones you've seen is kept
// in settings.seenPopups, so dismissing one on the website or another phone counts here too.
// Push notifications are sent by the database (supabase/announcements.sql) to every saved Expo token.
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { fetchPopups, removePushToken, savePushToken, type NewsPost } from './cloud';
import { requestPermission } from './reminders';
import { store } from './shared';

const KEY = 'sf_announce_push';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';
type PushPrefs = { on: boolean; token?: string };

export function pushPrefs(): PushPrefs {
  try { return { on: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { on: true }; }
}
function savePrefs(p: PushPrefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

async function token(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  try { return (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data; }
  catch (e) { console.warn('No push token', e); return null; }
}

/** Register for announcement pushes if notifications are already allowed (never shows a prompt). */
export async function syncPushToken() {
  if (!supported || !pushPrefs().on) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  const t = await token();
  if (!t) return;
  await savePushToken(t, Platform.OS);
  savePrefs({ ...pushPrefs(), token: t });
}

/** The Me switch. Turning on asks iOS for permission. Returns false if notifications are blocked. */
export async function setAnnouncementPush(on: boolean): Promise<boolean> {
  const p = pushPrefs();
  if (!on) {
    if (p.token) await removePushToken(p.token).catch(() => {});
    savePrefs({ on: false });
    return true;
  }
  savePrefs({ ...p, on: true });
  if (!(await requestPermission())) return false;
  await syncPushToken();
  return true;
}

/** Whether notifications are allowed at all (for the pop-up's "Turn on notifications" link). */
export async function notificationsAllowed() {
  if (!supported) return true;
  return (await Notifications.getPermissionsAsync()).granted;
}

const seen = (): number[] => store.data().settings.seenPopups || [];

/** The newest pop-up announcement you haven't dismissed yet, if any. */
export async function nextPopup(): Promise<NewsPost | null> {
  const list = await fetchPopups();
  const s = new Set(seen());
  return list.find((n) => !s.has(n.id)) || null;
}

export function markPopupSeen(id: number) {
  const s = store.data().settings;
  s.seenPopups = [id, ...seen().filter((x) => x !== id)].slice(0, 60);
  store.save();
}
