// English, History, and Study Skills courses for school.
import { bad, good, rule, tip, worked } from './lesson-kit.js';

export const HUMANITIES_COURSES = [
  {
    id: 'essay-writing',
    subject: 'English',
    icon: 'book',
    title: 'Writing Strong Essays',
    blurb: 'Write clear thesis statements, build body paragraphs with evidence and analysis, and revise until your essay says exactly what you mean.',
    level: 'Grades 8 to 12',
    lessons: [
      {
        id: 'thesis',
        title: 'Writing a thesis statement',
        mins: 6,
        body: `
<p>Your <b>thesis</b> is the one-sentence answer to the essay question. Every paragraph exists to prove it.</p>
${rule('A strong thesis is <b>arguable</b> (someone could disagree), <b>specific</b>, and hints at your <b>reasons</b>.')}
${bad('Social media is used by many teenagers.')}
<p>That's a fact, not an argument. Nobody would disagree.</p>
${bad('Social media is bad.')}
<p>Arguable, but vague. Bad how, and for whom?</p>
${good('Schools should limit phone use during class because constant notifications weaken focus and make it harder for students to retain what they learn.')}
${tip('Write your thesis as an answer to "What do I think, and why?" If you can\'t finish the "because," you need more thinking before you write.')}`,
        check: { q: 'Which is the strongest thesis?', choices: ['The Great Gatsby was written by F. Scott Fitzgerald in 1925.', 'The Great Gatsby is an interesting book with many themes.', 'In The Great Gatsby, Fitzgerald uses Gatsby\'s parties to show that wealth can buy attention but not belonging.', 'This essay will discuss The Great Gatsby.'], answer: 2, why: 'It makes a specific, arguable claim and points to the evidence (the parties). The others are facts, vague, or announcements.' },
      },
      {
        id: 'paragraphs',
        title: 'Body paragraphs: claim, evidence, analysis',
        mins: 7,
        body: `
<p>A strong body paragraph has three parts:</p>
<ol>
  <li><b>Claim:</b> a topic sentence that states one reason supporting your thesis.</li>
  <li><b>Evidence:</b> a quote, fact, or example that backs up the claim.</li>
  <li><b>Analysis:</b> your explanation of <i>how</i> the evidence proves the claim. This is where the grade is.</li>
</ol>
${rule('Aim for at least as much analysis as evidence. Evidence shows what; analysis explains why it matters.')}
${worked('Example', `<p><b>Claim:</b> Gatsby's parties show that his wealth attracts crowds but not real connection. <b>Evidence:</b> Nick says he was "one of the few guests who had actually been invited." <b>Analysis:</b> Guests treat the mansion like a public place, not a friend's home, so the parties that are meant to prove Gatsby belongs actually show how alone he is.</p>`)}
${tip('End each paragraph by connecting back to the thesis, not by starting the next topic.')}`,
        check: { q: 'In a body paragraph, what does analysis do?', choices: ['Summarizes the plot', 'Explains how the evidence supports the claim', 'Introduces a new topic', 'Repeats the quote in different words'], answer: 1, why: 'Analysis connects evidence to your claim. Summarizing or paraphrasing the quote isn\'t analysis.' },
      },
      {
        id: 'evidence',
        title: 'Using quotes and evidence',
        mins: 5,
        body: `
<ul>
  <li><b>Introduce every quote.</b> Never drop a quote in as its own sentence.</li>
  <li><b>Keep quotes short.</b> Quote only the words you'll analyze.</li>
  <li><b>Cite it</b> the way your teacher asks (MLA uses the author and page: (Fitzgerald 43)).</li>
</ul>
${bad('Gatsby is hopeful. "He stretched out his arms toward the dark water."')}
${good('Gatsby\'s hope is almost physical: he "stretched out his arms toward the dark water," reaching for a light he can\'t touch.')}`,
        check: { q: 'What is the main problem with a "dropped quote"?', choices: ['It\'s too long', 'It isn\'t connected to your own sentence or idea', 'It uses the wrong citation format', 'It comes from the wrong chapter'], answer: 1, why: 'A dropped quote stands alone with no lead-in, so the reader doesn\'t know why it\'s there.' },
      },
      {
        id: 'intro-conclusion',
        title: 'Introductions and conclusions',
        mins: 5,
        body: `
<h3>Introduction</h3>
<ol>
  <li><b>Hook:</b> a question, surprising fact, or brief scene. Skip "Since the dawn of time."</li>
  <li><b>Context:</b> the title, author, or background the reader needs.</li>
  <li><b>Thesis:</b> usually the last sentence.</li>
</ol>
<h3>Conclusion</h3>
${rule('Don\'t just repeat your thesis. Answer <b>"So what?"</b>: why does your argument matter, or what bigger idea does it connect to?')}
${tip('Many writers draft the introduction last, once they know exactly what the essay argues.')}`,
        check: { q: 'What should a strong conclusion do?', choices: ['Copy the introduction word for word', 'Introduce brand-new evidence', 'Show why the argument matters beyond the essay', 'Apologize for any weak points'], answer: 2, why: 'A conclusion wraps up by showing the significance of your argument, not by repeating or adding new evidence.' },
      },
      {
        id: 'literature',
        title: 'Analyzing literature',
        mins: 6,
        body: `
<ul>
  <li><b>Topic vs. theme:</b> "love" is a topic. A theme is a full statement: "Love can blind people to the truth."</li>
  <li><b>Characterization:</b> what characters say, do, and think, and how others react to them.</li>
  <li><b>Literary devices:</b> symbolism, imagery, metaphor, irony, foreshadowing, and point of view.</li>
</ul>
${rule('Don\'t just name a device. Explain what effect it has and how it builds the theme.')}
${bad('The author uses a lot of imagery.')}
${good('The repeated image of the green light turns Gatsby\'s dream into something visible but always out of reach.')}
${tip('Take notes while reading: jot down repeated images, big choices characters make, and passages that surprise you. Those become your evidence.')}`,
        check: { q: 'Which is a theme, rather than a topic?', choices: ['Friendship', 'Ambition', 'Unchecked ambition can destroy the people closest to us.', 'The 1920s'], answer: 2, why: 'A theme is a complete idea about life. Single words like "friendship" or "ambition" are topics.' },
      },
      {
        id: 'revising',
        title: 'Revising and editing',
        mins: 5,
        body: `
<ol>
  <li><b>Revise big things first:</b> does every paragraph support the thesis? Try a <b>reverse outline</b>: write one line summarizing each paragraph and check the logic.</li>
  <li><b>Then sentences:</b> cut filler words ("very," "really," "in order to"), use active voice, and vary sentence length.</li>
  <li><b>Then proofread:</b> read aloud slowly. Your ear catches what your eyes skip.</li>
</ol>
${bad('It is important to note that the character was very sad.')}
${good('The character was devastated.')}
<p>For grammar and punctuation rules, see the <a href="#/learn/grammar">Grammar Rules</a> course.</p>`,
        check: { q: 'What should you revise first?', choices: ['Spelling', 'Comma placement', 'Whether each paragraph supports the thesis', 'Font and formatting'], answer: 2, why: 'Fix the argument and structure before polishing sentences, or you may polish paragraphs you end up cutting.' },
      },
    ],
  },

  {
    id: 'history',
    subject: 'History',
    icon: 'landmark',
    title: 'How to Study History',
    blurb: 'Understand cause and effect, analyze primary sources, write document-based essays, and remember what matters instead of memorizing everything.',
    level: 'Grades 8 to 12 · AP',
    lessons: [
      {
        id: 'big-picture',
        title: 'Thinking like a historian',
        mins: 6,
        body: `
<p>History isn't a list of dates. It's a story of <b>causes and effects</b>, and of how people's lives changed.</p>
<h3>Historical thinking skills</h3>
<ul>
  <li><b>Causation:</b> what led to an event, and what did it lead to? Separate long-term causes from immediate triggers.</li>
  <li><b>Continuity and change:</b> what changed over a period, and what stayed the same?</li>
  <li><b>Comparison:</b> how were two events, places, or groups similar and different?</li>
  <li><b>Context:</b> what was going on at the time that explains an event?</li>
</ul>
${tip('For any event, try to answer the 5 W\'s plus "So what?": why does it matter for what came later?')}`,
        check: { q: 'Which is an example of a long-term cause, rather than an immediate trigger?', choices: ['A single assassination', 'Decades of rising tensions between alliances', 'A specific battle', 'A declaration of war'], answer: 1, why: 'Long-term causes build over years. Immediate triggers, like an assassination, set things off.' },
      },
      {
        id: 'sources',
        title: 'Primary and secondary sources',
        mins: 6,
        body: `
<ul>
  <li><b>Primary sources</b> come from the time period: letters, speeches, photos, laws, diaries.</li>
  <li><b>Secondary sources</b> are later interpretations: textbooks, historians' books, documentaries.</li>
</ul>
<h3>Sourcing a document (HIPP)</h3>
${rule('<b>H</b>istorical context: what was happening? <b>I</b>ntended audience: who was it for? <b>P</b>urpose: why was it made? <b>P</b>oint of view: who made it, and how might that shape it?')}
<p>A source can be biased and still useful. A politician's speech tells you what they wanted people to believe, which is valuable evidence in itself.</p>`,
        check: { q: 'Which is a primary source about the Civil War?', choices: ['A 2015 history textbook', 'A soldier\'s letter home written in 1863', 'A documentary filmed in 1990', 'An encyclopedia article'], answer: 1, why: 'The letter was created during the event by someone who experienced it.' },
      },
      {
        id: 'essays',
        title: 'Writing history essays',
        mins: 7,
        body: `
<ol>
  <li><b>Thesis with a line of reasoning:</b> answer the prompt and give your categories. "The New Deal expanded the federal government's role through economic relief, new regulations, and social programs."</li>
  <li><b>Group evidence</b> by those categories, not in the order you read it.</li>
  <li><b>Use documents as evidence,</b> not summaries. Explain how each one supports your argument.</li>
  <li><b>Add outside evidence:</b> a fact or example you know that isn't in the documents.</li>
  <li><b>Source some documents</b> using HIPP to show why the author's perspective matters.</li>
</ol>
${tip('Document-based questions (DBQs) reward the argument, not the number of documents you mention.')}`,
        check: { q: 'In a DBQ essay, how should you organize your body paragraphs?', choices: ['One paragraph per document, in order', 'By the categories in your thesis', 'Chronologically by when you read them', 'By document length'], answer: 1, why: 'Grouping evidence by argument category keeps every paragraph proving part of your thesis.' },
      },
      {
        id: 'remembering',
        title: 'Remembering people, dates, and events',
        mins: 5,
        body: `
<ul>
  <li><b>Build a timeline</b> for each unit. Seeing order and gaps helps cause and effect make sense.</li>
  <li><b>Tell it as a story.</b> Explaining a unit out loud from memory reveals what you don't actually know.</li>
  <li><b>Make flashcards that ask why,</b> not just when: "Why did the Articles of Confederation fail?"</li>
  <li><b>Connect to what you know:</b> link new events to earlier units or to today.</li>
</ul>
${rule('Know the approximate era of everything, and exact dates only for the biggest turning points.')}`,
        check: { q: 'Which flashcard will help most on an essay test?', choices: ['"1787"', '"When was the Constitution written?"', '"Why did the framers replace the Articles of Confederation?"', '"Who was the 3rd president?"'], answer: 2, why: 'Essay tests ask you to explain causes and significance, so practice recalling reasons, not just facts.' },
      },
    ],
  },

  {
    id: 'how-to-learn',
    subject: 'Study Skills',
    icon: 'brain',
    title: 'How to Learn Any Subject',
    blurb: 'Study methods backed by research: how to take notes, study math, English, science, and history, prepare for tests, and stop procrastinating.',
    level: 'Middle and high school',
    lessons: [
      {
        id: 'how-memory-works',
        title: 'How learning actually works',
        mins: 6,
        body: `
<p>Rereading and highlighting feel productive, but research on learning shows they're among the weakest methods. Four habits do most of the work:</p>
<ol>
  <li><b>Active recall:</b> pull information out of your memory. Close the book and write what you remember, or quiz yourself.</li>
  <li><b>Spaced repetition:</b> review a day later, then a few days later, then a week later.</li>
  <li><b>Interleaving:</b> mix problem types instead of doing 20 of the same kind in a row.</li>
  <li><b>Explaining:</b> teach it to someone (or an imaginary student). Where you get stuck is the gap to fill.</li>
</ol>
${rule('If studying feels easy, you probably aren\'t learning much. Effortful recall is what builds memory.')}
${tip('On StudyFox, flashcards give you active recall and spacing, and quick checks at the end of each lesson test you right away.')}`,
        check: { q: 'Which is the least effective way to study?', choices: ['Quizzing yourself with flashcards', 'Rereading your notes several times in a row', 'Reviewing a few days later', 'Explaining the topic out loud from memory'], answer: 1, why: 'Rereading feels familiar but doesn\'t make you retrieve anything. The others use active recall or spacing.' },
      },
      {
        id: 'notes',
        title: 'Taking notes that help',
        mins: 5,
        body: `
<ul>
  <li><b>Don't copy everything.</b> Write main ideas and examples in your own words.</li>
  <li><b>Cornell method:</b> split the page. Notes go on the right, questions or keywords on the left, and a two-sentence summary at the bottom.</li>
  <li><b>Review within 24 hours.</b> Cover the right side and answer the questions on the left.</li>
  <li>For math and science, write down <b>worked examples</b> step by step, not just the final answers.</li>
</ul>
${tip('Handwriting forces you to summarize, which helps you process ideas. If you type, resist the urge to transcribe word for word.')}`,
        check: { q: 'When should you first review notes from a class?', choices: ['The night before the test', 'Within about a day', 'Only if you\'re confused', 'At the end of the semester'], answer: 1, why: 'A quick review within 24 hours, before you\'ve forgotten most of it, makes the material far easier to remember later.' },
      },
      {
        id: 'math-class',
        title: 'Studying for math classes',
        mins: 5,
        body: `
<ol>
  <li><b>Understand why,</b> not just the steps. Ask "why does this work?" for each new method.</li>
  <li><b>Do problems without looking at examples</b> as soon as you can. Watching someone solve a problem is not the same as solving it.</li>
  <li><b>Sort your mistakes:</b> concept (didn't know how), careless (slip), or time (too slow). Each needs a different fix.</li>
  <li><b>Redo missed homework problems</b> a few days later without looking.</li>
  <li><b>Mix problem types</b> before a test, since the test won't label which method to use.</li>
</ol>
<p>See the <a href="#/learn/algebra-1">Algebra 1</a>, <a href="#/learn/geometry">Geometry</a>, <a href="#/learn/precalc">Precalculus</a>, and <a href="#/learn/calculus">Calculus</a> courses to review concepts.</p>`,
        check: { q: 'You solved for $x$ correctly but the question asked for $2x$. What kind of mistake is this?', choices: ['Concept', 'Careless', 'Time', 'Memorization'], answer: 1, why: 'You knew the method but didn\'t answer the question asked. The fix is a habit: reread the question before you choose.' },
      },
      {
        id: 'reading-class',
        title: 'Studying for English classes',
        mins: 5,
        body: `
<ul>
  <li><b>Read actively:</b> keep a pencil or sticky notes handy. Mark confusing parts, repeated images, and big moments.</li>
  <li><b>Summarize each chapter</b> in two or three sentences when you finish it.</li>
  <li><b>Track characters and themes</b> in a simple chart as you read.</li>
  <li><b>Build vocabulary</b> by making flashcards of new words with the sentence you found them in.</li>
  <li><b>Practice writing</b> short responses. Writing is a skill that improves only with reps and feedback.</li>
</ul>
<p>See <a href="#/learn/essay-writing">Writing Strong Essays</a> for how to turn your notes into an essay.</p>`,
        check: { q: 'What\'s the most useful thing to do right after finishing a chapter?', choices: ['Start the next chapter right away', 'Summarize it in two or three sentences', 'Look up a summary online instead', 'Reread the whole chapter'], answer: 1, why: 'Summarizing from memory is active recall, and it shows you right away what you understood.' },
      },
      {
        id: 'science-class',
        title: 'Studying for science classes',
        mins: 5,
        body: `
<ul>
  <li><b>Learn vocabulary first.</b> Science is full of terms, and you can't understand the ideas without them. Flashcards work well here.</li>
  <li><b>Draw it.</b> Sketch processes (the cell cycle, the water cycle, a circuit) from memory.</li>
  <li><b>For problems</b> (chemistry and physics), practice like math: write knowns and unknowns, pick the equation, check the units.</li>
  <li><b>Read graphs carefully:</b> title, axes, units, then the trend.</li>
</ul>
${tip('Units are a free check. If you\'re solving for a speed and your answer is in kilograms, something went wrong.')}`,
        check: { q: 'A good first step for a physics word problem is to:', choices: ['Guess an equation and plug in numbers', 'List the known values and the unknown', 'Skip to the answer choices', 'Memorize the answer'], answer: 1, why: 'Listing knowns and unknowns tells you which equation connects them.' },
      },
      {
        id: 'tests',
        title: 'Preparing for a test',
        mins: 5,
        body: `
<ol>
  <li><b>Start about a week out.</b> Several short sessions beat one all-nighter.</li>
  <li><b>Make a practice test</b> from old homework, quizzes, and the review sheet, and take it under real conditions.</li>
  <li><b>Study your mistakes,</b> not the material you already know.</li>
  <li><b>Sleep.</b> Your brain stores memories while you sleep, so pulling an all-nighter undoes your studying.</li>
  <li><b>After the test,</b> look at what you missed and why. It improves the next test.</li>
</ol>
${rule('Practice testing is one of the most effective study methods ever measured. Test yourself before your teacher does.')}`,
        check: { q: 'Which plan is best for a test in one week?', choices: ['Study for 5 hours the night before', 'Short sessions over several days, including practice tests', 'Reread the textbook once', 'Wait until the review day'], answer: 1, why: 'Spreading study out and testing yourself are two of the most effective methods, and they leave time to fix weak spots.' },
      },
      {
        id: 'planning',
        title: 'Beating procrastination',
        mins: 5,
        body: `
<ul>
  <li><b>Make the first step tiny:</b> "open the doc and write one sentence." Starting is the hardest part.</li>
  <li><b>Use a timer:</b> work 25 minutes, then take a 5-minute break (the Pomodoro method).</li>
  <li><b>Put your phone in another room.</b> Even a silent phone on the desk pulls at your attention.</li>
  <li><b>Plan your week</b> on Sunday: list due dates, then break big projects into daily steps.</li>
  <li><b>Study at the same time each day</b> so it becomes a habit rather than a decision.</li>
</ul>
${tip('Procrastination is usually about avoiding a bad feeling, not about laziness. Shrinking the task shrinks the feeling.')}`,
        check: { q: 'You keep putting off a big research paper. What is the best first move?', choices: ['Wait until you feel motivated', 'Break it into small steps and do the first one for 25 minutes', 'Work on it all at once the weekend before', 'Start a different assignment'], answer: 1, why: 'Small, concrete steps and a short timed session make it much easier to start, and starting builds momentum.' },
      },
    ],
  },
];
