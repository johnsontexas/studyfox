// Quizlet-style flashcards: library, editor/import, flip viewer, Learn, Test, Match, share links.
import { icon, sticker } from '../icons.js';
import { $, $$, esc, toast, uid, b64enc, b64dec, fmtTime, rng, newSeed } from '../util.js';
import { store } from '../store.js';
import { BUILTIN_DECKS } from '../content/decks.js';
import { modal, confirmBox } from '../tools.js';

const getSet = (id) => BUILTIN_DECKS.find((d) => d.id === id) || store.getSet(id);
const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const shuffle = (a) => rng(newSeed()).shuffle(a);

function notFound(root) { root.innerHTML = `<div class="page narrow"><h1>Set not found</h1><a class="btn" href="#/flashcards">Back to flashcards</a></div>`; }

function setCard(s) {
  const p = store.progress(s.id);
  const mastered = Object.values(p.mastery).filter((m) => m >= 2).length;
  return `<a class="set-card card hover" href="#/flashcards/${encodeURIComponent(s.id)}">
    <h3>${esc(s.title)}</h3>
    <div class="row gap wrap"><span class="tag">${s.cards.length} terms</span>${s.tag ? `<span class="tag subtle">${esc(s.tag)}</span>` : ''}</div>
    ${s.desc ? `<p class="muted small clamp2">${esc(s.desc)}</p>` : ''}
    ${mastered ? `<div class="bar thin"><i class="good" style="width:${(100 * mastered) / s.cards.length}%"></i></div>` : ''}
  </a>`;
}

