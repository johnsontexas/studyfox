// SAT and ACT section courses: one course per test section, each lesson tied to question-bank skills.
import { bad, good, rule, tip, worked, table } from './lesson-kit.js';

const SAT_RW = {
  id: 'sat-rw',
  subject: 'SAT & ACT',
  icon: 'book',
  title: 'SAT Reading and Writing',
  blurb: 'Every question type in the Reading and Writing section, with a method for each and the traps the wrong answers set.',
  level: 'SAT Reading and Writing',
  lessons: [
    {
      id: 'overview',
      title: 'How the section works',
      mins: 6,
      body: `
<p>The Reading and Writing section has two modules of 27 questions each, with 32 minutes per module. That is about <b>70 seconds per question</b>. Every question has its own short passage, usually 25 to 150 words, so you never have to hold a long article in your head.</p>
${table(['Domain', 'Share of section', 'Question types'], [
  ['Craft and Structure', 'about 28%', 'Words in context, text structure and purpose, cross-text connections'],
  ['Information and Ideas', 'about 26%', 'Central ideas, inferences, command of evidence (text and data)'],
  ['Standard English Conventions', 'about 26%', 'Boundaries (punctuation), form, structure, and sense (grammar)'],
  ['Expression of Ideas', 'about 20%', 'Transitions, rhetorical synthesis (student notes)'],
])}
<h3>The order is predictable</h3>
<p>Questions appear grouped by type in roughly the order above: vocabulary first, grammar near the end. Within each group, questions get harder. If a group is going badly, you can flag it and move on, then come back.</p>
${rule('The correct answer is always supported by the text. If you cannot point to the words that prove a choice, it is not the answer.')}
${tip('Grammar and transition questions are the fastest. If time is short at the end of a module, make sure you have answered those.')}`,
      check: { q: 'About how much time do you have per question in a Reading and Writing module?', choices: ['About 30 seconds', 'About 70 seconds', 'About 2 minutes', 'About 3 minutes'], answer: 1, why: '32 minutes for 27 questions is about 71 seconds each.' },
    },
    {
      id: 'words',
      title: 'Words in context',
      mins: 7,
      body: `
<p>These questions give a sentence with a blank and ask for the most logical and precise word. The test is not about hard vocabulary for its own sake. It is about reading the clues around the blank.</p>
<h3>The method</h3>
<ol>
  <li><b>Cover the choices.</b> Read the passage and predict your own word for the blank, even a simple one like "careful" or "not enough."</li>
  <li><b>Find the clue.</b> There is always a phrase that defines the blank: an example after a colon, a contrast word like <i>although</i> or <i>but</i>, or a cause and effect.</li>
  <li><b>Match.</b> Pick the choice closest to your prediction. Eliminate choices with the wrong charge (positive versus negative) first.</li>
</ol>
${worked('Example', '<p>"The novelist\'s prose is notably ______: she rarely uses more words than necessary."</p><p>The colon explains the blank: using few words. Predict "short" or "efficient." The answer is <b>economical</b>, not <i>ornate</i> or <i>verbose</i>.</p>')}
${rule('Contrast words (<i>although, but, however, despite, unlike</i>) flip the meaning. Continuation words (<i>and, because, so, in fact</i>, a colon) keep it.')}
${tip('If you do not know a choice, don\'t pick it just because it sounds impressive. Choose a word you know fits before an unknown word.')}`,
      check: { q: '"Although the first report was praised, the second was considered ______, offering few details." Which word fits?', choices: ['exhaustive', 'cursory', 'meticulous', 'celebrated'], answer: 1, why: '"Although" contrasts with praise, and "few details" defines the blank: hasty and shallow, or "cursory."' },
      practice: { test: 'SAT', section: 'rw', skills: ['Words in Context'] },
    },
    {
      id: 'central-inference',
      title: 'Central ideas and inferences',
      mins: 8,
      body: `
<h3>Central idea questions</h3>
<p>The main idea covers the <b>whole</b> passage, not one sentence of it. Many passages follow a pattern: an old belief, then new evidence that changes it. In that case, the main idea is the new view.</p>
${bad('A choice that is true but only describes one detail.')}
${bad('A choice that goes further than the text ("always," "only," "proves").')}
${good('A choice that sums up what the passage as a whole is saying.')}
<h3>Inference questions</h3>
<p>These end with an unfinished sentence: "Which choice most logically completes the text?" The answer is the conclusion the evidence leads to and <b>nothing more</b>.</p>
<ol>
  <li>Find what changed and what stayed the same. If two groups were treated the same except for one thing, that one thing explains the difference.</li>
  <li>Predict the ending in your own words before reading the choices.</li>
  <li>Reject choices that bring in outside ideas or make a stronger claim than the evidence supports.</li>
</ol>
${worked('Example', '<p>Two rows of beans got the same water, but one was in the sun and one in shade. The sunny row grew twice as tall. This suggests that...</p><p>Only sunlight differed, so the answer is that <b>sunlight affected growth</b>. A choice like "shade kills bean plants" goes too far.</p>')}`,
      check: { q: 'A passage says scientists believed X, but new studies found Y. What is the main idea most likely to be?', choices: ['Scientists believed X.', 'New evidence suggests Y, changing the earlier view.', 'Scientists are often wrong.', 'Studies are expensive.'], answer: 1, why: 'When a passage presents an old belief and new evidence, the main idea is the updated view the evidence supports.' },
      practice: { test: 'SAT', section: 'rw', skills: ['Central Ideas and Details', 'Inferences'] },
    },
    {
      id: 'evidence',
      title: 'Command of evidence: text and data',
      mins: 8,
      body: `
<p>These questions give you a claim and ask which finding, quotation, or data point supports (or weakens) it.</p>
<h3>Text evidence</h3>
<ol>
  <li><b>Write the claim down in a few words.</b> For example: "urban foxes are bolder."</li>
  <li>Ask what would prove <i>exactly that</i>. A finding about foxes' diet does not prove boldness, even if it is about urban foxes.</li>
  <li>For quotation questions about a poem or novel, the right quote must show <b>every part</b> of the claim. If the claim is "the tone shifts from despair to hope," the quote needs both.</li>
</ol>
<h3>Data evidence (tables and graphs)</h3>
<ol>
  <li>Read the title, axis labels, and units first.</li>
  <li>Read the claim, then check each choice against the data. Wrong choices often state <b>true numbers that don't address the claim</b>, or numbers that are slightly off.</li>
  <li>If the claim has two parts (for example "rose in A <i>while</i> it fell in B"), the answer must address both.</li>
</ol>
${rule('Support means "if this were true, the claim would be more likely." Weaken means the claim would be less likely. A choice about a different topic does neither.')}`,
      check: { q: 'Claim: "Reading aloud to children helps them learn words." Which finding most directly supports it?', choices: ['Many children\'s books rhyme.', 'Children read to daily knew more words at age four than children rarely read to.', 'Parents prefer reading at bedtime.', 'Libraries have story hours.'], answer: 1, why: 'Only this finding connects reading aloud to the outcome in the claim: knowing more words.' },
      practice: { test: 'SAT', section: 'rw', skills: ['Command of Evidence', 'Command of Evidence (Quantitative)'] },
    },
    {
      id: 'structure',
      title: 'Text structure, purpose, and two texts',
      mins: 7,
      body: `
<h3>Structure and purpose</h3>
<p>Purpose questions ask <i>why</i> the author wrote the passage; structure questions ask <i>how</i> it is organized. Describe each sentence's job in a few words: "old belief," "evidence against it," "new conclusion." Then pick the choice that matches that outline.</p>
${tip('Check the verb in each choice: <i>argue, describe, explain, criticize, compare</i>. If the passage never argues, an "argue" choice is wrong no matter what follows.')}
<h3>Function of a sentence</h3>
<p>When a question asks about one underlined sentence, look at what comes right before and after it. Common jobs: introducing an example, connecting a detail to a conclusion, or presenting a counterargument.</p>
<h3>Cross-text connections</h3>
<p>Two short texts discuss the same topic. Most questions ask how the author of Text 2 would respond to Text 1.</p>
<ol>
  <li>Summarize each text in one line.</li>
  <li>Decide the relationship: agrees, disagrees, or <b>partly agrees</b> (accepts the facts but rejects the conclusion). Partial agreement is the most common correct answer.</li>
</ol>
${bad('Choices that make Text 2 more extreme than it is ("denies that any drought occurred").')}`,
      check: { q: 'Text 1 says a drought caused a city\'s decline. Text 2 agrees there was a drought but says flooding and conflict also mattered. How would Text 2 respond to Text 1?', choices: ['By denying the drought happened', 'By accepting the drought but rejecting it as the only cause', 'By agreeing completely', 'By saying the city never declined'], answer: 1, why: 'Text 2 accepts the drought but argues it was one of several causes: partial agreement.' },
      practice: { test: 'SAT', section: 'rw', skills: ['Text Structure and Purpose', 'Cross-Text Connections'] },
    },
    {
      id: 'expression',
      title: 'Transitions and student notes',
      mins: 7,
      body: `
<h3>Transitions</h3>
<p>Cover the blank and decide the relationship between the two sentences before looking at the choices.</p>
${table(['Relationship', 'Transitions'], [
  ['Contrast', 'However, Nevertheless, By contrast, Still'],
  ['Result', 'Therefore, As a result, Consequently, Thus'],
  ['Addition', 'Moreover, Furthermore, In addition'],
  ['Example', 'For example, For instance'],
  ['Time order', 'Later, Subsequently, Afterward'],
  ['Similarity', 'Similarly, Likewise'],
])}
${tip('Two choices with the same meaning (like "Therefore" and "Thus") can\'t both be right, so both are usually wrong.')}
<h3>Rhetorical synthesis (student notes)</h3>
<p>You get bullet-point notes and a goal, like "emphasize a difference" or "introduce the topic to a new audience." <b>Read the goal first</b> and ignore the notes until you know what you need.</p>
<ol>
  <li>Underline the key words in the goal: <i>contrast, emphasize, explain why, introduce</i>.</li>
  <li>Eliminate every choice that doesn't do that job, even if it is accurate.</li>
  <li>For "audience unfamiliar with" goals, the answer must explain who or what the subject is.</li>
</ol>
${rule('In synthesis questions every choice is usually true. The only question is which one meets the goal.')}`,
      check: { q: '"The bakery ran out of flour early. ______, it closed at noon." Which transition fits?', choices: ['However', 'As a result', 'For example', 'Similarly'], answer: 1, why: 'Closing early was caused by running out of flour, so the relationship is cause and effect: "As a result."' },
      practice: { test: 'SAT', section: 'rw', skills: ['Transitions', 'Rhetorical Synthesis'] },
    },
  ],
};

