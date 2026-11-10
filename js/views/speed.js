// Speed practice: three game modes on SAT, ACT, or AP questions, with streak scoring.
import { icon, sticker } from '../icons.js';
import { $, esc, tex, toast, newSeed, fmtTime, uid, checkSpr, DIFF_LABEL } from '../util.js';
import { store } from '../store.js';
import { SECTIONS, keysFor, buildSet } from '../gen/index.js';
import { L, reviewHTML, tappableChoicesHTML } from '../qview.js';
import { COURSES } from '../content/courses.js';
import { apCounts, apQuestions, pickAP, recordAP, rich } from './ap.js';

const MODES = {
  clock: { name: 'Beat the clock', blurb: 'Score as much as you can before time runs out.', ic: 'timer' },
  survival: { name: 'Survival', blurb: 'Three lives and 20 seconds per question. How far can you go?', ic: 'flame' },
  sprint: { name: 'Sprint', blurb: '20 questions as fast as you can. Misses add 10 seconds.', ic: 'stopwatch' },
};
const DURATIONS = [60, 120, 180, 300];
const SURVIVAL_SEC = 20, SPRINT_N = 20, SPRINT_PENALTY = 10;
const mult = (streak) => (streak >= 10 ? 4 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1);
const srcLabel = (st) => (st.test === 'AP' ? COURSES.find((c) => c.id === st.ap)?.title || 'AP' : `${st.test} ${SECTIONS[st.test][st.section] || ''}`);
const bestKey = (st) => `${st.mode}|${st.test}|${st.test === 'AP' ? st.ap : st.section}|${st.mode === 'clock' ? st.dur : ''}|${st.diff}`;
const better = (mode, a, b) => (mode === 'sprint' ? a < b : a > b);
const fmtScore = (mode, v) => (mode === 'sprint' ? fmtTime(Math.round(v)) : v.toLocaleString());

