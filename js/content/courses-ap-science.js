// AP science courses: Biology, Chemistry, Environmental Science, and the four Physics courses.
import { rule, tip, worked } from './lesson-kit.js';

export const AP_SCIENCE_COURSES = [
  {
    id: 'ap-bio',
    subject: 'Science',
    ap: true,
    icon: 'dna',
    title: 'AP Biology',
    blurb: 'All eight units: biochemistry, cells, energy, cell signaling, heredity, gene expression, evolution, and ecology, plus the math and FRQ skills the exam expects.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: Chemistry of Life',
        mins: 8,
        body: `
<p>The exam: 60 multiple-choice questions (90 min, 50%) and 6 free-response questions (90 min, 50%): 2 long and 4 short. A four-function or scientific calculator and a formula sheet are allowed.</p>
<ul>
  <li><b>Water:</b> polar, with hydrogen bonds that give it cohesion, adhesion, high specific heat, and the ability to dissolve polar substances.</li>
  <li><b>Macromolecules</b> are built by <b>dehydration synthesis</b> and broken by <b>hydrolysis</b>:
    <ul>
      <li><b>Carbohydrates</b> (C, H, O): monosaccharides, glycosidic linkages. Energy and structure (cellulose).</li>
      <li><b>Lipids:</b> nonpolar. Phospholipids have hydrophilic heads and hydrophobic tails. Saturated (no double bonds) vs. unsaturated.</li>
      <li><b>Proteins</b> (C, H, O, N, S): amino acids joined by peptide bonds. Primary, secondary (hydrogen bonds in the backbone), tertiary (R-group interactions), and quaternary structure. Shape determines function.</li>
      <li><b>Nucleic acids</b> (C, H, O, N, P): nucleotides. DNA has deoxyribose and thymine; RNA has ribose and uracil. Strands are antiparallel (5' to 3').</li>
    </ul>
  </li>
</ul>
${rule('Structure determines function. If a question changes a molecule\'s shape (like a mutation that changes an R group), predict how its function changes.')}`,
        check: { q: 'Which level of protein structure is determined by interactions between R groups?', choices: ['Primary', 'Secondary', 'Tertiary', 'None; R groups don\'t interact'], answer: 2, why: 'Tertiary structure comes from R-group interactions: hydrophobic interactions, ionic bonds, hydrogen bonds, and disulfide bridges.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Cell Structure and Function',
        mins: 8,
        body: `
<ul>
  <li><b>Organelles:</b> ribosomes (protein synthesis), rough ER (proteins for export), smooth ER (lipids, detox), Golgi (modifies and ships proteins), lysosomes (digestion), mitochondria (cellular respiration), chloroplasts (photosynthesis), and the vacuole.</li>
  <li><b>Endosymbiotic theory:</b> mitochondria and chloroplasts were once free-living prokaryotes. Evidence: double membranes, their own circular DNA, and their own ribosomes.</li>
  <li><b>Surface area to volume ratio:</b> as a cell grows, volume increases faster than surface area, limiting exchange. That's why cells are small.</li>
  <li><b>The membrane:</b> the fluid mosaic model, selectively permeable. Small nonpolar molecules diffuse through; ions and large polar molecules need proteins.</li>
  <li><b>Transport:</b> passive (diffusion, facilitated diffusion, osmosis) needs no energy. Active transport (like the sodium-potassium pump) uses ATP to move against a gradient. Endocytosis and exocytosis move bulk material.</li>
  <li><b>Tonicity:</b> in a hypotonic solution water enters the cell; in a hypertonic one water leaves. <b>Water potential:</b> water moves from higher to lower water potential.</li>
</ul>`,
        check: { q: 'A cell is placed in a hypertonic solution. What happens?', choices: ['Water moves into the cell and it swells', 'Water moves out of the cell and it shrinks', 'Nothing changes', 'Solutes move into the cell by active transport'], answer: 1, why: 'The outside has more solute (lower water potential), so water leaves the cell by osmosis.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Cellular Energetics',
        mins: 9,
        body: `
<ul>
  <li><b>Enzymes</b> lower activation energy. The substrate fits the active site. Temperature and pH changes can <b>denature</b> enzymes. Competitive inhibitors block the active site; noncompetitive inhibitors bind elsewhere and change the shape.</li>
  <li><b>Photosynthesis</b> (in chloroplasts):
    <ul>
      <li><b>Light reactions</b> (thylakoid membrane): light splits water, releasing oxygen. The electron transport chain pumps H⁺ into the thylakoid; ATP synthase makes ATP. NADPH is made.</li>
      <li><b>Calvin cycle</b> (stroma): uses ATP and NADPH to fix CO₂ into sugar.</li>
    </ul>
  </li>
  <li><b>Cellular respiration:</b>
    <ul>
      <li><b>Glycolysis</b> (cytoplasm): glucose to 2 pyruvate, net 2 ATP.</li>
      <li><b>Krebs cycle</b> (mitochondrial matrix): makes NADH, FADH₂, and CO₂.</li>
      <li><b>Oxidative phosphorylation</b> (inner membrane): the electron transport chain pumps H⁺; ATP synthase uses the gradient to make most of the ATP. <b>Oxygen</b> is the final electron acceptor, forming water.</li>
    </ul>
  </li>
  <li>Without oxygen, <b>fermentation</b> regenerates NAD⁺ so glycolysis can continue.</li>
</ul>
${rule('Chemiosmosis is the same idea in both organelles: an electron transport chain builds an H⁺ gradient, and ATP synthase uses it to make ATP.')}`,
        check: { q: 'What is the final electron acceptor in aerobic cellular respiration?', choices: ['NAD⁺', 'Oxygen', 'Glucose', 'Carbon dioxide'], answer: 1, why: 'Oxygen accepts electrons at the end of the electron transport chain and combines with H⁺ to form water.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Cell Communication and the Cell Cycle',
        mins: 8,
        body: `
<ul>
  <li><b>Signal transduction:</b> a ligand binds a receptor (reception), a cascade of reactions amplifies the signal (transduction, often with second messengers like cAMP and phosphorylation by kinases), and the cell responds (like turning on genes).</li>
  <li>Receptor types: G protein-coupled receptors and receptor tyrosine kinases on the membrane; intracellular receptors for nonpolar signals like steroid hormones.</li>
  <li><b>Feedback:</b> negative feedback keeps homeostasis (blood sugar regulation by insulin and glucagon); positive feedback amplifies (contractions during childbirth).</li>
  <li><b>The cell cycle:</b> interphase (G₁, S where DNA replicates, G₂) and mitosis (prophase, metaphase, anaphase, telophase), then cytokinesis.</li>
  <li><b>Checkpoints</b> controlled by cyclins and cyclin-dependent kinases (CDKs). <b>Cancer</b> results from mutations that disrupt cell cycle control (oncogenes, tumor suppressors like p53).</li>
</ul>`,
        check: { q: 'During which phase is DNA replicated?', choices: ['G₁', 'S phase', 'Metaphase', 'Anaphase'], answer: 1, why: 'DNA is copied during the S (synthesis) phase of interphase, before mitosis begins.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Heredity',
        mins: 9,
        body: `
<ul>
  <li><b>Meiosis</b> makes four haploid gametes. Genetic variation comes from <b>crossing over</b> (prophase I), <b>independent assortment</b> (metaphase I), and random fertilization.</li>
  <li><b>Mendel's laws:</b> segregation and independent assortment.</li>
  <li><b>Probability rules:</b> multiply for "and" (independent events), add for "or" (mutually exclusive events).</li>
  <li><b>Non-Mendelian inheritance:</b> incomplete dominance, codominance (AB blood type), sex-linked traits (on the X chromosome, so more common in males), linked genes, polygenic traits, and mitochondrial inheritance (from the mother).</li>
  <li><b>Chi-square test:</b> compares observed and expected results. If χ² is greater than the critical value, reject the null hypothesis.</li>
</ul>
${worked('Probability', '<p>For a cross AaBb × AaBb, the chance of an aabb offspring is (1/4)(1/4) = 1/16.</p>')}
${worked('Chi-square', '<p>$\\chi^2 = \\sum \\frac{(o - e)^2}{e}$. Degrees of freedom = number of categories minus 1. With df = 1 and p = 0.05, the critical value is 3.84.</p>')}`,
        check: { q: 'A woman who carries an X-linked recessive allele has a son with an unaffected father. What is the chance the son has the trait?', choices: ['0%', '25%', '50%', '100%'], answer: 2, why: 'The son gets his only X from his mother, who has one affected X out of two, so the chance is 1/2.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Gene Expression and Regulation',
        mins: 9,
        body: `
<ul>
  <li><b>DNA replication</b> is semiconservative. Helicase unwinds, DNA polymerase adds nucleotides 5' to 3', the leading strand is continuous, the lagging strand forms Okazaki fragments, and ligase joins them.</li>
  <li><b>Transcription</b> (nucleus): RNA polymerase makes mRNA. In eukaryotes, mRNA gets a 5' cap, a poly-A tail, and introns are spliced out. <b>Alternative splicing</b> lets one gene make several proteins.</li>
  <li><b>Translation</b> (ribosome): codons are read in sets of three; tRNA anticodons bring amino acids.</li>
  <li><b>Gene regulation:</b> prokaryotic operons (the <i>lac</i> operon is inducible; the <i>trp</i> operon is repressible). Eukaryotes use transcription factors, enhancers, and epigenetic changes (DNA methylation, histone acetylation).</li>
  <li><b>Mutations:</b> substitutions (silent, missense, nonsense) and frameshifts (insertions or deletions, usually more harmful).</li>
  <li><b>Biotechnology:</b> PCR (copies DNA), gel electrophoresis (smaller fragments move farther), and bacterial transformation.</li>
</ul>`,
        check: { q: 'In gel electrophoresis, which DNA fragments travel farthest?', choices: ['The largest', 'The smallest', 'The ones with the most adenine', 'All travel the same distance'], answer: 1, why: 'Smaller fragments slip through the gel more easily, so they travel farther toward the positive end.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Natural Selection',
        mins: 8,
        body: `
<ul>
  <li><b>Natural selection:</b> variation exists, it is heritable, more offspring are produced than survive, and individuals with favorable traits reproduce more. Populations evolve, not individuals.</li>
  <li><b>Other mechanisms:</b> genetic drift (random, strongest in small populations: the bottleneck and founder effects), gene flow, mutation, and nonrandom mating.</li>
  <li><b>Hardy-Weinberg equilibrium:</b> $p + q = 1$ and $p^2 + 2pq + q^2 = 1$. It holds only with no selection, no mutation, no migration, random mating, and a large population.</li>
  <li><b>Evidence for evolution:</b> fossils, homologous structures, DNA and protein comparisons, and biogeography.</li>
  <li><b>Phylogenetic trees</b> show common ancestry. Branch points are common ancestors.</li>
  <li><b>Speciation:</b> allopatric (geographic separation) and sympatric. Prezygotic barriers (habitat, timing, behavior) and postzygotic barriers (hybrid sterility).</li>
</ul>
${worked('Hardy-Weinberg', '<p>16% of a population shows a recessive trait, so $q^2 = 0.16$ and $q = 0.4$. Then $p = 0.6$, and heterozygous carriers are $2pq = 0.48$, or 48%.</p>')}`,
        check: { q: 'If 9% of a population is homozygous recessive, what fraction is heterozygous?', choices: ['0.09', '0.21', '0.42', '0.49'], answer: 2, why: '$q^2 = 0.09$, so $q = 0.3$ and $p = 0.7$. Then $2pq = 2(0.7)(0.3) = 0.42$.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: Ecology',
        mins: 8,
        body: `
<ul>
  <li><b>Behavior:</b> organisms respond to their environment (taxis, kinesis) and communicate.</li>
  <li><b>Energy flow:</b> only about 10% of energy passes to the next trophic level. Gross vs. net primary productivity.</li>
  <li><b>Population growth:</b> exponential, $\\frac{dN}{dt} = r_{max}N$, vs. logistic, $\\frac{dN}{dt} = r_{max}N\\frac{K - N}{K}$, which levels off at carrying capacity K.</li>
  <li><b>Communities:</b> species interactions (competition, predation, mutualism, commensalism, parasitism), keystone species, and the Simpson diversity index.</li>
  <li><b>Biodiversity</b> makes ecosystems more resilient. Disruptions include invasive species, habitat loss, and climate change.</li>
  <li><b>Cycles:</b> carbon, nitrogen (nitrogen fixation by bacteria), phosphorus (no atmospheric phase), and water.</li>
</ul>`,
        check: { q: 'In logistic growth, what happens to the growth rate as N approaches K?', choices: ['It increases', 'It approaches zero', 'It becomes negative immediately', 'It stays constant'], answer: 1, why: 'The factor (K − N)/K approaches 0 as N nears K, so growth slows and levels off.' },
      },
    ],
  },

  {
    id: 'ap-chem',
    subject: 'Science',
    ap: true,
    icon: 'flask',
    title: 'AP Chemistry',
    blurb: 'Atomic structure, bonding, intermolecular forces, reactions, kinetics, thermochemistry, equilibrium, acids and bases, and electrochemistry, with worked calculations.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: Atomic Structure and Properties',
        mins: 8,
        body: `
<p>The exam: 60 multiple-choice questions (90 min, 50%) and 7 free-response questions (105 min, 50%): 3 long and 4 short. A calculator, periodic table, and formula sheet are allowed.</p>
<ul>
  <li><b>The mole:</b> $6.022 \\times 10^{23}$ particles. Moles = mass ÷ molar mass.</li>
  <li><b>Mass spectra</b> show isotopes and their relative abundance; the average atomic mass is a weighted average.</li>
  <li><b>Electron configuration:</b> 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰... <b>Photoelectron spectroscopy (PES)</b> shows energy needed to remove electrons from each subshell; peak height is the number of electrons.</li>
  <li><b>Coulomb's law</b> explains periodic trends: the force increases with charge and decreases with distance.</li>
  <li><b>Trends:</b> atomic radius decreases across a period (more protons, same shell) and increases down a group (more shells). Ionization energy and electronegativity do the opposite.</li>
</ul>`,
        check: { q: 'Why does atomic radius decrease from left to right across a period?', choices: ['Electrons are added to new shells', 'Increasing nuclear charge pulls electrons in the same shell closer', 'Atoms lose neutrons', 'Shielding increases greatly'], answer: 1, why: 'Protons are added while electrons go into the same shell, so the stronger effective nuclear charge pulls them closer.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Compound Structure and Properties',
        mins: 8,
        body: `
<ul>
  <li><b>Bond types:</b> ionic (metal and nonmetal, transfer), covalent (nonmetals, sharing; polar if electronegativities differ), and metallic (a sea of delocalized electrons).</li>
  <li><b>Lattice energy</b> is higher for ions with larger charges and smaller radii (Coulomb's law).</li>
  <li><b>Lewis structures:</b> use formal charge to choose the best structure. Resonance structures show delocalized electrons.</li>
  <li><b>VSEPR:</b> electron domains repel. Linear (2), trigonal planar (3), tetrahedral (4, 109.5°), trigonal bipyramidal (5), octahedral (6). Lone pairs compress bond angles (water is bent at about 104.5°).</li>
  <li><b>Hybridization:</b> sp (2 domains), sp² (3), sp³ (4). Sigma bonds are single bonds; a double bond is one sigma and one pi.</li>
</ul>`,
        check: { q: 'What is the molecular geometry of NH₃?', choices: ['Trigonal planar', 'Trigonal pyramidal', 'Tetrahedral', 'Bent'], answer: 1, why: 'Nitrogen has four electron domains (three bonds and one lone pair), so the shape is trigonal pyramidal.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Intermolecular Forces and Properties',
        mins: 9,
        body: `
<ul>
  <li><b>Intermolecular forces</b> (from weakest to strongest, generally): London dispersion (all molecules, stronger with more electrons), dipole-dipole (polar molecules), and hydrogen bonding (H bonded to N, O, or F).</li>
  <li>Stronger IMFs mean higher boiling points and lower vapor pressure.</li>
  <li><b>Ideal gas law:</b> $PV = nRT$. Real gases deviate at high pressure and low temperature.</li>
  <li><b>Kinetic molecular theory:</b> average kinetic energy is proportional to temperature (Kelvin).</li>
  <li><b>Solutions:</b> "like dissolves like." Molarity $M = \\frac{\\text{mol solute}}{\\text{L solution}}$. Separation methods include chromatography and distillation.</li>
  <li><b>Beer-Lambert law:</b> $A = \\varepsilon b c$; absorbance is proportional to concentration.</li>
</ul>
${worked('Ideal gas law', '<p>How many moles are in 2.0 L of gas at 1.0 atm and 300 K? $n = \\frac{PV}{RT} = \\frac{(1.0)(2.0)}{(0.0821)(300)} \\approx 0.081$ mol.</p>')}`,
        check: { q: 'Which has the highest boiling point?', choices: ['CH₄', 'H₂O', 'H₂S', 'Ne'], answer: 1, why: 'Water forms hydrogen bonds, much stronger than the dispersion and dipole forces in the others.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Chemical Reactions',
        mins: 8,
        body: `
<ul>
  <li><b>Physical vs. chemical changes:</b> chemical changes make new substances (bonds break and form).</li>
  <li><b>Net ionic equations:</b> write only the species that react; remove spectator ions.</li>
  <li><b>Stoichiometry:</b> grams to moles (÷ molar mass), moles to moles (mole ratio from the balanced equation), moles to grams. The <b>limiting reactant</b> runs out first.</li>
  <li><b>Titration:</b> at the equivalence point, moles of acid equal moles of base (for a 1:1 reaction).</li>
  <li><b>Reaction types:</b> acid-base (proton transfer), redox (electron transfer; oxidation is loss, reduction is gain), and precipitation.</li>
</ul>
${worked('Limiting reactant', '<p>2H₂ + O₂ → 2H₂O. With 4 mol H₂ and 3 mol O₂: 4 mol H₂ needs only 2 mol O₂, so H₂ is limiting and forms 4 mol H₂O. 1 mol O₂ is left over.</p>')}`,
        check: { q: 'In the reaction Zn + Cu²⁺ → Zn²⁺ + Cu, which species is oxidized?', choices: ['Zn', 'Cu²⁺', 'Zn²⁺', 'Cu'], answer: 0, why: 'Zinc loses two electrons, going from 0 to +2. Loss of electrons is oxidation.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Kinetics',
        mins: 8,
        body: `
<ul>
  <li><b>Rate law:</b> rate = k[A]ᵐ[B]ⁿ. Orders come from experiments, not from coefficients (unless it's an elementary step).</li>
  <li>Find the order by comparing trials: if doubling [A] doubles the rate, it's first order; if it quadruples, second order; no change means zero order.</li>
  <li><b>Integrated rate laws:</b> zero order gives a linear [A] vs. t; first order gives a linear ln[A] vs. t; second order gives a linear 1/[A] vs. t.</li>
  <li><b>Half-life</b> of a first-order reaction is constant: $t_{1/2} = \\frac{0.693}{k}$.</li>
  <li><b>Collision theory:</b> particles must collide with enough energy and correct orientation.</li>
  <li><b>Mechanisms:</b> the slowest step determines the rate. Intermediates are made and then used; catalysts are used and then regenerated, and they lower activation energy.</li>
</ul>`,
        check: { q: 'When [A] is doubled, the rate quadruples. What is the order with respect to A?', choices: ['Zero', 'First', 'Second', 'Third'], answer: 2, why: '2ⁿ = 4 means n = 2, so the reaction is second order in A.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Thermochemistry',
        mins: 8,
        body: `
<ul>
  <li><b>Exothermic</b> reactions release heat (ΔH negative); <b>endothermic</b> reactions absorb heat (ΔH positive).</li>
  <li><b>Calorimetry:</b> $q = mc\\Delta T$. Heat lost by one substance equals heat gained by the other.</li>
  <li><b>Bond enthalpies:</b> ΔH = bonds broken − bonds formed. Breaking bonds takes energy; forming bonds releases it.</li>
  <li><b>Enthalpy of formation:</b> ΔH°rxn = ΣΔH°f(products) − ΣΔH°f(reactants).</li>
  <li><b>Hess's law:</b> add reactions to get the target reaction; reverse a reaction to flip the sign of ΔH; multiply it to scale ΔH.</li>
</ul>
${worked('Calorimetry', '<p>Heat 50.0 g of water from 20.0°C to 30.0°C: $q = (50.0)(4.18)(10.0) = 2090$ J.</p>')}`,
        check: { q: 'If a reaction is reversed, what happens to ΔH?', choices: ['It stays the same', 'Its sign flips', 'It doubles', 'It becomes zero'], answer: 1, why: 'The reverse reaction has the same magnitude of enthalpy change with the opposite sign.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Equilibrium',
        mins: 9,
        body: `
<ul>
  <li>At equilibrium, forward and reverse rates are equal, and concentrations are constant (not equal).</li>
  <li><b>Equilibrium constant:</b> for aA + bB ⇌ cC + dD, $K = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$. Leave out pure solids and liquids.</li>
  <li><b>Q vs. K:</b> if Q &lt; K, the reaction shifts right; if Q &gt; K, it shifts left.</li>
  <li><b>ICE tables</b> solve for equilibrium concentrations.</li>
  <li><b>Le Chatelier's principle:</b> a system shifts to counteract a stress (adding reactant shifts right; increasing pressure shifts toward fewer gas moles; heating shifts in the endothermic direction).</li>
  <li><b>Solubility:</b> Ksp. The <b>common ion effect</b> lowers solubility.</li>
</ul>
${rule('Only temperature changes the value of K. Concentration and pressure changes shift the position but not K.')}`,
        check: { q: 'For an exothermic reaction at equilibrium, raising the temperature will:', choices: ['Shift it right and increase K', 'Shift it left and decrease K', 'Not change anything', 'Shift it right but not change K'], answer: 1, why: 'Heat acts like a product in an exothermic reaction, so adding heat shifts left and lowers K.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: Acids and Bases',
        mins: 9,
        body: `
<ul>
  <li>$\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$, and $\\text{pH} + \\text{pOH} = 14$ at 25°C.</li>
  <li><b>Strong acids</b> (HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄) ionize completely. <b>Weak acids</b> partially ionize: use Ka and an ICE table.</li>
  <li><b>Buffers</b> are a weak acid with its conjugate base. They resist pH change. <b>Henderson-Hasselbalch:</b> $\\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{A}^-]}{[\\text{HA}]}$.</li>
  <li>At the <b>half-equivalence point</b> of a weak acid titration, pH = pKa.</li>
  <li><b>Titration curves:</b> a strong acid with a strong base has an equivalence point at pH 7; a weak acid with a strong base has an equivalence point above 7.</li>
</ul>
${worked('pH', '<p>0.010 M HCl: $[\\text{H}_3\\text{O}^+] = 0.010$, so pH = 2.</p>')}`,
        check: { q: 'During the titration of a weak acid, at the half-equivalence point:', choices: ['pH = 7', 'pH = pKa', 'pH = 14', 'All the acid is gone'], answer: 1, why: 'Half the acid has been converted to its conjugate base, so [A⁻] = [HA] and the log term is zero.' },
      },
      {
        id: 'u9',
        title: 'Unit 9: Thermodynamics and Electrochemistry',
        mins: 9,
        body: `
<ul>
  <li><b>Entropy</b> (S) measures dispersal of matter and energy. It increases when solids become liquids or gases, and when gas moles increase.</li>
  <li><b>Gibbs free energy:</b> $\\Delta G = \\Delta H - T\\Delta S$. A reaction is thermodynamically favored if ΔG &lt; 0.</li>
  <li>If ΔH &lt; 0 and ΔS &gt; 0, it's favored at all temperatures. If both are positive, it's favored only at high T.</li>
  <li>$\\Delta G^\\circ = -RT\\ln K$: if K &gt; 1, ΔG° &lt; 0.</li>
  <li><b>Galvanic cells:</b> oxidation at the anode, reduction at the cathode ("An Ox, Red Cat"). Electrons flow from anode to cathode. E°cell = E°cathode − E°anode; positive means favored.</li>
  <li>$\\Delta G^\\circ = -nFE^\\circ$. <b>Electrolysis</b> uses outside energy to drive unfavorable reactions: $q = It$.</li>
</ul>`,
        check: { q: 'A reaction has ΔH > 0 and ΔS > 0. When is it thermodynamically favored?', choices: ['At all temperatures', 'At high temperatures only', 'At low temperatures only', 'Never'], answer: 1, why: 'ΔG = ΔH − TΔS becomes negative only when TΔS is larger than ΔH, which happens at high T.' },
      },
    ],
  },

  {
    id: 'ap-enviro',
    subject: 'Science',
    ap: true,
    icon: 'leaf',
    title: 'AP Environmental Science',
    blurb: 'Ecosystems, biodiversity, populations, Earth systems, land and water use, energy, pollution, and global change, with the calculations APES asks for.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: The Living World: Ecosystems',
        mins: 7,
        body: `
<p>The exam: 80 multiple-choice questions (90 min, 60%) and 3 free-response questions (70 min, 40%): design an investigation, analyze an environmental problem and propose a solution, and the same with calculations. Calculators are allowed.</p>
<ul>
  <li><b>Species interactions:</b> predation, competition, mutualism, commensalism, parasitism. <b>Resource partitioning</b> reduces competition.</li>
  <li><b>Biomes</b> are defined by temperature and precipitation (tundra, taiga, temperate forest, grassland, desert, tropical rainforest). Aquatic biomes depend on salinity, depth, and flow.</li>
  <li><b>Cycles:</b> carbon (fastest through photosynthesis and respiration; longest storage in rocks and fossil fuels), nitrogen (fixation, nitrification, assimilation, ammonification, denitrification), phosphorus (no gas phase; limiting nutrient), and water.</li>
  <li><b>Energy flow:</b> the 10% rule. Primary productivity: NPP = GPP − respiration.</li>
</ul>`,
        check: { q: 'Why is phosphorus often a limiting nutrient?', choices: ['It is a gas that escapes easily', 'Its cycle has no atmospheric phase and weathering from rock is slow', 'Plants don\'t need it', 'It is produced by lightning'], answer: 1, why: 'Phosphorus moves mainly through rock weathering, which is slow, so ecosystems often have little available.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: The Living World: Biodiversity',
        mins: 6,
        body: `
<ul>
  <li><b>Biodiversity</b> includes genetic, species, and ecosystem diversity. Species richness (number of species) and evenness (relative abundance).</li>
  <li>Higher genetic diversity helps populations survive disturbances. <b>Bottlenecks</b> reduce it.</li>
  <li><b>Ecosystem services:</b> provisioning (food, timber), regulating (climate, flood control), supporting (pollination, nutrient cycling), and cultural (recreation).</li>
  <li><b>Island biogeography:</b> larger islands and those closer to the mainland have more species. This applies to habitat "islands" like parks.</li>
  <li><b>Ecological tolerance</b> and <b>succession:</b> primary (on bare rock, starts with lichens and moss) and secondary (after a disturbance, where soil remains).</li>
</ul>`,
        check: { q: 'After a forest fire leaves soil intact, what kind of succession occurs?', choices: ['Primary', 'Secondary', 'Tertiary', 'No succession'], answer: 1, why: 'Secondary succession happens where soil remains, so it\'s faster than primary succession on bare rock.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Populations',
        mins: 7,
        body: `
<ul>
  <li><b>r-selected species</b> (insects, mice): many offspring, little care, fast growth. <b>K-selected species</b> (elephants, humans): few offspring, much care, populations near carrying capacity.</li>
  <li><b>Survivorship curves:</b> Type I (most survive to old age), Type II (constant death rate), Type III (most die young).</li>
  <li><b>Carrying capacity</b> (K) is limited by density-dependent factors (food, disease) and density-independent ones (natural disasters).</li>
  <li><b>Human population:</b> age structure diagrams, total fertility rate, and the demographic transition.</li>
  <li><b>Rule of 70:</b> doubling time ≈ 70 ÷ growth rate (in percent).</li>
</ul>
${worked('Doubling time', '<p>A population grows 2% per year. Doubling time ≈ 70 ÷ 2 = 35 years.</p>')}`,
        check: { q: 'A population grows at 3.5% per year. About how long until it doubles?', choices: ['10 years', '20 years', '35 years', '70 years'], answer: 1, why: 'Rule of 70: 70 ÷ 3.5 = 20 years.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Earth Systems and Resources',
        mins: 7,
        body: `
<ul>
  <li><b>Plate tectonics:</b> divergent (seafloor spreading), convergent (subduction, mountains, volcanoes), and transform (earthquakes) boundaries.</li>
  <li><b>Soil:</b> horizons (O, A, B, C), formed by weathering. Texture (sand, silt, clay) affects water retention and permeability. Erosion is a major threat.</li>
  <li><b>Atmosphere:</b> mostly nitrogen (78%) and oxygen (21%). Layers: troposphere (weather), stratosphere (ozone layer), mesosphere, thermosphere.</li>
  <li><b>Global winds and climate:</b> uneven solar heating, the Coriolis effect, and Hadley cells. Rain shadows form on the leeward side of mountains.</li>
  <li><b>El Niño and La Niña:</b> changes in Pacific winds and ocean temperatures that shift weather worldwide.</li>
  <li><b>Watersheds:</b> all the land that drains into one body of water.</li>
</ul>`,
        check: { q: 'Why is the leeward side of a mountain range often dry?', choices: ['It gets more sunlight', 'Air loses its moisture as rain while rising over the windward side', 'Ocean currents are colder there', 'The soil absorbs all the water'], answer: 1, why: 'Rising air cools and drops rain on the windward side, so the descending air on the leeward side is dry (a rain shadow).' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Land and Water Use',
        mins: 8,
        body: `
<ul>
  <li><b>Tragedy of the commons:</b> shared resources get overused when individuals act in self-interest (overfishing, overgrazing).</li>
  <li><b>Forestry:</b> clear-cutting vs. selective cutting. Deforestation reduces carbon storage and habitat.</li>
  <li><b>Agriculture:</b> the Green Revolution, monocultures, tillage (which increases erosion), irrigation (risk of salinization and waterlogging), and pest control (integrated pest management reduces pesticides).</li>
  <li><b>Meat production:</b> CAFOs (concentrated animal feeding operations) are efficient but produce concentrated waste.</li>
  <li><b>Mining:</b> surface mining disturbs more land; reclamation restores it.</li>
  <li><b>Urbanization:</b> impervious surfaces increase runoff and flooding. Urban sprawl increases driving.</li>
  <li><b>Sustainable practices:</b> crop rotation, contour plowing, terracing, no-till farming, aquaculture, and sustainable forestry.</li>
</ul>`,
        check: { q: 'Which practice most directly reduces soil erosion on sloped farmland?', choices: ['Monocropping', 'Terracing or contour plowing', 'Increased irrigation', 'Clear-cutting'], answer: 1, why: 'Terraces and contour rows slow water running downhill, keeping soil in place.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Energy Resources and Consumption',
        mins: 8,
        body: `
<ul>
  <li><b>Nonrenewable:</b> coal (cheap, highest CO₂), oil, natural gas (cleanest fossil fuel, but methane leaks), and nuclear (no CO₂, but radioactive waste and accident risk).</li>
  <li><b>Fracking</b> releases natural gas from shale; concerns include groundwater contamination and earthquakes.</li>
  <li><b>Renewable:</b> solar, wind, hydroelectric (disrupts rivers), geothermal, biomass (can be carbon neutral but causes air pollution), and hydrogen fuel cells.</li>
  <li><b>Electricity generation:</b> most plants use heat to make steam that turns a turbine connected to a generator. Fossil fuel plants are about 33% efficient.</li>
  <li><b>Conservation:</b> efficiency standards, insulation, LED lights, and public transit.</li>
</ul>
${worked('Energy calculation', '<p>A 100 W bulb runs 5 hours a day for 30 days: $100 \\times 5 \\times 30 = 15{,}000$ Wh = 15 kWh. At 12 cents per kWh, that costs 1.80 dollars.</p>')}
${tip('Calculators are allowed, but APES calculation questions still require you to show your setup and units. Write out the dimensional analysis step by step.')}`,
        check: { q: 'Which fossil fuel releases the least CO₂ per unit of energy when burned?', choices: ['Coal', 'Oil', 'Natural gas', 'They are all the same'], answer: 2, why: 'Natural gas (methane) has the highest ratio of hydrogen to carbon, so it releases the least CO₂ per unit of energy.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Atmospheric Pollution',
        mins: 7,
        body: `
<ul>
  <li><b>Primary pollutants</b> are emitted directly (CO, SO₂, NOₓ, particulates). <b>Secondary pollutants</b> form in the air (ground-level ozone, acid rain).</li>
  <li><b>Photochemical smog:</b> NOₓ and VOCs react in sunlight to form ozone. Worst on hot, sunny days in cities with traffic.</li>
  <li><b>Thermal inversions</b> trap pollution near the ground.</li>
  <li><b>Acid rain</b> comes from SO₂ and NOₓ; it harms lakes and forests. Limestone can neutralize it.</li>
  <li><b>Indoor pollution:</b> radon, carbon monoxide, asbestos, and smoke from burning biomass.</li>
  <li><b>Controls:</b> the Clean Air Act, catalytic converters, scrubbers, and electrostatic precipitators.</li>
  <li><b>Noise pollution</b> also harms wildlife and people.</li>
</ul>`,
        check: { q: 'Ground-level ozone is a secondary pollutant because:', choices: ['It is emitted directly by cars', 'It forms when NOₓ and VOCs react in sunlight', 'It comes from volcanoes', 'It only exists in the stratosphere'], answer: 1, why: 'It isn\'t released directly; it forms from reactions among primary pollutants in sunlight.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: Aquatic and Terrestrial Pollution',
        mins: 7,
        body: `
<ul>
  <li><b>Point sources</b> (a single pipe) vs. <b>nonpoint sources</b> (runoff from many farms; harder to regulate).</li>
  <li><b>Eutrophication:</b> excess nitrogen and phosphorus cause algal blooms. When the algae die, decomposers use up oxygen, creating <b>dead zones</b>.</li>
  <li><b>Thermal pollution</b> lowers dissolved oxygen.</li>
  <li><b>Bioaccumulation</b> (builds up in one organism) and <b>biomagnification</b> (increases up the food chain): mercury, DDT.</li>
  <li><b>Solid waste:</b> landfills (leachate, methane), incineration, recycling, and composting. Ocean plastics break into microplastics.</li>
  <li><b>Sewage treatment:</b> primary (physical settling), secondary (bacteria break down organic matter), and tertiary (removes nutrients).</li>
  <li><b>Dose-response curves:</b> LD50 is the dose that kills half the test population.</li>
</ul>`,
        check: { q: 'Why do top predators like eagles have the highest DDT concentrations?', choices: ['They eat DDT directly', 'Biomagnification concentrates it up the food chain', 'They live longer than other animals', 'DDT is attracted to feathers'], answer: 1, why: 'Fat-soluble toxins aren\'t excreted, so each trophic level concentrates the toxin from all the prey it eats.' },
      },
      {
        id: 'u9',
        title: 'Unit 9: Global Change',
        mins: 7,
        body: `
<ul>
  <li><b>Stratospheric ozone depletion:</b> CFCs released chlorine that destroys ozone. The <b>Montreal Protocol</b> (1987) phased them out, and the ozone layer is recovering.</li>
  <li><b>The greenhouse effect:</b> CO₂, methane, nitrous oxide, and water vapor trap heat. Methane and nitrous oxide have much higher warming potential per molecule than CO₂.</li>
  <li><b>Effects of climate change:</b> rising sea levels, melting ice, more extreme weather, shifting habitats, and coral bleaching.</li>
  <li><b>Ocean acidification:</b> oceans absorb CO₂, forming carbonic acid, which makes it harder for corals and shellfish to build shells.</li>
  <li><b>Invasive species</b> (kudzu, zebra mussels) outcompete natives. <b>Endangered species</b> are protected by laws like the Endangered Species Act and CITES.</li>
  <li><b>Solutions:</b> renewable energy, carbon taxes, protected areas, and habitat corridors.</li>
</ul>`,
        check: { q: 'Why is the ozone layer recovering?', choices: ['Climate change is warming the stratosphere', 'The Montreal Protocol phased out CFCs', 'Volcanoes added ozone', 'Ozone was artificially added'], answer: 1, why: 'The Montreal Protocol is one of the most successful environmental treaties: CFC emissions fell sharply.' },
      },
    ],
  },

  {
    id: 'ap-physics-1',
    subject: 'Science',
    ap: true,
    icon: 'bolt',
    title: 'AP Physics 1',
    blurb: 'Algebra-based mechanics: kinematics, forces, energy, momentum, rotation, oscillations, and fluids, with worked problems.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'u1',
        title: 'Unit 1: Kinematics',
        mins: 8,
        body: `
<p>The exam: 40 multiple-choice questions (80 min, 50%) and 4 free-response questions (100 min, 50%). Calculators are allowed on the whole exam, and you get an equation sheet.</p>
<ul>
  <li><b>Displacement, velocity, acceleration</b> are vectors. Speed and distance are scalars.</li>
  <li><b>Graphs:</b> the slope of x vs. t is velocity; the slope of v vs. t is acceleration; the area under v vs. t is displacement.</li>
  <li><b>Constant acceleration equations:</b> $v = v_0 + at$, $x = x_0 + v_0t + \\frac{1}{2}at^2$, $v^2 = v_0^2 + 2a(x - x_0)$.</li>
  <li><b>Projectiles:</b> horizontal velocity is constant; vertical acceleration is $-g$ (about $9.8\\text{ m/s}^2$). Treat the directions separately; time links them.</li>
</ul>
${worked('Example', '<p>A ball is thrown horizontally at 6 m/s from a 20 m cliff. Fall time: $20 = \\frac{1}{2}(9.8)t^2$, so $t \\approx 2.0$ s. Horizontal distance: $6 \\times 2.0 = 12$ m.</p>')}`,
        check: { q: 'What does the area under a velocity vs. time graph represent?', choices: ['Acceleration', 'Displacement', 'Force', 'Speed'], answer: 1, why: 'Velocity times time is displacement, so the area under v vs. t gives displacement.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Force and Translational Dynamics',
        mins: 9,
        body: `
<ul>
  <li><b>Newton's laws:</b> (1) objects keep their velocity unless a net force acts; (2) $\\Sigma F = ma$; (3) forces come in equal and opposite pairs on different objects.</li>
  <li><b>Free-body diagrams:</b> draw every force on one object: gravity ($mg$), normal force, tension, friction, applied forces.</li>
  <li><b>Friction:</b> $f_k = \\mu_k N$; static friction $f_s \\le \\mu_s N$.</li>
  <li><b>Inclines:</b> the gravity component along the incline is $mg\\sin\\theta$; perpendicular is $mg\\cos\\theta$.</li>
  <li><b>Circular motion:</b> centripetal acceleration $a_c = \\frac{v^2}{r}$ points toward the center. Some real force (tension, gravity, friction) provides it.</li>
  <li><b>Gravitation:</b> $F = \\frac{Gm_1m_2}{r^2}$.</li>
  <li><b>Springs:</b> $F = -kx$ (Hooke's law).</li>
</ul>
${rule('Centripetal force is not a new force. Never draw it on a free-body diagram; it is the net of the real forces pointing toward the center.')}`,
        check: { q: 'A 2 kg box is pushed with a net force of 10 N. What is its acceleration?', choices: ['0.2 m/s²', '5 m/s²', '12 m/s²', '20 m/s²'], answer: 1, why: '$a = F/m = 10/2 = 5$ m/s².' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Work, Energy, and Power',
        mins: 8,
        body: `
<ul>
  <li><b>Work:</b> $W = Fd\\cos\\theta$. The <b>work-energy theorem:</b> net work equals the change in kinetic energy.</li>
  <li><b>Kinetic energy:</b> $K = \\frac{1}{2}mv^2$. <b>Gravitational potential energy:</b> $U_g = mgh$. <b>Spring potential energy:</b> $U_s = \\frac{1}{2}kx^2$.</li>
  <li><b>Conservation of energy:</b> in a closed system with no friction, total mechanical energy is constant. Friction turns mechanical energy into internal (thermal) energy.</li>
  <li><b>Power:</b> $P = \\frac{W}{t} = Fv$.</li>
</ul>
${worked('Example', '<p>A 0.5 kg ball drops from 5 m. Speed at the bottom: $mgh = \\frac{1}{2}mv^2$, so $v = \\sqrt{2gh} = \\sqrt{98} \\approx 9.9$ m/s.</p>')}`,
        check: { q: 'A ball\'s speed doubles. Its kinetic energy:', choices: ['Doubles', 'Quadruples', 'Stays the same', 'Halves'], answer: 1, why: 'Kinetic energy depends on $v^2$, so doubling v multiplies K by 4.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Linear Momentum',
        mins: 7,
        body: `
<ul>
  <li><b>Momentum:</b> $p = mv$, a vector.</li>
  <li><b>Impulse:</b> $J = F\\Delta t = \\Delta p$. The area under a force vs. time graph is impulse. Airbags increase $\\Delta t$ to reduce force.</li>
  <li><b>Conservation of momentum:</b> if no net external force acts, total momentum is constant in every collision and explosion.</li>
  <li><b>Elastic collisions</b> conserve kinetic energy too. <b>Inelastic collisions</b> lose kinetic energy; <b>perfectly inelastic</b> collisions have the objects stick together.</li>
  <li><b>Center of mass</b> of an isolated system moves at constant velocity.</li>
</ul>
${worked('Example', '<p>A 1000 kg car at 20 m/s hits a stopped 1500 kg car, and they stick. $1000(20) = 2500v$, so $v = 8$ m/s.</p>')}`,
        check: { q: 'In which type of collision is kinetic energy conserved?', choices: ['Perfectly inelastic', 'Inelastic', 'Elastic', 'All collisions'], answer: 2, why: 'Momentum is conserved in all collisions, but kinetic energy is conserved only in elastic ones.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Torque and Rotational Dynamics',
        mins: 8,
        body: `
<ul>
  <li><b>Rotational kinematics:</b> θ, ω, α replace x, v, a. $v = r\\omega$, $a_t = r\\alpha$.</li>
  <li><b>Torque:</b> $\\tau = rF\\sin\\theta$. Pushing farther from the axis or perpendicular to the lever arm gives more torque.</li>
  <li><b>Rotational inertia</b> (I) depends on mass and how far it is from the axis. More mass far from the axis means larger I.</li>
  <li><b>Newton's second law for rotation:</b> $\\Sigma\\tau = I\\alpha$.</li>
  <li><b>Equilibrium:</b> both net force and net torque are zero. Choose a pivot that removes unknown forces from the torque equation.</li>
</ul>`,
        check: { q: 'Why is it easier to open a door by pushing at the handle than near the hinges?', choices: ['The handle has less friction', 'A larger lever arm gives more torque for the same force', 'The door weighs less at the handle', 'Rotational inertia is lower at the handle'], answer: 1, why: 'Torque = rF, so pushing farther from the hinge (larger r) creates more torque with the same force.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Energy and Momentum of Rotating Systems',
        mins: 7,
        body: `
<ul>
  <li><b>Rotational kinetic energy:</b> $K = \\frac{1}{2}I\\omega^2$. A rolling object has both translational and rotational kinetic energy.</li>
  <li>When objects roll down a ramp, those with smaller rotational inertia (relative to $mr^2$) reach the bottom faster: a solid sphere beats a hollow hoop.</li>
  <li><b>Angular momentum:</b> $L = I\\omega$. It is conserved when no net external torque acts.</li>
  <li>A spinning skater pulls in her arms, decreasing I, so ω increases.</li>
  <li><b>Orbits:</b> satellites conserve angular momentum, moving fastest when closest to the planet.</li>
</ul>`,
        check: { q: 'A spinning skater pulls her arms in. What happens to her angular speed?', choices: ['It decreases', 'It increases', 'It stays the same', 'She stops spinning'], answer: 1, why: 'Angular momentum $L = I\\omega$ is conserved. A smaller I requires a larger ω.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Oscillations',
        mins: 7,
        body: `
<ul>
  <li><b>Simple harmonic motion</b> occurs when a restoring force is proportional to displacement.</li>
  <li><b>Mass on a spring:</b> $T = 2\\pi\\sqrt{\\frac{m}{k}}$. <b>Pendulum</b> (small angles): $T = 2\\pi\\sqrt{\\frac{L}{g}}$. A pendulum's period does not depend on mass or amplitude.</li>
  <li><b>Energy:</b> at the extremes, all energy is potential and speed is zero. At equilibrium, all energy is kinetic and speed is maximum.</li>
  <li>Frequency $f = \\frac{1}{T}$.</li>
</ul>`,
        check: { q: 'To double a pendulum\'s period, you should:', choices: ['Double its length', 'Quadruple its length', 'Double its mass', 'Double its amplitude'], answer: 1, why: 'T is proportional to $\\sqrt{L}$, so T doubles when L is multiplied by 4.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: Fluids',
        mins: 7,
        body: `
<ul>
  <li><b>Density:</b> $\\rho = \\frac{m}{V}$. <b>Pressure:</b> $P = \\frac{F}{A}$. Pressure in a fluid increases with depth: $P = P_0 + \\rho gh$.</li>
  <li><b>Buoyancy (Archimedes):</b> the buoyant force equals the weight of the fluid displaced: $F_b = \\rho_{fluid}Vg$. Objects less dense than the fluid float.</li>
  <li><b>Continuity:</b> $A_1v_1 = A_2v_2$. Fluid speeds up where a pipe narrows.</li>
  <li><b>Bernoulli's equation:</b> $P + \\rho gh + \\frac{1}{2}\\rho v^2$ is constant along a streamline. Faster-moving fluid has lower pressure.</li>
</ul>`,
        check: { q: 'Water flows from a wide pipe into a narrow one. In the narrow section, the water\'s speed:', choices: ['Decreases', 'Increases', 'Stays the same', 'Drops to zero'], answer: 1, why: 'By continuity, $A_1v_1 = A_2v_2$, so a smaller area means a larger speed.' },
      },
    ],
  },

  {
    id: 'ap-physics-2',
    subject: 'Science',
    ap: true,
    icon: 'bolt',
    title: 'AP Physics 2',
    blurb: 'Algebra-based thermodynamics, electricity, circuits, magnetism, optics, waves, and modern physics.',
    level: 'AP · Grades 11 to 12',
    lessons: [
      {
        id: 'thermo',
        title: 'Thermodynamics',
        mins: 8,
        body: `
<p>The exam: 40 multiple-choice questions (80 min, 50%) and 4 free-response questions (100 min, 50%), with calculators and an equation sheet.</p>
<ul>
  <li><b>Ideal gas law:</b> $PV = nRT = Nk_BT$. Temperature is proportional to average kinetic energy of particles.</li>
  <li><b>First law:</b> $\\Delta U = Q + W$, where W is work done <i>on</i> the gas. Compressing a gas does positive work on it.</li>
  <li><b>PV diagrams:</b> the area under the curve is the work. Processes: isobaric (constant P), isochoric (constant V, no work), isothermal (constant T, ΔU = 0), adiabatic (Q = 0).</li>
  <li><b>Heat transfer:</b> conduction, convection, radiation. Thermal conductivity: $\\frac{Q}{\\Delta t} = \\frac{kA\\Delta T}{L}$.</li>
  <li><b>Second law:</b> heat flows naturally from hot to cold; total entropy of an isolated system never decreases.</li>
</ul>`,
        check: { q: 'In an isothermal process for an ideal gas, what is ΔU?', choices: ['Positive', 'Negative', 'Zero', 'Equal to PV'], answer: 2, why: 'An ideal gas\'s internal energy depends only on temperature, so constant temperature means ΔU = 0.' },
      },
      {
        id: 'electrostatics',
        title: 'Electric force, field, and potential',
        mins: 9,
        body: `
<ul>
  <li><b>Coulomb's law:</b> $F = k\\frac{|q_1q_2|}{r^2}$. Like charges repel; opposite charges attract.</li>
  <li><b>Electric field:</b> $E = \\frac{F}{q}$, pointing away from positive and toward negative charges. Near a point charge, $E = \\frac{kq}{r^2}$.</li>
  <li><b>Electric potential</b> (voltage): $V = \\frac{kq}{r}$, a scalar. Equipotential lines are perpendicular to field lines.</li>
  <li><b>Potential energy:</b> $U = qV$. Positive charges move toward lower potential.</li>
  <li><b>Uniform field</b> between parallel plates: $E = \\frac{\\Delta V}{d}$.</li>
  <li><b>Capacitors:</b> $C = \\frac{Q}{\\Delta V}$; for parallel plates $C = \\frac{\\kappa\\varepsilon_0A}{d}$. Energy stored: $U = \\frac{1}{2}Q\\Delta V$.</li>
</ul>`,
        check: { q: 'If the distance between two charges is doubled, the electric force between them:', choices: ['Doubles', 'Halves', 'Becomes one-fourth as large', 'Stays the same'], answer: 2, why: 'Force depends on $1/r^2$, so doubling r divides the force by 4.' },
      },
      {
        id: 'circuits',
        title: 'Electric circuits',
        mins: 9,
        body: `
<ul>
  <li><b>Current:</b> $I = \\frac{\\Delta q}{\\Delta t}$. <b>Ohm's law:</b> $\\Delta V = IR$. <b>Resistance:</b> $R = \\frac{\\rho L}{A}$.</li>
  <li><b>Series:</b> same current through each; $R_{eq} = R_1 + R_2 + \\ldots$</li>
  <li><b>Parallel:</b> same voltage across each; $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\ldots$ Adding a parallel branch lowers total resistance.</li>
  <li><b>Kirchhoff's rules:</b> the junction rule (current in equals current out, conservation of charge) and the loop rule (voltages around a loop sum to zero, conservation of energy).</li>
  <li><b>Power:</b> $P = I\\Delta V = I^2R = \\frac{\\Delta V^2}{R}$. Brighter bulbs dissipate more power.</li>
  <li><b>RC circuits:</b> a charging capacitor eventually blocks current; time constant $\\tau = RC$.</li>
</ul>
${worked('Example', '<p>Two 6 Ω resistors in parallel: $\\frac{1}{R} = \\frac{1}{6} + \\frac{1}{6}$, so $R = 3\\ \\Omega$. With a 12 V battery, total current is 4 A.</p>')}`,
        check: { q: 'Adding another resistor in parallel to a circuit does what to the total resistance?', choices: ['Increases it', 'Decreases it', 'Doesn\'t change it', 'Makes it zero'], answer: 1, why: 'Each new parallel path gives current another route, so the equivalent resistance goes down.' },
      },
      {
        id: 'magnetism',
        title: 'Magnetism and electromagnetism',
        mins: 8,
        body: `
<ul>
  <li><b>Force on a moving charge:</b> $F = qvB\\sin\\theta$. Use the right-hand rule. The force is perpendicular to velocity, so it changes direction but not speed (charges move in circles).</li>
  <li><b>Force on a current-carrying wire:</b> $F = ILB\\sin\\theta$.</li>
  <li><b>Field around a long wire:</b> $B = \\frac{\\mu_0 I}{2\\pi r}$, circling the wire (right-hand grip rule).</li>
  <li><b>Magnetic flux:</b> $\\Phi = BA\\cos\\theta$.</li>
  <li><b>Faraday's law:</b> a changing flux induces an emf: $\\varepsilon = -\\frac{\\Delta\\Phi}{\\Delta t}$. <b>Lenz's law:</b> the induced current opposes the change in flux.</li>
  <li>Motional emf: $\\varepsilon = BLv$. Generators and transformers rely on induction.</li>
</ul>`,
        check: { q: 'A magnetic force on a moving charge changes its:', choices: ['Speed only', 'Direction only', 'Mass', 'Charge'], answer: 1, why: 'The force is always perpendicular to velocity, so it does no work and only changes direction.' },
      },
      {
        id: 'optics',
        title: 'Geometric optics',
        mins: 8,
        body: `
<ul>
  <li><b>Reflection:</b> angle of incidence equals angle of reflection.</li>
  <li><b>Refraction:</b> index $n = \\frac{c}{v}$. <b>Snell's law:</b> $n_1\\sin\\theta_1 = n_2\\sin\\theta_2$. Light bends toward the normal entering a slower (higher n) medium.</li>
  <li><b>Total internal reflection</b> happens going into a lower-n medium beyond the critical angle: $\\sin\\theta_c = \\frac{n_2}{n_1}$ (fiber optics).</li>
  <li><b>Lenses and mirrors:</b> $\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}$, magnification $M = -\\frac{d_i}{d_o}$. Positive $d_i$ means a real, inverted image.</li>
  <li>Converging lenses and concave mirrors can make real or virtual images. Diverging lenses and convex mirrors make only virtual, upright, smaller images.</li>
</ul>`,
        check: { q: 'Light moves from water (n = 1.33) into air (n = 1.00). It bends:', choices: ['Toward the normal', 'Away from the normal', 'Not at all', 'Back into the water always'], answer: 1, why: 'Light speeds up entering a lower-index medium, so it bends away from the normal.' },
      },
      {
        id: 'waves',
        title: 'Waves, sound, and physical optics',
        mins: 8,
        body: `
<ul>
  <li><b>Wave speed:</b> $v = f\\lambda$. Transverse waves (light, strings) vs. longitudinal waves (sound).</li>
  <li><b>Standing waves:</b> on a string fixed at both ends, $\\lambda_n = \\frac{2L}{n}$. In pipes, open ends are antinodes and closed ends are nodes.</li>
  <li><b>Doppler effect:</b> a source moving toward you sounds higher in frequency.</li>
  <li><b>Interference:</b> constructive when path difference is a whole number of wavelengths; destructive at half-wavelengths.</li>
  <li><b>Double slit:</b> $d\\sin\\theta = m\\lambda$. Bright fringes are spread farther apart for longer wavelengths or narrower slit spacing.</li>
  <li><b>Thin films</b> produce colors (soap bubbles) through interference between reflections.</li>
</ul>`,
        check: { q: 'If a wave\'s frequency doubles while its speed stays the same, its wavelength:', choices: ['Doubles', 'Halves', 'Stays the same', 'Quadruples'], answer: 1, why: 'From $v = f\\lambda$, if v is fixed and f doubles, λ halves.' },
      },
      {
        id: 'modern',
        title: 'Modern physics',
        mins: 8,
        body: `
<ul>
  <li><b>Photons:</b> $E = hf = \\frac{hc}{\\lambda}$. Light has particle behavior.</li>
  <li><b>Photoelectric effect:</b> light ejects electrons only above a threshold frequency, whatever the intensity. $K_{max} = hf - \\phi$ (work function). Brighter light ejects more electrons, but not faster ones.</li>
  <li><b>Matter waves:</b> de Broglie wavelength $\\lambda = \\frac{h}{p}$. Electron diffraction shows particles act as waves.</li>
  <li><b>Atomic energy levels:</b> electrons emit photons when dropping levels; the photon energy equals the energy difference, giving line spectra.</li>
  <li><b>Nuclear physics:</b> alpha, beta, and gamma decay; half-life; $E = mc^2$ explains the energy from fission and fusion (mass defect).</li>
</ul>`,
        check: { q: 'In the photoelectric effect, increasing light intensity (above threshold frequency) increases:', choices: ['The maximum kinetic energy of electrons', 'The number of electrons ejected', 'The work function', 'The threshold frequency'], answer: 1, why: 'More photons eject more electrons, but each photon still has the same energy, so the maximum kinetic energy is unchanged.' },
      },
    ],
  },

  {
    id: 'ap-physics-c-mech',
    subject: 'Science',
    ap: true,
    icon: 'bolt',
    title: 'AP Physics C: Mechanics',
    blurb: 'Calculus-based mechanics: motion with derivatives and integrals, variable forces, work, momentum, rotation, and oscillations.',
    level: 'AP · Grades 11 to 12 · Calculus',
    lessons: [
      {
        id: 'kinematics',
        title: 'Kinematics with calculus',
        mins: 8,
        body: `
<p>The exam: 40 multiple-choice questions (80 min, 50%) and 4 free-response questions (100 min, 50%). You should be taking or have taken calculus.</p>
<ul>
  <li>$v = \\frac{dx}{dt}$ and $a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}$.</li>
  <li>Going backward: $x(t) = x_0 + \\int_0^t v\\,dt$ and $v(t) = v_0 + \\int_0^t a\\,dt$.</li>
  <li>The constant-acceleration equations only work when $a$ is constant. If $a$ depends on time, integrate.</li>
  <li>If $a$ depends on velocity, separate variables: $\\frac{dv}{dt} = -bv$ gives $v = v_0e^{-bt}$.</li>
</ul>
${worked('Example', '<p>$x(t) = 2t^3 - 4t$. Then $v = 6t^2 - 4$ and $a = 12t$. At $t = 1$ s: $v = 2$ m/s and $a = 12$ m/s².</p>')}`,
        check: { q: 'If $x(t) = 3t^2 + 2t$, what is the acceleration?', choices: ['$6t + 2$', '$6$', '$3$', '$2$'], answer: 1, why: '$v = 6t + 2$ and $a = \\frac{dv}{dt} = 6$, a constant.' },
      },
      {
        id: 'dynamics',
        title: 'Forces, drag, and translational dynamics',
        mins: 9,
        body: `
<ul>
  <li>$\\Sigma F = ma = m\\frac{dv}{dt}$. More generally, $\\Sigma F = \\frac{dp}{dt}$.</li>
  <li><b>Drag (resistive) forces</b> like $F = -bv$ lead to differential equations. A falling object approaches <b>terminal velocity</b> when drag equals weight: $v_T = \\frac{mg}{b}$.</li>
  <li>For $mg - bv = m\\frac{dv}{dt}$: $v(t) = \\frac{mg}{b}(1 - e^{-bt/m})$.</li>
  <li><b>Circular motion</b> and <b>gravitation</b> as in Physics 1, plus orbital speed $v = \\sqrt{\\frac{GM}{r}}$.</li>
  <li><b>Center of mass</b> of a continuous object: $x_{cm} = \\frac{1}{M}\\int x\\,dm$.</li>
</ul>`,
        check: { q: 'For an object falling with drag force $bv$, what is its terminal velocity?', choices: ['$mg$', '$\\frac{mg}{b}$', '$\\frac{b}{mg}$', '$\\sqrt{mg}$'], answer: 1, why: 'At terminal velocity, acceleration is zero, so $mg = bv_T$ and $v_T = mg/b$.' },
      },
      {
        id: 'energy',
        title: 'Work, energy, and power with variable forces',
        mins: 8,
        body: `
<ul>
  <li><b>Work by a variable force:</b> $W = \\int \\vec{F} \\cdot d\\vec{r}$, the area under F vs. x.</li>
  <li><b>Potential energy and force:</b> $F_x = -\\frac{dU}{dx}$. Equilibrium points are where $\\frac{dU}{dx} = 0$: stable at minimums of U, unstable at maximums.</li>
  <li><b>Gravitational potential energy</b> (general): $U = -\\frac{GMm}{r}$. Escape speed: $v = \\sqrt{\\frac{2GM}{r}}$.</li>
  <li><b>Power:</b> $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$.</li>
</ul>
${worked('Example', '<p>A spring with $F = -kx$: $W = \\int_0^x kx\\,dx = \\frac{1}{2}kx^2$, the work to stretch it, stored as potential energy.</p>')}`,
        check: { q: 'If $U(x) = x^2 - 4x$, where is the equilibrium point?', choices: ['$x = 0$', '$x = 2$', '$x = 4$', '$x = -2$'], answer: 1, why: '$\\frac{dU}{dx} = 2x - 4 = 0$ gives $x = 2$. It\'s a minimum of U, so it\'s stable.' },
      },
      {
        id: 'momentum',
        title: 'Linear momentum and impulse',
        mins: 7,
        body: `
<ul>
  <li><b>Impulse:</b> $J = \\int F\\,dt = \\Delta p$.</li>
  <li>Momentum is conserved when no net external force acts on the system.</li>
  <li><b>Center of mass velocity:</b> $v_{cm} = \\frac{\\Sigma m_iv_i}{\\Sigma m_i}$. External forces alone change the center of mass motion.</li>
  <li>Elastic collisions conserve kinetic energy; in one dimension, relative speed of approach equals relative speed of separation.</li>
</ul>
${worked('Example', '<p>$F(t) = 6t$ N acts from $t = 0$ to $t = 2$ s on a 3 kg object at rest. $J = \\int_0^2 6t\\,dt = 12$ N·s, so $v = 4$ m/s.</p>')}`,
        check: { q: 'A force $F(t) = 4t$ acts from $t = 0$ to $t = 3$ s. What is the impulse?', choices: ['12 N·s', '18 N·s', '36 N·s', '4 N·s'], answer: 1, why: '$\\int_0^3 4t\\,dt = 2t^2\\big|_0^3 = 18$ N·s.' },
      },
      {
        id: 'rotation',
        title: 'Rotation: torque and rotational inertia',
        mins: 9,
        body: `
<ul>
  <li><b>Rotational inertia:</b> $I = \\int r^2\\,dm$. Common results: rod about center $\\frac{1}{12}ML^2$, rod about end $\\frac{1}{3}ML^2$, solid disk $\\frac{1}{2}MR^2$, hoop $MR^2$, solid sphere $\\frac{2}{5}MR^2$.</li>
  <li><b>Parallel axis theorem:</b> $I = I_{cm} + Md^2$.</li>
  <li><b>Torque:</b> $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$ and $\\Sigma\\tau = I\\alpha$.</li>
  <li><b>Rolling without slipping:</b> $v_{cm} = R\\omega$. Total kinetic energy = $\\frac{1}{2}Mv^2 + \\frac{1}{2}I\\omega^2$.</li>
  <li><b>Angular momentum:</b> $L = I\\omega$ for a rigid body, and $\\vec{L} = \\vec{r} \\times \\vec{p}$ for a particle. $\\Sigma\\tau = \\frac{dL}{dt}$.</li>
</ul>`,
        check: { q: 'Using the parallel axis theorem, what is the rotational inertia of a rod (mass M, length L) about one end?', choices: ['$\\frac{1}{12}ML^2$', '$\\frac{1}{3}ML^2$', '$\\frac{1}{2}ML^2$', '$ML^2$'], answer: 1, why: '$I = \\frac{1}{12}ML^2 + M(\\frac{L}{2})^2 = \\frac{1}{12}ML^2 + \\frac{1}{4}ML^2 = \\frac{1}{3}ML^2$.' },
      },
      {
        id: 'oscillations',
        title: 'Oscillations',
        mins: 8,
        body: `
<ul>
  <li>SHM satisfies $\\frac{d^2x}{dt^2} = -\\omega^2x$, with solution $x(t) = A\\cos(\\omega t + \\phi)$.</li>
  <li><b>Spring:</b> $\\omega = \\sqrt{\\frac{k}{m}}$. <b>Simple pendulum:</b> $\\omega = \\sqrt{\\frac{g}{L}}$. <b>Physical pendulum:</b> $\\omega = \\sqrt{\\frac{mgd}{I}}$.</li>
  <li>Period $T = \\frac{2\\pi}{\\omega}$.</li>
  <li>Maximum speed is $A\\omega$ and maximum acceleration is $A\\omega^2$.</li>
</ul>
${tip('To show something is SHM on an FRQ, write Newton\'s second law, get it into the form $\\ddot{x} = -(\\text{constant})x$, and read off $\\omega^2$ as that constant.')}`,
        check: { q: 'A mass on a spring has $\\omega = 4$ rad/s and amplitude 0.5 m. What is its maximum speed?', choices: ['0.125 m/s', '2 m/s', '8 m/s', '4.5 m/s'], answer: 1, why: '$v_{max} = A\\omega = 0.5 \\times 4 = 2$ m/s.' },
      },
    ],
  },

  {
    id: 'ap-physics-c-em',
    subject: 'Science',
    ap: true,
    icon: 'bolt',
    title: 'AP Physics C: Electricity and Magnetism',
    blurb: 'Calculus-based E&M: Gauss\'s law, potential, capacitors, RC circuits, Ampère\'s law, induction, and inductors.',
    level: 'AP · Grade 12 · Calculus',
    lessons: [
      {
        id: 'gauss',
        title: 'Electric charges, fields, and Gauss\'s law',
        mins: 9,
        body: `
<p>The exam: 40 multiple-choice questions (80 min, 50%) and 4 free-response questions (100 min, 50%).</p>
<ul>
  <li><b>Continuous charge:</b> $\\vec{E} = \\int \\frac{k\\,dq}{r^2}\\hat{r}$. Use linear ($\\lambda$), surface ($\\sigma$), or volume ($\\rho$) charge density.</li>
  <li><b>Gauss's law:</b> $\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0}$. Pick a symmetric Gaussian surface (sphere, cylinder, pillbox).</li>
  <li><b>Results:</b> outside a sphere of charge, $E = \\frac{kQ}{r^2}$. A long line of charge: $E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}$. An infinite sheet: $E = \\frac{\\sigma}{2\\varepsilon_0}$.</li>
  <li>Inside a uniformly charged solid sphere, E grows linearly with r.</li>
</ul>`,
        check: { q: 'What is the electric field inside a charged hollow conducting sphere?', choices: ['$\\frac{kQ}{r^2}$', 'Zero', 'Infinite', '$\\frac{kQ}{R^2}$'], answer: 1, why: 'A Gaussian surface inside encloses no charge, so by symmetry E = 0.' },
      },
      {
        id: 'potential',
        title: 'Electric potential',
        mins: 8,
        body: `
<ul>
  <li>$\\Delta V = -\\int \\vec{E} \\cdot d\\vec{r}$ and $E_x = -\\frac{dV}{dx}$.</li>
  <li>For a point charge: $V = \\frac{kq}{r}$ (zero at infinity). Potential is a scalar, so add contributions without vectors.</li>
  <li>Continuous distributions: $V = \\int \\frac{k\\,dq}{r}$.</li>
  <li>Work by the field: $W = -q\\Delta V$; potential energy of two charges $U = \\frac{kq_1q_2}{r}$.</li>
</ul>
${worked('Example', '<p>If $V(x) = 3x^2$ volts, then $E_x = -\\frac{dV}{dx} = -6x$ V/m.</p>')}`,
        check: { q: 'If $V(x) = 5x^3$, what is $E_x$?', choices: ['$15x^2$', '$-15x^2$', '$-5x^3$', '$\\frac{5}{4}x^4$'], answer: 1, why: '$E_x = -\\frac{dV}{dx} = -15x^2$.' },
      },
      {
        id: 'conductors',
        title: 'Conductors, capacitors, and dielectrics',
        mins: 8,
        body: `
<ul>
  <li>In electrostatic equilibrium, a conductor has E = 0 inside, all excess charge on the surface, and the whole conductor at one potential.</li>
  <li><b>Capacitance:</b> $C = \\frac{Q}{\\Delta V}$. Parallel plates: $C = \\frac{\\kappa\\varepsilon_0 A}{d}$. Find C for other shapes using Gauss's law to get E, then integrate for ΔV.</li>
  <li><b>Energy:</b> $U = \\frac{1}{2}C\\Delta V^2$; energy density $u = \\frac{1}{2}\\varepsilon_0E^2$.</li>
  <li><b>Combinations:</b> parallel capacitors add ($C_{eq} = C_1 + C_2$); series capacitors add as reciprocals.</li>
  <li>A <b>dielectric</b> increases capacitance by a factor κ.</li>
</ul>`,
        check: { q: 'Two capacitors are connected in parallel. Their equivalent capacitance:', choices: ['Is the sum of the two', 'Is less than either one', 'Equals the smaller one', 'Is the product'], answer: 0, why: 'Parallel capacitors share the same voltage and their charges add, so $C_{eq} = C_1 + C_2$.' },
      },
      {
        id: 'circuits',
        title: 'Electric circuits and RC circuits',
        mins: 8,
        body: `
<ul>
  <li>Resistors, Ohm's law, and Kirchhoff's rules as in Physics 2. Resistivity $R = \\frac{\\rho L}{A}$.</li>
  <li><b>Charging an RC circuit:</b> $q(t) = C\\varepsilon(1 - e^{-t/RC})$ and $I(t) = \\frac{\\varepsilon}{R}e^{-t/RC}$.</li>
  <li><b>Discharging:</b> $q(t) = Q_0e^{-t/RC}$.</li>
  <li>The time constant $\\tau = RC$: after one τ, a charging capacitor reaches about 63% of its final charge.</li>
  <li>At $t = 0$ an uncharged capacitor acts like a wire; at steady state it acts like a break in the circuit.</li>
</ul>`,
        check: { q: 'Immediately after a switch closes on an uncharged capacitor in series with a resistor, the capacitor acts like:', choices: ['An open circuit', 'A short circuit (a wire)', 'A battery', 'An inductor'], answer: 1, why: 'With no charge, there\'s no voltage across the capacitor, so current flows as if it were a wire.' },
      },
      {
        id: 'magnetic',
        title: 'Magnetic fields and Ampère\'s law',
        mins: 8,
        body: `
<ul>
  <li>$\\vec{F} = q\\vec{v} \\times \\vec{B}$ and $\\vec{F} = I\\vec{L} \\times \\vec{B}$.</li>
  <li><b>Biot-Savart law:</b> $d\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\vec{l} \\times \\hat{r}}{r^2}$. At the center of a loop: $B = \\frac{\\mu_0 I}{2R}$.</li>
  <li><b>Ampère's law:</b> $\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc}$. Long wire: $B = \\frac{\\mu_0 I}{2\\pi r}$. Solenoid: $B = \\mu_0 nI$.</li>
  <li>Parallel wires with currents in the same direction attract.</li>
</ul>`,
        check: { q: 'Two parallel wires carry current in the same direction. They:', choices: ['Repel', 'Attract', 'Exert no force', 'Rotate'], answer: 1, why: 'Each wire\'s field pushes the other wire\'s current toward it, so same-direction currents attract.' },
      },
      {
        id: 'induction',
        title: 'Electromagnetic induction and inductors',
        mins: 9,
        body: `
<ul>
  <li><b>Faraday's law:</b> $\\varepsilon = -\\frac{d\\Phi_B}{dt}$, with $\\Phi_B = \\int \\vec{B} \\cdot d\\vec{A}$. <b>Lenz's law</b> gives the direction.</li>
  <li><b>Inductance:</b> $\\varepsilon = -L\\frac{dI}{dt}$. An inductor resists changes in current.</li>
  <li><b>RL circuits:</b> current grows as $I(t) = \\frac{\\varepsilon}{R}(1 - e^{-Rt/L})$; time constant $\\tau = \\frac{L}{R}$.</li>
  <li><b>Energy in an inductor:</b> $U = \\frac{1}{2}LI^2$.</li>
  <li><b>LC circuits</b> oscillate with $\\omega = \\frac{1}{\\sqrt{LC}}$.</li>
  <li><b>Maxwell's equations</b> summarize all of E&M.</li>
</ul>
${rule('Inductors are the opposite of capacitors in the moment after a switch closes: an inductor acts like an open circuit at first and like a wire at steady state.')}`,
        check: { q: 'What is the time constant of an RL circuit?', choices: ['$RL$', '$\\frac{L}{R}$', '$\\frac{R}{L}$', '$\\sqrt{LC}$'], answer: 1, why: 'The current approaches its final value with time constant $\\tau = L/R$.' },
      },
    ],
  },
];