const SAT_MATH_ALG = {
  id: 'sat-math-algebra',
  subject: 'SAT & ACT',
  icon: 'integral',
  title: 'SAT Math: Algebra and Advanced Math',
  blurb: 'Linear equations, systems, inequalities, quadratics, and exponential functions, the two domains that make up about 70% of SAT Math.',
  level: 'SAT Math',
  lessons: [
    {
      id: 'linear-eq',
      title: 'Linear equations and functions',
      mins: 8,
      body: `
<p>A linear function has the form $f(x) = mx + b$. On the SAT you must read $m$ and $b$ as real quantities, not just numbers.</p>
${rule('$m$ is the <b>rate of change</b> (how much $y$ changes when $x$ goes up by 1). $b$ is the <b>starting value</b> (the value of $y$ when $x = 0$).')}
${worked('Example', '<p>A plumber charges $C = 75h + 40$ dollars for $h$ hours of work. What does 40 represent?</p><p>When $h = 0$, $C = 40$, so 40 is a fixed fee charged before any hours are worked. The 75 is the charge per hour.</p>')}
<h3>Solving one-variable equations</h3>
<p>Distribute, combine like terms, and isolate $x$. Watch for these special cases:</p>
<ul>
  <li>If the $x$ terms cancel and you get a true statement like $5 = 5$, there are <b>infinitely many solutions</b>.</li>
  <li>If you get a false statement like $5 = 7$, there is <b>no solution</b>.</li>
</ul>
${tip('"No solution" questions with a constant like $k$: set the $x$ coefficients equal and make sure the constants are different.')}`,
      check: { q: 'For what value of $k$ does $3(x + 2) = kx + 5$ have no solution?', choices: ['$k = 2$', '$k = 3$', '$k = 5$', '$k = 6$'], answer: 1, why: 'Left side: $3x + 6$. With $k = 3$, you get $3x + 6 = 3x + 5$, which is never true. So there is no solution.' },
      practice: { test: 'SAT', section: 'math', skills: ['Linear equations in one variable', 'Linear functions', 'Linear equations in two variables'] },
    },
    {
      id: 'systems',
      title: 'Systems of linear equations',
      mins: 8,
      body: `
<p>A system's solution is the point where the lines meet. There are three ways to solve:</p>
<ul>
  <li><b>Substitution:</b> best when one equation is already solved for a variable.</li>
  <li><b>Elimination:</b> add or subtract the equations to cancel a variable.</li>
  <li><b>Desmos:</b> graph both and click the intersection.</li>
</ul>
<h3>How many solutions?</h3>
${table(['Lines', 'Solutions', 'Slopes and intercepts'], [
  ['Cross once', 'One', 'Different slopes'],
  ['Parallel', 'None', 'Same slope, different intercepts'],
  ['Same line', 'Infinitely many', 'Same slope, same intercept'],
])}
${worked('Example', '<p>$2x + 3y = 12$ and $4x + ky = 20$ have no solution. Find $k$.</p><p>Multiply the first by 2: $4x + 6y = 24$. For parallel lines the $y$ coefficients must match, so $k = 6$. The constants (24 and 20) differ, so the lines never meet.</p>')}
${tip('If a question asks for $x + y$ or another combination, try adding or subtracting the equations directly before solving for each variable.')}`,
      check: { q: 'If $x + y = 10$ and $x - y = 4$, what is $x$?', choices: ['3', '6', '7', '14'], answer: 2, why: 'Add the equations: $2x = 14$, so $x = 7$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Systems of two linear equations in two variables'] },
    },
    {
      id: 'inequalities',
      title: 'Linear inequalities',
      mins: 6,
      body: `
<p>Solve an inequality like an equation, with one extra rule:</p>
${rule('When you multiply or divide both sides by a <b>negative</b> number, flip the inequality sign.')}
<h3>Word problems</h3>
<p>Translate carefully. "At least" means $\\ge$, "at most" and "no more than" mean $\\le$, and "more than" means $>$.</p>
${worked('Example', '<p>A van can carry at most 1,200 pounds. The driver weighs 180 pounds, and each box weighs 60 pounds. What is the most boxes the van can carry?</p><p>$180 + 60b \\le 1200$, so $60b \\le 1020$ and $b \\le 17$. The answer is 17 boxes.</p>')}
<h3>Graphs of inequalities</h3>
<p>A solid line means the boundary is included ($\\le$ or $\\ge$); a dashed line means it is not. To check a point, plug it into the inequality, or type it into Desmos and see whether it falls in the shaded region.</p>`,
      check: { q: 'Solve $-3x + 4 > 10$.', choices: ['$x > -2$', '$x < -2$', '$x > 2$', '$x < 2$'], answer: 1, why: '$-3x > 6$. Dividing by $-3$ flips the sign: $x < -2$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Linear inequalities in one or two variables'] },
    },
    {
      id: 'quadratics',
      title: 'Quadratics in every form',
      mins: 9,
      body: `
<p>The SAT uses three forms of a quadratic. Each one shows a different feature of the parabola.</p>
${table(['Form', 'Example', 'Shows you'], [
  ['Standard', '$y = x^2 - 6x + 5$', 'The y-intercept (5)'],
  ['Factored', '$y = (x - 1)(x - 5)$', 'The x-intercepts (1 and 5)'],
  ['Vertex', '$y = (x - 3)^2 - 4$', 'The vertex $(3, -4)$'],
])}
<h3>Useful facts</h3>
<ul>
  <li>The vertex's x-coordinate is $x = -\\frac{b}{2a}$, halfway between the x-intercepts.</li>
  <li>The sum of the solutions of $ax^2 + bx + c = 0$ is $-\\frac{b}{a}$, and their product is $\\frac{c}{a}$.</li>
  <li>The discriminant $b^2 - 4ac$ tells how many real solutions there are: positive means two, zero means one, negative means none.</li>
</ul>
${worked('Example', '<p>For what value of $c$ does $x^2 + 8x + c = 0$ have exactly one real solution?</p><p>Set the discriminant to zero: $64 - 4c = 0$, so $c = 16$.</p>')}
${tip('When the equation is messy, graph it in Desmos and click the x-intercepts.')}`,
      check: { q: 'What is the vertex of $y = (x + 2)^2 - 7$?', choices: ['$(2, -7)$', '$(-2, -7)$', '$(2, 7)$', '$(-2, 7)$'], answer: 1, why: 'Vertex form $(x - h)^2 + k$ has vertex $(h, k)$. Here $x + 2 = x - (-2)$, so the vertex is $(-2, -7)$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Nonlinear equations in one variable', 'Nonlinear functions'] },
    },
    {
      id: 'exponential',
      title: 'Exponential growth and decay',
      mins: 7,
      body: `
<p>An exponential function multiplies by the same factor over equal time steps: $f(t) = a \\cdot b^t$.</p>
${rule('$a$ is the starting amount. If $b > 1$ the quantity grows; if $0 < b < 1$ it decays. Growth by $r$ percent means $b = 1 + r$; decay by $r$ percent means $b = 1 - r$.')}
${worked('Example', '<p>A town of 8,000 people grows by 3% per year. Write a model.</p><p>$P(t) = 8000(1.03)^t$. After 10 years, $P \\approx 10{,}751$.</p>')}
<h3>Linear or exponential?</h3>
<p>Linear changes by the same <b>amount</b> each step (add 50 each year). Exponential changes by the same <b>percent or factor</b> each step (double each year, lose 10% each year).</p>
${tip('Watch the time units. If something doubles every 3 years, the model is $a \\cdot 2^{t/3}$ when $t$ is in years.')}`,
      check: { q: 'A car worth \\$20,000 loses 15% of its value each year. Which expression gives its value after $t$ years?', choices: ['$20000(0.15)^t$', '$20000(0.85)^t$', '$20000(1.15)^t$', '$20000 - 0.15t$'], answer: 1, why: 'Losing 15% leaves 85% each year, so multiply by $0.85$ each year.' },
      practice: { test: 'SAT', section: 'math', skills: ['Nonlinear functions'] },
    },
    {
      id: 'expressions',
      title: 'Equivalent expressions',
      mins: 7,
      body: `
<p>These questions ask which expression is equivalent to the one given. Know the main rules:</p>
${table(['Rule', 'Example'], [
  ['Multiply powers: add exponents', '$x^3 \\cdot x^4 = x^7$'],
  ['Power of a power: multiply exponents', '$(x^3)^4 = x^{12}$'],
  ['Divide powers: subtract exponents', '$\\frac{x^7}{x^2} = x^5$'],
  ['Fractional exponents are roots', '$x^{1/2} = \\sqrt{x}$, $x^{2/3} = \\sqrt[3]{x^2}$'],
  ['Difference of squares', '$a^2 - b^2 = (a - b)(a + b)$'],
  ['Perfect square', '$(a + b)^2 = a^2 + 2ab + b^2$'],
])}
${tip('The fastest check: pick a value like $x = 2$, evaluate the original and each choice, and keep the one that matches. Avoid 0 and 1, since too many expressions agree there.')}
${bad('$(x + 3)^2 = x^2 + 9$. This forgets the middle term $6x$.')}
${good('$(x + 3)^2 = x^2 + 6x + 9$.')}`,
      check: { q: 'Which is equivalent to $\\frac{(x^3)^2}{x^4}$?', choices: ['$x$', '$x^2$', '$x^5$', '$x^{10}$'], answer: 1, why: '$(x^3)^2 = x^6$, and $\\frac{x^6}{x^4} = x^2$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Equivalent expressions'] },
    },
  ],
};

