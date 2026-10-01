// AP social science courses: government, economics, psychology, and human geography.
// Plain text only outside math: a dollar sign starts KaTeX math, so write "dollars" instead.
import { rule, table, tip, worked } from './lesson-kit.js';

export const AP_SOCIAL_COURSES = [
  {
    id: 'ap-gov',
    subject: 'Social Science',
    ap: true,
    icon: 'scale',
    title: 'AP U.S. Government and Politics',
    blurb: 'The Constitution, the three branches, civil liberties and rights, political beliefs, and participation, with every required Supreme Court case and founding document.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam: format and required documents',
        mins: 7,
        body: `
${table(['Part', 'Questions', 'Time', 'Weight'], [
  ['Multiple choice', '55', '80 min', '50%'],
  ['Free response', '4: concept application, quantitative analysis, SCOTUS comparison, argument essay', '100 min', '50%'],
])}
<h3>Required foundational documents (9)</h3>
<p>The Declaration of Independence, the Articles of Confederation, the Constitution, <b>Federalist No. 10, 51, 70, and 78</b>, Brutus No. 1, and Martin Luther King Jr.'s Letter from a Birmingham Jail.</p>
<h3>Required Supreme Court cases (15)</h3>
<p>Marbury v. Madison, McCulloch v. Maryland, Schenck v. U.S., Brown v. Board of Education, Baker v. Carr, Engel v. Vitale, Gideon v. Wainwright, Tinker v. Des Moines, New York Times v. U.S., Wisconsin v. Yoder, Roe v. Wade, Shaw v. Reno, U.S. v. Lopez, McDonald v. Chicago, and Citizens United v. FEC.</p>
<h3>The argument essay</h3>
<p>Take a position, support it with two pieces of evidence (at least one from the required documents), explain your reasoning, and respond to an opposing view with a rebuttal or concession.</p>
${tip('Make flashcards for each case: facts, the constitutional clause involved, the holding, and why it matters. The SCOTUS comparison FRQ asks you to apply a required case to a new one.')}`,
        check: { q: 'In the argument essay, what must you do with an opposing perspective?', choices: ['Ignore it', 'Respond to it with a rebuttal, concession, or refutation', 'Make it your thesis', 'Only mention it in the conclusion'], answer: 1, why: 'One rubric point requires you to address an alternative perspective and respond to it.' },
      },
      {
        id: 'u1',
        title: 'Unit 1: Foundations of American Democracy',
        mins: 9,
        body: `
<ul>
  <li><b>Ideas behind the Constitution:</b> natural rights, popular sovereignty, social contract, and republicanism (Locke, Montesquieu).</li>
  <li><b>Models of democracy:</b> <b>participatory</b> (broad citizen participation), <b>pluralist</b> (groups compete for influence), and <b>elite</b> (a small, educated group has the most influence).</li>
  <li><b>Articles of Confederation:</b> no power to tax, no executive, and amendments needed unanimous consent. Shays' Rebellion showed the weakness.</li>
  <li><b>Compromises:</b> the Great Compromise (House by population, Senate equal), the Three-Fifths Compromise, and the Electoral College.</li>
  <li><b>Federalist No. 10</b> (Madison): a large republic controls the dangers of factions. <b>Brutus No. 1</b>: a large republic would be too distant and too powerful.</li>
  <li><b>Federalist No. 51</b>: separation of powers and checks and balances. "Ambition must be made to counteract ambition."</li>
</ul>
<h3>Federalism</h3>
<ul>
  <li><b>Enumerated</b> powers (listed for Congress), <b>reserved</b> powers (states, 10th Amendment), <b>concurrent</b> powers (shared, like taxing), and <b>implied</b> powers (the Necessary and Proper Clause).</li>
  <li><b>McCulloch v. Maryland</b> (1819): Congress has implied powers, and federal law is supreme over state law (the Supremacy Clause).</li>
  <li><b>U.S. v. Lopez</b> (1995): Congress overstepped the Commerce Clause by banning guns near schools, a win for state power.</li>
  <li><b>Fiscal federalism:</b> categorical grants (strings attached), block grants (broad purposes), and unfunded mandates.</li>
</ul>`,
        check: { q: 'What did McCulloch v. Maryland (1819) establish?', choices: ['Judicial review', 'Congress has implied powers, and states cannot tax federal institutions', 'Separate but equal', 'Limits on the Commerce Clause'], answer: 1, why: 'The Court upheld the national bank using the Necessary and Proper Clause and ruled that federal law is supreme over state law.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Interactions Among the Branches',
        mins: 10,
        body: `
<h3>Congress</h3>
<ul>
  <li><b>House:</b> 435 members, 2-year terms, starts revenue bills, impeaches. The Rules Committee and the Speaker control the agenda.</li>
  <li><b>Senate:</b> 100 members, 6-year terms, confirms appointments, ratifies treaties, holds impeachment trials. The <b>filibuster</b> can be ended by cloture (60 votes).</li>
  <li>Members act as <b>delegates</b> (vote as constituents want), <b>trustees</b> (use own judgment), or <b>politicos</b> (a mix). Gerrymandering and divided government shape how Congress works.</li>
</ul>
<h3>The presidency</h3>
<ul>
  <li><b>Formal powers:</b> veto, commander in chief, treaties, appointments, pardons.</li>
  <li><b>Informal powers:</b> executive orders, executive agreements, signing statements, and the bully pulpit.</li>
  <li><b>Federalist No. 70</b> (Hamilton): a single, energetic executive is needed. The 22nd Amendment limits presidents to two terms.</li>
</ul>
<h3>The courts</h3>
<ul>
  <li><b>Marbury v. Madison</b> (1803) established <b>judicial review</b>. <b>Federalist No. 78</b>: the judiciary is the "least dangerous" branch and needs life terms for independence.</li>
  <li><b>Judicial activism</b> vs. <b>judicial restraint</b>; precedent (<i>stare decisis</i>).</li>
</ul>
<h3>The bureaucracy</h3>
<p>Cabinet departments and agencies carry out laws using <b>discretionary and rule-making authority</b>. Congress checks them through oversight hearings and funding (the "power of the purse"). <b>Iron triangles</b> link agencies, congressional committees, and interest groups.</p>`,
        check: { q: 'Which is an informal power of the president?', choices: ['Vetoing a bill', 'Issuing an executive order', 'Granting a pardon', 'Making treaties'], answer: 1, why: 'Executive orders are not listed in the Constitution; they come from the president\'s role in executing the law. The others are formal, listed powers.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Civil Liberties and Civil Rights',
        mins: 10,
        body: `
<p><b>Civil liberties</b> protect individuals from government (the Bill of Rights). <b>Civil rights</b> protect groups from discrimination (equal protection).</p>
<p>Through <b>selective incorporation</b>, the 14th Amendment's Due Process Clause applies most of the Bill of Rights to the states (<b>McDonald v. Chicago</b>, 2010: the Second Amendment applies to states).</p>
${table(['Case', 'Holding'], [
  ['Engel v. Vitale (1962)', 'School-sponsored prayer violates the Establishment Clause.'],
  ['Wisconsin v. Yoder (1972)', 'Amish families may stop school at 8th grade under the Free Exercise Clause.'],
  ['Tinker v. Des Moines (1969)', 'Students keep free speech at school (armbands) unless it substantially disrupts.'],
  ['Schenck v. U.S. (1919)', 'Speech that creates a "clear and present danger" can be limited.'],
  ['New York Times v. U.S. (1971)', 'Prior restraint (blocking the Pentagon Papers) was not justified.'],
  ['Gideon v. Wainwright (1963)', 'States must provide a lawyer to defendants who cannot afford one.'],
  ['Roe v. Wade (1973)', 'Extended the right to privacy to abortion. Overturned by Dobbs (2022), which you should also know.'],
  ['Brown v. Board (1954)', 'School segregation violates the Equal Protection Clause; overturned Plessy.'],
])}
${rule('Civil rights legislation to know: the Civil Rights Act of 1964, the Voting Rights Act of 1965, and Title IX (1972).')}`,
        check: { q: 'Which case protected students\' right to wear antiwar armbands?', choices: ['Engel v. Vitale', 'Tinker v. Des Moines', 'Schenck v. U.S.', 'Gideon v. Wainwright'], answer: 1, why: 'Tinker held that students don\'t lose free speech rights at school unless their speech substantially disrupts learning.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: American Political Ideologies and Beliefs',
        mins: 7,
        body: `
<ul>
  <li><b>Political socialization:</b> people form beliefs through family (the strongest influence), schools, peers, media, religion, and major events.</li>
  <li><b>Core values:</b> individualism, equality of opportunity, free enterprise, rule of law, and limited government.</li>
  <li><b>Generational effects</b> (shared events shape a cohort) and <b>life-cycle effects</b> (views change with age).</li>
  <li><b>Polling:</b> good polls use random samples, neutral wording, and report a margin of error. Watch for biased samples and leading questions.</li>
  <li><b>Ideologies:</b> <b>liberals</b> generally favor more government action on the economy and social programs; <b>conservatives</b> favor free markets and less economic regulation; <b>libertarians</b> favor minimal government in both economic and social life.</li>
  <li><b>Economic policy:</b> Keynesian (government spending to manage demand) vs. supply-side (tax cuts to boost production). The <b>Federal Reserve</b> sets monetary policy.</li>
</ul>`,
        check: { q: 'A poll asks, "Don\'t you agree that taxes are too high?" What is the problem?', choices: ['The sample is too large', 'The question wording is leading', 'The margin of error is too small', 'Nothing; it is a neutral question'], answer: 1, why: 'The wording pushes respondents toward agreeing, which biases the results.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Political Participation',
        mins: 8,
        body: `
<ul>
  <li><b>Voting:</b> amendments expanded it (15th, 19th, 24th banned poll taxes, 26th set the age at 18). Turnout rises with age, education, and income. Models: rational choice, retrospective, prospective, and party-line voting.</li>
  <li><b>Political parties</b> recruit candidates, mobilize voters, and organize government. The U.S. has two major parties because of <b>winner-take-all</b>, single-member districts. Third parties struggle but can influence the major parties' platforms.</li>
  <li><b>Interest groups</b> lobby, file amicus briefs, and fund campaigns through <b>PACs</b>. The free-rider problem makes some groups hard to organize.</li>
  <li><b>Elections:</b> primaries and caucuses, national conventions, and the <b>Electoral College</b> (270 votes to win). Incumbents have big advantages.</li>
  <li><b>Campaign finance:</b> <b>Citizens United v. FEC</b> (2010) ruled that limiting independent political spending by corporations and unions violates free speech, leading to <b>super PACs</b>.</li>
  <li><b>Media:</b> the shift to online and partisan sources, horse-race coverage, and concerns about bias and misinformation. <b>Linkage institutions</b> (parties, interest groups, elections, media) connect people to government.</li>
</ul>`,
        check: { q: 'Why does the U.S. tend to have only two major parties?', choices: ['The Constitution limits it to two', 'Winner-take-all, single-member districts make it hard for third parties to win seats', 'Third parties are illegal', 'The Supreme Court ruled it so'], answer: 1, why: 'When only the top vote-getter wins, voters avoid "wasting" votes on small parties, so two parties dominate (Duverger\'s law).' },
      },
    ],
  },

  {
    id: 'ap-comp-gov',
    subject: 'Social Science',
    ap: true,
    icon: 'globe',
    title: 'AP Comparative Government',
    blurb: 'How six countries govern: the UK, Mexico, Nigeria, Russia, China, and Iran, compared across regimes, institutions, elections, and political change.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The six countries and the exam',
        mins: 6,
        body: `
${table(['Country', 'Regime type', 'Key features'], [
  ['United Kingdom', 'Democracy', 'Parliamentary system, constitutional monarchy, uncodified constitution'],
  ['Mexico', 'Democracy (since 2000)', 'Presidential federal system; PRI ruled for 71 years'],
  ['Nigeria', 'Hybrid / illiberal democracy', 'Presidential federal system, oil dependence, ethnic and religious divisions'],
  ['Russia', 'Authoritarian', 'Semi-presidential on paper, power centralized under Putin'],
  ['China', 'Authoritarian', 'One-party communist state, party controls the state'],
  ['Iran', 'Authoritarian theocracy', 'Supreme Leader holds final authority; elected president and parliament'],
])}
<p>The exam: 55 multiple-choice questions (60 min, 50%) and 4 free-response questions (90 min, 50%): conceptual analysis, quantitative analysis, comparative analysis, and an argument essay.</p>
${tip('For every concept, have a ready example from two different countries. Comparison is the core skill.')}`,
        check: { q: 'Which of the six countries has a parliamentary system?', choices: ['Mexico', 'Nigeria', 'United Kingdom', 'Iran'], answer: 2, why: 'In the UK the prime minister comes from and is accountable to the majority in Parliament.' },
      },
      {
        id: 'u1',
        title: 'Unit 1: Political Systems, Regimes, and Governments',
        mins: 7,
        body: `
<ul>
  <li><b>State, nation, regime, government:</b> a <b>state</b> is a territory with a sovereign government; a <b>nation</b> is a people with shared identity; a <b>regime</b> is the set of rules for how power works; a <b>government</b> is the people in power right now.</li>
  <li><b>Legitimacy</b> is the belief that the government has the right to rule. Sources: traditional, charismatic, and rational-legal (Max Weber), plus economic performance (China) and religion (Iran).</li>
  <li><b>Sovereignty</b> can be weakened by supranational organizations (the EU) or by armed groups (Boko Haram in Nigeria).</li>
  <li><b>Democratization:</b> free and fair elections, rule of law, and civil liberties. Mexico's 2000 election ended PRI dominance. <b>Democratic backsliding</b>: Russia under Putin.</li>
  <li><b>Federal vs. unitary:</b> Mexico, Nigeria, and Russia are federal; the UK (with devolution to Scotland, Wales, Northern Ireland), China, and Iran are unitary.</li>
</ul>`,
        check: { q: 'China\'s leaders point to rapid economic growth to justify their rule. What is this an example of?', choices: ['Traditional legitimacy', 'Performance-based legitimacy', 'Rational-legal legitimacy through elections', 'Charismatic legitimacy'], answer: 1, why: 'The Chinese Communist Party relies heavily on delivering prosperity and stability as a source of legitimacy.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Political Institutions',
        mins: 8,
        body: `
<ul>
  <li><b>Parliamentary systems</b> (UK): the executive comes from the legislature; a <b>vote of no confidence</b> can remove the government. Fusion of powers.</li>
  <li><b>Presidential systems</b> (Mexico, Nigeria): separately elected president and legislature, fixed terms. Separation of powers.</li>
  <li><b>Semi-presidential</b> (Russia): both a president and a prime minister. In Russia the president dominates.</li>
  <li><b>Head of state vs. head of government:</b> in the UK the monarch is head of state and the PM is head of government. In Iran the Supreme Leader outranks the president.</li>
  <li><b>Legislatures:</b> the UK House of Commons is powerful; the House of Lords can only delay. China's National People's Congress mostly approves party decisions.</li>
  <li><b>Judiciaries:</b> independence varies. The UK Supreme Court (2009) cannot strike down acts of Parliament (parliamentary sovereignty). Iran's Guardian Council vets laws and candidates.</li>
  <li><b>Term limits:</b> Mexico's president serves one 6-year term. Russia's 2020 constitutional changes allowed Putin to stay until 2036.</li>
</ul>`,
        check: { q: 'In a parliamentary system, how can the government be removed between elections?', choices: ['Impeachment by the Supreme Court', 'A vote of no confidence in the legislature', 'A referendum only', 'It cannot be removed'], answer: 1, why: 'Because the executive depends on the legislature\'s support, losing a confidence vote forces it to resign or call an election.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Political Culture and Participation',
        mins: 7,
        body: `
<ul>
  <li><b>Civil society:</b> voluntary groups outside government. Strong in the UK and Mexico; tightly controlled in China, Russia, and Iran.</li>
  <li><b>Political culture and ideology:</b> liberalism, socialism, communism, fascism, and religious ideologies (Iran's Shia theocracy).</li>
  <li><b>Political socialization:</b> authoritarian states use state media and education to shape beliefs (China's "Xi Jinping Thought").</li>
  <li><b>Cleavages:</b> divisions like ethnicity, religion, region, and class. Nigeria has strong ethnic (Hausa-Fulani, Yoruba, Igbo) and religious (Muslim North, Christian South) cleavages. The UK has national cleavages (Scotland).</li>
  <li><b>Civil rights and liberties:</b> restricted in authoritarian states through censorship, internet controls, and limits on protest (Iran's 2022 protests, Russia's laws on "foreign agents").</li>
</ul>`,
        check: { q: 'What is a political cleavage?', choices: ['A constitutional amendment', 'A division in society, such as ethnicity or religion, that shapes politics', 'A type of election', 'A court ruling'], answer: 1, why: 'Cleavages are lasting divisions that shape political identities, conflicts, and party systems.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Parties, Elections, and Citizen Organizations',
        mins: 7,
        body: `
<ul>
  <li><b>Electoral systems:</b> <b>single-member district plurality</b> (first past the post: UK Commons, Nigeria's legislature) tends to create two-party systems. <b>Proportional representation</b> (Russia's Duma uses a mix; Mexico's legislature is mixed) allows more parties.</li>
  <li><b>Party systems:</b> one-party (China), dominant-party (Russia's United Russia; Mexico's PRI before 2000), two-party (UK historically), and multiparty.</li>
  <li><b>Interest groups:</b> <b>pluralism</b> (groups compete freely, as in the UK) vs. <b>corporatism</b> (the state recognizes and works with official groups, as in China and historically Mexico).</li>
  <li><b>Social movements:</b> environmental movements, Mexico's Zapatistas, Nigeria's #EndSARS protests against police abuse.</li>
  <li><b>Elections in authoritarian states:</b> held to show legitimacy, but limited by vetting candidates (Iran's Guardian Council), controlling media, and harassing opponents (Russia).</li>
</ul>`,
        check: { q: 'Which electoral system usually produces more political parties in the legislature?', choices: ['Single-member district plurality', 'Proportional representation', 'An appointed legislature', 'Hereditary seats'], answer: 1, why: 'PR gives seats in proportion to votes, so smaller parties can win representation.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Political and Economic Changes',
        mins: 7,
        body: `
<ul>
  <li><b>Globalization:</b> trade agreements (Mexico in NAFTA, now USMCA), foreign investment, and international organizations shape domestic policy.</li>
  <li><b>Economic liberalization:</b> China's reforms under Deng Xiaoping (special economic zones), Mexico's privatization, and Russia's chaotic 1990s privatization that created oligarchs.</li>
  <li><b>Resource dependence:</b> Nigeria, Russia, and Iran rely heavily on oil and gas exports. This "<b>resource curse</b>" can fuel corruption and make economies vulnerable to price swings.</li>
  <li><b>Social policies:</b> China's one-child policy (later relaxed), Mexico's conditional cash transfers (Prospera), the UK's National Health Service.</li>
  <li><b>Measuring development:</b> GDP per capita, the Human Development Index (HDI), and the Gini index for inequality.</li>
</ul>
${rule('Know what each measure tells you: GDP per capita is income, HDI adds health and education, and Gini measures inequality (higher means more unequal).')}`,
        check: { q: 'Which measure is used to compare income inequality between countries?', choices: ['GDP per capita', 'The Gini index', 'Freedom House score', 'Literacy rate'], answer: 1, why: 'The Gini index ranges from 0 (perfect equality) to 1 or 100 (perfect inequality).' },
      },
    ],
  },

  {
    id: 'ap-macro',
    subject: 'Social Science',
    ap: true,
    icon: 'coins',
    title: 'AP Macroeconomics',
    blurb: 'The economy as a whole: GDP, unemployment, inflation, aggregate demand and supply, money and banking, fiscal and monetary policy, and trade.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and how to draw graphs',
        mins: 5,
        body: `
<p>The exam has 60 multiple-choice questions (70 min, 66%) and 3 free-response questions (60 min, 33%): one long question and two short ones.</p>
<ul>
  <li><b>Label everything:</b> axes, curves, and equilibrium points. Unlabeled graphs lose points.</li>
  <li><b>Show shifts</b> with arrows and new labels (AD₁ to AD₂).</li>
  <li><b>Explain the chain:</b> "Because the Fed bought bonds, the money supply increased, the interest rate fell, investment rose, and AD shifted right."</li>
</ul>
${tip('Memorize the core graphs: PPC, supply and demand, AD/AS, money market, loanable funds, Phillips curve, and foreign exchange.')}`,
        check: { q: 'What is the most common way to lose points on an FRQ graph?', choices: ['Drawing it too large', 'Leaving axes or curves unlabeled', 'Using a pencil', 'Drawing it in the corner'], answer: 1, why: 'Graders need labeled axes, curves, and equilibrium points to award credit.' },
      },
      {
        id: 'u1',
        title: 'Unit 1: Basic Economic Concepts',
        mins: 7,
        body: `
<ul>
  <li><b>Scarcity:</b> unlimited wants, limited resources. Every choice has an <b>opportunity cost</b>, the value of the next-best alternative.</li>
  <li><b>Production possibilities curve (PPC):</b> points on the curve are efficient, inside are inefficient, outside are unattainable. Economic growth shifts it outward.</li>
  <li><b>Comparative advantage:</b> produce what you have the lower opportunity cost for, then trade. Both sides gain.</li>
  <li><b>Supply and demand:</b> demand slopes down, supply slopes up. Shifters of demand include income, tastes, prices of related goods, expectations, and number of buyers.</li>
</ul>
${worked('Comparative advantage', '<p>In one hour, Ana makes 4 pies or 8 cakes; Ben makes 2 pies or 6 cakes. Ana\'s cost of 1 pie is 2 cakes; Ben\'s is 3 cakes. Ana has the comparative advantage in pies, and Ben in cakes (his cost of a cake is 1/3 pie vs. Ana\'s 1/2 pie).</p>')}`,
        check: { q: 'What does a point inside the PPC represent?', choices: ['Economic growth', 'Unemployed or inefficiently used resources', 'An unattainable level of output', 'Maximum efficiency'], answer: 1, why: 'The economy could produce more of both goods, so resources are idle or wasted.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Economic Indicators and the Business Cycle',
        mins: 8,
        body: `
<ul>
  <li><b>GDP</b> = C + I + G + (X − M): consumption, investment, government purchases, net exports. It counts only final goods and services produced inside the country this year. Transfer payments, used goods, and stocks are not counted.</li>
  <li><b>Real vs. nominal GDP:</b> real GDP adjusts for inflation.</li>
  <li><b>Unemployment rate</b> = unemployed ÷ labor force. Types: <b>frictional</b> (between jobs), <b>structural</b> (skills mismatch), and <b>cyclical</b> (recessions). The natural rate = frictional + structural.</li>
  <li><b>Inflation:</b> measured by the CPI. Inflation hurts lenders and people on fixed incomes, and helps borrowers (if unexpected).</li>
  <li><b>The business cycle:</b> expansion, peak, recession, trough.</li>
</ul>
${worked('Unemployment rate', '<p>200 million adults, 150 million in the labor force, 9 million unemployed. Rate = 9 ÷ 150 = 6%. (Adults not looking for work are not in the labor force.)</p>')}`,
        check: { q: 'A factory worker loses a job because robots now do the work, and the worker lacks the skills for the new jobs. What type of unemployment is this?', choices: ['Frictional', 'Structural', 'Cyclical', 'Seasonal'], answer: 1, why: 'Structural unemployment comes from a mismatch between workers\' skills and available jobs.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: National Income and Price Determination',
        mins: 9,
        body: `
<ul>
  <li><b>Aggregate demand (AD)</b> slopes down (wealth, interest rate, and exchange rate effects). Shifted by changes in C, I, G, or net exports.</li>
  <li><b>Short-run aggregate supply (SRAS)</b> slopes up. Shifted by input prices (wages, oil), productivity, and expectations.</li>
  <li><b>Long-run aggregate supply (LRAS)</b> is vertical at full-employment output.</li>
  <li><b>Recessionary gap:</b> output below full employment. <b>Inflationary gap:</b> output above it.</li>
  <li><b>Multipliers:</b> spending multiplier = 1 ÷ MPS. Tax multiplier = −MPC ÷ MPS.</li>
  <li><b>Fiscal policy:</b> government spending and taxes. Expansionary (more spending, lower taxes) for recessions; contractionary for inflation.</li>
</ul>
${worked('Multiplier', '<p>MPC = 0.8, so MPS = 0.2 and the spending multiplier is 1 ÷ 0.2 = 5. A 10 billion dollar increase in government spending can raise GDP by up to 50 billion dollars.</p>')}
${rule('Stagflation (high inflation and unemployment together) comes from a leftward shift of SRAS, such as an oil price spike.')}`,
        check: { q: 'If the MPC is 0.75, what is the spending multiplier?', choices: ['0.75', '1.33', '4', '3'], answer: 2, why: 'MPS = 1 − 0.75 = 0.25, and the multiplier is 1 ÷ 0.25 = 4.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: The Financial Sector',
        mins: 9,
        body: `
<ul>
  <li><b>Money</b> is a medium of exchange, unit of account, and store of value. M1 = currency + checkable deposits (and savings deposits since 2020); M2 = M1 + small time deposits and money market funds.</li>
  <li><b>Fractional reserve banking:</b> banks keep a fraction as reserves and lend the rest. Money multiplier = 1 ÷ reserve requirement.</li>
  <li><b>Monetary policy (the Fed):</b> tools include open market operations (buying or selling bonds), the discount rate, interest on reserves (the main tool today, with ample reserves), and reserve requirements.</li>
  <li><b>The money market:</b> money demand slopes down, and money supply is vertical (set by the Fed). Increasing the money supply lowers the nominal interest rate.</li>
  <li><b>Bond prices and interest rates</b> move in opposite directions.</li>
  <li><b>Loanable funds market:</b> determines the real interest rate. Government borrowing increases demand for loanable funds, raising rates and <b>crowding out</b> private investment.</li>
</ul>
${rule('Expansionary monetary chain: Fed buys bonds, money supply up, interest rates down, investment up, AD right, output and price level up.')}`,
        check: { q: 'To fight a recession, the Fed should:', choices: ['Sell government bonds', 'Buy government bonds', 'Raise the discount rate', 'Raise taxes'], answer: 1, why: 'Buying bonds adds reserves to banks, increasing the money supply and lowering interest rates, which encourages spending.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Long-Run Consequences of Stabilization Policies',
        mins: 7,
        body: `
<ul>
  <li><b>The Phillips curve:</b> in the short run, lower unemployment comes with higher inflation (a downward-sloping SRPC). In the long run, the LRPC is vertical at the natural rate of unemployment.</li>
  <li>An increase in AD moves the economy up along the SRPC; a supply shock shifts the SRPC.</li>
  <li><b>Money growth and inflation:</b> the quantity theory, MV = PQ. In the long run, faster money growth leads to inflation.</li>
  <li><b>Deficits and debt:</b> a deficit is one year's shortfall; the debt is the total accumulated. Large deficits can crowd out investment and slow long-run growth.</li>
  <li><b>Economic growth</b> comes from more and better capital (physical and human), technology, and productivity. Shown as LRAS and the PPC shifting right.</li>
</ul>`,
        check: { q: 'What is the shape of the long-run Phillips curve?', choices: ['Downward-sloping', 'Upward-sloping', 'Vertical at the natural rate of unemployment', 'Horizontal'], answer: 2, why: 'In the long run, there is no tradeoff: unemployment returns to its natural rate whatever the inflation rate.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Open Economy: Trade and Finance',
        mins: 7,
        body: `
<ul>
  <li><b>Balance of payments:</b> the current account (trade in goods and services, income) and the financial (capital) account. They must sum to zero.</li>
  <li><b>Foreign exchange market:</b> if demand for the dollar rises, the dollar <b>appreciates</b>.</li>
  <li><b>What changes exchange rates:</b> relative interest rates, relative inflation, tastes for foreign goods, and relative incomes.</li>
  <li><b>Effects:</b> a stronger dollar makes U.S. exports more expensive abroad and imports cheaper, so net exports fall.</li>
  <li>Higher U.S. interest rates attract foreign financial investment, which increases demand for dollars and appreciates the dollar.</li>
</ul>
${worked('Chain', '<p>The Fed raises interest rates, so foreign investors want U.S. bonds. Demand for dollars rises and the dollar appreciates. U.S. exports become more expensive, so net exports fall.</p>')}`,
        check: { q: 'If U.S. interest rates rise relative to Europe\'s, what happens to the dollar?', choices: ['It depreciates', 'It appreciates', 'Nothing', 'It becomes the euro'], answer: 1, why: 'Higher returns attract foreign capital, increasing demand for dollars, so the dollar appreciates.' },
      },
    ],
  },

  {
    id: 'ap-micro',
    subject: 'Social Science',
    ap: true,
    icon: 'coins',
    title: 'AP Microeconomics',
    blurb: 'How individuals and firms decide: supply and demand, elasticity, costs, perfect competition, monopoly, oligopoly, factor markets, and market failure.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: Basic Economic Concepts',
        mins: 6,
        body: `
<p>The exam: 60 multiple-choice questions (70 min, 66%) and 3 free-response questions (60 min, 33%). Labeled graphs are essential.</p>
<ul>
  <li><b>Scarcity and opportunity cost:</b> every choice gives up the next-best alternative.</li>
  <li><b>The PPC</b> shows efficiency, tradeoffs, and growth. A bowed-out PPC shows <b>increasing opportunity cost</b>.</li>
  <li><b>Comparative advantage</b> drives gains from trade. <b>Terms of trade</b> must lie between the two producers' opportunity costs.</li>
  <li><b>Marginal analysis:</b> keep doing something as long as the marginal benefit is at least the marginal cost. <b>Utility maximization:</b> spend so that MU/P is equal across goods.</li>
</ul>`,
        check: { q: 'A consumer gets 20 utils from the last dollar on pizza and 10 utils from the last dollar on movies. To maximize utility, the consumer should:', choices: ['Buy more movies and less pizza', 'Buy more pizza and fewer movies', 'Keep spending the same way', 'Stop buying both'], answer: 1, why: 'Shift spending toward the good with higher marginal utility per dollar until MU/P is equal.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Supply and Demand',
        mins: 9,
        body: `
<ul>
  <li><b>Equilibrium</b> is where quantity supplied equals quantity demanded. A price ceiling below equilibrium creates a <b>shortage</b>; a price floor above it creates a <b>surplus</b>.</li>
  <li><b>Price elasticity of demand</b> = %ΔQd ÷ %ΔP. Elastic (greater than 1): many substitutes, luxuries. Inelastic (less than 1): necessities like insulin.</li>
  <li><b>Total revenue test:</b> if demand is elastic, cutting price raises revenue. If inelastic, raising price raises revenue.</li>
  <li><b>Other elasticities:</b> income elasticity (normal vs. inferior goods), cross-price elasticity (substitutes positive, complements negative).</li>
  <li><b>Consumer and producer surplus:</b> the triangles above price (under demand) and below price (above supply).</li>
  <li><b>Taxes</b> create <b>deadweight loss</b>. The more inelastic side of the market pays more of the tax.</li>
</ul>
${rule('When both supply and demand shift, one of price or quantity is indeterminate unless you know the sizes of the shifts.')}`,
        check: { q: 'A price ceiling set below the equilibrium price causes:', choices: ['A surplus', 'A shortage', 'No change', 'A higher price'], answer: 1, why: 'At the lower price, buyers want more than sellers will supply, creating a shortage.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Production, Cost, and Perfect Competition',
        mins: 10,
        body: `
<ul>
  <li><b>Diminishing marginal returns:</b> adding workers to fixed capital eventually adds less output each time.</li>
  <li><b>Costs:</b> fixed (don't change with output), variable, total, and average (ATC, AVC, AFC). <b>MC</b> crosses ATC and AVC at their minimums.</li>
  <li><b>Profit maximization:</b> every firm produces where <b>MR = MC</b>.</li>
  <li><b>Perfect competition:</b> many firms, identical products, price takers, so P = MR = demand for each firm.</li>
  <li><b>Shut-down rule:</b> in the short run, shut down if price falls below minimum AVC.</li>
  <li><b>Long run:</b> economic profits attract entry and losses cause exit, until P = minimum ATC and economic profit is zero.</li>
  <li>Perfect competition is <b>allocatively efficient</b> (P = MC) and <b>productively efficient</b> (P = min ATC) in the long run.</li>
</ul>
${rule('Economic profit subtracts both explicit and implicit (opportunity) costs. Zero economic profit means a normal profit, so firms are happy to stay.')}`,
        check: { q: 'A perfectly competitive firm\'s price is below its average variable cost. In the short run it should:', choices: ['Keep producing to cover fixed costs', 'Shut down', 'Raise its price', 'Produce more'], answer: 1, why: 'If price doesn\'t cover AVC, each unit loses money beyond fixed costs, so shutting down minimizes losses.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Imperfect Competition',
        mins: 9,
        body: `
<ul>
  <li><b>Monopoly:</b> one seller, barriers to entry. MR lies below demand. It produces where MR = MC and charges the price on the demand curve above that point. Result: higher price, lower output, deadweight loss.</li>
  <li><b>Natural monopoly:</b> economies of scale make one firm cheapest (utilities). Regulators may set price at ATC (fair return) or MC (socially optimal, but may need a subsidy).</li>
  <li><b>Price discrimination:</b> charging different customers different prices. Perfect price discrimination removes consumer surplus and deadweight loss.</li>
  <li><b>Monopolistic competition:</b> many firms with differentiated products (restaurants). Zero economic profit in the long run, but excess capacity.</li>
  <li><b>Oligopoly:</b> a few interdependent firms. Analyzed with <b>game theory</b>: find each player's dominant strategy and the <b>Nash equilibrium</b>.</li>
</ul>
${tip('For a payoff matrix, check one player at a time: "If the other picks A, what is my best choice? If the other picks B?" If the answer is the same both times, that\'s a dominant strategy.')}`,
        check: { q: 'Compared with perfect competition, a monopoly produces:', choices: ['More output at a lower price', 'Less output at a higher price', 'The same output at the same price', 'More output at a higher price'], answer: 1, why: 'Because MR is below demand, the monopolist restricts output and charges a higher price, creating deadweight loss.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Factor Markets',
        mins: 7,
        body: `
<ul>
  <li>Demand for labor is <b>derived demand</b>: it depends on demand for the product.</li>
  <li><b>Marginal revenue product (MRP)</b> = marginal product × marginal revenue. Firms hire until <b>MRP = MRC</b> (marginal resource cost).</li>
  <li>In a competitive labor market, the firm is a wage taker, so MRC = wage.</li>
  <li><b>Monopsony:</b> a single buyer of labor. MRC is above the supply curve, so it hires fewer workers and pays a lower wage than a competitive market.</li>
  <li><b>Least-cost rule:</b> MP of labor ÷ wage = MP of capital ÷ rental price.</li>
</ul>
${worked('Hiring', '<p>The 5th worker adds 10 units, each sold for 3 dollars, so MRP = 30 dollars. If the wage is 25 dollars, hire the worker. If the wage were 35 dollars, don\'t.</p>')}`,
        check: { q: 'A firm should hire workers until:', choices: ['Total product is maximized', 'MRP equals MRC', 'Wages are lowest', 'Average product is highest'], answer: 1, why: 'Hiring is profitable as long as each worker adds at least as much revenue as cost.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Market Failure and the Role of Government',
        mins: 8,
        body: `
<ul>
  <li><b>Externalities:</b> costs or benefits to third parties. Negative (pollution): the market overproduces, so a per-unit (Pigouvian) tax fixes it. Positive (vaccines, education): the market underproduces, so a subsidy fixes it.</li>
  <li>Socially optimal output is where <b>marginal social benefit = marginal social cost</b>.</li>
  <li><b>Public goods</b> are <b>nonrival</b> and <b>nonexcludable</b> (national defense). The free-rider problem means markets underprovide them.</li>
  <li><b>Inequality:</b> the Lorenz curve and Gini coefficient measure it. Progressive taxes (higher rates on higher incomes) and transfers reduce it.</li>
  <li><b>Government failure:</b> policies can also create inefficiency.</li>
</ul>`,
        check: { q: 'A factory\'s pollution harms nearby residents. Without government action, the market will:', choices: ['Produce the socially optimal amount', 'Overproduce the good', 'Underproduce the good', 'Stop producing the good'], answer: 1, why: 'The firm ignores the external cost, so marginal private cost is below marginal social cost and output is too high.' },
      },
    ],
  },

  {
    id: 'ap-psych',
    subject: 'Social Science',
    ap: true,
    icon: 'brain',
    title: 'AP Psychology',
    blurb: 'The brain, sensation and perception, memory and thinking, development and learning, social psychology, personality, and mental health.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and research methods',
        mins: 8,
        body: `
<p>The exam: 75 multiple-choice questions (90 min, 66.7%) and 2 free-response questions (70 min, 33.3%): an <b>Article Analysis Question</b> (AAQ) about a research study and an <b>Evidence-Based Question</b> (EBQ) using three sources.</p>
<h3>Research methods (tested throughout)</h3>
<ul>
  <li><b>Experiment:</b> the only method that shows cause and effect. Random assignment to an experimental and a control group. The <b>independent variable</b> is manipulated; the <b>dependent variable</b> is measured.</li>
  <li><b>Correlation:</b> shows a relationship but not causation. Coefficient r runs from −1 to +1.</li>
  <li><b>Other methods:</b> case studies, naturalistic observation, surveys (watch for wording effects and sampling bias), and meta-analysis.</li>
  <li><b>Random sampling</b> (who is in the study, for generalizing) is different from <b>random assignment</b> (which group they're in, for causation).</li>
  <li><b>Ethics:</b> informed consent, protection from harm, confidentiality, and debriefing.</li>
</ul>
${rule('If a question says a study "shows that X causes Y," check the method. Only an experiment supports a causal claim.')}`,
        check: { q: 'A study finds that students who sleep more get higher grades. What can you conclude?', choices: ['Sleep causes higher grades', 'Higher grades cause more sleep', 'Sleep and grades are related, but causation is not shown', 'There is no relationship'], answer: 2, why: 'This is correlational. A third variable (like stress or schedule) could explain both.' },
      },
      {
        id: 'u1',
        title: 'Unit 1: Biological Bases of Behavior',
        mins: 9,
        body: `
<ul>
  <li><b>Neurons:</b> dendrites receive, the axon sends, and neurotransmitters cross the synapse. An <b>action potential</b> is all-or-nothing.</li>
  <li><b>Neurotransmitters:</b> dopamine (reward, movement), serotonin (mood), acetylcholine (muscles, memory), GABA (inhibitory), glutamate (excitatory), endorphins (pain relief).</li>
  <li><b>Nervous system:</b> central (brain, spinal cord) and peripheral (somatic and autonomic: sympathetic is fight-or-flight, parasympathetic calms).</li>
  <li><b>Brain regions:</b> the frontal lobe (planning, judgment), parietal (touch), occipital (vision), temporal (hearing), cerebellum (coordination), amygdala (fear), hippocampus (new memories), hypothalamus (hunger, hormones). <b>Broca's area</b> (speech production) and <b>Wernicke's area</b> (language comprehension).</li>
  <li><b>Sleep:</b> NREM stages and REM (dreaming). Disorders: insomnia, narcolepsy, sleep apnea.</li>
  <li><b>Sensation and perception:</b> transduction, absolute and difference thresholds, sensory adaptation, and the parts of the eye and ear.</li>
</ul>`,
        check: { q: 'Damage to the hippocampus would most likely impair:', choices: ['Forming new long-term memories', 'Balance and coordination', 'Vision', 'Producing speech'], answer: 0, why: 'The hippocampus is key for forming new explicit memories (patient H.M. is the classic case).' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Cognition',
        mins: 9,
        body: `
<ul>
  <li><b>Perception:</b> top-down processing (using expectations) vs. bottom-up (building from sensory data). Gestalt principles, depth cues (binocular and monocular), and perceptual constancy.</li>
  <li><b>Memory:</b> encoding, storage, retrieval. The multi-store model: sensory, short-term (working), and long-term memory. Explicit (episodic, semantic) vs. implicit (procedural) memory.</li>
  <li><b>Improving memory:</b> spacing, retrieval practice, deep (semantic) processing, chunking, and mnemonics.</li>
  <li><b>Forgetting:</b> proactive interference (old blocks new) and retroactive interference (new blocks old). The misinformation effect shows memories can be reconstructed.</li>
  <li><b>Thinking:</b> algorithms vs. heuristics. Biases: <b>availability heuristic</b>, <b>representativeness heuristic</b>, confirmation bias, framing, and functional fixedness.</li>
  <li><b>Intelligence:</b> general intelligence (g), multiple intelligences (Gardner), and test reliability and validity.</li>
</ul>`,
        check: { q: 'After seeing news about plane crashes, Mia thinks flying is more dangerous than driving. This is an example of:', choices: ['Representativeness heuristic', 'Availability heuristic', 'Functional fixedness', 'Proactive interference'], answer: 1, why: 'Vivid examples that come to mind easily make an event seem more likely than it is.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Development and Learning',
        mins: 9,
        body: `
<h3>Development</h3>
<ul>
  <li><b>Piaget's stages:</b> sensorimotor (object permanence), preoperational (egocentrism), concrete operational (conservation), formal operational (abstract reasoning).</li>
  <li><b>Attachment:</b> Harlow's monkeys (comfort over food), Ainsworth's strange situation (secure vs. insecure attachment).</li>
  <li><b>Parenting styles:</b> authoritative (warm and firm) is linked to the best outcomes; also authoritarian, permissive, and neglectful.</li>
  <li><b>Erikson's psychosocial stages:</b> for example, identity vs. role confusion in adolescence.</li>
</ul>
<h3>Learning</h3>
<ul>
  <li><b>Classical conditioning</b> (Pavlov): a neutral stimulus paired with an unconditioned stimulus becomes a conditioned stimulus.</li>
  <li><b>Operant conditioning</b> (Skinner): reinforcement increases behavior; punishment decreases it. <b>Negative reinforcement</b> removes something unpleasant to increase a behavior.</li>
  <li><b>Schedules:</b> variable-ratio reinforcement (like slot machines) produces the highest, most persistent response rate.</li>
  <li><b>Observational learning</b> (Bandura's Bobo doll).</li>
</ul>`,
        check: { q: 'Taking aspirin to make a headache go away, which makes you more likely to take aspirin again, is an example of:', choices: ['Positive reinforcement', 'Negative reinforcement', 'Positive punishment', 'Classical conditioning'], answer: 1, why: 'Removing an unpleasant stimulus (the headache) increases the behavior. That is negative reinforcement.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Social Psychology and Personality',
        mins: 9,
        body: `
<h3>Social psychology</h3>
<ul>
  <li><b>Attribution:</b> the <b>fundamental attribution error</b> overemphasizes personality and underestimates the situation when judging others.</li>
  <li><b>Cognitive dissonance:</b> discomfort when actions and beliefs conflict, often resolved by changing beliefs.</li>
  <li><b>Conformity</b> (Asch's line study), <b>obedience</b> (Milgram's shock study), and the bystander effect.</li>
  <li><b>Group effects:</b> group polarization, groupthink, social facilitation, social loafing, and deindividuation.</li>
  <li><b>Prejudice:</b> stereotypes, in-group bias, and the just-world phenomenon.</li>
</ul>
<h3>Personality</h3>
<ul>
  <li><b>Psychodynamic</b> (Freud: id, ego, superego, defense mechanisms), <b>humanistic</b> (Maslow, Rogers: self-actualization, unconditional positive regard), <b>social-cognitive</b> (Bandura: self-efficacy, reciprocal determinism), and <b>trait</b> theories (the Big Five: openness, conscientiousness, extraversion, agreeableness, neuroticism).</li>
</ul>
<h3>Motivation and emotion</h3>
<p>Drive-reduction, arousal theory (Yerkes-Dodson), and Maslow's hierarchy. Emotion theories: James-Lange, Cannon-Bard, and Schachter-Singer two-factor.</p>`,
        check: { q: 'You assume a driver who cut you off is a rude person, without considering they might be rushing to a hospital. This is:', choices: ['Cognitive dissonance', 'The fundamental attribution error', 'Group polarization', 'Social loafing'], answer: 1, why: 'You attributed the behavior to personality and ignored possible situational causes.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Mental and Physical Health',
        mins: 9,
        body: `
<ul>
  <li><b>Health psychology:</b> stress and the general adaptation syndrome (alarm, resistance, exhaustion). Coping: problem-focused vs. emotion-focused.</li>
  <li><b>Positive psychology:</b> well-being, gratitude, resilience.</li>
  <li><b>Diagnosis:</b> the DSM-5-TR classifies disorders. The biopsychosocial model considers biological, psychological, and social factors.</li>
  <li><b>Disorders:</b> anxiety disorders (generalized anxiety, panic, phobias), OCD, PTSD, depressive disorders, bipolar disorder, schizophrenia (positive and negative symptoms), dissociative disorders, eating disorders, and personality disorders.</li>
  <li><b>Treatments:</b> psychodynamic therapy, humanistic (client-centered) therapy, behavioral therapy (exposure, systematic desensitization), <b>cognitive-behavioral therapy</b> (CBT, changing thought patterns), group therapy, and biomedical treatments (SSRIs, antipsychotics, lithium).</li>
</ul>
${tip('If you or someone you know is struggling, talk to a trusted adult or counselor. In the U.S., you can call or text 988 to reach the Suicide and Crisis Lifeline.')}`,
        check: { q: 'Which therapy focuses on changing negative thought patterns and behaviors?', choices: ['Psychoanalysis', 'Cognitive-behavioral therapy', 'Client-centered therapy', 'Electroconvulsive therapy'], answer: 1, why: 'CBT helps people identify distorted thoughts and replace them, along with changing behaviors.' },
      },
    ],
  },

  {
    id: 'ap-hug',
    subject: 'Social Science',
    ap: true,
    icon: 'map',
    title: 'AP Human Geography',
    blurb: 'How people shape the world: population and migration, culture, political geography, agriculture, cities, and economic development.',
    level: 'AP · Grades 9 to 10',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: Thinking Geographically',
        mins: 7,
        body: `
<p>The exam: 60 multiple-choice questions (60 min, 50%) and 3 free-response questions (75 min, 50%), two of which use a map, chart, or image.</p>
<ul>
  <li><b>Maps:</b> all map projections distort shape, area, distance, or direction (the Mercator enlarges areas near the poles). Map types include choropleth, dot density, graduated symbol, isoline, and cartogram.</li>
  <li><b>Location:</b> absolute (coordinates) vs. relative (in relation to other places). <b>Site</b> is the physical character of a place; <b>situation</b> is its location relative to other places.</li>
  <li><b>Scale:</b> patterns look different at global, national, regional, and local scales.</li>
  <li><b>Regions:</b> formal (shared trait), functional (organized around a node, like a city's commuter area), and perceptual or vernacular (people's mental image, like "the South").</li>
  <li><b>Spatial concepts:</b> distance decay, time-space compression, and diffusion (relocation, hierarchical, contagious, stimulus).</li>
  <li><b>Data:</b> GIS, GPS, remote sensing, and field observation.</li>
</ul>`,
        check: { q: 'A trend that spreads from large cities to smaller cities, skipping rural areas, shows which type of diffusion?', choices: ['Contagious', 'Hierarchical', 'Relocation', 'Stimulus'], answer: 1, why: 'Hierarchical diffusion moves from more important or connected places down to less important ones.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Population and Migration',
        mins: 9,
        body: `
<ul>
  <li><b>Density:</b> arithmetic (people per land area), physiological (people per arable land, a better measure of pressure on farmland), and agricultural (farmers per arable land).</li>
  <li><b>Population pyramids</b> show age and sex structure. Wide base: fast growth. Narrow base: slow or negative growth.</li>
  <li><b>Demographic Transition Model</b> (DTM): Stage 1 high birth and death rates; Stage 2 death rates drop (fast growth); Stage 3 birth rates drop; Stage 4 both low; Stage 5 birth rate below death rate.</li>
  <li><b>Key rates:</b> crude birth rate, crude death rate, total fertility rate (2.1 is replacement level), infant mortality rate, rate of natural increase.</li>
  <li><b>Malthus</b> predicted population would outgrow food; critics point to technology (the Green Revolution).</li>
  <li><b>Policies:</b> antinatalist (China's one-child policy) and pronatalist (incentives in some European countries).</li>
  <li><b>Migration:</b> push and pull factors, Ravenstein's laws, voluntary vs. forced (refugees), internal and international, chain and step migration, and remittances.</li>
</ul>`,
        check: { q: 'In Stage 2 of the Demographic Transition Model, why does population grow rapidly?', choices: ['Birth rates rise sharply', 'Death rates fall while birth rates stay high', 'Immigration increases', 'Both rates fall'], answer: 1, why: 'Better food, medicine, and sanitation cut death rates, but birth rates remain high for a time.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Cultural Patterns and Processes',
        mins: 8,
        body: `
<ul>
  <li><b>Culture:</b> folk culture (local, traditional) vs. popular culture (widespread, changes fast). Globalization spreads popular culture and can threaten folk cultures.</li>
  <li><b>Cultural landscape:</b> the visible human imprint on the land, like buildings, signs, and religious structures.</li>
  <li><b>Diffusion processes:</b> relocation and expansion diffusion; <b>acculturation</b> (adopting traits while keeping your own), <b>assimilation</b> (fully adopting), <b>syncretism</b> (blending), and multiculturalism.</li>
  <li><b>Religions:</b> <b>universalizing</b> (seek converts: Christianity, Islam, Buddhism, Sikhism) vs. <b>ethnic</b> (tied to a group and place: Hinduism, Judaism). Know each one's hearth and how it spread.</li>
  <li><b>Language:</b> language families (Indo-European is the largest), lingua francas (English), and creole languages.</li>
</ul>`,
        check: { q: 'Which is an example of syncretism?', choices: ['A group fully abandoning its language', 'A religious practice blending Catholic and West African traditions', 'An ethnic religion staying in its hearth', 'A language becoming extinct'], answer: 1, why: 'Syncretism blends elements of different cultures into something new, as in Vodou or Santería.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Political Patterns and Processes',
        mins: 8,
        body: `
<ul>
  <li><b>Key terms:</b> state (sovereign country), nation (people with shared culture), <b>nation-state</b> (Japan, Iceland), <b>multinational state</b> (Russia), <b>stateless nation</b> (the Kurds, Palestinians).</li>
  <li><b>Boundaries:</b> geometric (straight lines), physical (rivers, mountains), and cultural. Antecedent, subsequent, superimposed (imposed by outsiders, like many African borders), and relic boundaries.</li>
  <li><b>State shapes:</b> compact, elongated (Chile), fragmented (Indonesia), perforated (South Africa around Lesotho), prorupted.</li>
  <li><b>Forces:</b> <b>centripetal</b> (unify: shared language, national symbols) vs. <b>centrifugal</b> (divide: ethnic conflict, uneven development).</li>
  <li><b>Devolution:</b> power moving to regions (Scotland, Catalonia). <b>Supranationalism:</b> states joining organizations like the EU and the UN.</li>
  <li><b>Electoral geography:</b> redistricting and gerrymandering (packing and cracking).</li>
  <li><b>Law of the Sea:</b> territorial waters to 12 nautical miles; exclusive economic zone to 200.</li>
</ul>`,
        check: { q: 'The Kurds, who share a culture but have no independent country, are an example of a:', choices: ['Nation-state', 'Multinational state', 'Stateless nation', 'Microstate'], answer: 2, why: 'The Kurds are a nation spread across Turkey, Iraq, Iran, and Syria without their own state.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Agriculture and Rural Land Use',
        mins: 8,
        body: `
<ul>
  <li><b>Agricultural revolutions:</b> the Neolithic (first farming), the Second (Britain, 1700s, with mechanization and better yields), and the Third or <b>Green Revolution</b> (high-yield seeds, fertilizers, irrigation).</li>
  <li><b>Intensive</b> (lots of labor or capital per land: market gardening, rice farming) vs. <b>extensive</b> (less input over large areas: ranching, shifting cultivation).</li>
  <li><b>Subsistence vs. commercial</b> farming. Plantation agriculture grows cash crops for export.</li>
  <li><b>Von Thünen model:</b> rings around a market city: dairy and market gardening closest, then forest, then grains, then ranching. The cost of transporting goods drives the pattern.</li>
  <li><b>Rural settlement patterns:</b> clustered, dispersed, and linear. Survey methods: metes and bounds, township and range, long lots.</li>
  <li><b>Modern issues:</b> agribusiness, GMOs, food deserts, desertification, and the role of women in farming.</li>
</ul>`,
        check: { q: 'In the von Thünen model, why are perishable goods like milk produced closest to the city?', choices: ['Land is cheapest there', 'They must reach market quickly before spoiling, and transport costs are high', 'Cities require it by law', 'The climate is best there'], answer: 1, why: 'Perishable, heavy goods are expensive or risky to move, so they\'re produced close to the market.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Cities and Urban Land Use',
        mins: 8,
        body: `
<ul>
  <li><b>Urbanization:</b> the share of people living in cities. Megacities (10 million or more) are growing fastest in developing countries.</li>
  <li><b>City systems:</b> the <b>rank-size rule</b> (the nth city is 1/n the size of the largest) vs. a <b>primate city</b> (more than twice the next largest, like Lima). <b>Central place theory</b> (Christaller) explains market areas.</li>
  <li><b>Urban models:</b> the concentric zone (Burgess), sector (Hoyt), multiple nuclei (Harris and Ullman), galactic city (edge cities), and models for Latin American, African, and Southeast Asian cities.</li>
  <li><b>Issues:</b> suburban sprawl, gentrification, redlining, squatter settlements, and infrastructure.</li>
  <li><b>Responses:</b> smart growth, New Urbanism (walkable, mixed-use neighborhoods), and urban growth boundaries.</li>
</ul>`,
        check: { q: 'Lima, Peru, is more than twice the size of Peru\'s next largest city. This makes it a:', choices: ['World city', 'Primate city', 'Edge city', 'Boomburb'], answer: 1, why: 'A primate city is disproportionately larger than other cities in its country and dominates its economy and culture.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Industrial and Economic Development',
        mins: 8,
        body: `
<ul>
  <li><b>Economic sectors:</b> primary (extracting resources), secondary (manufacturing), tertiary (services), quaternary (information), and quinary (top-level decision-making).</li>
  <li><b>Measures of development:</b> GDP and GNI per capita, the <b>Human Development Index</b> (income, education, life expectancy), the Gender Inequality Index, and the Gini coefficient.</li>
  <li><b>Theories:</b> <b>Rostow's stages</b> (traditional society to high mass consumption), <b>Wallerstein's world-systems theory</b> (core, semi-periphery, periphery), and <b>dependency theory</b>.</li>
  <li><b>Weber's least-cost theory:</b> industries locate to minimize transport, labor, and agglomeration costs. Bulk-reducing industries locate near raw materials; bulk-gaining near markets.</li>
  <li><b>Globalization:</b> outsourcing, special economic zones, export processing zones, and maquiladoras. Deindustrialization in core countries.</li>
  <li><b>Sustainable development:</b> the UN Sustainable Development Goals; microloans that help people, especially women, start businesses.</li>
</ul>`,
        check: { q: 'In world-systems theory, countries that supply raw materials and cheap labor to wealthy countries are in the:', choices: ['Core', 'Semi-periphery', 'Periphery', 'Quinary sector'], answer: 2, why: 'Periphery countries export raw materials and labor, while core countries control high-value production and capital.' },
      },
    ],
  },
];
