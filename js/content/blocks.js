// Interactive lesson blocks: the data format stored in Supabase (lessons.blocks), plus grading.
// Shared by the website (js/views/lesson-player.js) and the iOS app, so there's no DOM here.
//
// A lesson is an ordered array of blocks. A { type: 'break' } block starts a new screen when the
// lesson player runs in "steps" mode (Admin > Content > Settings > lesson_player.mode).
// Text fields are HTML with math between dollar signs, the same as classic lesson bodies.
//
//   text     { html }
//   callout  { kind: 'tip' | 'rule' | 'warning' | 'example' | 'key', title?, html }
//   mcq      { q, choices: [{ text, why }], answer, hint? }          one right answer; `why` explains each choice
//   multi    { q, choices: [{ text, correct, why }], hint? }         select every correct choice
//   input    { q, answers: [..], numeric?, tolerance?, placeholder?, why, hint?, mistakes?: [{ answer, why }] }
//            `mistakes` lists common wrong answers and the slip that produces each one
//   order    { q, items: [..in the correct order], why, hint? }    students drag or tap them into order
//   match    { q, pairs: [[left, right], ..], why, hint? }          students pair each left item with a right item
//   reveal   { prompt, html, label? }                                 "think first", then tap to reveal
//   steps    { title?, steps: [html, ..] }                             a worked example shown one step at a time
//   flip     { cards: [{ front, back }] }                             flip cards for quick recall
//   desmos   { expressions: [..], bounds? }                           live graphing calculator
//   image    { src, alt, caption? }
//   video    { url, caption? }                                         YouTube link (watch, youtu.be, or shorts)
//   break    { title? }                                                new screen

export const BLOCK_TYPES = {
  text: { label: 'Text', interactive: false, template: () => ({ type: 'text', html: '<p></p>' }) },
  callout: { label: 'Callout box', interactive: false, template: () => ({ type: 'callout', kind: 'tip', title: '', html: '' }) },
  mcq: { label: 'Multiple choice', interactive: true, template: () => ({ type: 'mcq', q: '', answer: 0, hint: '', choices: [0, 1, 2, 3].map(() => ({ text: '', why: '' })) }) },
  multi: { label: 'Select all that apply', interactive: true, template: () => ({ type: 'multi', q: '', hint: '', choices: [0, 1, 2, 3].map(() => ({ text: '', correct: false, why: '' })) }) },
  input: { label: 'Type the answer', interactive: true, template: () => ({ type: 'input', q: '', answers: [''], numeric: false, tolerance: 0, placeholder: '', why: '', hint: '', mistakes: [] }) },
  order: { label: 'Put in order', interactive: true, template: () => ({ type: 'order', q: '', items: ['', '', ''], why: '', hint: '' }) },
  match: { label: 'Match pairs', interactive: true, template: () => ({ type: 'match', q: '', pairs: [['', ''], ['', ''], ['', '']], why: '', hint: '' }) },
  reveal: { label: 'Think, then reveal', interactive: false, template: () => ({ type: 'reveal', prompt: '', html: '', label: 'Show me' }) },
  steps: { label: 'Step-by-step example', interactive: false, template: () => ({ type: 'steps', title: 'Example', steps: ['', ''] }) },
  flip: { label: 'Flip cards', interactive: false, template: () => ({ type: 'flip', cards: [{ front: '', back: '' }, { front: '', back: '' }] }) },
  desmos: { label: 'Desmos graph', interactive: false, template: () => ({ type: 'desmos', expressions: ['y=x^2'] }) },
  image: { label: 'Image', interactive: false, template: () => ({ type: 'image', src: '', alt: '', caption: '' }) },
  video: { label: 'Video', interactive: false, template: () => ({ type: 'video', url: '', caption: '' }) },
  break: { label: 'New screen', interactive: false, template: () => ({ type: 'break', title: '' }) },
};

export const isQuestion = (b) => !!BLOCK_TYPES[b?.type]?.interactive;

/** Split blocks into screens at each break. Every screen is { title, blocks }. */
export function screens(blocks) {
  const out = [{ title: '', blocks: [] }];
  for (const b of blocks || []) {
    if (b.type === 'break') { if (out[out.length - 1].blocks.length) out.push({ title: b.title || '', blocks: [] }); else out[out.length - 1].title = b.title || ''; }
    else out[out.length - 1].blocks.push(b);
  }
  return out.filter((s) => s.blocks.length);
}