const SAT_MATH_DATA = {
  id: 'sat-math-data-geo',
  subject: 'SAT & ACT',
  icon: 'chart',
  title: 'SAT Math: Data, Geometry, and Trig',
  blurb: 'Percentages, rates, statistics, probability, area and volume, triangles, trigonometry, and circles.',
  level: 'SAT Math',
  lessons: [
    {
      id: 'percent',
      title: 'Percentages',
      mins: 7,
      body: `
${rule('A percent change is $\\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100$. Always divide by the <b>original</b> value.')}
<ul>
  <li>Increase by 20%: multiply by $1.2$. Decrease by 20%: multiply by $0.8$.</li>
  <li>Back-to-back changes multiply: a 20% increase then a 20% decrease is $1.2 \\times 0.8 = 0.96$, a 4% <b>decrease</b> overall.</li>
  <li>"$p$ percent of $x$" is $\\frac{p}{100}x$.</li>
</ul>
${worked('Example', '<p>After a 25% discount, a jacket costs \\$60. What was the original price?</p><p>$0.75x = 60$, so $x = 80$. The original price was \\$80.</p>')}
${tip('To find the original amount after a change, divide by the multiplier. Do not add the percent back on to the new price.')}`,
      check: { q: 'A price rises from \\$40 to \\$50. What is the percent increase?', choices: ['10%', '20%', '25%', '50%'], answer: 2, why: '$\\frac{50 - 40}{40} = \\frac{10}{40} = 0.25$, or 25%.' },
      practice: { test: 'SAT', section: 'math', skills: ['Percentages'] },
    },
    {
      id: 'ratios',
      title: 'Ratios, rates, and units',
      mins: 7,
      body: `
<p>Set up a proportion with matching units in the same positions, then cross-multiply.</p>
${worked('Example', '<p>A recipe uses 3 cups of flour for every 2 cups of sugar. How much flour goes with 5 cups of sugar?</p><p>$\\frac{3}{2} = \\frac{f}{5}$, so $f = 7.5$ cups.</p>')}
<h3>Unit conversions</h3>
<p>Multiply by fractions equal to 1 so the units you don't want cancel.</p>
${worked('Example', '<p>Convert 72 kilometers per hour to meters per second.</p><p>$72 \\cdot \\frac{1000 \\text{ m}}{1 \\text{ km}} \\cdot \\frac{1 \\text{ h}}{3600 \\text{ s}} = 20$ meters per second.</p>')}
${rule('For area, square the conversion: 1 square foot is $12^2 = 144$ square inches. For volume, cube it: 1 cubic foot is $12^3 = 1{,}728$ cubic inches.')}`,
      check: { q: 'How many square inches are in 3 square feet?', choices: ['36', '108', '432', '1,296'], answer: 2, why: '1 square foot is 144 square inches, so 3 square feet is $3 \\times 144 = 432$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Ratios, rates, proportional relationships, and units'] },
    },
    {
      id: 'stats',
      title: 'Mean, median, and spread',
      mins: 8,
      body: `
<ul>
  <li><b>Mean:</b> the sum divided by the count. It is pulled toward outliers.</li>
  <li><b>Median:</b> the middle value when sorted. Outliers barely change it.</li>
  <li><b>Range:</b> maximum minus minimum.</li>
  <li><b>Standard deviation:</b> how spread out the data are around the mean. More bunched data means a smaller standard deviation.</li>
</ul>
${worked('Example', '<p>Data: 4, 5, 5, 6, 40. Mean $= 60 \\div 5 = 12$. Median $= 5$. Removing 40 drops the mean to 5 but barely changes the median.</p>')}
${tip('If the question gives a mean and asks for a missing value, use the total: mean times count equals sum.')}
<h3>Samples and surveys</h3>
<p>A result can only be generalized to the population the sample was <b>randomly</b> drawn from. A larger random sample gives a smaller margin of error. A survey of one school's students tells you about that school, not the whole country.</p>`,
      check: { q: 'Five test scores have a mean of 82. Four of them are 80, 85, 78, and 90. What is the fifth?', choices: ['75', '77', '82', '85'], answer: 1, why: 'Total $= 82 \\times 5 = 410$. The four known scores sum to 333, so the fifth is $410 - 333 = 77$.' },
      practice: { test: 'SAT', section: 'math', skills: ['One-variable data: distributions and measures of center and spread', 'Two-variable data: models and scatterplots'] },
    },
    {
      id: 'probability',
      title: 'Probability and two-way tables',
      mins: 6,
      body: `
<p>Probability is $\\frac{\\text{favorable outcomes}}{\\text{total outcomes}}$. On the SAT, most probability questions use a two-way table.</p>
${rule('Read the condition carefully. "Given that the student is a junior" means the denominator is the number of <b>juniors</b>, not the whole table.')}
${table(['', 'Plays sport', 'No sport', 'Total'], [
  ['Juniors', '30', '20', '50'],
  ['Seniors', '25', '45', '70'],
  ['Total', '55', '65', '120'],
])}
<p>Probability that a randomly chosen student plays a sport: $\\frac{55}{120}$. Probability that a <b>junior</b> plays a sport: $\\frac{30}{50} = 0.6$. Probability that a sport player is a junior: $\\frac{30}{55}$.</p>`,
      check: { q: 'Using the table, what is the probability that a randomly chosen senior does not play a sport?', choices: ['$\\frac{45}{120}$', '$\\frac{45}{65}$', '$\\frac{45}{70}$', '$\\frac{25}{70}$'], answer: 2, why: 'The condition "senior" limits the group to 70 students, and 45 of them play no sport: $\\frac{45}{70}$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Probability and conditional probability'] },
    },
    {
      id: 'area-volume',
      title: 'Area and volume',
      mins: 6,
      body: `
<p>The SAT gives you a reference sheet with every area and volume formula you need. Know where it is and use it.</p>
${rule('Scaling: if every length is multiplied by $k$, area is multiplied by $k^2$ and volume by $k^3$.')}
${worked('Example', '<p>A cylinder has radius 3 and height 10. Its volume is $\\pi r^2 h = \\pi(9)(10) = 90\\pi$.</p><p>If the radius doubles, the volume is multiplied by 4, giving $360\\pi$.</p>')}
${tip('For composite shapes, split them into rectangles, triangles, and circles, find each area, and add or subtract.')}`,
      check: { q: 'A cube has edges of length 3. If each edge is tripled, the new volume is how many times the original?', choices: ['3', '9', '27', '81'], answer: 2, why: 'Lengths multiplied by 3 means volume is multiplied by $3^3 = 27$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Area and volume'] },
    },
    {
      id: 'triangles',
      title: 'Lines, angles, and triangles',
      mins: 7,
      body: `
<ul>
  <li>Angles in a triangle sum to $180^\\circ$. Angles on a straight line sum to $180^\\circ$.</li>
  <li>When a line crosses two parallel lines, corresponding and alternate interior angles are equal.</li>
  <li><b>Similar triangles</b> have equal angles and proportional sides. A line parallel to one side of a triangle creates a smaller similar triangle.</li>
  <li>An exterior angle of a triangle equals the sum of the two far interior angles.</li>
</ul>
${worked('Example', '<p>Triangles $ABC$ and $DEF$ are similar with $AB = 6$, $DE = 9$, and $BC = 8$. Find $EF$.</p><p>The scale factor is $\\frac{9}{6} = 1.5$, so $EF = 8 \\times 1.5 = 12$.</p>')}`,
      check: { q: 'Two angles of a triangle measure $48^\\circ$ and $77^\\circ$. What is the third angle?', choices: ['$45^\\circ$', '$55^\\circ$', '$65^\\circ$', '$125^\\circ$'], answer: 1, why: '$180 - 48 - 77 = 55$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Lines, angles, and triangles'] },
    },
    {
      id: 'trig-circles',
      title: 'Right triangles, trig, and circles',
      mins: 9,
      body: `
<h3>Right triangles</h3>
<p>Pythagorean theorem: $a^2 + b^2 = c^2$. Know the special right triangles (both are on the reference sheet):</p>
<ul>
  <li>$45$-$45$-$90$: sides $x$, $x$, $x\\sqrt{2}$.</li>
  <li>$30$-$60$-$90$: sides $x$, $x\\sqrt{3}$, $2x$.</li>
</ul>
<h3>Trig ratios</h3>
<p>SOH CAH TOA: $\\sin = \\frac{\\text{opp}}{\\text{hyp}}$, $\\cos = \\frac{\\text{adj}}{\\text{hyp}}$, $\\tan = \\frac{\\text{opp}}{\\text{adj}}$.</p>
${rule('In a right triangle, $\\sin(x^\\circ) = \\cos(90^\\circ - x^\\circ)$. This identity shows up on almost every test.')}
<h3>Circles</h3>
<ul>
  <li>Equation: $(x - h)^2 + (y - k)^2 = r^2$, center $(h, k)$, radius $r$. If the equation is expanded, complete the square to find the center.</li>
  <li>Arc length $= \\frac{\\theta}{360} \\cdot 2\\pi r$. Sector area $= \\frac{\\theta}{360} \\cdot \\pi r^2$.</li>
  <li>Radians: $\\pi$ radians $= 180^\\circ$.</li>
</ul>`,
      check: { q: 'In a right triangle, $\\sin(x^\\circ) = 0.6$. What is $\\cos((90 - x)^\\circ)$?', choices: ['0.4', '0.6', '0.8', '1.6'], answer: 1, why: 'Sine of an angle equals cosine of its complement, so $\\cos((90 - x)^\\circ) = 0.6$.' },
      practice: { test: 'SAT', section: 'math', skills: ['Right triangles and trigonometry', 'Circles'] },
    },
  ],
};

