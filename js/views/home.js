import { icon } from '../icons.js';
import { tex, esc, checkSpr } from '../util.js';
import { store } from '../store.js';
import { questionOfTheDay } from '../gen/index.js';
import { L, tagLine } from '../qview.js';
import { COURSES, SUBJECTS, lessonCount } from '../content/courses.js';
import { CREATOR } from '../config.js';

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
// Subject tiles list a few course names, then a count, so busy subjects stay readable.
const tileList = (cs) => cs.slice(0, 3).map((c) => esc(c.title)).join(' · ') + (cs.length > 3 ? ` · and ${cs.length - 3} more` : '');

export function homeView(root) {
  const u = store.user();
  const feature = ([i, t, d, h]) => `<a class="feature card hover" href="${h}"><div class="f-icon">${icon(i)}</div><h3>${t}</h3><p>${d}</p></a>`;
  root.innerHTML = `
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">Free for every student · no ads · no paywalls</span>
        <h1>Free study material for <span class="hl-word">every class</span>.</h1>
        <p class="lead">Short courses for math, science, English, and history, plus every major AP class, from AP U.S. History to AP Chemistry. Add flashcards and a full SAT and ACT prep toolkit. Everything is free, with no account required.</p>
        <div class="row gap wrap">
          <a class="btn primary lg" href="#/learn">Browse free courses</a>
          <a class="btn lg" href="#/flashcards">Study flashcards</a>
        </div>
        <p class="muted small">${u ? `Welcome back, ${esc(u.name)}. <a href="#/dashboard">Go to your dashboard →</a>` : 'No account needed to start. <a href="#/signup">Create a free account</a> to save your progress.'}</p>
      </div>
      <div class="hero-card card">
        <div class="row between"><b>SAT question of the day</b><span class="muted small">${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
        <div id="qotd"></div>
      </div>
    </div>
  </section>

  <section class="page">
    <div class="stats-strip">
      <div><b>${COURSES.length}</b><span>free courses</span></div>
      <div><b>${lessonCount()}</b><span>lessons</span></div>
      <div><b>∞</b><span>practice questions</span></div>
      <div><b>$0</b><span>forever</span></div>
    </div>

    <h2 class="section-title">Pick a subject</h2>
    <div class="subject-tiles">
      ${SUBJECTS.map((sub) => {
        const cs = COURSES.filter((c) => c.subject === sub);
        return `<a class="card hover subject-tile" href="#/learn?s=${encodeURIComponent(sub)}"><div class="f-icon">${icon(SUBJECT_ICON[sub] || 'book')}</div><div><b>${esc(sub)}</b><span class="muted">${tileList(cs)}</span></div></a>`;
      }).join('')}
    </div>

    <h2 class="section-title">Study tools for any class</h2>
    <div class="feature-grid">
      ${[
        ['brain', 'Courses', 'Bite-size lessons with worked examples and a quick check at the end of each one.', '#/learn'],
        ['cards', 'Flashcards', 'Make sets for any class, or import and share them. Study with Flashcards, Learn, Test, and Match modes.', '#/flashcards'],
        ['calculator', 'Graphing calculator', 'A full Desmos graphing and scientific calculator, free in your browser.', '#/calculator'],
        ['clipboard', 'Formula sheets', 'Algebra, geometry, trig, and more, organized by topic and printable.', '#/formulas'],
        ['chart', 'Progress tracking', 'Course progress, streaks, accuracy by skill, and a mistake log that turns into a review set.', '#/dashboard'],
        ['globe', 'Help in your language', 'English learners can see explanations translated into 25+ languages.', '#/settings'],
      ].map(feature).join('')}
    </div>

    <h2 class="section-title">SAT and ACT prep, included</h2>
    <div class="feature-grid">
      ${[
        ['target', 'Question bank', 'Unlimited questions by test, section, skill, and difficulty, with step-by-step explanations.', '#/practice'],
        ['timer', 'Adaptive practice tests', 'Full-length and half-length SAT tests with adaptive Module 2, plus full ACT tests.', '#/exams'],
        ['flame', 'Speed practice', 'Timed sprints that build test-day pace, with personal bests to beat.', '#/speed'],
      ].map(feature).join('')}
    </div>

    <h2 class="section-title">How it works</h2>
    <div class="steps">
      <div class="step"><span>1</span><h3>Learn the concept</h3><p>Take a short lesson in the subject you're studying, with examples you can follow step by step.</p></div>
      <div class="step"><span>2</span><h3>Check yourself</h3><p>Answer the quick check at the end of each lesson, and practice until it clicks.</p></div>
      <div class="step"><span>3</span><h3>Remember it</h3><p>Turn what you learned into flashcards and review them over the next few days, before the test.</p></div>
    </div>

    <h2 class="section-title">Questions</h2>
    <div class="faq">
      <details><summary>Is it really free?</summary><p>Yes. Every course, flashcard set, practice question, and practice test is free. There are no ads, no premium tier, and no limits. The goal is simply for every student to have good study material.</p></details>
      <details><summary>What subjects are covered?</summary><p>Math (Algebra 1, Geometry, Algebra 2 and Precalculus, Calculus, and Statistics), Science (Biology, Chemistry, and Physics), English (essay writing and literary analysis), History, study skills, and SAT and ACT prep. More courses are on the way.</p></details>
      <details><summary>Who made StudyFox?</summary><p>StudyFox was created by ${CREATOR} to give every student free, high-quality study material for school and for the SAT and ACT.</p></details>
      <details><summary>Can I use it for my classes, not just test prep?</summary><p>Yes. The courses follow what's taught in middle and high school classes, and you can make flashcard sets for any class you're taking.</p></details>
      <details><summary>Where do the SAT and ACT questions come from?</summary><p>Math and science questions are generated by algorithms that follow the structure of each official skill, with new numbers every time. Reading and writing questions come from an original, hand-written bank. Nothing is copied from official tests, and scores are estimates.</p></details>
      <details><summary>Where is my data stored?</summary><p>Guest and email accounts are saved in this browser on this device. Sign in with Google or Apple to sync your progress across devices. You can also export a backup file from Settings.</p></details>
    </div>

    <h2 class="section-title">About</h2>
    <div class="card creator">
      <span class="avatar" aria-hidden="true">${CREATOR[0]}</span>
      <div><b>Created by ${CREATOR}</b><p>Good study material shouldn't depend on what you can pay. StudyFox puts free courses, flashcards, and practice in one place so any student can learn their classes and prepare for the SAT and ACT.</p></div>
    </div>
  </section>`;
  qotdWidget(root.querySelector('#qotd'), store.data().settings.focus || 'SAT');
}
