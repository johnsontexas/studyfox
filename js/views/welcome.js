// Onboarding after sign-up (and after the first Google/Apple sign-in): goals, age check, email preference, terms.
import { $, esc, toast } from '../util.js';
import { store } from '../store.js';
import { langOptions, profOptions } from '../i18n.js';
import { cloudSignOut, deleteAccount } from '../cloud.js';
import { recordAgreement, takeAfterLogin } from './account.js';
import { studyPicker, setStudying } from '../studying.js';

const MIN_AGE = 13;
const AGE_BLOCK = 'sf_age_block'; // ISO date this device may sign up again (the 13th birthday)

const GOALS = [
  ['school', 'My regular school classes'],
  ['flashcards', 'Making flashcards'], ['english', 'Improving my English'], ['other', 'Something else'],
];
const GRADES = ['6th grade or below', '7th grade', '8th grade', '9th grade', '10th grade', '11th grade', '12th grade', 'College', 'Not in school'];

export const needsOnboarding = () => !!store.user() && !store.data().settings.onboarded;

export function ageBlockedUntil() {
  let d = null;
  try { d = localStorage.getItem(AGE_BLOCK); } catch {}
  if (!d) return null;
  if (new Date(d) <= new Date()) { try { localStorage.removeItem(AGE_BLOCK); } catch {} return null; }
  return d;
}

const ageOn = (dob, now = new Date()) => {
  const b = new Date(dob + 'T00:00:00');
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
};
const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export function ageBlockedView(root) {
  const until = ageBlockedUntil();
  root.innerHTML = `<div class="auth-wrap"><div class="auth card stack">
    <h1>Thanks for your interest in StudyFox</h1>
    <p class="muted center">StudyFox is for students 13 and older, so we can't create an account for you yet.${until ? ` You're welcome to come back on <b>${esc(fmtDate(until))}</b>.` : ''}</p>
    <p class="muted center small">We didn't keep any of the information you entered.</p>
    <a class="btn block" href="#/">Back to home</a>
  </div></div>`;
}

export function welcomeView(root) {
  const u = store.user();
  if (!u) { location.replace('#/signup'); return; }
  const s = store.data().settings;
  const maxDob = new Date().toISOString().slice(0, 10);
  root.innerHTML = `
  <div class="auth-wrap">
    <form class="auth card stack welcome" id="wForm" novalidate>
      <h1>Welcome to StudyFox</h1>
      <p class="muted center">A few quick questions so we can set things up for you.</p>

      <label>What should we call you?<input name="name" value="${esc(u.name || '')}" autocomplete="given-name" required></label>

      <label>Date of birth<input name="dob" type="date" max="${maxDob}" min="1900-01-01" required></label>

      <fieldset class="goals"><legend>What are you studying for? <span class="muted small">Search for the SAT, the ACT, or any AP class.</span></legend>
        <div id="studyPick"></div>
      </fieldset>
      <fieldset class="goals"><legend>Anything else? <span class="muted small">Pick any.</span></legend>
        ${GOALS.map(([v, t]) => `<label class="goal"><input type="checkbox" name="goals" value="${v}" ${(s.goals || []).includes(v) ? 'checked' : ''}><span>${t}</span></label>`).join('')}
      </fieldset>

      <label>Grade<select name="grade"><option value="">Choose one</option>${GRADES.map((g) => `<option ${s.grade === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label>

      <label>Primary language<select name="lang" id="lang">${langOptions(s.lang || 'en')}</select></label>
      <label id="profWrap" ${(s.lang || 'en') === 'en' ? 'hidden' : ''}>How well do you read English?<select name="english">${profOptions(s.english || 'intermediate')}</select></label>

      <div class="consents">
        <label class="consent"><input type="checkbox" name="emails" ${s.emails ? 'checked' : ''}> <span>Email me about new courses, features, and study opportunities like scholarships and competitions. You can turn this off anytime in Settings.</span></label>
        <label class="consent"><input type="checkbox" name="agree" required> <span>I agree to the <a href="#/terms" target="_blank">Terms of Use</a> and <a href="#/privacy" target="_blank">Privacy Policy</a>.</span></label>
      </div>
      <div class="form-err" id="err"></div>
      <button class="btn primary block lg" type="submit">Start studying</button>
    </form>
  </div>`;
  const f = $('#wForm', root);
  let studying = s.studying || [];
  studyPicker($('#studyPick', root), studying, (ids) => { studying = ids; });
  $('#lang', root).onchange = (e) => { $('#profWrap', root).hidden = e.target.value === 'en'; };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#err', root); err.textContent = '';
    const dob = f.dob.value;
    const fail = (msg, el) => { err.textContent = msg; el?.focus(); };
    if (!f.name.value.trim()) return fail('Enter your name.', f.name);
    if (!dob || isNaN(new Date(dob)) || dob > maxDob || ageOn(dob) > 120) return fail('Enter a valid date of birth.', f.dob);
    if (!f.agree.checked) return fail('Please agree to the Terms of Use and Privacy Policy to continue.', f.agree);

    if (ageOn(dob) < MIN_AGE) {
      // Under 13: keep nothing. Remember only the date they can come back, on this device.
      const b = new Date(dob + 'T00:00:00'); b.setFullYear(b.getFullYear() + MIN_AGE);
      try { localStorage.setItem(AGE_BLOCK, b.toISOString().slice(0, 10)); } catch {}
      try { if (u.cloud) { await deleteAccount(); await cloudSignOut(); } } catch (ex) { console.warn(ex); }
      store.forgetAccount();
      location.replace('#/too-young');
      return;
    }

    // Goals keep their old shape (sat, act, ap, ...) so anything reading them still works.
    const goals = [...f.querySelectorAll('[name=goals]:checked')].map((x) => x.value);
    if (studying.includes('SAT')) goals.push('sat');
    if (studying.includes('ACT')) goals.push('act');
    if (studying.some((id) => id !== 'SAT' && id !== 'ACT')) goals.push('ap');
    // Re-read settings: a cloud sync may have replaced the data object since this page rendered.
    const cur = store.data().settings;
    Object.assign(cur, {
      onboarded: new Date().toISOString(), dob, goals, grade: f.grade.value,
      emails: f.emails.checked, emailsAt: new Date().toISOString(),
      focus: goals.includes('act') && !goals.includes('sat') ? 'ACT' : (cur.focus || 'SAT'),
      lang: f.lang.value, english: f.lang.value === 'en' ? '' : f.english.value,
    });
    setStudying(studying);
    recordAgreement(); // also saves
    store.updateProfile({ name: f.name.value.trim() });
    toast(`Welcome to StudyFox, ${f.name.value.trim()}!`, 'good');
    location.hash = takeAfterLogin();
  });
}
