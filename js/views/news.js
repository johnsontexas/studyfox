// News feed, admin console (posts + maintenance switch), and the contact page.
import { icon, sticker } from '../icons.js';
import { $, esc, toast, timeAgo } from '../util.js';
import { store } from '../store.js';
import { db, isAdmin, cloudEnabled } from '../cloud.js';
import { confirmBox } from '../tools.js';
import { CONTACT_EMAIL, SUPPORT_EMAIL, SUPPORT_FORM_URL } from '../config.js';
import { setting } from '../content/settings.js';
import { SOCIAL_PLATFORMS } from '../content/socials.js';
import { initContent, invalidateContent } from '../content/live.js';

// Post bodies are plain text: escaped, then blank lines become paragraphs. Links can be written as
// [link text](https://...) or pasted bare.
const LINK = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener nofollow">${text}</a>`;
const body = (t) => esc(t).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>').replace(LINK, (m, text, href, bare) => bare ? a(bare, bare) : a(href, text))}</p>`).join('');
const date = (s) => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export async function fetchNews(limit = 50) {
  if (!cloudEnabled) return [];
  const c = await db();
  // select('*') so the feed works before and after supabase/announcements.sql adds the pop-up and push columns.
  const { data, error } = await c.from('news').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchStatus() {
  if (!cloudEnabled) return null;
  const c = await db();
  const { data } = await c.from('site_status').select('maintenance,message,ios_app_url,email_signup').eq('id', 1).maybeSingle();
  return data;
}

// Posts without a photo get a colored cover so the feed never looks bare.
const COVERS = [['#1f6b47', '#5fcf94', 'news'], ['#9a6200', '#f2b33d', 'star'], ['#21507a', '#5fa8e0', 'book'], ['#7a2f5a', '#e07ab0', 'heart'], ['#3d3a8a', '#8b86e8', 'trophy']];
const cover = (n) => { const [c1, c2, ic] = COVERS[Number(n.id) % COVERS.length]; return `<div class="news-cover" style="--c1:${c1};--c2:${c2}" aria-hidden="true">${icon(ic)}</div>`; };
const postHTML = (n, admin) => `<article class="news-post card${n.pinned ? ' pinned' : ''}">
  ${n.image_url ? `<img class="news-img" src="${esc(n.image_url)}" alt="" loading="lazy">` : cover(n)}
  <div class="news-meta">${n.pinned ? `<span class="tag">Pinned</span>` : ''}${admin && n.popup ? `<span class="tag">${icon('megaphone')} Pop-up${n.popup_until ? ` until ${date(n.popup_until)}` : ''}</span>` : ''}${admin && n.notified_at ? `<span class="tag subtle">${icon('bell')} Pushed ${date(n.notified_at)}</span>` : ''}<time class="muted small" datetime="${esc(n.created_at)}">${date(n.created_at)}</time>
    ${admin ? `<span class="grow"></span><button class="btn sm ghost" data-pin="${n.id}" data-on="${n.pinned ? 1 : 0}">${n.pinned ? 'Unpin' : 'Pin'}</button><button class="btn sm ghost" data-popup="${n.id}" data-on="${n.popup ? 1 : 0}">${n.popup ? 'Stop pop-up' : 'Pop up'}</button><button class="btn sm ghost" data-push="${n.id}">${icon('bell')} ${n.notified_at ? 'Push again' : 'Send push'}</button><button class="btn sm ghost danger-text" data-del="${n.id}">${icon('trash')} Delete</button>` : ''}</div>
  <h2 class="h3">${esc(n.title)}</h2><div class="news-body">${body(n.body)}</div>${ctaHTML(n)}</article>`;

// Optional button under an announcement. Site routes (#/learn/...) stay on the site; https links open a new tab.
const ctaHref = (u) => (u.startsWith('/') ? `#${u}` : u);
const ctaHTML = (n) => (n.cta_url ? `<p><a class="btn sm primary" href="${esc(ctaHref(n.cta_url))}"${/^https:/.test(n.cta_url) ? ' target="_blank" rel="noopener"' : ''}>${esc(n.cta_label || 'Open')}</a></p>` : '');

// Form for writing a post; used on the news page and admin console.
const composerHTML = (compact) => `<form class="card news-compose${compact ? ' compact' : ''}" data-compose>
  <div class="row between"><b>${icon('edit')} New post</b><span class="tag subtle">${icon('shield')} Admin</span></div>
  <input name="title" maxlength="160" placeholder="Title" required>
  <textarea name="body" rows="${compact ? 3 : 6}" maxlength="8000" placeholder="What's new? Blank lines start a new paragraph. Links: [link text](https://...)" required></textarea>
  <div class="img-row"><button type="button" class="btn sm ghost" data-addlink>${icon('link')} Add link</button><label class="btn sm ghost">${icon('upload')} Add image<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label><span class="muted small" data-imgname>Optional. PNG, JPG, WebP, or GIF up to 5 MB.</span></div>
  <details class="small"${compact ? '' : ' open'}><summary><b>${icon('megaphone')} Announcement options</b> <span class="muted">pop-up, push notification, button</span></summary>
    <div class="stack" style="margin-top:8px">
      <label class="row gap"><input type="checkbox" name="popup"> Pop up on people's screens when they open StudyFox (website and app). Each person sees it once.</label>
      <label>Stop popping up after <span class="muted">(optional)</span><input type="date" name="popup_until"></label>
      <label class="row gap"><input type="checkbox" name="notify"> Send a push notification to everyone with the iPhone app <span class="muted" data-devices></span></label>
      <div class="row gap wrap"><label class="grow">Button text <span class="muted">(optional)</span><input name="cta_label" maxlength="40" placeholder="Try it"></label>
        <label class="grow">Button link<input name="cta_url" maxlength="400" placeholder="#/learn/ap-biology or https://..."></label></div>
    </div>
  </details>
  <div class="row between wrap gap"><label class="row gap small"><input type="checkbox" name="pinned"> Pin to top</label><button class="btn primary sm">Post</button></div>
</form>`;

async function wireComposer(root, onDone) {
  // How many phones a push would reach (admins only; blank until announcements.sql is run).
  db().then((c) => c.rpc('push_device_count')).then(({ data }) => {
    if (typeof data === 'number') root.querySelectorAll('[data-devices]').forEach((el) => { el.textContent = `(${data} ${data === 1 ? 'device' : 'devices'})`; });
  }).catch(() => {});
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-addlink]'); if (!b) return;
    const ta = b.closest('[data-compose]').body;
    let url = prompt('Link address (https://...)'); if (!url) return;
    url = url.trim(); if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    const text = sel || prompt('Text to show for the link', '') || url;
    const md = `[${text.replace(/[\[\]]/g, '')}](${url.replace(/[\s)]/g, '')})`;
    ta.setRangeText(md, ta.selectionStart, ta.selectionEnd, 'end'); ta.focus();
  });
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
    const row = { title: f.title.value.trim(), body: f.body.value.trim(), pinned: f.pinned.checked, image_url };
    // Announcement options are only sent when used, so plain posts still work before announcements.sql is run.
    if (f.popup.checked) { row.popup = true; if (f.popup_until.value) row.popup_until = new Date(f.popup_until.value + 'T23:59:59').toISOString(); }
    if (f.cta_url.value.trim()) {
      let u = f.cta_url.value.trim();
      if (u.startsWith('#/')) u = u.slice(1); else if (!/^(https:\/\/|\/)/.test(u)) u = `https://${u.replace(/^http:\/\//, '')}`;
      row.cta_url = u; row.cta_label = f.cta_label.value.trim();
    }
    if (f.notify.checked) {
      if (!(await confirmBox('Send this as a push notification to everyone with the StudyFox app? This can\'t be taken back.', { ok: 'Post and send' }))) { btn.disabled = false; return; }
      row.notify = true;
    }
    const { error } = await c.from('news').insert(row);
    btn.disabled = false;
    if (error) return toast(error.message, 'bad');
    f.reset(); f.querySelector('.img-prev')?.remove(); toast('Posted.', 'good'); onDone?.();
  });
  root.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]'), pin = e.target.closest('[data-pin]'), pop = e.target.closest('[data-popup]'), push = e.target.closest('[data-push]');
    if (!del && !pin && !pop && !push) return;
    const c = await db();
    if (pop) {
      const { error } = await c.from('news').update({ popup: pop.dataset.on !== '1' }).eq('id', pop.dataset.popup);
      if (error) return toast(error.message, 'bad');
    } else if (push) {
      if (!(await confirmBox('Send this post as a push notification to everyone with the StudyFox app?', { ok: 'Send' }))) return;
      // notified_at = null with notify on makes the database send it (see supabase/announcements.sql).
      const { error } = await c.from('news').update({ notify: true, notified_at: null }).eq('id', push.dataset.push);
      if (error) return toast(error.message, 'bad');
      toast('Push notification sent.', 'good');
    } else if (del) {
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
      $('#feed', root).innerHTML = list.length ? list.map((n) => postHTML(n, admin)).join('') : `<div class="card empty-note center"><div class="big-emoji">${sticker('mailbox')}</div><p class="muted">No news yet. Check back soon.</p></div>`;
    } catch { $('#feed', root).innerHTML = `<p class="muted">News couldn't load. Try again in a minute.</p>`; }
  };
  isAdmin().then((a) => { admin = a; if (a) $('#compose', root).innerHTML = composerHTML(false); draw(); });
  wireComposer(root, draw);
}

