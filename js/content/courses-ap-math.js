// AP Precalculus, plus the AP Calculus exam guide and BC-only topics.
// The existing Calculus and Statistics courses (courses-math.js) cover Calculus AB and AP Statistics content.
import { rule, table, tip, worked } from './lesson-kit.js';

export const AP_MATH_COURSES = [
  {
    id: 'ap-precalc',
    subject: 'Math',
    ap: true,
    icon: 'chart',
    title: 'AP Precalculus',
    blurb: 'Polynomial, rational, exponential, logarithmic, trigonometric, and polar functions, modeled with real data the way the AP exam asks.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam: format and calculator rules',
        mins: 5,
        body: `
${table(['Section', 'Questions', 'Time', 'Calculator', 'Weight'], [
  ['Multiple choice, Part A', '28', '80 min', 'No', '62.5% (both parts)'],
  ['Multiple choice, Part B', '12', '40 min', 'Yes', ''],
  ['Free response, Part A', '2', '30 min', 'Yes', '37.5% (both parts)'],
  ['Free response, Part B', '2', '30 min', 'No', ''],
])}
<p>Units 1 to 3 are tested. Unit 4 (parameters, vectors, and matrices) is taught in many classes but is not on the exam.</p>
${tip('A graphing calculator is required for the calculator sections. Practice finding zeros, intersections, and regressions quickly. You can also use the free <a href="#/calculator">Desmos calculator</a> to practice.')}`,
        check: { q: 'Which unit is NOT on the AP Precalculus exam?', choices: ['Unit 1: Polynomial and rational functions', 'Unit 2: Exponential and logarithmic functions', 'Unit 3: Trigonometric and polar functions', 'Unit 4: Parameters, vectors, and matrices'], answer: 3, why: 'Unit 4 is optional course content and is not assessed on the exam.' },
      },
      {
        id: 'rates',
        title: 'Unit 1A: Functions and rates of change',
        mins: 7,
        body: `
<ul>
  <li><b>Increasing and decreasing:</b> a function is increasing on an interval if output rises as input rises.</li>
  <li><b>Average rate of change</b> on $[a, b]$ is $\\frac{f(b) - f(a)}{b - a}$, the slope of the secant line.</li>
  <li><b>Concavity:</b> concave up when the rate of change is increasing (the graph bends upward); concave down when it is decreasing.</li>
  <li><b>Points of inflection</b> are where concavity changes.</li>
  <li><b>Linear functions</b> have a constant rate of change; <b>quadratic</b> functions have rates of change that change at a constant rate.</li>
</ul>
${worked('Example', '<p>$f(x) = x^2$ on $[1, 3]$: average rate of change $= \\frac{9 - 1}{3 - 1} = 4$.</p>')}`,
        desmos: ['f(x)=x^2', '(1,f(1))', '(3,f(3))', 'y-1=4(x-1)'],
        check: { q: 'What is the average rate of change of $f(x) = x^3$ on $[0, 2]$?', choices: ['$2$', '$4$', '$6$', '$8$'], answer: 1, why: '$\\frac{f(2) - f(0)}{2 - 0} = \\frac{8 - 0}{2} = 4$.' },
      },
      {
        id: 'poly-rational',
        title: 'Unit 1B: Polynomial and rational functions',
        mins: 9,
        body: `
<h3>Polynomials</h3>
<ul>
  <li>A degree-n polynomial has at most n real zeros and at most n − 1 turning points.</li>
  <li><b>Multiplicity:</b> an odd-multiplicity zero crosses the x-axis; an even one touches and turns.</li>
  <li><b>End behavior</b> depends on the leading term: even degree with positive leading coefficient goes up on both ends.</li>
  <li>Complex zeros come in conjugate pairs.</li>
</ul>
<h3>Rational functions</h3>
<ul>
  <li><b>Vertical asymptotes</b> at zeros of the denominator that don't cancel. Zeros that cancel make <b>holes</b>.</li>
  <li><b>Horizontal asymptotes:</b> compare degrees. Bottom bigger: $y = 0$. Same: ratio of leading coefficients. Top bigger by one: a slant asymptote.</li>
</ul>
${worked('Example', '<p>$r(x) = \\frac{(x - 2)(x + 1)}{(x - 2)(x - 3)}$ has a hole at $x = 2$, a vertical asymptote at $x = 3$, and a horizontal asymptote at $y = 1$.</p>')}`,
        desmos: ['r(x)=\\frac{(x-2)(x+1)}{(x-2)(x-3)}'],
        check: { q: 'What is the horizontal asymptote of $\\frac{3x^2 + 1}{x^2 - 4}$?', choices: ['$y = 0$', '$y = 3$', '$y = \\frac{1}{4}$', 'None'], answer: 1, why: 'The degrees are equal, so the asymptote is the ratio of leading coefficients: $\\frac{3}{1} = 3$.' },
      },
      {
        id: 'transform',
        title: 'Unit 1C: Transformations and modeling',
        mins: 7,
        body: `
<ul>
  <li>$g(x) = af(b(x - h)) + k$: $a$ stretches vertically (and reflects if negative), $b$ compresses horizontally by a factor of $\\frac{1}{b}$, $h$ shifts right, $k$ shifts up.</li>
  <li><b>Modeling:</b> choose a function type that matches the data's behavior (constant rate: linear; constant change in rate: quadratic; turning points: polynomial).</li>
  <li><b>Piecewise functions</b> model situations with different rules over different intervals.</li>
  <li>State assumptions and limitations: a model may only be valid over a certain domain.</li>
</ul>`,
        check: { q: 'How does $g(x) = f(x - 3) + 2$ compare to $f$?', choices: ['Left 3, up 2', 'Right 3, up 2', 'Right 3, down 2', 'Left 3, down 2'], answer: 1, why: 'Subtracting 3 inside shifts right 3; adding 2 outside shifts up 2.' },
      },
      {
        id: 'exponential',
        title: 'Unit 2A: Exponential functions and sequences',
        mins: 8,
        body: `
<ul>
  <li><b>Arithmetic sequences</b> add a constant: $a_n = a_0 + dn$. <b>Geometric sequences</b> multiply by a constant: $g_n = g_0r^n$.</li>
  <li><b>Exponential functions</b> $f(x) = ab^x$: over equal-length input intervals, outputs change by a constant <b>ratio</b>. Growth if $b > 1$; decay if $0 < b < 1$.</li>
  <li><b>Percent change:</b> growing 6% per year gives $b = 1.06$; decaying 6% gives $b = 0.94$.</li>
  <li><b>Natural base:</b> $e \\approx 2.718$; continuous growth $A = Pe^{rt}$.</li>
  <li><b>Composition and inverses:</b> $f(g(x))$; an inverse swaps inputs and outputs.</li>
</ul>
${rule('Equal differences in outputs means linear. Equal ratios in outputs means exponential. Check a data table both ways.')}`,
        check: { q: 'A table shows outputs 5, 15, 45, 135 for inputs 0, 1, 2, 3. Which model fits?', choices: ['Linear', 'Quadratic', 'Exponential with $b = 3$', 'Exponential with $b = 10$'], answer: 2, why: 'Each output is 3 times the previous one, a constant ratio, so $f(x) = 5 \\cdot 3^x$.' },
      },
      {
        id: 'logs',
        title: 'Unit 2B: Logarithms',
        mins: 8,
        body: `
<ul>
  <li>$\\log_b a = c$ means $b^c = a$. Logarithms are inverses of exponentials.</li>
  <li><b>Properties:</b> $\\log_b(xy) = \\log_b x + \\log_b y$, $\\log_b\\frac{x}{y} = \\log_b x - \\log_b y$, $\\log_b x^n = n\\log_b x$.</li>
  <li><b>Change of base:</b> $\\log_b x = \\frac{\\ln x}{\\ln b}$.</li>
  <li>Solve exponential equations by taking a log of both sides.</li>
  <li><b>Semi-log plots:</b> if data is exponential, plotting $\\log y$ against $x$ gives a line.</li>
</ul>
${worked('Example', '<p>Solve $2^x = 20$: $x = \\frac{\\ln 20}{\\ln 2} \\approx 4.32$.</p>')}`,
        check: { q: 'What is $\\log_2 32$?', choices: ['$4$', '$5$', '$16$', '$6$'], answer: 1, why: '$2^5 = 32$, so $\\log_2 32 = 5$.' },
      },
      {
        id: 'trig',
        title: 'Unit 3A: Periodic and sinusoidal functions',
        mins: 9,
        body: `
<ul>
  <li><b>Radians:</b> $\\pi$ radians $= 180°$. On the unit circle, a point at angle θ is $(\\cos\\theta, \\sin\\theta)$.</li>
  <li><b>Sinusoidal functions:</b> $f(\\theta) = a\\sin(b(\\theta + c)) + d$. Amplitude $|a|$, period $\\frac{2\\pi}{|b|}$, phase shift $-c$, midline $y = d$.</li>
  <li><b>Modeling:</b> find the max and min. Amplitude = (max − min) ÷ 2; midline = (max + min) ÷ 2. Period from the time between peaks.</li>
  <li><b>Identities:</b> $\\sin^2\\theta + \\cos^2\\theta = 1$; sum and double-angle formulas.</li>
</ul>
${worked('Example', '<p>A Ferris wheel goes from 2 m to 42 m every 8 minutes. Amplitude 20, midline 22, period 8, so $b = \\frac{2\\pi}{8} = \\frac{\\pi}{4}$.</p>')}`,
        desmos: ['h(t)=-20\\cos(\\frac{\\pi}{4}t)+22'],
        check: { q: 'What is the period of $f(x) = 3\\sin(4x)$?', choices: ['$4$', '$\\frac{\\pi}{2}$', '$2\\pi$', '$8\\pi$'], answer: 1, why: 'Period $= \\frac{2\\pi}{4} = \\frac{\\pi}{2}$.' },
      },
      {
        id: 'polar',
        title: 'Unit 3B: Tangent, inverse trig, and polar functions',
        mins: 8,
        body: `
<ul>
  <li>$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$, period $\\pi$, with vertical asymptotes where $\\cos\\theta = 0$.</li>
  <li><b>Inverse trig:</b> $\\sin^{-1}$ and $\\tan^{-1}$ return angles in $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$; $\\cos^{-1}$ returns angles in $[0, \\pi]$.</li>
  <li><b>Reciprocal functions:</b> $\\csc$, $\\sec$, $\\cot$.</li>
  <li><b>Polar coordinates</b> $(r, \\theta)$: $x = r\\cos\\theta$, $y = r\\sin\\theta$, $r^2 = x^2 + y^2$.</li>
  <li><b>Polar graphs:</b> circles ($r = a\\cos\\theta$), roses ($r = a\\sin(n\\theta)$), and limaçons ($r = a + b\\cos\\theta$). When $r$ is increasing, the graph moves away from the origin.</li>
</ul>`,
        desmos: ['r=3\\sin(2\\theta)'],
        check: { q: 'Convert the polar point $(2, \\frac{\\pi}{2})$ to rectangular coordinates.', choices: ['$(2, 0)$', '$(0, 2)$', '$(0, -2)$', '$(\\sqrt{2}, \\sqrt{2})$'], answer: 1, why: '$x = 2\\cos\\frac{\\pi}{2} = 0$ and $y = 2\\sin\\frac{\\pi}{2} = 2$.' },
      },
      {
        id: 'unit4',
        title: 'Unit 4: Parameters, vectors, and matrices',
        mins: 7,
        body: `
<p>Not on the exam, but taught in many classes and useful for calculus.</p>
<ul>
  <li><b>Parametric functions:</b> $x(t)$ and $y(t)$ describe motion along a path.</li>
  <li><b>Vectors:</b> magnitude $\\|\\langle a, b\\rangle\\| = \\sqrt{a^2 + b^2}$; add component by component; dot product $\\langle a, b \\rangle \\cdot \\langle c, d \\rangle = ac + bd$.</li>
  <li><b>Matrices:</b> multiply rows by columns. The determinant of $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ is $ad - bc$; a matrix has an inverse only if its determinant isn't 0.</li>
  <li>Matrices can represent linear transformations (rotations, reflections) and transition models.</li>
</ul>`,
        check: { q: 'What is the magnitude of the vector $\\langle 3, 4 \\rangle$?', choices: ['$5$', '$7$', '$12$', '$25$'], answer: 0, why: '$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.' },
      },
    ],
  },

  {
    id: 'ap-calc-bc',
    subject: 'Math',
    ap: true,
    icon: 'integral',
    title: 'AP Calculus: Exam Guide and BC Topics',
    blurb: 'How the AP Calculus AB and BC exams work, plus the BC-only topics: integration techniques, parametric and polar calculus, and infinite series.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The AB and BC exams',
        mins: 6,
        body: `
${table(['Section', 'Questions', 'Time', 'Calculator'], [
  ['Multiple choice, Part A', '30', '60 min', 'No'],
  ['Multiple choice, Part B', '15', '45 min', 'Yes'],
  ['Free response, Part A', '2', '30 min', 'Yes'],
  ['Free response, Part B', '4', '60 min', 'No'],
])}
<p>Multiple choice and free response are each 50%. BC covers all of AB plus about 40% more; BC students also get an AB subscore.</p>
<ul>
  <li><b>Show your setup:</b> write the integral or derivative before using a calculator. A bare number gets little credit.</li>
  <li><b>Units and meaning:</b> many FRQs ask what a value means in context, with units.</li>
  <li><b>Justify</b> using theorems by name: Mean Value Theorem, Intermediate Value Theorem, Extreme Value Theorem, and the first and second derivative tests.</li>
</ul>
${tip('Review AB content in the <a href="#/learn/calculus">Calculus</a> course first, then come back for the BC topics below.')}`,
        check: { q: 'On a calculator-active FRQ, what should you write before giving a numerical answer?', choices: ['Nothing', 'The integral or expression you entered', 'Your calculator model', 'Only the units'], answer: 1, why: 'Graders need to see the setup. A number alone usually earns at most partial credit.' },
      },
      {
        id: 'techniques',
        title: 'Integration techniques (BC)',
        mins: 9,
        body: `
<ul>
  <li><b>Integration by parts:</b> $\\int u\\,dv = uv - \\int v\\,du$. Pick $u$ using LIATE (logs, inverse trig, algebraic, trig, exponential).</li>
  <li><b>Partial fractions</b> (nonrepeating linear factors): $\\frac{1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}$.</li>
  <li><b>Improper integrals:</b> replace the infinite bound with a limit. $\\int_1^\\infty \\frac{1}{x^p}dx$ converges only if $p > 1$.</li>
  <li><b>Euler's method</b> approximates solutions to differential equations: $y_{new} = y + \\frac{dy}{dx}\\Delta x$.</li>
  <li><b>Logistic growth:</b> $\\frac{dP}{dt} = kP(1 - \\frac{P}{L})$. Growth is fastest at $P = \\frac{L}{2}$.</li>
</ul>
${worked('Example', '<p>$\\int xe^x\\,dx$: let $u = x$, $dv = e^x dx$. Then $= xe^x - \\int e^x dx = xe^x - e^x + C$.</p>')}`,
        check: { q: 'Does $\\int_1^\\infty \\frac{1}{x^2}dx$ converge?', choices: ['Yes, to $1$', 'Yes, to $2$', 'No, it diverges', 'Yes, to $\\frac{1}{2}$'], answer: 0, why: '$\\lim_{b\\to\\infty}[-\\frac{1}{x}]_1^b = 0 - (-1) = 1$.' },
      },
      {
        id: 'parametric',
        title: 'Parametric, vector, and polar calculus (BC)',
        mins: 9,
        body: `
<ul>
  <li><b>Parametric slope:</b> $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$. Second derivative: $\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}(dy/dx)}{dx/dt}$.</li>
  <li><b>Arc length:</b> $\\int_a^b \\sqrt{(x'(t))^2 + (y'(t))^2}\\,dt$.</li>
  <li><b>Motion with vectors:</b> velocity $\\langle x'(t), y'(t)\\rangle$; speed is its magnitude; total distance is the integral of speed.</li>
  <li><b>Polar area:</b> $A = \\frac{1}{2}\\int_\\alpha^\\beta r^2\\,d\\theta$.</li>
  <li><b>Polar slope:</b> use $x = r\\cos\\theta$, $y = r\\sin\\theta$ and the parametric formula.</li>
</ul>`,
        check: { q: 'If $x = t^2$ and $y = t^3$, what is $\\frac{dy}{dx}$?', choices: ['$\\frac{3t}{2}$', '$\\frac{2}{3t}$', '$6t^2$', '$t$'], answer: 0, why: '$\\frac{dy}{dx} = \\frac{3t^2}{2t} = \\frac{3t}{2}$.' },
      },
      {
        id: 'series-tests',
        title: 'Infinite series and convergence tests (BC)',
        mins: 10,
        body: `
<ul>
  <li><b>nth term test:</b> if $a_n \\not\\to 0$, the series diverges. (If $a_n \\to 0$, the test tells you nothing.)</li>
  <li><b>Geometric series:</b> $\\sum ar^n$ converges to $\\frac{a}{1 - r}$ if $|r| < 1$.</li>
  <li><b>p-series:</b> $\\sum\\frac{1}{n^p}$ converges if $p > 1$. The harmonic series ($p = 1$) diverges.</li>
  <li><b>Integral, comparison, and limit comparison tests.</b></li>
  <li><b>Alternating series test:</b> converges if terms decrease in size to 0. Error bound: less than the first omitted term.</li>
  <li><b>Ratio test:</b> $\\lim\\left|\\frac{a_{n+1}}{a_n}\\right| < 1$ converges; $> 1$ diverges; $= 1$ is inconclusive.</li>
  <li><b>Absolute vs. conditional convergence:</b> $\\sum\\frac{(-1)^n}{n}$ converges conditionally.</li>
</ul>`,
        check: { q: 'What is the sum of $\\sum_{n=0}^{\\infty} 3\\left(\\frac{1}{2}\\right)^n$?', choices: ['$3$', '$6$', '$\\frac{3}{2}$', 'It diverges'], answer: 1, why: 'Geometric with $a = 3$ and $r = \\frac{1}{2}$: sum $= \\frac{3}{1 - 1/2} = 6$.' },
      },
      {
        id: 'taylor',
        title: 'Taylor and power series (BC)',
        mins: 10,
        body: `
<ul>
  <li><b>Taylor polynomial</b> centered at $a$: $f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\ldots$ (Maclaurin if $a = 0$).</li>
  <li><b>Series to know:</b>
    <ul>
      <li>$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\ldots$</li>
      <li>$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\ldots$</li>
      <li>$\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\ldots$</li>
      <li>$\\frac{1}{1 - x} = 1 + x + x^2 + \\ldots$ for $|x| < 1$</li>
    </ul>
  </li>
  <li><b>Interval of convergence:</b> use the ratio test, then check each endpoint separately.</li>
  <li><b>Lagrange error bound:</b> $|R_n(x)| \\le \\frac{M}{(n+1)!}|x - a|^{n+1}$, where $M$ bounds $|f^{(n+1)}|$.</li>
  <li>You can differentiate, integrate, and substitute into known series term by term.</li>
</ul>`,
        check: { q: 'What is the coefficient of $x^3$ in the Maclaurin series for $e^x$?', choices: ['$1$', '$\\frac{1}{3}$', '$\\frac{1}{6}$', '$3$'], answer: 2, why: 'The term is $\\frac{x^3}{3!} = \\frac{x^3}{6}$.' },
      },
    ],
  },
];
