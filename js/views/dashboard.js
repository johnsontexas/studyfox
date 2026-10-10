import { icon } from '../icons.js';
import { esc, timeAgo, toast } from '../util.js';
import { store, today } from '../store.js';
import { taxonomy, SECTIONS, keysFor } from '../gen/index.js';
import { launchPractice } from './practice.js';
import { hasInProgress, discardInProgress } from './runner.js';
import { qotdWidget } from './home.js';
import { confirmBox } from '../tools.js';
import { COURSES } from '../content/courses.js';
import { BUILTIN_DECKS } from '../content/decks.js';
import { newsWidget } from './news.js';
import { cloudEnabled } from '../cloud.js';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

// The most recent course a lesson was finished in, with the next lesson to open.
function lastCourse(learned) {
  const [key] = Object.entries(learned).sort((a, b) => b[1] - a[1])[0] || [];
  const c = key && COURSES.find((x) => x.id === key.split('/')[0]);
  if (!c) return null;
  const done = c.lessons.filter((l) => learned[`${c.id}/${l.id}`]).length;
  const next = c.lessons.find((l) => !learned[`${c.id}/${l.id}`]);
  return { c, done, href: next ? `#/learn/${c.id}/${next.id}` : `#/learn/${c.id}` };
}

function recentSets(d) {
  const seen = (s) => d.setProgress[s.id]?.last || s.updated || 0;
  return [...d.sets, ...BUILTIN_DECKS.filter((s) => d.setProgress[s.id]?.last)].sort((a, b) => seen(b) - seen(a)).slice(0, 3);
}

const QUICK = [
  ['#/learn', 'book', 'Courses', 'Lessons for every class'],
  ['#/flashcards', 'cards', 'Flashcards', 'Make and study sets'],
  ['#/practice', 'target', 'SAT & ACT', 'Question bank'],
  ['#/exams', 'clipboard', 'Practice tests', 'Timed and scored'],
  ['#/speed', 'timer', 'Speed', 'Beat your best'],
];

const pct = (s) => (s && s.t ? Math.round((100 * s.c) / s.t) : null);
const barColor = (p) => (p == null ? 'none' : p >= 80 ? 'good' : p >= 60 ? 'mid' : 'low');

