// Pop-up announcements on the website: news posts with "pop up" on (admin console). Each shows once per
// person; which ones you've seen is kept in settings.seenPopups, synced with the app.
import { cloudEnabled, db } from './cloud.js';
import { store } from './store.js';
import { modal } from './tools.js';
import { esc } from './util.js';

const LINK = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|#\/[^\s)]*)\)|(https?:\/\/[^\s<]+)/g;
const a = (href, text) => `<a href="${href}"${href.startsWith('#') ? '' : ' target="_blank" rel="noopener nofollow"'}>${text}</a>`;
const body = (t) => esc(t).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>').replace(LINK, (m, text, href, bare) => (bare ? a(bare, bare) : a(href, text)))}</p>`).join('');
let showing = false;

export async function checkAnnouncements() {
  if (!cloudEnabled || showing || !store.user() || !store.data().settings.onboarded) return;
  const p = (location.hash.slice(1) || '/').split('?')[0];
  if (['/welcome', '/login', '/signup', '/privacy', '/terms'].includes(p) || document.querySelector('.agree-gate, .modal-wrap')) return;
  const c = await db();
  const { data, error } = await c.from('news').select('*').eq('popup', true).order('created_at', { ascending: false }).limit(5);
  if (error || !data?.length) return;
  const seen = new Set(store.data().settings.seenPopups || []);
  const n = data.find((x) => !seen.has(x.id) && (!x.popup_until || new Date(x.popup_until) > new Date()));
  if (!n) return;
  showing = true;
  const done = () => {
    const s = store.data().settings;
    s.seenPopups = [n.id, ...(s.seenPopups || []).filter((x) => x !== n.id)].slice(0, 60);
    store.save(); showing = false;
  };
  const href = n.cta_url ? (n.cta_url.startsWith('/') ? `#${n.cta_url}` : n.cta_url) : '';
  const m = modal(`<div class="announce stack">
      ${n.image_url ? `<img class="news-img" src="${esc(n.image_url)}" alt="">` : ''}
      <h2 class="h3">${esc(n.title)}</h2><div class="news-body">${body(n.body)}</div>
      <div class="row gap wrap">${href ? `<a class="btn primary" data-close href="${esc(href)}"${href.startsWith('#') ? '' : ' target="_blank" rel="noopener"'}>${esc(n.cta_label || 'Open')}</a>` : ''}<button class="btn${href ? '' : ' primary'}" data-close>Got it</button></div>
    </div>`, { title: 'Announcement', onClose: done });
  return m;
}
