import { sticker, icon } from '../icons.js';
import { $, $$, esc, toast, newSeed, rng, timeAgo, DIFF_LABEL } from '../util.js';
import { store } from '../store.js';
import { taxonomy, SECTIONS, buildSet, regen } from '../gen/index.js';
import { bank, bankNo } from '../gen/bank.js';
import { startRun } from './runner.js';
import { reviewHTML } from '../qview.js';
import { classesBar } from '../studying.js';

const SEC_PER_Q = { rw: 71, math: 95, english: 42, reading: 67, science: 60 };

export function launchPractice({ test, section, keys, count = 10, difficulty = 'mixed', title, feedback = true, timed = false, questions }) {
  const qs = questions || buildSet({ test, keys, difficulty, count, seed: newSeed() });
  if (!qs.length) return toast('No questions matched those filters.');
  startRun({
    kind: 'practice', title: title || 'Practice set', test, feedback, showMeta: true,
    modules: [{ name: title || 'Practice', section, questions: qs, answers: {}, marked: [], elim: {}, checked: {}, timeLeft: timed ? Math.round(qs.length * (SEC_PER_Q[section] || 70)) : null }],
  });
}

export function practiceView(root) {
  const s = store.data().settings;
  const st = { test: s.focus || 'SAT', section: null, diff: 'mixed', count: 10, mode: 'tutor', pool: 'new', off: new Set(), showAll: false };
  const stats = store.data().skillStats;
  const done = store.data().bank;

  // Bank entries for the current section that match the selected skills and difficulty
  const matching = () => bank(st.test).filter((e) => e.section === st.section && !st.off.has(`${e.domain}|${e.skill}`) && (st.diff === 'mixed' || e.difficulty === +st.diff));
  const status = (e) => (done[e.id] ? (done[e.id].c ? 'right' : 'miss') : 'new');

  function draw() {
    const tax = taxonomy(st.test);
    if (!st.section || !tax[st.section]) st.section = Object.keys(tax)[0];
    const doms = tax[st.section];
    const all = bank(st.test);
    const did = all.filter((e) => done[e.id]);
    const right = did.filter((e) => done[e.id].c).length;
    const secTotal = (k) => all.filter((e) => e.section === k).length;
    const secDone = (k) => all.filter((e) => e.section === k && done[e.id]).length;
    const list = matching();
    const avail = list.filter((e) => st.pool === 'all' || (st.pool === 'new' ? !done[e.id] : status(e) === 'miss')).length;
    const shown = st.showAll ? list : list.slice(0, 240);
    const missed = all.filter((e) => e.section === st.section && status(e) === 'miss').length;
    const hardNew = all.filter((e) => e.section === st.section && e.difficulty === 3 && !done[e.id]).length;
    const secName = SECTIONS[st.test][st.section];
    const pct = all.length ? Math.round((100 * did.length) / all.length) : 0;
    const quick = [
      ['mixed', 'shuffle', 'Quick 10', `Mixed ${secName} questions you haven't done`],
      ['hard', 'flame', 'Hard 10', `${hardNew} hard ones left in ${secName}`],
      ['missed', 'target', 'Retry missed', missed ? `${missed} to get right this time` : 'Nothing missed yet'],
      ['timed', 'timer', 'Timed 20', 'Test-day pacing, answers at the end'],
    ];
    root.innerHTML = `
    <div class="page pq">
      ${classesBar('practice')}
      <header class="pq-head">
        <div><h1>${st.test} practice</h1><p class="muted">${all.length.toLocaleString()} questions, each with a worked explanation.</p></div>
        <div class="seg" id="testSeg">${['SAT', 'ACT'].map((t) => `<button data-t="${t}" class="${st.test === t ? 'on' : ''}">${t}</button>`).join('')}</div>
      </header>

      <div class="pq-stats">
        <div class="pq-ring" style="--p:${pct}"><b>${pct}%</b></div>
        <div><b>${did.length.toLocaleString()}</b><span>done</span></div>
        <div><b>${right.toLocaleString()}</b><span>correct</span></div>
        <div><b>${(did.length - right).toLocaleString()}</b><span>missed</span></div>
      </div>

      <div class="tabs" id="secTabs">${Object.keys(tax).map((k) => `<button data-s="${k}" class="${k === st.section ? 'on' : ''}">${SECTIONS[st.test][k]} <span class="tab-count">${secDone(k)}/${secTotal(k)}</span></button>`).join('')}</div>

      <h2 class="pq-h">Start fast</h2>
      <div class="pq-quick">${quick.map(([k, ic, t, d]) => `<button class="pq-card" data-quick="${k}" ${k === 'missed' && !missed ? 'disabled' : ''}><span class="pq-ic">${icon(ic)}</span><b>${t}</b><span class="muted small">${esc(d)}</span></button>`).join('')}</div>

      <h2 class="pq-h">Build your own set</h2>
      <div class="pq-build">
        <section class="card pq-skills">
          <div class="row between"><b>Skills</b><span class="row gap"><button class="link sm" id="allOn">All</button><button class="link sm" id="allOff">None</button></span></div>
          ${Object.entries(doms).map(([dom, skills]) => {
            const skillNames = Object.keys(skills);
            const onCount = skillNames.filter((k) => !st.off.has(`${dom}|${k}`)).length;
            return `<div class="pq-dom">
              <label class="pq-dom-head"><input type="checkbox" data-dom="${esc(dom)}" ${onCount === skillNames.length ? 'checked' : ''} ${onCount && onCount < skillNames.length ? 'data-mixed="1"' : ''}><span>${esc(dom)}</span></label>
              <div class="skills">${skillNames.map((sk) => {
                const ss = stats[`${st.test}|${st.section}|${sk}`];
                const acc = ss?.t ? Math.round((100 * ss.c) / ss.t) + '%' : '';
                return `<label class="skill"><input type="checkbox" data-skill="${esc(dom)}|${esc(sk)}" ${st.off.has(`${dom}|${sk}`) ? '' : 'checked'}><span>${esc(sk)}</span>${acc ? `<span class="acc">${acc}</span>` : ''}</label>`;
              }).join('')}</div>
            </div>`;
          }).join('')}
        </section>
        <aside class="card sticky pq-opts">
          <div><span class="pq-lbl">Difficulty</span><div class="seg full" id="diffSeg">${['mixed', '1', '2', '3'].map((d) => `<button data-d="${d}" class="${st.diff === d ? 'on' : ''}">${d === 'mixed' ? 'Mixed' : DIFF_LABEL[d]}</button>`).join('')}</div></div>
          <div><span class="pq-lbl">Questions</span><div class="seg full" id="poolSeg">${[['new', 'New'], ['miss', 'Missed'], ['all', 'Any']].map(([k, v]) => `<button data-p="${k}" class="${st.pool === k ? 'on' : ''}">${v}</button>`).join('')}</div></div>
          <div><span class="pq-lbl">How many</span><div class="seg full" id="countSeg">${[5, 10, 20, 30].map((c) => `<button data-c="${c}" class="${st.count === c ? 'on' : ''}">${c}</button>`).join('')}</div></div>
          <div><span class="pq-lbl">Mode</span><div class="seg full">${[['tutor', 'Tutor'], ['timed', 'Timed']].map(([k, v]) => `<button data-m="${k}" class="${st.mode === k ? 'on' : ''}">${v}</button>`).join('')}</div>
            <p class="muted small pq-note">${st.mode === 'tutor' ? 'See each answer and explanation right away.' : `About ${Math.round((SEC_PER_Q[st.section] || 70) / 6) / 10} min per question. Answers at the end.`}</p></div>
          <button class="btn primary lg block" id="go" ${avail ? '' : 'disabled'}>Start ${Math.min(st.count, avail) || ''} question${Math.min(st.count, avail) === 1 ? '' : 's'}</button>
          <p class="muted small center pq-note">${avail} match these filters</p>
        </aside>
      </div>

      <details class="pq-browse" ${st.browse ? 'open' : ''}>
        <summary><span><b>Browse by number</b><span class="muted small"> · ${list.length} ${esc(secName)} questions</span></span><span class="legend"><span><i class="lgd q-new"></i>Not done</span><span><i class="lgd q-right"></i>Correct</span><span><i class="lgd q-miss"></i>Missed</span></span></summary>
        <div class="qgrid">${shown.map((e) => `<button class="qn q-${status(e)}" data-no="${e.no}" title="${esc(e.skill)} · ${DIFF_LABEL[e.difficulty]}">${e.no}</button>`).join('')}</div>
        ${list.length > shown.length ? `<div class="center"><button class="btn" id="showAll">Show all ${list.length}</button></div>` : ''}
      </details>
    </div>`;
    $$('[data-mixed]', root).forEach((c) => (c.indeterminate = true));
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t],[data-s],[data-d],[data-c],[data-p],[data-m],[data-quick],[data-no],#go,#allOn,#allOff,#showAll');
    if (!t) return;
    const secName = SECTIONS[st.test][st.section];
    if (t.dataset.no) {
      const ent = bank(st.test)[+t.dataset.no - 1];
      return launchPractice({ test: st.test, section: st.section, questions: [regen(ent.id)], title: `${st.test} question #${ent.no}`, feedback: true });
    }
    if (t.dataset.t) { st.test = t.dataset.t; st.section = null; st.off.clear(); st.showAll = false; }
    else if (t.dataset.s) { st.section = t.dataset.s; st.off.clear(); st.showAll = false; }
    else if (t.dataset.d) st.diff = t.dataset.d;
    else if (t.dataset.c) st.count = +t.dataset.c;
    else if (t.dataset.p) st.pool = t.dataset.p;
    else if (t.dataset.m) st.mode = t.dataset.m;
    else if (t.dataset.quick) {
      const q = t.dataset.quick, sec = bank(st.test).filter((x) => x.section === st.section);
      const pool = q === 'missed' ? sec.filter((x) => status(x) === 'miss') : sec.filter((x) => !done[x.id] && (q !== 'hard' || x.difficulty === 3));
      const n = q === 'timed' ? 20 : 10;
      const src = pool.length ? pool : sec.filter((x) => q !== 'hard' || x.difficulty === 3);
      const pick = rng(newSeed()).shuffle([...src]).slice(0, n).sort((a, b) => a.no - b.no);
      if (!pick.length) return toast('No questions to start.');
      const label = { mixed: 'quick set', hard: 'hard set', missed: 'missed retry', timed: 'timed set' }[q];
      return launchPractice({ test: st.test, section: st.section, questions: pick.map((x) => regen(x.id)).filter(Boolean), feedback: q !== 'timed', timed: q === 'timed', title: `${st.test} ${secName} ${label}` });
    }
    else if (t.id === 'showAll') { st.showAll = true; st.browse = true; }
    else if (t.id === 'allOn') st.off.clear();
    else if (t.id === 'allOff') { const tax = taxonomy(st.test)[st.section]; for (const [d, sk] of Object.entries(tax)) for (const k of Object.keys(sk)) st.off.add(`${d}|${k}`); }
    else if (t.id === 'go') {
      const pool = matching().filter((x) => st.pool === 'all' || (st.pool === 'new' ? !done[x.id] : status(x) === 'miss'));
      if (!pool.length) return toast('No questions match those filters.');
      // Spread the set across skills, then keep bank order so numbers read naturally
      const r = rng(newSeed());
      const bySkill = {};
      for (const x of r.shuffle(pool)) (bySkill[x.skill] ||= []).push(x);
      const pick = [];
      const lists = Object.values(bySkill);
      for (let i = 0; pick.length < st.count && lists.some((l) => l.length); i++) { const l = lists[i % lists.length]; if (l.length) pick.push(l.pop()); }
      pick.sort((a, b) => a.no - b.no);
      return launchPractice({ test: st.test, section: st.section, questions: pick.map((x) => regen(x.id)).filter(Boolean), feedback: st.mode === 'tutor', timed: st.mode === 'timed', title: `${st.test} ${secName} practice` });
    }
    draw();
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.dom) {
      const tax = taxonomy(st.test)[st.section][t.dataset.dom];
      for (const k of Object.keys(tax)) { const id = `${t.dataset.dom}|${k}`; t.checked ? st.off.delete(id) : st.off.add(id); }
      draw();
    } else if (t.dataset.skill) { t.checked ? st.off.delete(t.dataset.skill) : st.off.add(t.dataset.skill); draw(); }
  });
  draw();
}

