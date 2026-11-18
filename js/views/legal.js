// Privacy Policy and Terms of Use.
import { CONTACT_EMAIL } from '../config.js';

const UPDATED = 'November 17, 2026';
// Bump when the Terms or Privacy Policy change materially; signed-in users are asked to accept again.
export const TERMS_VERSION = '2026-11-17';
const mail = `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;
const page = (title, body) => `<div class="page narrow legal"><h1>${title}</h1><p class="muted">Last updated ${UPDATED}</p>${body}</div>`;

export function privacyView(root) {
  root.innerHTML = page('Privacy Policy', `
  <p>StudyFox is a free study site for school and the SAT and ACT. We collect as little as we can, we never sell your data, and we don't show ads.</p>

  <h2>What we collect</h2>
  <ul>
    <li><b>If you make an email account:</b> we store your name, email address, and password with our database provider (Supabase). Passwords are stored as a secure hash, never in plain text. We email you only to confirm your address or reset your password, unless you opt in to updates.</li>
    <li><b>If you sign in with Google, Apple, or Microsoft:</b> we receive your name, email address, and an account ID from that provider. If you use Apple's "Hide My Email," we receive a relay address instead.</li>
    <li><b>Your progress:</b> for every account, your answers, scores, mistake log, flashcards, streak, and settings are stored with our database provider so they sync across your devices and the StudyFox app. A copy is also kept in your browser or on your phone.</li>
    <li><b>When you set up your account:</b> whether you are 13 or older (a yes or no answer; we don't ask for your date of birth), your grade, what you're studying for, your language, and whether you want emails from us. This is saved with your progress.</li>
    <li><b>Optional sign-up questions:</b> how you heard about StudyFox and, if a friend shared it with you, their StudyFox user number. You can skip both.</li>
    <li><b>Your user number:</b> every account gets a number in the order people joined (for example, user #42). If you share your referral link and a friend enters your number, we count it toward your shares. Your first name may appear on the Top sharers list; you can hide it in Settings.</li>
    <li><b>Notifications in the app:</b> if you allow notifications, the StudyFox app saves a push token (a random device address from Apple or Google, sent through Expo's push service) so we can send announcements. It doesn't identify you by name, and you can turn announcements off in the app's Me tab or in your phone's settings. Study reminders are scheduled on your phone and never leave it.</li>
    <li><b>If you're under 13:</b> we don't create an account. We delete what you entered and only remember on your device that you can't sign up for a year.</li>
    <li><b>Technical data:</b> our hosting and database providers may keep standard server logs (such as IP address, browser type, and time of request) for security and reliability.</li>
  </ul>

  <h2>What we don't collect</h2>
  <p>We don't use advertising, analytics trackers, or tracking cookies, and we don't build profiles about you. We don't ask for your date of birth, school, address, or phone number.</p>

  <h2>Cookies and local storage</h2>
  <p>StudyFox does not use advertising or analytics cookies. We use your browser's local storage, and our sign-in provider may set a session token, only to keep you signed in and to save your progress and settings. These are strictly necessary for the site to work, so we don't show a cookie banner. When pages load fonts, code libraries, or the Desmos calculator from the providers below, those providers receive your IP address as part of the normal web request.</p>

  <h2>How we use your information</h2>
  <p>To run the site and app: to sign you in, save and sync your progress, tailor what you see to your goals, show announcements, and keep the service secure. If you opt in, we use your email address to send occasional news about StudyFox and study opportunities; every email has a way to stop them, and you can turn them off in Settings. We do not sell, rent, or share your personal information for marketing.</p>

  <h2>Service providers</h2>
  <p>We rely on a small number of providers to operate StudyFox: Supabase (authentication and database), Google, Apple, and Microsoft (sign-in), Expo and Apple Push Notification service (app notifications, only if you allow them), our website host, and content delivery networks that serve fonts and code libraries (Google Fonts, jsDelivr). The built-in calculator is provided by Desmos and loads from their servers. Each provider handles data under its own privacy policy.</p>

  <h2>Students and children</h2>
  <p>StudyFox is intended for students and other learners aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, contact us and we will delete it. Users under 18 should use StudyFox with the permission of a parent or guardian.</p>

  <h2>Parents and guardians</h2>
  <p>A parent or guardian can ask us to see or delete a student's data by emailing ${mail} from, or about, the account's email address.</p>

  <h2>Keeping and deleting your data</h2>
  <p>We keep synced progress until you delete it. You can delete it at any time in <a href="#/settings">Settings → Delete account</a>, which removes your account and synced data from our database and your device. You can also export a copy of your data in Settings. Local-only data can be erased with <b>Reset all progress</b> or by clearing your browser's site data.</p>

  <h2>Your rights</h2>
  <p>Depending on where you live (for example, under the GDPR or California law), you may have the right to access, correct, delete, or export your personal information. Most of this is self-service in Settings; for anything else, email ${mail}.</p>

  <h2>Security</h2>
  <p>Synced data is sent over HTTPS and protected by per-user access rules, so only you can read your progress. No system is perfectly secure, but we work to protect your information.</p>

  <h2>Changes</h2>
  <p>If we change this policy we'll update the date above. Significant changes will be noted on the site, and you'll be asked to review them the next time you open StudyFox.</p>

  <h2>Contact</h2>
  <p>Questions? Email ${mail}.</p>`);
}

export function termsView(root) {
  root.innerHTML = page('Terms of Use', `
  <p>These terms are an agreement between you and StudyFox. By using the site or creating an account, you agree to them. If you don't agree, please don't use StudyFox.</p>

  <h2>1. Who can use StudyFox</h2>
  <p>You must be at least 13 years old. When you sign up we ask whether you are 13 or older; please answer honestly. If you are under 18, you confirm that a parent or guardian has agreed to these terms for you.</p>

  <h2>2. Your account</h2>
  <p>You need an account to use StudyFox: an email account, or by signing in with Google, Apple, or Microsoft. Keep your sign-in secure; you're responsible for activity on your account. Your progress is backed up to your account, so it is kept even if you clear your browser data.</p>

  <h2>3. Free service</h2>
  <p>StudyFox is free, with no ads and nothing to buy in the app. We may add, change, or remove features at any time, and we may suspend or end the service.</p>

  <h2>Announcements and notifications</h2>
  <p>We may show announcements about StudyFox when you open the site or app, and, if you allow notifications, send them to your phone. You can turn announcement notifications off at any time in the app's Me tab or in your phone's settings.</p>

  <h2>4. Acceptable use</h2>
  <p>Don't misuse StudyFox. That includes trying to break or overload the site, accessing other people's data, scraping or reselling the content, or using the site for anything illegal. We may suspend accounts that do.</p>

  <h2>Leaderboards</h2>
  <p>There is no tolerance for offensive names or abusive behavior. You can report a name or block a player from any Match leaderboard. We review reports within 24 hours and remove offending content and users.</p>

  <h2>5. Content</h2>
  <p>The practice questions, explanations, and site design are owned by StudyFox and are provided for your personal, non-commercial study. Flashcard sets you create belong to you; by sharing a set link, you let anyone with the link view and copy it.</p>

  <h2>6. Not affiliated with the test makers</h2>
  <p>SAT® is a trademark of the College Board, and ACT® is a trademark of ACT, Inc. AP® and Advanced Placement® are trademarks of the College Board. None of these organizations is affiliated with or endorses StudyFox. Our questions are original practice material, and score estimates are approximations that may differ from your official scores.</p>

  <h2>7. No warranty</h2>
  <p>StudyFox is provided "as is" without warranties of any kind. We don't guarantee that the site will be error-free or always available, or that using it will improve your score.</p>

  <h2>8. Limitation of liability</h2>
  <p>To the fullest extent allowed by law, StudyFox is not liable for any indirect, incidental, or consequential damages, or for any loss of data, arising from your use of the site.</p>

  <h2>9. Copyright complaints</h2>
  <p>If you believe something on StudyFox infringes your copyright, email ${mail} with the material, where it appears, and your contact information, and we will review and remove it if appropriate.</p>

  <h2>10. Ending your use</h2>
  <p>You can stop using StudyFox and delete your data at any time from <a href="#/settings">Settings</a>.</p>

  <h2>11. Changes</h2>
  <p>We may update these terms. If the changes are significant, we'll ask you to accept the new terms the next time you sign in.</p>

  <h2>12. Governing law</h2>
  <p>These terms are governed by the laws of the State of Texas, USA, without regard to conflict-of-law rules, except where the law of your home country requires otherwise.</p>

  <h2>13. Contact</h2>
  <p>Questions? Email ${mail}. See also our <a href="#/privacy">Privacy Policy</a>.</p>`);
}
