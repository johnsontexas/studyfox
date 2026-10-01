import { icon } from '../icons.js';
import { tex, esc, checkSpr } from '../util.js';
import { store } from '../store.js';
import { questionOfTheDay } from '../gen/index.js';
import { L, tagLine } from '../qview.js';
import { COURSES, SUBJECTS, lessonCount } from '../content/courses.js';
import { CREATOR, INSTAGRAM } from '../config.js';
import { bank } from '../gen/bank.js';

export function qotdWidget(root, test) {
  const q = questionOfTheDay(test);
  let done = false;
  const draw = (chosen) => {
    const right = chosen != null && (q.type === 'spr' ? checkSpr(chosen, q.accept) : chosen === q.answer);
    root.innerHTML = `
      ${tagLine(q)}
      ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}
      ${q.figure || ''}
      <div class="stem">${tex(q.stem)}</div>
      ${q.type === 'spr'
        ? `<div class="row gap"><input class="spr-input" id="qdIn" placeholder="Your answer" ${done ? 'disabled' : ''} value="${esc(chosen ?? '')}"><button class="btn primary" id="qdGo" ${done ? 'disabled' : ''}>Check</button></div>`
        : `<ol class="choices">${q.choices.map((c, i) => `<li class="${done && i === q.answer ? 'correct' : ''} ${done && i === chosen && !right ? 'wrong' : ''}"><button class="choice" data-c="${i}" ${done ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${tex(c)}</span></button></li>`).join('')}</ol>`}
      ${done ? `<div class="feedback ${right ? 'ok' : 'bad'}"><b>${right ? 'Nice work!' : 'Not quite.'}</b> ${q.type === 'spr' ? `Answer: ${tex('$' + q.answerDisplay + '$')}` : `Answer: ${L(q.answer)}`}<div class="expl">${tex(q.expl)}</div></div>` : ''}`;
  };
  draw(null);
  root.addEventListener('click', (e) => {
    if (done) return;
    const c = e.target.closest('[data-c]');
    if (c) { done = true; const i = +c.dataset.c; store.recordAnswer(q, i === q.answer); store.save(); draw(i); }
    if (e.target.id === 'qdGo') { const v = root.querySelector('#qdIn').value; if (!v) return; done = true; store.recordAnswer(q, checkSpr(v, q.accept)); store.save(); draw(v); }
  });
}

const SUBJECT_ICON = { Math: 'integral', Science: 'flask', English: 'book', History: 'landmark', 'Social Science': 'scale', 'Computer Science': 'code', Arts: 'palette', 'World Languages': 'globe', 'Study Skills': 'brain', 'SAT & ACT': 'target' };
// Subject rows list a few course names, then a count, so busy subjects stay readable.
const tileList = (cs) => cs.slice(0, 3).map((c) => esc(c.title)).join(', ') + (cs.length > 3 ? `, and ${cs.length - 3} more` : '');
const pad = (n) => String(n).padStart(2, '0');

