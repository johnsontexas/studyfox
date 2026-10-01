// Local persistence + accounts. Everything lives in this browser's localStorage.
// Swap this module for a real backend (e.g. Supabase) to sync across devices.
import { uid, hashStr } from './util.js';
import { bankNo } from './gen/bank.js';

const K_USERS = 'fm_users', K_SESSION = 'fm_session', K_CLOUD = 'fm_cloud_users';
const read = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

async function hashPw(email, pw) {
  const salt = 'fullmark:' + email.toLowerCase();
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + pw));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return 'h' + hashStr(salt + pw);
}

const blank = () => ({
  attempts: [], mistakes: {}, saved: {}, stats: {}, skillStats: {}, activity: {},
  sets: [], setProgress: {}, settings: { theme: 'system', target: { SAT: 1400, ACT: 30 }, testDate: '', focus: 'SAT', lang: 'en', english: '' },
  inProgress: null, speed: { best: {}, runs: [] }, learned: {}, bank: {},
});

// Combine two progress blobs (e.g. this device + the cloud copy) without losing either side's work.
function merge(a, b) {
  if (!b) return a;
  if (!a) return b;
  const byId = (x, y) => { const m = new Map(); [...(y || []), ...(x || [])].forEach((o) => { const p = m.get(o.id); if (!p || (o.updated || o.date || 0) > (p.updated || p.date || 0)) m.set(o.id, o); }); return [...m.values()]; };
  const bigger = (x = {}, y = {}) => { const o = { ...y }; for (const k in x) if (!o[k] || x[k].t > o[k].t) o[k] = x[k]; return o; };
  const out = Object.assign(blank(), b, a);
  out.attempts = byId(a.attempts, b.attempts).sort((p, q) => (q.date || 0) - (p.date || 0)).slice(0, 200);
  out.sets = byId(a.sets, b.sets);
  out.mistakes = { ...b.mistakes, ...a.mistakes };
  out.saved = { ...b.saved, ...a.saved };
  out.setProgress = { ...b.setProgress, ...a.setProgress };
  out.stats = bigger(a.stats, b.stats);
  out.skillStats = bigger(a.skillStats, b.skillStats);
  out.activity = { ...b.activity };
  for (const k in a.activity) out.activity[k] = Math.max(a.activity[k], out.activity[k] || 0);
  const sa = a.speed || blank().speed, sb = b.speed || blank().speed;
  out.speed = { best: { ...sb.best }, runs: byId(sa.runs, sb.runs).sort((p, q) => q.date - p.date).slice(0, 100) };
  for (const k in sa.best) out.speed.best[k] = Math.max(sa.best[k], out.speed.best[k] || 0);
  out.settings = Object.assign(blank().settings, b.settings, a.settings);
  out.learned = { ...b.learned, ...a.learned };
  out.bank = { ...b.bank };
  for (const k in a.bank) if (!out.bank[k] || a.bank[k].ts > out.bank[k].ts) out.bank[k] = a.bank[k];
  out.inProgress = a.inProgress || b.inProgress;
  return out;
}

let cache = null, cacheKey = null;
const dataKey = () => 'fm_data_' + (read(K_SESSION, null) || 'guest');
const listeners = new Set(), saveListeners = new Set();

export const today = () => new Date().toISOString().slice(0, 10);

