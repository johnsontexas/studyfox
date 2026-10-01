// ACT Science: procedurally generated experiments (data shown as a table or graph)
// with question types covering the three ACT Science reporting categories.
import { rng, buildMC, numMC, round } from '../util.js';
import { svgLineChart, htmlTable } from '../figures.js';

const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;

const SCENARIOS = [
  (r) => {
    const b = [r1(0.6 + r.next() * 0.6), r1(0.1 + r.next() * 0.15), -r1(0.2 + r.next() * 0.2)];
    const a = [r.int(10, 30), r.int(30, 40), r.int(45, 60)];
    return {
      title: 'Solubility and Temperature', linear: true, display: r.pick(['table', 'graph']),
      intro: 'Students measured the solubility of three solid compounds (the maximum mass that dissolves in 100 g of water) at five temperatures. For each trial, the compound was added to 100 g of distilled water and stirred for 10 minutes.',
      xName: 'Temperature', xUnit: '°C', xs: [0, 20, 40, 60, 80],
      yName: 'Solubility', yUnit: 'g/100 g water',
      names: ['Compound X', 'Compound Y', 'Compound Z'],
      f: (s, x) => r1(a[s] + b[s] * x),
      indep: 'Temperature of the water', dep: 'Solubility of the compound', controlled: 'Mass of water used in each trial', seriesVar: 'Type of compound',
    };
  },
  (r) => {
    const noise = [0, r.pick([0, 0.01, -0.01])];
    return {
      title: 'Pendulum Period', linear: false, display: 'table',
      intro: 'A student built a pendulum from a string and a metal bob. The student released the bob from an angle of 10° and measured the period (the time for one complete back-and-forth swing) for five string lengths, using two bobs of different mass.',
      xName: 'String length', xUnit: 'm', xs: [0.25, 0.5, 1.0, 1.5, 2.0],
      yName: 'Period', yUnit: 's',
      names: ['50 g bob', '200 g bob'],
      f: (s, x) => r2(2.006 * Math.sqrt(x) + (x === 1.0 ? noise[s] : 0)),
      indep: 'Length of the string', dep: 'Period of the pendulum', controlled: 'Release angle of the bob', seriesVar: 'Mass of the bob',
      massEffect: true,
    };
  },
  (r) => {
    const p = [r.int(2, 4), r.int(7, 9)], k = [r.int(5, 9), r.int(5, 9)];
    return {
      title: 'Enzyme Activity and pH', linear: false, display: 'graph',
      intro: 'Researchers measured the activity of two digestive enzymes at several pH values. Each trial used the same concentration of enzyme and substrate at 37°C. Activity is reported as a percent of each enzyme\'s maximum observed activity.',
      xName: 'pH', xUnit: '', xs: [1, 3, 5, 7, 9, 11],
      yName: 'Relative activity', yUnit: '%',
      names: ['Enzyme 1', 'Enzyme 2'],
      f: (s, x) => Math.max(0, Math.round(100 - k[s] * (x - p[s]) ** 2)),
      indep: 'pH of the solution', dep: 'Relative activity of the enzyme', controlled: 'Temperature of the solution', seriesVar: 'Type of enzyme',
    };
  },
  (r) => {
    const rate = [r1(0.6 + r.next() * 0.3), r1(0.9 + r.next() * 0.3), r1(0.2 + r.next() * 0.2)];
    return {
      title: 'Plant Growth Under Colored Light', linear: true, display: r.pick(['table', 'graph']),
      intro: 'A biology class grew bean seedlings under three colors of light of equal intensity. Each group of seedlings received the same amount of water and soil. The average height of each group was recorded every 5 days.',
      xName: 'Day', xUnit: '', xs: [0, 5, 10, 15, 20],
      yName: 'Average height', yUnit: 'cm',
      names: ['Red light', 'Blue light', 'Green light'],
      f: (s, x) => r1(2 + rate[s] * x),
      indep: 'Color of light', dep: 'Average height of the seedlings', controlled: 'Amount of water given to each group', seriesVar: 'Number of days of growth',
      colorIndep: true,
    };
  },
  (r) => {
    const k = r.shuffle([10, 20, 25, 40, 50]).slice(0, 3).sort((a, b) => a - b);
    return {
      title: 'Spring Stretch', linear: true, display: r.pick(['table', 'graph']),
      intro: 'Students hung masses from three different springs and measured how far each spring stretched from its resting length. Each spring was tested at room temperature and allowed to stop moving before it was measured.',
      xName: 'Mass', xUnit: 'g', xs: [0, 50, 100, 150, 200],
      yName: 'Stretch', yUnit: 'cm',
      names: ['Spring A', 'Spring B', 'Spring C'],
      f: (s, x) => r1(x / k[s]),
      indep: 'Mass hung from the spring', dep: 'Stretch of the spring', controlled: 'Temperature of the room', seriesVar: 'Type of spring',
    };
  },
  (r) => {
    const C = [r.int(10, 14) * 100, r.int(15, 19) * 100];
    return {
      title: 'Gas Pressure and Volume', linear: false, display: r.pick(['table', 'graph']),
      intro: 'A sealed syringe containing a fixed amount of air was connected to a pressure sensor. A student changed the volume of the syringe and recorded the pressure at two different temperatures.',
      xName: 'Volume', xUnit: 'mL', xs: [10, 20, 30, 40, 50],
      yName: 'Pressure', yUnit: 'kPa',
      names: ['20°C', '60°C'],
      f: (s, x) => r1(C[s] / x),
      indep: 'Volume of the syringe', dep: 'Pressure of the gas', controlled: 'Amount of air in the syringe', seriesVar: 'Temperature of the gas',
    };
  },
];

