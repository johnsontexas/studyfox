import { icon } from '../icons.js';
import { esc, fmtTime, DIFF_LABEL } from '../util.js';
import { store } from '../store.js';
import { regen, SECTIONS } from '../gen/index.js';
import { isCorrect } from '../exams.js';
import { reviewHTML, answerText, correctText } from '../qview.js';
import { launchPractice } from './practice.js';
import { codeFor } from './exams.js';

export function resultsView(root, { id }) {
  const a = store.getAttempt(id);
  if (!a) { root.innerHTML = `<div class="page narrow"><h1>Result not found</h1><a class="btn" href="#/dashboard">Back to dashboard</a></div>`; return; }
  const mods = a.modules.map((m) => ({ ...m, questions: m.qids.map(regen) }));
  const rows = mods.flatMap((m, mi) => m.questions.map((q, i) => ({ q, mi, i, a: m.answers[i], marked: m.marked.includes(i), ok: q && isCorrect(q, m.answers[i]) }))).filter((r) => r.q);
  const st = { filter: 'all' };
  const pctv = Math.round((100 * a.correct) / (a.total || 1));
  const secNames = SECTIONS[a.test];

  const head = a.kind === 'exam'
    ? `<div class="score-hero card">
        <div class="score-main"><span class="muted">${esc(a.headlineLabel)}</span><b>${a.headline}</b>${a.extra ? `<span class="muted small">${a.extra.label}: <b>${a.extra.value}</b></span>` : ''}</div>
        <div class="score-secs">${Object.entries(a.sections).map(([k, s]) => `<div class="sec"><span>${secNames[k]}</span><b>${s.score}</b><span class="muted small">${s.correct}/${s.total} correct${s.route ? ` · ${s.route === 'hard' ? 'harder' : 'easier'} Module 2` : ''}</span></div>`).join('')}</div>
      </div>`
    : `<div class="score-hero card"><div class="score-main"><span class="muted">Score</span><b>${a.correct}/${a.total}</b><span class="muted small">${pctv}% correct</span></div></div>`;

  const byDomain = {};
  rows.forEach(({ q, ok }) => { const k = q.section + '|' + q.domain; const d = (byDomain[k] ||= { sec: q.section, dom: q.domain, c: 0, t: 0 }); d.t++; if (ok) d.c++; });
  const byDiff = [1, 2, 3].map((d) => { const r = rows.filter((x) => x.q.difficulty === d); return { d, c: r.filter((x) => x.ok).length, t: r.length }; });

  function draw() {
    const list = rows.filter((r) => st.filter === 'all' || (st.filter === 'wrong' && !r.ok) || (st.filter === 'marked' && r.marked));
    root.innerHTML = `
    <div class="page">
      <div class="row between wrap gap"><div><a class="small" href="#/dashboard">← Dashboard</a><h1>${esc(a.title)}</h1><p class="muted">${new Date(a.date).toLocaleString()} · ${fmtTime(a.timeSpent)} spent${a.seed ? ` · Test code <span class="mono">${codeFor(a.examKey, a.seed)}</span>` : ''}</p></div>
      <div class="row gap">${rows.some((r) => !r.ok) ? '<button class="btn primary" id="retryWrong">Retry missed questions</button>' : ''}</div></div>
      ${head}
      <div class="grid2">
        <div class="card"><h2 class="h3">By domain</h2>${Object.values(byDomain).map((d) => `<div class="mastery"><div class="m-top"><span>${esc(d.dom)} <span class="muted small">(${secNames[d.sec] || d.sec})</span></span><span class="small">${d.c}/${d.t}</span></div><div class="bar"><i class="${d.c / d.t >= 0.8 ? 'good' : d.c / d.t >= 0.6 ? 'mid' : 'low'}" style="width:${(100 * d.c) / d.t}%"></i></div></div>`).join('')}</div>
        <div class="card"><h2 class="h3">By difficulty</h2>${byDiff.filter((d) => d.t).map((d) => `<div class="mastery"><div class="m-top"><span>${DIFF_LABEL[d.d]}</span><span class="small">${d.c}/${d.t}</span></div><div class="bar"><i class="${d.c / d.t >= 0.8 ? 'good' : d.c / d.t >= 0.6 ? 'mid' : 'low'}" style="width:${(100 * d.c) / d.t}%"></i></div></div>`).join('')}
        <p class="muted small">Scores are estimates. Real SAT and ACT scoring uses statistical equating that isn't public.</p></div>
      </div>
      <div class="row between wrap gap"><h2 class="h3">Question review</h2>
        <div class="seg sm">${[['all', `All (${rows.length})`], ['wrong', `Incorrect (${rows.filter((r) => !r.ok).length})`], ['marked', `Marked (${rows.filter((r) => r.marked).length})`]].map(([k, l]) => `<button data-f="${k}" class="${st.filter === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="card flush"><table class="list review-table"><thead><tr><th>#</th><th>Section</th><th>Skill</th><th>Difficulty</th><th>Yours</th><th>Correct</th><th></th></tr></thead><tbody>
        ${list.map((r) => `<tr class="rrow" data-k="${r.mi}-${r.i}"><td>${mods.length > 1 ? `M${r.mi + 1}·` : ''}${r.i + 1}${r.marked ? ` ${icon('bookmark', { fill: true })}` : ''}</td><td>${secNames[r.q.section] || ''}</td><td>${esc(r.q.skill)}</td><td>${DIFF_LABEL[r.q.difficulty]}</td><td>${answerText(r.q, r.a)}</td><td>${correctText(r.q)}</td><td>${r.ok ? `<span class="ok">${icon('check')}</span>` : `<span class="bad">${icon('x')}</span>`}</td></tr><tr class="rdetail hidden" data-d="${r.mi}-${r.i}"><td colspan="7"></td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  }
  root.addEventListener('click', (e) => {
    if (e.target.dataset.f) { st.filter = e.target.dataset.f; return draw(); }
    if (e.target.id === 'retryWrong') {
      const qs = rows.filter((r) => !r.ok).map((r) => r.q);
      return launchPractice({ test: a.test, section: qs.every((q) => q.section === qs[0].section) ? qs[0].section : 'mixed', questions: qs, title: `Retry: ${a.title}` });
    }
    const tr = e.target.closest('.rrow');
    if (tr) {
      const det = root.querySelector(`[data-d="${tr.dataset.k}"]`);
      det.classList.toggle('hidden');
      if (!det.firstElementChild.innerHTML) {
        const [mi, i] = tr.dataset.k.split('-').map(Number);
        det.firstElementChild.innerHTML = reviewHTML(mods[mi].questions[i], mods[mi].answers[i]);
      }
    }
  });
  draw();
}
