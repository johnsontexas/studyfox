// Onboarding after sign-up (and after the first Google/Apple sign-in): goals, age check, email preference, terms.
import { $, esc, toast } from '../util.js';
import { store } from '../store.js';
import { langOptions, profOptions } from '../i18n.js';
import { cloudSignOut, deleteAccount, db, cloudSynced } from '../cloud.js';
import { setting } from '../content/settings.js';
import { pendingRef, clearRef, setReferrer, updateMemberProfile, loadMember, ordinal } from '../members.js';
import { recordAgreement, takeAfterLogin } from './account.js';
import { studyPicker, setStudying } from '../studying.js';
import { joinClass, cleanCode, pendingClassCode, setPendingClassCode } from '../classes.js';

const MIN_AGE = 13;
const AGE_BLOCK = 'sf_age_block'; // ISO date this device may sign up again (a year after an under-13 answer)

const GOALS = [
  ['school', 'My regular school classes'],
  ['flashcards', 'Making flashcards'], ['english', 'Improving my English'], ['other', 'Something else'],
];
const GRADES = ['6th grade or below', '7th grade', '8th grade', '9th grade', '10th grade', '11th grade', '12th grade', 'College', 'Not in school'];

// "How did you hear about StudyFox?" (optional). The choices come from content_settings.onboarding.
const DETAIL_FOR = ['other', 'other_creator', 'teacher'];
function heardAboutHTML(s) {
  const cfg = setting('onboarding');
  if (!cfg.ask_heard_about) return '';
  const cur = s.heardAbout?.source || (pendingRef() ? 'friend' : '');
  return `<label>How did you hear about StudyFox? <span class="muted small">Optional</span>
      <select name="heard"><option value="">Choose one</option>${(cfg.heard_about_options || []).map((o) => `<option value="${esc(o.id)}" ${cur === o.id ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
    <label id="heardMore" ${DETAIL_FOR.includes(cur) ? '' : 'hidden'}>Tell us more <span class="muted small">Optional, like the creator's name</span><input name="heardDetail" maxlength="200" value="${esc(s.heardAbout?.detail || '')}"></label>`;
}
function saveHeardAbout(f, u) {
  const source = f.heard?.value;
  if (!source) return;
  const detail = DETAIL_FOR.includes(source) ? (f.heardDetail?.value || '').trim().slice(0, 200) : '';
  store.data().settings.heardAbout = { source, detail };
  if (u.cloud) db().then((c) => c?.from('signup_sources').upsert({ user_id: u.id, source, detail, platform: 'web' })).then((r) => r?.error && console.warn(r.error)).catch(console.warn);
}

// Wait for a cloud account's saved progress before deciding: right after sign-in this device's copy is still
// blank, so checking early sent returning students to onboarding.
export const needsOnboarding = () => { const u = store.user(); return !!u && !store.data().settings.onboarded && (!u.cloud || cloudSynced(u.id)); };

export function ageBlockedUntil() {
  let d = null;
  try { d = localStorage.getItem(AGE_BLOCK); } catch {}
  if (!d) return null;
  if (new Date(d) <= new Date()) { try { localStorage.removeItem(AGE_BLOCK); } catch {} return null; }
  return d;
}


export function ageBlockedView(root) {
  root.innerHTML = `<div class="auth-wrap"><div class="auth card stack">
    <h1>Thanks for your interest in StudyFox</h1>
    <p class="muted center">StudyFox is for students 13 and older, so we can't create an account for you yet. You're welcome to come back once you've turned 13.</p>
    <p class="muted center small">We didn't keep any of the information you entered.</p>
    <a class="btn block" href="#/">Back to home</a>
  </div></div>`;
}

export function welcomeView(root) {
  const u = store.user();
  if (!u) { location.replace('#/signup'); return; }
  const s = store.data().settings;
  root.innerHTML = `
  <div class="auth-wrap">
    <form class="auth card stack welcome" id="wForm" novalidate>
      <h1>Welcome to StudyFox</h1>
      <p class="muted center">A few quick questions so we can set things up for you.</p>

      <label>What should we call you?<input name="name" value="${esc(u.name || '')}" autocomplete="given-name" required></label>

      <fieldset class="goals"><legend>How old are you? <span class="muted small">StudyFox is for students 13 and older. We don't ask for your birthday.</span></legend>
        <label class="goal"><input type="radio" name="age" value="ok" required><span>13 or older</span></label>
        <label class="goal"><input type="radio" name="age" value="under"><span>Under 13</span></label>
      </fieldset>

      <fieldset class="goals"><legend>What are you studying for? <span class="muted small">Search for the SAT, the ACT, or any AP class.</span></legend>
        <div id="studyPick"></div>
      </fieldset>
      <fieldset class="goals"><legend>Anything else? <span class="muted small">Pick any.</span></legend>
        ${GOALS.map(([v, t]) => `<label class="goal"><input type="checkbox" name="goals" value="${v}" ${(s.goals || []).includes(v) ? 'checked' : ''}><span>${t}</span></label>`).join('')}
      </fieldset>

      <label>Grade<select name="grade"><option value="">Choose one</option>${GRADES.map((g) => `<option ${s.grade === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label>

      <label>Primary language<select name="lang" id="lang">${langOptions(s.lang || 'en')}</select></label>
      <label id="profWrap" ${(s.lang || 'en') === 'en' ? 'hidden' : ''}>How well do you read English?<select name="english">${profOptions(s.english || 'intermediate')}</select></label>

      ${heardAboutHTML(s)}
      ${store.user()?.cloud ? `<label>Did a friend share StudyFox with you? <span class="muted small">Optional: their StudyFox user number, from their link or their Settings page</span>
        <span class="row gap"><b aria-hidden="true">#</b><input name="friend" inputmode="numeric" pattern="[0-9]*" maxlength="9" value="${esc(pendingRef())}" placeholder="Like 42" aria-label="Friend's user number"></span></label>` : ''}

      ${store.user()?.cloud ? `<label>Class or study group code <span class="muted small">Optional: from your teacher or friends. You can join more later from your dashboard.</span>
        <input name="classCode" class="code-input" maxlength="7" autocapitalize="characters" autocomplete="off" value="${esc(pendingClassCode())}" placeholder="Like ABC123"></label>` : ''}

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
  const heard = f.querySelector('[name=heard]');
  if (heard) heard.onchange = () => { $('#heardMore', root).hidden = !DETAIL_FOR.includes(heard.value); };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#err', root); err.textContent = '';
    const age = f.querySelector('[name=age]:checked')?.value;
    const fail = (msg, el) => { err.textContent = msg; el?.focus(); };
    if (!f.name.value.trim()) return fail('Enter your name.', f.name);
    if (!age) return fail(`Tell us if you're ${MIN_AGE} or older.`, f.querySelector('[name=age]'));
    if (age === 'ok' && !f.agree.checked) return fail('Please agree to the Terms of Use and Privacy Policy to continue.', f.agree);
    const friend = (f.friend?.value || '').trim().replace(/^#/, '');
    if (friend && !/^\d{1,9}$/.test(friend)) return fail("A friend's user number is digits only, like 42.", f.friend);

    if (age === 'under') {
      // Under 13: keep nothing. Block sign-up on this device for a year.
      const b = new Date(); b.setFullYear(b.getFullYear() + 1);
      try { localStorage.setItem(AGE_BLOCK, b.toISOString().slice(0, 10)); } catch {}
      try { if (u.cloud) { await deleteAccount(); await cloudSignOut(); } } catch (ex) { console.warn(ex); }
      store.forgetAccount();
      location.replace('#/too-young');
      return;
    }

    // Which friend shared StudyFox (checked by the server: the number must exist and can't be yours).
    if (friend && u.cloud) {
      const r = await setReferrer(db(), friend);
      if (r === 'not_found') return fail(`We couldn't find user #${friend}. Check the number with your friend, or leave it blank.`, f.friend);
      if (r === 'self') return fail("That's your own user number. Enter your friend's number, or leave it blank.", f.friend);
      clearRef();
    } else if (!friend) clearRef();

    // Class or study group code (checked by the server).
    const classCode = cleanCode(f.classCode?.value);
    if (classCode && u.cloud) {
      if (classCode.length !== 6) return fail('Class codes are 6 letters and numbers, like ABC123.', f.classCode);
      try { await joinClass(db(), classCode, f.name.value.trim()); setPendingClassCode(''); }
      catch (ex) { return fail(ex.message, f.classCode); }
    } else setPendingClassCode('');

    // Goals keep their old shape (sat, act, ap, ...) so anything reading them still works.
    const goals = [...f.querySelectorAll('[name=goals]:checked')].map((x) => x.value);
    if (studying.includes('SAT')) goals.push('sat');
    if (studying.includes('ACT')) goals.push('act');
    if (studying.some((id) => id !== 'SAT' && id !== 'ACT')) goals.push('ap');
    // Re-read settings: a cloud sync may have replaced the data object since this page rendered.
    const cur = store.data().settings;
    Object.assign(cur, {
      onboarded: new Date().toISOString(), ageOk: true, goals, grade: f.grade.value,
      emails: f.emails.checked, emailsAt: new Date().toISOString(),
      focus: goals.includes('act') && !goals.includes('sat') ? 'ACT' : (cur.focus || 'SAT'),
      lang: f.lang.value, english: f.lang.value === 'en' ? '' : f.english.value,
    });
    saveHeardAbout(f, u);
    setStudying(studying);
    recordAgreement(); // also saves
    store.updateProfile({ name: f.name.value.trim() });
    if (u.cloud) {
      updateMemberProfile(db(), f.name.value.trim(), true);
      loadMember(db()).then((m) => m && toast(`Welcome to StudyFox, ${f.name.value.trim()}! You're user #${m.no}, the ${ordinal(m.no)} student to join.`, 'good'));
    } else toast(`Welcome to StudyFox, ${f.name.value.trim()}!`, 'good');
    location.hash = takeAfterLogin();
  });
}
