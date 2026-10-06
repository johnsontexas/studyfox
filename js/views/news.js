// News feed, admin console (posts + maintenance switch), and the contact page.
import { icon } from '../icons.js';
import { $, esc, toast, timeAgo } from '../util.js';
import { store } from '../store.js';
import { db, isAdmin, cloudEnabled } from '../cloud.js';
import { confirmBox } from '../tools.js';
import { CONTACT_EMAIL, SUPPORT_EMAIL, SUPPORT_FORM_URL } from '../config.js';

// Post bodies are plain text: escaped, then blank lines become paragraphs and bare links become links.
const body = (t) => esc(t).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>').replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener nofollow">${u}</a>`)}</p>`).join('');
const date = (s) => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export async function fetchNews(limit = 50) {
  if (!cloudEnabled) return [];
  const c = await db();
  const { data, error } = await c.from('news').select('id,title,body,pinned,image_url,created_at').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchStatus() {
  if (!cloudEnabled) return null;
  const c = await db();
  const { data } = await c.from('site_status').select('maintenance,message,ios_app_url').eq('id', 1).maybeSingle();
  return data;
}

// Posts without a photo get a colored cover so the feed never looks bare.
const COVERS = [['#1f6b47', '#5fcf94', 'news'], ['#9a6200', '#f2b33d', 'star'], ['#21507a', '#5fa8e0', 'book'], ['#7a2f5a', '#e07ab0', 'heart'], ['#3d3a8a', '#8b86e8', 'trophy']];
const cover = (n) => { const [c1, c2, ic] = COVERS[Number(n.id) % COVERS.length]; return `<div class="news-cover" style="--c1:${c1};--c2:${c2}" aria-hidden="true">${icon(ic)}</div>`; };
const postHTML = (n, admin) => `<article class="news-post card${n.pinned ? ' pinned' : ''}">
  ${n.image_url ? `<img class="news-img" src="${esc(n.image_url)}" alt="" loading="lazy">` : cover(n)}
  <div class="news-meta">${n.pinned ? `<span class="tag">Pinned</span>` : ''}<time class="muted small" datetime="${esc(n.created_at)}">${date(n.created_at)}</time>
    ${admin ? `<span class="grow"></span><button class="btn sm ghost" data-pin="${n.id}" data-on="${n.pinned ? 1 : 0}">${n.pinned ? 'Unpin' : 'Pin'}</button><button class="btn sm ghost danger-text" data-del="${n.id}">${icon('trash')} Delete</button>` : ''}</div>
  <h2 class="h3">${esc(n.title)}</h2><div class="news-body">${body(n.body)}</div></article>`;

// Form for writing a post; used on the news page, admin console, dashboard, and home.
const composerHTML = (compact) => `<form class="card news-compose${compact ? ' compact' : ''}" data-compose>
  <div class="row between"><b>${icon('edit')} New post</b><span class="tag subtle">${icon('shield')} Admin</span></div>
  <input name="title" maxlength="160" placeholder="Title" required>
  <textarea name="body" rows="${compact ? 3 : 6}" maxlength="8000" placeholder="What's new? Blank lines start a new paragraph." required></textarea>
  <div class="img-row"><label class="btn sm ghost">${icon('upload')} Add image<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label><span class="muted small" data-imgname>Optional. PNG, JPG, WebP, or GIF up to 5 MB.</span></div>
  <div class="row between wrap gap"><label class="row gap small"><input type="checkbox" name="pinned"> Pin to top</label><button class="btn primary sm">Post</button></div>
</form>`;

async function wireComposer(root, onDone) {
  root.addEventListener('change', (e) => {
    if (e.target.name !== 'image') return;
    const f = e.target.closest('[data-compose]'), file = e.target.files[0];
    const label = f.querySelector('[data-imgname]');
    f.querySelector('.img-prev')?.remove();
    if (!file) return;
    label.textContent = file.name;
    const img = Object.assign(document.createElement('img'), { className: 'img-prev', src: URL.createObjectURL(file), alt: '' });
    label.after(img);
  });
  root.addEventListener('submit', async (e) => {
    const f = e.target.closest('[data-compose]');
    if (!f) return;
    e.preventDefault();
    const btn = f.querySelector('button'); btn.disabled = true;
    const c = await db();
    let image_url = '';
    const file = f.image.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { btn.disabled = false; return toast('That image is over 5 MB.', 'bad'); }
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${(file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const up = await c.storage.from('news-images').upload(path, file, { contentType: file.type });
      if (up.error) { btn.disabled = false; return toast(up.error.message, 'bad'); }
      image_url = c.storage.from('news-images').getPublicUrl(path).data.publicUrl;
    }
    const { error } = await c.from('news').insert({ title: f.title.value.trim(), body: f.body.value.trim(), pinned: f.pinned.checked, image_url });
    btn.disabled = false;
    if (error) return toast(error.message, 'bad');
    f.reset(); f.querySelector('.img-prev')?.remove(); toast('Posted.', 'good'); onDone?.();
  });
  root.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]'), pin = e.target.closest('[data-pin]');
    if (!del && !pin) return;
    const c = await db();
    if (del) {
      if (!(await confirmBox('Delete this post for everyone?', { ok: 'Delete', danger: true }))) return;
      const { error } = await c.from('news').delete().eq('id', del.dataset.del);
      if (error) return toast(error.message, 'bad');
    } else {
      const { error } = await c.from('news').update({ pinned: pin.dataset.on !== '1' }).eq('id', pin.dataset.pin);
      if (error) return toast(error.message, 'bad');
    }
    onDone?.();
  });
}

