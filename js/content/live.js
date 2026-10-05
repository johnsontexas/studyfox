// Live, editable content from Supabase (tables: courses, lessons, decks, questions, hidden_questions).
// Admins edit it in the admin console (js/views/content-admin.js); the website and the iOS app both load it
// here, so new or changed lessons and questions appear without redeploying either one.
// The files in js/content/ are the built-in copy: used on a first visit with no connection, and the
// source that seeded the database. Content is cached in localStorage and only re-downloaded when the
// server's content_version() changes.
import { COURSES } from './courses.js';
import { BUILTIN_DECKS } from './decks.js';

const CACHE = 'sf_content_v1';
const BUILT_IN = { courses: COURSES.slice(), decks: BUILTIN_DECKS.slice() };

// Custom (hand-written) questions and hidden generated questions, read by js/gen.
export const live = { version: '', questions: [], hidden: new Set(), loaded: false };
const listeners = new Set();
export const onContent = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const lessonFrom = (r) => ({
  id: r.id, title: r.title, mins: r.mins, body: r.body,
  ...(r.check ? { check: r.check } : {}), ...(r.practice ? { practice: r.practice } : {}),
  ...(r.desmos ? { desmos: r.desmos } : {}), ...(r.desmos_bounds ? { desmosBounds: r.desmos_bounds } : {}),
});

/** Replace the in-memory content with a downloaded copy. Arrays are updated in place so every importer sees it. */
export function applyContent(c) {
  if (!c || !Array.isArray(c.courses) || !c.courses.length) return false;
  const byCourse = {};
  for (const l of c.lessons || []) if (!l.hidden) (byCourse[l.course_id] ||= []).push(l);
  const courses = c.courses.filter((x) => !x.hidden).sort((a, b) => a.sort - b.sort).map((x) => ({
    id: x.id, subject: x.subject, icon: x.icon, title: x.title, blurb: x.blurb, level: x.level, ...(x.ap ? { ap: true } : {}),
    lessons: (byCourse[x.id] || []).sort((a, b) => a.sort - b.sort).map(lessonFrom),
  })).filter((x) => x.lessons.length);
  COURSES.splice(0, COURSES.length, ...courses);
  if (Array.isArray(c.decks) && c.decks.length) {
    const decks = c.decks.filter((d) => !d.hidden).sort((a, b) => a.sort - b.sort)
      .map((d) => ({ id: 'builtin-' + d.id, builtin: true, title: d.title, desc: d.desc, tag: d.tag, cards: d.cards }));
    BUILTIN_DECKS.splice(0, BUILTIN_DECKS.length, ...decks);
  }
  live.questions = (c.questions || []).filter((q) => !q.hidden);
  live.hidden = new Set((c.hidden || []).map((h) => h.id));
  live.version = c.version || '';
  live.loaded = true;
  listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  return true;
}

/** Go back to the built-in content (used if the server copy is unusable). */
export function useBuiltIn() {
  COURSES.splice(0, COURSES.length, ...BUILT_IN.courses);
  BUILTIN_DECKS.splice(0, BUILTIN_DECKS.length, ...BUILT_IN.decks);
}

function readCache() { try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch { return null; } }
function writeCache(c) { try { localStorage.setItem(CACHE, JSON.stringify(c)); } catch {} }

async function all(sb, table, order) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select('*').range(from, from + 999);
    for (const o of order) q = q.order(o);
    const { data, error } = await q;
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

/**
 * Apply the cached copy right away, then check the server for a newer one.
 * `client` is a Supabase client (or a promise of one). Resolves true if content changed.
 */
export async function initContent(client) {
  const cached = readCache();
  if (cached && !live.loaded) applyContent(cached);
  const sb = await client;
  if (!sb) return false;
  try {
    const { data: version, error } = await sb.rpc('content_version');
    if (error) throw error;
    if (cached && cached.version === version) return false;
    const [courses, lessons, decks, questions, hidden] = await Promise.all([
      all(sb, 'courses', ['sort', 'id']), all(sb, 'lessons', ['course_id', 'sort']), all(sb, 'decks', ['sort']),
      all(sb, 'questions', ['id']), all(sb, 'hidden_questions', ['id']),
    ]);
    const c = { version, courses, lessons, decks, questions, hidden };
    if (applyContent(c)) { writeCache(c); return true; }
  } catch (e) {
    console.warn('Could not load the latest content; using the saved copy.', e);
  }
  return false;
}

/** Force the next initContent to download everything (after an admin edit). */
export function invalidateContent() { try { localStorage.removeItem(CACHE); } catch {} live.loaded = false; }
