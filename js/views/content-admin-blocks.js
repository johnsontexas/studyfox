// Admin editor for interactive lesson blocks (lessons.blocks). Each block gets a small form built from
// its type; edits update the block in memory and refresh the live preview (the real lesson player).
import { icon } from '../icons.js';
import { $, esc } from '../util.js';
import { BLOCK_TYPES, blocksFor, validateBlock } from '../content/blocks.js';
import { mountLessonPlayer } from './lesson-player.js';

const L = (i) => 'ABCDEFGH'[i];
const lines = (a) => (a || []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n');
const pipes = (a) => (a || []).map((x) => x.join(' | ')).join('\n');
const area = (f, v, rows = 3, ph = '') => `<textarea data-f="${f}" rows="${rows}" placeholder="${esc(ph)}">${esc(v ?? '')}</textarea>`;
const inp = (f, v, ph = '') => `<input data-f="${f}" value="${esc(v ?? '')}" placeholder="${esc(ph)}">`;

function fields(b) {
  switch (b.type) {
    case 'text': return `<label>Text (HTML, math in $...$)${area('html', b.html, 6)}</label>`;
    case 'callout': return `<div class="grid2"><label>Kind<select data-f="kind">${['tip', 'rule', 'key', 'example', 'warning'].map((k) => `<option ${k === b.kind ? 'selected' : ''}>${k}</option>`).join('')}</select></label><label>Title${inp('title', b.title, 'Optional')}</label></div><label>Text${area('html', b.html, 3)}</label>`;
    case 'mcq': return `<label>Question${area('q', b.q, 2)}</label>
      ${b.choices.map((c, i) => `<div class="be-choice"><label class="row gap"><input type="radio" name="ans" data-f="answer" value="${i}" ${b.answer === i ? 'checked' : ''} aria-label="Correct answer"> <b>${L(i)}</b> ${inp(`choices.${i}.text`, c.text, 'Choice text')}</label>
        <label class="small">${i === b.answer ? 'Why it\'s right' : 'Why someone picks this, and why it\'s wrong'}${area(`choices.${i}.why`, c.why, 2)}</label></div>`).join('')}
      <div class="row gap"><button class="btn sm ghost" data-be="add-choice">${icon('plus')} Choice</button>${b.choices.length > 2 ? `<button class="btn sm ghost" data-be="drop-choice">Remove last choice</button>` : ''}</div>
      <label>Hint (shown after a wrong try)${inp('hint', b.hint)}</label><label>Wrap-up shown after answering (optional)${area('why', b.why, 2)}</label>`;
    case 'multi': return `<label>Question${area('q', b.q, 2)}</label>
      ${b.choices.map((c, i) => `<div class="be-choice"><label class="row gap"><input type="checkbox" data-f="choices.${i}.correct" ${c.correct ? 'checked' : ''} aria-label="Correct"> <b>${L(i)}</b> ${inp(`choices.${i}.text`, c.text, 'Choice text')}</label>
        <label class="small">Why it belongs, or why it doesn't${area(`choices.${i}.why`, c.why, 2)}</label></div>`).join('')}
      <div class="row gap"><button class="btn sm ghost" data-be="add-choice">${icon('plus')} Choice</button>${b.choices.length > 2 ? `<button class="btn sm ghost" data-be="drop-choice">Remove last choice</button>` : ''}</div>
      <label>Hint${inp('hint', b.hint)}</label><label>Wrap-up (optional)${area('why', b.why, 2)}</label>`;
    case 'input': return `<label>Question${area('q', b.q, 2)}</label>
      <div class="grid2"><label>Accepted answers (one per line)${area('lines:answers', lines(b.answers), 2)}</label>
      <div><label class="consent"><input type="checkbox" data-f="numeric" ${b.numeric ? 'checked' : ''}> <span>Number answer (accepts 0.5, 1/2, and so on)</span></label><label>Allowed error${`<input data-f="tolerance" type="number" step="any" value="${+b.tolerance || 0}">`}</label></div></div>
      <label>Common wrong answers, one per line: <code>answer | the mistake behind it</code>${area('pipes:mistakes', (b.mistakes || []).map((m) => `${m.answer} | ${m.why}`).join('\n'), 3, '-8 | You subtracted 4 instead of adding it to both sides.')}</label>
      <div class="grid2"><label>Hint${inp('hint', b.hint)}</label><label>Placeholder${inp('placeholder', b.placeholder)}</label></div><label>Explanation shown after answering${area('why', b.why, 2)}</label>`;
    case 'order': return `<label>Question${area('q', b.q, 2)}</label><label>Items in the CORRECT order (one per line; students see them shuffled)${area('lines:items', lines(b.items), 4)}</label><label>Hint${inp('hint', b.hint)}</label><label>Explanation${area('why', b.why, 2)}</label>`;
    case 'match': return `<label>Question${area('q', b.q, 2)}</label><label>Pairs, one per line: <code>left | right</code>${area('pairs:pairs', pipes(b.pairs), 4)}</label><label>Hint${inp('hint', b.hint)}</label><label>Explanation${area('why', b.why, 2)}</label>`;
    case 'reveal': return `<label>Prompt (think about this first)${area('prompt', b.prompt, 2)}</label><label>Button label${inp('label', b.label)}</label><label>Revealed text${area('html', b.html, 3)}</label>`;
    case 'steps': return `<label>Title${inp('title', b.title)}</label><label>Steps (one per line, revealed one at a time)${area('lines:steps', lines(b.steps), 5)}</label>`;
    case 'flip': return `<label>Cards, one per line: <code>front | back</code>${area('cards:cards', (b.cards || []).map((c) => `${c.front} | ${c.back}`).join('\n'), 4)}</label>`;
    case 'desmos': return `<label>Desmos expressions (one per line; JSON objects work too)${area('lines:expressions', lines(b.expressions), 3)}</label>`;
    case 'image': return `<label>Image URL (https)${inp('src', b.src)}</label><div class="grid2"><label>Alt text${inp('alt', b.alt)}</label><label>Caption${inp('caption', b.caption)}</label></div>`;
    case 'video': return `<label>YouTube link${inp('url', b.url, 'https://youtu.be/...')}</label><label>Caption${inp('caption', b.caption)}</label>`;
    case 'break': return `<label>Screen title (optional)${inp('title', b.title, 'Try it yourself')}</label>`;
    default: return `<label>Raw JSON${area('json', JSON.stringify(b, null, 2), 6)}</label>`;
  }
}

function setField(b, f, el) {
  const v = el.type === 'checkbox' ? el.checked : el.value;
  const split = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const two = (s) => split(s).map((l) => { const k = l.indexOf('|'); return k < 0 ? [l, ''] : [l.slice(0, k).trim(), l.slice(k + 1).trim()]; });
  if (f.startsWith('lines:')) { const k = f.slice(6); b[k] = split(v).map((x) => { if (k === 'expressions' && x.startsWith('{')) { try { return JSON.parse(x); } catch {} } return x; }); return; }
  if (f === 'pairs:pairs') { b.pairs = two(v); return; }
  if (f === 'pipes:mistakes') { b.mistakes = two(v).map(([answer, why]) => ({ answer, why })); return; }
  if (f === 'cards:cards') { b.cards = two(v).map(([front, back]) => ({ front, back })); return; }
  if (f === 'answer') { b.answer = +v; return; }
  if (f === 'tolerance') { b.tolerance = +v || 0; return; }
  const path = f.split('.');
  let o = b;
  for (const k of path.slice(0, -1)) o = o[k];
  o[path[path.length - 1]] = v;
}

/**
 * Mount the editor. lesson: the lesson row (body/check used to convert a classic lesson).
 * Returns { get(): blocks array or null }.
 */
export function mountBlockEditor(host, lesson) {
  let blocks = Array.isArray(lesson.blocks) && lesson.blocks.length ? structuredClone(lesson.blocks) : null;
  let stopPreview = null, timer = null;

  const draw = () => {
    if (!blocks) {
      host.innerHTML = `<p class="muted">This lesson uses the classic layout (text above, then the quick check). Make it interactive to add questions inside the lesson, step-by-step examples, put-in-order and matching activities, flip cards, videos, and more. Students play it one screen at a time.</p>
        <div class="row gap wrap"><button class="btn primary" data-be="convert">${icon('bolt')} Make interactive (start from this lesson)</button><button class="btn ghost" data-be="blank">Start blank</button></div>`;
      return;
    }
    host.innerHTML = `<div class="be-grid"><div class="be-list">${blocks.map((b, i) => {
      const probs = validateBlock(b);
      return `<div class="be-block${b.type === 'break' ? ' be-break' : ''}" data-i="${i}">
        <div class="row between gap"><b class="small">${i + 1}. ${esc(BLOCK_TYPES[b.type]?.label || b.type)}</b>
          <span class="row"><button class="btn sm ghost" data-be="up" ${i ? '' : 'disabled'} aria-label="Move up">${icon('up')}</button><button class="btn sm ghost" data-be="down" ${i < blocks.length - 1 ? '' : 'disabled'} aria-label="Move down">${icon('down')}</button><button class="btn sm ghost" data-be="dup" aria-label="Duplicate">${icon('cards')}</button><button class="btn sm ghost danger-text" data-be="del" aria-label="Delete">${icon('trash')}</button></span></div>
        <div class="stack">${fields(b)}</div>
        ${probs.length ? `<p class="small be-warn">${probs.map(esc).join(' ')}</p>` : ''}
        <div class="be-add"><select data-be-add="${i}" aria-label="Add a block after this one"><option value="">+ Add a block here…</option>${Object.entries(BLOCK_TYPES).map(([k, t]) => `<option value="${k}">${esc(t.label)}</option>`).join('')}</select></div>
      </div>`;
    }).join('')}
      ${blocks.length ? '' : `<div class="be-add"><select data-be-add="-1"><option value="">+ Add the first block…</option>${Object.entries(BLOCK_TYPES).map(([k, t]) => `<option value="${k}">${esc(t.label)}</option>`).join('')}</select></div>`}
      <div class="row gap wrap"><button class="btn sm ghost" data-be="json">Edit as JSON</button><button class="btn sm ghost danger-text" data-be="classic">Switch back to classic</button></div>
      </div>
      <div class="be-preview"><div class="row between"><b>Live preview</b><span class="muted small">Exactly what students see</span></div><div id="bePrev" class="be-prev-box"></div></div></div>`;
    preview();
  };
  const preview = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const el = $('#bePrev', host);
      if (!el) return;
      stopPreview?.();
      stopPreview = blocks.length ? mountLessonPlayer(el, { blocks, preview: true }) : null;
      if (!blocks.length) el.innerHTML = '<p class="muted">Add a block to see it here.</p>';
    }, 250);
  };

  host.addEventListener('input', (e) => {
    const el = e.target.closest('[data-f]'); if (!el || !blocks) return;
    const i = +el.closest('[data-i]').dataset.i;
    if (el.dataset.f === 'json') { try { blocks[i] = JSON.parse(el.value); } catch { return; } } else setField(blocks[i], el.dataset.f, el);
    preview();
  });
  host.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-be-add]');
    if (sel && sel.value) { blocks.splice(+sel.dataset.beAdd + 1, 0, BLOCK_TYPES[sel.value].template()); draw(); return; }
    if (e.target.matches('[data-f="answer"],[type=checkbox][data-f]')) draw();
  });
  host.addEventListener('click', (e) => {
    const t = e.target.closest('[data-be]'); if (!t) return;
    const a = t.dataset.be, i = +(t.closest('[data-i]')?.dataset.i ?? -1);
    if (a === 'convert') blocks = structuredClone(blocksFor({ ...lesson, blocks: null, desmosBounds: lesson.desmos_bounds }));
    if (a === 'blank') blocks = [BLOCK_TYPES.text.template()];
    if (a === 'up' || a === 'down') { const j = a === 'up' ? i - 1 : i + 1; [blocks[i], blocks[j]] = [blocks[j], blocks[i]]; }
    if (a === 'del') blocks.splice(i, 1);
    if (a === 'dup') blocks.splice(i + 1, 0, structuredClone(blocks[i]));
    if (a === 'add-choice') blocks[i].choices.push(blocks[i].type === 'multi' ? { text: '', correct: false, why: '' } : { text: '', why: '' });
    if (a === 'drop-choice') { blocks[i].choices.pop(); if (blocks[i].answer >= blocks[i].choices.length) blocks[i].answer = 0; }
    if (a === 'classic') { if (!confirm('Switch back to the classic layout? The interactive blocks are removed when you save.')) return; blocks = null; }
    if (a === 'json') {
      const raw = prompt('Blocks as JSON (an array). Paste to replace:', JSON.stringify(blocks));
      if (raw == null) return;
      try { const v = JSON.parse(raw); if (!Array.isArray(v)) throw new Error(); blocks = v; } catch { alert('That is not a JSON array of blocks.'); return; }
    }
    draw();
  });
  draw();
  return {
    get: () => (blocks && blocks.length ? blocks : null),
    problems: () => (blocks || []).flatMap((b, i) => validateBlock(b).map((p) => `Block ${i + 1}: ${p}`)),
  };
}
