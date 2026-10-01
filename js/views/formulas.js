import { $, tex } from '../util.js';
import { referenceSheetHTML, mountCalculator } from '../tools.js';

const F = (name, f, note = '') => `<div class="fcell"><div class="fname">${name}</div><div class="fmath">${tex(`$${f}$`)}</div>${note ? `<div class="muted small">${note}</div>` : ''}</div>`;

const SECTIONS = [
  ['Lines & linear functions', [
    F('Slope', 'm = \\dfrac{y_2 - y_1}{x_2 - x_1}'), F('Slope-intercept form', 'y = mx + b'), F('Point-slope form', 'y - y_1 = m(x - x_1)'),
    F('Standard form', 'Ax + By = C', 'slope = −A/B'), F('Parallel / perpendicular', 'm_1 = m_2 \\quad / \\quad m_1 m_2 = -1'),
    F('Distance', 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}'), F('Midpoint', '\\left(\\tfrac{x_1 + x_2}{2}, \\tfrac{y_1 + y_2}{2}\\right)'),
    F('System with no solution', '\\tfrac{a_1}{a_2} = \\tfrac{b_1}{b_2} \\ne \\tfrac{c_1}{c_2}', 'parallel lines'), F('Infinitely many solutions', '\\tfrac{a_1}{a_2} = \\tfrac{b_1}{b_2} = \\tfrac{c_1}{c_2}', 'same line'),
  ]],
  ['Quadratics & polynomials', [
    F('Quadratic formula', 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'), F('Discriminant', 'b^2 - 4ac', '> 0: two real · = 0: one · < 0: none'),
    F('Vertex x-coordinate', 'x = -\\dfrac{b}{2a}'), F('Vertex form', 'y = a(x - h)^2 + k'), F('Factored form', 'y = a(x - r_1)(x - r_2)', 'x-intercepts r₁, r₂'),
    F('Sum & product of roots', 'r_1 + r_2 = -\\tfrac{b}{a}, \\quad r_1 r_2 = \\tfrac{c}{a}'), F('Difference of squares', 'a^2 - b^2 = (a + b)(a - b)'),
    F('Perfect squares', '(a \\pm b)^2 = a^2 \\pm 2ab + b^2'), F('Remainder theorem', 'p(a) = \\text{remainder of } p(x) \\div (x - a)'),
  ]],
  ['Exponents & exponential models', [
    F('Product / quotient', 'x^a x^b = x^{a+b}, \\quad \\tfrac{x^a}{x^b} = x^{a-b}'), F('Power of a power', '(x^a)^b = x^{ab}'), F('Negative & zero', 'x^{-a} = \\tfrac{1}{x^a}, \\quad x^0 = 1'),
    F('Rational exponents', 'x^{m/n} = \\sqrt[n]{x^m}'), F('Growth / decay', 'y = a(1 \\pm r)^t'), F('Doubling / half-life', 'y = a \\cdot 2^{t/d}, \\quad y = a \\left(\\tfrac{1}{2}\\right)^{t/h}'),
    F('Compound interest', 'A = P\\left(1 + \\tfrac{r}{n}\\right)^{nt}'),
  ]],
  ['Problem solving & data', [
    F('Percent change', '\\dfrac{\\text{new} - \\text{old}}{\\text{old}} \\times 100\\%'), F('Percent of', '\\text{part} = \\tfrac{p}{100} \\times \\text{whole}'), F('Successive changes', 'P(1 + r_1)(1 - r_2)', 'multiply, never add'),
    F('Mean', '\\bar{x} = \\dfrac{\\text{sum}}{n}'), F('Median', '\\text{middle value (average the middle two if } n \\text{ is even)}'), F('Probability', 'P = \\dfrac{\\text{favorable}}{\\text{total}}'),
    F('Conditional probability', 'P(A \\mid B) = \\dfrac{n(A \\text{ and } B)}{n(B)}'), F('Distance / rate / time', 'd = rt'), F('Margin of error', '\\text{estimate} \\pm \\text{MOE}'),
  ]],
  ['Geometry & trigonometry', [
    F('Circle equation', '(x - h)^2 + (y - k)^2 = r^2'), F('Arc length', '\\tfrac{\\theta}{360} \\cdot 2\\pi r'), F('Sector area', '\\tfrac{\\theta}{360} \\cdot \\pi r^2'),
    F('Radians', '\\text{rad} = \\text{deg} \\times \\tfrac{\\pi}{180}'), F('SOH-CAH-TOA', '\\sin = \\tfrac{O}{H}, \\ \\cos = \\tfrac{A}{H}, \\ \\tan = \\tfrac{O}{A}'), F('Cofunction', '\\sin\\theta = \\cos(90^\\circ - \\theta)'),
    F('Pythagorean identity', '\\sin^2\\theta + \\cos^2\\theta = 1'), F('Interior angle sum', '(n - 2) \\cdot 180^\\circ'), F('Similarity', '\\text{length} \\times k, \\ \\text{area} \\times k^2, \\ \\text{volume} \\times k^3'),
    F('Equilateral triangle area', 'A = \\tfrac{\\sqrt{3}}{4}s^2'), F('Trapezoid area', 'A = \\tfrac{1}{2}(b_1 + b_2)h'), F('Surface area of a cube', 'SA = 6s^2'),
  ]],
  ['ACT extras', [
    F('Arithmetic sequence', 'a_n = a_1 + (n - 1)d, \\quad S_n = \\tfrac{n(a_1 + a_n)}{2}'), F('Geometric sequence', 'a_n = a_1 r^{n-1}'), F('Logarithms', '\\log_b x = y \\iff b^y = x'),
    F('Log rules', '\\log(xy) = \\log x + \\log y, \\quad \\log x^n = n \\log x'), F('Complex numbers', 'i^2 = -1, \\ i^3 = -i, \\ i^4 = 1'), F('Determinant', '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc'),
    F('Permutations', '_nP_r = \\dfrac{n!}{(n - r)!}'), F('Combinations', '_nC_r = \\dfrac{n!}{r!(n - r)!}'), F('Law of sines', '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B}'),
    F('Law of cosines', 'c^2 = a^2 + b^2 - 2ab\\cos C'), F('Ellipse', '\\dfrac{(x - h)^2}{a^2} + \\dfrac{(y - k)^2}{b^2} = 1'), F('Unit circle', '(\\cos\\theta, \\sin\\theta)'),
  ]],
];

export function formulasView(root) {
  root.innerHTML = `
  <div class="page">
    <div class="row between wrap gap"><div><h1>Formula sheet</h1><p class="muted">The SAT gives you the reference sheet below. Everything after it you need to know by heart, and the ACT gives you no formulas at all.</p></div>
    <div class="row gap"><a class="btn" href="#/flashcards/builtin-math-formulas">Study as flashcards</a><button class="btn ghost" onclick="print()">Print</button></div></div>
    <div class="card"><h2 class="h3">SAT reference sheet <span class="tag">Provided on test day</span></h2>${referenceSheetHTML()}</div>
    ${SECTIONS.map(([t, cells]) => `<div class="card"><h2 class="h3">${t} ${t === 'ACT extras' ? '<span class="tag subtle">ACT only</span>' : '<span class="tag subtle">Memorize</span>'}</h2><div class="fgrid">${cells.join('')}</div></div>`).join('')}
  </div>`;
}

export function calculatorView(root) {
  let calc = null, alive = true;
  root.innerHTML = `
  <div class="page calc-page">
    <div class="row between wrap gap"><h1>Calculator</h1><div class="seg" id="kind"><button data-k="graphing" class="on">Graphing</button><button data-k="scientific">Scientific</button></div></div>
    <p class="muted small">The Desmos graphing calculator is built into the digital SAT. Practicing with it now means no surprises on test day.</p>
    <div id="calcHost" class="calc-full"><div class="calc-loading">Loading Desmos…</div></div>
  </div>`;
  async function show(kind) {
    calc?.destroy?.();
    const host = $('#calcHost', root);
    host.innerHTML = '';
    try { const c = await mountCalculator(host, kind); if (!alive) return c.destroy?.(); calc = c; }
    catch (e) { host.innerHTML = `<div class="calc-loading">${e.message}</div>`; }
  }
  $('#kind', root).addEventListener('click', (e) => {
    const k = e.target.dataset.k; if (!k) return;
    root.querySelectorAll('#kind button').forEach((b) => b.classList.toggle('on', b === e.target));
    show(k);
  });
  show('graphing');
  return () => { alive = false; calc?.destroy?.(); };
}
