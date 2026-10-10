// About StudyFox: why it's free, the philosophy behind it, and the person who made it. Bio from johnsontexas.com.
import { icon } from '../icons.js';
import { BETTERU_URL, CREATOR, CREATOR_SITE, CREATOR_EMAIL, INSTAGRAM, STUDYFOX_INSTAGRAM, STUDYFOX_TIKTOK, SUPPORT_EMAIL } from '../config.js';

export function aboutView(root) {
  root.innerHTML = `<div class="page narrow-wide about stack">
    <div class="page-head"><span class="eyebrow">${icon('heart')} About</span><h1>Free, because everyone deserves the resources to learn</h1>
      <p class="muted">StudyFox gives every high school student free courses for every AP class, AP practice questions, SAT and ACT prep, and flashcards. No ads, no paywalls, no premium tier, and no limits.</p></div>

    <section class="card stack">
      <h2 class="h3">Why it's completely free</h2>
      <p class="about-quote">Where you go to school, or how much your family can spend on tutoring, shouldn't decide how well you can prepare.</p>
      <p>Test prep and tutoring can cost hundreds or thousands of dollars, and a lot of students simply go without. StudyFox exists so they don't have to. Every course, practice question, practice test, and flashcard is free for every student, and it's going to stay that way.</p>
      <p>StudyFox doesn't sell your data or show ads. It's kept running by the people who built it, and by anyone who chooses to <a href="#/donate">chip in</a>.</p>
    </section>

    <section class="stack">
      <h2 class="h3">Our philosophy</h2>
      <div class="about-values">
        <div class="card"><h3>${icon('users')}Rooted in helping others</h3><p>StudyFox started from a simple idea: if you can make something that helps people, you should give it away. Serving others is the reason it exists.</p></div>
        <div class="card"><h3>${icon('globe')}Resources for everyone</h3><p>Every student should have what they need to succeed, in any class, at any school. That's why it covers every AP subject and works in 25+ languages.</p></div>
        <div class="card"><h3>${icon('shield')}No catch</h3><p>No ads, no paywalls, no selling your data. You make an account so your progress can follow you, and that's it.</p></div>
      </div>
    </section>

    <section class="card about-me">
      <img src="${CREATOR_SITE}/images/Media/portrait.png" alt="Portrait of ${CREATOR}" loading="lazy">
      <div class="stack">
        <h2 class="h3">About me</h2>
        <p>I'm ${CREATOR}, the creator of StudyFox.</p>
        <ul class="about-facts">
          <li><b>School:</b> Strake Jesuit College Prep, Houston, Texas, class of 2027</li>
          <li><b>Faith:</b> Catholic, and the reason StudyFox is free</li>
          <li><b>Running:</b> I run cross country and track</li>
          <li><b>Fitness:</b> I run a lot, lift, and play sports for recreation</li>
          <li><b>Apps:</b> Co-founder of <a href="${BETTERU_URL}" target="_blank" rel="noopener">Better U LLC</a>, which ships apps to the App Store, and president of the SJ App Club</li>
          <li><b>Technology:</b> I like tinkering with anything I can take apart or build, from websites to games</li>
          <li><b>Languages:</b> English and Spanish, learning Mandarin and German</li>
          <li><b>Leadership:</b> House Captain of Faber House, and a member of House Council (our student council)</li>
          <li><b>Service:</b> National Honor Society, and a mission trip to Guatemala with Orphan Outreach</li>
        </ul>
        <div class="row gap wrap">
          <a class="btn sm" href="mailto:${CREATOR_EMAIL}">${icon('mail')} ${CREATOR_EMAIL}</a>
          <a class="btn sm ghost" href="${CREATOR_SITE}" target="_blank" rel="noopener">${icon('globe')} johnsontexas.com</a>
          <a class="btn sm ghost" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')} @${INSTAGRAM}</a>
        </div>
      </div>
    </section>

    <section class="card stack">
      <h2 class="h3">Get in touch</h2>
      <p>To reach me, ${CREATOR}, email <a href="mailto:${CREATOR_EMAIL}">${CREATOR_EMAIL}</a>. For help with your account or to report a problem with the site, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> or use the <a href="#/contact">contact page</a>.</p>
    </section>

    <section class="card row between wrap gap">
      <div><h2 class="h3">Follow StudyFox</h2><p class="muted">New courses, features, and study tips.</p></div>
      <div class="row gap wrap">
        <a class="btn primary" href="https://www.tiktok.com/@${STUDYFOX_TIKTOK}" target="_blank" rel="noopener">${icon('tiktok')} @${STUDYFOX_TIKTOK}</a>
        <a class="btn" href="https://instagram.com/${STUDYFOX_INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')} @${STUDYFOX_INSTAGRAM}</a>
      </div>
    </section>
  </div>`;
}
