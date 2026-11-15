// Admin console panes: the AP question bank (ap_questions) and behavior settings (content_settings),
// plus the "How did you hear about StudyFox?" tally (signup_sources).
import { icon } from '../icons.js';
import { $, esc, toast } from '../util.js';
import { db } from '../cloud.js';
import { confirmBox } from '../tools.js';
import { COURSES } from '../content/courses.js';
import { SETTING_DEFAULTS, setting } from '../content/settings.js';
import { initContent, invalidateContent } from '../content/live.js';
import { rich } from './ap.js';
import { choiceFeedbackHTML } from '../qview.js';

const L = (i) => 'ABCDE'[i];
const val = (root, sel) => $(sel, root)?.value ?? '';
async function run(promise, ok) {
  const { error, data } = await promise;
  if (error) { toast(error.message, 'bad'); throw error; }
  if (ok) toast(ok, 'good');
  return data;
}

// ---------- AP questions ----------
export async function apQuestionsPane(host, courseId) {
  const aps = COURSES.filter((c) => c.ap);
  const c = await db();
  host.innerHTML = `<div class="card stack">
      <div class="row gap wrap"><label class="grow">AP class<select id="apc"><option value="">Choose a class</option>${aps.map((x) => `<option value="${x.id}" ${x.id === courseId ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select></label></div>
      <p class="muted small">Every question can explain each choice: why the right one is right, and the mistake that leads someone to each wrong one. Students who miss see the note for the choice they picked first. Questions marked <span class="tag">Thin</span> have no per-choice notes yet.</p>
    </div><div id="apList"></div>`;
  $('#apc', host).onchange = (e) => { location.hash = `#/admin/content?t=ap&course=${e.target.value}`; };
  if (!courseId) return;
  const course = aps.find((x) => x.id === courseId);
  const qs = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await c.from('ap_questions').select('*').eq('course_id', courseId).order('id').range(from, from + 999);
    if (error) { toast(error.message, 'bad'); return; }
    qs.push(...data);
    if (data.length < 1000) break;
  }
  const thin = (q) => !(q.choice_expl || []).some((x) => x);
  const st = { search: '', onlyThin: false, page: 0 };
  const list = $('#apList', host);
  const draw = () => {
    const words = st.search.toLowerCase().split(/\s+/).filter(Boolean);
    const shown = qs.filter((q) => (!st.onlyThin || thin(q)) && words.every((w) => `${q.stem} ${q.unit} ${q.concept}`.toLowerCase().includes(w)));
    const page = shown.slice(st.page * 40, st.page * 40 + 40);
    list.innerHTML = `<div class="row between wrap gap"><h2 class="h3">${esc(course?.title || courseId)} · ${qs.length} questions <span class="muted small">${qs.filter(thin).length} thin</span></h2>
        <button class="btn primary" data-new>${icon('edit')} New question</button></div>
      <div class="row gap wrap"><input id="apSearch" type="search" placeholder="Search questions" value="${esc(st.search)}" class="grow"><label class="consent"><input type="checkbox" id="apThin" ${st.onlyThin ? 'checked' : ''}> <span>Only thin ones</span></label></div>
      <div id="apForm"></div>
      <div class="stack">${page.map((q) => `<div class="card row between gap ce-row"><span class="grow"><b>${esc(q.unit)}</b>${q.concept ? ` · ${esc(q.concept)}` : ''} ${q.hidden ? '<span class="tag">Hidden</span>' : ''}${thin(q) ? '<span class="tag">Thin</span>' : ''}<br><span class="muted small">${esc(String(q.stem).slice(0, 160))}</span></span>
        <button class="btn sm" data-edit="${q.id}">Edit</button></div>`).join('') || '<p class="muted">No matches.</p>'}</div>
      <div class="row gap center">${st.page ? '<button class="btn sm ghost" data-pg="-1">Previous</button>' : ''}<span class="muted small">${shown.length ? `${st.page * 40 + 1} to ${Math.min(shown.length, st.page * 40 + 40)} of ${shown.length}` : ''}</span>${(st.page + 1) * 40 < shown.length ? '<button class="btn sm ghost" data-pg="1">Next</button>' : ''}</div>`;
    const s = $('#apSearch', list);
    s.oninput = () => { st.search = s.value; st.page = 0; const pos = s.selectionStart; draw(); const n = $('#apSearch', list); n.focus(); n.setSelectionRange(pos, pos); };
    $('#apThin', list).onchange = (e) => { st.onlyThin = e.target.checked; st.page = 0; draw(); };
  };
  list.onclick = (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.pg) { st.page += +t.dataset.pg; draw(); return; }
    if (t.dataset.new != null || t.dataset.edit) {
      const q = t.dataset.edit ? qs.find((x) => String(x.id) === t.dataset.edit) : null;
      const box = $('#apForm', list);
      apForm(box, course, q, async (saved, removed) => {
        if (removed) qs.splice(qs.findIndex((x) => x.id === removed), 1);
        else if (saved) { const k = qs.findIndex((x) => x.id === saved.id); if (k >= 0) qs[k] = saved; else qs.push(saved); }
        draw();
      });
      box.scrollIntoView({ behavior: 'smooth' });
    }
  };
  draw();
}

