// Bluebook-style test runner used for both practice sets and full practice tests.
import { icon } from '../icons.js';
import { $, $$, tex, esc, fmtTime, toast, uid, checkSpr, parseSpr } from '../util.js';
import { store } from '../store.js';
import { regen } from '../gen/index.js';
import { bankNo } from '../gen/bank.js';
import { ensureModule, scoreExam, isCorrect } from '../exams.js';
import { toggleCalculator, destroyCalculator, openReference, modal } from '../tools.js';
import { L, diffPill } from '../qview.js';
import { explainHelp, questionHelp } from '../i18n.js';

let run = null;
let timer = null;
let lastSave = 0;

// ---------- persistence ----------
function serialize(r) {
  return { ...r, modules: r.modules.map((m) => (m.break ? m : { ...m, qids: m.questions ? m.questions.map((q) => q.id) : null, questions: undefined, hl: undefined })) };
}
function hydrate(o) {
  o.modules.forEach((m) => { if (!m.break && m.qids) m.questions = m.qids.map(regen).filter(Boolean); });
  return o;
}
function persist(force) {
  if (!run) return;
  if (!force && Date.now() - lastSave < 4000) return;
  lastSave = Date.now();
  store.data().inProgress = serialize(run);
  store.save();
}
export function hasInProgress() { return !!store.data().inProgress; }
export function discardInProgress() { store.data().inProgress = null; store.save(); }

export function startRun(r) {
  run = r;
  run.id ||= uid();
  run.startedAt ||= Date.now();
  run.current ||= 0; run.qi ||= 0; run.view = 'q';
  if (run.kind === 'exam') ensureModule(run, 0);
  persist(true);
  location.hash = '#/test';
}