export function libraryView(root) {
  const st = { q: '' };
  function draw() {
    const mine = store.sets().filter((s) => !st.q || norm(s.title + ' ' + s.desc).includes(norm(st.q)));
    const built = BUILTIN_DECKS.filter((s) => !st.q || norm(s.title + ' ' + s.desc + ' ' + s.tag).includes(norm(st.q)));
    $('#lists', root).innerHTML = `
      <h2 class="section-title left">Your sets</h2>
      ${mine.length ? `<div class="set-grid">${mine.map(setCard).join('')}</div>` : `<div class="empty card slim"><p>You haven't made any sets yet.</p><a class="btn primary" href="#/flashcards/new">Create your first set</a></div>`}
      <h2 class="section-title left">Free study sets</h2>
      <div class="set-grid">${built.map(setCard).join('')}</div>`;
  }
  root.innerHTML = `
  <div class="page">
    <div class="row between wrap gap"><div><h1>Flashcards</h1><p class="muted">Make, import, and share study sets. Study them with Flashcards, Learn, Test, and Match. No ads, no limits, no paywall.</p></div>
      <div class="row gap"><a class="btn primary" href="#/flashcards/new">＋ Create set</a></div></div>
    <input class="search" id="search" placeholder="Search your sets and free study sets…">
    <div id="lists"></div>
  </div>`;
  $('#search', root).addEventListener('input', (e) => { st.q = e.target.value; draw(); });
  draw();
}

// ---------- Editor ----------
export function editView(root, { id } = {}) {
  const existing = id ? store.getSet(id) : null;
  if (id && !existing) return notFound(root);
  const set = existing ? JSON.parse(JSON.stringify(existing)) : { title: '', desc: '', cards: [{ t: '', d: '' }, { t: '', d: '' }, { t: '', d: '' }] };
  function rowHTML(c, i) {
    return `<div class="edit-row card" data-i="${i}"><div class="row between"><span class="muted">${i + 1}</span><button class="icon-btn" data-del="${i}" title="Delete card" aria-label="Delete card">${icon('trash')}</button></div>
      <div class="grid2"><label>Term<textarea rows="1" data-f="t">${esc(c.t)}</textarea></label><label>Definition<textarea rows="1" data-f="d">${esc(c.d)}</textarea></label></div></div>`;
  }
  function draw() {
    root.innerHTML = `
    <div class="page narrow-wide">
      <div class="row between wrap gap"><h1>${existing ? 'Edit set' : 'Create a new study set'}</h1><div class="row gap"><button class="btn" id="importBtn">${icon('upload')} Import</button><button class="btn primary" id="save">${existing ? 'Save' : 'Create'}</button></div></div>
      <div class="card stack"><label>Title<input id="title" value="${esc(set.title)}" placeholder='e.g. "Unit 3 vocab"'></label><label>Description<textarea id="desc" rows="2" placeholder="Add a description…">${esc(set.desc)}</textarea></label></div>
      <div id="rows" class="stack">${set.cards.map(rowHTML).join('')}</div>
      <button class="btn block dashed" id="addRow">＋ Add card</button>
      <div class="row end"><button class="btn primary lg" id="save2">${existing ? 'Save' : 'Create'}</button></div>
    </div>`;
    autosize();
  }
  const autosize = () => $$('textarea', root).forEach((t) => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; });
  function sync() {
    set.title = $('#title', root).value; set.desc = $('#desc', root).value;
    $$('.edit-row', root).forEach((r) => { const i = +r.dataset.i; set.cards[i] = { t: $('[data-f=t]', r).value, d: $('[data-f=d]', r).value }; });
  }
  function save() {
    sync();
    const cards = set.cards.map((c) => ({ t: c.t.trim(), d: c.d.trim() })).filter((c) => c.t || c.d);
    if (!set.title.trim()) return toast('Give your set a title.', 'bad');
    if (cards.length < 2) return toast('Add at least two cards.', 'bad');
    const sid = store.upsertSet({ ...(existing || {}), title: set.title.trim(), desc: set.desc.trim(), cards });
    toast('Saved!', 'good'); location.hash = '#/flashcards/' + sid;
  }
  root.addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 2 + 'px'; } });
  root.addEventListener('keydown', (e) => {
    // Tab from the last definition adds a new card, like Quizlet
    if (e.key === 'Tab' && !e.shiftKey && e.target.dataset.f === 'd' && e.target.closest('.edit-row') === $$('.edit-row', root).at(-1)) {
      e.preventDefault(); sync(); set.cards.push({ t: '', d: '' }); draw(); $$('.edit-row', root).at(-1).querySelector('textarea').focus();
    }
  });
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.id === 'addRow') { sync(); set.cards.push({ t: '', d: '' }); draw(); $$('.edit-row', root).at(-1).querySelector('textarea').focus(); }
    if (t.closest('[data-del]')) { sync(); set.cards.splice(+t.closest('[data-del]').dataset.del, 1); if (!set.cards.length) set.cards.push({ t: '', d: '' }); draw(); }
    if (t.id === 'save' || t.id === 'save2') save();
    if (t.id === 'importBtn') {
      sync();
      const m = modal(`<p class="muted">Copy and paste your data from Word, Excel, Google Docs, or Quizlet's export.</p>
        <textarea id="impText" rows="9" placeholder="Word 1&#9;Definition 1&#10;Word 2&#9;Definition 2"></textarea>
        <div class="grid2"><div><b>Between term and definition</b><label class="radio"><input type="radio" name="sep" value="tab" checked> Tab</label><label class="radio"><input type="radio" name="sep" value="comma"> Comma</label><label class="radio"><input type="radio" name="sep" value="dash"> Dash ( - )</label></div>
        <div><b>Between cards</b><label class="radio"><input type="radio" name="row" value="nl" checked> New line</label><label class="radio"><input type="radio" name="row" value="semi"> Semicolon</label></div></div>
        <div class="muted small" id="impPrev">0 cards detected</div>
        <div class="row end gap"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="impGo">Import</button></div>`, { title: 'Import cards', wide: true });
      const parse = () => {
        const txt = $('#impText', m.el).value;
        const sep = m.el.querySelector('[name=sep]:checked').value, row = m.el.querySelector('[name=row]:checked').value;
        return txt.split(row === 'nl' ? /\r?\n/ : ';').map((line) => {
          const i = sep === 'tab' ? line.indexOf('\t') : sep === 'comma' ? line.indexOf(',') : line.indexOf(' - ');
          if (i < 0) return null;
          return { t: line.slice(0, i).trim(), d: line.slice(i + (sep === 'dash' ? 3 : 1)).trim() };
        }).filter((c) => c && (c.t || c.d));
      };
      m.el.addEventListener('input', () => ($('#impPrev', m.el).textContent = `${parse().length} cards detected`));
      m.el.addEventListener('change', () => ($('#impPrev', m.el).textContent = `${parse().length} cards detected`));
      $('#impGo', m.el).onclick = () => {
        const cards = parse();
        if (!cards.length) return toast('No cards found. Check your separators.', 'bad');
        set.cards = set.cards.filter((c) => c.t || c.d).concat(cards); m.close(); draw(); toast(`Imported ${cards.length} cards.`, 'good');
      };
    }
  });
  draw();
}

// ---------- Set overview + flip viewer ----------
export function setView(root, { id }) {
  const s = getSet(id);
  if (!s) return notFound(root);
  const p = store.progress(s.id);
  const st = { i: 0, flipped: false, order: s.cards.map((_, i) => i), shuffled: false, starredOnly: false, back: false };
  const deck = () => (st.starredOnly ? st.order.filter((i) => p.starred.includes(i)) : st.order);

  function drawCard() {
    const d = deck();
    const box = $('#viewer', root);
    if (!d.length) { box.innerHTML = '<div class="flip-empty">No starred cards yet. Tap the star on a card to save it here.</div>'; return; }
    st.i = Math.min(st.i, d.length - 1);
    const ci = d[st.i], c = s.cards[ci];
    const front = st.back ? c.d : c.t, backTxt = st.back ? c.t : c.d;
    box.innerHTML = `
      <div class="flip ${st.flipped ? 'flipped' : ''}" id="flip" tabindex="0" aria-label="Flashcard. Press space to flip.">
        <div class="face front"><button class="star ${p.starred.includes(ci) ? 'on' : ''}" data-star="${ci}" title="Star">${p.starred.includes(ci) ? icon('star', { fill: true }) : icon('star')}</button><div class="face-txt">${esc(front)}</div><span class="hint">Click or press space to flip</span></div>
        <div class="face back"><button class="star ${p.starred.includes(ci) ? 'on' : ''}" data-star="${ci}">${p.starred.includes(ci) ? icon('star', { fill: true }) : icon('star')}</button><div class="face-txt">${esc(backTxt)}</div></div>
      </div>
      <div class="viewer-ctrl"><button class="round" data-nav="-1" aria-label="Previous">${icon('left')}</button><span>${st.i + 1} / ${d.length}</span><button class="round" data-nav="1" aria-label="Next">${icon('right')}</button></div>
      <div class="viewer-opts"><button class="pill ${st.shuffled ? 'on' : ''}" data-opt="shuffle">${icon('shuffle')} Shuffle</button><button class="pill ${st.starredOnly ? 'on' : ''}" data-opt="starred">${icon('star')} Starred only</button><button class="pill ${st.back ? 'on' : ''}" data-opt="side">${icon('swap')} Definition first</button></div>
      <div class="bar thin"><i style="width:${((st.i + 1) / d.length) * 100}%"></i></div>`;
  }
  function draw() {
    const mastered = Object.values(p.mastery).filter((m) => m >= 2).length;
    root.innerHTML = `
    <div class="page narrow-wide">
      <a class="small" href="#/flashcards">← Flashcards</a>
      <h1>${esc(s.title)}</h1>
      ${s.desc ? `<p class="muted">${esc(s.desc)}</p>` : ''}
      <div class="modes">
        <a class="mode card hover" href="#/flashcards/${encodeURIComponent(s.id)}/learn"><span>${icon('brain')}</span>Learn</a>
        <a class="mode card hover" href="#/flashcards/${encodeURIComponent(s.id)}/test"><span>${icon('clipboard')}</span>Test</a>
        <a class="mode card hover" href="#/flashcards/${encodeURIComponent(s.id)}/match"><span>${icon('puzzle')}</span>Match</a>
        <button class="mode card hover" id="shareBtn"><span>${icon('link')}</span>Share</button>
      </div>
      <div id="viewer"></div>
      <div class="row between wrap gap set-meta">
        <span class="muted">${s.cards.length} terms · ${mastered} mastered${s.builtin ? ' · Free study set' : ''}</span>
        <span class="row gap">${s.builtin ? '<button class="btn sm" id="copyBtn">Make an editable copy</button>' : `<a class="btn sm" href="#/flashcards/${encodeURIComponent(s.id)}/edit">${icon('edit')} Edit</a><button class="btn sm ghost" id="exportBtn">Export</button><button class="btn sm ghost danger" id="delBtn">Delete</button>`}${mastered ? '<button class="btn sm ghost" id="resetProg">Reset progress</button>' : ''}</span>
      </div>
      <h2 class="h3">Terms in this set (${s.cards.length})</h2>
      <div class="term-list">${s.cards.map((c, i) => `<div class="term card"><div class="t">${esc(c.t)}</div><div class="d">${esc(c.d)}</div><div class="term-side">${p.mastery[i] >= 2 ? '<span class="tag good">Mastered</span>' : ''}<button class="star ${p.starred.includes(i) ? 'on' : ''}" data-star="${i}">${p.starred.includes(i) ? icon('star', { fill: true }) : icon('star')}</button></div></div>`).join('')}</div>
    </div>`;
    drawCard();
  }
  function go(n) { const d = deck(); if (!d.length) return; st.i = (st.i + n + d.length) % d.length; st.flipped = false; drawCard(); }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const star = t.closest('[data-star]');
    if (star) { e.stopPropagation(); const i = +star.dataset.star; p.starred = p.starred.includes(i) ? p.starred.filter((x) => x !== i) : [...p.starred, i]; store.save(); return draw(); }
    if (t.closest('#flip')) { st.flipped = !st.flipped; $('#flip', root).classList.toggle('flipped', st.flipped); return; }
    const nav = t.closest('[data-nav]'); if (nav) return go(+nav.dataset.nav);
    const opt = t.closest('[data-opt]')?.dataset.opt;
    if (opt === 'shuffle') { st.shuffled = !st.shuffled; st.order = st.shuffled ? shuffle(s.cards.map((_, i) => i)) : s.cards.map((_, i) => i); st.i = 0; st.flipped = false; drawCard(); }
    if (opt === 'starred') { st.starredOnly = !st.starredOnly; st.i = 0; st.flipped = false; drawCard(); }
    if (opt === 'side') { st.back = !st.back; st.flipped = false; drawCard(); }
    if (t.id === 'copyBtn') { const nid = store.upsertSet({ title: s.title + ' (copy)', desc: s.desc, cards: s.cards.map((c) => ({ ...c })) }); toast('Copied to your sets.', 'good'); location.hash = '#/flashcards/' + nid + '/edit'; }
    if (t.id === 'delBtn') confirmBox(`Delete "${esc(s.title)}"? This can't be undone.`, { ok: 'Delete', danger: true }).then((ok) => { if (ok) { store.deleteSet(s.id); location.hash = '#/flashcards'; } });
    if (t.id === 'resetProg') { p.mastery = {}; store.save(); draw(); }
    if (t.id === 'exportBtn') modal(`<p class="muted">Tab-separated. Paste into a spreadsheet or another flashcard app.</p><textarea rows="10" readonly>${esc(s.cards.map((c) => `${c.t}\t${c.d}`).join('\n'))}</textarea>`, { title: 'Export', wide: true });
    if (t.closest('#shareBtn')) {
      const url = `${location.origin}${location.pathname}#/share/${b64enc(JSON.stringify({ t: s.title, d: s.desc, c: s.cards.map((c) => [c.t, c.d]) }))}`;
      const m = modal(`<p>Anyone with this link can view and save a copy of this set. No account needed.</p><div class="row gap"><input id="shareUrl" readonly value="${esc(url)}"><button class="btn primary" id="copyUrl">Copy</button></div>${url.length > 8000 ? '<p class="warnline small">This set is large, so the link is very long. Some apps may cut it off; use Export instead.</p>' : ''}`, { title: 'Share this set' });
      $('#copyUrl', m.el).onclick = () => { navigator.clipboard?.writeText(url).then(() => toast('Link copied!', 'good'), () => { $('#shareUrl', m.el).select(); }); };
    }
  });
  const onKey = (e) => {
    if (e.target.closest('input,textarea') || document.querySelector('.modal-wrap')) return;
    if (e.key === ' ') { e.preventDefault(); $('#flip', root)?.click(); }
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  addEventListener('keydown', onKey);
  draw();
  return () => removeEventListener('keydown', onKey);
}

