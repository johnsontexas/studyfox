import { icon } from '../icons.js';
import { foxSVG } from '../avatar.js';
import { tex, esc, checkSpr } from '../util.js';
import { store } from '../store.js';
import { questionOfTheDay } from '../gen/index.js';
import { L, tagLine } from '../qview.js';
import { COURSES, SUBJECTS, lessonCount } from '../content/courses.js';
import { CREATOR } from '../config.js';
import { newsWidget } from './news.js';
import { db, cloudEnabled } from '../cloud.js';

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

// Courses shown in the hero list for visitors. Ids from js/content/courses.js; missing ids are skipped.
const POPULAR = [['apush', 'AP', 'Periods 1 to 9, with practice by unit'], ['sat-math-algebra', 'SAT', 'Algebra and advanced math'], ['ap-bio', 'AP', 'All 8 units, cell biology to ecology'], ['act-english', 'ACT', 'Punctuation, grammar and style'], ['ap-psych', 'AP', 'Every unit of the new course'], ['how-to-learn', 'Tip', 'Study smarter in any class']];

// A few students' foxes next to the student count (one fox when there's just one student).
const JOIN_FOXES = [
  { fur: 'orange', eyes: 'shiny', mouth: 'smile', shirt: 'oxford', color: 'sky', hat: 'none', glasses: 'round' },
  { fur: 'cream', eyes: 'open', mouth: 'grin', shirt: 'hoodie', color: 'sage', hat: 'beanie', glasses: 'none' },
  { fur: 'brown', eyes: 'wink', mouth: 'smile', shirt: 'polo', color: 'navy', hat: 'cap', glasses: 'none' },
];
const joinFoxes = (n) => (n === 1 ? JOIN_FOXES.slice(0, 1) : JOIN_FOXES).map((a) => foxSVG(a, { size: 40 })).join('');

// On the first load index.html already shows the hero (data-shell). Build the rest of the page around it
// instead of replacing it, so the browser doesn't count the headline as painted twice.
function fill(root, html) {
  const keep = root.dataset.shell === 'home' && root.querySelector('.hero2-copy');
  delete root.dataset.shell;
  const t = document.createElement('div');
  t.innerHTML = html;
  const fresh = t.querySelector('.hero2-copy'), norm = (e) => e.textContent.replace(/\s+/g, ' ').trim();
  if (!keep || !fresh || norm(keep) !== norm(fresh)) { root.innerHTML = html; return; }
  const hero = root.querySelector('section.hero2');
  root.querySelector('.hx-pop')?.replaceWith(t.querySelector('.hx-pop'));
  t.querySelector('section.hero2').remove();
  hero.after(...t.childNodes);
}

