// Test-day look: SAT, ACT, and AP practice can switch to a plain, exam-style screen (white page,
// black text, test-like fonts and answer bubbles) so practice feels like the real thing.
// Settings > Practice look picks the default; the switch in each practice session changes it for
// that session only. No logos or names of the testing organizations are shown.
import { store } from './store.js';

/** 'studyfox' (normal), 'match' (pick by test), 'digital' (SAT/AP style), or 'act'. */
export const practiceLook = () => store.data().settings.practiceLook || 'studyfox';

/** The exam style for this test: 'digital' for SAT and AP, 'act' for ACT, unless Settings picks one. */
export function lookStyle(test) {
  const p = practiceLook();
  if (p === 'digital' || p === 'act') return p;
  return /act/i.test(test || '') ? 'act' : 'digital';
}
/** Whether a new session starts in the test-day look. */
export const lookOnByDefault = () => practiceLook() !== 'studyfox';

export function setLook(style) {
  document.body.classList.remove('look-digital', 'look-act');
  if (style) document.body.classList.add('look-' + style);
}

export const lookSwitchHTML = (on, test) => `<button type="button" class="look-switch" role="switch" aria-checked="${on}" data-act="look"
  title="Make this session look like the real ${/act/i.test(test || '') ? 'ACT' : test === 'AP' ? 'AP exam' : 'SAT'}"><span class="ls-track"><span class="ls-knob"></span></span><span class="ls-label">Test-day look</span></button>`;

export const LOOK_OPTIONS = [
  ['studyfox', 'StudyFox (normal)'],
  ['match', 'Test-day look, matched to each test'],
  ['digital', 'Test-day look: digital SAT and AP style'],
  ['act', 'Test-day look: ACT style'],
];
