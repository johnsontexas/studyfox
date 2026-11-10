// Why each answer choice is right or wrong. Shared by the website and the iOS app (no DOM).
//
// Order of preference for a choice's explanation:
//   1. A hand-written one (questions.choice_expl / ap_questions.choice_expl / a lesson block's choice.why).
//   2. For number answers, a detected slip: the wrong number is the right one with its sign flipped,
//      off by one, doubled, flipped upside down, and so on (question_feedback.auto_detect_mistakes).
//   3. Nothing: the page shows the main explanation instead.
import { setting } from './content/settings.js';

const FRAC = /\\d?frac\{(-?[\d.]+)\}\{(-?[\d.]+)\}/g;

/** The number a choice shows, or NaN if it isn't a plain number (fractions and percents count). */
export function choiceNumber(text) {
  let t = String(text ?? '').replace(/\$/g, '').replace(/\\left|\\right|\\,|\\!|\\ /g, '').replace(/[−–]/g, '-').trim();
  t = t.replace(/^-\s*\\d?frac/, '-\\frac').replace(FRAC, (_, a, b) => String(+a / +b));
  t = t.replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/\\%|%/g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/.test(t)) return NaN;
  return Number(t);
}

const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

/** A guess at the slip that turns the correct number into this wrong one, or ''. */
export function detectSlip(wrong, right) {
  const w = choiceNumber(wrong), c = choiceNumber(right);
  if (isNaN(w) || isNaN(c) || near(w, c)) return '';
  if (c !== 0 && near(w, -c)) return 'This has the right size but the wrong sign. A negative probably got dropped or flipped, often when moving a term across the equals sign or distributing a minus.';
  if (c !== 0 && w !== 0 && near(w, 1 / c)) return 'This is the reciprocal of the answer: the fraction got flipped, or the division went the wrong way.';
  if (near(w, 2 * c)) return 'This is double the answer. Check for a step where you should have divided by 2 (a triangle\'s area, an average, or the 2a in the quadratic formula).';
  if (c !== 0 && near(w, c / 2)) return 'This is half the answer. A factor of 2 got lost, or you divided by 2 one time too many.';
  if (c > 1 && near(w, c * c)) return 'This is the answer squared. You may have stopped one step early before taking a square root, or squared when you didn\'t need to.';
  if (c > 1 && near(w * w, c)) return 'This is the square root of the answer. Check whether the question wants the squared value.';
  if ([10, 100, 1000].some((k) => near(w, c * k) || near(w, c / k))) return 'The digits match but the decimal point moved. This usually comes from a percent, unit, or place-value conversion.';
  if (Number.isInteger(c) && Number.isInteger(w) && Math.abs(w - c) === 1) return 'This is off by one. Check whether the endpoints count, or redo the last bit of arithmetic.';
  if (c !== 0 && Math.abs(w - c) / Math.abs(c) < 0.06) return 'This is close, but not exact. It\'s usually what you get from rounding too early or estimating.';
  return '';
}

/**
 * Feedback for every choice of a multiple-choice question.
 * q: { choices, answer, choiceExpl?, expl? }. Returns [{ why, auto }] in choice order;
 * `auto` is true when the explanation was detected rather than written by hand.
 */
export function choiceNotes(q) {
  const cfg = setting('question_feedback');
  const hand = Array.isArray(q.choiceExpl) ? q.choiceExpl : [];
  return (q.choices || []).map((c, i) => {
    const h = String(hand[i] || '').trim();
    if (h) return { why: h, auto: false };
    if (i !== q.answer && cfg.auto_detect_mistakes) {
      const s = detectSlip(c, q.choices[q.answer]);
      if (s) return { why: s, auto: true };
    }
    return { why: '', auto: false };
  });
}

/** True if a question has anything to say about its individual choices. */
export const hasChoiceNotes = (q) => choiceNotes(q).some((n) => n.why);

/** Copy of a question's per-choice explanations put in a new choice order (order[i] = old index). */
export function reorderNotes(choiceExpl, order) {
  return Array.isArray(choiceExpl) ? order.map((i) => choiceExpl[i] ?? '') : choiceExpl;
}
