import { $, esc, toast, passwordProblem, PASSWORD_HINT } from '../util.js';
import { icon } from '../icons.js';
import { store } from '../store.js';
import { confirmBox } from '../tools.js';
import { langOptions, profOptions } from '../i18n.js';
import { TERMS_VERSION } from './legal.js';
import { cloudEnabled, signInWith, cloudSignOut, deleteCloudData, linkedProviders, linkProvider, emailSignUp, emailSignIn, resetPassword, updatePassword } from '../cloud.js';

// Where to go after signing in: the page a guest was bounced from, else the dashboard.
export function takeAfterLogin() {
  let h = null;
  try { h = sessionStorage.getItem('sf_after_login'); sessionStorage.removeItem('sf_after_login'); } catch {}
  return h && !/^#\/(login|signup)?$/.test(h) ? h : '#/dashboard';
}

const GOOGLE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';
const APPLE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.5z"/></svg>';
const socialHTML = () => `
  <div class="stack social">
    <button class="btn block lg" type="button" data-oauth="google">${GOOGLE}Continue with Google</button>
    <button class="btn block lg apple" type="button" data-oauth="apple">${APPLE}Continue with Apple</button>
  </div>
  <div class="or"><span>or use email</span></div>`;
const agreeHTML = () => `<p class="muted small center">By continuing, you agree to the <a href="#/terms">Terms of Use</a> and <a href="#/privacy">Privacy Policy</a>.</p>`;
export const recordAgreement = () => { store.data().settings.legal = { version: TERMS_VERSION, at: new Date().toISOString() }; store.save(); };

// English speakers aren't asked about English proficiency.
const langFields = (lang, prof) => `
  <label>Primary language<select name="lang" id="lang">${langOptions(lang)}</select></label>
  <label id="profWrap" ${lang === 'en' ? 'hidden' : ''}>How well do you read English?<select name="english" id="english">${profOptions(prof || 'intermediate')}</select>
    <span class="muted small">The SAT is in English. We'll explain things in your language so you can learn the material, then practice it in English.</span></label>`;
const wireLang = (root) => { $('#lang', root).onchange = (e) => { $('#profWrap', root).hidden = e.target.value === 'en'; }; };

function authPage(root, mode) {
  const signup = mode === 'signup';
  root.innerHTML = `
  <div class="auth-wrap">
    <div class="auth card">
      <div class="auth-logo"><svg class="logo" viewBox="-2 2 70 62" aria-hidden="true"><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#f9a825"/><path d="M10 36l22 24 22-24-12-4-10 9-10-9z" fill="#fff8ec"/><path d="M26.5 54h11L32 60z" fill="#1a1a1a"/><circle cx="23" cy="28" r="3" fill="#1a1a1a"/><circle cx="41" cy="28" r="3" fill="#1a1a1a"/></svg></div>
      <h1>${signup ? 'Create your free account' : 'Sign in'}</h1>
      <p class="muted center">${signup ? 'Save your scores, mistakes, and flashcards. Free forever.' : 'Welcome back. Pick up where you left off.'}</p>
      ${socialHTML()}
      <form id="authForm" class="stack" novalidate>
        ${signup ? '<label>Name<input name="name" autocomplete="name" required placeholder="Your first name"></label>' : ''}
        <label>Email<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
        <label>Password<input name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="${signup ? 8 : 1}" placeholder="${signup ? PASSWORD_HINT : ''}"></label>
        ${signup ? '' : '<button class="link-btn small" type="button" id="forgot">Forgot your password?</button>'}
        <div class="form-err" id="err"></div>
        <button class="btn primary block lg" type="submit">${signup ? 'Create account' : 'Sign in'}</button>
      </form>
      <p class="center small">${signup ? 'Already have an account? <a href="#/login">Sign in</a>' : 'New here? <a href="#/signup">Create a free account</a>'}</p>
      ${agreeHTML(false)}
      <p class="note">${cloudEnabled ? 'Every account, including email, saves your progress to the cloud so it syncs across devices and the StudyFox app.' : 'Email accounts are stored on this device only. Use <b>Settings → Export</b> to move your progress to another device.'}</p>
    </div>
  </div>`;
  root.querySelectorAll('[data-oauth]').forEach((b) => b.addEventListener('click', async () => {
    const err = $('#err', root); err.textContent = '';
    try { b.disabled = true; await signInWith(b.dataset.oauth); } catch (ex) { err.textContent = ex.message; b.disabled = false; }
  }));
  $('#authForm', root).addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = $('#err', root);
    err.textContent = '';
    if (!/^\S+@\S+\.\S+$/.test(f.email || '')) { err.textContent = 'Please enter a valid email address.'; return; }
    if (signup && passwordProblem(f.password)) { err.textContent = passwordProblem(f.password); return; }
    if (!f.password) { err.textContent = 'Enter your password.'; return; }
    const btn = e.target.querySelector('[type=submit]'); btn.disabled = true;
    try {
      if (!cloudEnabled) {
        if (signup) { await store.signup(f); location.hash = '#/welcome'; return; }
        await store.login(f.email, f.password); toast('Signed in.', 'good'); location.hash = takeAfterLogin(); return;
      }
      // Cloud accounts: cloud.js picks up the new session, downloads progress, and moves on from this page.
      const r = signup ? await emailSignUp(f) : await emailSignIn(f.email, f.password);
      if (r.confirm) {
        $('#authForm', root).innerHTML = `<div class="banner"><b>Check your email.</b> We sent a link to ${esc(f.email)}. Open it to ${r.moved ? 'finish moving your account to the cloud' : 'confirm your account'}, then sign in.</div>`;
        // An existing device-only account keeps working here while they confirm.
        if (r.moved) await store.login(f.email, f.password);
        return;
      }
      if (signup) location.hash = '#/welcome';
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  });
  $('#forgot', root)?.addEventListener('click', async () => {
    const email = $('[name=email]', root).value.trim(), err = $('#err', root);
    if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Type your email above first, then tap "Forgot your password?"'; return; }
    try { await resetPassword(email); toast('If that email has an account, a reset link is on its way.', 'good'); } catch (ex) { err.textContent = ex.message; }
  });
}
export const loginView = (root) => authPage(root, 'login');
export const signupView = (root) => authPage(root, 'signup');

