// Donate page: points to Ko-fi.
import { icon } from '../icons.js';
import { CREATOR, KOFI } from '../config.js';

export function donateView(root) {
  root.innerHTML = `
  <div class="page narrow donate">
    <p class="kicker">Support StudyFox</p>
    <h1>Help keep StudyFox free</h1>
    <p class="lead">StudyFox has no ads, no paywall, and no premium tier. Every course, flashcard set, and practice test is free for every student.</p>
    <p>Running the site still costs money: hosting, the database that syncs your progress, and the time it takes to write new courses and questions. Donations help keep the project afloat so it can stay free for everyone.</p>
    <div class="card donate-card">
      <span class="donate-ic">${icon('heart')}</span>
      <div><b>Buy StudyFox a coffee on Ko-fi</b><p class="muted small">Any amount helps. You don't need an account to give.</p></div>
      <a class="btn primary lg" href="${KOFI}" target="_blank" rel="noopener">Donate on Ko-fi</a>
    </div>
    <p class="muted small">Can't donate? Sharing StudyFox with a classmate helps just as much. Thank you, from ${CREATOR}.</p>
    <p class="muted small">Representing a company? <a href="#/sponsor">See sponsorship options</a>.</p>
  </div>`;
}