const ACT_ENGLISH = {
  id: 'act-english',
  subject: 'SAT & ACT',
  icon: 'edit',
  title: 'ACT English',
  blurb: 'Punctuation, grammar, concise writing, transitions, and the "should the writer add this?" questions, with the rules the ACT tests most.',
  level: 'ACT English',
  lessons: [
    {
      id: 'format',
      title: 'How ACT English works',
      mins: 5,
      body: `
<p>ACT English gives you essays with underlined portions. For each one, you choose the best version, and choice A is usually <b>NO CHANGE</b>. Some questions ask about the essay as a whole: whether to add or delete a sentence, where a sentence belongs, or whether the essay met a goal.</p>
<p>On the enhanced ACT you have <b>35 minutes for 50 questions</b>, about 42 seconds each.</p>
${rule('Read the full sentence, not just the underlined part. Many errors only show up when you see what comes before and after.')}
${tip('NO CHANGE is right about as often as any other letter. Don\'t avoid it, and don\'t pick it just because the sentence "sounds okay."')}
${tip('When all four choices say the same thing, the <b>shortest</b> grammatically correct one is usually right.')}`,
      check: { q: 'On ACT English, which choice is usually NO CHANGE?', choices: ['A', 'B', 'C', 'D'], answer: 0, why: 'Choice A keeps the underlined portion as it is written in the passage.' },
      practice: { test: 'ACT', section: 'english', skills: ['Punctuation', 'Grammar and usage'] },
    },
    {
      id: 'punctuation',
      title: 'Commas, semicolons, colons, and dashes',
      mins: 9,
      body: `
${table(['Mark', 'Use it to', 'Needs'], [
  ['Period / semicolon', 'Join two complete sentences', 'Independent clause on both sides'],
  ['Comma + FANBOYS', 'Join two complete sentences', 'For, and, nor, but, or, yet, so'],
  ['Colon', 'Introduce a list, explanation, or quote', 'Independent clause before it'],
  ['Pair of commas or dashes', 'Set off extra information', 'The same mark on both ends'],
])}
${bad('The storm passed, the streets were flooded. (comma splice)')}
${good('The storm passed; the streets were flooded.')}
${good('The storm passed, but the streets were flooded.')}
<h3>Extra information</h3>
<p>If you can remove a phrase and the sentence still makes sense and keeps its meaning, the phrase is nonessential and needs commas (or dashes) on <b>both</b> sides.</p>
${bad('My sister, a nurse at Mercy Hospital works nights.')}
${good('My sister, a nurse at Mercy Hospital, works nights.')}
${rule('Never put a single comma between a subject and its verb, or between a verb and its object.')}`,
      check: { q: 'Which is punctuated correctly?', choices: ['I love the ocean, I go every summer.', 'I love the ocean; I go every summer.', 'I love the ocean: and I go every summer.', 'I love the ocean I go every summer.'], answer: 1, why: 'Both parts are complete sentences, so a semicolon joins them. The first is a comma splice and the last is a run-on.' },
      practice: { test: 'ACT', section: 'english', skills: ['Punctuation'] },
    },
    {
      id: 'grammar',
      title: 'Agreement, verbs, pronouns, and modifiers',
      mins: 9,
      body: `
<h3>Subject-verb agreement</h3>
<p>Cross out the phrases between the subject and the verb. "The box <s>of old photographs</s> contains." Words like <i>each, every, either, neither, everyone</i> are singular.</p>
<h3>Verb tense</h3>
<p>Match the tense of the rest of the paragraph unless a time word signals a change. Use "had" plus a past participle for an action that happened before another past action.</p>
<h3>Pronouns</h3>
<ul>
  <li>Match the number of the noun: <i>the company... its</i>, <i>the rocks... them</i>.</li>
  <li>Use <i>who</i> for subjects and <i>whom</i> for objects (if you could answer "him," use <i>whom</i>).</li>
  <li><i>Its</i> is possessive; <i>it's</i> means "it is." <i>Their</i>, <i>there</i>, and <i>they're</i> follow the same logic.</li>
</ul>
<h3>Modifiers</h3>
${bad('Walking to school, the rain soaked my backpack.')}
${good('Walking to school, I got my backpack soaked by the rain.')}
${rule('An opening descriptive phrase must be followed right away by the person or thing it describes.')}`,
      check: { q: '"Each of the players ______ a new jersey." Which verb fits?', choices: ['have', 'has', 'are having', 'were having'], answer: 1, why: '"Each" is singular, so the verb is "has." "Of the players" doesn\'t change the subject.' },
      practice: { test: 'ACT', section: 'english', skills: ['Grammar and usage'] },
    },
    {
      id: 'concise',
      title: 'Concise and precise wording',
      mins: 6,
      body: `
<p>The ACT rewards writing that says the most with the fewest words, as long as nothing important is lost.</p>
${bad('The annual festival, which happens every year, draws large crowds.')}
${good('The annual festival draws large crowds.')}
<p>"Annual" already means "every year," so the clause is redundant.</p>
<h3>Word choice</h3>
<p>For "most precise word" questions, pick the word whose exact meaning fits the context and tone. Avoid slang in a formal essay and avoid words that are close in meaning but slightly off.</p>
${tip('When the choices differ only in length, check the shortest one first. If it is grammatically correct and keeps the meaning, it is almost always the answer.')}
${tip('"OMIT the underlined portion" is often correct when the underlined part is redundant or off-topic.')}`,
      check: { q: 'Which is the most concise correct version: "She returned back to the city where she was born."', choices: ['returned back to', 'returned to', 'returned back again to', 'went and returned to'], answer: 1, why: '"Returned" already means "went back," so "back" is redundant.' },
      practice: { test: 'ACT', section: 'english', skills: ['Precise word choice'] },
    },
    {
      id: 'organization',
      title: 'Transitions and organization',
      mins: 6,
      body: `
<p>Transition questions work the same way on the ACT as on the SAT: identify the relationship between the ideas, then choose the word that signals it (contrast, result, addition, example, time).</p>
<h3>Sentence placement</h3>
<p>When asked where a sentence belongs, look for <b>links</b>: a pronoun that needs an earlier noun ("this method," "she"), a time word ("later," "first"), or an idea that continues the one before.</p>
<h3>Opening and closing sentences</h3>
<p>A good paragraph opener introduces what the paragraph is about. A good closer wraps up the paragraph or leads into the next one. Read the whole paragraph before you choose.</p>
${tip('Watch out for a transition that is technically logical but connects the wrong two ideas.')}`,
      check: { q: 'A sentence begins, "This discovery changed how scientists studied the reef." Where should it most likely go?', choices: ['As the first sentence of the essay', 'Right after a sentence that describes a discovery', 'Right before the sentence that describes the discovery', 'At the end of an unrelated paragraph'], answer: 1, why: '"This discovery" points back to something already described, so the sentence must come right after the discovery is mentioned.' },
      practice: { test: 'ACT', section: 'english', skills: ['Transitions'] },
    },
    {
      id: 'purpose',
      title: '"Should the writer add this?"',
      mins: 6,
      body: `
<p>These questions describe a possible addition or deletion and ask whether the writer should make it, with a reason attached to each choice.</p>
<ol>
  <li><b>Decide yes or no first.</b> Does the sentence fit the paragraph's focus? If it drifts to another topic, the answer is no.</li>
  <li><b>Then check the reason.</b> Two choices say yes and two say no. Pick the one whose reason accurately describes the sentence and the paragraph.</li>
</ol>
${rule('A sentence can be interesting and true and still be wrong to add if it doesn\'t support the paragraph\'s main point.')}
<h3>"Did the essay accomplish its goal?"</h3>
<p>At the end of a passage, you may be asked whether the essay met a specific goal. Compare the goal to what the essay actually focused on. If the goal is "describe the history of jazz" and the essay is about one musician's childhood, the answer is no.</p>`,
      check: { q: 'A paragraph explains how bees make honey. The writer considers adding a sentence about a famous beekeeper\'s birthday. Should the writer add it?', choices: ['Yes, because it adds an interesting detail.', 'Yes, because it explains how honey is made.', 'No, because it doesn\'t relate to how bees make honey.', 'No, because beekeepers are never mentioned.'], answer: 2, why: 'The paragraph\'s focus is how honey is made, and a birthday doesn\'t support that point.' },
      practice: { test: 'ACT', section: 'english', skills: ['Purpose and focus'] },
    },
  ],
};

