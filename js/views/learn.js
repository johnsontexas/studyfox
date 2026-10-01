// Free courses: course list, course outline, and lesson pages with quick checks.
import { icon } from '../icons.js';
import { $, esc, tex } from '../util.js';
import { store } from '../store.js';
import { COURSES, SUBJECTS, getCourse } from '../content/courses.js';
import { keysFor } from '../gen/index.js';
import { mountCalculator } from '../tools.js';
import { launchPractice } from './practice.js';
import { L } from '../qview.js';

const learned = () => store.data().learned;
const doneCount = (c) => c.lessons.filter((l) => learned()[`${c.id}/${l.id}`]).length;
const totalMins = (c) => c.lessons.reduce((s, l) => s + (l.mins || 0), 0);

function progressBar(c) {
  const n = doneCount(c);
  return `<div class="course-prog"><div class="bar thin"><i class="good" style="width:${(100 * n) / c.lessons.length}%"></i></div><span class="muted small">${n} of ${c.lessons.length} lessons done</span></div>`;
}

export const courseCard = (c, { progress = true } = {}) => `<a class="card hover course-card" href="#/learn/${c.id}">
  <div class="f-icon">${icon(c.icon)}</div>
  <span class="tag subtle">${esc(c.level)}</span>
  <h3>${esc(c.title)}</h3>
  <p class="muted small">${esc(c.blurb)}</p>
  <p class="small muted">${c.lessons.length} lessons · about ${totalMins(c)} min</p>
  ${progress ? progressBar(c) : ''}
</a>`;

// Searchable text for a course: title, blurb, level, and lesson titles.
const haystack = (c) => [c.title, c.blurb, c.level, c.subject, ...c.lessons.map((l) => l.title)].join(' ').toLowerCase();

export function learnHubView(root) {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const FILTERS = ['All', 'AP', ...SUBJECTS];
  let subject = FILTERS.includes(q.get('s')) ? q.get('s') : 'All';
  let query = '';
  root.innerHTML = `
    <div class="page">
      <h1>Free courses</h1>
      <p class="muted">Short lessons for school subjects, every major AP class, and test prep, each with examples and a quick check. Free, like everything on StudyFox.</p>
      <label class="course-search">${icon('search')}<input id="courseSearch" type="search" placeholder="Search courses and lessons, like &quot;APUSH&quot; or &quot;photosynthesis&quot;" aria-label="Search courses"></label>
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
      return cs.length ? `<h2 class="subject-title">${esc(s)}</h2><div class="course-grid">${cs.map((c) => courseCard(c)).join('')}</div>` : '';
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
    <div class="course-head">
      <div class="f-icon">${icon(c.icon)}</div>
      <div><h1>${esc(c.title)}</h1><p class="muted">${esc(c.blurb)}</p></div>
    </div>
    ${progressBar(c)}
    <a class="btn primary" href="#/learn/${c.id}/${next.id}">${doneCount(c) ? 'Continue' : 'Start the course'} ${icon('right')}</a>
    <ol class="lesson-list">
      ${c.lessons.map((l, i) => {
        const done = learned()[`${c.id}/${l.id}`];
        return `<li><a class="card hover lesson-row" href="#/learn/${c.id}/${l.id}">
          <span class="lnum ${done ? 'done' : ''}">${done ? icon('check') : i + 1}</span>
          <span class="grow"><b>${esc(l.title)}</b><span class="muted small">${l.mins} min${l.check ? ' · quick check' : ''}${l.desmos ? ' · interactive calculator' : ''}</span></span>
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
  let calc = null, alive = true;

  const checkHTML = (chosen) => {
    const k = l.check;
    const answered = chosen != null;
    return `<h2 class="h3">Quick check</h2>
      <div class="stem">${tex(k.q)}</div>
      <ol class="choices">${k.choices.map((ch, i) => `<li class="${answered && i === k.answer ? 'correct' : ''} ${answered && i === chosen && i !== k.answer ? 'wrong' : ''}"><button class="choice" data-c="${i}" ${answered ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${tex(ch)}</span></button></li>`).join('')}</ol>
      ${answered ? `<div class="feedback ${chosen === k.answer ? 'ok' : 'bad'}"><b>${chosen === k.answer ? 'Correct.' : 'Not quite.'}</b><div class="expl">${tex(k.why)}</div></div>` : ''}`;
  };

  root.innerHTML = `
  <div class="page narrow-wide lesson">
    <div class="row between wrap gap">
      <a class="small" href="#/learn/${c.id}">${icon('left')} ${esc(c.title)}</a>
      <span class="muted small">Lesson ${idx + 1} of ${c.lessons.length} · ${l.mins} min</span>
    </div>
    <h1>${esc(l.title)}</h1>
    <article class="card lesson-body">${tex(l.body)}</article>
    ${l.desmos ? `<div class="card"><div class="row between wrap gap"><h2 class="h3">Try it in Desmos</h2><button class="btn sm ghost" id="resetCalc">Reset examples</button></div><div class="calc-full lesson-calc" id="lessonCalc"><div class="calc-loading">Loading Desmos…</div></div></div>` : ''}
    ${l.check ? `<div class="card" id="check">${checkHTML(null)}</div>` : ''}
    ${l.practice ? `<div class="card practice-cta row between wrap gap"><div><b>Practice this skill</b><p class="muted small">${esc(l.practice.skills ? l.practice.skills.join(', ') : 'Mixed questions from this section')} · ${l.practice.test}</p></div><button class="btn" id="practiceBtn">Start 10 questions</button></div>` : ''}
    <div class="lesson-nav">
      ${prev ? `<a class="btn ghost" href="#/learn/${c.id}/${prev.id}">${icon('left')} Previous</a>` : '<span></span>'}
      <button class="btn primary" id="doneBtn">${learned()[key] ? `${icon('check')} Completed` : 'Mark complete'}${next ? ' and continue' : ''}</button>
    </div>
  </div>`;

  async function loadCalc() {
    const host = $('#lessonCalc', root);
    calc?.destroy?.();
    host.innerHTML = '';
    try {
      const cl = await mountCalculator(host, 'graphing');
      if (!alive) return cl.destroy?.();
      calc = cl;
      l.desmos.forEach((e, i) => calc.setExpression(typeof e === 'string' ? { id: 'e' + i, latex: e } : { id: 'e' + i, ...e }));
      if (l.desmosBounds) calc.setMathBounds(l.desmosBounds);
    } catch (e) { host.innerHTML = `<div class="calc-loading">${esc(e.message)}</div>`; }
  }
  if (l.desmos) { loadCalc(); $('#resetCalc', root).addEventListener('click', loadCalc); }

  root.addEventListener('click', (e) => {
    const ch = e.target.closest('#check [data-c]');
    if (ch) $('#check', root).innerHTML = checkHTML(+ch.dataset.c);
    if (e.target.closest('#practiceBtn')) {
      const p = l.practice;
      launchPractice({ test: p.test, section: p.section, keys: keysFor(p.test, p.section, null, p.skills), count: 10, title: l.title });
    }
    if (e.target.closest('#doneBtn')) {
      learned()[key] = Date.now();
      store.save();
      location.hash = next ? `#/learn/${c.id}/${next.id}` : `#/learn/${c.id}`;
    }
  });
  return () => { alive = false; calc?.destroy?.(); };
}
