// App shell: navigation, theme, and a tiny hash router.
import { icon } from './icons.js';
import { $, esc } from './util.js';
import { store } from './store.js';
import { initI18n } from './i18n.js';
import { homeView } from './views/home.js';
import { loginView, signupView, settingsView, requireAgreement } from './views/account.js';
import { initCloud } from './cloud.js';
import { welcomeView, ageBlockedView, ageBlockedUntil, needsOnboarding } from './views/welcome.js';
import { CREATOR, CREATOR_EMAIL, KOFI } from './config.js';
import { newsView, adminView, contactView, maintenanceHTML, fetchStatus } from './views/news.js';
import { isAdmin, db } from './cloud.js';
import { initContent, onContent } from './content/live.js';
import { creditLine } from './content/people.js';
import { socials } from './content/socials.js';
import { checkAnnouncements } from './announce.js';
import { captureRef, loadMember, myNumber } from './members.js';
import { applyA11y } from './a11y.js';
import { applyAppearance } from './appearance.js';
import { openShare } from './share.js';

// Pages other than the home page load on first visit, so the home page downloads and runs less code.
function lazy(load, name) {
  return (main, params) => {
    let done = null, gone = false;
    main.innerHTML = '<div class="page"><p class="muted">Loading…</p></div>';
    load().then((m) => {
      if (gone) return;
      done = m[name](main, params) || null;
      if (main.id === 'dashBody') main.querySelector('.page')?.classList.add('in-dash');
    }).catch((e) => { console.error(e); if (!gone) main.innerHTML = `<div class="page narrow"><h1>Could not load this page</h1><p>Check your connection and try again.</p><a class="btn" href="javascript:location.reload()">Reload</a></div>`; });
    return () => { gone = true; if (typeof done === 'function') done(); };
  };
}
const load_dashboard = () => import('./views/dashboard.js');
const dashboardView = lazy(load_dashboard, 'dashboardView');
const load_practice = () => import('./views/practice.js');
const practiceView = lazy(load_practice, 'practiceView');
const reviewView = lazy(load_practice, 'reviewView');
const load_exams = () => import('./views/exams.js');
const examsView = lazy(load_exams, 'examsView');
const load_results = () => import('./views/results.js');
const resultsView = lazy(load_results, 'resultsView');
const load_runner = () => import('./views/runner.js');
const runnerView = lazy(load_runner, 'runnerView');
const load_flashcards = () => import('./views/flashcards.js');
const libraryView = lazy(load_flashcards, 'libraryView');
const setView = lazy(load_flashcards, 'setView');
const editView = lazy(load_flashcards, 'editView');
const learnView = lazy(load_flashcards, 'learnView');
const testView = lazy(load_flashcards, 'testView');
const matchView = lazy(load_flashcards, 'matchView');
const importView = lazy(load_flashcards, 'importView');
const load_formulas = () => import('./views/formulas.js');
const formulasView = lazy(load_formulas, 'formulasView');
const calculatorView = lazy(load_formulas, 'calculatorView');
const load_speed = () => import('./views/speed.js');
const speedView = lazy(load_speed, 'speedView');
const load_learn = () => import('./views/learn.js');
const learnHubView = lazy(load_learn, 'learnHubView');
const courseView = lazy(load_learn, 'courseView');
const lessonView = lazy(load_learn, 'lessonView');
const load_legal = () => import('./views/legal.js');
const privacyView = lazy(load_legal, 'privacyView');
const termsView = lazy(load_legal, 'termsView');
const load_donate = () => import('./views/donate.js');
const donateView = lazy(load_donate, 'donateView');
const load_content_admin = () => import('./views/content-admin.js');
const contentAdminView = lazy(load_content_admin, 'contentAdminView');
const load_ap = () => import('./views/ap.js');
const apHubView = lazy(load_ap, 'apHubView');
const apCourseView = lazy(load_ap, 'apCourseView');
const load_about = () => import('./views/about.js');
const aboutView = lazy(load_about, 'aboutView');
const load_contributors = () => import('./views/contributors.js');
const contributorsView = lazy(load_contributors, 'contributorsView');

export const BRAND = 'StudyFox';