function sparkline(points, lo, hi) {
  if (points.length < 2) return '';
  const W = 260, H = 60;
  const xs = (i) => 6 + (i * (W - 12)) / (points.length - 1);
  const ys = (v) => H - 6 - ((v - lo) / (hi - lo || 1)) * (H - 12);
  return `<svg viewBox="0 0 ${W} ${H}" class="spark"><path d="${points.map((v, i) => `${i ? 'L' : 'M'}${xs(i)} ${ys(v)}`).join(' ')}"/>${points.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="3"/>`).join('')}</svg>`;
}

// Best score per section across every practice test (full, half, or section), plus the latest tests.
const SECTION_NAMES = { rw: 'Reading & Writing', math: 'Math', english: 'English', reading: 'Reading', science: 'Science' };
function testScoresHTML(d, focus) {
  const tests = d.attempts.filter((a) => a.kind === 'exam' && a.test === focus && a.sections);
  if (!tests.length) return `<p class="muted">Take a full or half practice test and your scores will be saved here.</p><a class="btn block" href="#/exams">Practice tests</a>`;
  const best = {};
  for (const t of tests) for (const [k, v] of Object.entries(t.sections)) best[k] = Math.max(best[k] || 0, v.score);
  return `<div class="best-secs">${Object.keys(SECTION_NAMES).filter((k) => best[k]).map((k) => `<div><b>${best[k]}</b><span>Best ${SECTION_NAMES[k]}</span></div>`).join('')}</div>
    <ul class="attempts">${tests.slice(0, 5).map((a) => `<li><a href="#/results/${a.id}"><span><b>${esc(a.title)}</b><span class="muted small">${timeAgo(a.date)} · ${Object.entries(a.sections).map(([k, v]) => `${SECTION_NAMES[k] || k} ${v.score}`).join(' · ')}</span></span><span class="score-pill">${a.headline}</span></a></li>`).join('')}</ul>
    <a class="btn block" href="#/exams">All practice tests</a>`;
}

import { classesBar } from '../studying.js';

export function dashboardView(root) {
  const d = store.data();
  const u = store.user();
  const focus = d.settings.focus || 'SAT';
  const tax = taxonomy(focus);
  const exams = d.attempts.filter((a) => a.kind === 'exam' && a.test === focus && a.headlineLabel?.match(/Total|Composite/));
  const latest = exams[0];
  const target = d.settings.target[focus];
  const totals = Object.values(d.stats).reduce((a, s) => ({ c: a.c + s.c, t: a.t + s.t }), { c: 0, t: 0 });
  const streak = store.streak();
  const days = d.settings.testDate ? Math.ceil((new Date(d.settings.testDate + 'T08:00') - Date.now()) / 86400000) : null;
  const mistakes = Object.values(d.mistakes).filter((m) => m.test === focus).length;
  const weak = Object.entries(d.skillStats)
    .filter(([k, s]) => k.startsWith(focus + '|') && s.t >= 3)
    .map(([k, s]) => ({ k, sec: k.split('|')[1], skill: k.split('|')[2], p: pct(s), t: s.t }))
    .sort((a, b) => a.p - b.p).slice(0, 4);
  const week = [...Array(7)].map((_, i) => { const dt = new Date(); dt.setDate(dt.getDate() - (6 - i)); const k = dt.toISOString().slice(0, 10); return { k, n: d.activity[k] || 0, lbl: dt.toLocaleDateString(undefined, { weekday: 'narrow' }) }; });
  const maxN = Math.max(10, ...week.map((w) => w.n));

  const lc = lastCourse(d.learned || {});
  const sets = recentSets(d);
  const todayN = d.activity[today()] || 0, goal = 20;

  root.innerHTML = `
  <div class="page dash">
    ${classesBar('dash')}
    <section class="dash-hero">
      <div>
        <p class="kicker">${greeting()}</p>
        <h1>${u ? esc(u.name.split(' ')[0]) : 'Welcome back'}</h1>
        <p>${streak ? `You're on a ${streak}-day streak. Keep it going.` : 'Answer a few questions today to start a streak.'}</p>
      </div>
      <div class="dash-ring" style="--p:${Math.min(100, Math.round((100 * todayN) / goal))}">
        <div><b>${todayN}</b><span>of ${goal} today</span></div>
      </div>
    </section>
    ${hasInProgress() ? `<div class="banner accent row between wrap gap"><span>${icon('pause')} You have a test in progress: <b>${esc(d.inProgress.title)}</b></span><span class="row gap"><a class="btn primary sm" href="#/test">Resume</a><button class="btn sm ghost" id="discard">Discard</button></span></div>` : ''}

    <nav class="quick" aria-label="Study tools">${QUICK.map(([href, ic, t, sub], i) => `<a href="${href}"><span class="q-ic tone-${i % 6}">${icon(ic)}</span><b>${t}</b><span>${sub}</span></a>`).join('')}</nav>

    ${u && !u.cloud && cloudEnabled ? `<div class="banner accent row between wrap gap"><span>${icon('upload')} Your progress is saved on this device only. Sign in again to back it up to the cloud and sync it everywhere.</span><button class="btn primary sm" id="moveCloud">Back up my progress</button></div>` : ''}

    <div id="newsSlot"></div>

    <h2 class="dash-title">Pick up where you left off</h2>
    <div class="resume">
      ${lc ? `<a class="card hover resume-card" href="${lc.href}"><span class="kpi-label">Course</span><b>${esc(lc.c.title)}</b><div class="bar thin"><i class="good" style="width:${(100 * lc.done) / lc.c.lessons.length}%"></i></div><span class="muted small">${lc.done} of ${lc.c.lessons.length} lessons done</span></a>`
        : `<a class="card hover resume-card empty" href="#/learn"><span class="kpi-label">Course</span><b>Start a course</b><span class="muted small">Pick any class. Lessons take about 10 minutes.</span></a>`}
      ${sets.map((st) => `<a class="card hover resume-card" href="#/flashcards/${encodeURIComponent(st.id)}"><span class="kpi-label">Flashcards</span><b>${esc(st.title)}</b><span class="muted small">${st.cards.length} terms</span></a>`).join('')
        || `<a class="card hover resume-card empty" href="#/flashcards/new"><span class="kpi-label">Flashcards</span><b>Make your first set</b><span class="muted small">Paste your notes and they turn into cards.</span></a>`}
    </div>

    <div class="row between wrap gap dash-title">
      <h2>${focus} prep</h2>
      <div class="seg" id="focusSeg"><button data-f="SAT" class="${focus === 'SAT' ? 'on' : ''}">SAT</button><button data-f="ACT" class="${focus === 'ACT' ? 'on' : ''}">ACT</button></div>
    </div>
    <div class="kpis">
      <div class="kpi card"><span class="kpi-label">Latest ${focus} score</span><b class="kpi-val">${latest ? latest.headline : '—'}</b><span class="muted small">${latest ? `Target ${target}` : `<a href="#/exams">Take a practice test</a>`}</span>${sparkline(exams.slice(0, 10).reverse().map((a) => a.headline), focus === 'SAT' ? 400 : 1, focus === 'SAT' ? 1600 : 36)}</div>
      <div class="kpi card"><span class="kpi-label">Accuracy</span><b class="kpi-val">${totals.t ? Math.round((100 * totals.c) / totals.t) + '%' : '—'}</b><span class="muted small">${totals.t.toLocaleString()} questions answered</span></div>
      <div class="kpi card"><span class="kpi-label">Streak</span><b class="kpi-val">${streak} ${icon('flame', { cls: 'flame' })}</b><div class="week">${week.map((w) => `<div class="wk"><i style="height:${Math.round((w.n / maxN) * 36) + 2}px" class="${w.n ? 'on' : ''}" title="${w.k}: ${w.n}"></i><span>${w.lbl}</span></div>`).join('')}</div></div>
      <div class="kpi card"><span class="kpi-label">Test day</span><b class="kpi-val">${days == null ? '—' : days >= 0 ? days : 'Done'}</b><span class="muted small">${days == null ? '<a href="#/settings">Set your test date</a>' : days >= 0 ? 'days to go' : 'Hope it went great!'}</span></div>
    </div>

    <div class="dash-grid">
      <div class="stack">
        <div class="card">
          <div class="row between"><h2 class="h3">Skill mastery</h2><a class="small" href="#/practice">Build a custom set →</a></div>
          ${Object.entries(tax).map(([sec, doms]) => `
            <h3 class="sub">${SECTIONS[focus][sec]}</h3>
            ${Object.keys(doms).map((dom) => {
              const p = pct(d.stats[`${focus}|${sec}|${dom}`]);
              const n = d.stats[`${focus}|${sec}|${dom}`]?.t || 0;
              return `<div class="mastery"><div class="m-top"><span>${esc(dom)}</span><span class="muted small">${p == null ? 'Not started' : `${p}% · ${n} answered`}</span></div><div class="bar"><i class="${barColor(p)}" style="width:${p ?? 0}%"></i></div><button class="btn xs" data-sec="${sec}" data-dom="${esc(dom)}">Practice</button></div>`;
            }).join('')}`).join('')}
        </div>
      </div>
      <div class="stack">
        <div class="card">
          <h2 class="h3">Focus next</h2>
          ${weak.length ? `<ul class="weak">${weak.map((w) => `<li><div><b>${esc(w.skill)}</b><span class="muted small">${w.p}% of ${w.t}</span></div><button class="btn xs" data-sec="${w.sec}" data-skill="${esc(w.skill)}">Drill</button></li>`).join('')}</ul>` : '<p class="muted">Answer a few questions and your weakest skills will show up here.</p>'}
          <a class="btn block ${mistakes ? 'primary' : ''}" href="#/review">Review mistakes (${mistakes})</a>
        </div>
        <div class="card">
          <h2 class="h3">Practice test scores</h2>
          ${testScoresHTML(d, focus)}
        </div>
        <div class="card">
          <h2 class="h3">Recent activity</h2>
          ${d.attempts.length ? `<ul class="attempts">${d.attempts.slice(0, 6).map((a) => `<li><a href="#/results/${a.id}"><span><b>${esc(a.title)}</b><span class="muted small">${timeAgo(a.date)}</span></span><span class="score-pill">${a.kind === 'exam' ? a.headline : `${a.correct}/${a.total}`}</span></a></li>`).join('')}</ul>` : '<p class="muted">No sessions yet.</p>'}
        </div>
        <div class="card"><h2 class="h3">Question of the day</h2><div id="qotd"></div></div>
      </div>
    </div>
  </div>`;

  qotdWidget(root.querySelector('#qotd'), focus);
  newsWidget(root.querySelector('#newsSlot'));
  root.querySelector('#moveCloud')?.addEventListener('click', () => { const em = u.email; store.logout(); location.hash = '#/login'; setTimeout(() => { const f = document.querySelector('[name=email]'); if (f) f.value = em; }, 50); });
  root.querySelector('#focusSeg').onclick = (e) => { const f = e.target.dataset.f; if (f) { d.settings.focus = f; store.save(); dashboardView(root); } };
  root.querySelector('#discard')?.addEventListener('click', async () => { if (await confirmBox('Discard your in-progress test? Your answers will be lost.', { ok: 'Discard', danger: true })) { discardInProgress(); dashboardView(root); } });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]');
    if (!b) return;
    const sec = b.dataset.sec;
    const keys = b.dataset.skill ? keysFor(focus, sec, null, [b.dataset.skill]) : keysFor(focus, sec, [b.dataset.dom]);
    if (!keys.length) return toast('No questions for that skill yet.');
    launchPractice({ test: focus, section: sec, keys, count: 10, difficulty: 'mixed', title: `${b.dataset.skill || b.dataset.dom} drill` });
  });
}
