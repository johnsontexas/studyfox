// Contributors page: the people behind StudyFox (Supabase table contributors, edited in
// Admin > Content > People and pages) and the students whose referral links brought the most friends.
import { icon } from '../icons.js';
import { $, esc } from '../util.js';
import { db, cloudEnabled } from '../cloud.js';
import { store } from '../store.js';
import { bySection } from '../content/people.js';
import { onContent } from '../content/live.js';
import { topSharers, myNumber, referralUrl, withRanks, loadMember, myAvatar } from '../members.js';
import { foxSVG, cleanAvatar } from '../avatar.js';

const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const personCard = (p) => `<div class="card person">
  ${p.image_url ? `<img src="${esc(p.image_url)}" alt="" loading="lazy">` : `<span class="person-init" aria-hidden="true">${esc(initials(p.name))}</span>`}
  <div><b>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</b>${p.role ? `<span class="muted small person-role">${esc(p.role)}</span>` : ''}
  ${p.blurb ? `<p class="muted small">${esc(p.blurb)}</p>` : ''}</div></div>`;

export const teamHTML = () => bySection().map((s) => `<section class="stack"><h2 class="h3">${esc(s.label)}</h2><div class="people-grid">${s.people.map(personCard).join('')}</div></section>`).join('');

export function contributorsView(root) {
  const draw = () => {
    const no = myNumber();
    root.innerHTML = `<div class="page narrow-wide stack contributors">
      <div class="page-head"><span class="eyebrow">${icon('users')} Contributors</span><h1>The people behind StudyFox</h1>
        <p class="muted">StudyFox is free for every student. These are the people who build it and help keep it running.</p></div>
      ${teamHTML()}
      <section class="stack">
        <h2 class="h3">Supported by</h2>
        <p class="muted small">StudyFox is hosted on Netlify.</p>
        <div class="card sponsor-logos"><a href="https://www.netlify.com" target="_blank" rel="noopener"><img class="netlify-logo" src="/assets/other/netlify-logo.png" alt="Netlify" width="151" height="40"></a></div>
      </section>
      <section class="stack">
        <h2 class="h3">Top sharers</h2>
        <p class="muted small">Students whose StudyFox link brought the most friends. Every account has a user number, and your link is in Settings. Shown by first name only; you can leave the list anytime in Settings.</p>
        <div id="sharers" class="card"><p class="muted small">Loading...</p></div>
        ${no ? `<p class="small muted">You're user #${no}. Your link: <a href="${esc(referralUrl(no))}">${esc(referralUrl(no).replace(/^https:\/\//, ''))}</a></p>` : ''}
      </section>
    </div>`;
    fillSharers($('#sharers', root), 25);
  };
  draw();
  return onContent(draw);
}

const row = (r, me) => `<li class="${r.no === me ? 'me' : ''}"><span class="lnum">${r.rank}</span>${foxSVG(r.no === me ? myAvatar() : cleanAvatar(r.avatar, 'no' + r.no), { size: 34 })}<span class="grow"><b>${esc(r.no === me || !store.data().settings.hideNames ? r.name : `Player #${r.no}`)}</b> <span class="muted small">user #${r.no}</span></span><span>${r.referrals} ${r.referrals === 1 ? 'friend' : 'friends'}</span></li>`;

// Top sharers with shared places for ties (5, 5, 1 friends -> 1, 1, 3), ordered by user number within a tie.
// limit: show the first N plus an expand link, and the signed-in student's own row under it if they're further down.
export async function fillSharers(el, limit, { compact = false } = {}) {
  const client = cloudEnabled ? db() : null;
  const [all, m] = await Promise.all([topSharers(client), loadMember(client).catch(() => null)]);
  if (!el?.isConnected) return;
  const ranked = withRanks(all);
  const me = m?.no || myNumber();
  if (!ranked.length) { el.innerHTML = `<p class="muted small">No one yet. ${store.user() ? 'Share your link with a friend who could use free study help.' : ''}</p>`; return; }
  const shown = limit ? ranked.slice(0, limit) : ranked;
  let mine = '';
  if (limit && !compact && me && !shown.some((r) => r.no === me)) {
    const listed = ranked.find((r) => r.no === me);
    const n = listed ? listed.referrals : (m?.referrals || 0);
    const rank = listed ? listed.rank : 1 + ranked.filter((r) => r.referrals > n).length;
    mine = `<li class="sharers-gap" aria-hidden="true">...</li>${row({ no: me, name: m?.display_name || 'You', referrals: n, rank }, me)}`;
  }
  el.innerHTML = `<ol class="sharers">${shown.map((r) => row(r, me)).join('')}${mine}</ol>`
    + (limit && !compact && ranked.length > limit ? `<div class="sharers-more"><a class="btn ghost" href="#/contributors/sharers">Show all ${ranked.length} sharers ${icon('arrow')}</a></div>` : '');
}

export function sharersView(root) {
  root.innerHTML = `<div class="page narrow-wide stack contributors">
    <div class="page-head"><a class="muted small" href="#/contributors">Back to Contributors</a><h1>Top sharers</h1>
      <p class="muted">Every student whose StudyFox link brought a friend. Students with the same number of friends share a place.</p></div>
    <div id="sharers" class="card"><p class="muted small">Loading...</p></div>
  </div>`;
  fillSharers($('#sharers', root), 0);
}
