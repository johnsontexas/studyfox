// AP English and the AP Capstone courses (Seminar, Research).
import { bad, good, rule, table, tip } from './lesson-kit.js';

// The Lang and Lit essays share a 6-point rubric.
const essayRubric = `${table(['Row', 'Points', 'What earns it'], [
  ['Thesis', '0 to 1', 'A defensible claim that responds to the prompt'],
  ['Evidence and commentary', '0 to 4', 'Specific evidence, plus commentary that explains how it supports your line of reasoning'],
  ['Sophistication', '0 to 1', 'Complex understanding: tensions, broader context, or a consistently vivid, persuasive style'],
])}`;

export const AP_ENGLISH_COURSES = [
  {
    id: 'ap-lang',
    subject: 'English',
    ap: true,
    icon: 'edit',
    title: 'AP English Language and Composition',
    blurb: 'Rhetorical analysis, argument, and synthesis: how writers persuade, and how to write all three AP Lang essays.',
    level: 'AP · Grade 11',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and the essay rubric',
        mins: 6,
        body: `
<p>The exam: 45 multiple-choice questions (60 min, 45%) on reading and on revising writing, then 3 essays (2 hours 15 min including a 15-minute reading period, 55%): synthesis, rhetorical analysis, and argument.</p>
${essayRubric}
${rule('Commentary is where the points are. Most essays that score a 3 or 4 have evidence but stop short of explaining <b>how</b> it proves the claim.')}`,
        check: { q: 'How many points is the evidence and commentary row worth?', choices: ['1', '2', '4', '6'], answer: 2, why: 'Evidence and commentary is worth up to 4 of the 6 points, so it decides most scores.' },
      },
      {
        id: 'rhetorical-situation',
        title: 'The rhetorical situation',
        mins: 6,
        body: `
<p>Every text is a response to a situation. Before analyzing, identify:</p>
<ul>
  <li><b>Exigence:</b> the event or problem that prompted the writing.</li>
  <li><b>Speaker:</b> who is writing, and what gives them credibility.</li>
  <li><b>Audience:</b> who the writer is trying to reach, and what they believe.</li>
  <li><b>Purpose:</b> what the writer wants the audience to think, feel, or do.</li>
  <li><b>Context:</b> the time, place, and circumstances.</li>
</ul>
<p>Appeals are tools for a purpose: <b>ethos</b> (credibility), <b>pathos</b> (emotion and values), and <b>logos</b> (reasoning and evidence).</p>
${tip('Avoid essays that just label appeals ("this is pathos"). Explain what the choice <i>does</i> for this audience and this purpose.')}`,
        check: { q: 'What is the "exigence" of a speech?', choices: ['Its main emotional appeal', 'The event or problem that prompted it', 'Its intended audience', 'Its conclusion'], answer: 1, why: 'Exigence is the urgent occasion that called for the writing, like a tragedy, a policy debate, or a graduation.' },
      },
      {
        id: 'rhetorical-analysis',
        title: 'Writing the rhetorical analysis essay',
        mins: 8,
        body: `
<p>You get a passage (often a speech or letter) and explain how the writer's choices achieve the purpose.</p>
<ol>
  <li><b>Read for purpose first.</b> What does the writer want, from whom?</li>
  <li><b>Find 2 or 3 major choices,</b> often in the order they appear: an anecdote, a contrast, a shift in tone, repetition, an appeal to shared values.</li>
  <li><b>Thesis:</b> name the purpose and the choices. "To persuade graduates to embrace failure, Rowling shares her own setbacks and redefines success."</li>
  <li><b>Body paragraphs:</b> quote the choice, then explain how it affects the audience and serves the purpose.</li>
</ol>
${bad('Obama uses pathos in this paragraph to make the audience feel emotion.')}
${good('By describing the firefighters who "ran toward the danger," Obama reminds a grieving nation of its own capacity for courage, shifting the audience from mourning toward resolve.')}
${rule('Use strong verbs for the writer\'s moves: <i>juxtaposes, concedes, reframes, undercuts, invokes, escalates</i>. They make your commentary precise.')}`,
        check: { q: 'What should your commentary in a rhetorical analysis focus on?', choices: ['Whether you agree with the writer', 'How the writer\'s choices affect the audience and serve the purpose', 'Defining every rhetorical device', 'Summarizing the passage'], answer: 1, why: 'Rhetorical analysis explains how choices work, not whether the argument is right.' },
      },
      {
        id: 'argument',
        title: 'Writing the argument essay',
        mins: 7,
        body: `
<p>You get a claim or issue and write your own argument, using evidence from your reading, history, current events, and experience.</p>
<ul>
  <li><b>Take a clear, qualified position.</b> Nuance often earns the sophistication point: "Competition motivates people, but only when the stakes don't crush the joy of the work."</li>
  <li><b>Use specific evidence.</b> Named examples (a historical event, a study, a book) beat vague ones ("many people say...").</li>
  <li><b>Explain the link</b> between each example and your claim. The example doesn't speak for itself.</li>
  <li><b>Address a counterargument,</b> then answer it.</li>
</ul>
${tip('Build an "evidence bank" before the exam: 8 to 10 examples from history, science, literature, and current events that you know well enough to use on almost any topic.')}`,
        check: { q: 'Which piece of evidence is strongest in an argument essay?', choices: ['"Everyone knows this is true."', '"Studies show it."', 'A specific named example explained in detail', 'A dictionary definition'], answer: 2, why: 'Specific, well-explained examples are far more convincing and earn more evidence points.' },
      },
      {
        id: 'synthesis',
        title: 'Writing the synthesis essay',
        mins: 7,
        body: `
<p>You read 6 or 7 sources on an issue (including a chart or image) and write an argument that cites <b>at least 3</b> of them.</p>
<ol>
  <li><b>During the reading period,</b> mark each source as for, against, or complicating. Note the strongest line in each.</li>
  <li><b>Take your own position.</b> The sources support your argument; they don't replace it.</li>
  <li><b>Put sources in conversation:</b> "While Source A praises the policy's savings, Source D shows that rural families bear most of its cost."</li>
  <li><b>Cite</b> as (Source A) or by the author's name.</li>
</ol>
${rule('Never write a paragraph per source. Organize by your reasons and pull in whatever sources support each one.')}`,
        check: { q: 'What is the minimum number of sources you must cite in the synthesis essay?', choices: ['1', '2', '3', 'All of them'], answer: 2, why: 'The rubric requires evidence from at least three of the provided sources to earn evidence points.' },
      },
      {
        id: 'multiple-choice',
        title: 'Multiple choice: reading and composition',
        mins: 6,
        body: `
<p>The exam has two kinds of passages:</p>
<ul>
  <li><b>Reading questions</b> ask about the writer's purpose, the function of a sentence or paragraph, tone, and how the argument is built.</li>
  <li><b>Composition questions</b> treat the passage as a draft and ask how to revise it: which sentence best supports the claim, where to add a transition, which evidence fits the audience.</li>
</ul>
${tip('For composition questions, reread the goal in the question stem ("to strengthen the claim about cost..."). The right answer does exactly that, even if other choices are well written.')}`,
        check: { q: 'A composition question asks which revision best "establishes the writer\'s credibility." What should you look for?', choices: ['The most emotional sentence', 'A sentence showing the writer\'s experience or expertise', 'The shortest sentence', 'A statistic about a different topic'], answer: 1, why: 'Credibility (ethos) comes from the writer\'s relevant experience, knowledge, or fairness.' },
      },
    ],
  },

  {
    id: 'ap-lit',
    subject: 'English',
    ap: true,
    icon: 'book',
    title: 'AP English Literature and Composition',
    blurb: 'Read fiction, poetry, and drama closely, and write the poetry analysis, prose analysis, and literary argument essays.',
    level: 'AP · Grade 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and the essay rubric',
        mins: 6,
        body: `
<p>The exam: 55 multiple-choice questions on passages of prose and poetry (60 min, 45%), then 3 essays (2 hours, 55%): poetry analysis, prose fiction analysis, and a literary argument about a work you choose.</p>
${essayRubric}
${tip('For the literary argument (Q3), prepare 3 or 4 works you know deeply: plot, characters, key scenes, and themes. Novels and plays with rich conflicts work for almost any prompt.')}`,
        check: { q: 'In the literary argument essay (Q3), what do you write about?', choices: ['A passage printed on the exam', 'A novel or play you choose', 'Only a poem', 'A nonfiction article'], answer: 1, why: 'Q3 gives a prompt about a literary idea, and you choose an appropriate work of literary merit to discuss.' },
      },
      {
        id: 'character',
        title: 'Character and narration',
        mins: 7,
        body: `
<ul>
  <li><b>Characterization:</b> what a character says, does, thinks, and how others react. Notice when a character <b>changes</b> (dynamic) and what causes it.</li>
  <li><b>Character foils</b> highlight each other by contrast.</li>
  <li><b>Narrator and point of view:</b> first person (limited, possibly unreliable), third person limited, third person omniscient. Ask what the narrator knows, and what they don't see.</li>
  <li><b>Unreliable narrators</b> create a gap between what they say and what the reader understands; that gap is often the point.</li>
</ul>
${rule('Character questions usually come down to motive and conflict: what does this person want, and what stands in the way?')}`,
        check: { q: 'Why might an author use an unreliable narrator?', choices: ['To confuse the reader for no reason', 'To create a gap between the narrator\'s view and the truth, revealing something about the character', 'Because third person is too difficult', 'To make the story shorter'], answer: 1, why: 'The reader sees what the narrator misses, which reveals the narrator\'s blind spots and often the theme.' },
      },
      {
        id: 'setting-structure',
        title: 'Setting, structure, and plot',
        mins: 6,
        body: `
<ul>
  <li><b>Setting</b> can reflect a character's inner state, create conflict, or carry symbolic meaning (a storm, a closed room).</li>
  <li><b>Structure:</b> where the story starts and ends, flashbacks, foreshadowing, and pacing. Ask why the author arranged events this way.</li>
  <li><b>Shifts</b> in tone, time, or perspective often mark the most important moments of a passage.</li>
  <li><b>Contrasts and juxtapositions</b> create meaning by putting unlike things side by side.</li>
</ul>
${tip('In a prose passage, look for the turn: the sentence where something changes. Analyze what comes before and after it.')}`,
        check: { q: 'In a prose passage, what is a "shift"?', choices: ['A spelling error', 'A change in tone, time, or perspective', 'The title', 'A footnote'], answer: 1, why: 'Shifts signal changes in meaning, and they are great places to focus analysis.' },
      },
      {
        id: 'poetry',
        title: 'Reading and analyzing poetry',
        mins: 8,
        body: `
<ol>
  <li><b>Read it twice,</b> once for the literal situation (who is speaking, to whom, about what) and once for how it says it.</li>
  <li><b>Find the speaker</b> (not the same as the poet) and the occasion.</li>
  <li><b>Look for the volta,</b> or turn, especially in sonnets.</li>
  <li><b>Track images and figurative language:</b> metaphor, simile, personification, symbol. What pattern do they form?</li>
  <li><b>Notice sound and form:</b> rhyme, meter, line breaks, enjambment, and stanza shape. Ask how form supports meaning.</li>
</ol>
${table(['Term', 'Meaning'], [
  ['Enjambment', 'A sentence that runs past the end of a line, creating suspense or emphasis'],
  ['Caesura', 'A pause in the middle of a line'],
  ['Apostrophe', 'Addressing someone absent or something nonhuman ("O Death")'],
  ['Conceit', 'An extended, surprising metaphor'],
])}`,
        check: { q: 'What is the volta in a sonnet?', choices: ['The rhyme scheme', 'The turn, where the poem shifts in argument or tone', 'The first line', 'The title'], answer: 1, why: 'The volta marks a shift, such as from problem to resolution, and is often key to the poem\'s meaning.' },
      },
      {
        id: 'figurative',
        title: 'Figurative language, symbols, and theme',
        mins: 6,
        body: `
<ul>
  <li><b>Metaphor and simile</b> compare unlike things. Ask what qualities transfer from one to the other.</li>
  <li><b>Symbols</b> stand for something beyond themselves (the green light in The Great Gatsby).</li>
  <li><b>Irony:</b> verbal (saying the opposite of what you mean), situational (the opposite of what's expected), and dramatic (the audience knows what the character doesn't).</li>
  <li><b>Theme</b> is a statement about life, not a single word. "Love" is a topic; "Love can become possessive when it's built on fear" is a theme.</li>
</ul>
${bad('The theme of the story is loneliness.')}
${good('The story suggests that isolation can protect people from pain but also keeps them from the connections that would heal it.')}`,
        check: { q: 'Which is a theme, not just a topic?', choices: ['Ambition', 'Family', 'Unchecked ambition can destroy the relationships that made success meaningful', 'Power'], answer: 2, why: 'A theme is a complete idea about life; the others are one-word topics.' },
      },
      {
        id: 'essays',
        title: 'Writing the three literature essays',
        mins: 8,
        body: `
<h3>Poetry and prose analysis (Q1, Q2)</h3>
<ul>
  <li>The prompt names the focus (for example, "how the author portrays the complex relationship between a father and son"). Your thesis must answer it with an interpretation.</li>
  <li>Organize by ideas or by sections of the passage, not by device ("paragraph on imagery, paragraph on diction").</li>
  <li>Embed short quotes and explain how the language creates the meaning.</li>
</ul>
<h3>Literary argument (Q3)</h3>
<ul>
  <li>Pick a work that clearly fits the prompt. Use specific scenes and moments, not plot summary.</li>
  <li>Connect every paragraph to how the idea in the prompt shapes the meaning of the work as a whole.</li>
</ul>
${rule('Plot summary earns no points. Every paragraph should argue an interpretation and prove it with analysis.')}`,
        check: { q: 'Why should you avoid organizing a literary analysis by device (one paragraph on imagery, one on diction)?', choices: ['Devices aren\'t allowed on the AP exam', 'It tends to produce a list instead of an argument about meaning', 'It makes the essay too short', 'Graders only read the first paragraph'], answer: 1, why: 'Organizing by ideas keeps the essay focused on interpretation, with devices as evidence.' },
      },
    ],
  },

  {
    id: 'ap-seminar',
    subject: 'English',
    ap: true,
    icon: 'users',
    title: 'AP Seminar and AP Research',
    blurb: 'The AP Capstone courses: investigate real-world issues, evaluate sources, collaborate, write research papers, and present your findings.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'capstone',
        title: 'How AP Capstone works',
        mins: 5,
        body: `
<p>AP Capstone is two courses taken in order: <b>AP Seminar</b>, then <b>AP Research</b>. Students who score 3 or higher on both, plus four other AP exams, earn the AP Capstone Diploma.</p>
<ul>
  <li><b>AP Seminar:</b> a team project and presentation, an individual research essay and presentation, and an end-of-course written exam.</li>
  <li><b>AP Research:</b> a year-long independent research project, resulting in an academic paper of about 4,000 to 5,000 words and a presentation with an oral defense. There is no end-of-course exam.</li>
</ul>
<p>Both courses use the <b>QUEST</b> framework: Question and explore, Understand and analyze, Evaluate multiple perspectives, Synthesize ideas, Team, transform, and transmit.</p>`,
        check: { q: 'What is the final product of AP Research?', choices: ['A multiple-choice exam', 'An academic paper and an oral defense', 'A group skit', 'A portfolio of poems'], answer: 1, why: 'AP Research culminates in a 4,000 to 5,000 word paper and a presentation with an oral defense.' },
      },
      {
        id: 'sources',
        title: 'Finding and evaluating sources',
        mins: 7,
        body: `
<ul>
  <li><b>Use scholarly sources:</b> peer-reviewed journals, academic books, and government data. Library databases and Google Scholar help.</li>
  <li><b>Evaluate each source:</b> the author's credentials, the publisher, the date, the evidence used, and possible bias or funding conflicts.</li>
  <li><b>Lateral reading:</b> check what other trusted sources say about a website or author, instead of trusting the site's own "About" page.</li>
  <li><b>Separate claims from evidence.</b> Note what the source actually shows versus what it argues.</li>
</ul>
${tip('Keep an annotated bibliography from day one: the citation, a two-sentence summary, and a note on how credible it is and how you might use it.')}`,
        check: { q: 'What is "lateral reading"?', choices: ['Reading a source from right to left', 'Checking other trusted sources about a site or author before trusting it', 'Reading only the abstract', 'Skimming headings'], answer: 1, why: 'Professional fact-checkers judge credibility by leaving the site and seeing what others say about it.' },
      },
      {
        id: 'research-question',
        title: 'Building a research question and method',
        mins: 7,
        body: `
<ul>
  <li><b>A good research question</b> is focused, researchable, and fills a gap in what is known. "How does social media affect teens?" is too broad. "How does nightly phone use after 10 p.m. relate to sleep quality among students at my school?" is focused.</li>
  <li><b>Literature review:</b> summarize what researchers already know and identify the <b>gap</b> your project addresses.</li>
  <li><b>Choose a method that fits the question:</b> surveys, interviews, experiments, content analysis, or case studies.</li>
  <li><b>Ethics:</b> research with people needs informed consent and approval from your school's review board.</li>
  <li><b>Limitations:</b> every study has them (small sample, self-reported data). Naming them shows you understand your results.</li>
</ul>`,
        check: { q: 'What is the purpose of a literature review?', choices: ['To list every book you\'ve read', 'To summarize existing research and identify the gap your project addresses', 'To present your final results', 'To argue against all past research'], answer: 1, why: 'The lit review shows what is already known and why your question is worth asking.' },
      },
      {
        id: 'argument',
        title: 'Writing and presenting an argument',
        mins: 6,
        body: `
<ul>
  <li><b>Line of reasoning:</b> a clear path from your claim through each reason to your conclusion.</li>
  <li><b>Synthesize</b> sources: show where they agree, disagree, and how they build on each other.</li>
  <li><b>Consider perspectives:</b> economic, ethical, scientific, cultural, historical, and more.</li>
  <li><b>Cite consistently</b> in one style (APA or MLA).</li>
  <li><b>Presentations:</b> fewer words on slides, a clear structure, and practice answering questions about your choices and limitations.</li>
</ul>
${rule('Plagiarism, including using someone else\'s ideas without credit, results in a score of 0 on a Capstone performance task.')}`,
        check: { q: 'What does it mean to "synthesize" sources?', choices: ['Summarize each one separately', 'Combine and connect them to build your own argument', 'Copy their conclusions', 'Use only one source'], answer: 1, why: 'Synthesis puts sources in conversation with each other and uses them to support a new argument.' },
      },
    ],
  },
];
