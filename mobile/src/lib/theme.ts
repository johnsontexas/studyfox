// StudyFox look, modeled on studyfox.org: sage paper and forest ink in light mode, deep forest in dark
// mode, forest-green brand, fox-amber accent, Fraunces for headlines and numbers. Colors come from the
// website's CSS (generated/site.ts), so a palette change on the site carries over to the app.
// Everyday text uses Apple's system font, which matches the site's sans and keeps bold weights reliable.
import { useEffect } from 'react';
import { Appearance, Platform, useColorScheme, type TextStyle } from 'react-native';
import { TOKENS } from '../generated/site';
import { store } from './shared';
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

export function useScheme(): 'light' | 'dark' {
  useStore();
  const system = useColorScheme();
  return system === 'dark' ? 'dark' : 'light';
}
export const useColors = (): Colors => THEMES[useScheme()];

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
};

// Text styles. Titles use Fraunces (weight comes from the font file, so fontWeight stays normal).
export const type: Record<string, TextStyle> = {
  largeTitle: { fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 42, fontWeight: 'normal', letterSpacing: -0.6 },
  title1: { fontFamily: fonts.displayBold, fontSize: 29, lineHeight: 35, fontWeight: 'normal', letterSpacing: -0.4 },
  title2: { fontFamily: fonts.display, fontSize: 23, lineHeight: 29, fontWeight: 'normal', letterSpacing: -0.2 },
  title3: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25, fontWeight: 'normal' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 23 },
  callout: { fontSize: 16, lineHeight: 21 },
  subhead: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  caption2: { fontSize: 11, lineHeight: 13 },
  // Big numbers (streaks, scores, timers), like the site's stat figures.
  number: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 34, fontWeight: 'normal' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
};
// Reading text for lessons and passages: the website's book serif.
export const serif = fonts.serif;
export const rounded = Platform.select({ ios: 'ui-rounded', default: undefined });

/** Icon color for a course subject (colored tiles). */
export const subjectColor = (c: Colors, s: string) =>
  ({ Math: c.blue, Science: c.green, English: c.purple, History: c.orange, 'Social Science': c.teal, 'Computer Science': c.indigo, Arts: c.pink, 'World Languages': c.mint, 'Study Skills': c.yellow, 'SAT & ACT': c.red } as Record<string, string>)[s] || c.tint;
