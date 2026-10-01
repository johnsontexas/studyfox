// Math courses for school: Algebra 1 through Calculus, plus Statistics.
import { rule, tip, worked } from './lesson-kit.js';

export const MATH_COURSES = [
  {
    id: 'algebra-1',
    subject: 'Math',
    icon: 'puzzle',
    title: 'Algebra 1 Essentials',
    blurb: 'Expressions, equations, slope, systems, exponents, and quadratics: the foundation for every math class after it.',
    level: 'Grades 8 to 10',
    lessons: [
      {
        id: 'expressions',
        title: 'Expressions and order of operations',
        mins: 5,
        body: `
<p>An <b>expression</b> is a math phrase like $3x + 2$. You simplify expressions; you solve equations.</p>
<h3>Order of operations</h3>
${rule('Parentheses, then exponents, then multiplication and division <b>left to right</b>, then addition and subtraction <b>left to right</b>.')}
<p>Multiplication doesn't always come before division. In $12 \\div 3 \\times 2$, work left to right: $4 \\times 2 = 8$.</p>
<h3>Distributing and combining like terms</h3>
<p><b>Like terms</b> have the same variable raised to the same power: $4x$ and $-7x$ are like terms, but $4x$ and $4x^2$ are not.</p>
${worked('Example', `<p>Simplify $3(x + 4) - 2x$.</p><p>Distribute: $3x + 12 - 2x$. Combine like terms: $x + 12$.</p>`)}
${tip('A minus sign in front of parentheses flips every sign inside: $-(x - 5) = -x + 5$.')}`,
        check: { q: 'Simplify $2(3x - 1) + 4x$.', choices: ['$10x - 2$', '$10x - 1$', '$6x + 3$', '$10x + 2$'], answer: 0, why: 'Distribute: $6x - 2 + 4x$. Combine like terms: $10x - 2$.' },
      },
      {
        id: 'equations',
        title: 'Solving linear equations',
        mins: 6,
        body: `
${rule('Whatever you do to one side of an equation, do to the other. Undo operations in reverse order: first addition and subtraction, then multiplication and division.')}
${worked('Example', `<p>Solve $4x - 7 = 2x + 9$.</p><ol><li>Get the variables on one side: subtract $2x$ from both sides, giving $2x - 7 = 9$.</li><li>Add 7 to both sides: $2x = 16$.</li><li>Divide by 2: $x = 8$.</li></ol><p>Check: $4(8) - 7 = 25$ and $2(8) + 9 = 25$.</p>`)}
<h3>Special cases</h3>
<ul>
  <li>If the variables cancel and you get something false, like $3 = 5$, there is <b>no solution</b>.</li>
  <li>If they cancel and you get something always true, like $3 = 3$, there are <b>infinitely many solutions</b>.</li>
</ul>
${tip('Always plug your answer back into the original equation. It takes ten seconds and catches most mistakes.')}`,
        check: { q: 'Solve $5(x - 2) = 3x + 4$.', choices: ['$x = 3$', '$x = 7$', '$x = -3$', '$x = 14$'], answer: 1, why: 'Distribute: $5x - 10 = 3x + 4$. Subtract $3x$: $2x - 10 = 4$. Add 10: $2x = 14$, so $x = 7$.' },
      },
      {
        id: 'slope',
        title: 'Slope and linear functions',
        mins: 6,
        body: `
<p><b>Slope</b> measures how steep a line is: how much $y$ changes for each 1-unit increase in $x$.</p>
${rule('$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{\\text{rise}}{\\text{run}}$')}
<ul>
  <li>Positive slope goes up to the right; negative slope goes down.</li>
  <li>A horizontal line has slope 0. A vertical line has undefined slope.</li>
</ul>
<h3>Slope-intercept form</h3>
<p>$y = mx + b$, where $m$ is the slope and $b$ is the y-intercept (where the line crosses the y-axis).</p>
<p>In word problems, the slope is the <b>rate</b> (like dollars per hour) and the y-intercept is the <b>starting value</b>.</p>
${tip('Drag the $m$ and $b$ sliders below to see how each one changes the line.')}`,
        desmos: ['y=mx+b', 'm=2', 'b=1'],
        check: { q: 'What is the slope of the line through $(1, 3)$ and $(4, 9)$?', choices: ['$\\frac{1}{2}$', '$2$', '$3$', '$6$'], answer: 1, why: '$m = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$.' },
      },
      {
        id: 'systems',
        title: 'Systems of equations',
        mins: 6,
        body: `
<p>A <b>system</b> is two or more equations that must be true at the same time. The solution is the point where their graphs cross.</p>
<h3>Substitution</h3>
<p>Solve one equation for a variable, then plug that into the other equation. Best when a variable is already alone, like $y = 2x$.</p>
<h3>Elimination</h3>
<p>Add or subtract the equations so one variable cancels. Multiply an equation first if needed.</p>
${worked('Example', `<p>Solve $x + y = 10$ and $x - y = 4$.</p><p>Add the equations: $2x = 14$, so $x = 7$. Then $7 + y = 10$, so $y = 3$. The solution is $(7, 3)$.</p>`)}
${rule('One crossing point means one solution. Parallel lines mean no solution. The same line means infinitely many solutions.')}`,
        desmos: ['x+y=10', 'x-y=4'],
        check: { q: 'Solve the system $y = 2x$ and $x + y = 12$. What is $y$?', choices: ['$4$', '$6$', '$8$', '$12$'], answer: 2, why: 'Substitute: $x + 2x = 12$, so $3x = 12$ and $x = 4$. Then $y = 2(4) = 8$.' },
      },
      {
        id: 'exponents',
        title: 'Exponent rules',
        mins: 5,
        body: `
<table class="data"><thead><tr><th>Rule</th><th>Example</th></tr></thead><tbody>
<tr><td>$x^a \\cdot x^b = x^{a+b}$</td><td>$x^2 \\cdot x^5 = x^7$</td></tr>
<tr><td>$\\dfrac{x^a}{x^b} = x^{a-b}$</td><td>$\\dfrac{x^6}{x^2} = x^4$</td></tr>
<tr><td>$(x^a)^b = x^{ab}$</td><td>$(x^3)^2 = x^6$</td></tr>
<tr><td>$x^0 = 1$</td><td>$7^0 = 1$</td></tr>
<tr><td>$x^{-a} = \\dfrac{1}{x^a}$</td><td>$2^{-3} = \\dfrac{1}{8}$</td></tr>
<tr><td>$x^{1/n} = \\sqrt[n]{x}$</td><td>$27^{1/3} = 3$</td></tr>
</tbody></table>
${tip('Multiply the same base: add exponents. Power of a power: multiply exponents. Mixing these two up is the most common exponent mistake.')}`,
        check: { q: 'Simplify $(x^3)^2 \\cdot x^4$.', choices: ['$x^9$', '$x^{10}$', '$x^{24}$', '$x^{12}$'], answer: 1, why: '$(x^3)^2 = x^6$, and $x^6 \\cdot x^4 = x^{10}$.' },
      },
      {
        id: 'quadratics',
        title: 'Factoring and solving quadratics',
        mins: 7,
        body: `
<p>A <b>quadratic</b> has an $x^2$ term: $ax^2 + bx + c = 0$. Its graph is a parabola, and its solutions are the x-intercepts.</p>
<h3>Factoring $x^2 + bx + c$</h3>
<p>Find two numbers that <b>multiply to $c$</b> and <b>add to $b$</b>.</p>
${worked('Example', `<p>$x^2 + 5x + 6$: the numbers 2 and 3 multiply to 6 and add to 5, so it factors to $(x + 2)(x + 3)$.</p>`)}
<h3>Zero product property</h3>
<p>If $(x + 2)(x + 3) = 0$, then $x + 2 = 0$ or $x + 3 = 0$, so $x = -2$ or $x = -3$.</p>
<h3>When factoring doesn't work</h3>
${rule('Quadratic formula: $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$')}
<p>The <b>discriminant</b> $b^2 - 4ac$ tells you how many real solutions: positive means two, zero means one, negative means none.</p>`,
        desmos: ['y=x^2-x-12'],
        check: { q: 'Solve $x^2 - x - 12 = 0$.', choices: ['$x = 4$ or $x = -3$', '$x = -4$ or $x = 3$', '$x = 6$ or $x = -2$', '$x = 12$ or $x = -1$'], answer: 0, why: '$-4$ and $3$ multiply to $-12$ and add to $-1$, so $(x - 4)(x + 3) = 0$, giving $x = 4$ or $x = -3$. The graph crosses the x-axis at both.' },
      },
    ],
  },

  {
    id: 'geometry',
    subject: 'Math',
    icon: 'triangle',
    title: 'Geometry Essentials',
    blurb: 'Angles, triangles, similarity, area and volume, and circles, with the formulas and reasoning you need for class and tests.',
    level: 'Grades 9 to 10',
    lessons: [
      {
        id: 'angles',
        title: 'Angles and parallel lines',
        mins: 5,
        body: `
<ul>
  <li><b>Complementary</b> angles add to $90^\\circ$. <b>Supplementary</b> angles add to $180^\\circ$.</li>
  <li><b>Vertical angles</b> (across from each other where two lines cross) are equal.</li>
  <li>Angles on a straight line add to $180^\\circ$. Angles around a point add to $360^\\circ$.</li>
</ul>
<h3>Parallel lines cut by a transversal</h3>
${rule('Corresponding angles and alternate interior angles are <b>equal</b>. Same-side interior angles are <b>supplementary</b>.')}
<p>In practice: every angle in the diagram is one of just two sizes, and those two sizes add to $180^\\circ$.</p>`,
        check: { q: 'Two angles are supplementary. One measures $65^\\circ$. What does the other measure?', choices: ['$25^\\circ$', '$115^\\circ$', '$65^\\circ$', '$295^\\circ$'], answer: 1, why: 'Supplementary angles add to $180^\\circ$: $180 - 65 = 115$.' },
      },
      {
        id: 'triangles',
        title: 'Triangles and the Pythagorean theorem',
        mins: 6,
        body: `
${rule('The angles of any triangle add to $180^\\circ$. An exterior angle equals the sum of the two interior angles farthest from it.')}
<h3>Pythagorean theorem</h3>
<p>In a right triangle with legs $a$ and $b$ and hypotenuse $c$ (the side across from the right angle): $a^2 + b^2 = c^2$.</p>
<p>Common triples worth memorizing: 3-4-5, 5-12-13, 8-15-17, and their multiples (6-8-10, 9-12-15).</p>
<h3>Special right triangles</h3>
<ul>
  <li><b>45-45-90:</b> sides $x$, $x$, $x\\sqrt{2}$.</li>
  <li><b>30-60-90:</b> sides $x$, $x\\sqrt{3}$, $2x$. The shortest side is across from $30^\\circ$.</li>
</ul>`,
        check: { q: 'A right triangle has legs of 6 and 8. How long is the hypotenuse?', choices: ['$10$', '$14$', '$\\sqrt{28}$', '$48$'], answer: 0, why: '$6^2 + 8^2 = 36 + 64 = 100$, and $\\sqrt{100} = 10$. It\'s a 3-4-5 triangle doubled.' },
      },
      {
        id: 'similarity',
        title: 'Congruence and similarity',
        mins: 5,
        body: `
<p><b>Congruent</b> figures are identical in size and shape. <b>Similar</b> figures have the same shape but may be different sizes.</p>
<ul>
  <li>Triangles are congruent by SSS, SAS, ASA, AAS, or HL (right triangles). SSA and AAA don't prove congruence.</li>
  <li>Triangles are similar if two pairs of angles match (AA). Corresponding sides are then proportional.</li>
</ul>
${rule('If the scale factor between similar figures is $k$: lengths multiply by $k$, areas by $k^2$, and volumes by $k^3$.')}`,
        check: { q: 'Two similar triangles have a scale factor of 3. The smaller has an area of 5. What is the area of the larger?', choices: ['$15$', '$45$', '$135$', '$8$'], answer: 1, why: 'Areas scale by $k^2 = 9$: $5 \\times 9 = 45$.' },
      },
      {
        id: 'area-volume',
        title: 'Area and volume',
        mins: 6,
        body: `
<table class="data"><thead><tr><th>Shape</th><th>Formula</th></tr></thead><tbody>
<tr><td>Rectangle</td><td>$A = lw$</td></tr>
<tr><td>Triangle</td><td>$A = \\frac{1}{2}bh$</td></tr>
<tr><td>Trapezoid</td><td>$A = \\frac{1}{2}(b_1 + b_2)h$</td></tr>
<tr><td>Circle</td><td>$A = \\pi r^2$, $C = 2\\pi r$</td></tr>
<tr><td>Prism or cylinder</td><td>$V = Bh$ (base area times height), so a cylinder is $\\pi r^2 h$</td></tr>
<tr><td>Pyramid or cone</td><td>$V = \\frac{1}{3}Bh$, so a cone is $\\frac{1}{3}\\pi r^2 h$</td></tr>
<tr><td>Sphere</td><td>$V = \\frac{4}{3}\\pi r^3$, $SA = 4\\pi r^2$</td></tr>
</tbody></table>
${tip('Height is always measured perpendicular to the base, not along a slanted side.')}`,
        check: { q: 'What is the volume of a cylinder with radius 3 and height 5?', choices: ['$15\\pi$', '$30\\pi$', '$45\\pi$', '$75\\pi$'], answer: 2, why: '$V = \\pi r^2 h = \\pi (9)(5) = 45\\pi$.' },
      },
      {
        id: 'circles',
        title: 'Circles',
        mins: 6,
        body: `
<ul>
  <li><b>Arc length</b> $= \\frac{\\theta}{360} \\cdot 2\\pi r$ and <b>sector area</b> $= \\frac{\\theta}{360} \\cdot \\pi r^2$, where $\\theta$ is the central angle in degrees.</li>
  <li>An <b>inscribed angle</b> (vertex on the circle) is half the arc it intercepts. A central angle equals its arc.</li>
  <li>A tangent line is perpendicular to the radius at the point of tangency.</li>
</ul>
<h3>Circles on the coordinate plane</h3>
${rule('$(x - h)^2 + (y - k)^2 = r^2$ has center $(h, k)$ and radius $r$.')}
<p>If the equation is expanded, complete the square in $x$ and in $y$ to get it back into this form.</p>`,
        desmos: ['(x-2)^2+(y+1)^2=9'],
        check: { q: 'An inscribed angle intercepts an arc of $100^\\circ$. What is the measure of the angle?', choices: ['$50^\\circ$', '$100^\\circ$', '$200^\\circ$', '$80^\\circ$'], answer: 0, why: 'An inscribed angle is half its intercepted arc: $100 \\div 2 = 50$.' },
      },
    ],
  },

  {
    id: 'precalc',
    subject: 'Math',
    icon: 'chart',
    title: 'Algebra 2 & Precalculus',
    blurb: 'Functions and transformations, exponentials and logarithms, polynomials and rational functions, and trigonometry.',
    level: 'Grades 10 to 12',
    lessons: [
      {
        id: 'functions',
        title: 'Functions and transformations',
        mins: 7,
        body: `
<p>A <b>function</b> gives exactly one output for each input. The <b>domain</b> is the set of allowed inputs, and the <b>range</b> is the set of outputs.</p>
<h3>Transformations of $f(x)$</h3>
<table class="data"><thead><tr><th>Change</th><th>Effect</th></tr></thead><tbody>
<tr><td>$f(x) + k$</td><td>up $k$</td></tr>
<tr><td>$f(x - h)$</td><td>right $h$ (the opposite of the sign)</td></tr>
<tr><td>$-f(x)$</td><td>reflect over the x-axis</td></tr>
<tr><td>$f(-x)$</td><td>reflect over the y-axis</td></tr>
<tr><td>$a \\cdot f(x)$</td><td>vertical stretch by $a$</td></tr>
</tbody></table>
<h3>Composition and inverses</h3>
<p>$f(g(x))$ means: apply $g$ first, then $f$. To find an inverse, swap $x$ and $y$, then solve for $y$.</p>`,
        desmos: ['f(x)=x^2', 'y=f(x-h)+k', 'h=2', 'k=1'],
        check: { q: 'How is the graph of $g(x) = (x + 3)^2 - 5$ related to $f(x) = x^2$?', choices: ['Right 3, down 5', 'Left 3, down 5', 'Left 3, up 5', 'Right 3, up 5'], answer: 1, why: '$x + 3 = x - (-3)$ shifts left 3, and $-5$ outside shifts down 5.' },
      },
      {
        id: 'exp-log',
        title: 'Exponentials and logarithms',
        mins: 7,
        body: `
<p>Exponential functions $f(x) = a \\cdot b^x$ grow (if $b > 1$) or decay (if $0 < b < 1$) by the same <b>factor</b> each step.</p>
${rule('A logarithm answers "what exponent?": $\\log_b x = y$ means $b^y = x$.')}
<h3>Log rules</h3>
<ul>
  <li>$\\log_b(xy) = \\log_b x + \\log_b y$</li>
  <li>$\\log_b\\left(\\frac{x}{y}\\right) = \\log_b x - \\log_b y$</li>
  <li>$\\log_b(x^n) = n \\log_b x$</li>
  <li>Change of base: $\\log_b x = \\dfrac{\\ln x}{\\ln b}$</li>
</ul>
${worked('Example', `<p>Solve $3^x = 20$. Take the log of both sides: $x \\ln 3 = \\ln 20$, so $x = \\dfrac{\\ln 20}{\\ln 3} \\approx 2.73$.</p>`)}`,
        check: { q: 'What is $\\log_2 8$?', choices: ['$2$', '$3$', '$4$', '$16$'], answer: 1, why: '$2^3 = 8$, so $\\log_2 8 = 3$.' },
      },
      {
        id: 'polynomials',
        title: 'Polynomials and rational functions',
        mins: 7,
        body: `
<h3>Polynomials</h3>
<ul>
  <li><b>End behavior</b> depends on the degree and leading coefficient. Even degree: both ends point the same way. Odd degree: opposite ways.</li>
  <li>A zero with <b>odd multiplicity</b> crosses the x-axis; a zero with <b>even multiplicity</b> touches and bounces.</li>
</ul>
<h3>Rational functions</h3>
${rule('<b>Vertical asymptotes</b> occur where the denominator is zero (after canceling common factors). A canceled factor makes a <b>hole</b> instead.')}
<p><b>Horizontal asymptote</b>, comparing degrees of the top and bottom:</p>
<ul>
  <li>Bottom degree bigger: $y = 0$.</li>
  <li>Same degree: $y = $ ratio of leading coefficients.</li>
  <li>Top degree bigger: no horizontal asymptote.</li>
</ul>`,
        desmos: ['y=\\frac{2x+1}{x-3}'],
        check: { q: 'What is the horizontal asymptote of $f(x) = \\dfrac{2x + 1}{x - 3}$?', choices: ['$y = 0$', '$y = 2$', '$y = 3$', '$y = -\\frac{1}{3}$'], answer: 1, why: 'The top and bottom have the same degree, so the asymptote is the ratio of leading coefficients: $\\frac{2}{1} = 2$. (The vertical asymptote is $x = 3$.)' },
      },
      {
        id: 'trig',
        title: 'Trigonometry and the unit circle',
        mins: 8,
        body: `
<h3>Right-triangle trig</h3>
<p>SOH-CAH-TOA: $\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}}$, $\\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}}$, $\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}$.</p>
<h3>Radians</h3>
<p>$180^\\circ = \\pi$ radians. Multiply degrees by $\\frac{\\pi}{180}$ to convert.</p>
<h3>The unit circle</h3>
${rule('A point on the unit circle at angle $\\theta$ is $(\\cos\\theta, \\sin\\theta)$.')}
<table class="data"><thead><tr><th>$\\theta$</th><th>$0$</th><th>$\\frac{\\pi}{6}$</th><th>$\\frac{\\pi}{4}$</th><th>$\\frac{\\pi}{3}$</th><th>$\\frac{\\pi}{2}$</th></tr></thead><tbody>
<tr><td>$\\sin$</td><td>$0$</td><td>$\\frac{1}{2}$</td><td>$\\frac{\\sqrt{2}}{2}$</td><td>$\\frac{\\sqrt{3}}{2}$</td><td>$1$</td></tr>
<tr><td>$\\cos$</td><td>$1$</td><td>$\\frac{\\sqrt{3}}{2}$</td><td>$\\frac{\\sqrt{2}}{2}$</td><td>$\\frac{1}{2}$</td><td>$0$</td></tr>
</tbody></table>
<p>Use signs by quadrant for other angles. Key identity: $\\sin^2\\theta + \\cos^2\\theta = 1$.</p>
<p>The graph of $y = a\\sin(bx)$ has amplitude $|a|$ and period $\\frac{2\\pi}{b}$.</p>`,
        desmos: ['y=a\\sin(bx)', 'a=1', 'b=1'],
        check: { q: 'What is $\\sin\\left(\\frac{\\pi}{6}\\right)$?', choices: ['$\\frac{1}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$1$'], answer: 0, why: '$\\frac{\\pi}{6} = 30^\\circ$, and $\\sin 30^\\circ = \\frac{1}{2}$.' },
      },
    ],
  },

  {
    id: 'calculus',
    subject: 'Math',
    icon: 'integral',
    title: 'Calculus',
    ap: true,
    blurb: 'Limits, derivatives, and integrals explained step by step, with graphs you can play with. Covers the core of AP Calculus AB.',
    level: 'Grades 11 to 12 · AP',
    lessons: [
      {
        id: 'limits',
        title: 'Limits',
        mins: 7,
        body: `
<p>A <b>limit</b> asks: as $x$ gets closer and closer to some value, what does $f(x)$ get close to? The function doesn't have to be defined at that point.</p>
<h3>How to evaluate a limit</h3>
<ol>
  <li><b>Plug in.</b> If you get a real number, that's the limit.</li>
  <li>If you get $\\frac{0}{0}$, <b>factor and cancel</b> (or rationalize), then plug in again.</li>
  <li>If you get a nonzero number over zero, the limit is infinite or doesn't exist; check each side.</li>
</ol>
${worked('Example', `<p>$\\displaystyle\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$. Plugging in gives $\\frac{0}{0}$. Factor: $\\frac{(x - 2)(x + 2)}{x - 2} = x + 2$. Now plug in: $2 + 2 = 4$.</p>`)}
<p>The graph below has a hole at $x = 2$, but the curve heads toward height 4 from both sides.</p>
${rule('A function is <b>continuous</b> at $a$ if $f(a)$ exists, the limit exists, and they are equal.')}`,
        desmos: ['y=\\frac{x^2-4}{x-2}'],
        check: { q: 'Evaluate $\\displaystyle\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.', choices: ['$0$', '$3$', '$6$', 'Does not exist'], answer: 2, why: 'Factor: $\\frac{(x - 3)(x + 3)}{x - 3} = x + 3$, and $3 + 3 = 6$.' },
      },
      {
        id: 'derivative-meaning',
        title: 'What a derivative means',
        mins: 7,
        body: `
<p>The <b>derivative</b> $f'(x)$ is the <b>instantaneous rate of change</b> of $f$, or the slope of the tangent line at a point.</p>
${rule('$f\'(x) = \\displaystyle\\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$')}
<p>This is the slope between two points on the curve, as the points slide together.</p>
${worked('Example', `<p>For $f(x) = x^2$: $\\dfrac{(x + h)^2 - x^2}{h} = \\dfrac{2xh + h^2}{h} = 2x + h$. As $h \\to 0$, this becomes $f'(x) = 2x$.</p>`)}
<h3>Interpreting derivatives</h3>
<ul>
  <li>If $s(t)$ is position, $s'(t)$ is velocity and $s''(t)$ is acceleration.</li>
  <li>$f' > 0$ means $f$ is increasing; $f' < 0$ means decreasing.</li>
  <li>Units of $f'$ are "units of $f$ per unit of $x$," like meters per second.</li>
</ul>
${tip('Drag the $a$ slider below to move the tangent line along the curve. Notice where the tangent is flat.')}`,
        desmos: ['f(x)=x^3-3x', 'a=0.5', "y=f(a)+f'(a)(x-a)", '(a,f(a))'],
        check: { q: 'A particle\'s position is $s(t) = t^2$ meters. What is its velocity at $t = 3$ seconds?', choices: ['$3$ m/s', '$6$ m/s', '$9$ m/s', '$2$ m/s'], answer: 1, why: 'Velocity is the derivative: $s\'(t) = 2t$, so $s\'(3) = 6$ m/s.' },
      },
      {
        id: 'derivative-rules',
        title: 'Derivative rules',
        mins: 8,
        body: `
<table class="data"><thead><tr><th>Rule</th><th>Formula</th></tr></thead><tbody>
<tr><td>Constant</td><td>$\\frac{d}{dx}[c] = 0$</td></tr>
<tr><td>Power</td><td>$\\frac{d}{dx}[x^n] = nx^{n-1}$</td></tr>
<tr><td>Product</td><td>$(fg)' = f'g + fg'$</td></tr>
<tr><td>Quotient</td><td>$\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$</td></tr>
<tr><td>Chain</td><td>$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$</td></tr>
</tbody></table>
<h3>Derivatives to memorize</h3>
<p>$\\frac{d}{dx}\\sin x = \\cos x$, $\\frac{d}{dx}\\cos x = -\\sin x$, $\\frac{d}{dx}e^x = e^x$, $\\frac{d}{dx}\\ln x = \\frac{1}{x}$.</p>
${worked('Power rule', `<p>$\\frac{d}{dx}(3x^4 - 5x + 2) = 12x^3 - 5$</p>`)}
${worked('Chain rule', `<p>$\\frac{d}{dx}(2x + 1)^5 = 5(2x + 1)^4 \\cdot 2 = 10(2x + 1)^4$. Take the derivative of the outside, keep the inside, then multiply by the derivative of the inside.</p>`)}`,
        check: { q: 'What is the derivative of $\\sin(x^2)$?', choices: ['$\\cos(x^2)$', '$2x\\cos(x^2)$', '$\\cos(2x)$', '$-2x\\cos(x^2)$'], answer: 1, why: 'Chain rule: the outside $\\sin$ becomes $\\cos(x^2)$, times the derivative of the inside, $2x$.' },
      },
      {
        id: 'applications',
        title: 'Using derivatives: max, min, and graph shape',
        mins: 8,
        body: `
<ul>
  <li><b>Critical points</b> are where $f'(x) = 0$ or $f'$ is undefined.</li>
  <li>If $f'$ changes from $+$ to $-$, there's a <b>local maximum</b>; from $-$ to $+$, a <b>local minimum</b>.</li>
  <li>$f'' > 0$: concave up (cup shape). $f'' < 0$: concave down. Where concavity changes is an <b>inflection point</b>.</li>
</ul>
${worked('Example', `<p>$f(x) = x^3 - 3x$. Then $f'(x) = 3x^2 - 3 = 0$ at $x = \\pm 1$. $f(-1) = 2$ is a local max, and $f(1) = -2$ is a local min.</p>`)}
<h3>Optimization</h3>
<ol><li>Write a formula for the quantity to maximize or minimize.</li><li>Use the constraint to get it in one variable.</li><li>Set the derivative to zero and solve.</li><li>Check endpoints and confirm it's a max or min.</li></ol>
<p>The graph below shows $f$ and its derivative. Where $f'$ crosses zero, $f$ turns around.</p>`,
        desmos: ['f(x)=x^3-3x', 'y=\\frac{d}{dx}f(x)'],
        check: { q: 'Where does $f(x) = x^2 - 6x + 1$ have its minimum?', choices: ['$x = -3$', '$x = 1$', '$x = 3$', '$x = 6$'], answer: 2, why: '$f\'(x) = 2x - 6 = 0$ at $x = 3$, and $f\'\'(x) = 2 > 0$, so it\'s a minimum.' },
      },
      {
        id: 'integrals',
        title: 'Integrals and the Fundamental Theorem',
        mins: 8,
        body: `
<p>Integration reverses differentiation. An <b>antiderivative</b> of $f$ is a function $F$ with $F' = f$.</p>
${rule('Power rule for integrals: $\\displaystyle\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\ne -1$. And $\\displaystyle\\int \\frac{1}{x}\\,dx = \\ln|x| + C$.')}
<h3>Definite integrals</h3>
<p>$\\int_a^b f(x)\\,dx$ is the <b>signed area</b> between the curve and the x-axis from $a$ to $b$. Area below the axis counts as negative.</p>
${rule('Fundamental Theorem of Calculus: $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$')}
${worked('Example', `<p>$\\displaystyle\\int_0^2 3x^2\\,dx = \\Big[x^3\\Big]_0^2 = 8 - 0 = 8$.</p>`)}
${tip('Desmos can check definite integrals: type <code>int</code> to get the integral symbol.')}`,
        desmos: ['\\int_{0}^{2}3x^{2}dx', 'y=3x^2', '0\\le y\\le3x^2\\left\\{0\\le x\\le2\\right\\}'],
        check: { q: 'Evaluate $\\displaystyle\\int_1^3 2x\\,dx$.', choices: ['$4$', '$6$', '$8$', '$9$'], answer: 2, why: 'An antiderivative of $2x$ is $x^2$. So $3^2 - 1^2 = 9 - 1 = 8$.' },
      },
      {
        id: 'u-sub',
        title: 'u-substitution',
        mins: 6,
        body: `
<p>u-substitution undoes the chain rule. Use it when you see a function and (a multiple of) its derivative in the same integral.</p>
<ol>
  <li>Let $u$ be the "inside" function.</li>
  <li>Find $du$ and rewrite the integral entirely in $u$.</li>
  <li>Integrate, then substitute back.</li>
</ol>
${worked('Example', `<p>$\\displaystyle\\int 2x(x^2 + 1)^3\\,dx$. Let $u = x^2 + 1$, so $du = 2x\\,dx$. The integral becomes $\\int u^3\\,du = \\frac{u^4}{4} + C = \\frac{(x^2 + 1)^4}{4} + C$.</p>`)}
${tip('Check any indefinite integral by differentiating your answer. You should get back the original integrand.')}`,
        check: { q: 'Find $\\displaystyle\\int \\cos(3x)\\,dx$.', choices: ['$\\sin(3x) + C$', '$3\\sin(3x) + C$', '$\\frac{1}{3}\\sin(3x) + C$', '$-\\frac{1}{3}\\sin(3x) + C$'], answer: 2, why: 'Let $u = 3x$, so $dx = \\frac{du}{3}$. Then $\\frac{1}{3}\\int \\cos u\\,du = \\frac{1}{3}\\sin(3x) + C$. Differentiating gives back $\\cos(3x)$.' },
      },
    ],
  },

  {
    id: 'statistics',
    subject: 'Math',
    icon: 'chart',
    title: 'Statistics & Probability',
    ap: true,
    blurb: 'Describe data, calculate probabilities, use the normal distribution, and tell a good study from a misleading one.',
    level: 'Grades 9 to 12 · AP',
    lessons: [
      {
        id: 'center-spread',
        title: 'Center and spread',
        mins: 6,
        body: `
<ul>
  <li><b>Mean:</b> sum divided by count. <b>Median:</b> middle value when sorted. <b>Mode:</b> most frequent.</li>
  <li><b>Range:</b> max minus min. <b>IQR:</b> $Q_3 - Q_1$, the spread of the middle half.</li>
  <li><b>Standard deviation:</b> roughly the typical distance from the mean.</li>
</ul>
${rule('Outliers pull the mean and standard deviation a lot, but barely move the median and IQR. For skewed data, report the median and IQR.')}
<p>A common outlier rule: a value is an outlier if it's more than $1.5 \\times \\text{IQR}$ below $Q_1$ or above $Q_3$.</p>`,
        check: { q: 'Data: 2, 3, 3, 5, 100. Which is the better measure of a typical value?', choices: ['The mean, 22.6', 'The median, 3', 'The range, 98', 'The maximum, 100'], answer: 1, why: 'The outlier 100 drags the mean far above most of the data. The median, 3, is resistant to it.' },
      },
      {
        id: 'probability',
        title: 'Probability rules',
        mins: 6,
        body: `
<ul>
  <li>$P(\\text{not } A) = 1 - P(A)$</li>
  <li>$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$</li>
  <li>If $A$ and $B$ are <b>independent</b>: $P(A \\text{ and } B) = P(A) \\cdot P(B)$</li>
  <li>Conditional: $P(A \\mid B) = \\dfrac{P(A \\text{ and } B)}{P(B)}$</li>
</ul>
${tip('"At least one" problems are easiest with the complement: $P(\\text{at least one}) = 1 - P(\\text{none})$.')}`,
        check: { q: 'You flip two fair coins. What is the probability both land heads?', choices: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{1}{4}$', '$\\frac{3}{4}$'], answer: 2, why: 'The flips are independent: $\\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.' },
      },
      {
        id: 'normal',
        title: 'The normal distribution and z-scores',
        mins: 6,
        body: `
<p>Many measurements (heights, test scores) follow a bell-shaped <b>normal distribution</b>.</p>
${rule('68-95-99.7 rule: about 68% of values are within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3.')}
<p>A <b>z-score</b> says how many standard deviations a value is from the mean: $z = \\dfrac{x - \\mu}{\\sigma}$.</p>
<p>z-scores let you compare values from different distributions, like an SAT score and an ACT score.</p>`,
        desmos: ['y=\\operatorname{normaldist}(70,5).\\operatorname{pdf}(x)', 'x=80'],
        desmosBounds: { left: 50, right: 90, bottom: -0.02, top: 0.1 },
        check: { q: 'Test scores have mean 70 and standard deviation 5. What is the z-score of 80?', choices: ['$1$', '$2$', '$10$', '$-2$'], answer: 1, why: '$z = \\frac{80 - 70}{5} = 2$.' },
      },
      {
        id: 'studies',
        title: 'Sampling, experiments, and causation',
        mins: 5,
        body: `
<ul>
  <li><b>Correlation is not causation.</b> Two variables can move together because of a third, hidden variable.</li>
  <li>An <b>observational study</b> only watches. An <b>experiment</b> assigns treatments.</li>
  <li><b>Random assignment</b> in an experiment is what allows cause-and-effect conclusions.</li>
  <li><b>Random sampling</b> is what allows you to generalize to the whole population.</li>
</ul>
<h3>Common biases</h3>
<p>Voluntary response (only people who care respond), convenience samples, and leading questions all make results unreliable, no matter how large the sample.</p>`,
        check: { q: 'Which study design can show that a new study method causes higher grades?', choices: ['A survey of students who chose the method', 'A randomized experiment that assigns students to methods', 'Comparing grades at two different schools', 'A large online poll'], answer: 1, why: 'Only random assignment balances out other differences between groups, so any difference can be attributed to the method.' },
      },
    ],
  },
];
