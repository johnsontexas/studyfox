// Contributors page: the people behind StudyFox (Supabase table contributors, edited in
// Admin > Content > People and pages) and the students whose referral links brought the most friends.
import { icon } from '../icons.js';
import { $, esc } from '../util.js';
import { db, cloudEnabled } from '../cloud.js';
import { store } from '../store.js';
import { bySection } from '../content/people.js';
import { onContent } from '../content/live.js';
import { topSharers, myNumber, referralUrl } from '../members.js';

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
        <h2 class="h3">Top sharers</h2>
        <p class="muted small">Students whose StudyFox link brought the most friends. Every account has a user number, and your link is in Settings. Shown by first name only; you can leave the list anytime in Settings.</p>
        <div id="sharers" class="card"><p class="muted small">Loading...</p></div>
        ${no ? `<p class="small muted">You're user #${no}. Your link: <a href="${esc(referralUrl(no))}">${esc(referralUrl(no).replace(/^https:\/\//, ''))}</a></p>` : ''}
      </section>
    </div>`;
    topSharers(cloudEnabled ? db() : null, 20).then((list) => {
      const el = $('#sharers', root);
      if (!el) return;
      el.innerHTML = list.length
        ? `<ol class="sharers">${list.map((r, i) => `<li class="${r.no === myNumber() ? 'me' : ''}"><span class="lnum">${i + 1}</span><span class="grow"><b>${esc(r.name)}</b> <span class="muted small">user #${r.no}</span></span><span>${r.referrals} ${r.referrals === 1 ? 'friend' : 'friends'}</span></li>`).join('')}</ol>`
        : `<p class="muted small">No one yet. ${store.user() ? 'Share your link with a friend who could use free study help.' : ''}</p>`;
    });
  };
  draw();
  return onContent(draw);
}
