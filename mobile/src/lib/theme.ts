// StudyFox look, modeled on studyfox.org: sage paper and forest ink in light mode, deep forest in dark
// mode, forest-green brand, fox-amber accent, Fraunces for headlines and numbers. Colors come from the
// website's CSS (generated/site.ts), so a palette change on the site carries over to the app.
// Everyday text uses Instrument Sans, the website's body font (components/AppText).
import { useEffect } from 'react';
import { Appearance, Platform, useColorScheme, type TextStyle } from 'react-native';
import { TOKENS } from '../generated/site';
import { store } from './shared';
import { palette } from '../../../js/appearance.js';
import { useStore } from './store-hooks';

// Warm, slightly muted accents that sit well next to forest green (used for icon tiles and stats).
const accents = {
  light: { red: '#d4543c', orange: '#e8792b', yellow: '#e0a21b', green: '#2f7d4f', mint: '#3aa57a', teal: '#2a8c8c', blue: '#3b6fb6', indigo: '#5a5fc4', purple: '#8a5cc2', pink: '#cf4f7d', gray: '#7d8a80' },
  dark: { red: '#ff7a63', orange: '#ff9a4d', yellow: '#f5c04a', green: '#6fcf8f', mint: '#5fcf94', teal: '#5cc8c4', blue: '#7aa7ff', indigo: '#9a9cff', purple: '#c49bff', pink: '#ff86ad', gray: '#8a998e' },
};

function build(scheme: 'light' | 'dark') {
  const s = TOKENS[scheme];
  const a = accents[scheme];
  const dark = scheme === 'dark';
  return {
    ...a,
    bg: s.bg, card: s.surface, card2: s.surface2,
    fill: dark ? 'rgba(232,239,233,0.07)' : 'rgba(20,35,26,0.05)', fill2: dark ? 'rgba(232,239,233,0.12)' : 'rgba(20,35,26,0.09)',
    label: s.ink, label2: s.muted, label3: dark ? 'rgba(232,239,233,0.32)' : 'rgba(20,35,26,0.3)',
    sep: s.line, line: s.line, ledge: s.lineStrong,
    tint: s.brand, tint2: s.brand2, tintSoft: s.brandSoft, onTint: s.brandInk,
    amber: '#f2b33d', amberSoft: dark ? 'rgba(242,179,61,0.16)' : '#fdf0d8', onAmber: '#2b1d05',
    flame: '#e8792b',
    good: s.good, goodSoft: s.goodSoft, bad: s.bad, badSoft: s.badSoft, warn: s.mid, warnSoft: s.midSoft,
    // Page background glow (top of the screen), like the website's hero.
    glow: dark ? ['#16301f', '#0a0f0c'] as const : ['#e4efe2', '#f5f7f2'] as const,
    hero: dark ? ['#1d4a32', '#123222'] as const : ['#1f6b47', '#174f35'] as const,
    site: s,
    dark,
  };
}
const THEMES = { light: build('light'), dark: build('dark') };
export type Colors = typeof THEMES.light;

