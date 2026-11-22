// React bindings for the website's store (js/store.js). Components call useStore() to re-render
// whenever progress is saved or the signed-in account changes, then read store.* directly.
import { useSyncExternalStore } from 'react';
import { store } from './shared';
import { cloudSynced } from './cloud';

const subs = new Set<() => void>();
let version = 0;
let wired = false;

function bump() {
  version++;
  subs.forEach((f) => f());
}

export function wireStore() {
  if (wired) return;
  wired = true;
  store.onChange(bump);
  store.onSave(bump);
}

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => { subs.delete(f); };
};

export function useStore() {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

// Same rules as js/views/welcome.js.
export const AGE_BLOCK = 'sf_age_block';
// Wait for a cloud account's saved progress first: right after sign-in the local copy is blank.
export const needsOnboarding = () => { const u = store.user(); return !!u && !store.data().settings.onboarded && (!u.cloud || cloudSynced(u.id)); };
export function ageBlockedUntil(): string | null {
  let d: string | null = null;
  try { d = localStorage.getItem(AGE_BLOCK); } catch {}
  if (!d) return null;
  if (new Date(d) <= new Date()) { try { localStorage.removeItem(AGE_BLOCK); } catch {} return null; }
  return d;
}