const ACT_MATH = {
  id: 'act-math',
  subject: 'SAT & ACT',
  icon: 'calculator',
  title: 'ACT Math',
  blurb: 'Pacing, the topics the ACT tests that the SAT doesn\'t (matrices, logs, complex numbers, counting), and the formulas you must memorize.',
  level: 'ACT Math',
  lessons: [
    {
      id: 'pacing',
      title: 'Pacing and formulas to memorize',
      mins: 6,
      body: `
<p>The enhanced ACT Math test has <b>45 questions in 50 minutes</b>, a little over a minute each. Questions get harder as you go, so the early ones should be quick. You can use an approved calculator on every question.</p>
${rule('The ACT does <b>not</b> give a formula sheet. You must memorize the formulas below.')}
${table(['Topic', 'Formula'], [
  ['Slope', '$m = \\frac{y_2 - y_1}{x_2 - x_1}$'],
  ['Midpoint', '$\\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$'],
  ['Distance', '$\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$'],
  ['Quadratic formula', '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$'],
  ['Circle', 'Area $\\pi r^2$, circumference $2\\pi r$'],
  ['Triangle', 'Area $\\frac{1}{2}bh$'],
  ['Cylinder', 'Volume $\\pi r^2 h$'],
  ['Interior angles of a polygon', '$(n - 2) \\cdot 180^\\circ$'],
])}
${tip('Skip any question that will take more than two minutes, mark it, and return. Every question is worth the same.')}`,
      check: { q: 'What is the sum of the interior angles of a hexagon?', choices: ['$540^\\circ$', '$720^\\circ$', '$900^\\circ$', '$1080^\\circ$'], answer: 1, why: '$(6 - 2) \\times 180 = 720$.' },
      practice: { test: 'ACT', section: 'math', skills: ['Angles, triangles, and polygons', 'Slope and lines'] },
    },
    {
      id: 'complex-matrices',
      title: 'Complex numbers and matrices',
      mins: 8,
      body: `
<h3>Complex numbers</h3>
<p>$i = \\sqrt{-1}$, so $i^2 = -1$. Powers of $i$ repeat every 4: $i, -1, -i, 1$.</p>
${worked('Example', '<p>$(3 + 2i)(1 - 4i) = 3 - 12i + 2i - 8i^2 = 3 - 10i + 8 = 11 - 10i$.</p>')}
${tip('To find $i^{n}$, divide $n$ by 4 and use the remainder: remainder 1 gives $i$, 2 gives $-1$, 3 gives $-i$, 0 gives $1$.')}
<h3>Matrices</h3>
<ul>
  <li>Add or subtract matrices of the same size entry by entry.</li>
  <li>To multiply, the number of columns in the first must equal the number of rows in the second. Each entry is a row times a column.</li>
  <li>The determinant of $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ is $ad - bc$.</li>
</ul>
${worked('Example', '<p>$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ has determinant $1 \\cdot 4 - 2 \\cdot 3 = -2$.</p>')}`,
      check: { q: 'What is $i^{14}$?', choices: ['$i$', '$-1$', '$-i$', '$1$'], answer: 1, why: '$14 \\div 4$ has remainder 2, and $i^2 = -1$.' },
      practice: { test: 'ACT', section: 'math', skills: ['Complex numbers', 'Matrices'] },
    },
    {
      id: 'logs-sequences',
      title: 'Logarithms and sequences',
      mins: 8,
      body: `
<h3>Logarithms</h3>
${rule('$\\log_b x = y$ means $b^y = x$. A log answers the question "what power?"')}
<ul>
  <li>$\\log_2 8 = 3$ because $2^3 = 8$.</li>
  <li>Product rule: $\\log(ab) = \\log a + \\log b$. Quotient rule: $\\log\\frac{a}{b} = \\log a - \\log b$. Power rule: $\\log a^n = n\\log a$.</li>
  <li>You can't take the log of zero or a negative number.</li>
</ul>
<h3>Sequences</h3>
${table(['Type', 'Pattern', 'nth term'], [
  ['Arithmetic', 'Add the same number $d$', '$a_n = a_1 + (n - 1)d$'],
  ['Geometric', 'Multiply by the same number $r$', '$a_n = a_1 \\cdot r^{n - 1}$'],
])}
${worked('Example', '<p>The sequence 5, 11, 17, ... is arithmetic with $d = 6$. The 20th term is $5 + 19 \\cdot 6 = 119$.</p>')}`,
      check: { q: 'What is $\\log_3 81$?', choices: ['3', '4', '9', '27'], answer: 1, why: '$3^4 = 81$, so $\\log_3 81 = 4$.' },
      practice: { test: 'ACT', section: 'math', skills: ['Logarithms', 'Sequences'] },
    },
    {
      id: 'functions',
      title: 'Functions and composition',
      mins: 7,
      body: `
<p>$f(g(x))$ means "plug $x$ into $g$, then plug the result into $f$." Work from the inside out.</p>
${worked('Example', '<p>$f(x) = 2x + 1$ and $g(x) = x^2$. Find $f(g(3))$.</p><p>$g(3) = 9$, then $f(9) = 19$.</p>')}
${bad('$f(g(3)) = f(3) \\cdot g(3)$. Composition is not multiplication.')}
<h3>Transformations</h3>
<ul>
  <li>$f(x) + k$ shifts up $k$; $f(x - h)$ shifts right $h$.</li>
  <li>$-f(x)$ reflects over the x-axis; $f(-x)$ reflects over the y-axis.</li>
  <li>$a f(x)$ stretches vertically by a factor of $a$.</li>
</ul>
${tip('"Right" goes with minus inside the parentheses. $f(x - 3)$ moves the graph 3 units to the right.')}`,
      check: { q: 'If $f(x) = x - 4$ and $g(x) = 3x$, what is $g(f(6))$?', choices: ['2', '6', '14', '18'], answer: 1, why: '$f(6) = 2$, then $g(2) = 6$.' },
      practice: { test: 'ACT', section: 'math', skills: ['Function notation and composition', 'Quadratic functions', 'Linear models'] },
    },
    {
      id: 'trig',
      title: 'Trigonometry beyond SOH CAH TOA',
      mins: 8,
      body: `
<p>The ACT tests a little more trig than the SAT.</p>
<ul>
  <li><b>Identity:</b> $\\sin^2\\theta + \\cos^2\\theta = 1$, and $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$.</li>
  <li><b>Unit circle:</b> know the values at $0^\\circ$, $30^\\circ$, $45^\\circ$, $60^\\circ$, $90^\\circ$, and the signs in each quadrant.</li>
  <li><b>Graphs:</b> in $y = a\\sin(bx)$, the amplitude is $|a|$ and the period is $\\frac{2\\pi}{b}$.</li>
  <li><b>Law of sines and cosines:</b> the ACT usually gives these formulas in the question when they are needed.</li>
</ul>
${worked('Example', '<p>If $\\sin\\theta = \\frac{3}{5}$ and $\\theta$ is in the first quadrant, then $\\cos\\theta = \\frac{4}{5}$ (a 3-4-5 right triangle) and $\\tan\\theta = \\frac{3}{4}$.</p>')}`,
      check: { q: 'What is the period of $y = 4\\sin(2x)$?', choices: ['$\\frac{\\pi}{2}$', '$\\pi$', '$2\\pi$', '$4\\pi$'], answer: 1, why: 'Period $= \\frac{2\\pi}{b} = \\frac{2\\pi}{2} = \\pi$. The 4 is the amplitude.' },
      practice: { test: 'ACT', section: 'math', skills: ['Trigonometry', 'Right triangles'] },
    },
    {
      id: 'counting',
      title: 'Counting and probability',
      mins: 7,
      body: `
${rule('Fundamental counting principle: if one choice has $m$ options and another has $n$, together there are $m \\times n$ combinations.')}
<ul>
  <li><b>Permutations</b> (order matters): $_nP_r = \\frac{n!}{(n - r)!}$. Example: choosing a president and vice president from 10 people: $10 \\times 9 = 90$.</li>
  <li><b>Combinations</b> (order doesn't matter): $_nC_r = \\frac{n!}{r!(n - r)!}$. Example: choosing a 2-person committee from 10 people: $\\frac{90}{2} = 45$.</li>
</ul>
<h3>Probability</h3>
<ul>
  <li>"And" for independent events: multiply. The probability of two heads is $\\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.</li>
  <li>"Not": subtract from 1. The probability of at least one head in 3 flips is $1 - \\frac{1}{8} = \\frac{7}{8}$.</li>
  <li>Without replacement, the second probability changes because one item is gone.</li>
</ul>`,
      check: { q: 'A restaurant offers 4 appetizers, 6 entrées, and 3 desserts. How many different three-course meals are possible?', choices: ['13', '24', '72', '216'], answer: 2, why: '$4 \\times 6 \\times 3 = 72$.' },
      practice: { test: 'ACT', section: 'math', skills: ['Counting and arrangements', 'Probability'] },
    },
  ],
};