export function speedView(main) {
  // Own container: #main is reused across routes, so listeners on it would pile up.
  const root = main.appendChild(document.createElement('div'));
  const d = store.data();
  d.speed ||= { best: {}, runs: [] };
  const st = { test: d.settings.focus || 'SAT', section: null, ap: null, mode: 'clock', dur: 120, diff: 'mixed', phase: 'setup' };
  let game = null, timer = null, apCourses = [];
  apCounts().then((cnt) => { apCourses = COURSES.filter((c) => c.ap && cnt[c.id]); if (st.phase === 'setup' && st.test === 'AP') setup(); });

  function setup() {
    st.phase = 'setup';
    const ap = st.test === 'AP';
    const secs = ap ? null : SECTIONS[st.test];
    if (!ap && (!st.section || !secs[st.section])) st.section = Object.keys(secs).find((k) => k === 'math') || Object.keys(secs)[0];
    if (ap && !apCourses.some((c) => c.id === st.ap)) st.ap = apCourses[0]?.id || null;
    const best = d.speed.best[bestKey(st)];
    const runs = d.speed.runs.filter((r) => (r.key || '') === bestKey(st)).slice(0, 10).reverse();
    root.innerHTML = `
    <div class="page narrow speed-setup">
      <div class="row between wrap gap"><div><h1>Speed practice</h1><p class="muted">Quick rounds that build speed and accuracy. Streaks multiply your points.</p></div>
      <div class="seg" id="testSeg">${['SAT', 'ACT', 'AP'].map((t) => `<button data-t="${t}" class="${st.test === t ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="mode-cards">${Object.entries(MODES).map(([k, m]) => `<button class="card hover mode-card${st.mode === k ? ' on' : ''}" data-mode="${k}">${icon(m.ic)}<b>${m.name}</b><span class="muted small">${m.blurb}</span></button>`).join('')}</div>
      <div class="card stack">
        ${ap ? `<div><b>AP class</b>${apCourses.length ? `<select id="apSel" class="full">${apCourses.map((c) => `<option value="${c.id}" ${c.id === st.ap ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select>` : '<p class="muted small">Loading AP classes...</p>'}</div>`
          : `<div><b>Section</b><div class="seg full">${Object.entries(secs).map(([k, v]) => `<button data-s="${k}" class="${st.section === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>`}
        ${st.mode === 'clock' ? `<div><b>Time</b><div class="seg full">${DURATIONS.map((t) => `<button data-dur="${t}" class="${st.dur === t ? 'on' : ''}">${t / 60} min</button>`).join('')}</div></div>` : ''}
        <div><b>Difficulty</b><div class="seg full">${['1', '2', '3', 'mixed'].map((x) => `<button data-d="${x}" class="${st.diff === x ? 'on' : ''}">${x === 'mixed' ? 'Mixed' : DIFF_LABEL[x]}</button>`).join('')}</div></div>
        <div class="row between wrap gap"><span class="muted">${best != null ? `Your best here: <b>${fmtScore(st.mode, best)}</b>${st.mode === 'sprint' ? '' : ' points'}` : 'No best score yet for this setup.'}</span><button class="btn primary lg" id="go" ${ap && !st.ap ? 'disabled' : ''}>${icon(MODES[st.mode].ic)}Start</button></div>
      </div>
      ${runs.length > 1 ? `<h2 class="h3">Your last ${runs.length} runs here</h2><div class="card">${chart(runs.map((r) => r.score))}</div>` : ''}
      <p class="muted small">Scoring: 100 points a question, times your streak multiplier (x2 at 3 in a row, x3 at 6, x4 at 10). Keys A to D answer, S skips.</p>
    </div>`;
  }

  function chart(vals) {
    const W = 600, H = 120, hi = Math.max(...vals), lo = Math.min(...vals, 0);
    const x = (i) => 20 + (i * (W - 40)) / (vals.length - 1), y = (v) => H - 16 - ((v - lo) / (hi - lo || 1)) * (H - 32);
    return `<svg viewBox="0 0 ${W} ${H}" class="spark speed-chart" role="img" aria-label="Recent scores"><path d="${vals.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')}"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4"><title>${fmtScore(st.mode, v)}</title></circle>`).join('')}</svg>`;
  }

  // ---------- questions ----------
  async function more() {
    if (st.test === 'AP') {
      if (!game.apPool) {
        const qs = await apQuestions(st.ap);
        game.apPool = qs.filter((q) => st.diff === 'mixed' || q.difficulty === +st.diff);
        if (!game.apPool.length) game.apPool = qs;
      }
      const pool = game.apPool.filter((q) => !game.seen.has('ap' + q.id));
      const picked = pickAP(pool.length >= 5 ? pool : game.apPool, 10);
      game.queue.push(...picked.map((q) => ({ ...q, uid: 'ap' + q.id, ap: true, type: 'mc', skill: q.concept || q.unit })));
    } else {
      const keys = keysFor(st.test, st.section);
      game.queue.push(...buildSet({ test: st.test, keys, difficulty: st.diff, count: 10, seed: newSeed(), exclude: game.seen }));
    }
    game.queue.forEach((q) => game.seen.add(q.uid));
  }

  async function start() {
    game = { left: st.dur, elapsed: 0, qLeft: SURVIVAL_SEC, lives: 3, penalty: 0, queue: [], seen: new Set(), log: [], done: [], streak: 0, bestStreak: 0, score: 0, locked: false };
    st.phase = 'count';
    root.innerHTML = `<div class="page narrow speed"><div class="countdown" id="cd">3</div></div>`;
    const ready = more();
    for (const n of ['2', '1', 'Go']) { await wait(650); if (st.phase !== 'count') return; const el = $('#cd', root); if (el) { el.textContent = n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }
    await ready; await wait(350);
    if (st.phase !== 'count') return;
    if (!game.queue.length) { toast('No questions for that setup yet.'); return setup(); }
    st.phase = 'play';
    drawQ();
    timer = setInterval(tick, 1000);
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function tick() {
    if (game.locked) return;
    game.elapsed++;
    if (st.mode === 'clock') { game.left--; if (game.left <= 0) return finish(); }
    if (st.mode === 'survival') { game.qLeft--; if (game.qLeft <= 0) return answer(null, true); }
    updateTop();
  }

  function topHTML() {
    const m = mult(game.streak);
    const clock = st.mode === 'clock' ? fmtTime(game.left) : st.mode === 'survival' ? `${game.qLeft}s` : fmtTime(game.elapsed + game.penalty);
    const barPct = st.mode === 'clock' ? (100 * game.left) / st.dur : st.mode === 'survival' ? (100 * game.qLeft) / SURVIVAL_SEC : (100 * game.log.length) / SPRINT_N;
    const warn = (st.mode === 'clock' && game.left <= 10) || (st.mode === 'survival' && game.qLeft <= 5);
    return `<div class="row between"><span class="speed-time${warn ? ' warn' : ''}">${clock}</span>
      <span class="row gap">${st.mode === 'survival' ? `<span class="pill lives">${[0, 1, 2].map((i) => icon('heart', { fill: i < game.lives, cls: i < game.lives ? 'on' : 'off' })).join('')}</span>` : ''}
      ${st.mode === 'sprint' ? `<span class="pill">${game.log.length}/${SPRINT_N}</span>` : `<span class="pill score">${game.score.toLocaleString()}</span>`}
      <span class="pill mult m${m}">${icon('flame')}${game.streak}${m > 1 ? ` <b>x${m}</b>` : ''}</span><button class="btn xs ghost" id="quit">End</button></span></div>
      <div class="speed-bar"><div style="width:${barPct}%"></div></div>`;
  }
  const updateTop = () => { const t = $('#spTop', root); if (t) t.innerHTML = topHTML(); };

  async function drawQ() {
    if (game.queue.length < 3) await more();
    if (st.phase !== 'play') return;
    const q = game.queue[0];
    if (!q) return finish();
    game.qStart = Date.now(); game.qLeft = SURVIVAL_SEC;
    const R = q.ap ? rich : tex;
    root.innerHTML = `
    <div class="page narrow speed">
      <div class="speed-top card" id="spTop">${topHTML()}</div>
      <div class="card speed-q" id="spQ">
        ${q.ap ? `<div class="small muted">${esc(q.concept || q.unit)}</div>` : ''}
        ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}
        ${q.figure || ''}
        <div class="stem">${R(q.stem)}</div>
        ${q.type === 'spr'
          ? `<form class="row gap" id="sprForm"><input class="spr-input" id="spIn" autocomplete="off" placeholder="Type your answer"><button class="btn primary">Submit</button></form>`
          : `<ol class="choices">${q.choices.map((c, i) => `<li><button class="choice" data-c="${i}"><span class="letter">${L(i)}</span><span class="ctext">${R(c)}</span></button></li>`).join('')}</ol>`}
        <div class="row between"><span class="muted small">${q.type === 'spr' ? 'Press Enter to submit' : 'Keys A to D work too'}</span><button class="link sm" id="skip">Skip</button></div>
      </div>
      <div class="pop-score" id="pop"></div>
    </div>`;
    $('#spIn', root)?.focus();
  }

  function answer(a, timedOut = false) {
    if (game.locked) return;
    const q = game.queue.shift();
    game.done.push(q);
    const skipped = a == null;
    const ok = skipped ? false : q.type === 'spr' ? checkSpr(a, q.accept) : a === q.answer;
    if (!skipped) { if (q.ap) recordAP(st.ap, q, ok); else store.recordAnswer(q, ok); }
    game.log.push({ id: q.uid || q.id, a, ok, skipped, ms: Date.now() - game.qStart });
    let gained = 0;
    if (ok) { game.streak++; gained = 100 * mult(game.streak); game.score += gained; }
    else game.streak = 0;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    if (st.mode === 'survival' && (!ok || timedOut)) game.lives--;
    if (st.mode === 'sprint' && !ok && !skipped) game.penalty += SPRINT_PENALTY;
    const over = (st.mode === 'survival' && game.lives <= 0) || (st.mode === 'sprint' && game.log.length >= SPRINT_N);

    // Show the result on the question for a moment; a miss reveals the right answer.
    const card = $('#spQ', root);
    card?.classList.add(ok ? 'flash-ok' : skipped ? 'flash-skip' : 'flash-bad');
    if (q.type === 'mc' && card) {
      card.querySelectorAll('.choices li').forEach((li, i) => { li.classList.toggle('correct', i === q.answer); li.classList.toggle('wrong', i === a && !ok); li.querySelector('button').disabled = true; });
    }
    const pop = $('#pop', root);
    if (pop) { pop.textContent = ok ? `+${gained}` : timedOut ? "Time's up" : skipped ? 'Skipped' : st.mode === 'sprint' ? `+${SPRINT_PENALTY}s` : 'Miss'; pop.className = `pop-score show ${ok ? 'good' : 'bad'}`; }
    updateTop();
    game.locked = true;
    setTimeout(() => { if (!game) return; game.locked = false; if (over) finish(); else if (st.phase === 'play') drawQ(); }, ok ? 350 : 1100);
  }

  function finish() {
    clearInterval(timer); timer = null;
    if (st.phase !== 'play') return;
    st.phase = 'done';
    const answered = game.log.filter((x) => !x.skipped);
    const correct = answered.filter((x) => x.ok).length;
    const score = st.mode === 'sprint' ? (game.log.length >= SPRINT_N ? game.elapsed + game.penalty : null) : game.score;
    const key = bestKey(st);
    const prev = d.speed.best[key];
    const record = score != null && (prev == null || better(st.mode, score, prev));
    if (record) d.speed.best[key] = score;
    if (score != null) {
      d.speed.runs.unshift({ id: uid(), key, date: Date.now(), mode: st.mode, test: st.test, section: st.section, ap: st.ap, dur: st.dur, diff: st.diff, score, correct, answered: answered.length, bestStreak: game.bestStreak });
      d.speed.runs = d.speed.runs.slice(0, 100);
    }
    store.save();
    const avg = answered.length ? (answered.reduce((s, x) => s + x.ms, 0) / answered.length / 1000).toFixed(1) : 0;
    const missed = game.log.filter((x) => !x.ok && !x.skipped);
    const byId = new Map(game.done.map((q) => [q.uid || q.id, q]));
    const headline = st.mode === 'sprint' ? (score != null ? fmtTime(score) : 'Unfinished') : `${score.toLocaleString()} points`;
    root.innerHTML = `
    <div class="page narrow">
      <div class="card center stack">
        <div class="big-emoji">${sticker(record ? 'trophy' : 'stopwatch')}</div>
        <p class="kicker">${esc(MODES[st.mode].name)} · ${esc(srcLabel(st))}</p>
        <h1>${record ? 'New personal best!' : st.mode === 'survival' ? 'Out of lives' : st.mode === 'sprint' ? 'Sprint done' : "Time's up"}</h1>
        <div class="speed-score">${headline}</div>
        <div class="stats-strip"><div><b>${correct}</b><span>correct</span></div><div><b>${answered.length ? Math.round((100 * correct) / answered.length) : 0}%</b><span>accuracy</span></div><div><b>${avg}s</b><span>per question</span></div><div><b>${game.bestStreak}</b><span>best streak</span></div></div>
        <p class="muted">${record ? (prev != null ? `Previous best: ${fmtScore(st.mode, prev)}` : 'First run on this setup.') : prev != null ? `Best on this setup: ${fmtScore(st.mode, prev)}` : ''}</p>
        <div class="row gap center"><button class="btn primary" id="again">Go again</button><button class="btn" id="change">Change settings</button></div>
      </div>
      ${missed.length ? `<h2 class="h3">Review what you missed</h2><div class="stack">${missed.map((x) => { const q = byId.get(x.id); if (!q) return ''; return `<details class="card"><summary><b>${esc(q.skill || 'Question')}</b></summary>${q.ap
        ? `<div class="stem">${rich(q.stem)}</div>${tappableChoicesHTML(q, x.a, rich)}<div class="expl">${rich(q.expl)}</div>`
        : reviewHTML(q, x.a, { showTags: false })}</details>`; }).join('')}</div>` : ''}
    </div>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t],[data-s],[data-dur],[data-d],[data-mode],#go,#again,#change,[data-c],#skip,#quit');
    if (!t) return;
    if (st.phase === 'play') {
      if (t.dataset.c) answer(+t.dataset.c);
      else if (t.id === 'skip') answer(null);
      else if (t.id === 'quit') { game.locked = false; finish(); }
      return;
    }
    if (st.phase === 'count') return;
    if (t.id === 'again') return start();
    if (t.id === 'change') return setup();
    if (t.dataset.t) { st.test = t.dataset.t; st.section = null; }
    else if (t.dataset.mode) st.mode = t.dataset.mode;
    else if (t.dataset.s) st.section = t.dataset.s;
    else if (t.dataset.dur) st.dur = +t.dataset.dur;
    else if (t.dataset.d) st.diff = t.dataset.d;
    else if (t.id === 'go') return start();
    setup();
  });
  root.addEventListener('change', (e) => { if (e.target.id === 'apSel') { st.ap = e.target.value; setup(); } });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#spIn', root)?.value.trim();
    if (!v) return toast('Type an answer or skip.');
    answer(v);
  });
  const onKey = (e) => {
    if (st.phase !== 'play' || e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey) return;
    const i = 'abcd'.indexOf(e.key.toLowerCase());
    if (i >= 0 && game.queue[0]?.type === 'mc' && i < game.queue[0].choices.length) answer(i);
    else if (e.key.toLowerCase() === 's') answer(null);
  };
  addEventListener('keydown', onKey);
  setup();
  return () => { clearInterval(timer); st.phase = 'gone'; game = null; removeEventListener('keydown', onKey); };
}
