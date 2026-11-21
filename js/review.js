// "Rate StudyFox" card on the dashboard: stars out of 5, a few words, and whether to stay anonymous.
// Saved to Supabase table reviews (supabase/avatar_items_and_reviews.sql), one per student, editable.
// Reviews are private until approved; a home page carousel will later show approved ones with the
// student's name and fox (or "A StudyFox student" when anonymous). No DOM beyond the card itself.
import { store } from './store.js';
import { toast } from './util.js';
import { icon } from './icons.js';
import { SUPPORT_FORM_URL } from './config.js';
import { myAvatar } from './members.js';

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/></svg>';

/** Save (insert or update) the signed-in student's review. Resolves an error message or ''. */
export async function saveReview(client, { stars, body, anonymous }, platform = 'web') {
  const sb = await client, u = store.user();
  if (!sb || !u?.cloud) return 'Sign in with a synced account to leave a review.';
  const { error } = await sb.from('reviews').upsert({
    user_id: u.id, stars, body: String(body || '').trim().slice(0, 1000), anonymous: !!anonymous,
    name: anonymous ? '' : String(u.name || '').split(' ')[0].slice(0, 60), avatar: anonymous ? null : myAvatar(), platform,
  });
  return error ? error.message : '';
}

/** The student's saved review, or null. */
export async function loadReview(client) {
  const sb = await client, u = store.user();
  if (!sb || !u?.cloud) return null;
  const { data } = await sb.from('reviews').select('stars,body,anonymous,approved').eq('user_id', u.id).maybeSingle();
  return data || null;
}

export const reviewCardHTML = () => `<div class="card stack review-card" id="reviewCard"><h2 class="h3">${icon('star')} Rate StudyFox</h2>
  <p class="muted small">How is StudyFox helping you? Your review helps other students find it.</p>
  <div class="stars" role="radiogroup" aria-label="Stars out of 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}" data-star="${n}">${STAR}</button>`).join('')}</div>
  <textarea id="revBody" rows="3" maxlength="1000" placeholder="What do you like? What helped most?"></textarea>
  <label class="consent small"><input type="checkbox" id="revAnon"> <span>Stay anonymous. Your review shows as "A StudyFox student" with no name or fox.</span></label>
  <div class="row between wrap gap"><button class="btn primary" id="revSave">Submit review</button><span class="muted small" id="revStatus"></span></div>
  <p class="small review-bug">${icon('mail')} Found a bug or have an idea? <a href="${SUPPORT_FORM_URL}" target="_blank" rel="noopener">Send it with the suggestion and bug form</a>.</p></div>`;

export function wireReview(root, client) {
  const card = root.querySelector('#reviewCard');
  if (!card) return;
  let stars = 0;
  const paint = () => card.querySelectorAll('[data-star]').forEach((b) => { const on = +b.dataset.star <= stars; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(+b.dataset.star === stars)); });
  card.addEventListener('click', async (e) => {
    const s = e.target.closest('[data-star]');
    if (s) { stars = +s.dataset.star; return paint(); }
    if (!e.target.closest('#revSave')) return;
    if (!stars) return toast('Pick 1 to 5 stars first.');
    const err = await saveReview(client, { stars, body: card.querySelector('#revBody').value, anonymous: card.querySelector('#revAnon').checked });
    if (err) return toast(err);
    card.querySelector('#revStatus').textContent = 'Thanks! You can edit your review anytime.';
    card.querySelector('#revSave').textContent = 'Update review';
    toast('Review saved. Thank you!', 'good');
  });
  if (!store.user()?.cloud) {
    card.querySelector('#revSave').disabled = true;
    card.querySelector('#revStatus').innerHTML = '<a href="#/login">Sign in</a> with a synced account to leave a review.';
    return;
  }
  loadReview(client).then((r) => {
    if (!r || !card.isConnected) return;
    stars = r.stars; paint();
    card.querySelector('#revBody').value = r.body || '';
    card.querySelector('#revAnon').checked = !!r.anonymous;
    card.querySelector('#revSave').textContent = 'Update review';
    card.querySelector('#revStatus').textContent = 'Your review is saved.';
  });
}
