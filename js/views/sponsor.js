// Sponsor page and media kit. Every number is live from public.sponsor_stats() (aggregates only),
// so the page never goes stale while StudyFox grows. "Save as PDF" prints it as a one-page media kit.
import { icon } from '../icons.js';
import { esc } from '../util.js';
import { db, cloudEnabled } from '../cloud.js';
import { SUPPORT_EMAIL, SITE_URL } from '../config.js';

const SOURCE_LABEL = { ai: 'AI assistants (ChatGPT, etc.)', short_form: 'TikTok, Reels, Shorts', long_form: 'YouTube', friend: 'Friends', search: 'Google search', teacher: 'Teachers', app_store: 'App Store' };
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const mail = (subject) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

const TIERS = [
  { name: 'Friend', price: '$15 / month', perks: ['Your logo and name on this page, linked to your site', 'A thank-you post on StudyFox socials'] },
  { name: 'Supporter', price: '$40 / month', perks: ['Logo and link on the page for a course you pick, like AP Calculus or SAT Math', 'Mentioned in our monthly social posts', 'Everything in Friend'], star: true },
  { name: 'Partner', price: '$100 / month', perks: ['Logo and link at the top of this page and in the site footer', 'Credited in StudyFox videos and social posts', 'Logo and link on up to three course pages', 'Everything in Supporter'] },
  { name: 'Make an offer', price: 'Your idea', offer: true, perks: ['A one-time gift, free credits for a tool we use, or a custom package', 'Tell us what you have in mind and we will work something out'] },
];

// "What it looks like" mockups: how a sponsor credit appears on each surface. Plain HTML so it matches the live theme.
const LOGO = `<span class="sp-mlogo"><span class="sp-mdot"></span>Your Brand</span>`;
const MOCKS = [
  { title: 'Course page', tier: 'Supporter and Partner', html: `
    <div class="sp-mbar"><b>AP Calculus AB</b><span>Unit 3 · Derivatives</span></div>
    <div class="sp-mlines"><i></i><i></i><i class="short"></i></div>
    <div class="sp-mcredit">Supported by ${LOGO}</div>` },
  { title: 'Top of this page', tier: 'Partner', html: `
    <div class="sp-mhero"><span>Thank you to our partner</span>${LOGO}</div>
    <div class="sp-mlines"><i></i><i class="short"></i></div>` },
  { title: 'Site footer', tier: 'Partner', html: `
    <div class="sp-mlines"><i class="short"></i></div>
    <div class="sp-mfoot"><b>StudyFox</b><span>Supported by ${LOGO}</span></div>` },
  { title: 'Sponsor wall', tier: 'Every sponsor', html: `
    <div class="sp-mwall">${LOGO}${LOGO}${LOGO}</div>` },
];

/** Bar chart of weekly sign-ups (last 12 weeks) as inline SVG. */
function weeklyChart(weeks) {
  if (!weeks?.length) return '';
  const W = 560, H = 160, pad = 22, max = Math.max(...weeks.map((w) => w.n), 1), bw = (W - pad) / weeks.length;
  const bars = weeks.map((w, i) => {
    const h = Math.max(2, (w.n / max) * (H - 36)), x = pad + i * bw + 3, y = H - 18 - h;
    const d = new Date(w.wk + 'T00:00:00');
    return `<rect x="${x}" y="${y}" width="${bw - 6}" height="${h}" rx="3" class="sp-bar"><title>Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${fmt(w.n)} new students</title></rect>`
      + `<text x="${x + (bw - 6) / 2}" y="${H - 4}" class="sp-ax" text-anchor="middle">${d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</text>`;
  }).join('');
  return `<svg class="sp-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="New students per week, last 12 weeks">${bars}</svg>`;
}