// ---------- Learn (adaptive: multiple choice → written → mastered) ----------
export function learnView(root, { id }) {
  const s = getSet(id);
  if (!s) return notFound(root);
  if (s.cards.length < 4) { root.innerHTML = `<div class="page narrow"><h1>Learn needs at least 4 cards</h1><a class="btn" href="#/flashcards/${encodeURIComponent(id)}">Back</a></div>`; return; }
  const p = store.progress(s.id);
  const st = { round: [], pos: 0, answered: false, withTerm: false, roundResults: [] };
  const lvl = (i) => p.mastery[i] || 0;
  const mastered = () => s.cards.filter((_, i) => lvl(i) >= 2).length;

  function newRound() {
    const pool = shuffle(s.cards.map((_, i) => i).filter((i) => lvl(i) < 2));
    pool.sort((a, b) => lvl(b) - lvl(a)); // finish nearly-learned terms first
    st.round = pool.slice(0, 7); st.pos = 0; st.roundResults = [];
    draw();
  }
  const promptOf = (i) => (st.withTerm ? s.cards[i].d : s.cards[i].t);
  const answerOf = (i) => (st.withTerm ? s.cards[i].t : s.cards[i].d);

  function draw() {
    const total = s.cards.length, m = mastered();
    const head = `<div class="learn-head"><a class="small" href="#/flashcards/${encodeURIComponent(id)}">← ${esc(s.title)}</a><div class="bar"><i class="good" style="width:${(100 * m) / total}%"></i></div><span class="muted small">${m} / ${total} mastered</span>
      <label class="small toggle"><input type="checkbox" id="withTerm" ${st.withTerm ? 'checked' : ''}> Answer with term</label></div>`;
    if (m === total) {
      root.innerHTML = `<div class="page narrow">${head}<div class="card center-card"><div class="big-emoji">${sticker('trophy')}</div><h2>You've mastered every term!</h2><p class="muted">Keep them fresh with a practice test or a round of Match.</p><div class="row gap center"><a class="btn primary" href="#/flashcards/${encodeURIComponent(id)}/test">Take a test</a><button class="btn" id="restart">Start over</button></div></div></div>`;
      return;
    }
    if (st.pos >= st.round.length) {
      const right = st.roundResults.filter(Boolean).length;
      root.innerHTML = `<div class="page narrow">${head}<div class="card center-card"><h2>Round complete</h2><p class="muted">${right} of ${st.roundResults.length} correct this round. ${mastered()} of ${s.cards.length} terms mastered overall.</p><button class="btn primary lg" id="next">Continue</button></div></div>`;
      return;
    }
    const i = st.round[st.pos];
    const written = lvl(i) >= 1;
    let body;
    if (!written) {
      const others = shuffle(s.cards.map((_, j) => j).filter((j) => j !== i && norm(answerOf(j)) !== norm(answerOf(i)))).slice(0, 3);
      const opts = shuffle([i, ...others]);
      body = `<p class="muted small">Choose the matching ${st.withTerm ? 'term' : 'definition'}</p><div class="learn-opts">${opts.map((j, k) => `<button class="lopt" data-opt="${j}"><span class="letter">${k + 1}</span>${esc(answerOf(j))}</button>`).join('')}</div>`;
    } else {
      body = `<p class="muted small">Type the ${st.withTerm ? 'term' : 'definition'}</p><form id="wform" class="row gap"><input id="win" autocomplete="off" placeholder="Type the answer"><button class="btn primary">Answer</button></form><button class="link sm" id="dontknow">Don't know?</button>`;
    }
    root.innerHTML = `<div class="page narrow">${head}<div class="card learn-card"><span class="tag ${written ? 'mid' : ''}">${written ? 'Written' : 'Multiple choice'}</span><div class="learn-prompt">${esc(promptOf(i))}</div>${body}<div id="lfb"></div></div></div>`;
    $('#win', root)?.focus();
  }
  function grade(ok, i, typed) {
    if (st.answered) return;
    st.answered = true;
    p.mastery[i] = ok ? Math.min(2, lvl(i) + 1) : 0;
    p.studied = (p.studied || 0) + 1;
    store.save();
    st.roundResults.push(ok);
    if (!ok) st.round.push(i); // see it again this round
    $$('.lopt', root).forEach((b) => { const j = +b.dataset.opt; b.disabled = true; if (j === i) b.classList.add('correct'); });
    $('#lfb', root).innerHTML = ok
      ? `<div class="feedback ok"><b>${rng(newSeed()).pick(['Nice!', 'Great job!', 'Correct!', "You've got it!"])}</b></div>`
      : `<div class="feedback bad"><b>Not quite.</b> Correct answer: <b>${esc(answerOf(i))}</b>${typed != null ? `<br><span class="muted">You wrote: ${esc(typed) || '—'}</span> <button class="link sm" id="override">I was right</button>` : ''}</div>`;
    const cont = document.createElement('button');
    cont.className = 'btn primary'; cont.id = 'cont'; cont.textContent = 'Continue';
    $('#lfb', root).appendChild(cont); cont.focus();
    $('#override', root)?.addEventListener('click', () => { p.mastery[i] = Math.min(2, 1 + 1); st.round.pop(); st.roundResults[st.roundResults.length - 1] = true; store.save(); advance(); });
  }
  function advance() { st.pos++; st.answered = false; draw(); }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const o = t.closest('[data-opt]');
    if (o && !st.answered) { const i = st.round[st.pos], j = +o.dataset.opt; if (j !== i) o.classList.add('wrong'); grade(j === i, i); }
    if (t.id === 'cont') advance();
    if (t.id === 'next') newRound();
    if (t.id === 'dontknow') grade(false, st.round[st.pos], '');
    if (t.id === 'restart') { p.mastery = {}; store.save(); newRound(); }
  });
  root.addEventListener('change', (e) => { if (e.target.id === 'withTerm') { st.withTerm = e.target.checked; st.answered = false; draw(); } });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const i = st.round[st.pos], v = $('#win', root).value;
    const a = norm(answerOf(i)), g = norm(v);
    grade(!!g && (g === a || (a.length > 12 && a.includes(g) && g.length >= a.length * 0.6)), i, v);
  });
  const onKey = (e) => { if (!e.target.closest('input') && /^[1-4]$/.test(e.key)) $$('.lopt', root)[+e.key - 1]?.click(); };
  addEventListener('keydown', onKey);
  newRound();
  return () => removeEventListener('keydown', onKey);
}