const ACT_READING = {
  id: 'act-reading',
  subject: 'SAT & ACT',
  icon: 'scroll',
  title: 'ACT Reading',
  blurb: 'A plan for long passages, how to answer detail, inference, and main idea questions quickly, and how to handle paired passages.',
  level: 'ACT Reading',
  lessons: [
    {
      id: 'approach',
      title: 'Reading a long passage fast',
      mins: 7,
      body: `
<p>ACT Reading uses long passages, each with several questions, from four areas: literary narrative, social science, humanities, and natural science. On the enhanced ACT you have <b>40 minutes for 36 questions</b>.</p>
<h3>A plan that works</h3>
<ol>
  <li><b>Read actively, but quickly.</b> After each paragraph, think of a few words that sum it up ("mom's childhood," "first study," "critics disagree").</li>
  <li><b>Don't try to memorize details.</b> You can always go back. The questions often give line or paragraph numbers.</li>
  <li><b>Answer from the passage, not memory.</b> For any detail question, find the sentence that proves your answer.</li>
</ol>
${tip('Start with the passage type you are best at. You don\'t have to do the passages in order.')}
${rule('Every correct answer is directly supported by the passage. If you have to add your own assumptions, the choice is wrong.')}`,
      check: { q: 'What should you do after reading each paragraph?', choices: ['Memorize every name and date', 'Note a short summary of its main point', 'Skip to the questions immediately', 'Reread it three times'], answer: 1, why: 'A quick summary of each paragraph builds a map of the passage, so you know where to look when questions ask about details.' },
      practice: { test: 'ACT', section: 'reading', skills: ['Long passage'] },
    },
    {
      id: 'details',
      title: 'Detail and inference questions',
      mins: 7,
      body: `
<p>Most ACT Reading questions are about details or reasonable inferences.</p>
<h3>Detail questions</h3>
<p>"According to the passage..." means the answer is stated directly. Find it, then pick the choice that restates it in different words.</p>
<h3>Inference questions</h3>
<p>"The passage suggests..." or "It can reasonably be inferred..." means the answer is not stated outright, but it must be <b>strongly supported</b>. ACT inferences are small steps, not big leaps.</p>
${bad('Choices with extreme words (<i>always, never, completely, only</i>) unless the passage uses them too.')}
${bad('Choices that are true in real life but not mentioned in the passage.')}
${bad('Choices that use words from the passage but mix up who did what.')}`,
      check: { q: 'A question says, "It can reasonably be inferred that the narrator..." What kind of answer should you look for?', choices: ['A fact stated word for word', 'A small conclusion strongly supported by the text', 'A dramatic prediction about the future', 'Your own opinion of the narrator'], answer: 1, why: 'Inferences on the ACT are small, well-supported steps beyond what the passage says outright.' },
      practice: { test: 'ACT', section: 'reading', skills: ['Inferences', 'Central Ideas and Details'] },
    },
    {
      id: 'main-idea',
      title: 'Main idea and author\'s purpose',
      mins: 6,
      body: `
<p>Main idea questions ask about the whole passage or a whole paragraph. The right answer is broad enough to cover everything, but not so broad that it could describe a different passage.</p>
${table(['Too narrow', 'Just right', 'Too broad'], [
  ['"The narrator\'s mother grew roses."', '"The narrator reflects on how her mother\'s garden shaped her childhood."', '"Gardening is important to many families."'],
])}
<h3>Purpose and function</h3>
<p>"The main purpose of the third paragraph is to..." asks <i>why</i> the paragraph is there. Common jobs: introduce a problem, give an example, present a counterargument, or shift to a new time period.</p>
${tip('Use your paragraph summaries from the first read. They are often enough to answer main idea questions without rereading.')}`,
      check: { q: 'A passage describes several scientists\' failed attempts to measure a star and then one scientist\'s success. Which is the best main idea?', choices: ['Measuring stars is impossible.', 'After many failures, one scientist found a way to measure the star.', 'All scientists use telescopes.', 'The star is very far away.'], answer: 1, why: 'This choice covers both the failed attempts and the success, which make up the whole passage.' },
      practice: { test: 'ACT', section: 'reading', skills: ['Central Ideas and Details', 'Text Structure and Purpose'] },
    },
    {
      id: 'paired',
      title: 'Paired passages and data in texts',
      mins: 6,
      body: `
<h3>Paired passages</h3>
<p>Some ACT Reading sets give two shorter passages on the same topic. Questions ask about Passage A, Passage B, and how they relate.</p>
<ol>
  <li>Read Passage A and answer its questions.</li>
  <li>Read Passage B and answer its questions.</li>
  <li>Then answer the questions about both. This keeps the two authors' views from blending together.</li>
</ol>
<h3>Passages with data</h3>
<p>The enhanced ACT can include a chart or table alongside a reading passage. Read the title and labels, then check the specific numbers the question asks about. The right answer must match both the passage and the data.</p>
${tip('For "both authors would agree" questions, a choice must be supported by both passages, not just one.')}`,
      check: { q: 'What is a good order for paired passages?', choices: ['Read both, then answer all questions', 'Read A and answer its questions, read B and answer its questions, then the questions about both', 'Answer the comparison questions first', 'Skip Passage A'], answer: 1, why: 'Handling each passage separately first keeps the two authors\' views distinct before you compare them.' },
      practice: { test: 'ACT', section: 'reading', skills: ['Cross-Text Connections', 'Data in texts'] },
    },
  ],
};

