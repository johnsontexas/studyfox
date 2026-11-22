// About StudyFox: why it's free, the philosophy behind it, and the person who made it. Bio from johnsontexas.com.
// The page text is editable in Supabase (site_pages, slug 'about'; Admin > Content > People and pages).
// The built-in version below is used until that loads, or if the row is missing.
import { icon } from '../icons.js';
import { esc } from '../util.js';
import { PEOPLE } from '../content/people.js';
import { onContent } from '../content/live.js';
import { teamHTML } from './contributors.js';
import { socials } from '../content/socials.js';
import { BETTERU_URL, CREATOR, CREATOR_SITE, CREATOR_EMAIL, INSTAGRAM, SUPPORT_EMAIL } from '../config.js';

const withIcons = (html) => String(html || '').replace(/\{\{icon:([a-z-]+)\}\}/g, (_, n) => icon(n));

function followHTML() {
  return `<section class="card row between wrap gap">
      <div><h2 class="h3">Follow StudyFox</h2><p class="muted">New courses, features, and study tips.</p></div>
      <div class="row gap wrap">${socialButtons()}</div>
    </section>`;
}
const socialButtons = () => socials().map((l, i) => `<a class="btn${i ? '' : ' primary'}" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.icon)} ${esc(l.label)}</a>`).join('');

/** The About page from site_pages: a hero, then sections (card, plain, motto banner, or the team list). */
function livePage(root, p) {
  const sec = (x) => {
    const h = x.title ? `<h2 class="h3">${esc(x.title)}</h2>` : '';
    if (x.style === 'team') return `<section class="stack">${h}${teamHTML()}<p class="small"><a href="#/contributors">${icon('users')} All contributors and top sharers</a></p></section>`;
    if (x.style === 'motto') return `<section class="about-motto">${x.title ? `<span class="eyebrow">${esc(x.title)}</span>` : ''}${withIcons(x.html)}</section>`;
    if (x.image) return `<section class="card about-me"><img src="${esc(x.image)}" alt="${esc(x.image_alt || '')}" width="480" height="712" loading="lazy"><div class="stack">${h}${withIcons(x.html)}</div></section>`;
    return `<section class="${x.style === 'plain' ? '' : 'card '}stack">${h}${withIcons(x.html)}</section>`;
  };
  root.innerHTML = `<div class="page narrow-wide about stack">
    <header class="about-hero"><span class="eyebrow">${icon('heart')} About StudyFox</span><h1>${esc(p.title)}</h1>${p.intro ? `<p>${esc(p.intro)}</p>` : ''}
      <div class="about-stats"><span><b>49</b> classes</span><span><b>0</b> ads</span><span><b>$0</b> forever</span></div></header>
    ${(p.sections || []).map(sec).join('')}
    ${followHTML()}
  </div>`;
}

export function aboutView(root) {
  const draw = () => livePage(root, PEOPLE.pages.about?.sections?.length ? PEOPLE.pages.about : ABOUT);
  draw();
  return onContent(draw);
}

// Built-in copy, used until site_pages loads. Keep in step with the 'about' row.
const ABOUT = {
  title: 'Free, because everyone deserves the resources to learn',
  intro: 'StudyFox gives every high school student free courses for every AP class, AP practice questions, SAT and ACT prep, and flashcards. No ads, no paywalls, no premium tier, and no limits.',
  sections: [
    { style: 'motto', title: 'What we carry', html: `<p class="motto">Men for Others</p><p>The motto of my school, Strake Jesuit, comes from Fr. Pedro Arrupe, S.J., who challenged students to put their gifts to work for other people. StudyFox is my way of living it: build something useful, then give it to anyone who needs it.</p>` },
    { style: 'card', title: "Why it's completely free", html: `<p class="about-quote">Where you go to school, or how much your family can spend on tutoring, shouldn't decide how well you can prepare.</p><p>Test prep and tutoring can cost hundreds or thousands of dollars, and a lot of students simply go without. StudyFox exists so they don't have to. Every course, practice question, practice test, and flashcard is free for every student, and it's going to stay that way.</p><p>StudyFox doesn't sell your data or show ads. It's kept running by the people who built it, and by anyone who chooses to <a href="#/donate">chip in</a>.</p>` },
    { style: 'plain', title: 'Our values', html: `<div class="about-values">
<div class="card"><h3>{{icon:users}}For others</h3><p>If you can make something that helps people, you should give it away. Serving others is the reason StudyFox exists.</p></div>
<div class="card"><h3>{{icon:heart}}Care for the whole person</h3><p><i>Cura personalis.</i> You're a student, not a score. Learn at your own pace, with no streak guilt or pressure tactics.</p></div>
<div class="card"><h3>{{icon:target}}Always the more</h3><p><i>Magis.</i> Good isn't done. Courses and questions get better every week from what students tell us.</p></div>
<div class="card"><h3>{{icon:leaf}}Open to growth</h3><p>Mistakes are how you learn. Every practice question explains the answer, so a wrong one still moves you forward.</p></div>
<div class="card"><h3>{{icon:globe}}Resources for everyone</h3><p>Every AP subject, SAT and ACT, in 25+ languages, for students at any school.</p></div>
<div class="card"><h3>{{icon:shield}}No catch</h3><p>No ads, no paywalls, no selling your data. You make an account so your progress follows you, and that's it.</p></div>
</div>` },
    { style: 'card', title: 'About me', image: 'assets/creator.jpg', image_alt: `Portrait of ${CREATOR}`, html: `<p>I'm ${CREATOR}, the creator of StudyFox.</p><ul class="about-facts">
<li><b>School</b>Strake Jesuit College Prep, Houston, Texas, class of 2027</li>
<li><b>Faith</b>Catholic, and the reason StudyFox is free</li>
<li><b>Running</b>Cross country and track</li>
<li><b>Fitness</b>I run a lot, lift, and play sports for recreation</li>
<li><b>Apps</b>Co-founder of <a href="${BETTERU_URL}" target="_blank" rel="noopener">Better U LLC</a>, and president of the SJ App Club</li>
<li><b>Technology</b>Tinkering with anything I can take apart or build, from websites to games</li>
<li><b>Languages</b>English and Spanish, learning Mandarin and German</li>
<li><b>Leadership</b>House Captain of Faber House, and House Council (our student council)</li>
<li><b>Service</b>National Honor Society, and a mission trip to Guatemala with Orphan Outreach</li>
</ul><div class="row gap wrap"><a class="btn sm" href="mailto:${CREATOR_EMAIL}">{{icon:mail}} ${CREATOR_EMAIL}</a><a class="btn sm ghost" href="${CREATOR_SITE}" target="_blank" rel="noopener">{{icon:globe}} johnsontexas.com</a><a class="btn sm ghost" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">{{icon:instagram}} @${INSTAGRAM}</a></div>` },
    { style: 'team', title: 'The people behind StudyFox', html: '' },
    { style: 'card', title: 'Get in touch', html: `<p>To reach me, ${CREATOR}, email <a href="mailto:${CREATOR_EMAIL}">${CREATOR_EMAIL}</a>. For help with your account or to report a problem with the site, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> or use the <a href="#/contact">contact page</a>.</p>` },
  ],
};