export function homeView(root) {
  const u = store.user();
  // Building the numbered bank generates thousands of questions, so the home page shows the counts saved
  // the last time another page built it (js/gen/bank.js), or the current totals on a first visit.
  let saved = null; try { saved = JSON.parse(localStorage.getItem('sf_bank_counts')); } catch {}
  const nSat = saved?.sat || 1754, nAct = saved?.act || 2312;
  let nStu = 0; try { nStu = +localStorage.getItem('sf_student_count') || 0; } catch {}
  const ap = COURSES.filter((c) => /^AP /.test(c.title));
  const apNames = [...new Set(ap.map((c) => c.title.replace(/^AP /, '').replace(/:.*$/, '').replace(/ and Composition$/, '').trim()))];
  const cta = u ? '<a class="btn primary lg" href="#/dashboard">Go to your dashboard</a>' : '<a class="btn primary lg" href="#/signup">Start studying, it\'s free</a>';
  const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const popular = POPULAR.filter(([id]) => byId[id]);
  const html = `
  <section class="hero2 hx">
    <div class="hero2-inner">
      <div class="hero2-copy">
        <h1 class="hx-h1">Study every<br>class. <span>Free.</span></h1>
        <p class="lead">Courses for ${COURSES.length} classes including every AP subject, flashcards, and a <span class="bank-n">${(nSat + nAct).toLocaleString()}</span>-question SAT and ACT bank. Built by a student, for students. No ads, ever.</p>
        <div class="row gap wrap">${cta}<a class="btn lg ghost" href="#/learn">Browse courses</a></div>
        <nav class="hx-links" aria-label="Explore StudyFox"><a href="/courses/">All courses</a><a href="/ap/">AP classes</a><a href="/sat-act/">SAT &amp; ACT prep</a><a href="/flashcards/">Flashcards</a><a href="/sitemap/">Site map</a></nav>
        <a class="hx-netlify" href="https://www.netlify.com" target="_blank" rel="noopener"><img src="https://www.netlify.com/assets/badges/netlify-badge-color-accent.svg" alt="Deploys by Netlify" width="86" height="38"></a>
        <p class="join-n"${nStu ? '' : ' hidden'}><span class="join-ic">${joinFoxes(nStu)}</span><span><b class="stu-n">${nStu.toLocaleString()}</b><span class="stu-l">${nStu === 1 ? 'student already studies here. Join them.' : 'students already study here. Join them.'}</span></span></p>
      </div>
      <div class="hx-pop">
        <p class="hx-k">Popular right now</p>
        ${popular.map(([id, tag, sub]) => `<a class="hx-row" href="#/learn/${id}"><span class="hx-tag hx-tag-${tag.toLowerCase()}">${icon(tag.toLowerCase())}<i>${tag}</i></span><span><b>${esc(byId[id].title.replace(/^AP /, ''))}</b><small>${sub}</small></span>${icon('arrow')}</a>`).join('')}
        <a class="hx-all" href="#/learn">All ${COURSES.length} courses ${icon('arrow')}</a>
      </div>
    </div>
  </section>

  <section class="page home2 hx">
    <p class="hx-facts">${COURSES.length} courses <i></i> ${lessonCount()} lessons <i></i> <span class="bank-n">${(nSat + nAct).toLocaleString()}</span> practice questions <i></i> 25+ languages <i></i> free for everyone</p>

    <div class="hx-head"><h2>Try today's question.</h2><a href="#/practice">Open the SAT &amp; ACT bank ${icon('arrow')}</a></div>
    <div class="hx-bento">
      <div class="hx-t hx-q"><p class="hx-k">SAT question of the day</p><div id="hxQotd" class="qotd"></div></div>
      <div class="hx-side"><a class="hx-t hx-acc" href="#/practice"><p class="hx-k">SAT &amp; ACT</p><div><h3>A numbered question bank</h3><p>Full timed tests and a mistake log that tracks what you miss.</p></div><div class="hx-nums"><span><b class="bank-sat">${nSat.toLocaleString()}</b>SAT questions</span><span><b class="bank-act">${nAct.toLocaleString()}</b>ACT questions</span></div></a>
      <a class="hx-t" href="#/learn"><p class="hx-k">Courses</p><div><span class="hx-ic">${icon('book')}</span><h3>Short lessons</h3><p>Worked examples and a quick check at the end of each one.</p></div></a>
      <a class="hx-t hx-cards" href="#/flashcards"><p class="hx-k">Flashcards</p><div class="hx-stack"><i></i><i></i><div><small>AP Biology · Unit 3</small>Where does the Krebs cycle happen?</div></div><p>Paste your notes and they become cards.</p></a>
      <a class="hx-t hx-ap" href="#/ap"><p class="hx-k">AP Practice</p><div><h3>Every AP class, by unit</h3><div class="hx-chips">${apNames.slice(0, 12).map((t) => `<span>${esc(t)}</span>`).join('')}${apNames.length > 12 ? `<span class="hx-more">+${apNames.length - 12} more</span>` : ''}</div></div></a></div>
    </div>

    <div class="hx-head"><h2>Pick your subject.</h2><a href="#/learn">See every course ${icon('arrow')}</a></div>
    <ul class="hx-subj">
      ${SUBJECTS.map((sub) => {
        const cs = COURSES.filter((c) => c.subject === sub);
        return `<li><a href="#/learn?s=${encodeURIComponent(sub)}"><span class="subj-ic tone-${Math.max(0, SUBJECTS.indexOf(sub)) % 10}">${icon(SUBJECT_ICON[sub] || 'book')}</span><span><b>${esc(sub)}</b><small>${tileList(cs)}</small></span><em>${cs.length}</em></a></li>`;
      }).join('')}
    </ul>

    <div id="newsSlot"></div>

    <div class="hx-head"><h2>How it works.</h2></div>
    <ol class="hx-steps">
      <li><b>Pick a class.</b><span>Choose a course or your test. Lessons are short enough to finish between classes.</span></li>
      <li><b>Practice.</b><span>Answer questions, drill flashcards, and take timed tests. Every answer is explained.</span></li>
      <li><b>Fix your mistakes.</b><span>StudyFox saves what you miss and turns it into a review set.</span></li>
    </ol>

    <a class="hx-note note-from" href="#/about">
      <img class="hx-face creator-pic" src="assets/creator-thumb.jpg" alt="${esc(CREATOR)}" width="96" height="96" loading="lazy">
      <div><p>I built StudyFox because good study material shouldn't depend on what you can pay. There are no ads and no premium tier, and there won't be.</p>
      <p class="hx-k">${esc(CREATOR)} · Founder</p><span class="hx-more">Read my story ${icon('arrow')}</span></div>
    </a>

    <div class="home2-bottom hx-faqwrap">
      <div class="faq">
        <h2>Questions</h2>
        <details><summary>Is it really free?</summary><p>Yes. Every course, flashcard set, practice question, and practice test is free. There are no ads, no premium tier, and no limits.</p></details>
        <details><summary>Do I need an account?</summary><p>A free account is needed to study, so your progress has somewhere to live. Sign in with Google, Apple, or Microsoft to sync across devices, or use email to keep it on this device.</p></details>
        <details><summary>What subjects are covered?</summary><p>Math from Algebra 1 through Calculus and Statistics, Biology, Chemistry, Physics, English, history, study skills, every AP course, and SAT and ACT prep.</p></details>
        <details><summary>Where do the SAT and ACT questions come from?</summary><p>Math and science questions are generated from templates that follow each official skill. Reading and writing questions come from an original, hand-written bank. Nothing is copied from official tests, and scores are estimates.</p></details>
        <details><summary>Where is my data stored?</summary><p>Every account, email, Google, or Apple, saves your progress to the cloud, so it syncs across your devices and the StudyFox app. You can also export a backup any time from Settings.</p></details>
      </div>
    </div>

    <div class="hx-final">
      <h2>Start<br>studying.</h2>
      ${u ? '<a class="btn lg" href="#/dashboard">Go to your dashboard</a>' : '<a class="btn lg" href="#/signup">Sign up free</a>'}
    </div>
  </section>`;
  fill(root, html);
  liveStudentCount(root);
  qotdWidget(root.querySelector('#hxQotd'), 'SAT');
  newsWidget(root.querySelector('#newsSlot'));
}

// "Join X other students": the total account count from Supabase (student_count RPC, anon-callable).
// Shows the last count saved on this device right away, then updates; stays hidden if it can't load.
async function liveStudentCount(root) {
  if (!cloudEnabled) return;
  try {
    const sb = await db();
    const { data, error } = await sb.rpc('student_count');
    if (error || !(data > 0)) return;
    try { localStorage.setItem('sf_student_count', String(data)); } catch {}
    const el = root.querySelector('.join-n');
    if (!el) return;
    el.querySelector('.stu-n').textContent = data.toLocaleString();
    el.querySelector('.join-ic').innerHTML = joinFoxes(data);
    el.querySelector('.stu-l').textContent = data === 1 ? 'student already studies here. Join them.' : 'students already study here. Join them.';
    el.hidden = false;
  } catch {}
}