function buildScenario(seed) {
  const r = rng(seed);
  const idx = r.int(0, SCENARIOS.length - 1);
  const sc = SCENARIOS[idx](r);
  sc.values = sc.names.map((_, s) => sc.xs.map((x) => sc.f(s, x)));
  const u = (unit) => (unit ? ` (${unit})` : '');
  const fig = sc.display === 'table'
    ? htmlTable({ caption: 'Table 1', head: [`${sc.xName}${u(sc.xUnit)}`, ...sc.names.map((n) => `${n}: ${sc.yName.toLowerCase()}${u(sc.yUnit)}`)], rows: sc.xs.map((x, j) => [x, ...sc.values.map((v) => v[j])]) })
    : svgLineChart({ xs: sc.xs, series: sc.names.map((n, s) => ({ name: n, values: sc.values[s] })), xLabel: `${sc.xName}${u(sc.xUnit)}`, yLabel: `${sc.yName}${u(sc.yUnit)}`, title: 'Figure 1' });
  sc.src = sc.display === 'table' ? 'Table 1' : 'Figure 1';
  sc.passage = `<p class="pass-head"><b>Passage:</b> ${sc.title}</p><p>${sc.intro}</p>${fig}`;
  sc.xv = (x) => `${x}${sc.xUnit ? (sc.xUnit === '°C' ? '°C' : ' ' + sc.xUnit) : ''}`.replace(/^(\d)/, sc.xName === 'pH' ? 'pH $1' : sc.xName === 'Day' ? 'Day $1' : '$1');
  sc.yv = (y) => `${y} ${sc.yUnit}`.trim();
  return sc;
}

function trendOf(vals) {
  const diffs = vals.slice(1).map((v, i) => Math.sign(r2(v - vals[i])));
  if (diffs.every((d) => d === 0)) return 'remained the same';
  if (diffs.every((d) => d >= 0)) return 'increased only';
  if (diffs.every((d) => d <= 0)) return 'decreased only';
  const firstDown = diffs.indexOf(-1), lastUp = diffs.lastIndexOf(1);
  if (lastUp < firstDown) return 'increased and then decreased';
  return 'decreased and then increased';
}

