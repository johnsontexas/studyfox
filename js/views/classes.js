// Dashboard "Classes" tab: join with a code, make a class or study group, and each class's page
// (leaderboard, shared flashcard sets, and admin tools for the person who made it).
import { $, esc, toast } from '../util.js';
import { icon } from '../icons.js';
import { store } from '../store.js';
import { db } from '../cloud.js';
import { modal, confirmBox } from '../tools.js';
import { studyOptions } from '../studying.js';
import {
  myClasses, classDetail, createClass, joinClass, leaveClass, updateClass, newJoinCode, removeMember,
  deleteClass, classSet, shareSet, unshareSet, cleanCode, topicLabel, kindLabel, setPendingClassCode,
} from '../classes.js';
import { needsOnboarding } from './welcome.js';
import { foxSVG, cleanAvatar } from '../avatar.js';
import { myAvatar } from '../members.js';

// Invite links (#/join/ABC123): join right away when signed in, otherwise keep the code for onboarding.
export function joinLinkView(root, { code }) {
  const c = cleanCode(code);
  if (!store.user()?.cloud || needsOnboarding()) {
    setPendingClassCode(c);
    try { sessionStorage.setItem('sf_after_login', '#/join/' + c); } catch {}
    location.replace(store.user() ? '#/welcome' : '#/signup');
    return;
  }
  root.innerHTML = '<div class="page narrow"><p class="muted">Joining…</p></div>';
  joinClass(db(), c).then((id) => { setPendingClassCode(''); toast('You joined!', 'good'); location.replace('#/classes/' + id); },
    (e) => { root.innerHTML = `<div class="page narrow"><h1>Could not join</h1><p class="muted">${esc(e.message)}</p><a class="btn" href="#/classes">Go to classes</a></div>`; });
}

const signedOut = (root) => { root.innerHTML = `<div class="page narrow"><h1>Classes</h1><p class="muted">Sign in to join a class or study group.</p><a class="btn primary" href="#/login">Sign in</a></div>`; };
const topicOptions = (sel) => `<option value="">All subjects</option>${studyOptions().map((o) => `<option value="${esc(o.id)}" ${o.id === sel ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}`;
const kindFields = (kind = 'class') => `<fieldset class="goals"><legend>Type</legend>
  <label class="goal"><input type="radio" name="kind" value="class" ${kind === 'class' ? 'checked' : ''}><span><b>Class</b> <span class="muted small">Only you share flashcard sets. Good for teachers and tutors.</span></span></label>
  <label class="goal"><input type="radio" name="kind" value="group" ${kind === 'group' ? 'checked' : ''}><span><b>Study group</b> <span class="muted small">Everyone can share sets with the group.</span></span></label>
