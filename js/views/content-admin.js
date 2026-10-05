// Admin console: edit study content stored in Supabase (courses, lessons, flashcard decks, custom
// questions, hidden bank questions). Changes go live on the website and the iOS app without a redeploy:
// both load content through js/content/live.js. Every write is checked by the server (public.is_admin()).
import { icon, ICON_NAMES } from '../icons.js';
import { $, esc, tex, toast } from '../util.js';
import { db, isAdmin } from '../cloud.js';
import { confirmBox } from '../tools.js';
import { SUBJECTS } from '../content/courses.js';
import { initContent, invalidateContent } from '../content/live.js';
import { SECTIONS, taxonomy } from '../gen/index.js';
import { bank } from '../gen/bank.js';

const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const val = (root, sel) => $(sel, root)?.value ?? '';
const L = (i) => 'ABCDE'[i];

async function refreshLive() { invalidateContent(); await initContent(db()); }
async function run(promise, ok) {
  const { error, data } = await promise;
  if (error) { toast(error.message, 'bad'); throw error; }
  if (ok) toast(ok, 'good');
  refreshLive();
  return data;
}

export function contentAdminView(root) {
  root.innerHTML = `<div class="page narrow-wide"><p class="muted">Checking access…</p></div>`;
  isAdmin().then((ok) => {
    if (!ok) { root.innerHTML = `<div class="page narrow"><h1>Admins only</h1><a class="btn" href="#/dashboard">Back to dashboard</a></div>`; return; }
    const q = new URLSearchParams(location.hash.split('?')[1] || '');
    const tab = q.get('t') || 'courses';
    root.innerHTML = `<div class="page narrow-wide admin content-admin">
      <a class="small" href="#/admin">${icon('left')} Admin console</a>
      <div class="page-head"><span class="eyebrow">${icon('shield')} Content</span><h1>Lessons, decks, and questions</h1>
        <p class="muted">Edits go live on studyfox.org and the iOS app right away. No update needed. Students see changes the next time they open the site or the app.</p></div>
      <div class="tabs">${[['courses', 'Courses and lessons'], ['questions', 'Questions'], ['decks', 'Flashcard decks']].map(([k, l]) => `<a class="${k === tab ? 'on' : ''}" href="#/admin/content?t=${k}">${l}</a>`).join('')}</div>
      <div id="ce"></div></div>`;
    const host = $('#ce', root);
    const route = () => {
      const p = new URLSearchParams(location.hash.split('?')[1] || '');
      if (tab === 'questions') return questionsPane(host);
      if (tab === 'decks') return p.get('deck') != null ? deckEditor(host, p.get('deck')) : decksPane(host);
      if (p.get('lesson') != null) return lessonEditor(host, p.get('course'), p.get('lesson'));
      if (p.get('course') != null) return courseEditor(host, p.get('course'));
      return coursesPane(host);
    };
    route();
  });
}

// ---------- Courses ----------
async function coursesPane(host) {
  const c = await db();
  const [{ data: courses }, { data: lessons }] = await Promise.all([c.from('courses').select('*').order('sort'), c.from('lessons').select('course_id,hidden')]);
  const count = {}; for (const l of lessons || []) count[l.course_id] = (count[l.course_id] || 0) + 1;
  host.innerHTML = `<div class="row between wrap gap"><p class="muted">${courses.length} courses. Drag order is set by the number on each course (lower comes first).</p>
      <a class="btn primary" href="#/admin/content?course=">${icon('edit')} New course</a></div>
    ${SUBJECTS.map((s) => {
      const cs = courses.filter((x) => x.subject === s);
      return cs.length ? `<h2 class="h3">${esc(s)}</h2><div class="stack">${cs.map((x) => `<a class="card hover row between gap ce-row" href="#/admin/content?course=${x.id}">
        <span class="row gap">${icon(x.icon)}<span><b>${esc(x.title)}</b> ${x.hidden ? '<span class="tag">Hidden</span>' : ''}${x.ap ? '<span class="tag subtle">AP</span>' : ''}<br><span class="muted small">${count[x.id] || 0} lessons · ${esc(x.level)} · order ${x.sort}</span></span></span>${icon('right')}</a>`).join('')}</div>` : '';
    }).join('')}`;
}

