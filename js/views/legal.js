// Privacy Policy and Terms of Use.
import { CONTACT_EMAIL } from '../config.js';

const UPDATED = 'September 29, 2026';
const mail = `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;
const page = (title, body) => `<div class="page narrow legal"><h1>${title}</h1><p class="muted">Last updated ${UPDATED}</p>${body}</div>`;

export function privacyView(root) {
  root.innerHTML = page('Privacy Policy', `
  <p>StudyFox is a free study site for school and the SAT and ACT. We collect as little as we can, we never sell your data, and we don't show ads.</p>

  <h2>What we collect</h2>
  <ul>
    <li><b>If you use StudyFox without an account or with an email account:</b> your progress (answers, scores, mistake log, flashcards, and settings) is stored only in your browser's local storage on your device. It is not sent to us. Email-account passwords are stored on your device as a salted hash.</li>
    <li><b>If you sign in with Google or Apple:</b> we receive your name, email address, and an account ID from that provider. If you use Apple's "Hide My Email," we receive a relay address instead. We store your progress on our database provider so it syncs across your devices.</li>
    <li><b>Technical data:</b> our hosting and database providers may keep standard server logs (such as IP address, browser type, and time of request) for security and reliability.</li>
  </ul>

  <h2>What we don't collect</h2>
  <p>We don't use advertising, analytics trackers, or tracking cookies, and we don't build profiles about you. We don't ask for your school, grades, address, or phone number.</p>

  <h2>How we use your information</h2>
  <p>Only to run the site: to sign you in, save and sync your progress, and keep the service secure. We do not sell, rent, or share your personal information for marketing.</p>

  <h2>Service providers</h2>
  <p>We rely on a small number of providers to operate StudyFox: Supabase (authentication and database), Google and Apple (sign-in), our website host, and content delivery networks that serve fonts and code libraries (Google Fonts, jsDelivr). The built-in calculator is provided by Desmos and loads from their servers. Each provider handles data under its own privacy policy.</p>

  <h2>Students and children</h2>
  <p>StudyFox is intended for students and other learners aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, contact us and we will delete it. Users under 18 should use StudyFox with the permission of a parent or guardian.</p>

  <h2>Keeping and deleting your data</h2>
  <p>We keep synced progress until you delete it. You can delete it at any time in <a href="#/settings">Settings → Delete account data</a>, which removes it from our database and your device. You can also export a copy of your data in Settings. Local-only data can be erased with <b>Reset all progress</b> or by clearing your browser's site data.</p>

  <h2>Your rights</h2>
  <p>Depending on where you live (for example, under the GDPR or California law), you may have the right to access, correct, delete, or export your personal information. Most of this is self-service in Settings; for anything else, email ${mail}.</p>

  <h2>Security</h2>
  <p>Synced data is sent over HTTPS and protected by per-user access rules, so only you can read your progress. No system is perfectly secure, but we work to protect your information.</p>

  <h2>Changes</h2>
  <p>If we change this policy we'll update the date above. Significant changes will be noted on the site.</p>

  <h2>Contact</h2>
  <p>Questions? Email ${mail}.</p>`);
}

export function termsView(root) {
  root.innerHTML = page('Terms of Use', `
  <p>These terms are an agreement between you and StudyFox. By using the site or creating an account, you agree to them. If you don't agree, please don't use StudyFox.</p>

  <h2>1. Who can use StudyFox</h2>
  <p>You must be at least 13 years old. If you are under 18, you confirm that a parent or guardian has agreed to these terms for you.</p>

  <h2>2. Your account</h2>
  <p>You need an account to use StudyFox: a device-only email account, or by signing in with Google or Apple. Keep your sign-in secure; you're responsible for activity on your account. Email-account progress lives only on your device, so clearing your browser data will erase it.</p>

  <h2>3. Free service</h2>
  <p>StudyFox is free. We may add, change, or remove features at any time, and we may suspend or end the service.</p>

  <h2>4. Acceptable use</h2>
  <p>Don't misuse StudyFox. That includes trying to break or overload the site, accessing other people's data, scraping or reselling the content, or using the site for anything illegal. We may suspend accounts that do.</p>

  <h2>5. Content</h2>
  <p>The practice questions, explanations, and site design are owned by StudyFox and are provided for your personal, non-commercial study. Flashcard sets you create belong to you; by sharing a set link, you let anyone with the link view and copy it.</p>

  <h2>6. Not affiliated with the test makers</h2>
  <p>SAT® is a trademark of the College Board, and ACT® is a trademark of ACT, Inc. Neither is affiliated with or endorses StudyFox. Our questions are original practice material, and score estimates are approximations that may differ from your official scores.</p>

  <h2>7. No warranty</h2>
  <p>StudyFox is provided "as is" without warranties of any kind. We don't guarantee that the site will be error-free or always available, or that using it will improve your score.</p>

  <h2>8. Limitation of liability</h2>
  <p>To the fullest extent allowed by law, StudyFox is not liable for any indirect, incidental, or consequential damages, or for any loss of data, arising from your use of the site.</p>

  <h2>9. Ending your use</h2>
  <p>You can stop using StudyFox and delete your data at any time from <a href="#/settings">Settings</a>.</p>

  <h2>10. Changes</h2>
  <p>We may update these terms. Continuing to use StudyFox after an update means you accept the new terms.</p>

  <h2>11. Contact</h2>
  <p>Questions? Email ${mail}. See also our <a href="#/privacy">Privacy Policy</a>.</p>`);
}
