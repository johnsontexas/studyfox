// AP arts courses (Art History, Music Theory, Art and Design) and AP World Languages.
import { rule, table, tip } from './lesson-kit.js';

export const AP_ARTS_COURSES = [
  {
    id: 'ap-art-history',
    subject: 'Arts',
    ap: true,
    icon: 'palette',
    title: 'AP Art History',
    blurb: 'Art and architecture from prehistory to today across ten world regions, and how to analyze any work by form, function, content, and context.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and how to analyze a work',
        mins: 7,
        body: `
<p>The course covers 250 required works in 10 content areas. The exam: 80 multiple-choice questions (1 hour, 50%) and 6 free-response questions (2 hours, 50%), including two long essays and four short ones. Some questions use works you haven't studied.</p>
<h3>Four lenses for any work</h3>
<ul>
  <li><b>Form:</b> materials, technique, composition, color, line, scale.</li>
  <li><b>Function:</b> what it was made to do (worship, political power, remembrance, daily use).</li>
  <li><b>Content:</b> what it shows: subject, iconography, symbols.</li>
  <li><b>Context:</b> who made it, for whom, when, where, and how it was received.</li>
</ul>
${rule('Always connect form to meaning: "The pyramid\'s massive, stable form expressed the permanence of the pharaoh\'s rule."')}
${tip('For each required work, know the title, culture, approximate date, materials, and at least one form-and-context connection. Flashcards with the image on one side work well.')}`,
        check: { q: 'Which lens asks what a work was made to do?', choices: ['Form', 'Function', 'Content', 'Style'], answer: 1, why: 'Function covers purpose and use, like worship, political messaging, or commemoration.' },
      },
      {
        id: 'ancient',
        title: 'Global prehistory and the ancient Mediterranean',
        mins: 8,
        body: `
<ul>
  <li><b>Global prehistory</b> (about 30,000 to 500 BCE): cave paintings (Lascaux), the Venus of Willendorf, Stonehenge. Art tied to survival, ritual, and the earliest settled societies.</li>
  <li><b>Ancient Near East:</b> the White Temple and ziggurat of Uruk, the Standard of Ur, the Code of Hammurabi stele (law with divine authority), Assyrian lamassu.</li>
  <li><b>Egypt:</b> art for the afterlife and eternal kingship. The pyramids of Giza, the Palette of King Narmer (hierarchical scale), and the Amarna period's brief shift to more naturalistic forms under Akhenaten.</li>
  <li><b>Greece:</b> from stiff Archaic kouros figures to Classical balance and <b>contrapposto</b> (the Doryphoros), then Hellenistic drama and emotion (the Nike of Samothrace).</li>
  <li><b>Etruscan and Roman:</b> realistic portraits (veristic busts), the Pantheon's concrete dome, and art serving imperial propaganda (Augustus of Prima Porta).</li>
</ul>`,
        check: { q: 'What is contrapposto?', choices: ['A fresco technique', 'A stance with weight on one leg, making the body look relaxed and natural', 'An Egyptian burial practice', 'A type of Roman arch'], answer: 1, why: 'Classical Greek sculptors used contrapposto to make figures look naturally balanced and alive.' },
      },
      {
        id: 'europe',
        title: 'Early Europe and Colonial Americas',
        mins: 8,
        body: `
<ul>
  <li><b>Early Christian and Byzantine:</b> catacomb paintings, mosaics in San Vitale (Justinian and Theodora joining political and religious power), and Hagia Sophia.</li>
  <li><b>Romanesque and Gothic:</b> pilgrimage churches with round arches; Gothic cathedrals (Chartres) with pointed arches, rib vaults, flying buttresses, and stained glass that filled interiors with light.</li>
  <li><b>Renaissance:</b> linear perspective, classical revival, and humanism (Masaccio, Leonardo's Last Supper, Michelangelo's Sistine Chapel). Northern artists used oil paint for fine detail (the Arnolfini Portrait).</li>
  <li><b>Baroque:</b> drama, motion, and strong light and dark contrast (Caravaggio, Bernini) to serve the Counter-Reformation. Dutch art showed daily life for a merchant market (Vermeer, Rembrandt).</li>
  <li><b>Colonial Americas:</b> works blending European and Indigenous traditions, like casta paintings and the Virgin of Guadalupe images.</li>
</ul>`,
        check: { q: 'Which architectural feature let Gothic cathedrals have tall walls with large windows?', choices: ['The post and lintel', 'The flying buttress', 'The ziggurat', 'The dome'], answer: 1, why: 'Flying buttresses carried the walls\' outward thrust, so walls could be thinner and filled with stained glass.' },
      },
      {
        id: 'modern',
        title: 'Later Europe and Americas (1750 to 1980)',
        mins: 8,
        body: `
<ul>
  <li><b>Neoclassicism</b> (David's Oath of the Horatii) used classical order to express civic virtue. <b>Romanticism</b> (Goya, Delacroix) emphasized emotion, nature, and the sublime.</li>
  <li><b>Realism</b> (Courbet) showed ordinary life; <b>photography</b> changed how artists thought about representation.</li>
  <li><b>Impressionism</b> (Monet) captured light and modern life; <b>Post-Impressionism</b> (Van Gogh, Cézanne) pushed toward expression and structure.</li>
  <li><b>Modernism:</b> Cubism (Picasso's Les Demoiselles d'Avignon), Dada (Duchamp's Fountain), Surrealism (Dalí), Abstract Expressionism (Pollock), and Pop Art (Warhol).</li>
  <li><b>Architecture:</b> new materials like iron and steel led to skyscrapers and modernist buildings (Wright's Fallingwater).</li>
</ul>`,
        check: { q: 'What did Impressionist painters focus on capturing?', choices: ['Religious scenes in precise detail', 'Fleeting effects of light and modern life', 'Classical myths', 'Geometric abstraction only'], answer: 1, why: 'Impressionists painted quickly, often outdoors, to capture changing light and everyday modern scenes.' },
      },
      {
        id: 'global',
        title: 'Africa, Asia, Indigenous Americas, and the Pacific',
        mins: 9,
        body: `
<ul>
  <li><b>Indigenous Americas:</b> Chavín, the Templo Mayor (Aztec), Machu Picchu (Inca), Mesa Verde cliff dwellings, and Plains ledger drawings.</li>
  <li><b>Africa:</b> the Great Mosque of Djenné (mud brick, rebuilt by the community), Benin bronze plaques, Kuba and Yoruba masks used in performances, and power figures (nkisi n'kondi). Many works are meant to be experienced in use, not in museums.</li>
  <li><b>West and Central Asia:</b> the Dome of the Rock, the Great Mosque of Isfahan, and Islamic art's calligraphy and geometric patterns.</li>
  <li><b>South, East, and Southeast Asia:</b> the Great Stupa at Sanchi, Angkor Wat, the Terracotta Army, Japanese woodblock prints (Hokusai's Great Wave), and Chinese landscape painting.</li>
  <li><b>The Pacific:</b> Moai on Rapa Nui, Maori meeting houses, and navigation charts from the Marshall Islands.</li>
  <li><b>Global contemporary</b> (1980 to now): art about identity, globalization, and technology (Maya Lin's Vietnam Veterans Memorial, Kara Walker, El Anatsui).</li>
</ul>`,
        check: { q: 'Why is the Great Mosque of Djenné re-plastered every year?', choices: ['It is made of marble that stains', 'Its mud brick needs annual renewal, done as a community festival', 'It is rebuilt in a new location each year', 'It is a temporary structure'], answer: 1, why: 'Rain erodes the mud plaster, so the community renews it each year, making upkeep part of the building\'s meaning.' },
      },
    ],
  },

  {
    id: 'ap-music-theory',
    subject: 'Arts',
    ap: true,
    icon: 'music',
    title: 'AP Music Theory',
    blurb: 'Read and write music: scales, intervals, chords, voice leading, cadences, and the ear-training and sight-singing skills the exam tests.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam',
        mins: 5,
        body: `
<ul>
  <li><b>Multiple choice:</b> 75 questions (80 min, 45%), with and without recorded music.</li>
  <li><b>Free response</b> (55%): 7 written questions (melodic and harmonic dictation, writing voice leading from figured bass and Roman numerals, and harmonizing a melody) plus 2 sight-singing questions you record.</li>
</ul>
${tip('Ear training takes daily practice. Ten minutes a day of interval and chord identification beats an hour once a week.')}`,
        check: { q: 'Which part of the exam asks you to sing a melody at first sight?', choices: ['Multiple choice', 'Sight-singing in the free-response section', 'Melodic dictation', 'There is no singing'], answer: 1, why: 'Two free-response questions ask you to sing a short melody, which is recorded and scored.' },
      },
      {
        id: 'fundamentals',
        title: 'Scales, keys, and intervals',
        mins: 8,
        body: `
<ul>
  <li><b>Major scale pattern:</b> W W H W W W H (W = whole step, H = half step).</li>
  <li><b>Minor scales:</b> natural minor (W H W W H W W), harmonic minor (raised 7th), and melodic minor (raised 6th and 7th going up).</li>
  <li><b>Key signatures:</b> the circle of fifths. Sharps add in order F C G D A E B; flats in order B E A D G C F. A relative minor shares its major key's signature and starts on scale degree 6.</li>
  <li><b>Intervals</b> have a size (2nd, 3rd...) and a quality: perfect (unisons, 4ths, 5ths, octaves), major or minor (2nds, 3rds, 6ths, 7ths), augmented, or diminished.</li>
  <li><b>Inversion:</b> intervals add to 9 when inverted (a 3rd becomes a 6th) and major becomes minor.</li>
</ul>`,
        check: { q: 'What is the relative minor of C major?', choices: ['C minor', 'A minor', 'E minor', 'G minor'], answer: 1, why: 'A is scale degree 6 of C major, and A minor shares C major\'s key signature (no sharps or flats).' },
      },
      {
        id: 'chords',
        title: 'Chords and Roman numerals',
        mins: 8,
        body: `
<ul>
  <li><b>Triads:</b> major, minor, diminished, augmented. Seventh chords add a 7th above the root (the dominant seventh, V7, is the most common).</li>
  <li><b>Roman numerals in major:</b> I, ii, iii, IV, V, vi, vii°. In minor (with raised 7th): i, ii°, III, iv, V, VI, vii°.</li>
  <li><b>Inversions and figured bass:</b> root position (5/3), first inversion (6), second inversion (6/4). For sevenths: 7, 6/5, 4/3, 4/2.</li>
  <li><b>Functions:</b> tonic (I), predominant (ii, IV), dominant (V, vii°). Progressions usually move tonic, predominant, dominant, tonic.</li>
</ul>
${table(['Cadence', 'Chords', 'Sound'], [
  ['Authentic', 'V to I', 'Final, closed'],
  ['Half', 'Ends on V', 'Open, like a comma'],
  ['Plagal', 'IV to I', 'The "amen" ending'],
  ['Deceptive', 'V to vi', 'Surprise'],
])}`,
        check: { q: 'A phrase ends on V. What cadence is it?', choices: ['Authentic', 'Half', 'Plagal', 'Deceptive'], answer: 1, why: 'A half cadence pauses on the dominant, sounding unfinished.' },
      },
      {
        id: 'voice-leading',
        title: 'Four-part voice leading',
        mins: 8,
        body: `
<p>Write for soprano, alto, tenor, and bass (SATB).</p>
<ul>
  <li><b>Ranges and spacing:</b> keep adjacent upper voices within an octave; the tenor and bass can be farther apart.</li>
  <li><b>Doubling:</b> in root position, usually double the root. Never double the leading tone.</li>
  <li><b>Avoid parallel 5ths and octaves</b> between any two voices.</li>
  <li><b>Resolve tendency tones:</b> the leading tone moves up to tonic; the 7th of a chord moves down by step.</li>
  <li>Move upper voices smoothly, by step or common tone when possible. Avoid voice crossing.</li>
</ul>
${rule('Check every pair of voices for parallel 5ths and octaves. With four voices there are six pairs to check.')}`,
        check: { q: 'In four-part writing, which note should never be doubled?', choices: ['The root', 'The fifth', 'The leading tone', 'The bass note'], answer: 2, why: 'The leading tone must resolve up to tonic; doubling it creates parallel octaves or a bad resolution.' },
      },
    ],
  },

  {
    id: 'ap-art-design',
    subject: 'Arts',
    ap: true,
    icon: 'palette',
    title: 'AP Art and Design',
    blurb: 'How the 2-D, 3-D, and Drawing portfolios work: building a sustained investigation, selecting your best works, and writing about your process.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'portfolio',
        title: 'How the portfolio is scored',
        mins: 6,
        body: `
<p>There is no written exam. You submit a portfolio in one of three courses: <b>2-D Art and Design</b>, <b>3-D Art and Design</b>, or <b>Drawing</b>.</p>
${table(['Section', 'What you submit', 'Weight'], [
  ['Sustained Investigation', '15 images showing an inquiry-guided body of work, including practice, experimentation, and revision, with written responses', '60%'],
  ['Selected Works', '5 works (physical or digital images) showing your skill with materials, processes, and ideas, with written descriptions', '40%'],
])}
${tip('Your inquiry question drives everything. "How can I show memory through layered, fading images?" gives you more to explore than "I will draw portraits."')}`,
        check: { q: 'Which section of the AP Art and Design portfolio is worth more?', choices: ['Selected Works', 'Sustained Investigation', 'They are equal', 'The written exam'], answer: 1, why: 'The Sustained Investigation is 60% of the score; Selected Works is 40%.' },
      },
      {
        id: 'investigation',
        title: 'Building a sustained investigation',
        mins: 6,
        body: `
<ol>
  <li><b>Start with a question</b> you actually care about.</li>
  <li><b>Practice, experiment, revise:</b> show sketches, failed attempts, and changes in direction. Growth is part of the score.</li>
  <li><b>Document as you go:</b> photograph work in progress, and keep notes on what you tried and why.</li>
  <li><b>Connect the works:</b> each piece should build on what you learned from the last.</li>
</ol>
${rule('Graders look for a clear relationship between your inquiry, your making, and your revisions. Show the thinking, not just the finished pieces.')}`,
        check: { q: 'What do graders want to see in a Sustained Investigation?', choices: ['Only finished, polished works', 'Practice, experimentation, and revision guided by an inquiry', 'Works in as many styles as possible', 'Copies of famous artworks'], answer: 1, why: 'The Sustained Investigation rewards visible growth through practice, experimentation, and revision tied to your question.' },
      },
    ],
  },
];

