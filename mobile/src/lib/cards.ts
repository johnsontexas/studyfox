// Flashcard helpers. Sets and progress live in the shared store (same shape as the website's
// js/views/flashcards.js), so sets made on the phone show up on the site and vice versa.
import { BUILTIN_DECKS, newSeed, parseImportShared, rng, SITE_URL, store } from './shared';

export type CardT = { t: string; d: string };
export type SetT = { id: string; title: string; desc?: string; tag?: string; cards: CardT[]; builtin?: boolean; updated?: number };
export type Prog = { starred: number[]; mastery: Record<number, number>; matchBest: number | null; studied: number; last?: number };

export const getSet = (id: string): SetT | undefined => BUILTIN_DECKS.find((d: SetT) => d.id === id) || store.getSet(id);
export const progress = (id: string): Prog => store.progress(id);
export const norm = (s: string) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export const shuffle = <T,>(a: T[]): T[] => rng(newSeed()).shuffle(a);
export const masteredCount = (s: SetT) => Object.values(progress(s.id).mastery).filter((m) => m >= 2).length;
export const lvl = (p: Prog, i: number) => p.mastery[i] || 0;

/** Remember when a set was last studied, for "Continue" on the Today screen. */
export function touch(id: string) { progress(id).last = Date.now(); store.save(); }

export function recentSets(n = 3): SetT[] {
  const sp = store.data().setProgress as Record<string, Prog>;
  return Object.entries(sp)
    .filter(([, p]) => p.last)
    .sort((a, b) => (b[1].last || 0) - (a[1].last || 0))
    .map(([id]) => getSet(id))
    .filter((s): s is SetT => !!s)
    .slice(0, n);
}

// Base64url of UTF-8, byte-for-byte the same as js/util.js b64enc, so share links work on both.
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function enc(str: string) {
  const b = new TextEncoder().encode(str);
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < b.length ? B64[(n >> 6) & 63] : '') + (i + 2 < b.length ? B64[n & 63] : '');
  }
  return out;
}
function dec(s: string) {
  s = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => B64.indexOf(s[i + k] ?? 'A'));
    if (v.some((x) => x < 0)) throw new Error('bad');
    const n = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
    bytes.push((n >> 16) & 255);
    if (i + 2 < s.length) bytes.push((n >> 8) & 255);
    if (i + 3 < s.length) bytes.push(n & 255);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export const shareUrl = (s: SetT) => `${SITE_URL}/#/share/${enc(JSON.stringify({ t: s.title, d: s.desc || '', c: s.cards.map((c) => [c.t, c.d]) }))}`;

/** Accepts a full share link (from the site or the app) or just its data part. */
export function parseShared(input: string): { title: string; desc: string; cards: CardT[] } | null {
  const m = String(input).trim().match(/share\/([A-Za-z0-9_\-+/=]+)/);
  const data = m ? m[1] : String(input).trim();
  try {
    const o = JSON.parse(dec(data));
    if (!Array.isArray(o.c)) return null;
    return { title: String(o.t || 'Shared set'), desc: String(o.d || ''), cards: o.c.map(([t, d]: [string, string]) => ({ t: String(t), d: String(d) })) };
  } catch {
    return null;
  }
}

/** Same rules as the website's Import box (shared code in js/cardimport.js). */
export type SepT = 'tab' | 'comma' | 'dash' | 'custom';
export type RowT = 'nl' | 'semi' | 'custom';
export const parseImport = (txt: string, sep: SepT, row: RowT, cSep = '', cRow = '') => parseImportShared(txt, sep, row, cSep, cRow) as CardT[];

/** Written answers: exact after normalizing, or a long answer that contains most of it (website's rule). */
export function writtenOk(typed: string, answer: string) {
  const a = norm(answer), g = norm(typed);
  return !!g && (g === a || (a.length > 12 && a.includes(g) && g.length >= a.length * 0.6));
}
