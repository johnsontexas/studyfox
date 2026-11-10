// Shared helpers: seeded RNG, math formatting, DOM, answer building.

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seed) {
  const f = mulberry32(seed >>> 0);
  const r = {
    seed,
    next: f,
    int: (a, b) => a + Math.floor(f() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(f() * arr.length)],
    chance: (p) => f() < p,
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(f() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sample: (arr, n) => r.shuffle(arr).slice(0, n),
    nz(a, b) { let v; do v = r.int(a, b); while (v === 0); return v; },
    sign: () => (f() < 0.5 ? -1 : 1),
    weighted(weights) { // weights: {key: w}
      const tot = Object.values(weights).reduce((s, w) => s + w, 0);
      let x = f() * tot;
      for (const [k, w] of Object.entries(weights)) { if ((x -= w) < 0) return k; }
      return Object.keys(weights)[0];
    },
  };
  return r;
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const round = (v, p = 6) => Math.round(v * 10 ** p) / 10 ** p;

export function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
// TeX for n/d, reduced ("\frac{3}{4}", "-\frac{1}{2}", "5")
export function fracTex(n, d = 1) {
  const f = frac(n, d);
  if (f.d === 1) return String(f.n);
  return (f.n < 0 ? '-' : '') + `\\frac{${Math.abs(f.n)}}{${f.d}}`;
}
export function fracStr(n, d = 1) {
  const f = frac(n, d);
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

// Polynomial/linear TeX from [[coef, 'x^2'], [coef, 'x'], [coef, '']]
export function poly(terms) {
  let s = '';
  for (const [c, v] of terms) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const cs = abs === 1 && v ? '' : String(abs);
    if (s === '') s += (c < 0 ? '-' : '') + cs + v;
    else s += (c < 0 ? ' - ' : ' + ') + cs + v;
  }
  return s || '0';
}

// Number with thousands separators; TeX-safe variant uses {,}
export const num = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 4 });
export const tnum = (n) => num(n).replace(/,/g, '{,}');
// Money: uses an HTML entity so the $ never collides with math delimiters
export const money = (n, dec) => '&#36;' + Number(n).toLocaleString('en-US', dec != null ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 2 });

export const T = (s) => `$${s}$`;

// Multiple choice from display strings. Dedupes, fills from extra(), shuffles.
// A wrong answer with the mistake that produces it: W(value, 'why'). buildMC and numMC accept these anywhere
// a plain wrong value goes, and return `why` (one note per choice, '' for the right one) for js/explain.js.
// Wrapping a value never changes the random draws, so every numbered bank question stays the same.
export const W = (v, why) => ({ v, why });
const unwrap = (x) => (x && typeof x === 'object' && 'v' in x ? [x.v, x.why || ''] : [x, '']);

export function buildMC(r, correct, wrongs, extra, { keepOrder = false } = {}) {
  const c = String(correct);
  const seen = new Set([c]);
  const w = [];
  const why = new Map();
  for (const x0 of wrongs) {
    const [x, reason] = unwrap(x0);
    if (x == null) continue;
    const s = String(x);
    if (!seen.has(s)) { seen.add(s); w.push(s); if (reason) why.set(s, reason); }
  }
  let pool = keepOrder ? w.slice(0, 3) : r.shuffle(w).slice(0, 3);
  let guard = 0;
  while (pool.length < 3 && extra && guard++ < 60) {
    const s = String(extra());
    if (!seen.has(s)) { seen.add(s); pool.push(s); }
  }
  const all = keepOrder ? [c, ...pool] : r.shuffle([c, ...pool]);
  return { choices: all, answer: all.indexOf(c), why: all.map((s) => why.get(s) || '') };
}

// Numeric multiple choice, sorted ascending like the real tests.
export function numMC(r, correct, wrongs = [], { fmt = (v) => T(tnum(v)), spread = 6, step = 1 } = {}) {
  const isInt = Number.isInteger(correct);
  const pool = [];
  const why = new Map();
  for (const w0 of r.shuffle(wrongs)) {
    const [w, reason] = unwrap(w0);
    if (w == null || !isFinite(w)) continue;
    const v = round(w);
    if (v === round(correct) || pool.includes(v)) continue;
    if (isInt && !Number.isInteger(v)) continue;
    pool.push(v);
    if (reason) why.set(v, reason);
    if (pool.length === 3) break;
  }
  let guard = 0;
  while (pool.length < 3 && guard++ < 100) {
    const v = round(correct + r.nz(-spread, spread) * step);
    if (v !== round(correct) && !pool.includes(v)) pool.push(v);
  }
  const all = [round(correct), ...pool].sort((a, b) => a - b);
  return { choices: all.map(fmt), answer: all.indexOf(round(correct)), why: all.map((v) => why.get(v) || '') };
}

// Parse a student-produced response ("3/4", ".75", "-2") to a number.
export function parseSpr(s) {
  s = String(s || '').trim().replace(/\s+/g, '');
  if (!s) return NaN;
  if (/^-?\d+\/\d+$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
  return NaN;
}
export function checkSpr(input, accept) {
  const v = parseSpr(input);
  if (isNaN(v)) return false;
  return accept.some((a) => Math.abs(v - a) < 0.0011);
}

// ---------- DOM ----------
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Replace $...$ with KaTeX. Operates on HTML strings (money uses &#36; so it is untouched).
export function tex(html) {
  if (html == null) return '';
  const k = window.katex;
  return String(html).replace(/\$([^$]+)\$/g, (m, src) => {
    if (!k) return `<span class="tex-fallback">${src}</span>`;
    try { return k.renderToString(src, { throwOnError: false }); } catch { return src; }
  });
}

export function toast(msg, kind = '') {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}

export function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d / 60) + 'm ago';
  if (d < 86400) return Math.floor(d / 3600) + 'h ago';
  if (d < 86400 * 7) return Math.floor(d / 86400) + 'd ago';
  return new Date(ts).toLocaleDateString();
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// Base64 that survives unicode (for share links)
export const b64enc = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const b64dec = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

// Rules for new passwords (website and app). Returns the problem, or '' when the password is fine.
export const PASSWORD_HINT = '8+ characters, a letter and a number';
export function passwordProblem(pw = '') {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 72) return 'Password must be 72 characters or fewer.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must include at least one letter and one number.';
  if (/\s/.test(pw)) return 'Password cannot contain spaces.';
  return '';
}

export const DIFF_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
