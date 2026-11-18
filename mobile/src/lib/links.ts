// Links inside lesson and question HTML use the website's hash routes (#/learn/algebra-1).
// Map them to app screens; anything the app doesn't have opens on studyfox.org.
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { SITE_URL } from './shared';

export function appRouteFor(hash: string): string | null {
  const path = hash.replace(/^#/, '').split('?')[0];
  const p = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (p[0] === 'learn') return p[2] ? `/courses/${p[1]}/${p[2]}` : p[1] ? `/courses/${p[1]}` : '/courses';
  if (p[0] === 'flashcards') return p[1] && p[1] !== 'new' ? `/cards/${encodeURIComponent(p[1])}` : p[1] === 'new' ? '/edit-set' : '/cards';
  if (p[0] === 'share' && p[1]) return `/share/${p[1]}`;
  if (p[0] === 'privacy' || p[0] === 'terms') return `/doc/${p[0]}`;
  if (p[0] === 'calculator') return '/calculator';
  if (p[0] === 'formulas') return '/practice/formulas';
  if (p[0] === 'speed') return '/speed';
  if (p[0] === 'review') return '/practice/mistakes';
  if (p[0] === 'practice') return '/practice';
  if (p[0] === 'news') return '/news';
  if (p[0] === 'donate') return '/about'; // the app has no donation links (App Store guideline 3.1.1)
  if (p[0] === 'about' || p[0] === 'contributors') return '/about';
  if (p[0] === 'ap') return '/practice/ap';
  if (p[0] === 'dashboard' || !p[0]) return '/';
  return null;
}

export function openLink(href: string) {
  if (href.startsWith('#')) {
    const r = appRouteFor(href);
    if (r) router.push(r as Href);
    else openWeb(`${SITE_URL}/${href}`);
  } else if (/^mailto:|^tel:/.test(href)) Linking.openURL(href);
  else if (/^https?:/.test(href)) openWeb(href);
}

export const openWeb = (url: string) => WebBrowser.openBrowserAsync(url);