const Q = {
  read: { d: 1, cat: 'data', make(r, sc) {
    const s = r.int(0, sc.names.length - 1), j = r.int(0, sc.xs.length - 1), v = sc.values[s][j];
    const others = sc.values.flat().filter((x) => x !== v);
    return {
      stem: `According to ${sc.src}, when the ${sc.xName.toLowerCase()} was ${sc.xv(sc.xs[j])}, the ${sc.yName.toLowerCase()} for ${sc.names[s]} was closest to:`,
      mc: numMC(r, v, r.shuffle(others), { fmt: sc.yv, step: Math.max(0.1, r1(Math.abs(v) / 8) || 1) }),
      expl: `Find ${sc.xv(sc.xs[j])} on the ${sc.display === 'table' ? 'table' : "graph's horizontal axis"} and read the value for ${sc.names[s]}: ${sc.yv(v)}.`,
    };
  } },
  trend: { d: 1, cat: 'data', make(r, sc) {
    const s = r.int(0, sc.names.length - 1), t = trendOf(sc.values[s]);
    const base = ['increased only', 'decreased only', 'increased and then decreased', 'remained the same'];
    if (!base.includes(t)) base[3] = t;
    return {
      stem: `According to ${sc.src}, as the ${sc.xName.toLowerCase()} increased, the ${sc.yName.toLowerCase()} for ${sc.names[s]}:`,
      mc: buildMC(r, t, base.filter((b) => b !== t), null, { keepOrder: false }),
      expl: `Reading ${sc.names[s]} from left to right: ${sc.values[s].join(', ')}. The values ${t}.`,
    };
  } },
  max: { d: 1, cat: 'data', make(r, sc) {
    if (sc.massEffect) return Q.mass.make(r, sc);
    const j = r.int(1, sc.xs.length - 1);
    const col = sc.values.map((v) => v[j]);
    const hi = Math.max(...col);
    if (col.filter((v) => v === hi).length > 1) return Q.read.make(r, sc);
    const best = sc.names[col.indexOf(hi)];
    return {
      stem: `Based on ${sc.src}, at ${sc.xv(sc.xs[j])}, which of the following had the greatest ${sc.yName.toLowerCase()}?`,
      mc: buildMC(r, best, [...sc.names.filter((n) => n !== best), 'All were equal', 'It cannot be determined from the data']),
      expl: `At ${sc.xv(sc.xs[j])} the values are ${sc.names.map((n, i) => `${n}: ${col[i]}`).join('; ')}. The greatest is ${best}.`,
    };
  } },
  mass: { d: 2, cat: 'eval', make(r, sc) {
    return {
      stem: `Based on ${sc.src}, how did changing the mass of the bob from 50 g to 200 g affect the period of the pendulum?`,
      mc: buildMC(r, 'It had little or no effect on the period.', ['It increased the period at every length.', 'It decreased the period at every length.', 'It doubled the period at every length.']),
      expl: 'At each string length, the periods for the two bobs are the same (or differ by at most 0.01 s, within measurement error). Mass has essentially no effect on period.',
    };
  } },
  interp: { d: 2, cat: 'data', make(r, sc) {
    for (let tries = 0; tries < 20; tries++) {
      const s = r.int(0, sc.names.length - 1), j = r.int(0, sc.xs.length - 2);
      const a = sc.values[s][j], b = sc.values[s][j + 1];
      if (a === b) continue;
      const xm = (sc.xs[j] + sc.xs[j + 1]) / 2, ym = sc.f(s, xm);
      const lo = Math.min(a, b), hi = Math.max(a, b);
      if (!(ym > lo && ym < hi)) continue;
      const step = r1(hi - lo) || 1;
      const c = `Between ${sc.yv(lo)} and ${sc.yv(hi)}`;
      return {
        stem: `Based on ${sc.src}, if the experiment had been done with ${sc.names[s]} at ${sc.xv(round(xm, 3))}, the ${sc.yName.toLowerCase()} would most likely have been:`,
        mc: { choices: [`Less than ${sc.yv(lo)}`, c, `Between ${sc.yv(hi)} and ${sc.yv(r1(hi + step))}`, `Greater than ${sc.yv(r1(hi + step))}`], answer: 1 },
        expl: `${sc.xv(round(xm, 3))} lies between ${sc.xv(sc.xs[j])} and ${sc.xv(sc.xs[j + 1])}, where ${sc.names[s]} had values ${a} and ${b}. Since the trend is steady there, the value should fall between them.`,
      };
    }
    return Q.read.make(r, sc);
  } },
  compare: { d: 2, cat: 'data', make(r, sc) {
    const [s1, s2] = r.sample(sc.names.map((_, i) => i), 2).sort();
    const diffs = sc.xs.map((_, j) => Math.abs(sc.values[s1][j] - sc.values[s2][j]));
    const mx = Math.max(...diffs);
    if (diffs.filter((d) => d === mx).length > 1 || mx === 0) return Q.trend.make(r, sc);
    const jBest = diffs.indexOf(mx);
    const opts = sc.xs.map(sc.xv);
    return {
      stem: `According to ${sc.src}, at which ${sc.xName.toLowerCase()} was the difference in ${sc.yName.toLowerCase()} between ${sc.names[s1]} and ${sc.names[s2]} the greatest?`,
      mc: buildMC(r, opts[jBest], opts.filter((_, j) => j !== jBest)),
      expl: `Differences: ${sc.xs.map((x, j) => `${sc.xv(x)}: ${r1(diffs[j])}`).join('; ')}. The greatest difference is at ${opts[jBest]}.`,
    };
  } },
  design: { d: 2, cat: 'invest', make(r, sc) {
    const which = r.pick(['indep', 'controlled']);
    const correct = which === 'indep' ? sc.indep : sc.controlled;
    return {
      stem: which === 'indep' ? `In this experiment, which of the following was an independent variable (a variable deliberately changed by the experimenters)?` : `Which of the following was kept the same in every trial of this experiment?`,
      mc: buildMC(r, correct, [sc.dep, which === 'indep' ? sc.controlled : sc.indep, which === 'indep' ? 'The date of each trial' : sc.seriesVar].filter((x) => x !== correct)),
      expl: which === 'indep' ? `The experimenters chose and changed the ${sc.indep.toLowerCase()}; the ${sc.dep.toLowerCase()} was measured (dependent variable).` : `The passage says the ${sc.controlled.toLowerCase()} was the same in every trial, making it a controlled variable.`,
    };
  } },
  extrap: { d: 3, cat: 'eval', make(r, sc) {
    if (!sc.linear) return Q.hyp.make(r, sc);
    const s = r.int(0, sc.names.length - 1);
    const step = sc.xs[1] - sc.xs[0], xn = sc.xs[sc.xs.length - 1] + step, v = sc.f(s, xn);
    const inc = r1(Math.abs(sc.values[s][1] - sc.values[s][0])) || 1;
    return {
      stem: `If the pattern in ${sc.src} continues, the ${sc.yName.toLowerCase()} for ${sc.names[s]} at ${sc.xv(xn)} would be closest to:`,
      mc: numMC(r, v, [v + inc, v - inc, v + 2 * inc, sc.values[s][sc.xs.length - 1]], { fmt: sc.yv, step: inc }),
      expl: `${sc.names[s]} changes by about ${inc} ${sc.yUnit} for every ${step}${sc.xUnit ? ' ' + sc.xUnit : ''}. Extending one more step past ${sc.values[s][sc.xs.length - 1]} gives about ${v}.`,
    };
  } },
  hyp: { d: 3, cat: 'eval', make(r, sc) {
    if (sc.names.length < 2 || sc.massEffect) return Q.mass.make(r, sc);
    const [s1, s2] = r.sample(sc.names.map((_, i) => i), 2);
    const A = sc.values[s1], B = sc.values[s2];
    const always = A.every((v, j) => v > B[j]);
    const counter = A.findIndex((v, j) => v <= B[j]);
    const N1 = sc.names[s1], N2 = sc.names[s2], y = sc.yName.toLowerCase();
    let correct, wrong;
    if (always) {
      correct = `Yes; at every ${sc.xName.toLowerCase()} tested, ${N1} had a greater ${y} than ${N2}.`;
      wrong = [`Yes; ${N1} had a greater ${y} than ${N2} at only some of the values tested.`, `No; at every ${sc.xName.toLowerCase()} tested, ${N1} had a lower ${y} than ${N2}.`, `No; at ${sc.xv(sc.xs[0])}, ${N2} had a greater ${y} than ${N1}.`];
    } else {
      correct = `No; at ${sc.xv(sc.xs[counter])}, ${N1} did not have a greater ${y} than ${N2}.`;
      wrong = [`Yes; at every ${sc.xName.toLowerCase()} tested, ${N1} had a greater ${y} than ${N2}.`, `Yes; ${N1} had the greatest ${y} of any trial in the experiment.`, `No; ${N1} had a lower ${y} than ${N2} at every ${sc.xName.toLowerCase()} tested.`];
      if (A.every((v, j) => v < B[j])) wrong[2] = `No; ${N1} and ${N2} had equal ${y} values at every ${sc.xName.toLowerCase()} tested.`;
    }
    return {
      stem: `A student predicted that ${N1} would have a greater ${y} than ${N2} at every ${sc.xName.toLowerCase()} tested. Do the data in ${sc.src} support this prediction?`,
      mc: buildMC(r, correct, wrong),
      expl: `Compare the two rows value by value: ${N1}: ${A.join(', ')}; ${N2}: ${B.join(', ')}. ${always ? 'The prediction holds at every point.' : `At ${sc.xv(sc.xs[counter])} it fails (${A[counter]} vs. ${B[counter]}).`}`,
    };
  } },
};

const CAT = { data: 'Interpretation of Data', invest: 'Scientific Investigation', eval: 'Evaluation of Models, Inferences, and Experimental Results' };
const typesFor = (cat) => Object.entries(Q).filter(([, q]) => q.cat === cat).map(([k]) => k);

export function scienceQuestion(scSeed, type, qSeed) {
  const sc = buildScenario(scSeed);
  const r = rng(qSeed);
  const out = Q[type].make(r, sc);
  return { ...out, passage: sc.passage, group: 'sci' + scSeed, dOverride: Q[type].d, domainOverride: CAT[Q[type].cat] };
}
// Ordered set of question types for one science passage in a full test
export const SCIENCE_SET = ['read', 'trend', 'max', 'interp', 'compare', 'design', 'extrap', 'hyp'];

export const scienceGens = Object.entries(CAT).map(([cat, domain]) => ({
  key: 'sci.' + cat, sat: null,
  act: { section: 'science', domain, skill: domain },
  gen(r, d) {
    const types = typesFor(cat);
    const pool = types.filter((t) => Q[t].d === d);
    const type = r.pick(pool.length ? pool : types);
    return scienceQuestion(r.int(1, 2 ** 30), type, r.int(1, 2 ** 30));
  },
}));