</fieldset>`;

export function classesView(root) {
  const u = store.user();
  if (!u?.cloud) return signedOut(root);
  root.innerHTML = `<div class="page narrow-wide classes-page">
    <div class="page-head"><span class="eyebrow">${icon('users')} Classes</span><h1>Classes and study groups</h1>
      <p class="muted">Join with a code from your teacher or friends, or start your own.</p></div>
    <div class="classes-actions">
      <form class="card stack" id="joinForm"><h2 class="h3">Join with a code</h2>
        <div class="row gap"><input name="code" class="code-input" maxlength="7" placeholder="ABC123" autocapitalize="characters" autocomplete="off" aria-label="Class code">
        <button class="btn primary" type="submit">Join</button></div><div class="form-err" id="joinErr"></div></form>
      <form class="card stack" id="makeForm"><h2 class="h3">Start a class or group</h2>
        <label>Name<input name="name" maxlength="60" placeholder="Period 3 AP Bio" required></label>
        ${kindFields()}
        <label>Topic <span class="muted small">The leaderboard only counts this subject</span><select name="topic">${topicOptions('')}</select></label>
        <button class="btn" type="submit">${icon('plus')} Create</button><div class="form-err" id="makeErr"></div></form>
    </div>
    <h2 class="h3">Your classes</h2><div id="classList"><p class="muted">Loading…</p></div>
  </div>`;
  const list = $('#classList', root);
  myClasses(db()).then((rows) => {
    list.innerHTML = rows.length ? `<div class="class-grid">${rows.map((c) => `<a class="card class-tile" href="#/classes/${c.id}">
        <span class="tag">${kindLabel(c.kind)}${c.is_owner ? ' · Admin' : ''}</span><b>${esc(c.name)}</b>
        <span class="muted small">${esc(topicLabel(c.topic))} · ${c.members} ${c.members === 1 ? 'member' : 'members'} · ${c.sets} ${c.sets === 1 ? 'set' : 'sets'}</span></a>`).join('')}</div>`
      : '<div class="card empty-note center"><p class="muted">You are not in any classes yet.</p></div>';
  }).catch((e) => { list.innerHTML = `<p class="muted">${esc(e.message)}</p>`; });

  $('#joinForm', root).onsubmit = async (e) => {
    e.preventDefault();
    const code = cleanCode(e.target.code.value), err = $('#joinErr', root); err.textContent = '';
    if (code.length !== 6) { err.textContent = 'Codes are 6 letters and numbers.'; return; }
    try { const id = await joinClass(db(), code); toast('You joined!', 'good'); location.hash = '#/classes/' + id; } catch (ex) { err.textContent = ex.message; }
  };
  $('#makeForm', root).onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target, err = $('#makeErr', root); err.textContent = '';
    try { const id = await createClass(db(), f.name.value.trim(), f.kind.value, f.topic.value); location.hash = '#/classes/' + id; } catch (ex) { err.textContent = ex.message; }
  };
}

export function classView(root, { id }) {
  if (!store.user()?.cloud) return signedOut(root);
  root.innerHTML = '<div class="page narrow-wide"><p class="muted">Loading…</p></div>';
  const load = () => classDetail(db(), id).then(render).catch((e) => {
    root.innerHTML = `<div class="page narrow"><h1>Class not found</h1><p class="muted">${esc(e.message)}</p><a class="btn" href="#/classes">Back to classes</a></div>`;
  });

  function render(c) {
    const max = Math.max(1, ...c.board.map((r) => r.score));
    root.innerHTML = `<div class="page narrow-wide class-page">
      <a class="muted small" href="#/classes">${icon('left')} All classes</a>
      <div class="page-head"><span class="eyebrow">${icon('users')} ${kindLabel(c.kind)}${c.is_owner ? ' · You are the admin' : ''}</span><h1>${esc(c.name)}</h1>
        <p class="muted">Leaderboard: ${c.topic ? `correct answers in <b>${esc(topicLabel(c.topic))}</b>` : 'correct answers in every subject'}</p></div>
      <div class="card row between wrap gap class-code"><div><span class="muted small">Join code</span><div class="code-big">${esc(c.code)}</div></div>
        <div class="row gap"><button class="btn sm" id="copyCode">${icon('link')} Copy invite</button>${c.is_owner ? `<button class="btn ghost sm" id="newCode">New code</button>` : ''}</div></div>

      <div class="card"><h2 class="h3">${icon('trophy')} Leaderboard</h2>
        <ol class="class-board">${c.board.map((r, i) => `<li class="${r.me ? 'me' : ''}"><span class="rank">${i + 1}</span>${foxSVG(r.me ? myAvatar() : cleanAvatar(r.avatar, r.user_id), { size: 30 })}
          <span class="who">${esc(r.name || 'Student')}${r.owner ? ' <span class="tag">Admin</span>' : ''}${r.me ? ' <span class="muted small">(you)</span>' : ''}</span>
          <span class="bar"><i style="width:${Math.round((100 * r.score) / max)}%"></i></span><b>${r.score}</b>
          ${c.is_owner && !r.me ? `<button class="icon-btn" data-remove="${r.user_id}" data-name="${esc(r.name)}" aria-label="Remove ${esc(r.name)}">${icon('x')}</button>` : ''}</li>`).join('')}</ol>
        <p class="muted small">Answers you practice on StudyFox count here once they sync.</p></div>

      <div class="card"><div class="row between wrap gap"><h2 class="h3">${icon('cards')} Shared flashcard sets</h2>
        ${c.can_share ? `<button class="btn sm primary" id="shareBtn">${icon('plus')} Share a set</button>` : ''}</div>
        ${c.sets.length ? `<div class="class-sets">${c.sets.map((s) => `<div class="class-set row between gap">
            <button class="link-btn" data-open="${s.id}"><b>${esc(s.title)}</b> <span class="muted small">${s.count} cards${s.added_name ? ` · from ${esc(s.added_name)}` : ''}</span></button>
            ${s.mine || c.is_owner ? `<button class="icon-btn" data-unshare="${s.id}" aria-label="Remove ${esc(s.title)}">${icon('trash')}</button>` : ''}</div>`).join('')}</div>`
          : `<p class="muted">${c.can_share ? 'No sets yet. Share one of yours.' : 'Your class admin has not shared any sets yet.'}</p>`}
      </div>

      ${c.is_owner ? `<form class="card stack" id="editForm"><h2 class="h3">${icon('edit')} Class settings</h2>
          <label>Name<input name="name" maxlength="60" value="${esc(c.name)}" required></label>
          ${kindFields(c.kind)}
          <label>Topic<select name="topic">${topicOptions(c.topic)}</select></label>
          <div class="row gap"><button class="btn primary" type="submit">Save</button><button class="btn ghost danger" type="button" id="delBtn">${icon('trash')} Delete</button></div>
          <div class="form-err" id="editErr"></div></form>`
        : `<button class="btn ghost" id="leaveBtn">Leave ${c.kind === 'group' ? 'group' : 'class'}</button>`}
    </div>`;

    $('#copyCode', root).onclick = () => {
      const txt = `Join my ${c.kind === 'group' ? 'study group' : 'class'} "${c.name}" on StudyFox with code ${c.code}: ${location.origin}/#/join/${c.code}`;
      navigator.clipboard?.writeText(txt).then(() => toast('Invite copied', 'good'), () => toast(c.code));
    };
    const nc = $('#newCode', root);
    if (nc) nc.onclick = () => confirmBox('Make a new code? The old one stops working, but nobody already in is removed.', { ok: 'New code' }).then((y) => y && newJoinCode(db(), id).then(load, (e) => toast(e.message, 'bad')));
    root.querySelectorAll('[data-remove]').forEach((b) => { b.onclick = () => confirmBox(`Remove ${b.dataset.name} from ${c.name}?`, { ok: 'Remove', danger: true }).then((y) => y && removeMember(db(), id, b.dataset.remove).then(load, (e) => toast(e.message, 'bad'))); });
    root.querySelectorAll('[data-unshare]').forEach((b) => { b.onclick = () => confirmBox('Remove this set from the class? Copies people saved stay theirs.', { ok: 'Remove', danger: true }).then((y) => y && unshareSet(db(), b.dataset.unshare).then(load, (e) => toast(e.message, 'bad'))); });
    root.querySelectorAll('[data-open]').forEach((b) => { b.onclick = () => openSet(b.dataset.open); });
    const sb = $('#shareBtn', root);
    if (sb) sb.onclick = () => pickSet(c, load);
    const lb = $('#leaveBtn', root);
    if (lb) lb.onclick = () => confirmBox(`Leave ${c.name}?`, { ok: 'Leave', danger: true }).then((y) => y && leaveClass(db(), id).then(() => { location.hash = '#/classes'; }, (e) => toast(e.message, 'bad')));
    const ef = $('#editForm', root);
    if (ef) {
      ef.onsubmit = (e) => { e.preventDefault(); updateClass(db(), id, ef.name.value.trim(), ef.kind.value, ef.topic.value).then(() => { toast('Saved', 'good'); load(); }, (ex) => { $('#editErr', root).textContent = ex.message; }); };
      $('#delBtn', root).onclick = () => confirmBox(`Delete ${c.name} for everyone? Its leaderboard and shared sets go away. This can't be undone.`, { ok: 'Delete', danger: true }).then((y) => y && deleteClass(db(), id).then(() => { location.hash = '#/classes'; }, (e) => toast(e.message, 'bad')));
    }
  }
  load();
}

