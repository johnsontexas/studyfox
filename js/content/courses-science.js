// Science courses for school: Biology, Chemistry, Physics.
import { rule, tip, worked } from './lesson-kit.js';

export const SCIENCE_COURSES = [
  {
    id: 'biology',
    subject: 'Science',
    icon: 'dna',
    title: 'Biology Essentials',
    blurb: 'Cells, energy, DNA and proteins, genetics, and evolution and ecology: the big ideas every biology class builds on.',
    level: 'Grades 9 to 10',
    lessons: [
      {
        id: 'cells',
        title: 'Cells and organelles',
        mins: 6,
        body: `
<p>All living things are made of cells. <b>Prokaryotic</b> cells (bacteria) have no nucleus. <b>Eukaryotic</b> cells (plants, animals, fungi) have a nucleus and membrane-bound organelles.</p>
<table class="data"><thead><tr><th>Organelle</th><th>Job</th></tr></thead><tbody>
<tr><td>Nucleus</td><td>Holds DNA; controls the cell</td></tr>
<tr><td>Ribosome</td><td>Builds proteins</td></tr>
<tr><td>Mitochondrion</td><td>Cellular respiration: makes ATP (usable energy)</td></tr>
<tr><td>Chloroplast (plants)</td><td>Photosynthesis</td></tr>
<tr><td>Endoplasmic reticulum</td><td>Makes and moves proteins (rough) and lipids (smooth)</td></tr>
<tr><td>Golgi apparatus</td><td>Packages and ships proteins</td></tr>
<tr><td>Cell membrane</td><td>Controls what enters and leaves</td></tr>
<tr><td>Cell wall (plants)</td><td>Rigid support</td></tr>
</tbody></table>
${tip('Learn organelles by function, like a factory: the nucleus is the office, ribosomes are workers, the Golgi is shipping, and mitochondria are the power plant.')}`,
        check: { q: 'Which organelle produces most of a cell\'s ATP?', choices: ['Ribosome', 'Golgi apparatus', 'Mitochondrion', 'Nucleus'], answer: 2, why: 'Mitochondria carry out cellular respiration, which produces most of the cell\'s ATP.' },
      },
      {
        id: 'energy',
        title: 'Photosynthesis and cellular respiration',
        mins: 6,
        body: `
<p>These two processes are mirror images of each other.</p>
${rule('<b>Photosynthesis</b> (chloroplasts): 6CO<sub>2</sub> + 6H<sub>2</sub>O + light energy → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>')}
${rule('<b>Cellular respiration</b> (mitochondria): C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O + ATP')}
<ul>
  <li>Plants do <b>both</b>. Animals only do respiration.</li>
  <li>Photosynthesis stores energy in glucose; respiration releases it as ATP.</li>
  <li>Without oxygen, cells use fermentation, which makes far less ATP.</li>
</ul>`,
        check: { q: 'Which gas is released as a product of photosynthesis?', choices: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Water vapor'], answer: 1, why: 'Photosynthesis takes in CO<sub>2</sub> and water and releases O<sub>2</sub>.' },
      },
      {
        id: 'dna',
        title: 'DNA, RNA, and protein synthesis',
        mins: 7,
        body: `
<p>DNA stores the instructions for building proteins. Its bases pair up: <b>A with T</b> and <b>C with G</b>.</p>
<h3>From DNA to protein</h3>
<ol>
  <li><b>Transcription</b> (in the nucleus): DNA is copied into messenger RNA (mRNA). RNA uses <b>U instead of T</b>, so A pairs with U.</li>
  <li><b>Translation</b> (at a ribosome): the mRNA is read three bases at a time. Each three-base <b>codon</b> codes for an amino acid, and the chain of amino acids folds into a protein.</li>
</ol>
${rule('DNA → RNA → protein. This is called the central dogma of biology.')}
<p>A <b>mutation</b> is a change in the DNA sequence. It can change the protein, sometimes harmlessly and sometimes not.</p>`,
        check: { q: 'A DNA strand reads A-T-G-C. What is the complementary DNA strand?', choices: ['T-A-C-G', 'U-A-C-G', 'A-T-G-C', 'G-C-A-T'], answer: 0, why: 'A pairs with T and C pairs with G, so ATGC pairs with TACG. (U appears only in RNA.)' },
      },
      {
        id: 'genetics',
        title: 'Genetics and Punnett squares',
        mins: 7,
        body: `
<ul>
  <li><b>Alleles</b> are versions of a gene. You inherit one from each parent.</li>
  <li><b>Genotype</b> is the allele pair (like Aa). <b>Phenotype</b> is the trait you see.</li>
  <li>A <b>dominant</b> allele (A) shows up whenever it's present. A <b>recessive</b> allele (a) shows only in aa.</li>
  <li><b>Homozygous</b>: AA or aa. <b>Heterozygous</b>: Aa.</li>
</ul>
${worked('Example: Aa × Aa', `<table class="data"><thead><tr><th></th><th>A</th><th>a</th></tr></thead><tbody><tr><th>A</th><td>AA</td><td>Aa</td></tr><tr><th>a</th><td>Aa</td><td>aa</td></tr></tbody></table><p>Genotype ratio 1 AA : 2 Aa : 1 aa. Phenotype ratio 3 dominant : 1 recessive.</p>`)}`,
        check: { q: 'Two Aa parents have a child. What is the probability the child is aa?', choices: ['$0\\%$', '$25\\%$', '$50\\%$', '$75\\%$'], answer: 1, why: 'One of the four boxes in the Punnett square is aa, so the probability is $\\frac{1}{4} = 25\\%$.' },
      },
      {
        id: 'evolution-ecology',
        title: 'Evolution and ecology',
        mins: 6,
        body: `
<h3>Natural selection</h3>
<ol>
  <li>Individuals in a population <b>vary</b>.</li>
  <li>Some variation is <b>inherited</b>.</li>
  <li>More offspring are born than can survive.</li>
  <li>Individuals with helpful traits <b>survive and reproduce more</b>, so those traits become more common over generations.</li>
</ol>
${rule('Populations evolve, not individuals. An individual can\'t change its genes to adapt.')}
<h3>Energy in ecosystems</h3>
<p>Energy flows from producers (plants) to primary consumers (herbivores) to secondary consumers. Only about <b>10%</b> of the energy passes to each next level; the rest is used for life processes or lost as heat.</p>`,
        check: { q: 'Producers in an ecosystem store 10,000 kcal of energy. About how much reaches the primary consumers?', choices: ['10 kcal', '100 kcal', '1,000 kcal', '10,000 kcal'], answer: 2, why: 'About 10% passes to each level: 10% of 10,000 is 1,000 kcal.' },
      },
    ],
  },

  {
    id: 'chemistry',
    subject: 'Science',
    icon: 'flask',
    title: 'Chemistry Essentials',
    blurb: 'Atoms and the periodic table, bonding, balancing equations, moles and stoichiometry, and acids and bases.',
    level: 'Grades 10 to 11',
    lessons: [
      {
        id: 'atoms',
        title: 'Atoms and the periodic table',
        mins: 6,
        body: `
<ul>
  <li><b>Protons</b> (+) and <b>neutrons</b> (no charge) are in the nucleus. <b>Electrons</b> (−) surround it.</li>
  <li><b>Atomic number</b> = number of protons. It defines the element.</li>
  <li><b>Mass number</b> = protons + neutrons. <b>Isotopes</b> have the same protons but different neutrons.</li>
  <li>A neutral atom has equal protons and electrons. <b>Ions</b> have gained or lost electrons.</li>
</ul>
<h3>Reading the periodic table</h3>
<p>Columns are <b>groups</b>: elements in a group have the same number of valence electrons and similar behavior. Rows are <b>periods</b>.</p>
${rule('Trends: atomic radius gets <b>bigger down</b> a group and <b>smaller across</b> a period. Electronegativity is the opposite: highest at the top right (fluorine).')}`,
        check: { q: 'Carbon-14 has atomic number 6. How many neutrons does it have?', choices: ['$6$', '$8$', '$14$', '$20$'], answer: 1, why: 'Neutrons = mass number − protons = 14 − 6 = 8.' },
      },
      {
        id: 'bonding',
        title: 'Chemical bonding and formulas',
        mins: 6,
        body: `
<ul>
  <li><b>Ionic bonds:</b> a metal gives electrons to a nonmetal, forming oppositely charged ions (like NaCl).</li>
  <li><b>Covalent bonds:</b> nonmetals share electrons (like H<sub>2</sub>O).</li>
  <li><b>Metallic bonds:</b> metal atoms share a "sea" of electrons, which is why metals conduct electricity.</li>
</ul>
<h3>Writing ionic formulas</h3>
${rule('The total charge must be zero. Use the <b>criss-cross</b> method: each ion\'s charge becomes the other ion\'s subscript, then reduce.')}
${worked('Examples', `<p>Mg<sup>2+</sup> and Cl<sup>−</sup> → MgCl<sub>2</sub>. Al<sup>3+</sup> and O<sup>2−</sup> → Al<sub>2</sub>O<sub>3</sub>.</p>`)}`,
        check: { q: 'What is the formula for the compound of Ca<sup>2+</sup> and Cl<sup>−</sup>?', choices: ['CaCl', 'CaCl<sub>2</sub>', 'Ca<sub>2</sub>Cl', 'Ca<sub>2</sub>Cl<sub>2</sub>'], answer: 1, why: 'Two Cl<sup>−</sup> ions (total −2) balance one Ca<sup>2+</sup>, giving CaCl<sub>2</sub>.' },
      },
      {
        id: 'balancing',
        title: 'Balancing chemical equations',
        mins: 6,
        body: `
${rule('Atoms are never created or destroyed, so each element must have the same number of atoms on both sides. Change only the <b>coefficients</b> (numbers in front), never the subscripts.')}
${worked('Example', `<p>CH<sub>4</sub> + O<sub>2</sub> → CO<sub>2</sub> + H<sub>2</sub>O</p><ol><li>Carbon: 1 on each side. Good.</li><li>Hydrogen: 4 on the left, so put a 2 in front of H<sub>2</sub>O.</li><li>Oxygen: now 2 + 2 = 4 on the right, so put a 2 in front of O<sub>2</sub>.</li></ol><p>Balanced: CH<sub>4</sub> + 2O<sub>2</sub> → CO<sub>2</sub> + 2H<sub>2</sub>O</p>`)}
${tip('Balance elements that appear in only one compound on each side first, and leave H and O (or any lone element) for last.')}`,
        check: { q: 'Balance: __H<sub>2</sub> + __O<sub>2</sub> → __H<sub>2</sub>O', choices: ['1, 1, 1', '2, 1, 2', '1, 2, 2', '2, 2, 2'], answer: 1, why: '2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O has 4 H and 2 O on each side.' },
      },
      {
        id: 'moles',
        title: 'Moles and stoichiometry',
        mins: 7,
        body: `
<p>A <b>mole</b> is a counting unit: $6.022 \\times 10^{23}$ particles. The <b>molar mass</b> (grams per mole) is the sum of the atomic masses in the formula.</p>
${worked('Molar mass of H<sub>2</sub>O', `<p>$2(1) + 16 = 18$ g/mol, so 36 g of water is $36 \\div 18 = 2$ moles.</p>`)}
<h3>Stoichiometry roadmap</h3>
${rule('grams of A → moles of A → (use the coefficients) → moles of B → grams of B')}
<p>The coefficients in a balanced equation are mole ratios. In 2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O, 2 moles of H<sub>2</sub> make 2 moles of water.</p>`,
        check: { q: 'How many moles are in 88 g of CO<sub>2</sub> (molar mass 44 g/mol)?', choices: ['$0.5$', '$2$', '$44$', '$3872$'], answer: 1, why: '$88 \\div 44 = 2$ moles.' },
      },
      {
        id: 'acids-bases',
        title: 'Acids, bases, and pH',
        mins: 5,
        body: `
<ul>
  <li><b>Acids</b> release H<sup>+</sup> ions in water. <b>Bases</b> release OH<sup>−</sup> or accept H<sup>+</sup>.</li>
  <li>pH below 7 is acidic, 7 is neutral, above 7 is basic.</li>
  <li>$\\text{pH} = -\\log[\\text{H}^+]$</li>
</ul>
${rule('pH is a log scale: each step of 1 is a <b>10 times</b> change in H<sup>+</sup> concentration.')}
<p>Acid + base → salt + water. This is called <b>neutralization</b>.</p>`,
        check: { q: 'How much more acidic is a solution with pH 3 than one with pH 5?', choices: ['2 times', '20 times', '100 times', '1,000 times'], answer: 2, why: 'Two pH steps, each a factor of 10: $10 \\times 10 = 100$.' },
      },
    ],
  },

  {
    id: 'physics',
    subject: 'Science',
    icon: 'bolt',
    title: 'Physics Essentials',
    blurb: 'Motion, forces, energy, momentum, and circuits and waves, with the equations and problem-solving steps that work.',
    level: 'Grades 11 to 12',
    lessons: [
      {
        id: 'motion',
        title: 'Motion and kinematics',
        mins: 7,
        body: `
<ul>
  <li><b>Velocity</b> is speed with a direction. <b>Acceleration</b> is how fast velocity changes.</li>
  <li>Near Earth, falling objects accelerate at $g \\approx 9.8\\text{ m/s}^2$ (ignoring air resistance).</li>
</ul>
<h3>Kinematics equations (constant acceleration)</h3>
<ul>
  <li>$v = v_0 + at$</li>
  <li>$\\Delta x = v_0 t + \\frac{1}{2}at^2$</li>
  <li>$v^2 = v_0^2 + 2a\\Delta x$</li>
</ul>
${rule('Problem steps: list what you know ($v_0$, $v$, $a$, $t$, $\\Delta x$), circle what you need, and pick the equation that uses only those.')}
${worked('Example', `<p>A car starts from rest and accelerates at $3\\text{ m/s}^2$ for 4 s. Speed: $v = 0 + 3(4) = 12$ m/s. Distance: $\\frac{1}{2}(3)(4^2) = 24$ m.</p>`)}`,
        check: { q: 'A ball is dropped from rest. Ignoring air resistance, how fast is it moving after 2 seconds?', choices: ['$4.9$ m/s', '$9.8$ m/s', '$19.6$ m/s', '$39.2$ m/s'], answer: 2, why: '$v = v_0 + at = 0 + 9.8(2) = 19.6$ m/s.' },
      },
      {
        id: 'forces',
        title: 'Forces and Newton\'s laws',
        mins: 7,
        body: `
<ol>
  <li><b>First law:</b> an object keeps its velocity unless a net force acts on it (inertia).</li>
  <li><b>Second law:</b> $F_{\\text{net}} = ma$.</li>
  <li><b>Third law:</b> forces come in equal and opposite pairs acting on <b>different</b> objects.</li>
</ol>
<p><b>Weight</b> is $W = mg$. Mass (kg) doesn't change with location; weight (N) does.</p>
${rule('Always draw a free-body diagram: one dot for the object, an arrow for each force. Then add forces in each direction to get the net force.')}`,
        check: { q: 'A net force of 20 N acts on a 4 kg box. What is its acceleration?', choices: ['$5\\text{ m/s}^2$', '$16\\text{ m/s}^2$', '$24\\text{ m/s}^2$', '$80\\text{ m/s}^2$'], answer: 0, why: '$a = \\frac{F}{m} = \\frac{20}{4} = 5\\text{ m/s}^2$.' },
      },
      {
        id: 'energy',
        title: 'Work and energy',
        mins: 7,
        body: `
<ul>
  <li><b>Kinetic energy:</b> $KE = \\frac{1}{2}mv^2$</li>
  <li><b>Gravitational potential energy:</b> $PE = mgh$</li>
  <li><b>Work:</b> $W = Fd\\cos\\theta$, the energy transferred by a force</li>
  <li><b>Power:</b> $P = \\frac{W}{t}$, measured in watts</li>
</ul>
${rule('Conservation of energy: without friction, $KE + PE$ stays constant. Energy changes form but the total doesn\'t change.')}
${worked('Example', `<p>An object falls from 5 m. All the $PE$ becomes $KE$: $mgh = \\frac{1}{2}mv^2$, so $v = \\sqrt{2gh} = \\sqrt{98} \\approx 9.9$ m/s. The mass cancels.</p>`)}`,
        check: { q: 'What is the kinetic energy of a 2 kg ball moving at 3 m/s?', choices: ['$3$ J', '$6$ J', '$9$ J', '$18$ J'], answer: 2, why: '$KE = \\frac{1}{2}(2)(3^2) = 9$ J.' },
      },
      {
        id: 'momentum',
        title: 'Momentum and collisions',
        mins: 6,
        body: `
<ul>
  <li><b>Momentum:</b> $p = mv$</li>
  <li><b>Impulse:</b> $F\\Delta t = \\Delta p$. This is why airbags work: a longer stopping time means a smaller force.</li>
</ul>
${rule('In any collision with no outside force, total momentum before equals total momentum after.')}
<p>In an <b>elastic</b> collision, kinetic energy is also conserved. In an <b>inelastic</b> collision (objects stick together, for example), some kinetic energy is lost.</p>`,
        check: { q: 'A 2 kg cart at 3 m/s hits a 1 kg cart at rest, and they stick together. What is their speed afterward?', choices: ['$1$ m/s', '$1.5$ m/s', '$2$ m/s', '$3$ m/s'], answer: 2, why: 'Momentum before: $2(3) = 6$. After: $(2 + 1)v = 6$, so $v = 2$ m/s.' },
      },
      {
        id: 'circuits-waves',
        title: 'Circuits and waves',
        mins: 6,
        body: `
<h3>Circuits</h3>
<ul>
  <li><b>Ohm's law:</b> $V = IR$ (voltage = current × resistance)</li>
  <li><b>Power:</b> $P = IV$</li>
  <li>Resistors in <b>series</b> add: $R = R_1 + R_2$. In <b>parallel</b>: $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$.</li>
</ul>
<h3>Waves</h3>
${rule('Wave speed = frequency × wavelength: $v = f\\lambda$')}
<p>Frequency is measured in hertz (cycles per second). For a given wave speed, higher frequency means shorter wavelength.</p>`,
        check: { q: 'A 12 V battery is connected to a 4 Ω resistor. What current flows?', choices: ['$3$ A', '$8$ A', '$16$ A', '$48$ A'], answer: 0, why: '$I = \\frac{V}{R} = \\frac{12}{4} = 3$ A.' },
      },
    ],
  },
];