async function courseEditor(host, id) {
  const c = await db();
  const isNew = !id;
  const course = isNew ? { id: '', subject: SUBJECTS[0], icon: 'book', title: '', blurb: '', level: '', ap: false, sort: 999, hidden: false } : (await c.from('courses').select('*').eq('id', id).single()).data;
  if (!course) { host.innerHTML = '<p class="muted">Course not found.</p>'; return; }
  const lessons = isNew ? [] : (await c.from('lessons').select('id,title,sort,mins,hidden').eq('course_id', id).order('sort')).data;
  host.innerHTML = `<a class="small" href="#/admin/content">${icon('left')} All courses</a>
    <div class="card stack">
      <h2 class="h3">${isNew ? 'New course' : 'Course details'}</h2>
      <div class="grid2">
        <label>Title<input id="title" value="${esc(course.title)}" placeholder="AP Biology"></label>
        <label>ID (used in links)<input id="cid" value="${esc(course.id)}" ${isNew ? '' : 'readonly'} placeholder="ap-biology"></label>
        <label>Subject<select id="subject">${SUBJECTS.map((s) => `<option ${s === course.subject ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
        <label>Icon<select id="icon">${ICON_NAMES.map((n) => `<option ${n === course.icon ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>Level<input id="level" value="${esc(course.level)}" placeholder="Grades 10 to 12 · AP"></label>
        <label>Order<input id="sort" type="number" value="${course.sort}"></label>
      </div>
      <label>Short description<textarea id="blurb" rows="2">${esc(course.blurb)}</textarea></label>
      <label class="consent"><input type="checkbox" id="ap" ${course.ap ? 'checked' : ''}> <span>AP course (shows under the AP filter)</span></label>
      <label class="consent"><input type="checkbox" id="hidden" ${course.hidden ? 'checked' : ''}> <span>Hidden (students don't see it)</span></label>
      <div class="row gap wrap"><button class="btn primary" id="save">${isNew ? 'Create course' : 'Save course'}</button>${isNew ? '' : '<button class="btn ghost danger-text" id="del">Delete course and its lessons</button>'}</div>
    </div>
    ${isNew ? '' : `<div class="row between wrap gap"><h2 class="h3">Lessons (${lessons.length})</h2><a class="btn" href="#/admin/content?course=${id}&lesson=">${icon('edit')} New lesson</a></div>
    <div class="stack">${lessons.map((l, i) => `<div class="card row between gap ce-row">
      <a class="grow" href="#/admin/content?course=${id}&lesson=${l.id}"><b>${i + 1}. ${esc(l.title)}</b> ${l.hidden ? '<span class="tag">Hidden</span>' : ''}<br><span class="muted small">${l.mins} min · ${l.id}</span></a>
      <span class="row gap"><button class="btn sm ghost" data-up="${i}" ${i ? '' : 'disabled'} aria-label="Move up">${icon('up')}</button><button class="btn sm ghost" data-down="${i}" ${i < lessons.length - 1 ? '' : 'disabled'} aria-label="Move down">${icon('down')}</button></span>
    </div>`).join('') || '<p class="muted">No lessons yet.</p>'}</div>`}`;

  $('#title', host).addEventListener('input', (e) => { if (isNew) $('#cid', host).value = slug(e.target.value); });
  $('#save', host).onclick = async () => {
    const row = { id: slug(val(host, '#cid')), title: val(host, '#title').trim(), subject: val(host, '#subject'), icon: val(host, '#icon'), level: val(host, '#level').trim(), sort: +val(host, '#sort') || 0, blurb: val(host, '#blurb').trim(), ap: $('#ap', host).checked, hidden: $('#hidden', host).checked };
    if (!row.title || !row.id) return toast('Add a title.', 'bad');
    await run(isNew ? c.from('courses').insert(row) : c.from('courses').update(row).eq('id', id), isNew ? 'Course created.' : 'Saved.');
    if (isNew) location.hash = `#/admin/content?course=${row.id}`;
  };
  $('#del', host)?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete "${esc(course.title)}" and all ${lessons.length} lessons? This can't be undone. (To take it down temporarily, tick Hidden instead.)`, { ok: 'Delete', danger: true }))) return;
    await run(c.from('courses').delete().eq('id', id), 'Course deleted.');
    location.hash = '#/admin/content';
  });
  host.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-up],[data-down]'); if (!b) return;
    const i = +(b.dataset.up ?? b.dataset.down), j = b.dataset.up != null ? i - 1 : i + 1;
    const order = lessons.slice(); [order[i], order[j]] = [order[j], order[i]];
    await Promise.all(order.map((l, k) => c.from('lessons').update({ sort: k }).eq('course_id', id).eq('id', l.id)));
    refreshLive(); courseEditor(host, id);
  });
}