export function newsView(root) {
  root.innerHTML = `<div class="page narrow-wide news-page">
    <div class="page-head"><span class="eyebrow">${icon('news')} News</span><h1>What's new on StudyFox</h1><p class="muted">New courses, features, and announcements.</p></div>
    <div id="compose"></div><div id="feed"><p class="muted">Loading…</p></div></div>`;
  let admin = false;
  const draw = async () => {
    try {
      const list = await fetchNews();
      $('#feed', root).innerHTML = list.length ? list.map((n) => postHTML(n, admin)).join('') : `<div class="card empty-note"><p class="muted">No news yet. Check back soon.</p></div>`;
    } catch { $('#feed', root).innerHTML = `<p class="muted">News couldn't load. Try again in a minute.</p>`; }
  };
  isAdmin().then((a) => { admin = a; if (a) $('#compose', root).innerHTML = composerHTML(false); draw(); });
  wireComposer(root, draw);
}

// Small "Latest news" block for the dashboard and home page; admins also get a quick composer.
export function newsWidget(host) {
  if (!host || !cloudEnabled) return;
  const draw = async () => {
    const [list, admin] = await Promise.all([fetchNews(3).catch(() => []), isAdmin()]);
    if (!list.length && !admin) { host.innerHTML = ''; return; }
    host.innerHTML = `<div class="news-widget">
      <div class="row between"><h2 class="h3">${icon('news')} Latest news</h2><a class="small" href="#/news">All news ${icon('right')}</a></div>
      ${list.map((n) => `<a class="news-item" href="#/news">${n.image_url ? `<img class="news-thumb" src="${esc(n.image_url)}" alt="" loading="lazy">` : ''}<b>${esc(n.title)}</b><span class="muted small">${timeAgo(new Date(n.created_at).getTime())}</span></a>`).join('') || '<p class="muted small">No posts yet.</p>'}
      ${admin ? `${composerHTML(true)}<a class="small" href="#/admin">${icon('shield')} Open admin console</a>` : ''}</div>`;
  };
  draw();
  wireComposer(host, draw);
}