const routes = [
  ['/', homeView], ['/home', homeView], ['/login', loginView], ['/signup', signupView], ['/settings', settingsView],
  ['/dashboard', dashboardView], ['/practice', practiceView], ['/review', reviewView], ['/exams', examsView],
  ['/test', runnerView], ['/results/:id', resultsView],
  ['/flashcards', libraryView], ['/flashcards/new', editView], ['/flashcards/:id', setView], ['/flashcards/:id/edit', editView],
  ['/flashcards/:id/learn', learnView], ['/flashcards/:id/test', testView], ['/flashcards/:id/match', matchView], ['/share/:data', importView],
  ['/learn', learnHubView], ['/learn/:course', courseView], ['/learn/:course/:lesson', lessonView],
  ['/formulas', formulasView], ['/calculator', calculatorView], ['/speed', speedView],
  ['/ap', apHubView], ['/ap/:course', apCourseView], ['/hardest', (m) => apCourseView(m, { course: 'hardest' })], ['/about', aboutView], ['/contributors', contributorsView], ['/news', newsView], ['/admin', adminView], ['/admin/content', contentAdminView], ['/contact', contactView],
  ['/donate', donateView], ['/privacy', privacyView], ['/terms', termsView], ['/welcome', welcomeView], ['/too-young', ageBlockedView],
];

function match(path) {
  for (const [pat, view] of routes) {
    const a = pat.split('/'), b = path.split('/');
    if (a.length !== b.length) continue;
    const params = {};
    if (a.every((seg, i) => (seg.startsWith(':') ? ((params[seg.slice(1)] = decodeURIComponent(b[i])), true) : seg === b[i]))) return { view, params, pat };
  }
  return null;
}

function applyTheme() {
  const t = store.data().settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  applyAppearance();
}

