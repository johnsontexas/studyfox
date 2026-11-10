// AP question bank: multiple-choice practice for every AP class, organized by unit and concept.
// Questions live in Supabase (table ap_questions) and are cached per course in localStorage.
import { icon, sticker } from '../icons.js';
import { $, esc, tex, toast, DIFF_LABEL } from '../util.js';
import { store } from '../store.js';
import { db, cloudEnabled } from '../cloud.js';
import { COURSES, SUBJECTS } from '../content/courses.js';
import { L, choiceFeedbackHTML, whatWentWrongHTML } from '../qview.js';
import { choiceNotes } from '../explain.js';
import { setting } from '../content/settings.js';
import { classesBar, myStudying } from '../studying.js';
import { apCounts as bankCounts, apQuestions as bankQuestions, apUnits, apDone, pickAP, recordAP, apStats } from '../content/ap-bank.js';

const client = () => (cloudEnabled ? db() : null);
export const apCounts = () => bankCounts(client());
export const apQuestions = (cid) => bankQuestions(client(), cid);
export { pickAP, recordAP };

// Plain-text question fields: escape, write \$ for a literal dollar sign, and $...$ for math.
const unesc = (x) => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
export const rich = (s) => tex(esc(s).replace(/\\\$/g, '&#36;').replace(/\$([^$]+)\$/g, (m, x) => '$' + unesc(x) + '$')).replace(/\n/g, '<br>');

const apData = apDone;
const unitOrder = apUnits;

const apCourses = () => COURSES.filter((c) => c.ap);
const tone = (s) => `tone-${Math.max(0, SUBJECTS.indexOf(s)) % 6}`;

export function apHubView(root) {
  root.innerHTML = `<div class="page">${classesBar('ap')}<div class="page-head"><span class="eyebrow">${icon('target')} AP practice</span><h1>AP question bank</h1>
    <p class="muted">Exam-style multiple choice for every AP class, sorted by unit and concept. Every question has an explanation.</p>
    <a class="btn sm" href="#/formulas?s=calc">${icon('integral')} AP formula sheets</a></div>
    <div id="apGrid" class="ap-grid"><p class="muted">Loading the question bank...</p></div></div>`;
  apCounts().then((cnt) => {
    const el = $('#apGrid', root);
    if (!el) return;
    const done = apData();
    const doneBy = {};
    for (const v of Object.values(done)) if (v.cid) doneBy[v.cid] = (doneBy[v.cid] || 0) + 1;
    const list = apCourses().map((c) => ({ c, n: Object.values(cnt[c.id] || {}).reduce((a, b) => a + b, 0), units: Object.keys(cnt[c.id] || {}).length })).filter((x) => x.n);
    const total = list.reduce((a, x) => a + x.n, 0);
    const mineIds = myStudying();
    const card = ({ c, n, units }) => {
        const d = doneBy[c.id] || 0, unitNames = Object.keys(cnt[c.id] || {}).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        return `<a class="course-card ${tone(c.subject)}${d ? ' started' : ''}" href="#/ap/${c.id}">
        <div class="cc-art" aria-hidden="true"><span class="cc-art-big">${icon(c.icon || 'book')}</span><span class="cc-icon">${icon(c.icon || 'book')}</span><span class="cc-level">AP exam</span></div>
        <h3>${esc(c.title)}</h3>
        <ol class="cc-peek">${unitNames.slice(0, 3).map((u) => `<li>${esc(u)}</li>`).join('')}${unitNames.length > 3 ? `<li class="more">+${unitNames.length - 3} more</li>` : ''}</ol>
        <div class="cc-foot"><span>${n} questions</span><span>${units} units</span>
          ${d ? `<span class="cc-done">${d >= n ? `${icon('check')} Done` : `${Math.round((100 * d) / n)}%`}</span>` : `<span class="cc-go">${icon('right')}</span>`}</div>
        ${d ? `<i class="cc-bar" style="--w:${Math.min(100, (100 * d) / n)}%"></i>` : ''}
      </a>`;
    };
    el.outerHTML = list.length ? `<p class="muted small">${total.toLocaleString()} questions across ${list.length} AP classes.</p>
      ${list.some((x) => mineIds.includes(x.c.id)) ? `<h2 class="cc-sec">Your AP classes</h2><div class="course-grid">${list.filter((x) => mineIds.includes(x.c.id)).map(card).join('')}</div><h2 class="cc-sec">All AP classes</h2>` : ''}
      <div class="course-grid">${list.filter((x) => !mineIds.includes(x.c.id)).map(card).join('')}</div>`
      : `<div class="card empty-note"><p class="muted">The AP question bank couldn't load. Check your connection and try again.</p></div>`;
  });
}