/** Blocks for a classic lesson (HTML body + optional Desmos + optional quick check), so every lesson plays the same way. */
export function blocksFor(lesson) {
  if (Array.isArray(lesson.blocks) && lesson.blocks.length) return lesson.blocks;
  const out = [{ type: 'text', html: lesson.body || '' }];
  if (lesson.desmos) out.push({ type: 'desmos', expressions: lesson.desmos, bounds: lesson.desmosBounds || null });
  const k = lesson.check;
  if (k) {
    out.push({ type: 'break', title: 'Quick check' });
    out.push({
      type: 'mcq', q: k.q, answer: k.answer, hint: k.hint || '',
      choices: k.choices.map((t, i) => ({ text: t, why: (k.choiceWhy && k.choiceWhy[i]) || (i === k.answer ? k.why : '') })),
      why: k.why,
    });
  }
  return out;
}

// ---------- Grading (pure) ----------

const norm = (s) => String(s ?? '').toLowerCase().replace(/\$/g, '').replace(/\\,|\s+/g, '').replace(/[−–]/g, '-').replace(/^\+/, '');

/** Parse "3", "-2.5", "3/4", "-1 1/2", "1,200" into a number, or NaN. */
export function parseNum(s) {
  const t = String(s ?? '').trim().replace(/[−–]/g, '-').replace(/,(?=\d{3}\b)/g, '').replace(/\$/g, '');
  let m = t.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return (m[1] ? -1 : 1) * (+m[2] + +m[3] / +m[4]);
  m = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (m) return +m[2] === 0 ? NaN : +m[1] / +m[2];
  return t === '' ? NaN : Number(t);
}

/** { ok, why } for an input block. `why` explains a recognized wrong answer (from block.mistakes). */
export function gradeInput(b, value) {
  const close = (a, x) => Math.abs(a - x) <= (Number(b.tolerance) || 1e-9) + 1e-9;
  const matches = (target) => {
    if (b.numeric) { const v = parseNum(value), t = parseNum(target); return !isNaN(v) && !isNaN(t) && close(v, t); }
    return norm(value) === norm(target);
  };
  if ((b.answers || []).some(matches)) return { ok: true, why: '' };
  const known = (b.mistakes || []).find((m) => matches(m.answer));
  return { ok: false, why: known ? known.why : '' };
}

/** { ok, wrong: [indexes picked that are wrong], missed: [correct indexes not picked] } for a multi block. */
export function gradeMulti(b, picked) {
  const set = new Set(picked);
  const wrong = [], missed = [];
  b.choices.forEach((c, i) => { if (c.correct && !set.has(i)) missed.push(i); if (!c.correct && set.has(i)) wrong.push(i); });
  return { ok: !wrong.length && !missed.length, wrong, missed };
}

/** { ok, right: count in the right spot } for an order block. `order` is an array of original item indexes. */
export function gradeOrder(b, order) {
  const right = order.filter((v, i) => v === i).length;
  return { ok: right === b.items.length, right };
}

/** { ok, right } for a match block. `pairing[i]` is the right-hand index chosen for left item i. */
export function gradeMatch(b, pairing) {
  const right = b.pairs.filter((_, i) => pairing[i] === i).length;
  return { ok: right === b.pairs.length, right };
}

/** Short problems with a block, for the admin editor. Empty array means it's fine. */
export function validateBlock(b) {
  const p = [];
  const t = BLOCK_TYPES[b?.type];
  if (!t) return [`Unknown block type "${b?.type}".`];
  if (b.type === 'mcq') {
    if (!b.q) p.push('Add the question.');
    if (!b.choices || b.choices.length < 2 || b.choices.some((c) => !String(c.text).trim())) p.push('Fill in every choice.');
    if (!(b.answer >= 0 && b.answer < (b.choices || []).length)) p.push('Pick the correct choice.');
  }
  if (b.type === 'multi') {
    if (!b.q) p.push('Add the question.');
    if (!b.choices?.some((c) => c.correct)) p.push('Mark at least one choice correct.');
    if (b.choices?.some((c) => !String(c.text).trim())) p.push('Fill in every choice.');
  }
  if (b.type === 'input' && !(b.answers || []).some((a) => String(a).trim())) p.push('Add at least one accepted answer.');
  if (b.type === 'order' && (b.items || []).filter((x) => String(x).trim()).length < 2) p.push('Add at least two items.');
  if (b.type === 'match' && (b.pairs || []).filter((x) => x[0] && x[1]).length < 2) p.push('Add at least two complete pairs.');
  if (b.type === 'video' && !youtubeId(b.url)) p.push('Use a YouTube link.');
  return p;
}

/** The video id in a YouTube watch, youtu.be, shorts, or embed link, or ''. */
export function youtubeId(url) {
  const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : '';
}