export function adminView(root) {
  root.innerHTML = `<div class="page narrow-wide"><p class="muted">Checking access…</p></div>`;
  isAdmin().then(async (ok) => {
    if (!ok) { root.innerHTML = `<div class="page narrow"><h1>Admins only</h1><p class="muted">Sign in with an admin Google account to use the console.</p><a class="btn" href="#/dashboard">Back to dashboard</a></div>`; return; }
    const st = (await fetchStatus()) || { maintenance: false, message: '' };
    root.innerHTML = `<div class="page narrow-wide admin">
      <div class="page-head"><span class="eyebrow">${icon('shield')} Admin console</span><h1>Run StudyFox</h1><p class="muted">Signed in as ${esc(store.user().email)}. Every change here is checked by the server.</p></div>
      <section class="card admin-status ${st.maintenance ? 'down' : 'up'}">
        <div class="row between wrap gap"><div><h2 class="h3">${icon('power')} Site status</h2><p class="muted small" id="stLabel">${st.maintenance ? 'The site is shut down. Visitors see the message below. Admins can still use it.' : 'The site is live for everyone.'}</p></div>
          <button class="btn ${st.maintenance ? 'primary' : 'danger'}" id="toggle">${st.maintenance ? 'Bring the site back' : 'Shut the site down'}</button></div>
        <label class="small muted" for="msg">Message shown while shut down</label>
        <textarea id="msg" rows="2" maxlength="500" placeholder="We're making some updates and will be back soon.">${esc(st.message)}</textarea>
      </section>
      <a class="card hover row between gap" href="#/admin/content"><span><b>${icon('book')} Lessons, decks, and questions</b><br><span class="muted small">Edit courses and lessons, add or remove questions, and change flashcard decks. Updates the website and the app right away.</span></span>${icon('right')}</a>
      <h2 class="dash-title">News posts</h2>
      ${composerHTML(false)}
      <div id="feed"></div></div>`;
    const draw = async () => { $('#feed', root).innerHTML = (await fetchNews(100)).map((n) => postHTML(n, true)).join('') || '<p class="muted">No posts yet.</p>'; };
    draw(); wireComposer(root, draw);
    $('#toggle', root).addEventListener('click', async () => {
      const next = !st.maintenance;
      if (next && !(await confirmBox('Shut StudyFox down for everyone except admins?', { ok: 'Shut down', danger: true }))) return;
      const c = await db();
      const { error } = await c.from('site_status').update({ maintenance: next, message: $('#msg', root).value.trim(), updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) return toast(error.message, 'bad');
      toast(next ? 'Site is shut down.' : 'Site is live again.', 'good');
      adminView(root);
    });
  });
}

// Shown in place of every page while maintenance mode is on.
export const maintenanceHTML = (msg) => `<div class="page narrow maintenance"><div class="card center">
  <div class="f-icon">${icon('power')}</div><h1>StudyFox is taking a short break</h1>
  <p>${esc(msg || "We're making some updates and will be back soon. Your progress is saved.")}</p>
  <p class="muted small">Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></div></div>`;

export function contactView(root) {
  root.innerHTML = `<div class="page narrow-wide contact">
    <div class="page-head"><span class="eyebrow">${icon('mail')} Contact</span><h1>Get in touch</h1><p class="muted">Found a mistake, want a new course, or need help with your account? Send it over.</p></div>
    <div class="contact-grid">
      <div class="card contact-card"><div class="f-icon">${icon('mail')}</div><b>Email</b>
        <div class="email-copy"><code>${SUPPORT_EMAIL}</code><button class="btn sm" data-copy="${SUPPORT_EMAIL}">${icon('clipboard')} Copy</button><a class="btn sm ghost" href="mailto:${SUPPORT_EMAIL}">Open email</a></div>
        <span class="small">Usually answered within a few days.</span></div>
    </div>
    ${SUPPORT_FORM_URL && /\/viewform/.test(SUPPORT_FORM_URL) ? `<div class="card flush form-embed"><iframe src="${esc(SUPPORT_FORM_URL.replace(/\?.*$/, ''))}?embedded=true" title="Suggestions and support form" loading="lazy"></iframe></div>` : ''}
    <p class="muted small">For privacy requests you can also write to <span class="selectable">${CONTACT_EMAIL}</span>.</p>
  </div>`;
  root.querySelector('[data-copy]')?.addEventListener('click', async (e) => {
    const v = e.currentTarget.dataset.copy;
    try { await navigator.clipboard.writeText(v); toast('Email copied.', 'good'); } catch { toast(v); }
  });
}
