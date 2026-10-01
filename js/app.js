// App shell: navigation, theme, and a tiny hash router.
import { icon } from './icons.js';
import { $, esc } from './util.js';
import { store } from './store.js';
import { initI18n } from './i18n.js';
import { homeView } from './views/home.js';
import { loginView, signupView, settingsView, requireAgreement } from './views/account.js';
import { dashboardView } from './views/dashboard.js';
import { practiceView, reviewView } from './views/practice.js';
import { examsView } from './views/exams.js';
import { resultsView } from './views/results.js';
import { runnerView } from './views/runner.js';
import { libraryView, setView, editView, learnView, testView, matchView, importView } from './views/flashcards.js';
import { formulasView, calculatorView } from './views/formulas.js';
import { speedView } from './views/speed.js';
import { learnHubView, courseView, lessonView } from './views/learn.js';
import { privacyView, termsView } from './views/legal.js';
import { initCloud } from './cloud.js';
import { welcomeView, ageBlockedView, ageBlockedUntil, needsOnboarding } from './views/welcome.js';
import { CREATOR, INSTAGRAM } from './config.js';

export const BRAND = 'StudyFox';

const routes = [
  ['/', homeView], ['/login', loginView], ['/signup', signupView], ['/settings', settingsView],
  ['/dashboard', dashboardView], ['/practice', practiceView], ['/review', reviewView], ['/exams', examsView],
  ['/test', runnerView], ['/results/:id', resultsView],
  ['/flashcards', libraryView], ['/flashcards/new', editView], ['/flashcards/:id', setView], ['/flashcards/:id/edit', editView],
  ['/flashcards/:id/learn', learnView], ['/flashcards/:id/test', testView], ['/flashcards/:id/match', matchView], ['/share/:data', importView],
  ['/learn', learnHubView], ['/learn/:course', courseView], ['/learn/:course/:lesson', lessonView],
  ['/formulas', formulasView], ['/calculator', calculatorView], ['/speed', speedView],
  ['/privacy', privacyView], ['/terms', termsView], ['/welcome', welcomeView], ['/too-young', ageBlockedView],
];

function match(path) {
  for (const [pat, view] of routes) {
    const a = pat.split('/'), b = path.split('/');
    if (a.length !== b.length) continue;
    const params = {};
    if (a.every((seg, i) => (seg.startsWith(':') ? ((params[seg.slice(1)] = decodeURIComponent(b[i])), true) : seg === b[i]))) return { view, params };
  }
  return null;
}

function applyTheme() {
  const t = store.data().settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function navHTML(path) {
  const u = store.user();
  const link = (href, label) => `<a href="#${href}" class="${path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''}">${label}</a>`;
  return `<div class="nav-inner">
    <a href="#/" class="brand" aria-label="${BRAND} home"><svg class="logo" viewBox="-2 2 70 62" aria-hidden="true"><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#f9a825"/><path d="M10 36l22 24 22-24-12-4-10 9-10-9z" fill="#fff8ec"/><path d="M26.5 54h11L32 60z" fill="#1a1a1a"/><circle cx="23" cy="28" r="3" fill="#1a1a1a"/><circle cx="41" cy="28" r="3" fill="#1a1a1a"/></svg><span>Study<span class="brand-fox">Fox</span></span></a>
    <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${icon('menu')}</button>
    <nav class="links" id="navLinks">
      ${link('/learn', 'Courses')}${link('/flashcards', 'Flashcards')}${link('/practice', 'SAT & ACT')}${link('/exams', 'Tests')}${link('/speed', 'Speed')}${link('/formulas', 'Formulas')}${link('/calculator', 'Calculator')}${link('/dashboard', 'Dashboard')}
    </nav>
    <div class="nav-right">
      <button class="icon-btn" id="themeBtn" title="Toggle dark mode" aria-label="Toggle dark mode">${icon('contrast')}</button>
      ${u ? `<a class="avatar" href="#/settings" title="${esc(u.name)}">${esc(u.name[0].toUpperCase())}</a>` : `<a class="btn sm ghost" href="#/login">Log in</a><a class="btn sm primary" href="#/signup">Sign up free</a>`}
    </div>
  </div>`;
}

// Everything except these pages needs an account; guests are sent to sign in, then returned.
const PUBLIC = ['/', '/login', '/signup', '/privacy', '/terms', '/too-young'];
export const AFTER_LOGIN = 'sf_after_login';

let cleanup = null;
function router() {
  const path = (location.hash.slice(1) || '/').split('?')[0];
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
  const m = match(path) || match('/');
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  document.body.classList.remove('testing', 'nav-open');
  $('#nav').innerHTML = navHTML(path);
  const main = $('#main');
  main.innerHTML = '';
  scrollTo(0, 0);
  try { cleanup = m.view(main, m.params) || null; }
  catch (e) { console.error(e); main.innerHTML = `<div class="page narrow"><h1>Something went wrong</h1><pre class="err">${esc(e.stack || e)}</pre><a class="btn" href="#/">Go home</a></div>`; }
  const title = { '/': 'Free Study Material for School', '/learn': 'Free Courses', '/privacy': 'Privacy Policy', '/terms': 'Terms of Use', '/speed': 'Speed Practice', '/welcome': 'Welcome', '/too-young': 'Welcome' }[path] || (path.startsWith('/learn') ? 'Free Courses' : null) || path.split('/')[1]?.replace(/^\w/, (c) => c.toUpperCase());
  document.title = `${BRAND} · ${title || 'Free Study Material for School'}`;
}

function boot() {
  document.body.innerHTML = `<header id="nav" class="nav"></header><main id="main"></main>
    <footer class="site-foot"><div class="foot-inner">
      <div class="foot-brand"><b>${BRAND}</b><p>Free study material for school and the SAT and ACT, made by ${CREATOR}. No ads, no paywalls, no limits.</p>
        <a class="foot-ig" href="https://instagram.com/${INSTAGRAM}" target="_blank" rel="noopener">${icon('instagram')}@${INSTAGRAM}</a></div>
      <nav class="foot-links" aria-label="Footer"><a href="#/learn">Courses</a><a href="#/practice">SAT &amp; ACT</a><a href="#/flashcards">Flashcards</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></nav>
      <p class="foot-legal">SAT®, AP®, and ACT® are trademarks of their respective owners, which are not affiliated with and do not endorse this site. Questions are original and generated for practice; scores are estimates.</p>
    </div></footer>`;
  applyTheme();
  initI18n();
  initCloud();
  document.addEventListener('click', (e) => {
    if (e.target.closest('#themeBtn')) {
      const s = store.data().settings;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      s.theme = dark ? 'light' : 'dark'; store.save(); applyTheme();
    }
    if (e.target.closest('#menuBtn')) document.body.classList.toggle('nav-open');
    else if (e.target.closest('#navLinks a')) document.body.classList.remove('nav-open');
  });
  store.onChange(() => { applyTheme(); const p = (location.hash.slice(1) || '/').split('?')[0]; if (!['/privacy', '/terms', '/login', '/signup', '/welcome'].includes(p)) requireAgreement(); if (needsOnboarding() && !['/welcome', '/privacy', '/terms'].includes(p)) location.replace('#/welcome'); $('#nav').innerHTML = navHTML((location.hash.slice(1) || '/').split('?')[0]); });
  addEventListener('hashchange', router);
  router();
}

if (window.katex) boot();
else addEventListener('load', boot);