export const store = {
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit() { listeners.forEach((f) => f()); },

  onSave(fn) { saveListeners.add(fn); },

  user() {
    const e = read(K_SESSION, null);
    if (!e) return null;
    if (e.startsWith('cloud:')) { const c = read(K_CLOUD, {})[e]; return c ? { ...c, cloud: true } : null; }
    const u = read(K_USERS, {})[e];
    return u ? { name: u.name, email: u.email, created: u.created } : null;
  },
  async signup({ name, email, password }) {
    email = email.trim().toLowerCase();
    const users = read(K_USERS, {});
    if (users[email]) throw new Error('An account with that email already exists on this device.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    users[email] = { name: name.trim() || email.split('@')[0], email, pw: await hashPw(email, password), created: Date.now() };
    write(K_USERS, users);
    // Carry guest progress into the new account
    const guest = read('fm_data_guest', null);
    if (guest && !read('fm_data_' + email, null)) { write('fm_data_' + email, guest); localStorage.removeItem('fm_data_guest'); }
    write(K_SESSION, email); cache = null; this.emit();
  },
  async login(email, password) {
    email = email.trim().toLowerCase();
    const u = read(K_USERS, {})[email];
    if (!u || u.pw !== (await hashPw(email, password))) throw new Error('Email or password is incorrect.');
    write(K_SESSION, email); cache = null; this.emit();
  },
  // Called by cloud.js after a Google/Apple sign-in. Guest progress on this device is folded in.
  cloudLogin({ id, email, name, provider }) {
    const key = 'cloud:' + id;
    const all = read(K_CLOUD, {});
    all[key] = { id, email, name, provider, created: all[key]?.created || Date.now() };
    write(K_CLOUD, all);
    const guest = read('fm_data_guest', null);
    if (guest) { write('fm_data_' + key, merge(read('fm_data_' + key, null), guest)); localStorage.removeItem('fm_data_guest'); }
    write(K_SESSION, key); cache = null; this.emit();
  },
  mergeIn(remote) { cache = merge(this.data(), remote); cacheKey = dataKey(); write(dataKey(), cache); this.emit(); },
  logout() { localStorage.removeItem(K_SESSION); cache = null; this.emit(); },
  updateProfile({ name }) {
    const e = read(K_SESSION, null); if (!e) return;
    if (e.startsWith('cloud:')) { const c = read(K_CLOUD, {}); c[e].name = name; write(K_CLOUD, c); this.emit(); return; }
    const users = read(K_USERS, {}); users[e].name = name; write(K_USERS, users); this.emit();
  },

  data() {
    const k = dataKey();
    if (!cache || cacheKey !== k) { cache = Object.assign(blank(), read(k, {})); cache.settings = Object.assign(blank().settings, cache.settings); cacheKey = k; }
    return cache;
  },
  save() { if (!write(dataKey(), this.data())) console.warn('Storage full'); saveListeners.forEach((f) => f()); },

  recordAnswer(q, correct) {
    const d = this.data();
    const k1 = `${q.test}|${q.section}|${q.domain}`, k2 = `${q.test}|${q.section}|${q.skill}`;
    for (const [obj, k] of [[d.stats, k1], [d.skillStats, k2]]) {
      const s = (obj[k] ||= { c: 0, t: 0 }); s.t++; if (correct) s.c++;
    }
    d.activity[today()] = (d.activity[today()] || 0) + 1;
    // Numbered bank questions remember their latest result so the bank can show what's done
    if (bankNo(q.id)) d.bank[q.id] = { c: correct ? 1 : 0, ts: Date.now() };
    if (correct) delete d.mistakes[q.id];
    else d.mistakes[q.id] = { ts: Date.now(), test: q.test, section: q.section, domain: q.domain, skill: q.skill, difficulty: q.difficulty };
  },
  streak() {
    const act = this.data().activity;
    let n = 0; const dt = new Date();
    if (!act[today()]) dt.setDate(dt.getDate() - 1); // today not done yet: streak still alive from yesterday
    while (act[dt.toISOString().slice(0, 10)]) { n++; dt.setDate(dt.getDate() - 1); }
    return n;
  },
  addAttempt(a) { const d = this.data(); a.id ||= uid(); d.attempts.unshift(a); d.attempts = d.attempts.slice(0, 200); this.save(); return a.id; },
  getAttempt(id) { return this.data().attempts.find((a) => a.id === id); },
  toggleSaved(id) { const s = this.data().saved; if (s[id]) delete s[id]; else s[id] = Date.now(); this.save(); return !!s[id]; },

  // Flashcard sets
  sets() { return this.data().sets; },
  getSet(id) { return this.data().sets.find((s) => s.id === id); },
  upsertSet(set) {
    const d = this.data();
    set.updated = Date.now();
    const i = d.sets.findIndex((s) => s.id === set.id);
    if (i >= 0) d.sets[i] = set; else { set.id ||= uid(); set.created = Date.now(); d.sets.unshift(set); }
    this.save(); return set.id;
  },
  deleteSet(id) { const d = this.data(); d.sets = d.sets.filter((s) => s.id !== id); delete d.setProgress[id]; this.save(); },
  progress(setId) {
    const p = (this.data().setProgress[setId] ||= { starred: [], mastery: {}, matchBest: null, studied: 0 });
    return p;
  },

  exportAll() { return JSON.stringify({ app: 'fullmark', v: 1, user: this.user()?.email || null, data: this.data() }, null, 1); },
  importAll(json) {
    const o = JSON.parse(json);
    if (o.app !== 'fullmark' || !o.data) throw new Error('Not a StudyFox backup file.');
    cache = Object.assign(blank(), o.data); cacheKey = dataKey(); this.save(); this.emit();
  },
  resetAll() { localStorage.removeItem(dataKey()); cache = null; this.save(); this.emit(); },
};
