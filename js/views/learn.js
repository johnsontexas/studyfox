// Free courses: course list, course outline, and lesson pages with quick checks.
import { icon } from '../icons.js';
import { $, esc, tex } from '../util.js';
import { store } from '../store.js';
import { COURSES, SUBJECTS, getCourse } from '../content/courses.js';
import { keysFor } from '../gen/index.js';
import { mountLessonPlayer } from './lesson-player.js';
import { launchPractice } from './practice.js';
import { classesBar, myStudying } from '../studying.js';

const learned = () => store.data().learned;
const doneCount = (c) => c.lessons.filter((l) => learned()[`${c.id}/${l.id}`]).length;
const totalMins = (c) => c.lessons.reduce((s, l) => s + (l.mins || 0), 0);

function progressBar(c) {
  const n = doneCount(c);
  return `<div class="course-prog"><div class="bar thin"><i class="good" style="width:${(100 * n) / c.lessons.length}%"></i></div><span class="muted small">${n} of ${c.lessons.length} lessons done</span></div>`;
}

// Each subject gets its own accent so the catalog doesn't read as one wall of identical cards.
const SUBJECT_ICON = { Math: 'integral', Science: 'flask', English: 'book', History: 'landmark', 'Social Science': 'users', 'Computer Science': 'code', Arts: 'palette', 'World Languages': 'globe', 'Study Skills': 'brain', 'SAT & ACT': 'target' };
const tone = (s) => `tone-${Math.max(0, SUBJECTS.indexOf(s)) % 6}`;

export const courseCard = (c, { progress = true } = {}) => {
  const n = doneCount(c);
  return `<a class="course-card ${tone(c.subject)}${n ? ' started' : ''}" href="#/learn/${c.id}">
  <div class="cc-art" aria-hidden="true"><span class="cc-art-big">${icon(c.icon)}</span><span class="cc-icon">${icon(c.icon)}</span><span class="cc-level">${esc(c.level)}</span></div>
  <h3>${esc(c.title)}</h3>
  <p class="cc-blurb">${esc(c.blurb)}</p>
  <ol class="cc-peek">${c.lessons.slice(0, 3).map((l) => `<li>${esc(l.title)}</li>`).join('')}${c.lessons.length > 3 ? `<li class="more">+${c.lessons.length - 3} more</li>` : ''}</ol>
  <div class="cc-foot"><span>${c.lessons.length} lessons</span><span>${Math.round(totalMins(c) / 6) / 10 >= 1 ? `${Math.round(totalMins(c) / 6) / 10} hr` : `${totalMins(c)} min`}</span>
    ${progress && n ? `<span class="cc-done">${n === c.lessons.length ? `${icon('check')} Done` : `${Math.round((100 * n) / c.lessons.length)}%`}</span>` : `<span class="cc-go">${icon('right')}</span>`}</div>
  ${progress && n ? `<i class="cc-bar" style="--w:${(100 * n) / c.lessons.length}%"></i>` : ''}
</a>`;
};

// Searchable text for a course: title, blurb, level, and lesson titles.
const haystack = (c) => [c.title, c.blurb, c.level, c.subject, ...c.lessons.map((l) => l.title)].join(' ').toLowerCase();

export function learnHubView(root) {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const FILTERS = ['All', 'AP', ...SUBJECTS];
  let subject = FILTERS.includes(q.get('s')) ? q.get('s') : 'All';
  let query = '';
  const lessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const mine = myStudying().map(getCourse).filter(Boolean);
  const started = COURSES.filter((c) => doneCount(c) && doneCount(c) < c.lessons.length).slice(0, 3);
  root.innerHTML = `
    <div class="courses-head"><div class="page">
      <div class="ch-text">
        <h1>Courses</h1>
        <p>Short lessons for school, every major AP class, and the SAT and ACT. Each one has worked examples and a quick check at the end.</p>
        <label class="course-search">${icon('search')}<input id="courseSearch" type="search" placeholder="Search courses and lessons, like &quot;APUSH&quot; or &quot;photosynthesis&quot;" aria-label="Search courses"></label>
      </div>
      <dl class="ch-stats"><div><dt>${COURSES.length}</dt><dd>courses</dd></div><div><dt>${lessons}</dt><dd>lessons</dd></div><div><dt>${COURSES.filter((c) => c.ap).length}</dt><dd>AP classes</dd></div></dl>
    </div></div>
    <div class="page courses-body">
      ${classesBar('learn')}
      ${mine.length ? `<section class="cc-continue"><h2 class="cc-sec">Your classes</h2><div class="course-grid">${mine.map((c) => courseCard(c)).join('')}</div></section>` : ''}
      ${started.length ? `<section class="cc-continue"><h2 class="cc-sec">Keep going</h2><div class="course-grid">${started.map((c) => courseCard(c)).join('')}</div></section>` : ''}
      <div class="subject-filter" role="tablist">${FILTERS.map((s) => `<button class="pill" data-s="${esc(s)}" role="tab">${s === 'AP' ? 'AP courses' : esc(s)}</button>`).join('')}</div>
      <div id="courseList"></div>
    </div>`;
  const draw = () => {
    root.querySelectorAll('[data-s]').forEach((b) => { const on = b.dataset.s === subject; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const match = (c) => (subject !== 'AP' || c.ap) && words.every((w) => haystack(c).includes(w));
    const list = subject === 'All' || subject === 'AP' ? SUBJECTS : [subject];
    const html = list.map((s) => {
      const cs = COURSES.filter((c) => c.subject === s && match(c));
      return cs.length ? `<section class="subject-block ${tone(s)}"><h2 class="subject-title"><span class="st-icon">${icon(SUBJECT_ICON[s] || 'book')}</span>${esc(s)}<span class="st-count">${cs.length}</span></h2><div class="course-grid">${cs.map((c) => courseCard(c)).join('')}</div></section>` : '';
    }).join('');
    $('#courseList', root).innerHTML = html || `<p class="muted empty-note">No courses match "${esc(query)}". Try a different word, or pick All.</p>`;
  };
  draw();
  $('#courseSearch', root).addEventListener('input', (e) => { query = e.target.value; draw(); });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-s]');
    if (!b) return;
    subject = b.dataset.s;
    history.replaceState(null, '', subject === 'All' ? '#/learn' : `#/learn?s=${encodeURIComponent(subject)}`);
    draw();
  });
}