function apForm(box, course, q, done) {
  const x = q ? structuredClone(q) : { course_id: course.id, unit: course.lessons[0]?.title || '', concept: '', difficulty: 2, stem: '', choices: ['', '', '', ''], answer: 0, expl: '', choice_expl: null, hint: '', steps: null, hidden: false };
  const n = () => x.choices.length;
  const draw = () => {
    box.innerHTML = `<div class="card stack ap-edit">
      <h2 class="h3">${q ? `Edit question ${q.id}` : 'New question'}</h2>
      <div class="grid2">
        <label>Unit<input id="aunit" list="aunits" value="${esc(x.unit)}"><datalist id="aunits">${course.lessons.map((l) => `<option value="${esc(l.title)}">`).join('')}</datalist></label>
        <label>Concept<input id="aconcept" value="${esc(x.concept)}"></label>
        <label>Difficulty<select id="adiff">${[1, 2, 3].map((d) => `<option value="${d}" ${d === x.difficulty ? 'selected' : ''}>${['Easy', 'Medium', 'Hard'][d - 1]}</option>`).join('')}</select></label>
        <label class="consent" style="align-self:end"><input type="checkbox" id="ahidden" ${x.hidden ? 'checked' : ''}> <span>Hidden</span></label>
        <label class="consent" style="align-self:end"><input type="checkbox" id="achal" ${x.challenge ? 'checked' : ''}> <span>Hardest questions only</span></label>
      </div>
      <label>Question <span class="muted small">Math between dollar signs; \\$ for a dollar sign.</span><textarea id="astem" rows="3">${esc(x.stem)}</textarea></label>
      ${x.choices.map((c, i) => `<div class="be-choice"><label class="row gap"><input type="radio" name="aans" value="${i}" ${x.answer === i ? 'checked' : ''} aria-label="Correct answer"> <span class="grow">Choice ${L(i)}<input data-ac="${i}" value="${esc(c)}"></span></label>
        <label class="small">${i === x.answer ? 'Why it\'s right' : 'Why someone picks it, and why it\'s wrong'}<textarea data-aw="${i}" rows="2">${esc((x.choice_expl || [])[i] || '')}</textarea></label></div>`).join('')}
      <div class="row gap">${n() < 5 ? `<button class="btn sm ghost" data-a="add">${icon('plus')} Choice</button>` : ''}${n() > 2 ? '<button class="btn sm ghost" data-a="drop">Remove last choice</button>' : ''}</div>
      <label>Explanation<textarea id="aexpl" rows="3">${esc(x.expl)}</textarea></label>
      <label>Hint <span class="muted small">(optional, students can ask for it before answering)</span><input id="ahint" value="${esc(x.hint || '')}"></label>
      <label>Step-by-step solution <span class="muted small">(optional, one per line)</span><textarea id="asteps" rows="3">${esc((x.steps || []).join('\n'))}</textarea></label>
      <details><summary>Preview what a student who picks a wrong answer sees</summary><div class="card" id="aprev"></div></details>
      <div class="row gap wrap"><button class="btn primary" data-a="save">${q ? 'Save question' : 'Add question'}</button><button class="btn ghost" data-a="cancel">Cancel</button>${q ? `<button class="btn ghost danger-text" data-a="del">${icon('trash')} Delete</button>` : ''}</div>
    </div>`;
    prev();
  };
  const read = () => {
    x.unit = val(box, '#aunit').trim(); x.concept = val(box, '#aconcept').trim(); x.difficulty = +val(box, '#adiff'); x.hidden = $('#ahidden', box).checked; x.challenge = $('#achal', box).checked;
    x.stem = val(box, '#astem').trim(); x.expl = val(box, '#aexpl').trim(); x.hint = val(box, '#ahint').trim();
    x.choices = x.choices.map((_, i) => $(`[data-ac="${i}"]`, box).value.trim());
    const why = x.choices.map((_, i) => $(`[data-aw="${i}"]`, box).value.trim());
    x.choice_expl = why.some(Boolean) ? why : null;
    x.answer = +(box.querySelector('[name=aans]:checked')?.value || 0);
    const steps = val(box, '#asteps').split('\n').map((t) => t.trim()).filter(Boolean);
    x.steps = steps.length ? steps : null;
  };
  const prev = () => {
    const wrong = x.answer === 0 ? 1 : 0;
    const q2 = { ...x, choiceExpl: x.choice_expl };
    $('#aprev', box).innerHTML = `<div class="stem">${rich(x.stem)}</div><ol class="choices static">${x.choices.map((c, i) => `<li class="${i === x.answer ? 'correct' : i === wrong ? 'wrong' : ''}"><span class="letter">${L(i)}</span> ${rich(c)}</li>`).join('')}</ol>
      ${choiceFeedbackHTML(q2, wrong, rich, { open: true })}<div class="expl"><b>Explanation.</b> ${rich(x.expl)}</div>`;
  };
  box.oninput = () => { read(); prev(); };
  box.onchange = (e) => { if (e.target.name === 'aans') { read(); draw(); } };
  box.onclick = async (e) => {
    const t = e.target.closest('[data-a]'); if (!t) return;
    const a = t.dataset.a;
    if (a === 'add' || a === 'drop') { read(); if (a === 'add') x.choices.push(''); else { x.choices.pop(); if (x.choice_expl) x.choice_expl.pop(); if (x.answer >= x.choices.length) x.answer = 0; } draw(); return; }
    if (a === 'cancel') { box.innerHTML = ''; return; }
    const c = await db();
    if (a === 'del') {
      if (!(await confirmBox('Delete this question for good? (Tick Hidden to take it down temporarily.)', { ok: 'Delete', danger: true }))) return;
      await run(c.from('ap_questions').delete().eq('id', q.id), 'Deleted.');
      box.innerHTML = ''; done(null, q.id); return;
    }
    if (a === 'save') {
      read();
      if (!x.stem || x.choices.some((ch) => !ch) || !x.unit) return toast('Fill in the unit, the question, and every choice.', 'bad');
      const row = { course_id: course.id, unit: x.unit, concept: x.concept, difficulty: x.difficulty, stem: x.stem, choices: x.choices, answer: x.answer, expl: x.expl, choice_expl: x.choice_expl, hint: x.hint, steps: x.steps, hidden: x.hidden, challenge: !!x.challenge };
      const saved = await run(q ? c.from('ap_questions').update(row).eq('id', q.id).select().single() : c.from('ap_questions').insert(row).select().single(), q ? 'Saved.' : 'Question added.');
      try { localStorage.removeItem('sf_ap_' + course.id); localStorage.removeItem('sf_ap_counts'); } catch {}
      box.innerHTML = ''; done(saved);
    }
  };
  draw();
}

