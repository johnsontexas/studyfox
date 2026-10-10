import { $, esc, timeAgo, newSeed, toast } from '../util.js';
import { store } from '../store.js';
import { EXAMS, createExam, numberedTests } from '../exams.js';
import { startRun, hasInProgress } from './runner.js';
import { modal, confirmBox } from '../tools.js';

export function examsView(root) {
  const d = store.data();
  const card = (key) => {
    const e = EXAMS[key];
    const mods = e.modules.filter((m) => !m.break);
    const q = mods.reduce((s, m) => s + m.count, 0);
    const past = d.attempts.filter((a) => a.examKey === key);
    return `<div class="exam card">
      <div class="exam-top"><span class="tag">${e.test}</span>${past.length ? `<span class="muted small">Best: <b>${Math.max(...past.map((a) => a.headline))}</b></span>` : ''}</div>
      <h3>${e.title}</h3>
      <p class="muted small">${e.blurb}</p>
      <ul class="mods">${mods.map((m) => `<li><span>${esc(m.name.replace(/^Section \d, /, ''))}</span><span class="muted">${m.count}q · ${m.minutes}m</span></li>`).join('')}</ul>
      <div class="muted small">${q} questions total</div>
      <button class="btn primary block" data-start="${key}">Start</button>
    </div>`;
  };
  const past = d.attempts.filter((a) => a.kind === 'exam');
  // Numbered full-length tests: each is a fixed test, marked once you've taken it.
  const numbered = (test) => `<div class="num-tests">${numberedTests(test).map((t) => {
    const done = past.filter((a) => a.examKey === t.key && a.seed === t.seed);
    const best = done.length ? Math.max(...done.map((a) => a.headline)) : null;
    return `<button class="num-test${best != null ? ' taken' : ''}" data-start="${t.key}" data-seed="${t.seed}"><span class="nt-n">${t.n}</span><span class="nt-l">Practice Test ${t.n}</span><span class="nt-s">${best != null ? `Best ${best}` : 'Not taken'}</span></button>`;
  }).join('')}</div>`;
  root.innerHTML = `
  <div class="page">
    <h1>Practice tests</h1>
    <p class="muted">Numbered tests are the same for everyone; the others are freshly generated each time. All run in a test-day interface with a timer, Desmos calculator, reference sheet, answer eliminator, and mark-for-review. SAT tests are adaptive: how you do on Module 1 sets the difficulty of Module 2.</p>
    <div class="row gap wrap tcode"><span class="muted small">Have a test code from a friend?</span><input id="code" placeholder="e.g. SAT-FULL-48213" class="sm-input"><button class="btn sm" id="codeGo">Take that test</button></div>

    <h2 class="section-title left">SAT</h2>
    <h3 class="exam-sub">Full-length practice tests</h3>
    <p class="muted small">Same length, timing, and adaptive format as test day: 98 questions, 2 hours 14 minutes, scored 400 to 1600.</p>
    ${numbered('SAT')}
    <h3 class="exam-sub">Half tests: one subject</h3>
    <div class="exam-grid">${['sat-half-math', 'sat-half-rw'].map(card).join('')}</div>
    <h3 class="exam-sub">More SAT tests</h3>
    <div class="exam-grid">${['sat-full', 'sat-half', 'sat-math', 'sat-rw'].map(card).join('')}</div>

    <h2 class="section-title left">ACT</h2>
    <h3 class="exam-sub">Full-length practice tests</h3>
    <p class="muted small">English, Math, Reading, and Science at real length and timing, scored 1 to 36.</p>
    ${numbered('ACT')}
    <h3 class="exam-sub">Half tests: one subject</h3>
    <div class="exam-grid">${['act-half-math', 'act-half-english', 'act-half-reading', 'act-half-science'].map(card).join('')}</div>
    <h3 class="exam-sub">More ACT tests</h3>
    <div class="exam-grid">${['act-full', 'act-half', 'act-english', 'act-math', 'act-reading', 'act-science'].map(card).join('')}</div>

    <h2 class="section-title left">Your past tests</h2>
    ${past.length ? `<div class="card"><table class="list"><thead><tr><th>Test</th><th>Date</th><th>Score</th><th>Code</th></tr></thead><tbody>${past.map((a) => `<tr><td><a href="#/results/${a.id}">${esc(a.title)}</a></td><td>${timeAgo(a.date)}</td><td><b>${a.headline}</b></td><td class="muted small mono">${codeFor(a.examKey, a.seed)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Your completed tests will appear here.</p>'}
  </div>`;

  async function begin(key, seed = newSeed()) {
    if (hasInProgress() && !(await confirmBox('You already have a test in progress. Starting a new one will discard it.', { ok: 'Start new test', danger: true }))) return;
    const e = EXAMS[key];
    const m = modal(`
      <p>You're about to start <b>${esc(createExam(key, seed).title)}</b>.</p>
      <ul class="bullets">
        <li>Each ${e.test === 'SAT' ? 'module' : 'section'} is timed. When time runs out, you move on automatically.</li>
        ${e.test === 'SAT' ? '<li>Module 2 adapts to how you did on Module 1.</li>' : ''}
        <li>Use <b>More → Save and exit</b> to pause. You can resume from your dashboard.</li>
        <li>Test code: <b class="mono">${codeFor(key, seed)}</b>. Share it so friends can take the exact same test.</li>
      </ul>
      <div class="row end gap"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="begin">Begin test</button></div>`, { title: 'Ready?' });
    $('#begin', m.el).onclick = () => { m.close(); startRun({ ...createExam(key, seed), feedback: false }); };
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-start]');
    if (b) begin(b.dataset.start, b.dataset.seed ? +b.dataset.seed : undefined);
    if (e.target.id === 'codeGo') {
      const parsed = parseCode($('#code', root).value);
      if (!parsed) return toast('That test code is not valid.', 'bad');
      begin(parsed.key, parsed.seed);
    }
  });
}

export const codeFor = (key, seed) => (key && seed != null ? `${key.toUpperCase()}-${seed}` : '—');
function parseCode(s) {
  const m = String(s).trim().toUpperCase().match(/^([A-Z]+(?:-[A-Z]+)+)-(\d+)$/);
  if (!m) return null;
  const key = m[1].toLowerCase();
  return EXAMS[key] ? { key, seed: +m[2] } : null;
}