export function apCourseView(main, { course: cid }) {
  // Own container: #main is reused across routes, so listeners on it would pile up.
  const root = main.appendChild(document.createElement('div'));
  const course = apCourses().find((c) => c.id === cid);
  if (!course) { root.innerHTML = `<div class="page narrow"><h1>Course not found</h1><a class="btn" href="#/ap">All AP classes</a></div>`; return; }
  const st = { count: 10, mode: 'smart', open: null, qs: [], session: null };
  root.innerHTML = `<div class="page narrow-wide" id="apRoot"><p class="muted">Loading questions...</p></div>`;
  const host = () => $('#apRoot', root);

  const stats = apStats;

  function drawIndex() {
    const units = unitOrder(course, st.qs);
    const all = stats(st.qs);
    host().innerHTML = `
      <a class="small" href="#/ap">${icon('left')} All AP classes</a>
      <div class="row between wrap gap"><div><h1>${esc(course.title)}</h1><p class="muted">${all.n} questions in ${units.length} units. Pick a unit, or narrow it to one concept.</p></div>
        <a class="btn ghost sm" href="#/learn/${course.id}">${icon('book')} Lessons</a></div>
      <div class="bank-progress">
        <div><span class="bp-num">${all.did}</span><span class="bp-of"> / ${all.n}</span><span class="bp-label">questions done</span></div>
        <div><span class="bp-num">${all.right}</span><span class="bp-label">correct</span></div>
        <div><span class="bp-num">${all.did - all.right}</span><span class="bp-label">missed, worth a retry</span></div>
        <div class="bp-bar"><div class="bar"><i style="width:${all.n ? (100 * all.did) / all.n : 0}%"></i></div></div>
      </div>
      <div class="card row between wrap gap ap-opts">
        <div class="row gap wrap"><b>Questions</b><div class="seg sm">${[10, 20, 40].map((n) => `<button data-count="${n}" class="${st.count === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
        <div class="row gap wrap"><b>Which</b><div class="seg sm">${[['smart', 'New first'], ['new', 'Only new'], ['missed', 'Only missed']].map(([k, t]) => `<button data-mode="${k}" class="${st.mode === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
        <button class="btn primary" data-start="*">${icon('shuffle')} Mixed from all units</button>
      </div>
      <div class="stack ap-units">${units.map((u, i) => {
        const pool = st.qs.filter((q) => q.unit === u);
        const s = stats(pool);
        const concepts = [...new Set(pool.map((q) => q.concept).filter(Boolean))];
        const open = st.open === u;
        return `<div class="card ap-unit${open ? ' open' : ''}">
          <div class="row between gap wrap"><button class="link ap-unit-name" data-open="${i}"><b>${esc(u)}</b><span class="muted small"> ${s.did}/${s.n} done${s.did ? `, ${Math.round((100 * s.right) / s.did)}% right` : ''}</span></button>
          <button class="btn sm primary" data-start="${i}">Practice</button></div>
          <div class="bar thin"><i class="good" style="width:${s.n ? (100 * s.did) / s.n : 0}%"></i></div>
          ${open && concepts.length ? `<div class="ap-concepts">${concepts.map((c) => { const cs = stats(pool.filter((q) => q.concept === c)); return `<button class="chip" data-concept="${i}|${esc(c)}">${esc(c)} <span class="muted">${cs.did}/${cs.n}</span></button>`; }).join('')}</div>`
            : concepts.length ? `<button class="link sm" data-open="${i}">${concepts.length} concepts ${icon('down')}</button>` : ''}
        </div>`;
      }).join('')}</div>`;
    host()._units = units;
  }

  function start(pool, title) {
    const qs = pickAP(pool, st.count, st.mode);
    if (!qs.length) return toast(st.mode === 'missed' ? 'Nothing missed here yet.' : st.mode === 'new' ? "You've done every question here. Try New first." : 'No questions here yet.');
    st.session = { title, qs: qs.map((q) => ({ ...q })), i: 0, picked: null, right: 0, log: [] };
    drawQ();
  }

  // Solution steps, if the question has them.
  const stepsHTML = (q) => Array.isArray(q.steps) && q.steps.length ? `<details class="q-steps"><summary>${icon('clipboard')} Step-by-step solution</summary><ol>${q.steps.map((x) => `<li>${rich(x)}</li>`).join('')}</ol></details>` : '';

  function drawQ() {
    const s = st.session, q = s.qs[s.i], shown = s.picked != null;
    const fb = setting('question_feedback');
    const retry = s.firstWrong != null && !shown;
    host().innerHTML = `
      <div class="row between wrap gap"><button class="link sm" id="apQuit">${icon('left')} ${esc(course.title)}</button><span class="muted small">${esc(s.title)}</span></div>
      <div class="ap-prog"><div class="bar thin"><i style="width:${(100 * s.i) / s.qs.length}%"></i></div><span class="small muted">Question ${s.i + 1} of ${s.qs.length} · ${s.right} right</span></div>
      <div class="card ap-q">
        <div class="row gap wrap small muted"><span class="tag subtle">${esc(q.unit)}</span>${q.concept ? `<span class="tag subtle">${esc(q.concept)}</span>` : ''}<span>${DIFF_LABEL[q.difficulty] || ''}</span></div>
        <div class="stem">${rich(q.stem)}</div>
        <ol class="choices">${q.choices.map((c, i) => `<li class="${shown ? (i === q.answer ? 'correct' : i === s.picked || i === s.firstWrong ? 'wrong' : '') : i === s.firstWrong ? 'wrong' : ''}"><button class="choice" data-pick="${i}" ${shown || i === s.firstWrong ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${rich(c)}</span></button></li>`).join('')}</ol>
        ${retry ? `<div class="lb-try">${icon('x')} <b>Not quite.</b> ${choiceNotes(q)[s.firstWrong].why ? rich(choiceNotes(q)[s.firstWrong].why) : 'Rule that one out and try once more.'}</div>` : ''}
        ${shown ? `<div class="banner ${s.picked === q.answer ? 'good' : 'bad'}">${s.picked === q.answer ? `${icon('check')} Correct${s.firstWrong != null ? ' on the second try' : ''}` : `${icon('x')} The answer is ${L(q.answer)}`}</div>
          ${choiceFeedbackHTML(q, s.picked === q.answer ? s.firstWrong : s.picked, rich).replace('<details class="choice-why">', '<details class="choice-why" open>')}
          ${q.expl ? `<div class="expl"><b>Explanation.</b> ${rich(q.expl)}</div>` : ''}
          ${stepsHTML(q)}
          ${s.picked !== q.answer || s.firstWrong != null ? whatWentWrongHTML('ap:' + q.id) : ''}
          <div class="row end"><button class="btn primary" id="apNext">${s.i + 1 < s.qs.length ? 'Next question' : 'See results'} ${icon('right')}</button></div>`
          : `<div class="row between wrap gap">${q.hint && fb.show_hint_button ? (s.hint ? `<div class="lb-hint grow">${icon('brain')} <b>Hint.</b> ${rich(q.hint)}</div>` : `<button class="btn ghost sm" id="apHint">${icon('brain')} Hint</button>`) : '<span></span>'}<p class="muted small">Keys A to ${L(q.choices.length - 1)} work too.</p></div>`}
      </div>`;
    $('#apNext', root)?.focus();
  }

  function pick(i) {
    const s = st.session, q = s.qs[s.i];
    if (s.picked != null || i === s.firstWrong) return;
    const ok = i === q.answer;
    // One retry (question_feedback.second_try): the first miss is what counts for progress.
    if (!ok && s.firstWrong == null && setting('question_feedback').second_try) {
      s.firstWrong = i;
      recordAP(cid, q, false); store.save();
      s.log.push({ q, a: i, ok: false });
      return drawQ();
    }
    s.picked = i;
    if (s.firstWrong != null) return drawQ();
    if (ok) s.right++;
    s.log.push({ q, a: i, ok });
    recordAP(cid, q, ok);
    store.save();
    drawQ();
  }

  function next() {
    const s = st.session;
    s.i++; s.picked = null; s.firstWrong = null; s.hint = false;
    if (s.i < s.qs.length) return drawQ();
    const missed = s.log.filter((x) => !x.ok);
    const pctRight = Math.round((100 * s.right) / s.qs.length);
    host().innerHTML = `<div class="card center stack">
        <div class="big-emoji">${sticker(pctRight >= 80 ? 'trophy' : 'target')}</div>
        <h1>${s.right} of ${s.qs.length} right</h1>
        <p class="muted">${esc(s.title)} · ${pctRight}%</p>
        <div class="row gap center wrap"><button class="btn primary" id="apAgain">Another set</button><button class="btn" id="apBack">Back to units</button></div>
      </div>
      ${missed.length ? `<h2 class="h3">Review what you missed</h2><div class="stack">${missed.map(({ q, a }) => `<details class="card"><summary><b>${esc(q.concept || q.unit)}</b></summary>
        <div class="stem">${rich(q.stem)}</div><ol class="choices static">${q.choices.map((c, i) => `<li class="${i === q.answer ? 'correct' : i === a ? 'wrong' : ''}"><span class="letter">${L(i)}</span> ${rich(c)}</li>`).join('')}</ol>
        ${choiceFeedbackHTML(q, a, rich, { open: true })}
        <div class="expl"><b>Explanation.</b> ${rich(q.expl)}</div>${stepsHTML(q)}${whatWentWrongHTML('ap:' + q.id)}</details>`).join('')}</div>` : ''}`;
    st.lastPool = st.lastPool || null;
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('#apHint')) { st.session.hint = true; return drawQ(); }
    const t = e.target.closest('[data-count],[data-mode],[data-start],[data-open],[data-concept],[data-pick],#apNext,#apQuit,#apAgain,#apBack');
    if (!t) return;
    const units = host()?._units || [];
    if (t.dataset.count) { st.count = +t.dataset.count; return drawIndex(); }
    if (t.dataset.mode) { st.mode = t.dataset.mode; return drawIndex(); }
    if (t.dataset.open) { const u = units[+t.dataset.open]; st.open = st.open === u ? null : u; return drawIndex(); }
    if (t.dataset.start) {
      const all = t.dataset.start === '*';
      const u = units[+t.dataset.start];
      st.lastPool = all ? st.qs : st.qs.filter((q) => q.unit === u); st.lastTitle = all ? 'Mixed review' : u;
      return start(st.lastPool, st.lastTitle);
    }
    if (t.dataset.concept) {
      const [ui, c] = [t.dataset.concept.slice(0, t.dataset.concept.indexOf('|')), t.dataset.concept.slice(t.dataset.concept.indexOf('|') + 1)];
      const u = units[+ui];
      st.lastPool = st.qs.filter((q) => q.unit === u && q.concept === c); st.lastTitle = c;
      return start(st.lastPool, c);
    }
    if (t.dataset.pick) return pick(+t.dataset.pick);
    if (t.id === 'apNext') return next();
    if (t.id === 'apAgain') return start(st.lastPool, st.lastTitle);
    if (t.id === 'apQuit' || t.id === 'apBack') { st.session = null; return drawIndex(); }
  });
  const onKey = (e) => {
    if (!st.session || e.target.matches('input,textarea') || e.metaKey || e.ctrlKey) return;
    const s = st.session;
    if (s.picked == null) { const i = 'abcde'.indexOf(e.key.toLowerCase()); if (i >= 0 && i < s.qs[s.i].choices.length) pick(i); }
    else if (e.key === 'Enter' && e.target.id !== 'apNext') next();
  };
  addEventListener('keydown', onKey);

  apQuestions(cid).then((qs) => {
    st.qs = qs;
    if (!host()) return;
    if (!qs.length) host().innerHTML = `<a class="small" href="#/ap">${icon('left')} All AP classes</a><h1>${esc(course.title)}</h1><div class="card empty-note"><p class="muted">No questions for this class yet.</p></div>`;
    else drawIndex();
  });
  return () => removeEventListener('keydown', onKey);
}
