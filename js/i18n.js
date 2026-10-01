// Native-language support for English learners. The test itself stays in English; this module
// translates explanations (and, while practicing, questions) into the student's primary language.
// Uses the browser's on-device Translator API when available, otherwise links out to Google Translate.
import { icon } from './icons.js';
import { store } from './store.js';
import { tex, esc } from './util.js';

export const LANGS = [
  ['en', 'English', 'English'], ['es', 'Spanish', 'Español'], ['zh', 'Chinese (Simplified)', '中文'], ['hi', 'Hindi', 'हिन्दी'],
  ['ar', 'Arabic', 'العربية'], ['pt', 'Portuguese', 'Português'], ['vi', 'Vietnamese', 'Tiếng Việt'], ['ko', 'Korean', '한국어'],
  ['fr', 'French', 'Français'], ['ru', 'Russian', 'Русский'], ['ja', 'Japanese', '日本語'], ['tl', 'Tagalog', 'Tagalog'],
  ['ur', 'Urdu', 'اردو'], ['bn', 'Bengali', 'বাংলা'], ['tr', 'Turkish', 'Türkçe'], ['de', 'German', 'Deutsch'],
  ['it', 'Italian', 'Italiano'], ['pl', 'Polish', 'Polski'], ['uk', 'Ukrainian', 'Українська'], ['fa', 'Persian', 'فارسی'],
  ['ht', 'Haitian Creole', 'Kreyòl ayisyen'], ['so', 'Somali', 'Soomaali'], ['sw', 'Swahili', 'Kiswahili'], ['th', 'Thai', 'ไทย'],
  ['id', 'Indonesian', 'Bahasa Indonesia'], ['ne', 'Nepali', 'नेपाली'], ['my', 'Burmese', 'မြန်မာ'], ['am', 'Amharic', 'አማርኛ'],
];
export const PROFICIENCY = [
  ['beginner', 'Beginner', 'I understand some everyday English'],
  ['intermediate', 'Intermediate', 'I can read most English, but slowly'],
  ['advanced', 'Advanced', 'I read English well but miss some words'],
  ['fluent', 'Fluent', 'I am comfortable in English'],
];
const RTL = new Set(['ar', 'ur', 'fa']);

export const langName = (code) => (LANGS.find((l) => l[0] === code) || LANGS[0])[2];
export const langOptions = (sel) => LANGS.map(([c, n, nat]) => `<option value="${c}" ${c === sel ? 'selected' : ''}>${esc(nat === n ? n : `${nat} (${n})`)}</option>`).join('');
export const profOptions = (sel) => PROFICIENCY.map(([v, n, d]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${n}: ${d}</option>`).join('');

function prefs() {
  const s = store.data().settings;
  return { lang: s.lang || 'en', prof: s.english || 'intermediate' };
}
export const needsHelp = () => prefs().lang !== 'en';
// Beginner/intermediate readers get explanations translated automatically; everyone else taps a button.
const autoExplain = () => needsHelp() && ['beginner', 'intermediate'].includes(prefs().prof);
// Question translation is offered only while practicing, and not to fluent readers.
const offerQuestion = () => needsHelp() && prefs().prof !== 'fluent';

// Registry of source text for the buttons (avoids stuffing long text into attributes).
const src = new Map();
let seq = 0;
const reg = (text) => { const id = 'x' + ++seq; src.set(id, text); if (src.size > 300) src.delete(src.keys().next().value); return id; };

/** Help block under an explanation. Returns '' for English speakers. */
export function explainHelp(expl) {
  if (!needsHelp() || !expl) return '';
  const id = reg(expl);
  return `<div class="xl" data-xl="${id}" ${autoExplain() ? 'data-auto' : ''}><button class="link sm" data-xl-go>${icon('globe')} Explain in ${esc(langName(prefs().lang))}</button><div class="xl-out"></div></div>`;
}
/** "Translate question" button for untimed practice. */
export function questionHelp(q) {
  if (!offerQuestion()) return '';
  const parts = [q.passage, q.stem, q.choices && q.choices.map((c, i) => `${'ABCD'[i]}) ${c}`).join('\n')].filter(Boolean).join('\n\n');
  const id = reg(parts);
  return `<div class="xl" data-xl="${id}"><button class="link sm" data-xl-go>${icon('globe')} Translate question to ${esc(langName(prefs().lang))}</button><div class="xl-out"></div></div>`;
}

// Keep math and markup out of the translator: swap them for numbered tokens and restore afterwards.
function protect(text) {
  const keep = [];
  const out = String(text).replace(/\$[^$]+\$|<[^>]+>/g, (m) => `[${keep.push(m) - 1}]`);
  return { out, keep };
}
const restore = (text, keep) => text.replace(/\[\s*(\d+)\s*\]/g, (m, i) => keep[+i] ?? m);

const cache = new Map();
const translators = {};
async function translate(text, lang) {
  const key = lang + '|' + text;
  if (cache.has(key)) return cache.get(key);
  const T = self.Translator;
  if (!T) throw new Error('unsupported');
  const avail = await T.availability({ sourceLanguage: 'en', targetLanguage: lang });
  if (avail === 'unavailable') throw new Error('unsupported');
  translators[lang] ||= T.create({ sourceLanguage: 'en', targetLanguage: lang });
  let tr;
  try { tr = await translators[lang]; } catch (e) { delete translators[lang]; throw e; }
  const { out, keep } = protect(text);
  const res = restore(await tr.translate(out), keep);
  cache.set(key, res);
  return res;
}

const gtLink = (text, lang) => `https://translate.google.com/?sl=en&tl=${lang}&op=translate&text=${encodeURIComponent(String(text).replace(/<[^>]+>/g, '').slice(0, 4500))}`;

async function run(box, fromClick) {
  if (box.dataset.state === 'busy' || box.dataset.state === 'done') return;
  const text = src.get(box.dataset.xl); if (text == null) return;
  const { lang } = prefs();
  const out = box.querySelector('.xl-out');
  box.dataset.state = 'busy';
  out.innerHTML = '<span class="muted small">Translating…</span>';
  try {
    // Some browsers expose the API but never finish; don't leave the student waiting.
    const res = await Promise.race([translate(text, lang), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), fromClick ? 15000 : 6000))]);
    out.innerHTML = `<div class="xl-text" lang="${lang}" dir="${RTL.has(lang) ? 'rtl' : 'ltr'}">${tex(res).replace(/\n/g, '<br>')}</div><p class="muted small">Machine translation. The real test is in English, so reread the English version too.</p>`;
    box.querySelector('[data-xl-go]')?.remove();
    box.dataset.state = 'done';
  } catch {
    // Auto mode can't download a language model without a click; leave the button for the student.
    if (!fromClick) { out.innerHTML = ''; box.dataset.state = ''; return; }
    out.innerHTML = `<p class="small">Your browser can't translate here. <a href="${gtLink(text, lang)}" target="_blank" rel="noopener">Open in Google Translate</a>.</p>`;
    box.querySelector('[data-xl-go]')?.remove();
    box.dataset.state = 'done';
  }
}

let wired = false;
export function initI18n() {
  if (wired) return; wired = true;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-xl-go]');
    if (b) run(b.closest('.xl'), true);
  });
  const scan = () => document.querySelectorAll('.xl[data-auto]:not([data-state])').forEach((b) => run(b, false));
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
