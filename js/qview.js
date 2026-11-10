// Shared question rendering for review screens (results, mistakes, question of the day).
import { icon } from './icons.js';
import { tex, esc, DIFF_LABEL, checkSpr } from './util.js';
import { explainHelp, questionHelp } from './i18n.js';
import { choiceNotes } from './explain.js';
import { setting } from './content/settings.js';
import { store } from './store.js';

export const L = (i) => 'ABCDE'[i];

// Shown for a wrong choice that has no written note (yet): points back to the worked solution.
const NO_NOTE = "This isn't the answer. Work through the explanation step by step and compare it with how you got this choice; the step where they differ is the mistake.";

/** Why one choice is right or wrong, as HTML. */
export function choiceNoteHTML(q, i, fmt = tex) {
  const n = choiceNotes(q)[i];
  if (i === q.answer) return `<b>${icon('check')} ${L(i)} is correct.</b> ${fmt(n?.why || q.expl || '')}`;
  return `<b>${icon('x')} Why not ${L(i)}?</b> ${n?.why ? fmt(n.why) : NO_NOTE}${n?.auto ? ' <span class="muted small">(detected from the numbers)</span>' : ''}`;
}

/**
 * Answered choices that stay tappable: tap any one to open why it's right or wrong underneath it.
 * Works anywhere (results, mistake log, reviews) through the document click handler below.
 */
export function tappableChoicesHTML(q, chosen, fmt = tex) {
  return `<ol class="choices static tappable">${q.choices.map((c, i) => `<li class="${i === q.answer ? 'correct' : i === chosen ? 'wrong' : ''}">
    <button type="button" class="choice-tap" data-cpeek aria-expanded="false"><span class="letter">${L(i)}</span><span class="ctext">${fmt(c)}</span>${i === q.answer ? '<span class="ok">Correct</span>' : i === chosen ? '<span class="bad">Your answer</span>' : '<span class="muted small cp-hint">Why not?</span>'}</button>
    <div class="choice-note ${i === q.answer ? 'right' : 'wrong'}" hidden>${choiceNoteHTML(q, i, fmt)}</div></li>`).join('')}</ol>
    <p class="small muted tap-hint">Tap any choice to see why it's right or wrong.</p>`;
}

/**
 * Explanations for a multiple-choice question after it's answered: why the student's pick is wrong,
 * then every choice explained. `fmt` renders text (tex or rich).
 */
export function choiceFeedbackHTML(q, chosen, fmt = tex, { open = true } = {}) {
  if (q.type === 'spr' || !Array.isArray(q.choices)) return '';
  const notes = choiceNotes(q);
  const wrong = chosen != null && chosen !== '' && chosen !== q.answer;
  const mine = wrong ? notes[chosen] : null;
  const yours = mine?.why ? `<div class="why-yours"><b>${icon('x')} Why ${L(chosen)} doesn't work</b><div>${fmt(mine.why)}</div>${mine.auto ? '<span class="muted small">Detected from the numbers. Compare it with your work.</span>' : ''}</div>` : '';
  if (!setting('question_feedback').explain_every_choice) return yours;
  return `${yours}<details class="choice-why"${open ? ' open' : ''}><summary>${icon('clipboard')} Every choice explained</summary><ol>${q.choices.map((c, i) => `<li class="${i === q.answer ? 'right' : i === chosen ? 'picked' : ''}">
      <span class="letter">${L(i)}</span><div><div class="cw-choice">${fmt(c)} ${i === q.answer ? '<span class="tag good">Correct</span>' : i === chosen ? '<span class="tag bad">Your pick</span>' : ''}</div>
      <div class="cw-why">${i === q.answer ? fmt(notes[i].why || 'This is the answer. See the explanation above.') : notes[i].why ? fmt(notes[i].why) : `<span class="muted">${NO_NOTE}</span>`}</div></div></li>`).join('')}</ol></details>`;
}

/** "What went wrong?" chips after a miss. Answers are saved per question id in store.data().mistakeTags. */
export function whatWentWrongHTML(qid) {
  const cfg = setting('question_feedback');
  if (!cfg.ask_what_went_wrong || !qid) return '';
  const cur = (store.data().mistakeTags || {})[qid]?.tag;
  return `<div class="wwr" data-wwr="${esc(String(qid))}"><span class="small muted">What happened? Tagging misses shows you patterns later.</span>
    <div class="wwr-tags">${(cfg.mistake_tags || []).map((t) => `<button type="button" class="pill sm${cur === t ? ' on' : ''}" data-wwr-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
}

/** Click handler for whatWentWrongHTML chips (installed once on the document). Returns true if it handled the click. */
export function handleWhatWentWrong(e) {
  const b = e.target.closest('[data-wwr-tag]');
  if (!b) return false;
  const box = b.closest('[data-wwr]');
  const tags = (store.data().mistakeTags ||= {});
  const id = box.dataset.wwr, tag = b.dataset.wwrTag;
  if (tags[id]?.tag === tag) delete tags[id]; else tags[id] = { tag, ts: Date.now() };
  store.save();
  box.querySelectorAll('[data-wwr-tag]').forEach((x) => x.classList.toggle('on', tags[id]?.tag === x.dataset.wwrTag));
  return true;
}
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
    ans = tappableChoicesHTML(q, chosen);
  }
  return `<div class="qreview">
    ${showTags ? tagLine(q) : ''}
    ${q.passage ? `<div class="passage">${tex(q.passage)}</div>` : ''}
    ${q.figure || ''}
    <div class="stem">${tex(q.stem)}</div>
    ${ans}
    <div class="expl"><b>Explanation.</b> ${tex(q.expl)}</div>
    ${choiceFeedbackHTML(q, chosen)}
    ${q.hint ? `<div class="lb-hint">${icon('brain')} <b>Hint.</b> ${tex(q.hint)}</div>` : ''}
    ${Array.isArray(q.steps) && q.steps.length ? `<details class="q-steps"><summary>${icon('clipboard')} Step-by-step solution</summary><ol>${q.steps.map((x) => `<li>${tex(x)}</li>`).join('')}</ol></details>` : ''}
    ${chosen != null && chosen !== '' && !right ? whatWentWrongHTML(q.id) : ''}
    ${explainHelp(q.expl)}${questionHelp(q)}
  </div>`;
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleWhatWentWrong);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cpeek]');
    if (!b) return;
    const note = b.nextElementSibling, open = note.hidden;
    note.hidden = !open;
    b.setAttribute('aria-expanded', open);
    b.closest('li').classList.toggle('peeking', open);
  });
}