export function settingsView(root) {
  const u = store.user();
  const s = store.data().settings;
  root.innerHTML = `
  <div class="page narrow">
    <h1>Settings</h1>
    <div class="card stack">
      <h2 class="h3">Profile</h2>
      ${u ? `<label>Name<input id="name" value="${esc(u.name)}"></label><p class="muted small">Signed in as ${esc(u.email || u.name)}${u.cloud ? `${u.provider === 'email' ? '' : ` with ${u.provider === 'apple' ? 'Apple' : 'Google'}`}. Progress syncs across your devices.` : ' (this device only). Sign out and sign back in to move this account to the cloud.'}</p>` : ''}
      <div class="grid2">
        <label>Main test<select id="focus"><option ${s.focus === 'SAT' ? 'selected' : ''}>SAT</option><option ${s.focus === 'ACT' ? 'selected' : ''}>ACT</option></select></label>
        <label>Test date<input id="testDate" type="date" value="${esc(s.testDate || '')}"></label>
        <label>SAT target score<input id="tSAT" type="number" min="400" max="1600" step="10" value="${s.target.SAT}"></label>
        <label>ACT target score<input id="tACT" type="number" min="1" max="36" value="${s.target.ACT}"></label>
      </div>
      ${langFields(s.lang || 'en', s.english)}
      <label class="consent"><input type="checkbox" id="emails" ${s.emails ? 'checked' : ''}> <span>Email me about new courses, features, and study opportunities.</span></label>
      <label>Theme<select id="theme"><option value="system">Match system</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <div class="row gap"><button class="btn primary" id="saveBtn">Save changes</button>${u ? '<button class="btn ghost" id="logout">Sign out</button>' : ''}</div>
    </div>
    ${u?.cloud && u.provider === 'email' ? `<form class="card stack" id="pwForm">
      <h2 class="h3">Password</h2>
      <label>New password<input type="password" name="pw" autocomplete="new-password" minlength="8" required placeholder="${PASSWORD_HINT}"></label>
      <div><button class="btn">Change password</button></div>
    </form>` : ''}
    ${u?.cloud ? `<div class="card stack" id="linkCard">
      <h2 class="h3">Sign-in methods</h2>
      <p class="muted small">Connect both Google and Apple so either one opens this same account with the same progress.</p>
      <div id="links" class="stack"><p class="muted small">Loading...</p></div>
    </div>` : ''}
    <div class="card stack">
      <h2 class="h3">Your data</h2>
      <p class="muted">${u?.cloud ? 'Your progress is saved in this browser and backed up to your account automatically.' : 'Everything is stored in this browser. Export a backup to keep it safe, or sign in with Google or Apple to sync across devices.'}</p>
      <div class="row gap wrap">
        <button class="btn" id="exportBtn">Export backup</button>
        <label class="btn">Import backup<input type="file" id="importIn" accept=".json,application/json" hidden></label>
        <button class="btn danger ghost" id="resetBtn">Reset all progress</button>
        ${u?.cloud ? '<button class="btn danger ghost" id="deleteBtn">Delete account data</button>' : ''}
      </div>
    </div>
  </div>`;
  $('#theme', root).value = s.theme;
  $('#pwForm', root)?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = passwordProblem(e.target.pw.value);
    if (bad) { toast(bad, 'bad'); return; }
    try { await updatePassword(e.target.pw.value); e.target.reset(); toast('Password changed.', 'good'); } catch (ex) { toast(ex.message, 'bad'); }
  });
  if (/reset=1/.test(location.hash)) $('#pwForm', root)?.scrollIntoView();
  wireLang(root);
  if (u?.cloud) linkedProviders().then((have) => {
    const box = $('#links', root); if (!box) return;
    box.innerHTML = [['google', 'Google', GOOGLE], ['apple', 'Apple', APPLE]].map(([id, name, logo]) => `<div class="row between gap"><span class="row gap">${logo}<b>${name}</b></span>${have.includes(id)
      ? `<span class="tag">${icon('check')} Connected</span>` : `<button class="btn sm" data-link="${id}">Connect ${name}</button>`}</div>`).join('');
    box.onclick = async (e) => {
      const b = e.target.closest('[data-link]'); if (!b) return;
      try { b.disabled = true; await linkProvider(b.dataset.link); } catch (ex) { toast(ex.message, 'bad'); b.disabled = false; }
    };
  }).catch(() => { const box = $('#links', root); if (box) box.innerHTML = '<p class="muted small">Could not load sign-in methods.</p>'; });
  $('#saveBtn', root).onclick = () => {
    if (u) store.updateProfile({ name: $('#name', root).value.trim() || u.name });
    const em = $('#emails', root).checked; if (em !== !!s.emails) { s.emails = em; s.emailsAt = new Date().toISOString(); }
    Object.assign(s, { focus: $('#focus', root).value, testDate: $('#testDate', root).value, theme: $('#theme', root).value, lang: $('#lang', root).value });
    s.english = s.lang === 'en' ? '' : $('#english', root).value;
    s.target = { SAT: +$('#tSAT', root).value || 1400, ACT: +$('#tACT', root).value || 30 };
    store.save(); store.emit(); toast('Saved.', 'good');
  };
  $('#logout', root)?.addEventListener('click', async () => { if (u?.cloud) await cloudSignOut(); store.logout(); location.hash = '#/'; });
  $('#deleteBtn', root)?.addEventListener('click', async () => {
    if (!(await confirmBox('This deletes your synced progress from our servers and this device, then signs you out. It cannot be undone.', { ok: 'Delete my data', danger: true }))) return;
    try { await deleteCloudData(); store.resetAll(); await cloudSignOut(); store.logout(); toast('Your data was deleted.'); location.hash = '#/'; } catch (ex) { toast(ex.message, 'bad'); }
  });
  $('#exportBtn', root).onclick = () => {
    const blob = new Blob([store.exportAll()], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `studyfox-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };
  $('#importIn', root).onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { store.importAll(await f.text()); toast('Backup imported.', 'good'); settingsView(root); } catch (ex) { toast(ex.message, 'bad'); }
  };
  $('#resetBtn', root).onclick = async () => {
    if (await confirmBox('This permanently deletes your scores, mistake log, and flashcard sets on this device.', { ok: 'Reset everything', danger: true })) { store.resetAll(); toast('Progress reset.'); settingsView(root); }
  };
}

// Blocking prompt for signed-in users who haven't accepted the current Terms (OAuth sign-ins, or after a policy update).
export function requireAgreement() {
  const s = store.data().settings;
  if (!store.user() || !s.onboarded || s.legal?.version === TERMS_VERSION || document.querySelector('.agree-gate')) return;
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap agree-gate';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Terms of Use"><div class="modal-head"><h3>${s.legal ? 'We updated our Terms' : 'One more step'}</h3></div><div class="modal-body stack">
    <p>${s.legal ? 'Our Terms of Use or Privacy Policy changed. Please review and accept them to keep using StudyFox.' : 'Before you start, please review and accept our Terms of Use and Privacy Policy.'}</p>
    <label class="consent"><input type="checkbox" id="gateAgree"> <span>I'm 13 or older, and I agree to the <a href="#/terms" target="_blank">Terms of Use</a> and <a href="#/privacy" target="_blank">Privacy Policy</a>.</span></label>
    <div class="row end gap"><button class="btn ghost" data-out>Sign out</button><button class="btn primary" data-ok disabled>Continue</button></div></div></div>`;
  const box = wrap.querySelector('#gateAgree'), ok = wrap.querySelector('[data-ok]');
  box.onchange = () => { ok.disabled = !box.checked; };
  ok.onclick = () => { recordAgreement(); wrap.remove(); };
  wrap.querySelector('[data-out]').onclick = async () => { if (store.user()?.cloud) await cloudSignOut(); store.logout(); wrap.remove(); location.hash = '#/'; };
  document.body.appendChild(wrap);
}