export function homeView(root) {
  const u = store.user();
  const nSat = bank('SAT').length, nAct = bank('ACT').length;
  const tools = [
    ['cards', 'Flashcards', 'Make sets for any class, import them, share them. Study in four modes.', '#/flashcards'],
    ['calculator', 'Graphing calculator', 'The full Desmos calculator, right in your browser.', '#/calculator'],
    ['clipboard', 'Formula sheets', 'Algebra through trig, by topic, ready to print.', '#/formulas'],
    ['chart', 'Progress', 'Streaks, accuracy by skill, and a mistake log that turns into a review set.', '#/dashboard'],
    ['globe', 'Your language', 'Explanations translated into 25+ languages for English learners.', '#/settings'],
  ];
  root.innerHTML = `
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="kicker">StudyFox, by ${esc(CREATOR)}</p>
        <h1>Study for every class.<br><em class="scribble">Pay for none of it.</em></h1>
        <p class="lead">Short courses for ${COURSES.length} classes, including every AP subject. Flashcards. A numbered SAT and ACT question bank with worked answers. No ads, no paywall, no catch.</p>
        <div class="row gap wrap">
          ${u ? '<a class="btn primary lg" href="#/dashboard">Go to your dashboard</a>' : '<a class="btn primary lg" href="#/signup">Start studying, it\'s free</a>'}
          <a class="btn lg" href="#/learn">Browse courses</a>
        </div>
        <dl class="facts">
          <div><dt>${COURSES.length}</dt><dd>courses</dd></div>
          <div><dt>${lessonCount()}</dt><dd>lessons</dd></div>
          <div><dt>${(nSat + nAct).toLocaleString()}</dt><dd>SAT &amp; ACT questions</dd></div>
          <div><dt>$0</dt><dd>always</dd></div>
        </dl>
      </div>
      <div class="hero-card paper">
        <div class="paper-head"><span>Question of the day</span><span>${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
        <div id="qotd"></div>
      </div>
    </div>
  </section>

  <section class="page home">
    <div class="home-sec">
      <div class="sec-label"><span>01</span><h2>Pick a subject</h2><p class="muted">Every course is short lessons, worked examples, and a quick check at the end.</p></div>
      <ol class="index">
        ${SUBJECTS.map((sub, i) => {
          const cs = COURSES.filter((c) => c.subject === sub);
          return `<li><a href="#/learn?s=${encodeURIComponent(sub)}"><span class="idx-no">${pad(i + 1)}</span><span class="idx-ico">${icon(SUBJECT_ICON[sub] || 'book')}</span><span class="idx-main"><b>${esc(sub)}</b><span class="muted">${tileList(cs)}</span></span><span class="idx-count">${cs.length} course${cs.length === 1 ? '' : 's'}</span>${icon('arrow', { cls: 'idx-arrow' })}</a></li>`;
        }).join('')}
      </ol>
    </div>

    <div class="home-sec">
      <div class="sec-label"><span>02</span><h2>SAT &amp; ACT prep</h2><p class="muted">Built to feel like test day, so test day feels normal.</p></div>
      <div class="prep">
        <a class="prep-bank" href="#/practice">
          <span class="prep-num">${nSat.toLocaleString()}<small>SAT</small></span>
          <span class="prep-num">${nAct.toLocaleString()}<small>ACT</small></span>
          <b>Numbered question bank</b>
          <p>Every question has a number, so you can see the whole bank, track how many you've done, and come back to the ones you missed.</p>
          <span class="prep-go">Open the bank ${icon('right')}</span>
        </a>
        <div class="prep-side">
          <a class="prep-row" href="#/exams">${icon('timer')}<span><b>Full practice tests</b><span class="muted">Adaptive SAT modules and full ACT sections, scored.</span></span></a>
          <a class="prep-row" href="#/speed">${icon('flame')}<span><b>Speed practice</b><span class="muted">Timed sprints with personal bests to beat.</span></span></a>
          <a class="prep-row" href="#/review">${icon('target')}<span><b>Mistake log</b><span class="muted">Everything you miss, ready to retry.</span></span></a>
        </div>
      </div>
    </div>

    <div class="home-sec">
      <div class="sec-label"><span>03</span><h2>Tools for any class</h2></div>
      <ul class="toolrows">
        ${tools.map(([i, t, d, h]) => `<li><a href="${h}">${icon(i)}<b>${t}</b><span class="muted">${d}</span></a></li>`).join('')}
      </ul>
    </div>

    <div class="home-sec">
      <div class="sec-label"><span>04</span><h2>Questions</h2></div>
      <div class="faq">
        <details><summary>Is it really free?</summary><p>Yes. Every course, flashcard set, practice question, and practice test is free. There are no ads, no premium tier, and no limits.</p></details>
        <details><summary>Do I need an account?</summary><p>A free account is needed to study, so your progress has somewhere to live. Sign in with Google or Apple to sync across devices, or use email to keep it on this device.</p></details>
        <details><summary>What subjects are covered?</summary><p>Math from Algebra 1 through Calculus and Statistics, Biology, Chemistry, Physics, English, history, study skills, every AP course, and SAT and ACT prep.</p></details>
        <details><summary>Where do the SAT and ACT questions come from?</summary><p>Math and science questions are generated from templates that follow each official skill. Reading and writing questions come from an original, hand-written bank. Nothing is copied from official tests, and scores are estimates.</p></details>
        <details><summary>Where is my data stored?</summary><p>Email accounts are saved in this browser. Google and Apple accounts sync to the cloud. You can export a backup any time from Settings.</p></details>
      </div>
    </div>

    <div class="note-from">
      <span class="avatar" aria-hidden="true">${esc(CREATOR[0])}</span>
      <div>
        <p class="kicker">A note from the creator</p>
        <p>I built StudyFox because good study material shouldn't depend on what you can pay. If it helps you, or you want a course added, tell me.</p>
        <p class="sig">${esc(CREATOR)}</p>
        <a class="btn" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')}@${INSTAGRAM}</a>
      </div>
    </div>
  </section>`;
  qotdWidget(root.querySelector('#qotd'), store.data().settings.focus || 'SAT');
}
