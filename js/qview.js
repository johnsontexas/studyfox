// Shared question rendering for review screens (results, mistakes, question of the day).
import { icon } from './icons.js';
import { tex, esc, DIFF_LABEL, checkSpr } from './util.js';
import { explainHelp, questionHelp } from './i18n.js';

export const L = (i) => 'ABCD'[i];
export const diffPill = (d) => `<span class="diff d${d}" title="Difficulty">${'●'.repeat(d)}${'○'.repeat(3 - d)} ${DIFF_LABEL[d]}</span>`;
export const tagLine = (q) => `<div class="qtags"><span class="tag">${q.test}</span><span class="tag">${esc(q.domain)}</span><span class="tag subtle">${esc(q.skill)}</span>${diffPill(q.difficulty)}</div>`;

export function correctText(q) {
  return q.type === 'spr' ? tex(`$${q.answerDisplay}$`) : `${L(q.answer)}`;
}
export function answerText(q, a) {
  if (a == null || a === '') return '<span class="muted">Omitted</span>';
  return q.type === 'spr' ? esc(a) : L(a);
}

// Full static question with answer + explanation
export function reviewHTML(q, chosen, { showTags = true } = {}) {
  const right = q.type === 'spr' ? checkSpr(chosen, q.accept) : chosen === q.answer;
  let ans;
  if (q.type === 'spr') {
    ans = `<div class="spr-review"><div>Your answer: <b>${chosen ? esc(chosen) : '—'}</b> ${chosen ? (right ? `<span class="ok">${icon('check')}</span>` : `<span class="bad">${icon('x')}</span>`) : ''}</div><div>Correct answer: <b>${tex(`$${q.answerDisplay}$`)}</b>${q.accept.length && !Number.isInteger(q.accept[0]) ? ` <span class="muted">(${+q.accept[0].toFixed(4)} also accepted)</span>` : ''}</div></div>`;
  } else {
    ans = `<ol class="choices static">${q.choices.map((c, i) => `<li class="${i === q.answer ? 'correct' : ''} ${i === chosen && i !== q.answer ? 'wrong' : ''}"><span class="letter">${L(i)}</span><span class="ctext">${tex(c)}</span>${i === q.answer ? '<span class="ok">Correct</span>' : i === chosen ? '<span class="bad">Your answer</span>' : ''}</li>`).join('')}</ol>`;
  }
  return `<div class="qreview">
    ${showTags ? tagLine(q) : ''}
    ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}
    ${q.figure || ''}
    <div class="stem">${tex(q.stem)}</div>
    ${ans}
    <div class="expl"><b>Explanation.</b> ${tex(q.expl)}</div>
    ${explainHelp(q.expl)}${questionHelp(q)}
  </div>`;
}