async function lessonEditor(host, courseId, lessonId) {
  const c = await db();
  const isNew = !lessonId;
  const l = isNew ? { id: '', title: '', mins: 5, body: '', check: null, practice: null, desmos: null, hidden: false } : (await c.from('lessons').select('*').eq('course_id', courseId).eq('id', lessonId).single()).data;
  if (!l) { host.innerHTML = '<p class="muted">Lesson not found.</p>'; return; }
  const k = l.check || { q: '', choices: ['', '', '', ''], answer: 0, why: '' };
  host.innerHTML = `<a class="small" href="#/admin/content?course=${courseId}">${icon('left')} Back to course</a>
    <div class="card stack">
      <h2 class="h3">${isNew ? 'New lesson' : 'Edit lesson'}</h2>
      <div class="grid2">
        <label>Title<input id="title" value="${esc(l.title)}"></label>
        <label>ID (used in links)<input id="lid" value="${esc(l.id)}" ${isNew ? '' : 'readonly'}></label>
        <label>Minutes<input id="mins" type="number" min="1" value="${l.mins}"></label>
        <label class="consent" style="align-self:end"><input type="checkbox" id="hidden" ${l.hidden ? 'checked' : ''}> <span>Hidden</span></label>
      </div>
      <label>Lesson text<span class="muted small"> HTML: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;&lt;li&gt;, &lt;b&gt;, tables. Math goes between dollar signs, like $x^2 + 1$. Boxes: &lt;div class="tip"&gt;&lt;b&gt;Tip&lt;/b&gt; ...&lt;/div&gt;, &lt;div class="rule"&gt;...&lt;/div&gt;, &lt;div class="worked"&gt;...&lt;/div&gt;.</span>
        <textarea id="body" rows="18" class="mono">${esc(l.body)}</textarea></label>
      <details open><summary><b>Preview</b></summary><article class="card lesson-body" id="preview"></article></details>
    </div>
    <div class="card stack">
      <h2 class="h3">Quick check <span class="muted small">(optional; leave the question blank for none)</span></h2>
      <label>Question<textarea id="kq" rows="2">${esc(k.q)}</textarea></label>
      ${[0, 1, 2, 3].map((i) => `<label class="row gap"><input type="radio" name="kans" value="${i}" ${k.answer === i ? 'checked' : ''} aria-label="Correct answer"> <span class="grow">Choice ${L(i)}<input data-kc="${i}" value="${esc(k.choices[i] || '')}"></span></label>`).join('')}
      <p class="muted small">Pick the circle next to the correct choice.</p>
      <label>Why (shown after answering)<textarea id="kwhy" rows="2">${esc(k.why)}</textarea></label>
    </div>
    <div class="card stack">
      <h2 class="h3">Extras <span class="muted small">(optional)</span></h2>
      <label>Practice link: test, section, skills<input id="practice" value="${esc(l.practice ? [l.practice.test, l.practice.section, ...(l.practice.skills || [])].join(', ') : '')}" placeholder="SAT, math, Linear equations in one variable"></label>
      <label>Desmos expressions (one per line)<textarea id="desmos" rows="3" class="mono">${esc((l.desmos || []).map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join('\n'))}</textarea></label>
    </div>
    <div class="row gap wrap"><button class="btn primary lg" id="save">${isNew ? 'Create lesson' : 'Save lesson'}</button>${isNew ? '' : '<button class="btn ghost danger-text" id="del">Delete lesson</button>'}</div>`;
  const preview = () => { $('#preview', host).innerHTML = tex(val(host, '#body')); };
  preview();
  $('#body', host).addEventListener('input', preview);
  $('#title', host).addEventListener('input', (e) => { if (isNew) $('#lid', host).value = slug(e.target.value); });
  $('#save', host).onclick = async () => {
    const kq = val(host, '#kq').trim();
    const choices = [0, 1, 2, 3].map((i) => $(`[data-kc="${i}"]`, host).value.trim());
    const check = kq ? { q: kq, choices, answer: +(host.querySelector('[name=kans]:checked')?.value || 0), why: val(host, '#kwhy').trim() } : null;
    if (check && choices.some((x) => !x)) return toast('Fill in all four quick check choices, or clear the question.', 'bad');
    const pr = val(host, '#practice').split(',').map((x) => x.trim()).filter(Boolean);
    const desmos = val(host, '#desmos').split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { try { return x.startsWith('{') ? JSON.parse(x) : x; } catch { return x; } });
    const row = {
      course_id: courseId, id: slug(val(host, '#lid')), title: val(host, '#title').trim(), mins: +val(host, '#mins') || 5, body: val(host, '#body'),
      check, practice: pr.length >= 2 ? { test: pr[0].toUpperCase(), section: pr[1], ...(pr.length > 2 ? { skills: pr.slice(2) } : {}) } : null,
      desmos: desmos.length ? desmos : null, hidden: $('#hidden', host).checked,
    };
    if (!row.title || !row.id) return toast('Add a title.', 'bad');
    if (isNew) {
      const { data: last } = await c.from('lessons').select('sort').eq('course_id', courseId).order('sort', { ascending: false }).limit(1);
      row.sort = (last?.[0]?.sort ?? -1) + 1;
    }
    await run(isNew ? c.from('lessons').insert(row) : c.from('lessons').update(row).eq('course_id', courseId).eq('id', lessonId), isNew ? 'Lesson created.' : 'Saved.');
    if (isNew) location.hash = `#/admin/content?course=${courseId}&lesson=${row.id}`;
  };
  $('#del', host)?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete "${esc(l.title)}"? This can't be undone. (Tick Hidden to take it down temporarily.)`, { ok: 'Delete', danger: true }))) return;
    await run(c.from('lessons').delete().eq('course_id', courseId).eq('id', lessonId), 'Lesson deleted.');
    location.hash = `#/admin/content?course=${courseId}`;
  });
}

