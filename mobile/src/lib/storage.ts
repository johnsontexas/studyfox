// A synchronous localStorage backed by AsyncStorage. The website's store reads and writes
// localStorage synchronously, so everything is loaded into memory once at launch (hydrate),
// then every write is mirrored to disk in the background.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const mem = new Map<string, string>();
const pending = new Map<string, string | null>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function schedule(key: string, value: string | null) {
  pending.set(key, value);
  if (!flushTimer) flushTimer = setTimeout(flush, 50);
}

export async function flush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  const batch = [...pending];
  pending.clear();
  const sets = batch.filter(([, v]) => v != null) as [string, string][];
  const dels = batch.filter(([, v]) => v == null).map(([k]) => k);
  try {
    if (sets.length) await AsyncStorage.multiSet(sets);
    if (dels.length) await AsyncStorage.multiRemove(dels);
  } catch (e) {
    console.warn('Could not save progress', e);
  }
}

export function installLocalStorage() {
  (globalThis as any).localStorage = {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => { mem.set(k, String(v)); schedule(k, String(v)); },
    removeItem: (k: string) => { mem.delete(k); schedule(k, null); },
    clear: () => { for (const k of mem.keys()) schedule(k, null); mem.clear(); },
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() { return mem.size; },
  };
}

// Only our keys (fm_*, sf_*). Supabase keeps its session in AsyncStorage separately.
export async function hydrate() {
  if (Platform.OS === 'web') return;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => /^(fm|sf)_/.test(k));
  for (const [k, v] of await AsyncStorage.multiGet(keys)) if (v != null) mem.set(k, v);
}