// ---------- Test ----------
export function testView(root, { id }) {
  const s = getSet(id);
  if (!s) return notFound(root);
  if (s.cards.length < 4) { root.innerHTML = `<div class="page narrow"><h1>Tests need at least 4 cards</h1><a class="btn" href="#/flashcards/${encodeURIComponent(id)}">Back</a></div>`; return; }
  const cfg = { n: Math.min(20, s.cards.length), tf: true, mc: true, wr: true, withTerm: false };
  let qs = null, graded = false;

  function build() {
    const types = ['tf', 'mc', 'wr'].filter((t) => cfg[t]);
    const order = shuffle(s.cards.map((_, i) => i)).slice(0, cfg.n);
    const ans = (i) => (cfg.withTerm ? s.cards[i].t : s.cards[i].d);
    const prm = (i) => (cfg.withTerm ? s.cards[i].d : s.cards[i].t);
    qs = order.map((i, k) => {
      const type = types[k % types.length];
      if (type === 'tf') {
        const truth = Math.random() < 0.5;
        const shown = truth ? i : shuffle(s.cards.map((_, j) => j).filter((j) => j !== i))[0];
        return { type, i, prompt: prm(i), shown: ans(shown), correct: truth };
      }
      if (type === 'mc') {
        const opts = shuffle([i, ...shuffle(s.cards.map((_, j) => j).filter((j) => j !== i && ans(j) !== ans(i))).slice(0, 3)]);
        return { type, i, prompt: prm(i), opts: opts.map(ans), correct: opts.indexOf(i) };
      }
      return { type, i, prompt: prm(i), correct: ans(i) };
    });
    qs = shuffle(qs).sort((a, b) => ['tf', 'mc', 'wr'].indexOf(a.type) - ['tf', 'mc', 'wr'].indexOf(b.type));
    graded = false;
    drawTest();
  }
  function drawSetup() {
    root.innerHTML = `<div class="page narrow"><a class="small" href="#/flashcards/${encodeURIComponent(id)}">← ${esc(s.title)}</a><h1>Set up your test</h1>
      <div class="card stack">
        <label>Questions (max ${s.cards.length})<input type="number" id="n" min="1" max="${s.cards.length}" value="${cfg.n}"></label>
        <label class="toggle"><input type="checkbox" id="tf" ${cfg.tf ? 'checked' : ''}> True / False</label>
        <label class="toggle"><input type="checkbox" id="mc" ${cfg.mc ? 'checked' : ''}> Multiple choice</label>
        <label class="toggle"><input type="checkbox" id="wr" ${cfg.wr ? 'checked' : ''}> Written</label>
        <label class="toggle"><input type="checkbox" id="withTerm" ${cfg.withTerm ? 'checked' : ''}> Answer with term (instead of definition)</label>
        <button class="btn primary lg" id="create">Create test</button>
      </div></div>`;
  }
  function drawTest() {
    root.innerHTML = `<div class="page narrow"><a class="small" href="#/flashcards/${encodeURIComponent(id)}">← ${esc(s.title)}</a>
      <div class="row between"><h1>Test</h1><button class="btn ghost sm" id="setup">Options</button></div>
      <div id="score"></div>
      <form id="testForm" class="stack">${qs.map((q, k) => `
        <div class="card tq" data-k="${k}"><div class="row between"><span class="muted small">${k + 1} of ${qs.length} · ${q.type === 'tf' ? 'True or false' : q.type === 'mc' ? 'Multiple choice' : 'Written'}</span><span class="tq-mark"></span></div>
          <div class="tq-prompt">${esc(q.prompt)}</div>
          ${q.type === 'tf' ? `<div class="tq-shown">${esc(q.shown)}</div><div class="row gap"><label class="chip"><input type="radio" name="q${k}" value="true"> True</label><label class="chip"><input type="radio" name="q${k}" value="false"> False</label></div>` : ''}
          ${q.type === 'mc' ? `<div class="tq-opts">${q.opts.map((o, j) => `<label class="chip block"><input type="radio" name="q${k}" value="${j}"> ${esc(o)}</label>`).join('')}</div>` : ''}
          ${q.type === 'wr' ? `<input name="q${k}" autocomplete="off" placeholder="Type the answer">` : ''}
          <div class="tq-fb"></div></div>`).join('')}
        <button class="btn primary lg" id="submitTest">Submit test</button>
      </form></div>`;
  }
  function grade() {
    const f = new FormData($('#testForm', root));
    let right = 0;
    qs.forEach((q, k) => {
      const v = f.get('q' + k);
      const ok = q.type === 'tf' ? v === String(q.correct) : q.type === 'mc' ? +v === q.correct && v != null : norm(v || '') === norm(q.correct);
      if (ok) right++;
      const card = $(`.tq[data-k="${k}"]`, root);
      card.classList.add(ok ? 'right' : 'wrongq');
      $('.tq-mark', card).innerHTML = ok ? '<span class="ok">✓ Correct</span>' : '<span class="bad">✗ Incorrect</span>';
      if (!ok) $('.tq-fb', card).innerHTML = `Correct answer: <b>${esc(q.type === 'tf' ? (q.correct ? 'True' : `False (it's "${s.cards[q.i][cfg.withTerm ? 't' : 'd']}")`) : q.type === 'mc' ? q.opts[q.correct] : q.correct)}</b>`;
      if (!ok) { const p = store.progress(s.id); p.mastery[q.i] = 0; }
    });
    store.save();
    graded = true;
    $$('input', $('#testForm', root)).forEach((i) => (i.disabled = true));
    $('#submitTest', root).remove();
    $('#score', root).innerHTML = `<div class="card score-hero slim"><div class="score-main"><span class="muted">Your score</span><b>${Math.round((100 * right) / qs.length)}%</b><span class="muted small">${right} of ${qs.length} correct</span></div><button class="btn primary" id="again">New test</button></div>`;
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.id === 'create') {
      cfg.n = Math.max(1, Math.min(s.cards.length, +$('#n', root).value || 10));
      ['tf', 'mc', 'wr', 'withTerm'].forEach((k) => (cfg[k] = $('#' + k, root).checked));
      if (!cfg.tf && !cfg.mc && !cfg.wr) return toast('Pick at least one question type.');
      build();
    }
    if (t.id === 'setup') drawSetup();
    if (t.id === 'again') build();
  });
  root.addEventListener('submit', (e) => { e.preventDefault(); if (!graded) grade(); });
  build();
}