function navHTML(path) {
  const u = store.user();
  const group = (g, label) => `<a href="#${TAB_GROUPS[g][0][0]}" class="${TAB_GROUPS[g].some(([p]) => p === path) ? 'active' : ''}">${label}</a>`;
  const link = (href, label) => `<a href="#${href}" class="${path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''}">${label}</a>`;
  return `<div class="nav-inner">
    <a href="#/" class="brand" aria-label="${BRAND} home"><svg class="logo" viewBox="-2 2 70 62" aria-hidden="true"><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#f9a825"/><path d="M10 36l22 24 22-24-12-4-10 9-10-9z" fill="#fff8ec"/><path d="M26.5 54h11L32 60z" fill="#1a1a1a"/><circle cx="23" cy="28" r="3" fill="#1a1a1a"/><circle cx="41" cy="28" r="3" fill="#1a1a1a"/></svg><span>Study<span class="brand-fox">Fox</span></span></a>
    <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${icon('menu')}</button>
    <nav class="links" id="navLinks">
      ${link(u ? '/home' : '/', 'Home')}<span class="nav-study">${link('/learn', `Courses`)}${link('/ap', `AP Practice`)}${group('SAT', `SAT &amp; ACT`)}${link('/flashcards', `Flashcards`)}</span>${link('/news', 'News')}${link('/about', 'About')}${u ? group('DASH', 'Dashboard') : ''}${admin ? link('/admin', 'Admin') : ''}
    </nav>
    <div class="nav-right">
      <button class="icon-btn" id="themeBtn" title="Toggle dark mode" aria-label="Toggle dark mode">${icon('contrast')}</button>
      ${u && myNumber() ? `<a class="nav-no" href="#/settings" title="Your StudyFox student number">#${myNumber()}</a>` : ''}
      <button class="btn sm ghost share-btn" id="shareBtn" title="Share" aria-label="Share">${icon('upload')}<span>Share</span></button>
      ${u ? '' : `<a class="btn sm ghost" href="#/login">Log in</a><a class="btn sm primary" href="#/signup">Sign up free</a>`}
    </div>
  </div>`;
}

// Everything except these pages needs an account; guests are sent to sign in, then returned.
// Related pages share one nav item and show as tabs: settings and support inside the dashboard,
// and every SAT/ACT tool under SAT & ACT.
const TAB_GROUPS = {
  DASH: [['/dashboard', 'Overview'], ['/settings', 'Settings'], ['/contact', 'Support']],
  SAT: [['/practice', 'Practice'], ['/hardest', 'Hardest questions'], ['/speed', 'Speed practice'], ['/exams', 'Practice tests'], ['/formulas', 'Formula sheets'], ['/calculator', 'Calculator']],
};
const tabGroup = (pat) => Object.entries(TAB_GROUPS).find(([g, tabs]) => (g !== 'DASH' || store.user()) && tabs.some(([p]) => p === pat));
function tabShell(main, m, tabs) {
  main.innerHTML = `<div class="page dash-tabs"><nav class="tabs" aria-label="Sections">${tabs.map(([p, t]) => `<a href="#${p}" class="${p === m.pat ? 'on' : ''}">${t}</a>`).join('')}</nav></div><div id="dashBody"></div>`;
  // On phones the tab bar scrolls; keep the current tab in view.
  const on = main.querySelector('.tabs a.on'); if (on) on.parentElement.scrollLeft = on.offsetLeft - 8;
  const body = $('#dashBody', main);
  const r = m.view(body, m.params);
  body.querySelector('.page')?.classList.add('in-dash');
  return r;
}

const PUBLIC = ['/', '/about', '/contributors', '/news', '/contact', '/donate', '/login', '/signup', '/privacy', '/terms', '/too-young'];
export const AFTER_LOGIN = 'sf_after_login';

let cleanup = null;
// Maintenance mode from the admin console. Admins still see the site; sign-in stays open so they can get in.
let status = null, admin = false;
function router() {
  const path = (location.hash.slice(1) || '/').split('?')[0];
  if (status?.maintenance && !admin && !['/login', '/admin', '/privacy', '/terms'].includes(path)) {
    if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
    $('#nav').innerHTML = navHTML(path);
    $('#main').innerHTML = maintenanceHTML(status.message);
    document.title = `${BRAND} · Back soon`;
    return;
  }
  if (!store.user() && !PUBLIC.includes(path)) {
    try { sessionStorage.setItem(AFTER_LOGIN, location.hash); } catch {}
    location.replace('#/login');
    return;
  }
  if (!['/privacy', '/terms'].includes(path)) requireAgreement();
  // Under-13 sign-ups are blocked on this device until their 13th birthday.
  if (ageBlockedUntil() && ['/login', '/signup', '/welcome'].includes(path)) { location.replace('#/too-young'); return; }
  // New accounts finish onboarding (age, goals, terms) before using the site.
  if (needsOnboarding() && !['/welcome', '/privacy', '/terms'].includes(path)) {
    if (!['/', '/login', '/signup'].includes(path)) try { sessionStorage.setItem(AFTER_LOGIN, location.hash); } catch {}
    location.replace('#/welcome');
    return;
  }
  // Signed-in students land on their dashboard instead of the marketing page.
  const m = match(path === '/' && store.user() ? '/dashboard' : path) || match('/');
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  document.body.classList.remove('testing', 'nav-open');
  $('#nav').innerHTML = navHTML(path === '/' && store.user() ? '/dashboard' : path);
  // Swap in a fresh <main> so click handlers that views attach to it don't pile up across visits.
  const old = $('#main'), main = old.dataset.shell ? old : old.cloneNode(false);
  if (main !== old) old.replaceWith(main);
  scrollTo(0, 0);
  try { cleanup = (tabGroup(m.pat) ? tabShell(main, m, tabGroup(m.pat)[1]) : m.view(main, m.params)) || null; }
  catch (e) { console.error(e); main.innerHTML = `<div class="page narrow"><h1>Something went wrong</h1><pre class="err">${esc(e.stack || e)}</pre><a class="btn" href="#/">Go home</a></div>`; }
  delete main.dataset.shell;
  const title = { '/': store.user() ? 'Dashboard' : 'Free Study Material for School', '/learn': 'Free Courses', '/privacy': 'Privacy Policy', '/terms': 'Terms of Use', '/speed': 'Speed Practice', '/donate': 'Donate', '/news': 'News', '/contact': 'Contact', '/about': 'About', '/contributors': 'Contributors', '/admin': 'Admin', '/welcome': 'Welcome', '/too-young': 'Welcome' }[path] || (path.startsWith('/learn') ? 'Free Courses' : path.startsWith('/ap') ? 'AP Practice' : null) || path.split('/')[1]?.replace(/^\w/, (c) => c.toUpperCase());
  document.title = `${BRAND} · ${title || 'Free Study Material for School'}`;
}

// Ask the server for this student's user number once per sign-in (cached in settings for sharing).
let memberFor = null;
function syncMember() {
  const u = store.user();
  if (!u?.cloud) { memberFor = null; return; }
  if (memberFor === u.id) return;
  memberFor = u.id;
  // If the server isn't ready yet (session still restoring), try again shortly.
  loadMember(db()).then((m) => { if (!m && store.user()?.id === u.id) { memberFor = null; setTimeout(syncMember, 15000); } });
}

// Social accounts from Admin console > Socials (content_settings.socials).
const footSocials = () => socials().map((l) => `<a class="foot-ig" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.icon)}${esc(l.label)}${l.label.startsWith('@') ? ` on ${esc(l.name)}` : ''}</a>`).join('');

function boot() {
  captureRef();
  const footer = `<footer class="site-foot"><div class="foot-inner">
      <div class="foot-brand"><b>${BRAND}</b><p>Free study material for school and the SAT and ACT. No ads, no paywalls, no limits.</p>
        <p class="foot-credit" id="footCredit"><a href="#/contributors">${esc(creditLine() || `Made by ${CREATOR}.`)}</a></p>
        <span id="footSocials">${footSocials()}</span>
        <a class="foot-ig" href="mailto:${CREATOR_EMAIL}">${icon('mail')}Contact ${CREATOR}: ${CREATOR_EMAIL}</a>
        <a class="foot-ig" href="mailto:support@studyfox.org">${icon('mail')}Support: support@studyfox.org</a>
        <a class="foot-ig" href="${KOFI}" target="_blank" rel="noopener">${icon('heart')}Support StudyFox on Ko-fi</a>
        <a class="foot-ig" id="iosLink" href="#" target="_blank" rel="noopener" hidden>${icon('down')}Download on iOS</a></div>
      <nav class="foot-links" aria-label="Study guides"><a href="/courses/">All study guides</a><a href="/ap/">AP study guides</a><a href="/sat-act/">SAT &amp; ACT guides</a><a href="/flashcards/">Flashcard decks</a><a href="/sitemap/">Site map</a></nav>
      <nav class="foot-links" aria-label="Footer"><a href="#/news">News</a><a href="#/about">About</a><a href="#/contributors">Contributors</a><a href="#/contact">Contact</a><a href="#/donate">Donate</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></nav>
      <p class="foot-legal">SAT®, AP®, and ACT® are trademarks of their respective owners, which are not affiliated with and do not endorse this site. Questions are original and generated for practice; scores are estimates.</p>
    </div></footer>`;
  // index.html may already show the nav and home hero (data-shell); keep them and add the footer.
  if ($('#main[data-shell]')) { $('#nav').removeAttribute('data-shell'); document.body.insertAdjacentHTML('beforeend', footer); }
  else document.body.innerHTML = `<header id="nav" class="nav"></header><main id="main"></main>` + footer;
  applyTheme();
  applyA11y();
  initI18n();
  initCloud();
  document.addEventListener('click', (e) => {
    if (e.target.closest('#shareBtn')) return openShare(store.user() ? 'streak' : 'site');
    if (e.target.closest('#themeBtn')) {
      const s = store.data().settings;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      s.theme = dark ? 'light' : 'dark'; store.save(); applyTheme();
    }
    if (e.target.closest('#menuBtn')) document.body.classList.toggle('nav-open');
    else if (e.target.closest('#navLinks a')) document.body.classList.remove('nav-open');
  });
  store.onChange(() => { applyTheme(); applyA11y(); const p = (location.hash.slice(1) || '/').split('?')[0]; if (!['/privacy', '/terms', '/login', '/signup', '/welcome'].includes(p)) requireAgreement(); if (needsOnboarding() && !['/welcome', '/privacy', '/terms'].includes(p)) location.replace('#/welcome'); $('#nav').innerHTML = navHTML((location.hash.slice(1) || '/').split('?')[0]); });
  store.onChange(syncMember);
  syncMember();
  onContent(() => { const f = $('#footCredit a'); const t = creditLine(); if (f && t) f.textContent = t; const so = $('#footSocials'); if (so) so.innerHTML = footSocials(); });
  addEventListener('hashchange', router);
  // Courses, lessons, decks, and custom questions come from Supabase (editable in the admin console).
  // The saved copy shows immediately; if the server has newer content, redraw pages that show it.
  initContent(db()).then((changed) => {
    const p = (location.hash.slice(1) || '/').split('?')[0];
    // The signed-out home page only lists courses, which match the built-in copy; skip redrawing it.
    if (changed && /^\/($|learn|flashcards$|practice|dashboard)/.test(p) && !(p === '/' && !store.user())) router();
  });
  router();
  const refresh =() => Promise.all([fetchStatus().catch(() => null), isAdmin()]).then(([st, a]) => {
    const changed = !!st?.maintenance !== !!status?.maintenance || a !== admin;
    status = st; admin = a;
    const ios = $('#iosLink');
    if (st?.ios_app_url) ios.href = st.ios_app_url;
    ios.hidden = !st?.ios_app_url;
    if (changed) router();
  });
  refresh();
  setInterval(refresh, 60000);
  // Pop-up announcements from the admin console: shortly after load, and again every few minutes.
  setTimeout(() => checkAnnouncements().catch(() => {}), 1500);
  setInterval(() => checkAnnouncements().catch(() => {}), 5 * 60000);
  addEventListener('hashchange', () => setTimeout(() => checkAnnouncements().catch(() => {}), 800), { once: true });
  store.onChange(() => isAdmin().then((a) => { if (a !== admin) { admin = a; router(); } }));
}

if (window.katex) boot();
else addEventListener('load', boot);