export function reviewView(root) {
  const d = store.data();
  const st = { test: d.settings.focus || 'SAT', section: 'all' };
  function draw() {
    const items = Object.entries(d.mistakes).filter(([, m]) => m.test === st.test && (st.section === 'all' || m.section === st.section)).sort((a, b) => b[1].ts - a[1].ts);
    root.innerHTML = `
    <div class="page narrow-wide">
      <div class="row between wrap gap"><div><h1>Mistake log</h1><p class="muted">Every question you miss lands here. Answer it correctly in a review set to clear it.</p></div>
      <div class="seg" id="tseg">${['SAT', 'ACT'].map((t) => `<button data-t="${t}" class="${st.test === t ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="tabs">${[['all', 'All'], ...Object.entries(SECTIONS[st.test])].map(([k, v]) => `<button data-s="${k}" class="${st.section === k ? 'on' : ''}">${v}</button>`).join('')}</div>
      ${items.length ? `<div class="row between wrap gap"><span class="muted">${items.length} question${items.length > 1 ? 's' : ''} to review</span><button class="btn primary" id="retry">Retry ${Math.min(items.length, 30)} in tutor mode</button></div>
      <div class="stack">${items.slice(0, 60).map(([id, m]) => `<details class="card mistake" data-id="${esc(id)}"><summary><span>${bankNo(id) ? `<span class="qno">#${bankNo(id)}</span> ` : ''}<b>${esc(m.skill)}</b><span class="muted small"> · ${esc(m.domain)} · ${DIFF_LABEL[m.difficulty] || ''}</span></span><span class="muted small">${timeAgo(m.ts)}</span></summary><div class="mbody"></div><div class="row end"><button class="btn xs ghost" data-rm="${esc(id)}">Remove from log</button></div></details>`).join('')}</div>`
      : `<div class="empty card"><div class="big-emoji">${sticker('party')}</div><h2>Nothing to review</h2><p class="muted">Missed questions will show up here automatically.</p><a class="btn primary" href="#/practice">Practice questions</a></div>`}
    </div>`;
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.t) { st.test = t.dataset.t; st.section = 'all'; return draw(); }
    if (t.dataset.s) { st.section = t.dataset.s; return draw(); }
    if (t.dataset.rm) { delete d.mistakes[t.dataset.rm]; store.save(); return draw(); }
    if (t.id === 'retry') {
      const ids = Object.entries(d.mistakes).filter(([, m]) => m.test === st.test && (st.section === 'all' || m.section === st.section)).sort((a, b) => b[1].ts - a[1].ts).slice(0, 30).map(([id]) => id);
      const qs = ids.map(regen).filter(Boolean);
      launchPractice({ test: st.test, section: st.section === 'all' ? 'mixed' : st.section, questions: qs, title: 'Mistake review', feedback: true });
    }
  });
  root.addEventListener('toggle', (e) => {
    const det = e.target;
    if (!det.matches?.('details.mistake') || !det.open) return;
    const body = det.querySelector('.mbody');
    if (body.innerHTML) return;
    const q = regen(det.dataset.id);
    body.innerHTML = q ? reviewHTML(q, null, { showTags: false }) : '<p class="muted">This question could not be loaded.</p>';
  }, true);
  draw();
}