const ACT_SCIENCE = {
  id: 'act-science',
  subject: 'SAT & ACT',
  icon: 'flask',
  title: 'ACT Science',
  blurb: 'ACT Science is a reading-graphs test more than a science test. Learn the three passage types and how to find answers in the data fast.',
  level: 'ACT Science',
  lessons: [
    {
      id: 'types',
      title: 'The three passage types',
      mins: 6,
      body: `
<p>On the enhanced ACT, Science is an optional section with <b>40 questions in 40 minutes</b>. You don't need to memorize much science; nearly every answer is in the passage, table, or graph.</p>
${table(['Type', 'What it looks like', 'How to approach it'], [
  ['Data representation', 'Graphs and tables with a short intro', 'Go straight to the questions and look up values'],
  ['Research summaries', 'Several experiments with results', 'Note what changes between experiments'],
  ['Conflicting viewpoints', 'Two or more scientists or students disagree', 'Read and summarize each viewpoint'],
])}
${tip('For data passages, skim the intro in a few seconds and go to the questions. Most can be answered from the figures alone.')}`,
      check: { q: 'How much time is there per ACT Science question on the enhanced ACT?', choices: ['About 30 seconds', 'About 1 minute', 'About 2 minutes', 'About 3 minutes'], answer: 1, why: '40 questions in 40 minutes is about 1 minute each.' },
      practice: { test: 'ACT', section: 'science', skills: ['Interpretation of Data'] },
    },
    {
      id: 'graphs',
      title: 'Reading graphs and tables',
      mins: 8,
      body: `
<ol>
  <li><b>Read the labels and units</b> on every axis and column before looking at values.</li>
  <li><b>Find the trend.</b> As one variable increases, does the other increase, decrease, or stay the same?</li>
  <li><b>Interpolate and extrapolate.</b> Questions may ask for a value between two data points (estimate between them) or beyond the data (continue the trend).</li>
</ol>
${worked('Example', '<p>A table shows a plant\'s height at 10, 20, and 30 days as 4 cm, 8 cm, and 12 cm. What was its height at 25 days?</p><p>The height rises 4 cm every 10 days, so at 25 days it is about 10 cm.</p>')}
${rule('When a question names a specific figure ("According to Figure 2"), use only that figure.')}
${tip('Watch for two y-axes on one graph. Check which line goes with which axis.')}`,
      check: { q: 'In a table, temperature readings are 20°C at 1 minute, 30°C at 2 minutes, and 40°C at 3 minutes. If the trend continues, what is the temperature at 4 minutes?', choices: ['40°C', '45°C', '50°C', '60°C'], answer: 2, why: 'The temperature rises 10°C each minute, so at 4 minutes it should be about 50°C.' },
      practice: { test: 'ACT', section: 'science', skills: ['Interpretation of Data'] },
    },
    {
      id: 'experiments',
      title: 'Experiments: variables and controls',
      mins: 8,
      body: `
${table(['Term', 'Meaning', 'Example'], [
  ['Independent variable', 'What the scientist changes on purpose', 'Amount of fertilizer'],
  ['Dependent variable', 'What is measured', 'Plant height'],
  ['Controlled variables', 'Kept the same in every trial', 'Light, water, soil type'],
  ['Control group', 'Gets no treatment, for comparison', 'Plants with no fertilizer'],
])}
<h3>Common questions</h3>
<ul>
  <li><b>"Why did the scientist do Experiment 2?"</b> Find what is different between Experiments 1 and 2. That variable is what Experiment 2 was testing.</li>
  <li><b>"Which change would let the scientist test X?"</b> The right design changes only X and keeps everything else the same.</li>
  <li><b>"What would happen if..."</b> Use the trend from the results to predict.</li>
</ul>
${rule('A fair test changes one variable at a time. If two things change at once, you can\'t tell which one caused the result.')}`,
      check: { q: 'A student tests how water temperature affects how fast sugar dissolves. What is the dependent variable?', choices: ['Water temperature', 'Time for the sugar to dissolve', 'Type of sugar', 'Size of the cup'], answer: 1, why: 'The dependent variable is what is measured: how long the sugar takes to dissolve.' },
      practice: { test: 'ACT', section: 'science', skills: ['Scientific Investigation'] },
    },
    {
      id: 'viewpoints',
      title: 'Conflicting viewpoints',
      mins: 7,
      body: `
<p>This passage gives two or more explanations of the same thing. It is the most reading-heavy science passage, so many students save it for last.</p>
<ol>
  <li>Read the introduction to learn the question being debated.</li>
  <li>For each viewpoint, write a one-line summary of its main claim.</li>
  <li>Note where the viewpoints <b>agree</b> as well as where they differ. Questions often ask what both would accept.</li>
</ol>
${worked('Example', '<p>Scientist 1 says a crater was made by a meteor. Scientist 2 says it was made by a volcano. Both agree the crater is about 50,000 years old.</p><p>A question asking "Which would both scientists agree with?" points to the age, not the cause.</p>')}
${tip('When a question asks which finding would <b>weaken</b> a viewpoint, look for evidence that contradicts its main claim.')}`,
      check: { q: 'Scientist 1 says birds descended from dinosaurs. Scientist 2 says birds and dinosaurs share an older common ancestor. Which finding would most weaken Scientist 1\'s view?', choices: ['A bird-like fossil older than any known dinosaur', 'A dinosaur with feathers', 'A modern bird with strong legs', 'A dinosaur that laid eggs'], answer: 0, why: 'If a bird-like animal existed before any dinosaur, birds could not have descended from dinosaurs, which undercuts Scientist 1.' },
      practice: { test: 'ACT', section: 'science', skills: ['Evaluation of Models, Inferences, and Experimental Results'] },
    },
  ],
};

export const TEST_PREP_COURSES = [SAT_RW, SAT_MATH_ALG, SAT_MATH_DATA, ACT_ENGLISH, ACT_MATH, ACT_READING, ACT_SCIENCE];