function statsHTML(s) {
  const total = (s.sources || []).reduce((a, x) => a + x.n, 0) || 1;
  const since = s.since ? new Date(s.since + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  return `
    <div class="sp-tiles">
      <div class="card sp-tile"><b>${fmt(s.students)}</b><span>students${since ? ` since ${since}` : ''}</span></div>
      <div class="card sp-tile"><b>${fmt(s.wau)}</b><span>active this week</span></div>
      <div class="card sp-tile"><b>${fmt(s.new_7d)}</b><span>joined in the last 7 days</span></div>
      <div class="card sp-tile"><b>${fmt(s.courses)}</b><span>free courses, ${fmt(s.ap_courses)} AP</span></div>
    </div>
    <div class="sp-two">
      <section class="card stack"><h2 class="h3">${icon('chart')} New students per week</h2>${weeklyChart(s.weekly)}</section>
      <section class="card stack"><h2 class="h3">${icon('megaphone')} How students find us</h2>
        <ul class="sp-sources">${(s.sources || []).map((x) => `<li><span>${esc(SOURCE_LABEL[x.source] || x.source)}</span><i style="--w:${Math.round((x.n / total) * 100)}%"></i><b>${Math.round((x.n / total) * 100)}%</b></li>`).join('')}</ul>
      </section>
    </div>
    <p class="muted small">Live numbers, updated ${new Date(s.updated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}. ${fmt(s.mau)} students were active in the last 30 days, with ${fmt(s.questions)} practice questions in the bank.</p>`;
}

export function sponsorView(root) {
  root.innerHTML = `
  <div class="page narrow-wide sponsor stack">
    <header class="stack">
      <p class="kicker">Sponsor StudyFox</p>
      <h1>Reach students who are actually studying</h1>
      <p class="lead">StudyFox is free study help for every AP class, the SAT, and the ACT. No ads, no paywall. Sponsors keep it that way, and get their name in front of high schoolers at the moment they're working toward college.</p>
      <div class="row gap wrap no-print">
        <a class="btn primary lg" href="${mail('Sponsoring StudyFox')}">${icon('mail')} Become a sponsor</a>
        <button class="btn lg" id="spPrint" type="button">${icon('upload')} Save media kit as PDF</button>
      </div>
    </header>
    <section class="card stack sp-costs">
      <h2 class="h3">${icon('coins')} Why sponsors matter right now</h2>
      <p>StudyFox is built by students, and right now I'm paying the bills out of my own pocket. Hosting, the database that saves every student's progress, and email currently cost about <b id="spCost">$50</b> a month, and that number goes up as more students join.</p>
      <p class="muted">Sponsors cover those costs so StudyFox can keep growing and stay free for every student.</p>
    </section>
    <div id="spStats"><p class="muted">${cloudEnabled ? 'Loading live numbers...' : 'Live numbers are unavailable offline.'}</p></div>
    <section class="stack">
      <h2 class="h3">Sponsorship options</h2>
      <div class="sp-tiers">${TIERS.map((t) => `
        <div class="card sp-tier${t.star ? ' sp-star' : ''}${t.offer ? ' sp-offer' : ''}"><h3>${esc(t.name)}</h3><p class="sp-price">${esc(t.price)}</p>
          <ul>${t.perks.map((p) => `<li>${icon('check')} ${esc(p)}</li>`).join('')}</ul>
          ${t.offer ? `<a class="btn sm no-print" href="${mail('An offer for StudyFox')}">${icon('mail')} Send an offer</a>` : ''}</div>`).join('')}
      </div>
    </section>
    <section class="stack">
      <h2 class="h3">What it looks like</h2>
      <p class="muted small">Your logo and name, linked to your site. Small, clearly labeled, and never inside the studying.</p>
      <div class="sp-mocks">${MOCKS.map((m) => `
        <figure class="card sp-mock"><div class="sp-mframe" aria-hidden="true">${m.html}</div>
          <figcaption><b>${esc(m.title)}</b><span>${esc(m.tier)}</span></figcaption></figure>`).join('')}
      </div>
    </section>
    <section class="card stack">
      <h2 class="h3">${icon('shield')} Our promises to students</h2>
      <ul class="sp-promise">
        <li>No ads. Sponsors get their logo and name with a link to their site, never ad copy, pop-ups, or anything inside lessons, flashcards, or questions.</li>
        <li>No tracking ad networks, and we never sell or share student data with sponsors.</li>
        <li>Every sponsor is reviewed. We only accept brands that are honest and right for high school students.</li>
        <li>StudyFox stays 100% free. Sponsors fund the site; they don't put anything behind a paywall.</li>
      </ul>
    </section>
    <section class="card row between wrap gap">
      <div><h2 class="h3">Let's talk</h2><p class="muted">${esc(SUPPORT_EMAIL)} · ${esc(SITE_URL.replace('https://', ''))}</p></div>
      <a class="btn primary no-print" href="${mail('Sponsoring StudyFox')}">${icon('mail')} Email us</a>
    </section>
  </div>`;
  root.querySelector('#spPrint').onclick = () => print();
  if (!cloudEnabled) return;
  // Monthly cost lives in content_settings ('monthly_cost'), editable in the admin console without a deploy.
  db().then((c) => c.from('content_settings').select('value').eq('key', 'monthly_cost').maybeSingle()).then(({ data }) => {
    const usd = Number(data?.value?.usd), el = root.querySelector('#spCost');
    if (el && usd > 0) el.textContent = '$' + fmt(usd);
  }).catch(() => {});
  db().then((c) => c.rpc('sponsor_stats')).then(({ data, error }) => {
    const box = root.querySelector('#spStats');
    if (!box) return;
    box.innerHTML = error || !data ? '<p class="muted">Live numbers could not load right now.</p>' : statsHTML(data);
  }).catch(() => {});
}