function pickSet(c, done) {
  const sets = store.sets().filter((s) => s.cards?.length);
  if (!sets.length) { toast('Make a flashcard set first, then share it here.'); location.hash = '#/flashcards/new'; return; }
  const m = modal(`<p class="muted">Everyone in ${esc(c.name)} will be able to study it and save a copy.</p>
    <div class="stack">${sets.map((s) => `<button class="btn ghost block" data-pick="${esc(s.id)}">${esc(s.title || 'Untitled set')} <span class="muted small">${s.cards.length} cards</span></button>`).join('')}</div>`, { title: 'Share a set' });
  m.el.querySelectorAll('[data-pick]').forEach((b) => { b.onclick = () => shareSet(db(), c.id, store.getSet(b.dataset.pick)).then(() => { m.close(); toast('Shared', 'good'); done(); }, (e) => toast(e.message, 'bad')); });
}

async function openSet(setId) {
  try {
    const s = await classSet(db(), setId);
    const cards = (s.cards || []).map((x) => ({ t: String(x.t ?? ''), d: String(x.d ?? '') }));
    const m = modal(`${s.desc ? `<p class="muted">${esc(s.desc)}</p>` : ''}<div class="row gap"><button class="btn primary" id="saveCls">Save to my sets and study</button></div>
      <div class="term-list">${cards.map((x) => `<div class="term card"><div class="t">${esc(x.t)}</div><div class="d">${esc(x.d)}</div></div>`).join('')}</div>`, { title: s.title || 'Shared set', wide: true });
    m.el.querySelector('#saveCls').onclick = () => {
      const nid = store.upsertSet({ title: s.title || 'Shared set', desc: s.desc || '', cards, fromClass: s.class_id });
      m.close(); toast('Saved to your sets!', 'good'); location.hash = '#/flashcards/' + nid;
    };
  } catch (e) { toast(e.message, 'bad'); }
}
