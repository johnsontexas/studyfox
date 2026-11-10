// Reading & Writing (SAT) + English/Reading (ACT) generators built on the authored bank.
import { buildMC, esc, W as Wx } from '../util.js';
import { htmlTable } from '../figures.js';
import { VOCAB, TRANSITIONS, TRANSITION_WORDS, TRANSITION_EXPL, CONVENTIONS, PASSAGES, SYNTHESIS, QUANT_TOPICS } from '../content/rw-bank.js';
import { ACT_PASSAGES } from '../content/act-reading.js';

// Bank items may list why each wrong answer is wrong in `ww` (same order as `w`); shown after answering.
const whyWrong = (it) => (it.ww ? it.w.map((x, i) => (it.ww[i] ? Wx(x, it.ww[i]) : x)) : it.w);

export const rwGens = [];
const add = (g) => rwGens.push(g);

const BLANK = '<span class="blank">______</span>';
const withBlank = (t) => t.replace('______', BLANK);

function pickItem(r, bank, d) {
  const pool = bank.filter((i) => i.d === d);
  return r.pick(pool.length ? pool : bank);
}

// ACT English format: one option is shown underlined in the text; choice A is "NO CHANGE".
function actify(r, text, options, correctIdx, expl, stem) {
  const origIdx = r.chance(0.3) ? correctIdx : r.pick(options.map((_, i) => i).filter((i) => i !== correctIdx));
  const others = r.shuffle(options.map((_, i) => i).filter((i) => i !== origIdx));
  const choices = ['NO CHANGE', ...others.map((i) => options[i])];
  const answer = origIdx === correctIdx ? 0 : 1 + others.indexOf(correctIdx);
  return {
    passage: text.replace('______', `<u class="ul">${options[origIdx]}</u>`),
    stem: stem || 'Which choice is best for the underlined portion?',
    mc: { choices, answer },
    expl: (origIdx === correctIdx ? 'The underlined portion is already correct, so choose NO CHANGE. ' : '') + expl,
  };
}

function satBlankItem(r, it, q) {
  const opts = [it.a, ...it.w];
  return { passage: withBlank(esc(it.text)), stem: q, mc: buildMC(r, it.a, whyWrong(it)), expl: it.x, uid: 'bank:' + it.id };
}

add({
  key: 'rw.vocab',
  sat: { section: 'rw', domain: 'Craft and Structure', skill: 'Words in Context' },
  act: { section: 'english', domain: 'Knowledge of Language', skill: 'Precise word choice' },
  gen(r, d, test) {
    const it = pickItem(r, VOCAB, d);
    if (test === 'ACT') return { ...actify(r, esc(it.text), [it.a, ...it.w], 0, it.x, 'Which choice is the most precise and logical word for the underlined portion?'), uid: 'bank:' + it.id };
    return satBlankItem(r, it, 'Which choice completes the text with the most logical and precise word or phrase?');
  },
});

add({
  key: 'rw.transitions',
  sat: { section: 'rw', domain: 'Expression of Ideas', skill: 'Transitions' },
  act: { section: 'english', domain: 'Production of Writing', skill: 'Transitions' },
  gen(r, d, test) {
    const it = pickItem(r, TRANSITIONS, d);
    const correct = r.pick(TRANSITION_WORDS[it.rel]);
    const banned = { addition: ['similar', 'sequence'], similar: ['addition', 'sequence'], sequence: ['addition'] }[it.rel] || ['sequence'];
    const cats = r.shuffle(Object.keys(TRANSITION_WORDS).filter((k) => k !== it.rel && !banned.includes(k))).slice(0, 3);
    const wrong = cats.map((k) => r.pick(TRANSITION_WORDS[k]));
    const text = `${esc(it.s1)} ______, ${esc(it.s2)}`;
    const x = `${TRANSITION_EXPL[it.rel]} "${correct}" signals that relationship.`;
    if (test === 'ACT') return { ...actify(r, text, [correct, ...wrong], 0, x, 'Which choice provides the most logical transition?'), uid: 'bank:' + it.id };
    return { passage: withBlank(text), stem: 'Which choice completes the text with the most logical transition?', mc: buildMC(r, correct, wrong), expl: x, uid: 'bank:' + it.id };
  },
});

for (const [key, skill, actSkill] of [['rw.boundaries', 'Boundaries', 'Punctuation'], ['rw.form', 'Form, Structure, and Sense', 'Grammar and usage']]) {
  const bank = CONVENTIONS.filter((c) => c.skill === skill);
  add({
    key,
    sat: { section: 'rw', domain: 'Standard English Conventions', skill },
    act: { section: 'english', domain: 'Conventions of Standard English', skill: actSkill },
    gen(r, d, test) {
      const it = pickItem(r, bank, d);
      if (test === 'ACT') return { ...actify(r, esc(it.text), [it.a, ...it.w], 0, it.x), uid: 'bank:' + it.id };
      return satBlankItem(r, it, 'Which choice completes the text so that it conforms to the conventions of Standard English?');
    },
  });
}

const passageGen = (key, skill, satDomain, actDomain) => {
  const bank = PASSAGES.filter((p) => p.skill === skill);
  add({
    key,
    sat: { section: 'rw', domain: satDomain, skill },
    act: { section: 'reading', domain: actDomain, skill },
    gen(r, d) {
      const it = pickItem(r, bank, d);
      const passage = it.passage.startsWith('<p>') ? it.passage : `<p>${withBlank(it.passage)}</p>`;
      return { passage, stem: it.q, mc: buildMC(r, it.a, whyWrong(it)), expl: it.x, uid: 'bank:' + it.id };
    },
  });
};
passageGen('rw.central', 'Central Ideas and Details', 'Information and Ideas', 'Key Ideas and Details');
passageGen('rw.inference', 'Inferences', 'Information and Ideas', 'Key Ideas and Details');
passageGen('rw.evidence', 'Command of Evidence', 'Information and Ideas', 'Integration of Knowledge and Ideas');
passageGen('rw.structure', 'Text Structure and Purpose', 'Craft and Structure', 'Craft and Structure');
passageGen('rw.crosstext', 'Cross-Text Connections', 'Craft and Structure', 'Integration of Knowledge and Ideas');