// Small "Latest news" block for the dashboard and home page. Posting lives on the news page only.
export function newsWidget(host) {
  if (!host || !cloudEnabled) return;
  const draw = async () => {
    const list = await fetchNews(3).catch(() => []);
    if (!list.length) { host.innerHTML = ''; return; }
    host.innerHTML = `<div class="news-widget">
      <div class="row between"><h2 class="h3">${icon('news')} Latest news</h2><a class="small" href="#/news">All news ${icon('right')}</a></div>
      ${list.map((n) => `<a class="news-item" href="#/news">${n.image_url ? `<img class="news-thumb" src="${esc(n.image_url)}" alt="" loading="lazy">` : ''}<b>${esc(n.title)}</b><span class="muted small">${timeAgo(new Date(n.created_at).getTime())}</span></a>`).join('')}</div>`;
  };
  draw();
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
      <section class="card admin-status ${st.email_signup === false ? 'down' : 'up'}">
        <div class="row between wrap gap"><div><h2 class="h3">${icon('mail')} Email sign-up</h2><p class="muted small">${st.email_signup === false ? 'Off. New accounts can only use Google, Apple, or Microsoft, on the site and the app. Existing email accounts can still sign in.' : 'On. People can create accounts with an email and password.'}</p></div>
          <button class="btn ${st.email_signup === false ? 'primary' : 'danger'}" id="emailToggle">${st.email_signup === false ? 'Turn email sign-up on' : 'Turn email sign-up off'}</button></div>
      </section>
      <section class="card">
        <div class="row between wrap gap"><div><h2 class="h3">${icon('mail')} Email list</h2><p class="muted small" id="subLabel">Loading people who opted in to emails...</p></div>
          <button class="btn primary" id="copyEmails" disabled>Copy emails</button></div>
      </section>
      <a class="card hover row between gap" href="#/admin/content"><span><b>${icon('book')} Lessons, decks, and questions</b><br><span class="muted small">Edit courses and lessons, add or remove questions, and change flashcard decks. Updates the website and the app right away.</span></span>${icon('right')}</a>
      <section class="card stack" id="socials">
        <div><h2 class="h3">${icon('instagram')} Socials</h2><p class="muted small">StudyFox's accounts in the website footer, the About page, and the app's Me and About screens. Changes show up right away, with no app update.</p></div>
        <div class="stack" id="socialRows"></div>
        <div class="row gap wrap"><button class="btn ghost sm" id="socialAdd">${icon('edit')} Add account</button><button class="btn primary sm" id="socialSave">Save socials</button></div>
      </section>
      <h2 class="dash-title">Announcements and news posts</h2>
      <p class="muted small">Every post shows on the News page. Turn on <b>pop up</b> to put it on people's screens the next time they open StudyFox, and <b>push notification</b> to send it to every phone with the app.</p>
      <h2 class="dash-title">Leaderboard reports</h2>
      <div id="reports"></div>
      <h2 class="dash-title">Post an announcement</h2>
      ${composerHTML(false)}
      <div id="feed"></div></div>`;
    const drawReports = async () => {
      const { data } = await (await db()).from('match_reports').select('id,reported_user,name,created_at').order('created_at', { ascending: false });
      $('#reports', root).innerHTML = (data || []).map((r) => `<div class="card row between wrap gap"><span><b>${esc(r.name)}</b><br><span class="muted small">${new Date(r.created_at).toLocaleString()}</span></span>
        <span class="row gap"><button class="btn danger" data-remove="${esc(r.reported_user)}">Remove their times</button><button class="btn ghost" data-dismiss="${r.id}">Dismiss</button></span></div>`).join('') || '<p class="muted">No open reports.</p>';
    };
    drawReports();
    $('#reports', root).addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-remove]'); const dis = e.target.closest('[data-dismiss]');
      if (!rm && !dis) return;
      const c = await db();
      const { error } = rm
        ? (await c.from('match_scores').delete().eq('user_id', rm.dataset.remove), await c.from('match_reports').delete().eq('reported_user', rm.dataset.remove))
        : await c.from('match_reports').delete().eq('id', dis.dataset.dismiss);
      if (error) toast(error.message, 'bad');
      drawReports();
    });
    // Socials editor (content_settings.socials).
    const socialRow = (l = { platform: 'instagram', handle: '', show: true }) => `<div class="row gap wrap" data-social>
      <select name="platform">${Object.entries(SOCIAL_PLATFORMS).map(([k, p]) => `<option value="${k}" ${l.platform === k ? 'selected' : ''}>${p.name}</option>`).join('')}</select>
      <input class="grow" name="handle" value="${esc(l.handle || l.url || '')}" placeholder="@handle, invite code, or link">
      <input name="label" value="${esc(l.label || '')}" placeholder="Label (optional)" style="max-width:180px">
      <label class="row gap small"><input type="checkbox" name="show" ${l.show !== false ? 'checked' : ''}> Show</label>
      <button class="btn sm ghost" data-up title="Move up">${icon('up')}</button><button class="btn sm ghost danger-text" data-rm title="Remove">${icon('trash')}</button></div>`;
    $('#socialRows', root).innerHTML = (setting('socials').links || []).map(socialRow).join('');
    $('#socialAdd', root).onclick = () => $('#socialRows', root).insertAdjacentHTML('beforeend', socialRow());
    $('#socialRows', root).onclick = (e) => {
      const r = e.target.closest('[data-social]'); if (!r) return;
      if (e.target.closest('[data-rm]')) r.remove();
      else if (e.target.closest('[data-up]') && r.previousElementSibling) r.parentNode.insertBefore(r, r.previousElementSibling);
    };
    $('#socialSave', root).onclick = async () => {
      const links = [...root.querySelectorAll('[data-social]')].map((r) => {
        const platform = r.querySelector('[name=platform]').value, v = r.querySelector('[name=handle]').value.trim();
        const isUrl = /^https?:\/\//i.test(v) && platform !== 'website';
        return { platform, ...(isUrl ? { url: v.replace(/^http:/i, 'https:') } : { handle: v.replace(/^@/, '') }), label: r.querySelector('[name=label]').value.trim() || undefined, show: r.querySelector('[name=show]').checked };
      }).filter((l) => l.handle || l.url);
      const { error } = await (await db()).from('content_settings').upsert({ key: 'socials', value: { links }, note: 'StudyFox social accounts. Edit in Admin console > Socials.' });
      if (error) return toast(error.message, 'bad');
      toast('Socials saved. They show on the site and in the app right away.', 'good');
      invalidateContent(); initContent(db());
    };
    const draw = async () => { $('#feed', root).innerHTML = (await fetchNews(100)).map((n) => postHTML(n, true)).join('') || '<p class="muted">No posts yet.</p>'; };
    draw(); wireComposer(root, draw);
    (async () => {
      const { data, error } = await (await db()).from('email_subscribers').select('email').order('opted_in_at', { ascending: true });
      if (error) { $('#subLabel', root).textContent = error.message; return; }
      const emails = [...new Set((data || []).map((r) => r.email))];
      $('#subLabel', root).textContent = `${emails.length} ${emails.length === 1 ? 'person has' : 'people have'} opted in. Copies as a comma-separated list. Put it in BCC so nobody sees the other addresses.`;
      const btn = $('#copyEmails', root); btn.disabled = !emails.length;
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(emails.join(', ')); toast(`Copied ${emails.length} emails.`, 'good'); }
        catch { toast('Could not copy. Try again.', 'bad'); }
      });
    })();
    $('#emailToggle', root).addEventListener('click', async () => {
      const next = st.email_signup === false;
      if (!next && !(await confirmBox('Turn off email sign-up on the website and the app? People can still sign up with Google, Apple, or Microsoft.', { ok: 'Turn off', danger: true }))) return;
      const c = await db();
      const { error } = await c.from('site_status').update({ email_signup: next, updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) return toast(error.message, 'bad');
      toast(next ? 'Email sign-up is on.' : 'Email sign-up is off.', 'good');
      adminView(root);
    });
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