// ---------- Settings ----------
const HELP = {
  lesson_player: 'How interactive lessons play.',
  question_feedback: 'What students see after answering in the question banks and practice sets.',
  onboarding: 'Questions asked after sign-up.',
};

export async function settingsPane(host) {
  const c = await db();
  const [{ data: rows, error }, { data: sources }] = await Promise.all([
    c.from('content_settings').select('*').order('key'),
    c.from('signup_sources').select('source,detail,created_at').order('created_at', { ascending: false }).limit(5000),
  ]);
  if (error) { host.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  const byKey = Object.fromEntries((rows || []).map((r) => [r.key, r]));
  const keys = [...new Set([...Object.keys(SETTING_DEFAULTS), ...Object.keys(byKey)])];
  const tally = {};
  for (const r of sources || []) tally[r.source] = (tally[r.source] || 0) + 1;
  const labels = Object.fromEntries((setting('onboarding').heard_about_options || []).map((o) => [o.id, o.label]));
  const total = (sources || []).length;
  host.innerHTML = `<p class="muted">These settings change how lessons, question feedback, and sign-up behave on the website and the app, with no update. Each one is JSON; anything you leave out uses the built-in default.</p>
    <div class="card stack"><h2 class="h3">${icon('chart')} How students heard about StudyFox <span class="muted small">${total} answers</span></h2>
      ${total ? `<div class="stack">${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div><div class="row between small"><span>${esc(labels[k] || k)}</span><b>${n} · ${Math.round((100 * n) / total)}%</b></div><div class="bar thin"><i style="width:${(100 * n) / total}%"></i></div></div>`).join('')}</div>
        <details><summary class="small">Latest details students typed</summary><ul class="small">${(sources || []).filter((r) => r.detail).slice(0, 50).map((r) => `<li><b>${esc(labels[r.source] || r.source)}:</b> ${esc(r.detail)}</li>`).join('') || '<li class="muted">None yet.</li>'}</ul></details>` : '<p class="muted small">No answers yet. New students are asked during sign-up (optional).</p>'}
    </div>
    ${keys.map((k) => {
      const r = byKey[k];
      const value = r ? r.value : SETTING_DEFAULTS[k];
      return `<div class="card stack" data-key="${esc(k)}"><div class="row between wrap gap"><h2 class="h3 mono">${esc(k)}</h2>${r ? `<span class="muted small">Updated ${new Date(r.updated_at).toLocaleString()}</span>` : '<span class="tag">Using defaults</span>'}</div>
        <p class="muted small">${esc(r?.note || HELP[k] || '')}</p>
        <textarea class="mono" rows="${Math.min(22, JSON.stringify(value, null, 2).split('\n').length + 1)}">${esc(JSON.stringify(value, null, 2))}</textarea>
        <p class="small be-warn" hidden></p>
        <div class="row gap"><button class="btn primary sm" data-save>Save</button><button class="btn ghost sm" data-reset>Reset to defaults</button></div></div>`;
    }).join('')}`;
  host.onclick = async (e) => {
    const card = e.target.closest('[data-key]'); if (!card) return;
    const key = card.dataset.key, ta = $('textarea', card), warn = $('.be-warn', card);
    if (e.target.closest('[data-reset]')) { ta.value = JSON.stringify(SETTING_DEFAULTS[key] || {}, null, 2); return; }
    if (!e.target.closest('[data-save]')) return;
    let value;
    try { value = JSON.parse(ta.value); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Settings must be a JSON object, in { }.'); }
    catch (err) { warn.hidden = false; warn.textContent = err.message; return; }
    warn.hidden = true;
    await run(c.from('content_settings').upsert({ key, value, note: byKey[key]?.note || HELP[key] || '' }), 'Saved. Students get it the next time they open StudyFox.');
    invalidateContent(); initContent(db());
  };
}

// ---------- People and pages ----------
const PEOPLE_SECTIONS = [['creator', 'Creator'], ['contributor', 'Contributor'], ['support', 'Support'], ['donor', 'Donor'], ['influencer', 'Creator who shared StudyFox']];

export async function peoplePane(host) {
  const c = await db();
  const [{ data: people, error }, { data: pages }] = await Promise.all([c.from('contributors').select('*').order('sort'), c.from('site_pages').select('*').order('slug')]);
  if (error) { host.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  const about = (pages || []).find((p) => p.slug === 'about') || { slug: 'about', title: '', intro: '', sections: [] };
  const row = (p) => `<div class="card stack" data-person="${p.id ?? ''}">
      <div class="grid2">
        <label>Name<input data-p="name" value="${esc(p.name)}"></label>
        <label>Group<select data-p="section">${PEOPLE_SECTIONS.map(([k, l]) => `<option value="${k}" ${k === p.section ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Role (shown next to the name)<input data-p="role" value="${esc(p.role)}" placeholder="Contributor"></label>
        <label>Order<input data-p="sort" type="number" value="${p.sort}"></label>
        <label>Link (https, optional)<input data-p="url" value="${esc(p.url)}"></label>
        <label>Photo (https or assets/..., optional)<input data-p="image_url" value="${esc(p.image_url)}"></label>
      </div>
      <label>Short description (optional)<textarea data-p="blurb" rows="2">${esc(p.blurb)}</textarea></label>
      <label class="consent"><input type="checkbox" data-p="hidden" ${p.hidden ? 'checked' : ''}> <span>Hidden</span></label>
      <div class="row gap"><button class="btn sm primary" data-psave>${p.id ? 'Save' : 'Add person'}</button>${p.id ? `<button class="btn sm ghost danger-text" data-pdel>${icon('trash')} Remove</button>` : ''}</div>
    </div>`;
  host.innerHTML = `<p class="muted">People show on the Contributors page, in the footer credit, and on the About page. Groups with nobody in them are hidden, so add donors or creators here when you have them.</p>
    <h2 class="h3">People</h2>
    <div class="stack" id="people">${(people || []).map(row).join('')}</div>
    <details class="card"><summary><b>${icon('plus')} Add a person</b></summary>${row({ name: '', section: 'contributor', role: '', sort: ((people || []).at(-1)?.sort || 0) + 10, url: '', image_url: '', blurb: '', hidden: false })}</details>
    <h2 class="h3">About page</h2>
    <div class="card stack" id="aboutEd">
      <label>Headline<input id="abTitle" value="${esc(about.title)}"></label>
      <label>Intro<textarea id="abIntro" rows="2">${esc(about.intro)}</textarea></label>
      <p class="muted small">Sections, in order. Style "card" is a box, "plain" has no box, and "team" shows the people above (its text is ignored). Add an image path to show a photo beside the text. In the text, {{icon:heart}} inserts an icon.</p>
      <div id="abSections" class="stack"></div>
      <div class="row gap wrap"><button class="btn sm ghost" id="abAdd">${icon('plus')} Section</button><button class="btn primary" id="abSave">Save About page</button><a class="btn ghost" href="#/about" target="_blank">${icon('expand')} View</a></div>
    </div>`;
  const secs = structuredClone(about.sections || []);
  const drawSecs = () => {
    $('#abSections', host).innerHTML = secs.map((x, i) => `<div class="be-block" data-sec="${i}">
      <div class="row between gap"><b class="small">Section ${i + 1}</b><span class="row"><button class="btn sm ghost" data-sup="${i}" ${i ? '' : 'disabled'} aria-label="Move up">${icon('up')}</button><button class="btn sm ghost" data-sdown="${i}" ${i < secs.length - 1 ? '' : 'disabled'} aria-label="Move down">${icon('down')}</button><button class="btn sm ghost danger-text" data-sdel="${i}" aria-label="Delete">${icon('trash')}</button></span></div>
      <div class="grid2"><label>Title<input data-s="title" value="${esc(x.title || '')}"></label><label>Style<select data-s="style">${['card', 'plain', 'team'].map((k) => `<option ${k === (x.style || 'card') ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <label>Image (optional)<input data-s="image" value="${esc(x.image || '')}" placeholder="assets/creator.jpg"></label><label>Image description<input data-s="image_alt" value="${esc(x.image_alt || '')}"></label></div>
      <label>Text (HTML)<textarea data-s="html" rows="5" class="mono">${esc(x.html || '')}</textarea></label></div>`).join('');
  };
  drawSecs();
  const after = () => { invalidateContent(); initContent(db()); };
  host.oninput = (e) => { const el = e.target.closest('[data-s]'); if (!el) return; const i = +el.closest('[data-sec]').dataset.sec; secs[i][el.dataset.s] = el.value; if (!el.value && el.dataset.s.startsWith('image')) delete secs[i][el.dataset.s]; };
  host.onclick = async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.id === 'abAdd') { secs.push({ title: '', style: 'card', html: '' }); drawSecs(); return; }
    if (t.dataset.sup || t.dataset.sdown) { const i = +(t.dataset.sup ?? t.dataset.sdown), j = t.dataset.sup ? i - 1 : i + 1; [secs[i], secs[j]] = [secs[j], secs[i]]; drawSecs(); return; }
    if (t.dataset.sdel) { secs.splice(+t.dataset.sdel, 1); drawSecs(); return; }
    if (t.id === 'abSave') {
      await run(c.from('site_pages').upsert({ slug: 'about', title: val(host, '#abTitle').trim(), intro: val(host, '#abIntro').trim(), sections: secs }), 'About page saved.');
      return after();
    }
    const card = t.closest('[data-person]'); if (!card) return;
    const id = card.dataset.person;
    if (t.dataset.pdel != null) {
      if (!(await confirmBox('Remove this person? (Tick Hidden to take them off temporarily.)', { ok: 'Remove', danger: true }))) return;
      await run(c.from('contributors').delete().eq('id', id), 'Removed.'); after(); return peoplePane(host);
    }
    if (t.dataset.psave != null) {
      const g = (k) => card.querySelector(`[data-p="${k}"]`);
      const r = { name: g('name').value.trim(), section: g('section').value, role: g('role').value.trim(), sort: +g('sort').value || 0, url: g('url').value.trim(), image_url: g('image_url').value.trim(), blurb: g('blurb').value.trim(), hidden: g('hidden').checked };
      if (!r.name) return toast('Add a name.', 'bad');
      await run(id ? c.from('contributors').update(r).eq('id', id) : c.from('contributors').insert(r), id ? 'Saved.' : 'Added.');
      after(); if (!id) peoplePane(host);
    }
  };
}

// Users: every account with its number, sign-up, last login, days active, and friend referrals.
// Data comes from public.admin_users() (supabase/admin_users.sql), which only admins can call.
export async function usersPane(host) {
  const c = await db();
  const { data, error } = await c.rpc('admin_users');
  if (error) { host.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  const rows = data || [];
  const d = (v) => (v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-');
  const cols = [['no', '#'], ['name', 'Name'], ['email', 'Email'], ['signed_up', 'Signed up'], ['last_login', 'Last login'], ['last_active', 'Last active'], ['days_active', 'Days active'], ['platforms', 'Platforms'], ['referred_by', 'Shared by'], ['referrals', 'Friends shared with']];
  let sort = 'no', dir = 1, q = '';
  const draw = () => {
    const f = q.toLowerCase();
    const list = rows.filter((r) => !f || `${r.no} ${r.name} ${r.email}`.toLowerCase().includes(f))
      .sort((a, b) => { const x = a[sort] ?? '', y = b[sort] ?? ''; return (x > y ? 1 : x < y ? -1 : 0) * dir; });
    const total = rows.length, refd = rows.filter((r) => r.referred_by).length;
    const active7 = rows.filter((r) => r.last_active && Date.now() - new Date(r.last_active) < 7 * 864e5).length;
    $('#uSum', host).textContent = `${total} users, ${active7} active in the last 7 days, ${refd} joined through a friend. Showing ${list.length}.`;
    $('#uTable', host).innerHTML = `<thead><tr>${cols.map(([k, l]) => `<th><button class="btn sm ghost" data-sort="${k}">${l}${k === sort ? (dir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`).join('')}</tr></thead>
      <tbody>${list.map((r) => `<tr><td><b>${r.no}</b></td><td>${esc(r.name || '-')}</td><td class="small">${esc(r.email || '-')}</td><td>${d(r.signed_up)}</td><td>${d(r.last_login)}</td><td>${d(r.last_active)}</td><td>${r.days_active}</td><td class="small">${esc(r.platforms || '-')}</td>
        <td>${r.referred_by ? `#${r.referred_by}${r.referred_by_name ? ` ${esc(r.referred_by_name)}` : ''}` : '-'}</td>
        <td>${r.referrals ? `<b>${r.referrals}</b> <span class="muted small">(${(r.referral_nos || []).map((n) => '#' + n).join(', ')})</span>` : '0'}</td></tr>`).join('')}</tbody>`;
  };
  host.innerHTML = `<p class="muted">Every account. "Days active" counts the days a student opened StudyFox signed in (Supabase keeps people signed in, so this is the best login count). Click a column to sort.</p>
    <div class="row gap wrap"><input id="uFind" placeholder="Search number, name, or email" style="max-width:320px"><button class="btn sm ghost" id="uCsv">${icon('down')} Download CSV</button></div>
    <p class="small muted" id="uSum"></p>
    <div class="card flush" style="overflow-x:auto"><table class="list" id="uTable"></table></div>`;
  draw();
  $('#uFind', host).oninput = (e) => { q = e.target.value; draw(); };
  host.onclick = (e) => {
    const b = e.target.closest('[data-sort]');
    if (b) { const k = b.dataset.sort; dir = k === sort ? -dir : (k === 'no' || k === 'name' || k === 'email' ? 1 : -1); sort = k; draw(); return; }
    if (e.target.closest('#uCsv')) {
      const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = [cols.map(([, l]) => l).concat('Friend numbers'), ...rows.map((r) => cols.map(([k]) => r[k]).concat((r.referral_nos || []).join(' ')))].map((l) => l.map(cell).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'studyfox-users.csv'; a.click();
    }
  };
}