// ---------- Questions ----------
async function questionsPane(host) {
  const c = await db();
  const [{ data: qs }, { data: hidden }] = await Promise.all([c.from('questions').select('*').order('id'), c.from('hidden_questions').select('*').order('created_at', { ascending: false })]);
  const numberOf = (id) => { const t = id.split('|')[1]; return bank(t).find((e) => e.id === id)?.no; };
  host.innerHTML = `
    <div class="card stack">
      <h2 class="h3">${icon('edit')} Add a question</h2>
      <p class="muted small">Your questions join the numbered question bank (after the generated ones) and practice sets on the website and the app.</p>
      <div id="qform"></div>
    </div>
    <h2 class="h3">Your questions (${qs.length})</h2>
    <div class="stack">${qs.map((x) => `<div class="card row between gap ce-row"><span class="grow"><b>${esc(x.test)} · ${esc(x.skill)}</b> ${x.hidden ? '<span class="tag">Hidden</span>' : ''}<br><span class="muted small">${esc(String(x.stem).replace(/<[^>]+>/g, '').slice(0, 140))}</span></span>
      <span class="row gap"><button class="btn sm" data-edit="${x.id}">Edit</button><button class="btn sm ghost" data-toggle="${x.id}" data-h="${x.hidden ? 1 : 0}">${x.hidden ? 'Show' : 'Hide'}</button><button class="btn sm ghost danger-text" data-delq="${x.id}">${icon('trash')}</button></span></div>`).join('') || '<p class="muted">None yet.</p>'}</div>
    <div class="card stack">
      <h2 class="h3">${icon('x')} Remove a bank question</h2>
      <p class="muted small">Hide any numbered question (SAT #12, ACT #400) from the bank and practice sets. Its number stays reserved.</p>
      <div class="row gap wrap"><select id="htest"><option>SAT</option><option>ACT</option></select><input id="hno" type="number" min="1" placeholder="Number" style="max-width:9rem"><input id="hnote" placeholder="Why (optional)"><button class="btn" id="hide">Hide question</button></div>
      <div class="stack">${(hidden || []).map((h) => `<div class="row between gap"><span>${esc(h.id.split('|')[1])} #${numberOf(h.id) ?? '?'} <span class="muted small">${esc(h.note)}</span></span><button class="btn sm ghost" data-unhide="${esc(h.id)}">Restore</button></div>`).join('') || '<p class="muted small">No hidden questions.</p>'}</div>
    </div>`;
  questionForm($('#qform', host), null, () => questionsPane(host));
  host.onclick = async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.edit) { const x = qs.find((y) => String(y.id) === t.dataset.edit); const m = $('#qform', host); questionForm(m, x, () => questionsPane(host)); m.scrollIntoView({ behavior: 'smooth' }); }
    if (t.dataset.toggle) { await run(c.from('questions').update({ hidden: t.dataset.h !== '1' }).eq('id', t.dataset.toggle), 'Saved.'); questionsPane(host); }
    if (t.dataset.delq && (await confirmBox('Delete this question for good?', { ok: 'Delete', danger: true }))) { await run(c.from('questions').delete().eq('id', t.dataset.delq), 'Deleted.'); questionsPane(host); }
    if (t.dataset.unhide) { await run(c.from('hidden_questions').delete().eq('id', t.dataset.unhide), 'Restored.'); questionsPane(host); }
    if (t.id === 'hide') {
      const test = val(host, '#htest'), no = +val(host, '#hno');
      const entry = bank(test).find((x) => x.no === no);
      if (!entry) return toast(`${test} #${no} isn't in the bank (it may already be hidden).`, 'bad');
      await run(c.from('hidden_questions').insert({ id: entry.id, note: val(host, '#hnote').trim() }), `${test} #${no} hidden.`);
      questionsPane(host);
    }
  };
}

