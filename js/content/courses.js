// Free mini-courses. Each lesson is short: the idea, worked examples, and a quick check.
// body: HTML (inline math in $...$). desmos: expressions preloaded into an embedded calculator.
// check: one multiple-choice question. practice: skills to drill in the question bank afterwards.

import { bad, good, rule, tip } from './lesson-kit.js';
import { MATH_COURSES } from './courses-math.js';
import { SCIENCE_COURSES } from './courses-science.js';
import { HUMANITIES_COURSES } from './courses-humanities.js';
import { AP_HISTORY_COURSES } from './courses-ap-history.js';
import { AP_SOCIAL_COURSES } from './courses-ap-social.js';
import { AP_SCIENCE_COURSES } from './courses-ap-science.js';
import { AP_ENGLISH_COURSES } from './courses-ap-english.js';
import { AP_MATH_COURSES } from './courses-ap-math.js';
import { AP_CS_COURSES } from './courses-ap-cs.js';
import { AP_ARTS_COURSES, AP_LANGUAGE_COURSES } from './courses-ap-arts.js';

// Subjects in display order. Each course has a subject from this list.
export const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Social Science', 'Computer Science', 'Arts', 'World Languages', 'Study Skills', 'SAT & ACT'];

const TEST_PREP = [
  {
    id: 'desmos',
    subject: 'SAT & ACT',
    icon: 'calculator',
    title: 'Desmos for the SAT',
    blurb: 'Use the built-in graphing calculator to solve equations, systems, quadratics, and data questions faster and with fewer mistakes.',
    level: 'SAT Math',
    lessons: [
      {
        id: 'basics',
        title: 'Getting around Desmos',
        mins: 5,
        body: `
<p>Desmos is built into every math module of the digital SAT, so you can use it on every math question. Learning a handful of moves now saves minutes on test day.</p>
<h3>Typing math</h3>
<ul>
  <li><b>Fractions:</b> type <kbd>/</kbd> and Desmos builds a fraction. Use the right arrow key to leave the denominator.</li>
  <li><b>Exponents:</b> type <kbd>^</kbd>, for example <code>x^2</code>. Press the right arrow to get back to the baseline.</li>
  <li><b>Square roots and pi:</b> type <code>sqrt</code> and <code>pi</code>, and Desmos turns them into symbols.</li>
  <li><b>Multiplication:</b> write <code>3x</code> or <code>3*x</code>. Use parentheses generously: <code>3(x-2)</code>.</li>
</ul>
<h3>Reading the graph</h3>
<ul>
  <li>Click a curve and gray dots appear at its <b>x-intercepts, y-intercept, vertex, and intersections</b>. Click a dot to see its exact coordinates.</li>
  <li>Use the zoom buttons or pinch to zoom. The house icon resets the view.</li>
  <li>If a graph seems to be missing, it's usually off screen. Zoom out.</li>
</ul>
${tip('Try it below: click the parabola and then click each gray dot.')}`,
        desmos: ['y=x^2-6x+5'],
        check: { q: 'You graph $y = x^2 - 6x + 5$ and click the curve. Which point is the vertex?', choices: ['$(1, 0)$', '$(3, -4)$', '$(5, 0)$', '$(0, 5)$'], answer: 1, why: 'The vertex is the lowest point of this upward parabola, at $x = 3$: $9 - 18 + 5 = -4$. The points $(1, 0)$ and $(5, 0)$ are the x-intercepts, and $(0, 5)$ is the y-intercept.' },
      },
      {
        id: 'equations',
        title: 'Solve any equation by graphing',
        mins: 5,
        body: `
<p>For an equation in one variable, you don't have to do the algebra. Two ways work:</p>
<ol>
  <li><b>Type the equation exactly as written</b>, like <code>3(x-2)=2x+7</code>. Desmos draws a vertical line at each solution.</li>
  <li><b>Graph each side separately</b>: <code>y=3(x-2)</code> and <code>y=2x+7</code>. The solution is the x-coordinate of the intersection.</li>
</ol>
${rule('The solution to an equation is the <b>x-value</b> where the two sides are equal, so read the x-coordinate of the intersection, not the y-coordinate.')}
<p>This works just as well for equations that are painful by hand, like $\\sqrt{x+7} = x - 5$ or $|2x - 3| = 7$.</p>
${tip('If the answer choices are numbers, you can also type each choice into the equation to check it. Desmos shows "true" or "false".')}`,
        desmos: ['3(x-2)=2x+7', 'y=3(x-2)', 'y=2x+7'],
        check: { q: 'You graph $y = 3(x - 2)$ and $y = 2x + 7$. They intersect at $(13, 33)$. What is the solution to $3(x - 2) = 2x + 7$?', choices: ['$x = 33$', '$x = 13$', '$x = 7$', '$x = 46$'], answer: 1, why: 'The solution is the x-coordinate of the intersection, $x = 13$. Check: $3(11) = 33$ and $2(13) + 7 = 33$.' },
        practice: { test: 'SAT', section: 'math', skills: ['Linear equations in one variable', 'Nonlinear equations in one variable'] },
      },
      {
        id: 'systems',
        title: 'Systems of equations',
        mins: 5,
        body: `
<p>Type both equations on separate lines. The solution to the system is the point where the graphs cross. Desmos accepts equations in any form, so you don't need to solve for $y$ first.</p>
<ul>
  <li><b>One solution:</b> the lines cross once. Click the intersection.</li>
  <li><b>No solution:</b> the lines are parallel and never cross.</li>
  <li><b>Infinitely many solutions:</b> the second line lands exactly on top of the first.</li>
</ul>
${rule('If a question asks for $x + y$ or some other combination, find the intersection first, then do the arithmetic. Reread what the question asks for.')}`,
        desmos: ['2x+3y=12', 'x-y=1'],
        check: { q: 'The system $2x + 3y = 12$ and $x - y = 1$ is graphed in Desmos. What is the value of $x + y$?', choices: ['$2$', '$3$', '$5$', '$6$'], answer: 2, why: 'The lines intersect at $(3, 2)$, so $x + y = 5$. Check: $2(3) + 3(2) = 12$ and $3 - 2 = 1$.' },
        practice: { test: 'SAT', section: 'math', skills: ['Systems of two linear equations in two variables'] },
      },
      {
        id: 'sliders',
        title: 'Sliders for "what value of k" questions',
        mins: 6,
        body: `
<p>When an equation has an unknown constant like $k$, $a$, or $c$, Desmos offers to <b>add a slider</b>. Drag it and watch the graph change until it matches the condition in the question.</p>
<h3>Classic uses</h3>
<ul>
  <li><b>No solution:</b> slide until the two lines are parallel.</li>
  <li><b>Exactly one solution for a quadratic:</b> slide until the parabola just touches the x-axis (or the line).</li>
  <li><b>Passes through a point:</b> slide until the graph hits it.</li>
</ul>
<p>Sliders get you close fast. Then confirm with algebra or by typing the exact value in. For "no solution," the slopes must match and the intercepts must differ.</p>
${tip('Click the slider\'s endpoints to change its range, and set the step to 1 if the answer should be an integer.')}`,
        desmos: ['kx+2y=8', '3x+y=5', 'k=1'],
        check: { q: 'For what value of $k$ does the system $kx + 2y = 8$ and $3x + y = 5$ have no solution?', choices: ['$k = 3$', '$k = \\frac{3}{2}$', '$k = 6$', '$k = -6$'], answer: 2, why: 'Solve for $y$: $y = 4 - \\frac{k}{2}x$ and $y = 5 - 3x$. Parallel lines need equal slopes, so $\\frac{k}{2} = 3$ and $k = 6$. The intercepts (4 and 5) differ, so the lines never meet.' },
        practice: { test: 'SAT', section: 'math', skills: ['Systems of two linear equations in two variables', 'Linear equations in two variables'] },
      },
      {
        id: 'quadratics',
        title: 'Quadratics and other functions',
        mins: 5,
        body: `
<p>Graph the function, click it, and read off what you need:</p>
<ul>
  <li><b>Zeros / roots / x-intercepts:</b> where it crosses the x-axis.</li>
  <li><b>Vertex, maximum, minimum:</b> the turning point.</li>
  <li><b>y-intercept:</b> where $x = 0$.</li>
  <li><b>Value of $f(a)$:</b> define <code>f(x)=...</code> once, then type <code>f(4)</code> on a new line and Desmos prints the value.</li>
</ul>
${rule('For "how many solutions" questions, count intersections with the x-axis (or with the other graph). Zero crossings means no real solutions.')}
${tip('Defining <code>f(x)</code> is also great for composition questions: type <code>f(g(2))</code>.')}`,
        desmos: ['f(x)=2x^2-8x+3', 'f(4)'],
        check: { q: 'You define $f(x) = 2x^2 - 8x + 3$ in Desmos. What is the minimum value of $f$?', choices: ['$-5$', '$2$', '$3$', '$-8$'], answer: 0, why: 'The vertex is at $x = \\frac{8}{4} = 2$, and $f(2) = 8 - 16 + 3 = -5$. Clicking the curve\'s lowest point shows $(2, -5)$.' },
        practice: { test: 'SAT', section: 'math', skills: ['Nonlinear functions', 'Nonlinear equations in one variable'] },
      },
      {
        id: 'data',
        title: 'Tables, statistics, and lines of best fit',
        mins: 6,
        body: `
<p>Desmos is also a statistics tool.</p>
<h3>Quick statistics from a list</h3>
<p>Type a list in square brackets, then call a function on it: <code>mean([4,8,15,16,23])</code>, <code>median(...)</code>, <code>stdev(...)</code>. This is much faster than adding by hand.</p>
<h3>Regression from a table</h3>
<ol>
  <li>Add a table (the <b>+</b> button, then <b>table</b>) and enter the data as $x_1$ and $y_1$.</li>
  <li>Type <code>y_1 ~ mx_1 + b</code> for a line of best fit, or <code>y_1 ~ ab^{x_1}</code> for an exponential model. Use the tilde key <kbd>~</kbd>.</li>
  <li>Desmos prints the values of $m$ and $b$ (or $a$ and $b$).</li>
</ol>
${tip('Standard deviation on the SAT is almost always a comparison ("which set has the larger spread?"). You rarely need the number, but <code>stdev</code> settles close calls.')}`,
        desmos: [{ type: 'table', columns: [{ latex: 'x_1', values: ['1', '2', '3', '4', '5'] }, { latex: 'y_1', values: ['3', '5', '8', '9', '12'] }] }, 'y_1\\sim mx_1+b', '\\operatorname{mean}([4,8,15,16,23])'],
        check: { q: 'You type <code>mean([4, 8, 15, 16, 23])</code> into Desmos. What does it show?', choices: ['$13.2$', '$15$', '$66$', '$12.5$'], answer: 0, why: 'The sum is $66$, and $66 \\div 5 = 13.2$. (The median would be $15$.)' },
        practice: { test: 'SAT', section: 'math', skills: ['One-variable data: distributions and measures of center and spread', 'Two-variable data: models and scatterplots'] },
      },
      {
        id: 'traps',
        title: 'Test-day tricks and traps',
        mins: 5,
        body: `
<h3>Tricks</h3>
<ul>
  <li><b>Equivalent expressions:</b> graph the original and each answer choice. The correct choice lies exactly on top of the original.</li>
  <li><b>Inequalities:</b> type them directly, like <code>y&gt;2x-1</code>. Desmos shades the solution region, so you can see which point is inside it.</li>
  <li><b>Checking choices:</b> for "which point satisfies...," type the point as <code>(3,4)</code> and see if it sits in the shaded region or on the line.</li>
</ul>
<h3>Traps</h3>
<ul>
  <li><b>Degrees vs. radians:</b> Desmos starts in radians. For trig in degrees, open the wrench (graph settings) and choose <b>Degrees</b>.</li>
  <li><b>Missing parentheses:</b> <code>1/2x</code> is not the same as <code>1/(2x)</code>. Check that the typed expression looks like the one on the page.</li>
  <li><b>Reading the wrong coordinate:</b> solutions to one-variable equations are x-values.</li>
</ul>
${rule('Desmos isn\'t always faster. If you can solve something in one or two mental steps, just do it, and save the calculator for anything messy.')}`,
        desmos: ['y=(x+3)^2', 'y=x^2+6x+9', 'y>2x-1'],
        check: { q: 'Which is the fastest Desmos check that $(x + 3)^2$ is equivalent to one of four answer choices?', choices: ['Solve each choice by hand', 'Graph the original and each choice, and look for the one that overlaps exactly', 'Find the y-intercept of each', 'Switch to degree mode'], answer: 1, why: 'Equivalent expressions have identical graphs, so the correct choice sits exactly on top of the original curve.' },
        practice: { test: 'SAT', section: 'math', skills: ['Equivalent expressions', 'Linear inequalities in one or two variables'] },
      },
    ],
  },

  {
    id: 'grammar',
    subject: 'SAT & ACT',
    icon: 'edit',
    title: 'SAT Grammar Rules',
    blurb: 'Every rule tested in Standard English Conventions, one lesson at a time: sentence boundaries, commas, semicolons, colons, agreement, verbs, and modifiers.',
    level: 'SAT Reading & Writing',
    lessons: [
      {
        id: 'clauses',
        title: 'Complete sentences and run-ons',
        mins: 5,
        body: `
<p>Almost every punctuation question comes down to one idea: the <b>independent clause</b>. An independent clause has a subject and a verb and could stand alone as a sentence.</p>
${rule('Two independent clauses can be joined only by: a period, a semicolon, a comma plus a FANBOYS conjunction (<i>for, and, nor, but, or, yet, so</i>), or a colon (if the second explains the first).')}
${bad('The fossil was nearly complete, researchers were thrilled.')}
${good('The fossil was nearly complete. Researchers were thrilled.')}
${good('The fossil was nearly complete; researchers were thrilled.')}
${good('The fossil was nearly complete, so researchers were thrilled.')}
<p>A comma alone between two independent clauses is a <b>comma splice</b>. It's the single most common wrong answer on the SAT.</p>
<h3>Fragments</h3>
<p>A fragment is missing a main verb or depends on another clause. "Although the fossil was nearly complete." is a fragment because <i>although</i> makes it dependent.</p>
${tip('Test each side of the punctuation mark: can it stand alone as a sentence? That tells you which punctuation is allowed.')}`,
        check: { q: 'Choose the correct option: "The committee reviewed every proposal ______ none met the funding criteria."', choices: ['proposal,', 'proposal', 'proposal;', 'proposal, and,'], answer: 2, why: 'Both sides are independent clauses, so a semicolon works. A comma alone is a splice, no punctuation is a run-on, and "and," puts a comma in the wrong place.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries'] },
      },
      {
        id: 'semicolon-colon',
        title: 'Semicolons and colons',
        mins: 5,
        body: `
<h3>Semicolons</h3>
${rule('A semicolon works exactly like a period. Both sides must be independent clauses.')}
${bad('The experiment failed; because the sample was contaminated.')}
${good('The experiment failed; the sample was contaminated.')}
<p>(A semicolon can also separate items in a list when the items already contain commas, but that's rare on the SAT.)</p>
<h3>Colons</h3>
${rule('The part <b>before</b> a colon must be a complete sentence. What follows can be a list, an explanation, or a single word.')}
${bad('The recipe requires: flour, eggs, and butter.')}
${good('The recipe requires three ingredients: flour, eggs, and butter.')}
${good('Her conclusion was simple: the bridge needed repairs.')}
<p>Never put a colon right after a verb or after "such as," "including," or "like."</p>`,
        check: { q: 'Choose the correct option: "The expedition carried only the essentials ______ water, maps, and a radio."', choices: ['essentials:', 'essentials;', 'essentials, such as:', 'essentials'], answer: 0, why: 'The first part is a complete sentence and what follows is a list that explains it, which is exactly the colon\'s job. A semicolon needs an independent clause after it.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries'] },
      },
      {
        id: 'commas',
        title: 'Commas: extra information and lists',
        mins: 7,
        body: `
<h3>Nonessential information</h3>
${rule('Extra information that could be removed without breaking the sentence goes between a <b>matching pair</b> of commas, dashes, or parentheses.')}
${bad('Marie Curie, who won two Nobel Prizes was born in Warsaw.')}
${good('Marie Curie, who won two Nobel Prizes, was born in Warsaw.')}
<p>Test: remove the part between the commas. If the sentence still works, the commas are right.</p>
<h3>Essential information gets no commas</h3>
${good('The novelist Toni Morrison won the Nobel Prize in 1993.')}
<p>Without "Toni Morrison," we wouldn't know which novelist, so the name is essential and takes no commas. Titles and job descriptions right before a name ("biologist Rachel Carson") work the same way.</p>
<h3>Never put a single comma...</h3>
<ul>
  <li>between a subject and its verb (not "The results of the study, surprised everyone")</li>
  <li>between a verb and its object</li>
  <li>before <i>that</i> when it starts a clause</li>
  <li>between an adjective and the noun it describes</li>
</ul>
<h3>Lists and introductions</h3>
<p>Use commas between three or more items, and after an introductory phrase: "After the storm passed, the crew returned."</p>`,
        check: { q: 'Choose the correct option: "The engineer ______ designed the bridge will present tomorrow."', choices: ['engineer, who', 'engineer who', 'engineer who,', 'engineer, who,'], answer: 1, why: '"Who designed the bridge" tells us which engineer, so it is essential and takes no commas. Also, a comma cannot separate the subject "engineer" from its verb "will present."' },
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries'] },
      },
      {
        id: 'transitions-punct',
        title: 'Punctuating "however" and other transitions',
        mins: 4,
        body: `
<p>Words like <i>however, therefore, moreover, consequently,</i> and <i>for example</i> are not FANBOYS conjunctions. They can't join two sentences with just a comma.</p>
${rule('Between two independent clauses: <b>semicolon (or period) before, comma after</b>. Inside a single clause: commas on both sides.')}
${bad('The data were promising, however, more trials are needed.')}
${good('The data were promising; however, more trials are needed.')}
${good('The data were promising. More trials, however, are needed.')}
${tip('When the choices differ only in where the punctuation goes around a transition word, first find the two clauses. The transition belongs to the second one.')}`,
        check: { q: 'Choose the correct option: "Sales rose in March ______ they fell sharply in April."', choices: ['March, however,', 'March; however,', 'March however;', 'March, however'], answer: 1, why: 'Both sides are independent clauses, so the transition needs a semicolon before it and a comma after it.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries', 'Transitions'] },
      },
      {
        id: 'agreement',
        title: 'Subject-verb agreement',
        mins: 5,
        body: `
${rule('A verb must match its <b>subject</b>, not the noun closest to it.')}
<p>The SAT hides the subject behind a long phrase:</p>
${bad('The collection of rare manuscripts are stored in a vault.')}
${good('The collection of rare manuscripts is stored in a vault.')}
<p>Cross out prepositional phrases (<i>of rare manuscripts</i>) and the subject is clear: <i>collection ... is</i>.</p>
<h3>Watch for</h3>
<ul>
  <li><b>Collective nouns</b> (team, committee, group, species) are usually singular.</li>
  <li><b>Each, every, either, neither, everyone</b> are singular.</li>
  <li><b>Inverted sentences:</b> "Among the findings <i>were</i> two new species." The subject (species) comes after the verb.</li>
  <li><b>Compound subjects</b> joined by <i>and</i> are plural.</li>
</ul>`,
        check: { q: 'Choose the correct option: "The flock of migrating geese ______ south every autumn."', choices: ['fly', 'flies', 'have flown', 'are flying'], answer: 1, why: 'The subject is "flock," which is singular. "Of migrating geese" is a prepositional phrase and doesn\'t change the subject.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Form, Structure, and Sense'] },
      },
      {
        id: 'pronouns',
        title: 'Pronouns and possessives',
        mins: 5,
        body: `
${rule('A pronoun must match the noun it replaces. Singular nouns (including companies, organizations, and countries) take <b>it/its</b>.')}
${bad('The museum announced that they would extend their hours.')}
${good('The museum announced that it would extend its hours.')}
<h3>Apostrophes</h3>
<ul>
  <li><b>its</b> = belonging to it. <b>it's</b> = it is.</li>
  <li><b>their</b> = belonging to them. <b>they're</b> = they are. <b>there</b> = a place.</li>
  <li><b>Singular possessive:</b> the scientist's notes (one scientist).</li>
  <li><b>Plural possessive:</b> the scientists' notes (several scientists).</li>
  <li>Plain plurals take no apostrophe: "The scientists published results."</li>
</ul>
${tip('On possessive questions, ask two things: is it plural or singular, and does it own something? Then pick the form.')}`,
        check: { q: 'Choose the correct option: "Both ______ findings were published in the same journal."', choices: ['researcher\'s', 'researchers', 'researchers\'', 'researcher\'s\''], answer: 2, why: '"Both" means more than one researcher (plural), and the findings belong to them (possessive), so: researchers\'.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Form, Structure, and Sense'] },
      },
      {
        id: 'verbs',
        title: 'Verb tense and form',
        mins: 4,
        body: `
${rule('Match the tense to the time frame already set by the passage. Don\'t switch tenses without a reason.')}
${bad('In 1905, Einstein publishes four papers that changed physics.')}
${good('In 1905, Einstein published four papers that changed physics.')}
<h3>Other verb traps</h3>
<ul>
  <li><b>Past participles</b> after <i>has/have/had</i>: has <i>written</i> (not wrote), had <i>begun</i> (not began).</li>
  <li><b>Parallel structure:</b> items in a list or comparison use the same form. "She likes hiking, swimming, and <i>to bike</i>" should be "biking."</li>
  <li><b>A sentence needs a main verb.</b> "The scientist studying the samples" has no main verb, so it's a fragment.</li>
</ul>`,
        check: { q: 'Choose the correct option: "Last year, the team ______ a new method for filtering water."', choices: ['develops', 'will develop', 'developed', 'has been developing'], answer: 2, why: '"Last year" sets a completed past time frame, so the simple past "developed" fits.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Form, Structure, and Sense'] },
      },
      {
        id: 'modifiers',
        title: 'Modifiers',
        mins: 4,
        body: `
${rule('An introductory phrase describes whatever comes <b>right after the comma</b>.')}
${bad('Having studied for weeks, the exam felt easy.')}
<p>That says the exam studied for weeks.</p>
${good('Having studied for weeks, Maya found the exam easy.')}
<p>On the SAT, these questions usually give you the introductory phrase and ask you to pick how the sentence continues. Pick the choice that puts the <b>right noun first</b>.</p>
${tip('Ask "who or what is doing the action in the opening phrase?" The answer must be the first noun after the comma.')}`,
        check: { q: '"Built in the twelfth century, ______" Which choice completes the sentence correctly?', choices: ['visitors still admire the cathedral\'s stained glass.', 'the cathedral still draws thousands of visitors.', 'thousands of visitors still come to see the cathedral.', 'it is still admired, the cathedral.'], answer: 1, why: 'The cathedral was built in the twelfth century, so "the cathedral" must come right after the comma.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Form, Structure, and Sense'] },
      },
      {
        id: 'strategy',
        title: 'Test-day strategy for grammar questions',
        mins: 3,
        body: `
<ol>
  <li><b>Look at the choices first.</b> What is changing? Punctuation, verb form, or pronoun? That tells you which rule is being tested.</li>
  <li><b>Read the whole sentence</b>, not just the blank. The subject or the second clause is often far away.</li>
  <li><b>Apply the rule</b> from this course, and eliminate every choice that breaks it.</li>
  <li>If two choices are both grammatical, prefer the <b>shorter, clearer</b> one.</li>
</ol>
${rule('Grammar questions are the fastest points on the SAT. Once the rules are automatic, aim for about 30 seconds each, and bank the extra time for reading questions.')}
<p>Next step: drill Boundaries and Form, Structure, and Sense in the question bank, and add any rule you miss to a flashcard set.</p>`,
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries', 'Form, Structure, and Sense'] },
      },
    ],
  },

  {
    id: 'test-strategy',
    subject: 'SAT & ACT',
    icon: 'target',
    title: 'SAT & ACT Study Strategy',
    blurb: 'How to study for each section of the SAT and ACT, learn from your mistakes, and build a plan that turns practice into points.',
    level: 'SAT & ACT',
    lessons: [
      {
        id: 'science-of-learning',
        title: 'How learning actually works',
        mins: 6,
        body: `
<p>Rereading notes and highlighting feel productive, but research on learning shows they're among the weakest methods. Four habits do most of the work:</p>
<h3>1. Active recall</h3>
<p>Pull information <b>out</b> of your memory instead of putting it in again. Close the book and try to write the formula or rule. Struggling to remember is what makes it stick.</p>
<h3>2. Spaced repetition</h3>
<p>Review something a day later, then a few days later, then a week later. Short sessions spread out beat one long cram session.</p>
<h3>3. Interleaving</h3>
<p>Once you know a few skills, mix them. Mixed sets force you to recognize <i>which</i> method a question needs, and that's exactly what the real test demands.</p>
<h3>4. Learning from mistakes</h3>
<p>Every missed question is a lesson. Figure out <b>why</b> you missed it before moving on.</p>
${tip('In StudyFox: flashcards are active recall, your review log handles mistakes, and practice sets with several skills selected give you interleaving.')}`,
        check: { q: 'Which study habit is the least effective way to remember a formula?', choices: ['Covering it and writing it from memory', 'Rereading it several times in a row', 'Reviewing it again a few days later', 'Using it on a mixed practice set'], answer: 1, why: 'Rereading feels familiar but doesn\'t make you retrieve anything. The other three are active recall, spacing, and interleaving.' },
      },
      {
        id: 'math',
        title: 'Learning math concepts',
        mins: 6,
        body: `
<h3>Understand it, then practice it</h3>
<ol>
  <li><b>Learn the idea.</b> Read the formula sheet section or an explanation, and ask <i>why</i> it works. A formula you understand is much easier to remember.</li>
  <li><b>Study one worked example</b> step by step.</li>
  <li><b>Do 5 to 10 questions of just that skill</b> in Tutor mode, starting at Easy and moving up.</li>
  <li><b>Mix it in</b> with other skills once you're getting most right.</li>
</ol>
<h3>Write out your steps</h3>
<p>Most math mistakes on the SAT are careless ones: a dropped negative sign or answering for $x$ when the question asked for $2x$. Writing each step, even briefly, catches them.</p>
<h3>Sort your mistakes</h3>
<ul>
  <li><b>Concept:</b> you didn't know how to do it. Relearn the idea.</li>
  <li><b>Careless:</b> you knew it but slipped. Slow down on that step next time.</li>
  <li><b>Time:</b> you knew it but ran out of time. Practice with Speed mode or Desmos shortcuts.</li>
</ul>
${tip('Explain a concept out loud as if teaching a friend. If you get stuck, that\'s the exact gap to fill.')}`,
        check: { q: 'You missed a question because you solved for $x$ but the question asked for $x + 3$. What type of mistake is this?', choices: ['Concept', 'Careless', 'Time', 'Vocabulary'], answer: 1, why: 'You knew how to solve it but didn\'t answer what was asked. The fix is a habit: underline what the question asks for and check before choosing.' },
        practice: { test: 'SAT', section: 'math' },
      },
      {
        id: 'reading',
        title: 'Learning reading',
        mins: 6,
        body: `
<p>Reading is a skill you build with a process, not facts you memorize.</p>
<h3>A process for every reading question</h3>
<ol>
  <li><b>Read the question first</b> so you know what to look for.</li>
  <li><b>Read the passage for its main point.</b> Summarize it in a few words in your head.</li>
  <li><b>Predict the answer</b> before looking at the choices.</li>
  <li><b>Find evidence.</b> The right answer is always supported by the text, not by outside knowledge.</li>
  <li><b>Eliminate</b> choices that are too extreme, too broad, too narrow, or only partly true.</li>
</ol>
<h3>Vocabulary</h3>
<p>For Words in Context, cover the blank and put in your own simple word, then find the closest match. Build vocabulary by making flashcards from words you miss, with the sentence you saw them in.</p>
<h3>Practice outside the test</h3>
<p>Reading a few articles a week (science news, history, opinion pieces) builds the speed and stamina that practice questions alone can't.</p>`,
        check: { q: 'On a reading question, when should you predict the answer?', choices: ['After reading all four choices', 'Before looking at the choices', 'Only on hard questions', 'Never; just go with what sounds right'], answer: 1, why: 'Predicting first keeps attractive but unsupported choices from pulling you in.' },
        practice: { test: 'SAT', section: 'rw', skills: ['Central Ideas and Details', 'Inferences', 'Words in Context', 'Command of Evidence'] },
      },
      {
        id: 'writing',
        title: 'Learning grammar and writing',
        mins: 4,
        body: `
<p>Grammar is the most learnable part of the SAT, because the same small set of rules is tested again and again.</p>
<ol>
  <li><b>Learn the rules</b> from the <a href="#/learn/grammar">SAT Grammar Rules</a> course.</li>
  <li><b>Drill one rule at a time</b> until you can spot it instantly.</li>
  <li><b>Keep a rule log.</b> For every miss, write the rule you broke in one line. Turn the log into a flashcard set.</li>
  <li><b>Mix all rules together</b> once each is solid.</li>
</ol>
${tip('Don\'t trust "sounds right." The SAT deliberately writes wrong answers that sound natural in casual speech. Name the rule before you pick.')}
<p>For Transitions and Rhetorical Synthesis, focus on logic: what's the relationship between the two sentences, and what's the specific goal the question states?</p>`,
        practice: { test: 'SAT', section: 'rw', skills: ['Boundaries', 'Form, Structure, and Sense', 'Transitions', 'Rhetorical Synthesis'] },
      },
      {
        id: 'science',
        title: 'Learning ACT Science',
        mins: 5,
        body: `
<p>ACT Science is mostly a <b>data-reading</b> test. You rarely need outside science knowledge.</p>
<h3>How to approach a passage</h3>
<ol>
  <li><b>Skim the text quickly</b>. Don't try to understand every detail.</li>
  <li><b>Go straight to the figures.</b> Read the title, the axes, and the units.</li>
  <li><b>Look for trends:</b> as one variable goes up, does the other go up, down, or stay flat?</li>
  <li><b>Answer from the data.</b> Most questions point you to a specific table or figure.</li>
</ol>
<h3>Conflicting viewpoints</h3>
<p>When two or more scientists disagree, write a one-line summary of each view. Most questions ask where they agree or differ.</p>
${tip('Practice reading graphs from news articles and textbooks. Speed at reading axes and units is the real skill.')}`,
        practice: { test: 'ACT', section: 'science' },
      },
      {
        id: 'plan',
        title: 'Building a study plan',
        mins: 5,
        body: `
<ol>
  <li><b>Take a diagnostic.</b> Start with a <a href="#/exams">half-length practice test</a> to see where you stand.</li>
  <li><b>Pick two or three weak areas.</b> Your dashboard shows accuracy by domain.</li>
  <li><b>Study in short, regular sessions.</b> 30 to 45 minutes, four or five days a week, beats one long weekend session.</li>
  <li><b>Split each session:</b> a few minutes of flashcard review, then learning or drilling one weak skill, then a short mixed set.</li>
  <li><b>Review your mistakes weekly</b> from the review log.</li>
  <li><b>Take a full practice test every 2 to 3 weeks</b> to track progress and build stamina.</li>
</ol>
${rule('The week before the test: take one last full practice test, review mistakes, and rest. Get good sleep the last few nights.')}`,
        check: { q: 'Which schedule is most effective for 3 hours of weekly study?', choices: ['One 3-hour session on Sunday', 'About 40 minutes on five different days', 'Rereading notes for 3 hours', 'Only full-length practice tests'], answer: 1, why: 'Spreading study out (spaced repetition) leads to better long-term memory than one long session.' },
      },
    ],
  },
];

// Within each subject, courses show in this order: school courses first, then AP courses.
export const COURSES = [
  ...MATH_COURSES, ...AP_MATH_COURSES,
  ...SCIENCE_COURSES, ...AP_SCIENCE_COURSES,
  ...HUMANITIES_COURSES, ...AP_ENGLISH_COURSES, ...AP_HISTORY_COURSES, ...AP_SOCIAL_COURSES,
  ...AP_CS_COURSES, ...AP_ARTS_COURSES, ...AP_LANGUAGE_COURSES,
  ...TEST_PREP,
];
export const getCourse = (id) => COURSES.find((c) => c.id === id);
export const lessonCount = () => COURSES.reduce((n, c) => n + c.lessons.length, 0);
