import { icon } from '../icons.js';
import { tex, esc, checkSpr } from '../util.js';
import { store } from '../store.js';
import { questionOfTheDay } from '../gen/index.js';
import { L, tagLine } from '../qview.js';
import { COURSES, SUBJECTS, lessonCount } from '../content/courses.js';
import { CREATOR, INSTAGRAM } from '../config.js';
import { bank } from '../gen/bank.js';
import { newsWidget } from './news.js';

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

// Small decorative previews of real features, drawn with markup instead of screenshots.
const bankArt = () => {
  const pat = 'rrnrmrrnnrrmrnrrnrnmrrrnrrnmrnrr';
  return `<div class="art-grid" aria-hidden="true">${[...pat].map((c, i) => `<span class="${c === 'r' ? 'q-right' : c === 'm' ? 'q-miss' : ''}">${i + 201}</span>`).join('')}</div>`;
};
const barsArt = (vals) => `<div class="art-bars" aria-hidden="true">${vals.map((v, i) => `<i style="height:${v}%"${i === vals.length - 1 ? ' class="on"' : ''}></i>`).join('')}</div>`;

export function homeView(root) {
  const u = store.user();
  const nSat = bank('SAT').length, nAct = bank('ACT').length;
  const ap = COURSES.filter((c) => /^AP /.test(c.title));
  const cta = u ? '<a class="btn primary lg" href="#/dashboard">Go to your dashboard</a>' : '<a class="btn primary lg" href="#/signup">Start studying, it\'s free</a>';
  root.innerHTML = `
  <section class="hero2">
    <div class="hero2-inner">
      <div class="hero2-copy">
        <h1>Study for every class.<br><em class="scribble">Pay for none of it.</em></h1>
        <p class="lead">Courses for ${COURSES.length} classes including every AP subject, flashcards, practice tests, and a ${(nSat + nAct).toLocaleString()}-question SAT and ACT bank. All in one place.</p>
        <div class="row gap wrap">${cta}<a class="btn lg ghost" href="#/learn">Browse courses</a></div>
        <a class="free-pill" href="#/about">${icon('heart')}<span><b>100% free, for everyone.</b> No ads, no paywall, no catch.</span><span class="free-why">Why? ${icon('arrow')}</span></a>
        <dl class="facts">
          <div><dt>${COURSES.length}</dt><dd>courses</dd></div>
          <div><dt>${lessonCount()}</dt><dd>lessons</dd></div>
          <div><dt>${(nSat + nAct).toLocaleString()}</dt><dd>practice questions</dd></div>
          <div><dt>25+</dt><dd>languages</dd></div>
        </dl>
      </div>
      <div class="collage" aria-hidden="true">
        <div class="mock mock-card">
          <span class="tag">AP Biology</span>
          <b>What does the mitochondria do?</b>
          <span class="muted small">Tap to flip ${icon('swap')}</span>
          <div class="mock-foot"><span>12 / 40</span><span class="mock-dots"><i class="on"></i><i class="on"></i><i></i><i></i></span></div>
        </div>
        <div class="mock mock-streak">
          <div class="row gap">${icon('flame')}<span><b>7-day streak</b><span class="muted small">Keep it going</span></span></div>
          ${barsArt([35, 60, 45, 80, 55, 70, 95])}
        </div>
        <div class="mock mock-bank">
          <div class="mock-head"><b>SAT bank</b><span class="muted small">#201 to #232</span></div>
          ${bankArt()}
        </div>
        <div class="mock mock-score"><span class="muted small">Practice test</span><b>1450</b><span class="good-txt">+80 since last</span></div>
      </div>
    </div>
  </section>

  <div class="marquee" aria-hidden="true"><div>${[0, 1].map(() => COURSES.map((c) => `<span>${esc(c.title)}</span>`).join('')).join('')}</div></div>

  <section class="page home2">
    <div id="newsSlot"></div>
    <h2 class="sec-title">What's inside</h2>
    <div class="feature-pair">
      <a class="feat feat-courses" href="#/learn">
        <h3>${COURSES.length} courses, from Algebra 1 to every AP class</h3>
        <p>Short lessons, worked examples, and a quick check at the end of each one.</p>
        <p class="ap-list">${ap.map((c) => esc(c.title.replace(/^AP /, ''))).join(' · ')}</p>
        <span class="go">Browse courses →</span>
      </a>
      <a class="feat feat-bank" href="#/practice">
        <div class="big-nums"><span>${nSat.toLocaleString()}<small>SAT</small></span><span>${nAct.toLocaleString()}<small>ACT</small></span></div>
        <h3>A numbered question bank with worked answers</h3>
        <p>Track what you've done and come back to what you missed.</p>
        ${bankArt()}
        <span class="go">Open the bank →</span>
      </a>
    </div>
    <a class="feat feat-cards" href="#/flashcards/new">
      <div class="fc-copy">
        <h3>Make your own flashcards in seconds</h3>
        <p>Type a term and a definition, or paste a whole list from your notes and StudyFox splits it into cards. Then study four ways: flip cards, learn mode, a practice test, and a matching game.</p>
        <p>Share any set with a link. Classmates open it and save their own copy.</p>
        <span class="go">Make a set →</span>
      </div>
      <div class="fc-mock" aria-hidden="true">
        <div class="fc-title">AP Bio · Unit 2 <span>4 cards</span></div>
        <div class="fc-row"><span>Mitochondria</span><span>Makes ATP through cellular respiration</span></div>
        <div class="fc-row"><span>Ribosome</span><span>Builds proteins from mRNA</span></div>
        <div class="fc-row"><span>Golgi apparatus</span><span>Packages and ships proteins</span></div>
        <div class="fc-row new"><span>Lysosome</span><span class="caret">Breaks down waste|</span></div>
        <div class="fc-modes"><span>Flip</span><span>Learn</span><span>Test</span><span>Match</span></div>
      </div>
    </a>
    <ul class="feat-list">
      <li><a href="#/exams"><b>Full practice tests</b><span>Adaptive SAT modules and full ACT sections, timed and scored.</span></a></li>
      <li><a href="#/speed"><b>Speed practice</b><span>Timed sprints with personal bests to beat.</span></a></li>
      <li><a href="#/dashboard"><b>Progress and mistake log</b><span>Streaks, accuracy by skill, and every miss saved to retry.</span></a></li>
      <li><a href="#/calculator"><b>Graphing calculator</b><span>The full Desmos calculator, right in your browser.</span></a></li>
      <li><a href="#/formulas"><b>Formula sheets</b><span>Algebra through trig, ready to print.</span></a></li>
      <li><a href="#/settings"><b>Your language</b><span>Explanations in 25+ languages for English learners.</span></a></li>
    </ul>

    <h2 class="sec-title">How it works</h2>
    <ol class="steps">
      <li><b>Pick a class.</b> Choose a course or your test. Lessons are short enough to finish between classes.</li>
      <li><b>Practice.</b> Answer questions, drill flashcards, and take timed tests. Every answer is explained.</li>
      <li><b>Fix your mistakes.</b> StudyFox saves what you miss and turns it into a review set.</li>
    </ol>

    <h2 class="sec-title">Subjects</h2>
    <ul class="subj-tiles">
      ${SUBJECTS.map((sub) => {
        const cs = COURSES.filter((c) => c.subject === sub);
        return `<li><a href="#/learn?s=${encodeURIComponent(sub)}"><span class="subj-ic">${icon(SUBJECT_ICON[sub] || 'book')}</span><span><b>${esc(sub)}</b> <span class="sub-n">${cs.length}</span><span class="muted small">${tileList(cs)}</span></span></a></li>`;
      }).join('')}
    </ul>

    <div class="cta-band">
      <div><h2>Ready to start?</h2><p>It's free, forever. Make an account in under a minute.</p></div>
      ${u ? '<a class="btn lg" href="#/dashboard">Go to your dashboard</a>' : '<a class="btn lg" href="#/signup">Create your free account</a>'}
    </div>

    <div class="home2-bottom">
      <div class="faq">
        <h2>Questions</h2>
        <details><summary>Is it really free?</summary><p>Yes. Every course, flashcard set, practice question, and practice test is free. There are no ads, no premium tier, and no limits.</p></details>
        <details><summary>Do I need an account?</summary><p>A free account is needed to study, so your progress has somewhere to live. Sign in with Google, Apple, or Microsoft to sync across devices, or use email to keep it on this device.</p></details>
        <details><summary>What subjects are covered?</summary><p>Math from Algebra 1 through Calculus and Statistics, Biology, Chemistry, Physics, English, history, study skills, every AP course, and SAT and ACT prep.</p></details>
        <details><summary>Where do the SAT and ACT questions come from?</summary><p>Math and science questions are generated from templates that follow each official skill. Reading and writing questions come from an original, hand-written bank. Nothing is copied from official tests, and scores are estimates.</p></details>
        <details><summary>Where is my data stored?</summary><p>Every account, email, Google, or Apple, saves your progress to the cloud, so it syncs across your devices and the StudyFox app. You can also export a backup any time from Settings.</p></details>
      </div>
      <div class="note-from">
        <span class="avatar" aria-hidden="true">${esc(CREATOR[0])}</span>
        <div>
          <p class="kicker">A note from the creator</p>
          <p>I built StudyFox because good study material shouldn't depend on what you can pay. If it helps you, or you want a course added, tell me.</p>
          <p class="sig">${esc(CREATOR)}</p>
          <div class="row gap wrap"><a class="btn" href="https://johnsontexas.com" target="_blank" rel="noopener">johnsontexas.com</a><a class="btn" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')}@${INSTAGRAM}</a></div>
        </div>
      </div>
    </div>
  </section>`;
  newsWidget(root.querySelector('#newsSlot'));
}