export const AP_LANGUAGE_COURSES = [
  {
    id: 'ap-world-languages',
    subject: 'World Languages',
    ap: true,
    icon: 'globe',
    title: 'AP World Languages: Exam Skills',
    blurb: 'Strategies for AP Spanish, French, German, Italian, Chinese, and Japanese: reading and listening, the email reply, the argumentative essay, conversation, and cultural comparison.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'format',
        title: 'The exam format and the six themes',
        mins: 6,
        body: `
<p>AP Spanish, French, German, and Italian Language and Culture share a format:</p>
${table(['Section', 'Tasks', 'Weight'], [
  ['Multiple choice', 'Reading print texts, then audio and combined print-and-audio sources', '50%'],
  ['Free response: writing', 'Email reply (15 min) and argumentative essay using 3 sources (about 55 min)', '25%'],
  ['Free response: speaking', 'Simulated conversation (5 turns, 20 seconds each) and a 2-minute cultural comparison', '25%'],
])}
<p>All the courses are built around six themes: <b>families and communities, personal and public identities, beauty and aesthetics, science and technology, contemporary life,</b> and <b>global challenges</b>.</p>
${tip('AP Chinese and Japanese use a different, computer-based format (including story narration and text chat), and AP Latin focuses on translating Vergil and Caesar. AP Spanish Literature reads a required list of works. Check the College Board page for your exact exam.')}`,
        check: { q: 'In the simulated conversation task, how long do you have for each response?', choices: ['5 seconds', '20 seconds', '2 minutes', '15 minutes'], answer: 1, why: 'You get 20 seconds to respond to each of the five turns in the conversation.' },
      },
      {
        id: 'interpretive',
        title: 'Reading and listening',
        mins: 6,
        body: `
<ul>
  <li><b>Preview the questions</b> before reading or listening, so you know what to look for.</li>
  <li><b>Use the introduction:</b> each source has a short intro telling you its topic and origin.</li>
  <li><b>Listen for structure:</b> the main idea, examples, and the speaker's attitude. Take quick notes during the first listen.</li>
  <li><b>Use cognates and context</b> for unfamiliar words; don't panic about one word.</li>
</ul>
${rule('Build the skill daily: podcasts, news, and videos in the language, even 10 minutes a day, add up fast.')}`,
        check: { q: 'What should you do before an audio source plays?', choices: ['Nothing', 'Read the introduction and preview the questions', 'Write your essay', 'Guess every answer'], answer: 1, why: 'Previewing tells you what to listen for, so you catch the key details the first time.' },
      },
      {
        id: 'writing',
        title: 'The email reply and argumentative essay',
        mins: 7,
        body: `
<h3>Email reply</h3>
<ul>
  <li>Use the <b>formal register</b> (usted, vous, Sie, Lei), a greeting, and a closing.</li>
  <li>Answer <b>every question</b> asked, and ask for more detail about something mentioned in the email.</li>
</ul>
<h3>Argumentative essay</h3>
<ul>
  <li>Read the two print sources and listen to the audio source (played twice).</li>
  <li>Take a clear position, cite <b>all three</b> sources, and organize with transitions.</li>
  <li>Use a range of tenses and structures (including the subjunctive where it applies) to show control of the language.</li>
</ul>`,
        check: { q: 'In the email reply, what must you include besides answering the questions?', choices: ['A poem', 'A request for more details about something in the email', 'A list of vocabulary', 'An informal greeting'], answer: 1, why: 'The task asks you to request more information, and you should use a formal register throughout.' },
      },
      {
        id: 'speaking',
        title: 'Conversation and cultural comparison',
        mins: 7,
        body: `
<h3>Simulated conversation</h3>
<ul>
  <li>Read the outline of the conversation before it starts; it tells you what each turn requires.</li>
  <li>Speak for the full 20 seconds. Elaborate with a reason or example.</li>
</ul>
<h3>Cultural comparison (2 minutes)</h3>
<ul>
  <li>You get 4 minutes to prepare and 2 minutes to speak on a question about a cultural topic.</li>
  <li>Compare your own community with a community where the language is spoken. Give <b>specific</b> cultural examples, not stereotypes.</li>
  <li>Structure: introduction, the target culture, your community, similarities and differences, conclusion.</li>
</ul>
${tip('Prepare a set of cultural examples in advance for each of the six themes, such as festivals, education systems, environmental programs, and family traditions.')}`,
        check: { q: 'What makes a strong cultural comparison?', choices: ['General statements about everyone in a country', 'Specific examples from both your community and the target culture', 'Only describing your own community', 'Reading a prepared script'], answer: 1, why: 'Specific, accurate examples from both cultures, with a clear comparison, earn the highest scores.' },
      },
    ],
  },
];
