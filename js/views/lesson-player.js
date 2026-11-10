// Interactive lesson player. Plays a lesson's blocks (js/content/blocks.js) one screen at a time,
// or all on one page, depending on content_settings.lesson_player (editable in the admin console).
// Classic lessons (HTML body + quick check) are converted to blocks, so every lesson plays here.
import { icon } from '../icons.js';
import { $, esc, tex } from '../util.js';
import { store } from '../store.js';
import { setting } from '../content/settings.js';
import { blocksFor, screens as splitScreens, isQuestion, gradeInput, gradeMulti, gradeOrder, gradeMatch, youtubeId } from '../content/blocks.js';
import { choiceNotes } from '../explain.js';
import { mountCalculator } from '../tools.js';

const L = (i) => 'ABCDEFGH'[i];
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
// Shuffle, but never hand back the solved order (that would make the question trivial).
const scramble = (n) => { const id = [...Array(n).keys()]; if (n < 2) return id; let s; do s = shuffle(id); while (s.every((v, i) => v === i)); return s; };

/**
 * Mount the player.
 * opts: { blocks?, lesson?, key, onFinish(score), finishHTML?, preview? }
 * `preview` (admin editor) keeps nothing in the student's progress.
 * Returns a cleanup function.
 */
export function mountLessonPlayer(host, opts) {
  const cfg = setting('lesson_player');
  const blocks = opts.blocks || blocksFor(opts.lesson);
  const scr = splitScreens(blocks);
  const flat = scr.flatMap((s, si) => s.blocks.map((b) => ({ b, si })));
  const st = flat.map(({ b }) => init(b));
  const saved = !opts.preview && opts.key ? (store.data().lessonState || {})[opts.key] : null;
  let cur = Math.min(saved?.screen || 0, scr.length - 1), finished = false, alive = true;
  const calcs = new Map();
  const steps = cfg.mode !== 'scroll';

  function init(b) {
    if (b.type === 'order') return { order: scramble(b.items.length), tries: 0 };
    if (b.type === 'match') return { right: scramble(b.pairs.length), pairing: b.pairs.map(() => -1), tries: 0 };
    if (b.type === 'multi') return { picked: [], tries: 0 };
    if (b.type === 'steps') return { shown: 1 };
    if (b.type === 'flip') return { flipped: [] };
    return { tries: 0, wrong: [] };
  }
  const resolved = (i) => !isQuestion(flat[i].b) || st[i].done;
  const screenReady = (si) => !cfg.gate_questions || flat.every((x, i) => x.si !== si || resolved(i));
  const maxTries = Math.max(1, +cfg.max_tries || 1);

  // ---------- Block HTML ----------
  const hintHTML = (b, s) => b.hint && cfg.show_hint_after_wrong && s.tries > 0 && !s.done ? `<div class="lb-hint">${icon('brain')} <b>Hint.</b> ${tex(b.hint)}</div>` : '';
  const verdict = (s, okText = 'Correct.') => s.done ? `<div class="lb-verdict ${s.ok ? 'ok' : 'bad'}">${s.ok ? `${icon('check')} ${s.tries === 1 ? okText : 'Got it.'}` : `${icon('x')} Here's the answer.`}</div>` : '';

  function mcqHTML(b, s) {
    const q = { choices: b.choices.map((c) => c.text), answer: b.answer, choiceExpl: b.choices.map((c) => c.why || '') };
    const notes = choiceNotes(q);
    const last = s.wrong[s.wrong.length - 1];
    return `<div class="lb-q">${tex(b.q)}</div>
      <ol class="choices">${b.choices.map((c, i) => {
        const cls = s.done && i === b.answer ? 'correct' : s.wrong.includes(i) ? 'wrong' : '';
        return `<li class="${cls}"><button class="choice" data-act="mcq" data-v="${i}" ${s.done || s.wrong.includes(i) ? 'disabled' : ''}><span class="letter">${L(i)}</span><span class="ctext">${tex(c.text)}</span></button></li>`;
      }).join('')}</ol>
      ${!s.done && last != null ? `<div class="lb-try">${icon('x')} <b>Not quite.</b> ${notes[last].why ? tex(notes[last].why) : 'Take another look.'} <span class="muted small">${maxTries - s.tries} ${maxTries - s.tries === 1 ? 'try' : 'tries'} left.</span></div>` : ''}
      ${hintHTML(b, s)}${verdict(s)}
      ${s.done ? `${b.why ? `<div class="lb-why">${tex(b.why)}</div>` : ''}
        ${cfg.explain_every_choice && notes.some((n) => n.why) ? `<details class="choice-why"${s.wrong.length ? ' open' : ''}><summary>${icon('clipboard')} Why each choice is right or wrong</summary><ol>${b.choices.map((c, i) => `<li class="${i === b.answer ? 'right' : s.wrong.includes(i) ? 'picked' : ''}"><span class="letter">${L(i)}</span><div><div class="cw-choice">${tex(c.text)} ${i === b.answer ? '<span class="tag good">Correct</span>' : s.wrong.includes(i) ? '<span class="tag bad">You picked</span>' : ''}</div><div class="cw-why">${notes[i].why ? tex(notes[i].why) : ''}</div></div></li>`).join('')}</ol></details>` : ''}` : ''}`;
  }

  function multiHTML(b, s) {
    const g = s.last;
    return `<div class="lb-q">${tex(b.q)} <span class="muted small">Select all that apply.</span></div>
      <ol class="choices">${b.choices.map((c, i) => {
        const on = s.picked.includes(i);
        const cls = s.done ? (c.correct ? 'correct' : on ? 'wrong' : '') : on ? 'sel' : '';
        return `<li class="${cls}"><button class="choice" data-act="multi" data-v="${i}" ${s.done ? 'disabled' : ''} aria-pressed="${on}"><span class="letter box">${on ? icon('check') : ''}</span><span class="ctext">${tex(c.text)}</span></button></li>`;
      }).join('')}</ol>
      ${!s.done ? `<div class="row gap"><button class="btn primary sm" data-act="check" ${s.picked.length ? '' : 'disabled'}>Check</button></div>` : ''}
      ${!s.done && g && !g.ok ? `<div class="lb-try">${icon('x')} <b>Not yet.</b> ${g.wrong.length ? `${g.wrong.length} of your picks ${g.wrong.length === 1 ? "doesn't" : "don't"} belong. ` : ''}${g.missed.length ? `You're missing ${g.missed.length}.` : ''}
        ${g.wrong.map((i) => b.choices[i].why ? `<div class="small"><b>${L(i)}.</b> ${tex(b.choices[i].why)}</div>` : '').join('')}</div>` : ''}
      ${hintHTML(b, s)}${verdict(s)}
      ${s.done ? `${b.why ? `<div class="lb-why">${tex(b.why)}</div>` : ''}${cfg.explain_every_choice && b.choices.some((c) => c.why) ? `<details class="choice-why"${s.ok ? '' : ' open'}><summary>${icon('clipboard')} Why each choice is in or out</summary><ol>${b.choices.map((c, i) => `<li class="${c.correct ? 'right' : s.picked.includes(i) ? 'picked' : ''}"><span class="letter">${L(i)}</span><div><div class="cw-choice">${tex(c.text)} ${c.correct ? '<span class="tag good">Belongs</span>' : '<span class="tag">Doesn\'t belong</span>'}</div><div class="cw-why">${c.why ? tex(c.why) : ''}</div></div></li>`).join('')}</ol></details>` : ''}` : ''}`;
  }

  function inputHTML(b, s, i) {
    return `<div class="lb-q">${tex(b.q)}</div>
      <form class="row gap wrap lb-input" data-form="${i}"><input name="v" value="${esc(s.value || '')}" placeholder="${esc(b.placeholder || (b.numeric ? 'Your answer, like 12 or 3/4' : 'Your answer'))}" ${s.done ? 'disabled' : ''} autocomplete="off" inputmode="${b.numeric ? 'decimal' : 'text'}" aria-label="Your answer">
        ${s.done ? '' : '<button class="btn primary sm">Check</button>'}</form>
      ${!s.done && s.tries ? `<div class="lb-try">${icon('x')} <b>Not quite.</b> ${s.why ? tex(s.why) : 'Check your work and try again.'} <span class="muted small">${maxTries - s.tries} ${maxTries - s.tries === 1 ? 'try' : 'tries'} left.</span></div>` : ''}
      ${hintHTML(b, s)}${verdict(s)}
      ${s.done ? `${!s.ok ? `<div class="lb-try">${s.why ? `<div><b>Your answer.</b> ${tex(s.why)}</div>` : ''}<div><b>Answer:</b> ${tex(String(b.answers[0]))}</div></div>` : ''}${b.why ? `<div class="lb-why">${tex(b.why)}</div>` : ''}` : ''}`;
  }

  function orderHTML(b, s) {
    const g = s.last;
    return `<div class="lb-q">${tex(b.q)} <span class="muted small">Use the arrows to put them in order.</span></div>
      <ol class="lb-order">${s.order.map((v, k) => `<li class="${s.done || g ? (v === k ? 'ok' : g && !s.done ? 'off' : 'bad') : ''}"><span class="lnum">${k + 1}</span><span class="grow">${tex(b.items[v])}</span>
        ${s.done ? '' : `<span class="row"><button class="btn sm ghost" data-act="up" data-v="${k}" ${k ? '' : 'disabled'} aria-label="Move up">${icon('up')}</button><button class="btn sm ghost" data-act="down" data-v="${k}" ${k < s.order.length - 1 ? '' : 'disabled'} aria-label="Move down">${icon('down')}</button></span>`}</li>`).join('')}</ol>
      ${!s.done ? `<div class="row gap"><button class="btn primary sm" data-act="check">Check order</button></div>` : ''}
      ${!s.done && g ? `<div class="lb-try">${icon('x')} <b>${g.right} of ${b.items.length} are in the right spot.</b> The highlighted ones are placed correctly. <span class="muted small">${maxTries - s.tries} ${maxTries - s.tries === 1 ? 'try' : 'tries'} left.</span></div>` : ''}
      ${hintHTML(b, s)}${verdict(s)}
      ${s.done && !s.ok ? `<div class="lb-try"><b>Correct order:</b><ol>${b.items.map((x) => `<li>${tex(x)}</li>`).join('')}</ol></div>` : ''}
      ${s.done && b.why ? `<div class="lb-why">${tex(b.why)}</div>` : ''}`;
  }

  function matchHTML(b, s, i) {
    const g = s.last;
    return `<div class="lb-q">${tex(b.q)}</div>
      <div class="lb-match">${b.pairs.map((p, k) => {
        const mark = s.done ? (s.pairing[k] === k ? 'ok' : 'bad') : g && s.pairing[k] === k ? 'ok' : g ? 'off' : '';
        return `<div class="lb-pair ${mark}"><span class="lb-left">${tex(p[0])}</span>${icon('right')}
          ${s.done ? `<span class="lb-right">${tex(b.pairs[k][1])}</span>` : `<select data-match="${i}|${k}" aria-label="Match for item ${k + 1}"><option value="-1">Choose…</option>${s.right.map((r) => `<option value="${r}" ${s.pairing[k] === r ? 'selected' : ''}>${esc(String(b.pairs[r][1]).replace(/<[^>]+>/g, '').replace(/\$/g, ''))}</option>`).join('')}</select>`}</div>`;
      }).join('')}</div>
      ${!s.done ? `<div class="row gap"><button class="btn primary sm" data-act="check" ${s.pairing.includes(-1) ? 'disabled' : ''}>Check matches</button></div>` : ''}
      ${!s.done && g ? `<div class="lb-try">${icon('x')} <b>${g.right} of ${b.pairs.length} match.</b> The green ones are right. <span class="muted small">${maxTries - s.tries} ${maxTries - s.tries === 1 ? 'try' : 'tries'} left.</span></div>` : ''}
      ${hintHTML(b, s)}${verdict(s)}${s.done && b.why ? `<div class="lb-why">${tex(b.why)}</div>` : ''}`;
  }

  function blockHTML(b, i) {
    const s = st[i];
    switch (b.type) {
      case 'text': return `<div class="lesson-body lb-text">${tex(b.html || '')}</div>`;
      case 'callout': return `<div class="lb-callout k-${esc(b.kind || 'tip')}">${b.title ? `<b>${tex(b.title)}</b>` : ''}<div>${tex(b.html || '')}</div></div>`;
      case 'mcq': return mcqHTML(b, s);
      case 'multi': return multiHTML(b, s);
      case 'input': return inputHTML(b, s, i);
      case 'order': return orderHTML(b, s);
      case 'match': return matchHTML(b, s, i);
      case 'reveal': return `<div class="lb-reveal"><div>${tex(b.prompt || '')}</div>${s.open ? `<div class="lb-why">${tex(b.html || '')}</div>` : `<button class="btn sm" data-act="reveal">${icon('expand')} ${esc(b.label || 'Show me')}</button>`}</div>`;
      case 'steps': return `<div class="worked lb-steps">${b.title ? `<b>${tex(b.title)}</b>` : ''}<ol>${b.steps.slice(0, s.shown).map((x) => `<li>${tex(x)}</li>`).join('')}</ol>
        ${s.shown < b.steps.length ? `<button class="btn sm" data-act="step">Next step (${s.shown + 1} of ${b.steps.length})</button>` : ''}</div>`;
      case 'flip': return `<div class="lb-flips">${b.cards.map((c, k) => `<button class="lb-flip${s.flipped.includes(k) ? ' on' : ''}" data-act="flip" data-v="${k}" aria-pressed="${s.flipped.includes(k)}"><span class="lb-face">${tex(s.flipped.includes(k) ? c.back : c.front)}</span><span class="muted small">${s.flipped.includes(k) ? 'Tap to flip back' : 'Tap to flip'}</span></button>`).join('')}</div>`;
      case 'desmos': return `<div class="row between wrap gap"><b>${icon('calculator')} Try it in Desmos</b><button class="btn sm ghost" data-act="calc-reset">Reset</button></div><div class="calc-full lesson-calc" data-calc="${i}"><div class="calc-loading">Loading Desmos…</div></div>`;
      case 'image': return b.src ? `<figure class="lb-fig"><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy">${b.caption ? `<figcaption class="muted small">${tex(b.caption)}</figcaption>` : ''}</figure>` : '';
      case 'video': { const id = youtubeId(b.url); return id ? `<figure class="lb-fig"><div class="lb-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(b.caption || 'Video')}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${b.caption ? `<figcaption class="muted small">${tex(b.caption)}</figcaption>` : ''}</figure>` : ''; }
      default: return '';
    }
  }

  const blockWrap = (i) => `<section class="lb lb-${flat[i].b.type}${isQuestion(flat[i].b) ? ' card lb-question' : ''}" data-b="${i}">${blockHTML(flat[i].b, i)}</section>`;

  // ---------- Screens ----------
  function screenHTML(si) {
    const idx = flat.map((x, i) => (x.si === si ? i : -1)).filter((i) => i >= 0);
    return `${scr[si].title ? `<h2 class="lb-screen-title">${esc(scr[si].title)}</h2>` : ''}${idx.map(blockWrap).join('')}`;
  }
  const qCount = () => flat.filter((x) => isQuestion(x.b)).length;
  const score = () => ({ total: qCount(), first: st.filter((s, i) => isQuestion(flat[i].b) && s.done && s.ok && s.tries === 1).length, right: st.filter((s, i) => isQuestion(flat[i].b) && s.ok).length });

  function navHTML() {
    const ready = screenReady(cur);
    const last = cur === scr.length - 1;
    return `<div class="lp-nav">
      ${cur ? `<button class="btn ghost" data-act="back">${icon('left')} Back</button>` : '<span></span>'}
      <span class="muted small lp-wait">${ready ? '' : 'Answer the question to continue'}</span>
      <button class="btn primary" data-act="next" ${ready ? '' : 'disabled'}>${last ? 'Finish lesson' : 'Continue'} ${icon('right')}</button></div>`;
  }

  function finishHTML() {
    const s = score();
    return `<div class="card center stack lp-done">
      ${cfg.celebrate ? `<div class="lp-burst" aria-hidden="true">${icon('trophy')}</div>` : ''}
      <h2>Lesson complete</h2>
      ${s.total ? `<p class="muted">${s.first} of ${s.total} questions right on the first try${s.right > s.first ? `, ${s.right - s.first} more after a retry` : ''}.</p>` : ''}
      ${opts.finishHTML || ''}
      <button class="btn ghost sm" data-act="restart">${icon('shuffle')} Replay lesson</button></div>`;
  }

  function draw() {
    calcs.forEach((c) => c?.destroy?.()); calcs.clear();
    if (finished) { host.innerHTML = finishHTML(); return; }
    const dots = scr.length > 1 && steps ? `<div class="lp-dots" role="progressbar" aria-valuemin="1" aria-valuemax="${scr.length}" aria-valuenow="${cur + 1}" aria-label="Lesson progress">${scr.map((_, k) => `<i class="${k < cur ? 'done' : k === cur ? 'on' : ''}"></i>`).join('')}</div>` : '';
    host.innerHTML = steps
      ? `${dots}<div class="lp-screen">${screenHTML(cur)}</div>${navHTML()}`
      : `<div class="lp-screen">${scr.map((_, k) => screenHTML(k)).join('')}</div><div class="lp-nav"><span></span><span></span><button class="btn primary" data-act="finish">Finish lesson ${icon('right')}</button></div>`;
    mountCalcs();
  }

  function paint(i) {
    const el = host.querySelector(`[data-b="${i}"]`);
    if (el) el.innerHTML = blockHTML(flat[i].b, i);
    if (flat[i].b.type === 'desmos') mountCalcs();
    const nav = host.querySelector('.lp-nav');
    if (nav && steps) nav.outerHTML = navHTML();
  }

  function mountCalcs() {
    host.querySelectorAll('[data-calc]').forEach(async (el) => {
      const i = +el.dataset.calc, b = flat[i].b;
      if (calcs.has(i)) return;
      calcs.set(i, null);
      try {
        const c = await mountCalculator((el.innerHTML = '', el), 'graphing');
        if (!alive || !el.isConnected) return c.destroy?.();
        calcs.set(i, c);
        (b.expressions || []).forEach((e, k) => c.setExpression(typeof e === 'string' ? { id: 'e' + k, latex: e } : { id: 'e' + k, ...e }));
        if (b.bounds) c.setMathBounds(b.bounds);
      } catch (e) { el.innerHTML = `<div class="calc-loading">${esc(e.message)}</div>`; }
    });
  }

  function remember() {
    if (opts.preview || !opts.key) return;
    (store.data().lessonState ||= {})[opts.key] = { screen: cur, ts: Date.now() };
    store.save();
  }

  // ---------- Answers ----------
  function settle(i, ok) {
    const s = st[i];
    s.tries++;
    if (ok || s.tries >= maxTries) { s.done = true; s.ok = ok; }
  }

  function act(t, i) {
    const b = flat[i]?.b, s = st[i];
    const a = t.dataset.act, v = +t.dataset.v;
    if (a === 'mcq' && !s.done) { if (v !== b.answer) s.wrong.push(v); settle(i, v === b.answer); return paint(i); }
    if (a === 'multi' && !s.done) { s.picked = s.picked.includes(v) ? s.picked.filter((x) => x !== v) : [...s.picked, v]; s.last = null; return paint(i); }
    if (a === 'check') {
      if (b.type === 'multi') { s.last = gradeMulti(b, s.picked); settle(i, s.last.ok); }
      if (b.type === 'order') { s.last = gradeOrder(b, s.order); settle(i, s.last.ok); }
      if (b.type === 'match') { s.last = gradeMatch(b, s.pairing); settle(i, s.last.ok); }
      return paint(i);
    }
    if (a === 'up' || a === 'down') { const j = a === 'up' ? v - 1 : v + 1; [s.order[v], s.order[j]] = [s.order[j], s.order[v]]; s.last = null; return paint(i); }
    if (a === 'reveal') { s.open = true; return paint(i); }
    if (a === 'step') { s.shown++; return paint(i); }
    if (a === 'flip') { s.flipped = s.flipped.includes(v) ? s.flipped.filter((x) => x !== v) : [...s.flipped, v]; return paint(i); }
    if (a === 'calc-reset') { calcs.get(i)?.destroy?.(); calcs.delete(i); host.querySelector(`[data-calc="${i}"]`).innerHTML = ''; return mountCalcs(); }
  }

  const onClick = (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || !host.contains(t)) return;
    const a = t.dataset.act;
    if (a === 'next') {
      if (!screenReady(cur)) return;
      if (cur < scr.length - 1) { cur++; remember(); draw(); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      finished = true; draw(); opts.onFinish?.(score()); return;
    }
    if (a === 'back') { cur = Math.max(0, cur - 1); draw(); return; }
    if (a === 'finish') { finished = true; draw(); opts.onFinish?.(score()); return; }
    if (a === 'restart') { st.splice(0, st.length, ...flat.map(({ b }) => init(b))); cur = 0; finished = false; remember(); draw(); return; }
    const blk = t.closest('[data-b]');
    if (blk) act(t, +blk.dataset.b);
  };
  const onSubmit = (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const i = +f.dataset.form, s = st[i], v = f.v.value.trim();
    if (!v || s.done) return;
    s.value = v;
    const g = gradeInput(flat[i].b, v);
    s.why = g.why;
    settle(i, g.ok);
    paint(i);
    host.querySelector(`[data-form="${i}"] input`)?.focus();
  };
  const onChange = (e) => {
    const m = e.target.closest('[data-match]');
    if (!m) return;
    const [i, k] = m.dataset.match.split('|').map(Number);
    st[i].pairing[k] = +m.value; st[i].last = null;
    const btn = host.querySelector(`[data-b="${i}"] [data-act="check"]`);
    if (btn) btn.disabled = st[i].pairing.includes(-1);
  };
  host.addEventListener('click', onClick);
  host.addEventListener('submit', onSubmit);
  host.addEventListener('change', onChange);
  draw();
  return () => { alive = false; calcs.forEach((c) => c?.destroy?.()); host.removeEventListener('click', onClick); host.removeEventListener('submit', onSubmit); host.removeEventListener('change', onChange); };
}