// Color themes from Settings > Appearance (js/appearance.js, settings.appearance, synced with the website).
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
/** pct% of a mixed into b, like CSS color-mix(in srgb, a pct%, b). */
const mix = (a: string, pct: number, b: string) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => (v * pct + y[i] * (100 - pct)) / 100)); };
const lum = (h: string) => { const [r, g, b] = hex(h).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const isHex = (h: unknown): h is string => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
const themed = new Map<string, Colors>();

function withAppearance(scheme: 'light' | 'dark'): Colors {
  const base = THEMES[scheme];
  const a = store.user() ? store.data().settings.appearance : null;
  if (!a || !a.preset || a.preset === 'forest') return base;
  const p = palette(a) as { light: string; dark: string; accent: string; tint: number };
  const light = isHex(p.light) ? p.light : base.tint;
  const darkBrand = isHex(p.dark) ? p.dark : mix(light, 55, '#ffffff');
  const accent = isHex(p.accent) ? p.accent : base.amber;
  const key = `${scheme}|${light}|${darkBrand}|${accent}|${p.tint}`;
  const hit = themed.get(key); if (hit) return hit;
  const dark = scheme === 'dark';
  const brand = dark ? darkBrand : light;
  const t = dark ? Math.round(p.tint * 0.6) : p.tint;
  const out = {
    ...base,
    tint: brand, tint2: mix(brand, 80, dark ? '#ffffff' : '#000000'), tintSoft: mix(brand, dark ? 16 : 13, dark ? '#101312' : '#ffffff'),
    onTint: lum(brand) > 0.4 ? '#111111' : '#ffffff',
    amber: accent, onAmber: lum(accent) > 0.4 ? '#2b1d05' : '#ffffff', amberSoft: mix(accent, dark ? 16 : 18, dark ? '#101312' : '#ffffff'),
    bg: mix(brand, t, dark ? '#0b0d0c' : '#f8f8f6'), card: dark ? mix(brand, t + 3, '#121514') : base.card, card2: mix(brand, t + (dark ? 6 : 4), dark ? '#181c1a' : '#f3f3f1'),
    line: mix(brand, dark ? 10 : Math.max(6, p.tint + 6), dark ? '#222826' : '#e4e4e1'), sep: mix(brand, dark ? 10 : Math.max(6, p.tint + 6), dark ? '#222826' : '#e4e4e1'),
    ledge: mix(brand, dark ? 16 : Math.max(10, p.tint + 10), dark ? '#2e3532' : '#cfcfcb'),
    glow: [mix(brand, dark ? 18 : 12, dark ? '#0b0d0c' : '#f8f8f6'), mix(brand, t, dark ? '#0b0d0c' : '#f8f8f6')] as unknown as Colors['glow'],
    hero: [dark ? mix(light, 70, '#000000') : light, dark ? mix(light, 45, '#000000') : mix(light, 78, '#000000')] as unknown as Colors['hero'],
  } as unknown as Colors;
  themed.set(key, out);
  return out;
}
export { PRESETS as THEME_PRESETS } from '../../../js/appearance.js';

export function useScheme(): 'light' | 'dark' {
  useStore();
  const system = useColorScheme();
  return system === 'dark' ? 'dark' : 'light';
}
export const useColors = (): Colors => withAppearance(useScheme());

/** Applies the Appearance setting (System / Light / Dark) to the whole app. */
export function useAppearanceSetting() {
  useStore();
  const pref = store.user() ? store.data().settings.theme : 'system';
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(pref === 'light' || pref === 'dark' ? pref : 'unspecified');
  }, [pref]);
}

// Fonts (loaded in app/_layout.tsx). Fraunces is the website's headline face.
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  serif: 'SourceSerif4_400Regular',
  serifSemi: 'SourceSerif4_600SemiBold',
  // The website's body face; Text from components/AppText picks the weight automatically.
  sans: 'InstrumentSans_400Regular',
  sansSemi: 'InstrumentSans_600SemiBold',
  sansBold: 'InstrumentSans_700Bold',
};

// Text styles, matching the site: Fraunces only for big page titles; section titles and numbers in bold Instrument Sans.
export const type: Record<string, TextStyle> = {
  largeTitle: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, fontWeight: 'normal', letterSpacing: -0.5 },
  title1: { fontFamily: fonts.display, fontSize: 29, lineHeight: 35, fontWeight: 'normal', letterSpacing: -0.4 },
  title2: { fontFamily: fonts.sansBold, fontSize: 22, lineHeight: 28, fontWeight: 'normal', letterSpacing: -0.2 },
  title3: { fontFamily: fonts.sansBold, fontSize: 19, lineHeight: 24, fontWeight: 'normal', letterSpacing: -0.1 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 23 },
  callout: { fontSize: 16, lineHeight: 21 },
  subhead: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  caption2: { fontSize: 11, lineHeight: 13 },
  // Big numbers (streaks, scores, timers), like the site's stat figures.
  number: { fontFamily: fonts.sansBold, fontSize: 30, lineHeight: 34, fontWeight: 'normal', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
};
// Reading text for lessons and passages: the website's book serif.
export const serif = fonts.serif;
export const rounded = Platform.select({ ios: 'ui-rounded', default: undefined });

/** Icon color for a course subject (colored tiles). */
export const subjectColor = (c: Colors, s: string) =>
  ({ Math: c.blue, Science: c.green, English: c.purple, History: c.orange, 'Social Science': c.teal, 'Computer Science': c.indigo, Arts: c.pink, 'World Languages': c.mint, 'Study Skills': c.yellow, 'SAT & ACT': c.red } as Record<string, string>)[s] || c.tint;