export function courseView(root, { course }) {
  const c = getCourse(course);
  if (!c) { location.hash = '#/learn'; return; }
  const next = c.lessons.find((l) => !learned()[`${c.id}/${l.id}`]) || c.lessons[0];
  root.innerHTML = `
  <div class="page narrow-wide">
    <a class="small" href="#/learn">${icon('left')} All courses</a>
    <div class="course-head ${tone(c.subject)}">
      <div class="cc-art course-art" aria-hidden="true"><span class="cc-art-big">${icon(c.icon)}</span><span class="cc-icon">${icon(c.icon)}</span></div>
      <div><h1>${esc(c.title)}</h1><p class="muted">${esc(c.blurb)}</p></div>
    </div>
    ${progressBar(c)}
    <a class="btn primary" href="#/learn/${c.id}/${next.id}">${doneCount(c) ? 'Continue' : 'Start the course'} ${icon('right')}</a>
    <ol class="lesson-list">
      ${c.lessons.map((l, i) => {
        const done = learned()[`${c.id}/${l.id}`];
        return `<li><a class="card hover lesson-row" href="#/learn/${c.id}/${l.id}">
          <span class="lnum ${done ? 'done' : ''}">${done ? icon('check') : i + 1}</span>
          <span class="grow"><b>${esc(l.title)}</b><span class="muted small">${l.mins} min${l.blocks ? ' · interactive' : l.check ? ' · quick check' : ''}${l.desmos ? ' · graphing' : ''}</span></span>
          ${icon('right')}
        </a></li>`;
      }).join('')}
    </ol>
  </div>`;
}

export function lessonView(root, { course, lesson }) {
  const c = getCourse(course);
  const idx = c ? c.lessons.findIndex((l) => l.id === lesson) : -1;
  if (idx < 0) { location.hash = c ? `#/learn/${c.id}` : '#/learn'; return; }
  const l = c.lessons[idx], prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
  const key = `${c.id}/${l.id}`;
  const interactive = Array.isArray(l.blocks) && l.blocks.length;
  const practice = l.practice ? `<div class="card practice-cta row between wrap gap"><div><b>Practice this skill</b><p class="muted small">${esc(l.practice.skills ? l.practice.skills.join(', ') : 'Mixed questions from this section')} · ${l.practice.test}</p></div><button class="btn" data-practice>Start 10 questions</button></div>` : '';
  const finishHTML = `<div class="row gap center wrap">${next ? `<a class="btn primary" href="#/learn/${c.id}/${next.id}">Next: ${esc(next.title)} ${icon('right')}</a>` : `<a class="btn primary" href="#/learn/${c.id}">Back to ${esc(c.title)}</a>`}</div>${practice}`;

  root.innerHTML = `
  <div class="page narrow-wide lesson">
    <div class="row between wrap gap">
      <a class="small" href="#/learn/${c.id}">${icon('left')} ${esc(c.title)}</a>
      <span class="muted small">Lesson ${idx + 1} of ${c.lessons.length} · ${l.mins} min${interactive ? ' · interactive' : ''}</span>
    </div>
    <h1>${esc(l.title)}</h1>
    <div id="player"></div>
    <div class="lesson-nav">
      ${prev ? `<a class="btn ghost" href="#/learn/${c.id}/${prev.id}">${icon('left')} Previous lesson</a>` : '<span></span>'}
      ${next ? `<a class="btn ghost" href="#/learn/${c.id}/${next.id}">Skip ahead ${icon('right')}</a>` : '<span></span>'}
    </div>
  </div>`;

  const stop = mountLessonPlayer($('#player', root), {
    lesson: l, key, finishHTML,
    onFinish: (score) => {
      learned()[key] = Date.now();
      (store.data().lessonState ||= {})[key] = { screen: 0, ts: Date.now(), score };
      store.save();
    },
  });
  const onClick = (e) => {
    if (!e.target.closest('[data-practice]')) return;
    const p = l.practice;
    launchPractice({ test: p.test, section: p.section, keys: keysFor(p.test, p.section, null, p.skills), count: 10, title: l.title });
  };
  root.addEventListener('click', onClick);
  return () => { stop(); root.removeEventListener('click', onClick); };
}