function questionForm(box, q, done) {
  const x = q || { test: 'SAT', section: 'math', domain: '', skill: '', difficulty: 2, passage: '', stem: '', choices: ['', '', '', ''], answer: 0, expl: '', hidden: false };
  const opts = (test) => Object.entries(SECTIONS[test]).map(([k, v]) => `<option value="${k}" ${k === x.section ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const lists = (test, section) => {
    const doms = taxonomy(test)[section] || {};
    return `<datalist id="qdoms">${Object.keys(doms).map((d) => `<option value="${esc(d)}">`).join('')}</datalist><datalist id="qskills">${Object.values(doms).flatMap((s) => Object.keys(s)).map((s) => `<option value="${esc(s)}">`).join('')}</datalist>`;
  };
  box.innerHTML = `${q ? `<p class="tag">Editing question ${q.id}</p>` : ''}
    <div class="grid2">
      <label>Test<select id="qtest"><option ${x.test === 'SAT' ? 'selected' : ''}>SAT</option><option ${x.test === 'ACT' ? 'selected' : ''}>ACT</option></select></label>
      <label>Section<select id="qsec">${opts(x.test)}</select></label>
      <label>Domain<input id="qdom" list="qdoms" value="${esc(x.domain)}" placeholder="Pick or type"></label>
      <label>Skill<input id="qskill" list="qskills" value="${esc(x.skill)}" placeholder="Pick or type"></label>
      <label>Difficulty<select id="qdiff">${[1, 2, 3].map((d) => `<option value="${d}" ${d === x.difficulty ? 'selected' : ''}>${['Easy', 'Medium', 'Hard'][d - 1]}</option>`).join('')}</select></label>
    </div><span id="qlists">${lists(x.test, x.section)}</span>
    <label>Passage <span class="muted small">(optional)</span><textarea id="qpass" rows="3">${esc(x.passage)}</textarea></label>
    <label>Question<textarea id="qstem" rows="3" placeholder="Math goes between dollar signs, like $2x + 3 = 11$.">${esc(x.stem)}</textarea></label>
    ${[0, 1, 2, 3].map((i) => `<label class="row gap"><input type="radio" name="qans" value="${i}" ${x.answer === i ? 'checked' : ''} aria-label="Correct answer"> <span class="grow">Choice ${L(i)}<input data-qc="${i}" value="${esc(x.choices[i] || '')}"></span></label>`).join('')}
    <p class="muted small">Pick the circle next to the correct choice.</p>
    <label>Explanation<textarea id="qexpl" rows="3">${esc(x.expl)}</textarea></label>
    <details><summary>Preview</summary><div class="card" id="qprev"></div></details>
    <div class="row gap"><button class="btn primary" id="qsave">${q ? 'Save question' : 'Add question'}</button>${q ? '<button class="btn ghost" id="qcancel">Cancel</button>' : ''}</div>`;
  const prev = () => {
    const ch = [0, 1, 2, 3].map((i) => $(`[data-qc="${i}"]`, box).value);
    $('#qprev', box).innerHTML = `${val(box, '#qpass') ? `<div class="passage">${tex(val(box, '#qpass'))}</div>` : ''}<div class="stem">${tex(val(box, '#qstem'))}</div><ol class="choices static">${ch.map((t, i) => `<li><span class="letter">${L(i)}</span><span class="ctext">${tex(t)}</span></li>`).join('')}</ol><div class="expl"><b>Explanation.</b> ${tex(val(box, '#qexpl'))}</div>`;
  };
  box.oninput = prev; prev();
  $('#qtest', box).onchange = (e) => { x.test = e.target.value; x.section = Object.keys(SECTIONS[x.test])[0]; $('#qsec', box).innerHTML = opts(x.test); $('#qlists', box).innerHTML = lists(x.test, x.section); };
  $('#qsec', box).onchange = (e) => { $('#qlists', box).innerHTML = lists(val(box, '#qtest'), e.target.value); };
  $('#qcancel', box)?.addEventListener('click', done);
  $('#qsave', box).onclick = async () => {
    const choices = [0, 1, 2, 3].map((i) => $(`[data-qc="${i}"]`, box).value.trim());
    const row = { test: val(box, '#qtest'), section: val(box, '#qsec'), domain: val(box, '#qdom').trim(), skill: val(box, '#qskill').trim(), difficulty: +val(box, '#qdiff'),
      passage: val(box, '#qpass').trim(), stem: val(box, '#qstem').trim(), choices, answer: +(box.querySelector('[name=qans]:checked')?.value || 0), expl: val(box, '#qexpl').trim() };
    if (!row.stem || choices.some((ch) => !ch) || !row.domain || !row.skill) return toast('Fill in the question, all four choices, the domain, and the skill.', 'bad');
    const c = await db();
    await run(q ? c.from('questions').update(row).eq('id', q.id) : c.from('questions').insert(row), q ? 'Saved.' : 'Question added.');
    done();
  };
}

// ---------- Decks ----------
async function decksPane(host) {
  const c = await db();
  const { data: decks } = await c.from('decks').select('id,title,tag,sort,hidden,cards').order('sort');
  host.innerHTML = `<div class="row between wrap gap"><p class="muted">Free study sets everyone sees on the Flashcards page.</p><a class="btn primary" href="#/admin/content?t=decks&deck=">${icon('edit')} New deck</a></div>
    <div class="stack">${decks.map((d) => `<a class="card hover row between gap ce-row" href="#/admin/content?t=decks&deck=${d.id}"><span><b>${esc(d.title)}</b> ${d.hidden ? '<span class="tag">Hidden</span>' : ''}<br><span class="muted small">${d.cards.length} cards · ${esc(d.tag)} · order ${d.sort}</span></span>${icon('right')}</a>`).join('')}</div>`;
}

async function deckEditor(host, id) {
  const c = await db();
  const isNew = !id;
  const d = isNew ? { id: '', title: '', desc: '', tag: '', cards: [], sort: 999, hidden: false } : (await c.from('decks').select('*').eq('id', id).single()).data;
  host.innerHTML = `<a class="small" href="#/admin/content?t=decks">${icon('left')} All decks</a>
    <div class="card stack">
      <div class="grid2">
        <label>Title<input id="title" value="${esc(d.title)}"></label>
        <label>ID<input id="did" value="${esc(d.id)}" ${isNew ? '' : 'readonly'}></label>
        <label>Tag<input id="tag" value="${esc(d.tag)}" placeholder="SAT · Vocabulary"></label>
        <label>Order<input id="sort" type="number" value="${d.sort}"></label>
      </div>
      <label>Description<textarea id="desc" rows="2">${esc(d.desc)}</textarea></label>
      <label>Cards <span class="muted small">One per line: term, then a tab or " - ", then the definition.</span><textarea id="cards" rows="16" class="mono">${esc(d.cards.map((x) => `${x.t}\t${x.d}`).join('\n'))}</textarea></label>
      <label class="consent"><input type="checkbox" id="hidden" ${d.hidden ? 'checked' : ''}> <span>Hidden</span></label>
      <div class="row gap"><button class="btn primary" id="save">${isNew ? 'Create deck' : 'Save deck'}</button>${isNew ? '' : '<button class="btn ghost danger-text" id="del">Delete deck</button>'}</div>
    </div>`;
  $('#title', host).addEventListener('input', (e) => { if (isNew) $('#did', host).value = slug(e.target.value); });
  $('#save', host).onclick = async () => {
    const cards = val(host, '#cards').split('\n').map((line) => { const m = line.match(/^(.*?)(?:\t| - )(.*)$/); return m ? { t: m[1].trim(), d: m[2].trim() } : null; }).filter((x) => x && x.t && x.d);
    const row = { id: slug(val(host, '#did')), title: val(host, '#title').trim(), tag: val(host, '#tag').trim(), desc: val(host, '#desc').trim(), sort: +val(host, '#sort') || 0, cards, hidden: $('#hidden', host).checked };
    if (!row.title || !row.id) return toast('Add a title.', 'bad');
    if (cards.length < 2) return toast('Add at least two cards.', 'bad');
    await run(isNew ? c.from('decks').insert(row) : c.from('decks').update(row).eq('id', id), isNew ? 'Deck created.' : 'Saved.');
    if (isNew) location.hash = `#/admin/content?t=decks&deck=${row.id}`;
  };
  $('#del', host)?.addEventListener('click', async () => {
    if (!(await confirmBox(`Delete "${esc(d.title)}"?`, { ok: 'Delete', danger: true }))) return;
    await run(c.from('decks').delete().eq('id', id), 'Deck deleted.');
    location.hash = '#/admin/content?t=decks';
  });
}
