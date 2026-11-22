// Reviews: the dashboard links to Trustpilot (REVIEW_URL) for independent public reviews.
// The older in-house reviews table helpers below are kept for the admin console and past data.
// Saved to Supabase table reviews (supabase/avatar_items_and_reviews.sql), one per student, editable.
// Reviews are private until approved; a home page carousel will later show approved ones with the
// student's name and fox (or "A StudyFox student" when anonymous). No DOM beyond the card itself.
import { store } from './store.js';
import { toast } from './util.js';
import { icon } from './icons.js';
import { SUPPORT_FORM_URL, REVIEW_URL } from './config.js';
import { myAvatar } from './members.js';


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

const DISMISS = 'sf-review-banner-off';

/** Bottom-of-dashboard card that sends students to Trustpilot for an honest, public review. */
export const reviewCardHTML = () => `<div class="card stack review-card" id="reviewCard"><h2 class="h3">${icon('star')} Review StudyFox</h2>
  <p class="muted small">Tell other students what you honestly think. Reviews are on Trustpilot, an independent site, so StudyFox can't edit or remove them.</p>
  <div class="row"><a class="btn primary" href="${REVIEW_URL}" target="_blank" rel="noopener">Write a review on Trustpilot ${icon('arrow')}</a></div>
  <p class="small review-bug">${icon('mail')} Found a bug or have an idea? <a href="${SUPPORT_FORM_URL}" target="_blank" rel="noopener">Send it with the suggestion and bug form</a>.</p></div>`;

/** Slim banner near the top of the dashboard. Hidden for good once dismissed or clicked. */
export const reviewBannerHTML = () => (localStorage.getItem(DISMISS) ? '' : `<div class="banner accent row between wrap gap" id="reviewBanner"><span>${icon('star')} Enjoying StudyFox? Leave an honest review on Trustpilot.</span><span class="row gap"><a class="btn primary sm" id="revGo" href="${REVIEW_URL}" target="_blank" rel="noopener">Write a review</a><button class="btn sm ghost" id="revHide" aria-label="Hide this">Not now</button></span></div>`);

export function wireReview(root) {
  const b = root.querySelector('#reviewBanner');
  if (!b) return;
  const off = () => { localStorage.setItem(DISMISS, '1'); b.remove(); };
  b.querySelector('#revGo').addEventListener('click', off);
  b.querySelector('#revHide').addEventListener('click', off);
}