// ---------- Match ----------
export function matchView(root, { id }) {
  const s = getSet(id);
  if (!s) return notFound(root);
  const p = store.progress(s.id);
  let tiles = [], sel = null, start = 0, penalty = 0, left = 0, iv = null;
  function intro() {
    clearInterval(iv);
    root.innerHTML = `<div class="page narrow center-page"><a class="small" href="#/flashcards/${encodeURIComponent(id)}">← ${esc(s.title)}</a><div class="big-emoji">${sticker('puzzle')}</div><h1>Ready to play?</h1><p class="muted">Match all the terms with their definitions as fast as you can. Wrong matches add 1 second.</p>${p.matchBest ? `<p>Your best: <b>${p.matchBest.toFixed(1)}s</b></p>` : ''}<button class="btn primary lg" id="startMatch">Start game</button></div>`;
  }
  function play() {
    const picks = shuffle(s.cards.map((_, i) => i)).slice(0, Math.min(6, s.cards.length));
    tiles = shuffle(picks.flatMap((i) => [{ i, txt: s.cards[i].t, kind: 't' }, { i, txt: s.cards[i].d, kind: 'd' }]));
    left = picks.length; sel = null; penalty = 0; start = performance.now();
    root.innerHTML = `<div class="page"><div class="row between"><a class="small" href="#/flashcards/${encodeURIComponent(id)}">← ${esc(s.title)}</a><b class="match-time" id="mt">0.0s</b></div>
      <div class="match-grid">${tiles.map((t, k) => `<button class="tile" data-k="${k}">${esc(t.txt)}</button>`).join('')}</div></div>`;
    iv = setInterval(() => { const el = $('#mt', root); if (el) el.textContent = ((performance.now() - start) / 1000 + penalty).toFixed(1) + 's'; }, 100);
  }
  function done() {
    clearInterval(iv);
    const time = (performance.now() - start) / 1000 + penalty;
    const best = !p.matchBest || time < p.matchBest;
    if (best) { p.matchBest = time; store.save(); }
    root.innerHTML = `<div class="page narrow center-page"><div class="big-emoji">${best ? sticker('medal') : sticker('stopwatch')}</div><h1>${time.toFixed(1)} seconds</h1><p class="muted">${best ? 'New personal best!' : `Your best is ${p.matchBest.toFixed(1)}s.`}</p><div class="row gap center"><button class="btn primary lg" id="startMatch">Play again</button><a class="btn" href="#/flashcards/${encodeURIComponent(id)}">Back to set</a></div></div>`;
  }
  root.addEventListener('click', (e) => {
    if (e.target.id === 'startMatch') return play();
    const b = e.target.closest('.tile');
    if (!b || b.classList.contains('gone')) return;
    const k = +b.dataset.k;
    if (sel === null) { sel = k; b.classList.add('sel'); return; }
    if (sel === k) { b.classList.remove('sel'); sel = null; return; }
    const a = tiles[sel], c = tiles[k], bs = $(`.tile[data-k="${sel}"]`, root);
    if (a.i === c.i && a.kind !== c.kind) {
      [b, bs].forEach((x) => { x.classList.add('match'); setTimeout(() => x.classList.add('gone'), 250); });
      if (--left === 0) setTimeout(done, 300);
    } else {
      penalty += 1;
      [b, bs].forEach((x) => { x.classList.remove('sel'); x.classList.add('miss'); setTimeout(() => x.classList.remove('miss'), 400); });
    }
    sel = null; bs.classList.remove('sel');
  });
  intro();
  return () => clearInterval(iv);
}

// ---------- Import from share link ----------
export function importView(root, { data }) {
  let o;
  try { o = JSON.parse(b64dec(data)); if (!Array.isArray(o.c)) throw 0; } catch { root.innerHTML = `<div class="page narrow"><h1>This share link is broken</h1><p class="muted">It may have been cut off when it was copied.</p><a class="btn" href="#/flashcards">Go to flashcards</a></div>`; return; }
  const cards = o.c.map(([t, d]) => ({ t: String(t), d: String(d) }));
  root.innerHTML = `<div class="page narrow-wide"><span class="tag">Shared set</span><h1>${esc(o.t)}</h1>${o.d ? `<p class="muted">${esc(o.d)}</p>` : ''}
    <div class="row gap"><button class="btn primary" id="saveShared">Save to my sets</button><a class="btn ghost" href="#/flashcards">Cancel</a></div>
    <div class="term-list">${cards.map((c) => `<div class="term card"><div class="t">${esc(c.t)}</div><div class="d">${esc(c.d)}</div></div>`).join('')}</div></div>`;
  $('#saveShared', root).onclick = () => { const nid = store.upsertSet({ title: o.t, desc: o.d || '', cards }); toast('Saved to your sets!', 'good'); location.hash = '#/flashcards/' + nid; };
}
