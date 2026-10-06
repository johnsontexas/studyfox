// About StudyFox and the person who made it. Bio from johnsontexas.com.
import { icon } from '../icons.js';
import { BETTERU_URL, CREATOR, CREATOR_SITE, INSTAGRAM, STUDYFOX_INSTAGRAM } from '../config.js';

export function aboutView(root) {
  root.innerHTML = `<div class="page narrow-wide about">
    <div class="page-head"><span class="eyebrow">${icon('heart')} About</span><h1>Why StudyFox exists</h1>
      <p class="muted">Good study material shouldn't cost money. StudyFox gives every high school student free courses for every AP class, AP practice questions, SAT and ACT prep, and flashcards, with no ads and no paywalls.</p></div>

    <section class="card about-me">
      <img src="${CREATOR_SITE}/images/Media/portrait.png" alt="Portrait of ${CREATOR}" loading="lazy">
      <div>
        <h2 class="h3">About me</h2>
        <p>Hi, I'm ${CREATOR}, a student at Strake Jesuit College Prep in Houston, Texas, class of 2027. I'm interested in neuroscience and brain imaging. I did neuroethics research at Georgetown and now build computational models based on fruit fly neural circuits. I'm also vice captain of my cross country team.</p>
        <p>I built StudyFox because I wanted one place where any student could learn a class, practice it, and get ready for the test, without paying for it.</p>
        <div class="row gap wrap">
          <a class="btn sm" href="${CREATOR_SITE}" target="_blank" rel="noopener">${icon('globe')} johnsontexas.com</a>
          <a class="btn sm ghost" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')} @${INSTAGRAM}</a>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="h3">Built with help from BetterU LLC</h2>
      <p>StudyFox was made with help from <a href="${BETTERU_URL}" target="_blank" rel="noopener">BetterU LLC</a>, a small software company I co-founded that builds apps for getting better together with your friends.</p>
    </section>

    <section class="card row between wrap gap">
      <div><h2 class="h3">Follow StudyFox</h2><p class="muted">New courses, features, and study tips.</p></div>
      <a class="btn primary" href="https://instagram.com/${STUDYFOX_INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')} @${STUDYFOX_INSTAGRAM}</a>
    </section>
  </div>`;
}
