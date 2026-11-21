// "What you're studying for": the SAT, the ACT, and any AP classes. Picked with a search box during
// onboarding or from the dashboard, saved in settings.studying, and shown at the top of the study pages.
import { esc } from './util.js';
import { icon, courseIcon } from './icons.js';
import { store } from './store.js';
import { COURSES } from './content/courses.js';
import { modal } from './tools.js';

export const studyOptions = () => [
  { id: 'SAT', label: 'SAT', icon: 'sat', kind: 'test' },
  { id: 'ACT', label: 'ACT', icon: 'act', kind: 'test' },
  ...COURSES.filter((c) => c.ap).map((c) => ({ id: c.id, label: c.title, icon: courseIcon(c), kind: 'ap' })),
];
const byId = (id) => studyOptions().find((o) => o.id === id);

export const myStudying = () => (store.user() ? (store.data().settings.studying || []).filter(byId) : []);

export function setStudying(ids) {
  const s = store.data().settings;
  s.studying = ids;
  // Only one test picked: make it the main test.
  if (ids.includes('ACT') && !ids.includes('SAT')) s.focus = 'ACT';
  else if (ids.includes('SAT') && !ids.includes('ACT')) s.focus = 'SAT';
  store.save();
}

/** Search box with removable chips. Calls onChange with the new list of ids. */
export function studyPicker(el, ids, onChange) {
  let sel = [...ids], q = '';
  el.classList.add('study-picker');
  el.innerHTML = `<div class="sp-chips"></div>
    <label class="sp-search">${icon('search')}<input type="search" placeholder="Search SAT, ACT, or an AP class" aria-label="Search tests and AP classes" autocomplete="off"></label>
    <ul class="sp-results" role="listbox"></ul>`;
  const chips = el.querySelector('.sp-chips'), input = el.querySelector('input'), list = el.querySelector('.sp-results');
  const matches = () => {
    const t = q.trim().toLowerCase().replace(/^ap\s*/, '');
    return studyOptions().filter((o) => !sel.includes(o.id) && (!t || o.label.toLowerCase().replace(/^ap /, '').includes(t))).slice(0, t ? 8 : 6);
  };
  const draw = () => {
    chips.innerHTML = sel.length ? sel.map((id) => { const o = byId(id); return o ? `<button type="button" class="sp-chip" data-rm="${esc(id)}" aria-label="Remove ${esc(o.label)}">${esc(o.label)}${icon('x')}</button>` : ''; }).join('') : '<span class="muted small">Nothing picked yet.</span>';
    list.innerHTML = matches().map((o) => `<li><button type="button" data-add="${esc(o.id)}">${icon(o.icon)}<span>${esc(o.label)}</span>${icon('plus')}</button></li>`).join('') || '<li class="muted small sp-none">No matches.</li>';
  };
  const change = () => { draw(); onChange([...sel]); };
  el.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]');
    if (add) { sel.push(add.dataset.add); q = ''; input.value = ''; change(); input.focus(); }
    if (rm) { sel = sel.filter((x) => x !== rm.dataset.rm); change(); }
  });
  input.addEventListener('input', () => { q = input.value; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const first = matches()[0];
    if (first) { sel.push(first.id); q = ''; input.value = ''; change(); }
  });
  draw();
}

/** Opens the picker in a dialog and re-renders the page when saved. */
export function editStudying() {
  let next = myStudying();
  const m = modal(`<p class="muted">Pick the tests and AP classes you're studying for. They'll show at the top of Courses, AP Practice, SAT &amp; ACT, and your dashboard.</p>
    <div id="spEdit"></div>
    <div class="row end gap"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="spSave">Save</button></div>`, { title: 'What are you studying for?' });
  studyPicker(m.el.querySelector('#spEdit'), next, (ids) => { next = ids; });
  m.el.querySelector('#spSave').onclick = () => { setStudying(next); m.close(); dispatchEvent(new HashChangeEvent('hashchange')); };
}

/**
 * The "Studying for" strip at the top of a study page. Each chip goes to the right place for that page:
 * AP classes open the course on Courses and the question bank elsewhere; SAT and ACT open the question bank.
 */
export function classesBar(where) {
  if (!store.user()) return '';
  const mine = myStudying().map(byId);
  if (!mine.length) return `<div class="classes-bar empty"><span>Tell us what you're studying for and it'll show up here.</span><button class="btn sm" data-sf-edit>Pick tests and classes</button></div>`;
  const href = (o) => (o.kind === 'test' ? '#/practice' : where === 'learn' ? `#/learn/${o.id}` : `#/ap/${o.id}`);
  return `<div class="classes-bar"><span class="cb-label">Studying for</span>
    <div class="cb-chips">${mine.map((o) => `<a class="cb-chip" href="${href(o)}"${o.kind === 'test' ? ` data-sf-focus="${o.id}"` : ''}>${icon(o.icon)}${esc(o.label)}</a>`).join('')}</div>
    <button class="link sm" data-sf-edit>Edit</button></div>`;
}

// One listener for every page's strip.
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-sf-edit]')) { e.preventDefault(); editStudying(); return; }
  const f = e.target.closest('[data-sf-focus]');
  if (f) {
    const s = store.data().settings;
    if (s.focus !== f.dataset.sfFocus) { s.focus = f.dataset.sfFocus; store.save(); }
    if (location.hash.startsWith('#/practice')) { e.preventDefault(); dispatchEvent(new HashChangeEvent('hashchange')); }
  }
});