// ---------- view ----------
export function runnerView(root) {
  if (!run) {
    const saved = store.data().inProgress;
    if (saved) run = hydrate(JSON.parse(JSON.stringify(saved)));
  }
  if (!run) {
    root.innerHTML = `<div class="page narrow center-page"><h1>No test in progress</h1><p class="muted">Start a practice set or a full-length test.</p><div class="row gap center"><a class="btn primary" href="#/practice">Practice questions</a><a class="btn" href="#/exams">Practice tests</a></div></div>`;
    return;
  }
  document.body.classList.add('testing');
  const ui = { hideTimer: false, elimMode: false, hlMode: false, navOpen: false };
  root.innerHTML = '<div class="tr" id="tr"></div>';
  const tr = $('#tr', root);

  const mod = () => run.modules[run.current];
  const curQ = () => mod().questions[run.qi];

  function tick() {
    const m = mod();
    if (!m || m.break || m.done) return;
    if (m.timeLeft != null) {
      m.timeLeft--;
      if (m.timeLeft === 300) toast('5 minutes remaining in this module.');
      if (m.timeLeft <= 0) { m.timeLeft = 0; toast("Time's up for this module."); finishModule(); return; }
    } else m.elapsed = (m.elapsed || 0) + 1;
    const t = $('.tr-timer', tr);
    if (t) { t.textContent = fmtTime(m.timeLeft ?? m.elapsed); t.classList.toggle('warn', m.timeLeft != null && m.timeLeft <= 300); }
    persist();
  }
  if (timer) clearInterval(timer);
  timer = setInterval(() => { if (run.view !== 'break') tick(); else breakTick(); }, 1000);

  function render() {
    const m = mod();
    if (m.break) return renderBreak(m);
    if (run.view === 'review') return renderCheck(m);
    renderQ(m);
  }

  // ---------- question screen ----------
  function renderQ(m) {
    const q = curQ();
    const n = m.questions.length;
    const isMath = q.section === 'math';
    const split = !!q.passage;
    const chosen = m.answers[run.qi];
    const marked = m.marked.includes(run.qi);
    const elim = m.elim[run.qi] || [];
    const checked = run.feedback && m.checked?.[run.qi];
    const passageHtml = (m.hl && m.hl[run.qi]) || tex(q.passage);
    let answerArea;
    if (q.type === 'spr') {
      const val = chosen ?? '';
      answerArea = `<div class="spr"><input id="spr" class="spr-input" inputmode="text" autocomplete="off" maxlength="6" placeholder="Answer" value="${esc(val)}" ${checked ? 'disabled' : ''}><div class="spr-preview">Answer preview: <b id="sprPrev">${val && !isNaN(parseSpr(val)) ? esc(val) : '—'}</b></div></div>`;
    } else {
      answerArea = `<ol class="choices ${ui.elimMode ? 'elim-on' : ''}">${q.choices.map((c, i) => {
        const cls = [i === chosen ? 'sel' : '', elim.includes(i) ? 'struck' : '', checked && i === q.answer ? 'correct' : '', checked && i === chosen && i !== q.answer ? 'wrong' : ''].join(' ');
        return `<li class="${cls}"><button class="choice" data-choice="${i}" ${checked ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${tex(c)}</span></button>${ui.elimMode ? `<button class="strike" data-strike="${i}" title="${elim.includes(i) ? 'Undo' : 'Cross out'} ${L(i)}">${elim.includes(i) ? 'Undo' : `<s>${L(i)}</s>`}</button>` : ''}</li>`;
      }).join('')}</ol>`;
    }
    const feedback = run.feedback ? (checked
      ? `<div class="feedback ${isCorrect(q, chosen) ? 'ok' : 'bad'}"><b>${isCorrect(q, chosen) ? 'Correct!' : 'Not quite.'}</b> ${q.type === 'spr' ? `Correct answer: ${tex(`$${q.answerDisplay}$`)}. ` : `The answer is ${L(q.answer)}. `}<div class="expl">${tex(q.expl)}</div>${explainHelp(q.expl)}</div>`
      : `<div class="row gap"><button class="btn primary" data-act="check" ${chosen == null || chosen === '' ? 'disabled' : ''}>Check answer</button><button class="btn ghost" data-act="reveal">Show explanation</button></div>`) : '';
    const sprHelp = q.type === 'spr' ? `<details class="spr-help"><summary>How to enter your answer</summary><ul><li>Enter one correct answer, even if more than one is possible.</li><li>Positive answers: up to 5 characters; negative answers: up to 6 (including the sign).</li><li>Fractions like <b>3/4</b> or decimals like <b>.75</b> are both fine. Don't enter symbols like %, commas, or $.</li></ul></details>` : '';

    tr.innerHTML = `
      <header class="tr-top">
        <div class="tr-left"><button class="icon-btn tr-home" data-act="home" title="Home" aria-label="Go home">${icon('home')}</button><div><div class="tr-title">${esc(m.name)}</div><button class="link sm" data-act="directions">Directions ${icon('down')}</button></div></div>
        <div class="tr-mid">${ui.hideTimer ? `<span class="tr-timer hidden-timer">${icon('timer')}</span>` : `<span class="tr-timer ${m.timeLeft != null && m.timeLeft <= 300 ? 'warn' : ''}">${fmtTime(m.timeLeft ?? m.elapsed ?? 0)}</span>`}<button class="pill sm" data-act="timer">${ui.hideTimer ? 'Show' : 'Hide'}</button></div>
        <div class="tr-right">
          ${split ? `<button class="tool ${ui.hlMode ? 'on' : ''}" data-act="hl" title="Highlight text in the passage"><span>${icon('highlighter')}</span>Highlight</button>` : ''}
          ${isMath ? `<button class="tool" data-act="calc"><span>${icon('calculator')}</span>Calculator</button><button class="tool" data-act="ref"><span>${icon('ruler')}</span>Reference</button>` : ''}
          <button class="tool" data-act="more"><span>⋯</span>More</button>
        </div>
      </header>
      <div class="tr-rule"></div>
      <main class="tr-body ${split ? 'split' : 'single'}">
        ${split ? `<section class="tr-passage ${ui.hlMode ? 'hl-mode' : ''}" id="passage">${passageHtml}</section><div class="tr-divider"></div>` : ''}
        <section class="tr-q">
          <div class="tr-qhead">
            <span class="qnum">${run.qi + 1}</span>
            <button class="markrev ${marked ? 'on' : ''}" data-act="mark">${icon('bookmark', { fill: marked })} Mark for Review</button>
            <span class="grow"></span>
            ${bankNo(q.id) ? `<span class="qno" title="Question bank number">${q.test} #${bankNo(q.id)}</span>` : ''}
            ${run.showMeta ? diffPill(q.difficulty) : ''}
            ${q.type === 'mc' ? `<button class="abc ${ui.elimMode ? 'on' : ''}" data-act="elim" title="Answer eliminator"><s>ABC</s></button>` : ''}
          </div>
          ${run.showMeta ? `<div class="qtags tight"><span class="tag">${esc(q.domain)}</span><span class="tag subtle">${esc(q.skill)}</span></div>` : ''}
          ${!split ? q.figure || '' : ''}
          <div class="stem">${tex(q.stem)}</div>
          ${split && q.figure ? q.figure : ''}
          ${sprHelp}
          ${answerArea}
          ${run.feedback ? questionHelp(q) : ''}
          ${feedback}
          <div id="revealed"></div>
        </section>
      </main>
      <footer class="tr-bottom">
        <div class="tr-user">${esc(store.user()?.name || 'Guest')}</div>
        <button class="tr-navbtn" data-act="nav">Question ${run.qi + 1} of ${n} <span class="caret">${icon('up')}</span></button>
        <div class="tr-actions">
          ${run.qi > 0 ? '<button class="btn" data-act="back">Back</button>' : ''}
          <button class="btn primary" data-act="next">${run.qi === n - 1 ? 'Next' : 'Next'}</button>
        </div>
        ${ui.navOpen ? navPopup(m) : ''}
      </footer>`;
    const spr = $('#spr', tr);
    if (spr) {
      spr.addEventListener('input', () => {
        const v = spr.value.replace(/[^0-9./-]/g, '');
        if (v !== spr.value) spr.value = v;
        m.answers[run.qi] = v;
        $('#sprPrev', tr).textContent = v && !isNaN(parseSpr(v)) ? v : '—';
        const cb = $('[data-act="check"]', tr); if (cb) cb.disabled = !v;
        persist();
      });
      if (!checked) spr.focus();
    }
    const pass = $('#passage', tr);
    if (pass) pass.addEventListener('mouseup', () => ui.hlMode && highlight(pass, m));
  }

  function navPopup(m) {
    return `<div class="navpop" role="dialog">
      <div class="navpop-head"><b>${esc(m.name)}</b><button class="icon-btn" data-act="nav" aria-label="Close">${icon('x')}</button></div>
      <div class="legend"><span><i class="lgd cur"></i>Current</span><span><i class="lgd un"></i>Unanswered</span><span><i class="lgd mk"></i>For Review</span></div>
      <div class="navgrid">${m.questions.map((q, i) => {
        const a = m.answers[i];
        return `<button class="nb ${a != null && a !== '' ? 'ans' : ''} ${m.marked.includes(i) ? 'mk' : ''} ${i === run.qi ? 'cur' : ''}" data-go="${i}">${i + 1}</button>`;
      }).join('')}</div>
      <div class="center"><button class="btn" data-act="reviewpage">Go to Review Page</button></div>
    </div>`;
  }

  function highlight(pass, m) {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!pass.contains(range.commonAncestorContainer)) return;
    const mark = document.createElement('mark');
    mark.className = 'hl';
    try { mark.appendChild(range.extractContents()); range.insertNode(mark); } catch { return; }
    sel.removeAllRanges();
    (m.hl ||= {})[run.qi] = pass.innerHTML;
  }

  // ---------- review / check-your-work page ----------
  function renderCheck(m) {
    const unanswered = m.questions.filter((_, i) => m.answers[i] == null || m.answers[i] === '').length;
    const last = run.current === lastModuleIndex();
    tr.innerHTML = `
      <header class="tr-top"><div class="tr-left"><button class="icon-btn tr-home" data-act="home" title="Home" aria-label="Go home">${icon('home')}</button><div class="tr-title">${esc(m.name)}</div></div>
      <div class="tr-mid"><span class="tr-timer">${fmtTime(m.timeLeft ?? m.elapsed ?? 0)}</span></div><div class="tr-right"></div></header>
      <div class="tr-rule"></div>
      <main class="tr-body single"><section class="check">
        <h2>Check Your Work</h2>
        <p class="muted">On test day, you won't be able to move on to the next module until time expires. For these practice questions, you can click <b>${last ? 'Submit' : 'Next'}</b> when you're ready to move on.</p>
        ${unanswered ? `<p class="warnline">You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.</p>` : ''}
        <div class="card">
          <div class="legend"><span><i class="lgd un"></i>Unanswered</span><span><i class="lgd mk"></i>For Review</span></div>
          <div class="navgrid big">${m.questions.map((q, i) => `<button class="nb ${m.answers[i] != null && m.answers[i] !== '' ? 'ans' : ''} ${m.marked.includes(i) ? 'mk' : ''}" data-go="${i}">${i + 1}</button>`).join('')}</div>
        </div>
      </section></main>
      <footer class="tr-bottom"><div class="tr-user">${esc(store.user()?.name || 'Guest')}</div><span></span>
        <div class="tr-actions"><button class="btn" data-act="backq">Back</button><button class="btn primary" data-act="finishmod">${last ? 'Submit' : 'Next Module'}</button></div></footer>`;
  }

  // ---------- break ----------
  function renderBreak(m) {
    run.view = 'break';
    m.left ??= m.break * 60;
    tr.innerHTML = `<div class="break-screen"><div class="break-card">
      <div class="break-label">Remaining Break Time</div>
      <div class="break-time" id="breakTime">${fmtTime(m.left)}</div>
      <button class="btn primary lg" data-act="resume">Resume Testing</button>
      <div class="break-tips"><h3>Practice Test Break</h3><p>You can take a break before the next section. On test day you'd have ${m.break} minutes. Stretch, drink some water, and don't look at your notes or phone.</p></div>
    </div></div>`;
  }
  function breakTick() {
    const m = mod();
    if (!m?.break) return;
    m.left = Math.max(0, (m.left ?? m.break * 60) - 1);
    const el = $('#breakTime', tr); if (el) el.textContent = fmtTime(m.left);
    if (m.left === 0) nextModule();
  }

  const lastModuleIndex = () => { for (let i = run.modules.length - 1; i >= 0; i--) if (!run.modules[i].break) return i; return 0; };

  function finishModule() {
    const m = mod();
    m.done = true;
    if (run.current >= lastModuleIndex()) return finishRun();
    nextModule();
  }
  function nextModule() {
    run.current++;
    run.qi = 0; run.view = 'q'; ui.navOpen = false; ui.elimMode = false;
    const m = mod();
    if (!m.break) {
      if (run.kind === 'exam') ensureModule(run, run.current);
      toast(`Starting ${m.name}`);
    }
    persist(true);
    render();
  }

  function finishRun() {
    clearInterval(timer); timer = null;
    const mods = run.modules.filter((m) => !m.break && m.questions);
    mods.forEach((m) => m.questions.forEach((q, i) => {
      if (run.feedback && m.checked?.[i]) return; // already recorded when checked
      const a = m.answers[i];
      if (run.kind === 'practice' && (a == null || a === '')) return; // skipped practice questions don't count against you
      store.recordAnswer(q, isCorrect(q, a));
    }));
    const attempt = {
      kind: run.kind, title: run.title, test: run.test, examKey: run.examKey || null, seed: run.seed || null,
      date: Date.now(), timeSpent: Math.round((Date.now() - run.startedAt) / 1000),
      modules: mods.map((m) => ({ name: m.name, section: m.section, route: m.route || null, qids: m.questions.map((q) => q.id), answers: m.answers, marked: m.marked })),
    };
    const all = mods.flatMap((m) => m.questions.map((q, i) => isCorrect(q, m.answers[i])));
    attempt.correct = all.filter(Boolean).length; attempt.total = all.length;
    if (run.kind === 'exam') Object.assign(attempt, scoreExam(run));
    const id = store.addAttempt(attempt);
    store.data().inProgress = null; store.save();
    run = null;
    cleanup();
    location.hash = '#/results/' + id;
  }

  function setAnswer(i) {
    const m = mod();
    if (run.feedback && m.checked?.[run.qi]) return;
    m.answers[run.qi] = m.answers[run.qi] === i ? null : i;
    const el = m.elim[run.qi]; if (el) m.elim[run.qi] = el.filter((x) => x !== i);
    persist(); render();
  }

  // ---------- events ----------
  tr.addEventListener('click', (e) => {
    const t = e.target;
    const go = t.closest('[data-go]');
    if (go) { run.qi = +go.dataset.go; run.view = 'q'; ui.navOpen = false; return render(); }
    const ch = t.closest('[data-choice]');
    if (ch) return setAnswer(+ch.dataset.choice);
    const st = t.closest('[data-strike]');
    if (st) {
      const m = mod(), i = +st.dataset.strike, el = (m.elim[run.qi] ||= []);
      if (el.includes(i)) m.elim[run.qi] = el.filter((x) => x !== i); else { el.push(i); if (m.answers[run.qi] === i) m.answers[run.qi] = null; }
      return render();
    }
    const markEl = t.closest('mark.hl');
    if (markEl && ui.hlMode) { markEl.replaceWith(...markEl.childNodes); (mod().hl ||= {})[run.qi] = $('#passage', tr).innerHTML; return; }
    const act = t.closest('[data-act]')?.dataset.act;
    if (!act) return;
    const m = mod();
    switch (act) {
      case 'next':
        if (run.qi < m.questions.length - 1) { run.qi++; ui.navOpen = false; render(); } else { run.view = 'review'; ui.navOpen = false; render(); }
        break;
      case 'back': run.qi = Math.max(0, run.qi - 1); ui.navOpen = false; render(); break;
      case 'backq': run.view = 'q'; run.qi = m.questions.length - 1; render(); break;
      case 'nav': ui.navOpen = !ui.navOpen; render(); break;
      case 'reviewpage': run.view = 'review'; ui.navOpen = false; render(); break;
      case 'finishmod': finishModule(); break;
      case 'resume': nextModule(); break;
      case 'mark': { const i = m.marked.indexOf(run.qi); if (i >= 0) m.marked.splice(i, 1); else m.marked.push(run.qi); persist(); render(); break; }
      case 'elim': ui.elimMode = !ui.elimMode; render(); break;
      case 'hl': ui.hlMode = !ui.hlMode; render(); if (ui.hlMode) toast('Select text in the passage to highlight it. Click a highlight to remove it.'); break;
      case 'timer': ui.hideTimer = !ui.hideTimer; render(); break;
      case 'calc': toggleCalculator(); break;
      case 'ref': openReference(); break;
      case 'check': {
        const q = curQ();
        (m.checked ||= {})[run.qi] = true;
        store.recordAnswer(q, isCorrect(q, m.answers[run.qi])); store.save();
        persist(true); render(); break;
      }
      case 'reveal': $('#revealed', tr).innerHTML = `<div class="feedback"><b>Answer:</b> ${curQ().type === 'spr' ? tex(`$${curQ().answerDisplay}$`) : L(curQ().answer)}<div class="expl">${tex(curQ().expl)}</div>${explainHelp(curQ().expl)}</div>`; break;
      case 'home': {
        const exam = run.kind === 'exam';
        const hm = modal(`<p>Going home will <b>end this ${exam ? 'practice test' : 'practice session'}</b>. ${run.feedback ? 'Answers you already checked stay in your progress, but' : 'Your answers in'} this ${exam ? 'test' : 'set'} won't be saved or scored.</p>
          <p class="muted small">Want to come back to it later? Use <b>More → Save and exit</b> instead.</p>
          <div class="row gap end wrap"><button class="btn" data-x="stay">Keep going</button><button class="btn danger primary" data-x="leave">End session and go home</button></div>`, { title: 'Leave this session?' });
        hm.el.addEventListener('click', (ev) => {
          const x = ev.target.closest('[data-x]')?.dataset.x;
          if (x === 'stay') hm.close();
          if (x === 'leave') { hm.close(); run = null; store.data().inProgress = null; store.save(); cleanup(); location.hash = '#/'; }
        });
        break;
      }
      case 'directions': modal(directions(curQ()), { title: 'Directions' }); break;
      case 'more': {
        const mm = modal(`<div class="stack">
          <button class="btn block" data-x="save">Save and exit</button>
          <button class="btn block" data-x="meta">${run.showMeta ? 'Hide' : 'Show'} difficulty & skill tags</button>
          <button class="btn block" data-x="shortcuts">Keyboard shortcuts</button>
          <button class="btn block danger" data-x="quit">End test and see results</button></div>`, { title: 'More' });
        mm.el.addEventListener('click', (ev) => {
          const x = ev.target.closest('[data-x]')?.dataset.x;
          if (x === 'save') { persist(true); mm.close(); run = null; cleanup(); location.hash = '#/dashboard'; toast('Progress saved. Resume from your dashboard.'); }
          if (x === 'meta') { run.showMeta = !run.showMeta; mm.close(); render(); }
          if (x === 'shortcuts') { mm.close(); modal('<ul class="kbd-list"><li><kbd>A</kbd>–<kbd>D</kbd> select an answer</li><li><kbd>←</kbd> <kbd>→</kbd> previous / next question</li><li><kbd>M</kbd> mark for review</li><li><kbd>C</kbd> open calculator (math)</li></ul>', { title: 'Keyboard shortcuts' }); }
          if (x === 'quit') { mm.close(); finishRun(); }
        });
        break;
      }
    }
  });

  function onKey(e) {
    if (!run || run.view !== 'q' || mod().break) return;
    if (e.target.closest('input,textarea,.calc-float,.modal-wrap')) return;
    const q = curQ();
    const k = e.key.toLowerCase();
    if (q.type === 'mc' && 'abcd'.includes(k) && k.length === 1) setAnswer('abcd'.indexOf(k));
    else if (e.key === 'ArrowRight') $('[data-act="next"]', tr)?.click();
    else if (e.key === 'ArrowLeft') $('[data-act="back"]', tr)?.click();
    else if (k === 'm') $('[data-act="mark"]', tr)?.click();
    else if (k === 'c' && q.section === 'math') toggleCalculator();
  }
  addEventListener('keydown', onKey);

  function cleanup() {
    removeEventListener('keydown', onKey);
    if (timer) clearInterval(timer); timer = null;
    destroyCalculator();
    document.body.classList.remove('testing');
  }

  if (mod().break) run.view = 'break';
  render();
  return () => { persist(true); cleanup(); run && (run.view = run.view === 'break' ? 'break' : 'q'); };
}

function directions(q) {
  if (q.section === 'math') return `<p>The questions in this section address a number of important math skills. Use of a calculator is permitted for all questions. A reference sheet, calculator, and these directions can be accessed throughout the test.</p><p>Unless otherwise indicated: all variables and expressions represent real numbers; figures provided are drawn to scale; figures lie in a plane; the domain of a given function is the set of all real numbers for which the function is defined.</p><p>For <b>multiple-choice questions</b>, solve each problem and choose the correct answer. For <b>student-produced response questions</b>, enter your answer in the box. Fractions and decimals are both accepted.</p>`;
  if (q.section === 'science') return '<p>Each passage is followed by several questions. After reading a passage, choose the best answer to each question. You may refer to the passages as often as necessary. Calculators are not permitted on this section.</p>';
  if (q.section === 'english') return '<p>In the passages that follow, certain words and phrases are underlined. In the questions, you will find alternatives for the underlined part. In most cases, choose the one that best expresses the idea, makes the statement appropriate for standard written English, or is worded most consistently with the style and tone of the passage. If you think the original version is best, choose "NO CHANGE."</p>';
  return '<p>The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer based on the passage(s).</p><p>All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.</p>';
}
