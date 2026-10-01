// Speed practice: answer as many questions as you can before the clock runs out.
import { icon, sticker } from '../icons.js';
import { $, esc, tex, toast, newSeed, fmtTime, uid, checkSpr, DIFF_LABEL } from '../util.js';
import { store } from '../store.js';
import { SECTIONS, keysFor, buildSet } from '../gen/index.js';
import { L, reviewHTML } from '../qview.js';

const DURATIONS = [60, 120, 180, 300];
const bestKey = (st) => `${st.test}|${st.section}|${st.dur}|${st.diff}`;

export function speedView(main) {
  // Own container: #main is reused across routes, so listeners on it would pile up.
  const root = main.appendChild(document.createElement('div'));
  const d = store.data();
  const st = { test: d.settings.focus || 'SAT', section: null, dur: 120, diff: '1', phase: 'setup' };
  let game = null, timer = null;

  function setup() {
    const secs = SECTIONS[st.test];
    if (!st.section || !secs[st.section]) st.section = Object.keys(secs).find((k) => k === 'math') || Object.keys(secs)[0];
    const best = d.speed?.best[bestKey(st)];
    const recent = (d.speed?.runs || []).slice(0, 5);
    root.innerHTML = `
    <div class="page narrow">
      <div class="row between wrap gap"><div><h1>Speed practice</h1><p class="muted">Beat the clock. Answer as many as you can; every answer moves you straight to the next question.</p></div>
      <div class="seg" id="testSeg">${['SAT', 'ACT'].map((t) => `<button data-t="${t}" class="${st.test === t ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="card stack">
        <div><b>Section</b><div class="seg full">${Object.entries(secs).map(([k, v]) => `<button data-s="${k}" class="${st.section === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
        <div><b>Time</b><div class="seg full">${DURATIONS.map((t) => `<button data-dur="${t}" class="${st.dur === t ? 'on' : ''}">${t / 60} min</button>`).join('')}</div></div>
        <div><b>Difficulty</b><div class="seg full">${['1', '2', '3', 'mixed'].map((x) => `<button data-d="${x}" class="${st.diff === x ? 'on' : ''}">${x === 'mixed' ? 'Mixed' : DIFF_LABEL[x]}</button>`).join('')}</div></div>
        <div class="row between wrap gap"><span class="muted">${best ? `Your best here: <b>${best}</b> correct` : 'No best score yet for this setup.'}</span><button class="btn primary lg" id="go">${icon('timer')}Start</button></div>
      </div>
      ${recent.length ? `<h2 class="h3">Recent runs</h2><div class="card flush"><table class="list"><tbody>${recent.map((r) => `<tr><td>${esc(r.test)} ${esc(SECTIONS[r.test][r.section] || '')}</td><td>${r.dur / 60} min</td><td><b>${r.correct}</b>/${r.answered} correct</td></tr>`).join('')}</tbody></table></div>` : ''}
    </div>`;
  }

  function more() {
    const keys = keysFor(st.test, st.section);
    game.queue.push(...buildSet({ test: st.test, keys, difficulty: st.diff, count: 10, seed: newSeed(), exclude: game.seen }));
    game.queue.forEach((q) => game.seen.add(q.uid));
  }

  function start() {
    game = { left: st.dur, queue: [], seen: new Set(), log: [], done: [], streak: 0, bestStreak: 0, flash: '' };
    more();
    st.phase = 'play';
    drawQ();
    timer = setInterval(() => {
      game.left--;
      const t = $('#spTime', root);
      if (t) { t.textContent = fmtTime(game.left); t.classList.toggle('warn', game.left <= 10); }
      const bar = $('#spBar', root);
      if (bar) bar.style.width = `${(100 * game.left) / st.dur}%`;
      if (game.left <= 0) finish();
    }, 1000);
  }

  function drawQ() {
    if (game.queue.length < 3) more();
    const q = game.queue[0];
    const correct = game.log.filter((x) => x.ok).length;
    game.qStart = Date.now();
    root.innerHTML = `
    <div class="page narrow speed">
      <div class="speed-top card">
        <div class="row between"><span class="speed-time" id="spTime">${fmtTime(game.left)}</span>
          <span class="row gap"><span class="pill">${icon('check')}${correct}</span><span class="pill">${icon('flame')}${game.streak}</span><button class="btn xs ghost" id="quit">End</button></span></div>
        <div class="speed-bar"><div id="spBar" style="width:${(100 * game.left) / st.dur}%"></div></div>
      </div>
      <div class="card speed-q ${game.flash}">
        ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}
        ${q.figure || ''}
        <div class="stem">${tex(q.stem)}</div>
        ${q.type === 'spr'
          ? `<form class="row gap" id="sprForm"><input class="spr-input" id="spIn" autocomplete="off" placeholder="Type your answer"><button class="btn primary">Submit</button></form>`
          : `<ol class="choices">${q.choices.map((c, i) => `<li><button class="choice" data-c="${i}"><span class="letter">${L(i)}</span><span class="ctext">${tex(c)}</span></button></li>`).join('')}</ol>`}
        <div class="row between"><span class="muted small">${q.type === 'spr' ? 'Press Enter to submit' : 'Keys A to D work too'}</span><button class="link sm" id="skip">Skip</button></div>
      </div>
    </div>`;
    $('#spIn', root)?.focus();
  }

  function answer(a) {
    const q = game.queue.shift();
    game.done.push(q);
    const ok = a == null ? false : q.type === 'spr' ? checkSpr(a, q.accept) : a === q.answer;
    if (a != null) store.recordAnswer(q, ok);
    game.log.push({ id: q.id, a, ok, skipped: a == null, ms: Date.now() - game.qStart });
    game.streak = ok ? game.streak + 1 : 0;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    game.flash = a == null ? '' : ok ? 'flash-ok' : 'flash-bad';
    drawQ();
  }

  function finish() {
    clearInterval(timer); timer = null;
    st.phase = 'done';
    const answered = game.log.filter((x) => !x.skipped);
    const correct = answered.filter((x) => x.ok).length;
    const key = bestKey(st);
    d.speed ||= { best: {}, runs: [] };
    const prev = d.speed.best[key] || 0;
    const record = correct > prev;
    if (record) d.speed.best[key] = correct;
    d.speed.runs.unshift({ id: uid(), date: Date.now(), test: st.test, section: st.section, dur: st.dur, diff: st.diff, correct, answered: answered.length, bestStreak: game.bestStreak });
    d.speed.runs = d.speed.runs.slice(0, 100);
    store.save();
    const avg = answered.length ? Math.round(answered.reduce((s, x) => s + x.ms, 0) / answered.length / 1000) : 0;
    const missed = game.log.filter((x) => !x.ok && !x.skipped);
    const byId = new Map(game.done.map((q) => [q.id, q]));
    root.innerHTML = `
    <div class="page narrow">
      <div class="card center stack">
        <div class="big-emoji">${sticker(record && correct ? 'trophy' : 'stopwatch')}</div>
        <h1>${record && correct ? 'New personal best!' : "Time's up"}</h1>
        <div class="stats-strip"><div><b>${correct}</b><span>correct</span></div><div><b>${answered.length ? Math.round((100 * correct) / answered.length) : 0}%</b><span>accuracy</span></div><div><b>${avg}s</b><span>per question</span></div><div><b>${game.bestStreak}</b><span>best streak</span></div></div>
        <p class="muted">${record ? (prev ? `Previous best: ${prev}` : 'First run on this setup.') : `Best on this setup: ${prev}`}</p>
        <div class="row gap center"><button class="btn primary" id="again">Go again</button><button class="btn" id="change">Change settings</button></div>
      </div>
      ${missed.length ? `<h2 class="h3">Review what you missed</h2><div class="stack">${missed.map((x) => `<details class="card"><summary><b>${esc(byId.get(x.id)?.skill || 'Question')}</b></summary>${reviewHTML(byId.get(x.id), x.a, { showTags: false })}</details>`).join('')}</div>` : ''}
    </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t],[data-s],[data-dur],[data-d],#go,#again,#change,[data-c],#skip,#quit');
    if (!t) return;
    if (st.phase === 'play') {
      if (t.dataset.c) answer(+t.dataset.c);
      else if (t.id === 'skip') answer(null);
      else if (t.id === 'quit') finish();
      return;
    }
    if (t.id === 'again') return start();
    if (t.id === 'change') { st.phase = 'setup'; return setup(); }
    if (t.dataset.t) { st.test = t.dataset.t; st.section = null; }
    else if (t.dataset.s) st.section = t.dataset.s;
    else if (t.dataset.dur) st.dur = +t.dataset.dur;
    else if (t.dataset.d) st.diff = t.dataset.d;
    else if (t.id === 'go') return start();
    setup();
  });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#spIn', root)?.value.trim();
    if (!v) return toast('Type an answer or skip.');
    answer(v);
  });
  const onKey = (e) => {
    if (st.phase !== 'play' || e.target.matches('input,textarea') || e.metaKey || e.ctrlKey) return;
    const i = 'abcd'.indexOf(e.key.toLowerCase());
    if (i >= 0 && game.queue[0]?.type === 'mc') answer(i);
  };
  addEventListener('keydown', onKey);
  setup();
  return () => { clearInterval(timer); removeEventListener('keydown', onKey); };
}