add({
  key: 'rw.synthesis',
  sat: { section: 'rw', domain: 'Expression of Ideas', skill: 'Rhetorical Synthesis' },
  act: { section: 'english', domain: 'Production of Writing', skill: 'Purpose and focus' },
  gen(r, d) {
    const it = pickItem(r, SYNTHESIS, d);
    return {
      passage: `<p>While researching a topic, a student has taken the following notes:</p><ul class="notes">${it.notes.map((n) => `<li>${n}</li>`).join('')}</ul>`,
      stem: `The student wants to ${it.goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
      mc: buildMC(r, it.a, whyWrong(it)), expl: it.x, uid: 'bank:' + it.id,
    };
  },
});

add({
  key: 'rw.quant',
  sat: { section: 'rw', domain: 'Information and Ideas', skill: 'Command of Evidence (Quantitative)' },
  act: { section: 'reading', domain: 'Integration of Knowledge and Ideas', skill: 'Data in texts' },
  gen(r, d) {
    const t = r.pick(QUANT_TOPICS);
    const years = [2000, 2005, 2010, 2015, 2020];
    const A = [r.int(20, 40)];
    for (let i = 1; i < 5; i++) A.push(A[i - 1] + r.int(3, 9));
    const B = [A[0] + r.int(12, 22)];
    for (let i = 1; i < 5; i++) B.push(B[i - 1] - r.int(3, 8));
    if (B[4] >= A[4]) B[4] = A[4] - r.int(2, 6);
    const table = htmlTable({ caption: `${t.what[0].toUpperCase() + t.what.slice(1)} (${t.unit})`, head: ['Year', ...years], rows: [[t.a, ...A], [t.b, ...B]] });
    const variant = d >= 2 ? r.pick(['overtake', 'opposite']) : 'opposite';
    let claim, correct, wrong;
    if (variant === 'opposite') {
      claim = `${t.claim} rose steadily in ${t.a} over the period shown, while it declined in ${t.b}`;
      correct = `In ${t.a}, ${t.noun} rose from ${A[0]} in 2000 to ${A[4]} in 2020, while in ${t.b} it fell from ${B[0]} to ${B[4]}.`;
      wrong = [`${t.noun[0].toUpperCase() + t.noun.slice(1)} was higher in 2020 than in 2000 in both ${t.a} and ${t.b}.`, `In 2010, ${t.noun} was ${A[2]} in ${t.a} and ${B[2]} in ${t.b}.`, `${t.noun[0].toUpperCase() + t.noun.slice(1)} in ${t.b} was higher than in ${t.a} in every year shown.`];
    } else {
      claim = `although ${t.b} led ${t.a} in ${t.claim} at the start of the period, ${t.a} had overtaken ${t.b} by the end`;
      correct = `In 2000, ${t.noun} was ${B[0]} in ${t.b} compared with ${A[0]} in ${t.a}, but by 2020 it was ${A[4]} in ${t.a} and only ${B[4]} in ${t.b}.`;
      wrong = [`${t.noun[0].toUpperCase() + t.noun.slice(1)} in ${t.a} increased every five years from 2000 to 2020.`, `In 2000, ${t.noun} was ${A[0]} in ${t.a} compared with ${B[0]} in ${t.b}, and in 2005 it was ${A[1]} compared with ${B[1]}.`, `By 2020, ${t.noun} was ${B[4]} in ${t.a} and ${A[4]} in ${t.b}.`];
    }
    return {
      passage: `<p>A student is researching ${t.what} in two places and has compiled the data below.</p>${table}<p>The student claims that ${claim}.</p>`,
      stem: "Which choice most effectively uses data from the table to support the student's claim?",
      mc: buildMC(r, correct, wrong),
      expl: `The correct choice addresses both parts of the claim with accurate numbers from the table. The other choices are inaccurate or describe only part of the claim.`,
    };
  },
});

// ACT long passages: one registry entry per reporting category
for (const [key, cat] of [['actr.kid', 'Key Ideas and Details'], ['actr.cs', 'Craft and Structure'], ['actr.iki', 'Integration of Knowledge and Ideas']]) {
  const items = ACT_PASSAGES.flatMap((p) => p.qs.map((q, i) => ({ p, q, i }))).filter((x) => x.q.skill === cat);
  add({
    key, sat: null,
    act: { section: 'reading', domain: cat, skill: 'Long passage' },
    gen(r, d) {
      const pool = items.filter((x) => x.q.d === d);
      const { p, q, i } = r.pick(pool.length ? pool : items);
      return actPassageQ(r, p, q, i);
    },
  });
}

export function actPassagePassage(p) {
  return `<p class="pass-head"><b>${p.genre}:</b> “${p.title}” <span class="muted">(original passage)</span></p>${p.paras.map((t, n) => `<p><span class="pnum">${n + 1}</span>${esc(t)}</p>`).join('')}`;
}
export function actPassageQ(r, p, q, i) {
  return { passage: actPassagePassage(p), stem: q.q, mc: buildMC(r, q.a, whyWrong(q)), expl: q.x, uid: `bank:${p.id}-${i}`, group: p.id, domainOverride: q.skill, dOverride: q.d };
}
export { ACT_PASSAGES };
