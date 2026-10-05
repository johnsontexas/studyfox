// Procedural math question generators. Each gen(r, d, test) returns
// { stem, mc:{choices,answer}, spr?:{accept:[...], display}, expl, figure? }
import { buildMC, numMC, fracTex, frac, poly, money, num, tnum, T, gcd } from '../util.js';
import { svgScatter, svgRightTri } from '../figures.js';

export const mathGens = [];
const add = (g) => mathGens.push({ section: 'math', ...g });

const piTex = (n, d = 1) => {
  const f = frac(n, d);
  if (f.d === 1) return f.n === 1 ? '\\pi' : `${f.n}\\pi`;
  return `\\frac{${f.n === 1 ? '' : f.n}\\pi}{${f.d}}`;
};
const fac = (rt) => (rt === 0 ? 'x' : `(x ${rt < 0 ? '+' : '-'} ${Math.abs(rt)})`);
const sqrtTex = (k, rad) => (k === 1 ? `\\sqrt{${rad}}` : `${k}\\sqrt{${rad}}`);
const cx = (a, b) => {
  if (b === 0) return String(a);
  const bi = Math.abs(b) === 1 ? 'i' : `${Math.abs(b)}i`;
  if (a === 0) return (b < 0 ? '-' : '') + bi;
  return `${a} ${b < 0 ? '-' : '+'} ${bi}`;
};
const mat = (a, b, c, d) => `\\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}`;
const sys = (l1, r1, l2, r2) => `<div class="eq">${T(`\\begin{aligned} ${l1} &= ${r1} \\\\ ${l2} &= ${r2} \\end{aligned}`)}</div>`;
const eq = (s) => `<div class="eq">${T(s)}</div>`;
const spr = (v, display) => ({ accept: [v], display: display ?? String(v) });

// ======================= ALGEBRA =======================
add({
  key: 'alg.linear-eq',
  sat: { domain: 'Algebra', skill: 'Linear equations in one variable' },
  act: { domain: 'Algebra', skill: 'Linear equations' },
  gen(r, d) {
    if (d === 1) {
      const x = r.int(-9, 12), a = r.int(2, 9), b = r.nz(-20, 20), c = a * x + b;
      return {
        stem: `If ${T(`${poly([[a, 'x'], [b, '']])} = ${c}`)}, what is the value of ${T('x')}?`,
        mc: numMC(r, x, [(c + b) / a, c - b, -x, x + Math.sign(b)]),
        spr: spr(x),
        expl: `${b > 0 ? 'Subtract' : 'Add'} ${T(Math.abs(b))} ${b > 0 ? 'from' : 'to'} both sides: ${T(`${a}x = ${c - b}`)}. Divide both sides by ${T(a)}: ${T(`x = ${x}`)}.`,
      };
    }
    if (d === 2) {
      const x = r.int(-8, 10), a = r.int(2, 7), b = r.nz(-9, 9);
      let c; do c = r.int(1, 9); while (c === a);
      const e = a * (x + b) - c * x;
      const bad = (e - b) / (a - c);
      return {
        stem: `${eq(`${a}(x ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = ${poly([[c, 'x'], [e, '']])}`)}What value of ${T('x')} is the solution to the equation above?`,
        mc: numMC(r, x, [bad, -x, (e + a * b) / (a - c), x + 2]),
        spr: spr(x),
        expl: `Distribute: ${T(`${poly([[a, 'x'], [a * b, '']])} = ${poly([[c, 'x'], [e, '']])}`)}. Collect ${T('x')} terms: ${T(`${a - c}x = ${e - a * b}`)}, so ${T(`x = ${x}`)}. A common mistake is forgetting to multiply ${T(b)} by ${T(a)}.`,
      };
    }
    // hard: x/p + x/q = k
    let p = r.int(2, 9), q; do q = r.int(2, 9); while (q === p);
    const L = (p * q) / gcd(p, q);
    const x = L * r.int(1, 4), k = x / p + x / q;
    return {
      stem: `${eq(`\\frac{x}{${p}} + \\frac{x}{${q}} = ${k}`)}What is the value of ${T('x')} in the equation above?`,
      mc: numMC(r, x, [k * (p + q), k * p * q, (k * (p + q)) / 2, x + L]),
      spr: spr(x), preferSpr: true,
      expl: `Multiply both sides by ${T(p * q)} to clear the fractions: ${T(`${q}x + ${p}x = ${k * p * q}`)}, so ${T(`${p + q}x = ${k * p * q}`)} and ${T(`x = ${x}`)}.`,
    };
  },
});

const LIN_CTX = [
  { intro: (m, b) => `A plumber charges a one-time service fee plus an hourly rate. The total cost ${T('C')}, in dollars, for a job lasting ${T('h')} hours is given by`, y: 'C', x: 'h', up: true, m: [45, 95], b: [40, 120], yUnit: 'dollars', xUnit: 'hours',
    rate: 'The amount, in dollars, charged per hour of work', fixed: 'The one-time service fee, in dollars', wrong: ['The total cost, in dollars, of a one-hour job', 'The number of hours needed to complete a job'], money: true, noun: 'job' },
  { intro: () => `A tank is being drained at a constant rate. The volume ${T('V')}, in gallons, of water remaining in the tank ${T('t')} minutes after draining began is given by`, y: 'V', x: 't', up: false, m: [12, 40], b: [600, 1200], yUnit: 'gallons', xUnit: 'minutes',
    rate: 'The number of gallons drained from the tank each minute', fixed: 'The number of gallons in the tank when draining began', wrong: ['The number of minutes needed to drain the tank', 'The number of gallons remaining after one minute'] },
  { intro: () => `A phone plan charges a fixed monthly fee plus a charge for each gigabyte of data used. The monthly cost ${T('C')}, in dollars, for ${T('g')} gigabytes of data is given by`, y: 'C', x: 'g', up: true, m: [3, 12], b: [15, 45], yUnit: 'dollars', xUnit: 'gigabytes',
    rate: 'The cost, in dollars, per gigabyte of data used', fixed: 'The fixed monthly fee, in dollars', wrong: ['The monthly cost, in dollars, when 1 gigabyte is used', 'The number of gigabytes included in the plan'], money: true, noun: 'month' },
  { intro: () => `A candle burns at a constant rate. Its height ${T('H')}, in millimeters, ${T('t')} hours after it was lit is given by`, y: 'H', x: 't', up: false, m: [4, 15], b: [150, 300], yUnit: 'millimeters', xUnit: 'hours',
    rate: "The number of millimeters the candle's height decreases each hour", fixed: 'The height, in millimeters, of the candle before it was lit', wrong: ['The number of hours it takes the candle to burn completely', 'The height, in millimeters, of the candle after 1 hour'] },
  { intro: () => `A student deposits the same amount into a savings account every week. The balance ${T('S')}, in dollars, after ${T('w')} weeks is given by`, y: 'S', x: 'w', up: true, m: [15, 60], b: [50, 400], yUnit: 'dollars', xUnit: 'weeks',
    rate: 'The amount, in dollars, deposited each week', fixed: 'The balance, in dollars, in the account before the weekly deposits began', wrong: ['The balance, in dollars, after one week', 'The number of weeks the student has been saving'], money: true },
];
add({
  key: 'alg.linear-model',
  sat: { domain: 'Algebra', skill: 'Linear functions' },
  act: { domain: 'Functions', skill: 'Linear models' },
  gen(r, d) {
    const c = r.pick(LIN_CTX);
    const m = r.int(c.m[0], c.m[1]), b = r.int(c.b[0], c.b[1]);
    const model = c.up ? `${c.y} = ${m}${c.x} + ${b}` : `${c.y} = ${b} - ${m}${c.x}`;
    const f = (x) => (c.up ? m * x + b : b - m * x);
    if (d === 1) {
      const askFixed = r.chance(0.5);
      const correct = askFixed ? c.fixed : c.rate;
      return {
        stem: `${c.intro(m, b)}${eq(model)}What is the best interpretation of ${T(askFixed ? b : m)} in this context?`,
        mc: buildMC(r, correct, [askFixed ? c.rate : c.fixed, ...c.wrong]),
        expl: askFixed
          ? `${T(b)} is the value of ${T(c.y)} when ${T(`${c.x} = 0`)}, so it is the starting value: ${c.fixed.toLowerCase()}.`
          : `${T(m)} is the rate of change: each additional unit of ${T(c.x)} ${c.up ? 'adds' : 'subtracts'} ${T(m)} ${c.yUnit}. So it is ${c.rate.toLowerCase()}.`,
      };
    }
    if (d === 2) {
      const x0 = r.int(3, 12);
      const y0 = f(x0);
      if (y0 <= 0) return this.gen(r, 1);
      const inverse = r.chance(0.5);
      if (inverse) {
        return {
          stem: `${c.intro(m, b)}${eq(model)}According to the model, what is the value of ${T(c.x)} when ${T(`${c.y} = ${y0}`)}?`,
          mc: numMC(r, x0, [Math.round(y0 / m), x0 + 1, x0 - 1, Math.round((y0 + b) / m)]),
          spr: spr(x0),
          expl: `Substitute ${T(y0)} for ${T(c.y)}: ${T(c.up ? `${y0} = ${m}${c.x} + ${b}` : `${y0} = ${b} - ${m}${c.x}`)}. Solving gives ${T(`${c.x} = ${x0}`)}.`,
        };
      }
      return {
        stem: `${c.intro(m, b)}${eq(model)}According to the model, what is the value of ${T(c.y)} when ${T(`${c.x} = ${x0}`)}?`,
        mc: numMC(r, y0, [m * x0, c.up ? b - m * x0 : b + m * x0, (m + b) * x0, y0 + m], { spread: 4, step: m }),
        spr: spr(y0),
        expl: `Substitute ${T(x0)} for ${T(c.x)}: ${T(c.up ? `${m}(${x0}) + ${b} = ${y0}` : `${b} - ${m}(${x0}) = ${y0}`)}.`,
      };
    }
    // hard: two data points -> starting value
    const x1 = r.int(1, 4), x2 = x1 + r.int(2, 6);
    const y1 = f(x1), y2 = f(x2);
    if (y2 <= 0) return this.gen(r, 2);
    const unitY = c.money ? (v) => money(v) : (v) => `${num(v)} ${c.yUnit}`;
    return {
      stem: `${c.intro(m, b).replace(/ is given by$/, ' is a linear function of ' + T(c.x) + '.')} When ${T(`${c.x} = ${x1}`)}, ${T(c.y)} is ${unitY(y1)}, and when ${T(`${c.x} = ${x2}`)}, ${T(c.y)} is ${unitY(y2)}. What is the value of ${T(c.y)} when ${T(`${c.x} = 0`)}?`,
      mc: numMC(r, b, [y1 - m, y1, Math.abs(y2 - y1), b + m], { spread: 5, step: m }),
      spr: spr(b), preferSpr: true,
      expl: `The rate of change is ${T(`\\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${c.up ? m : -m}`)}. Work back ${T(x1)} units from ${T(`(${x1}, ${y1})`)}: ${T(`${y1} ${c.up ? '-' : '+'} ${m}(${x1}) = ${b}`)}.`,
    };
  },
});

add({
  key: 'alg.systems',
  sat: { domain: 'Algebra', skill: 'Systems of two linear equations in two variables' },
  act: { domain: 'Algebra', skill: 'Systems of equations' },
  gen(r, d) {
    if (d === 1) {
      const x = r.int(-5, 12), y = r.int(-5, 12);
      const s = x + y, t = x - y;
      return {
        stem: `${sys('x + y', s, 'x - y', t)}If ${T('(x, y)')} is the solution to the system of equations above, what is the value of ${T('x')}?`,
        mc: numMC(r, x, [y, s, t, (s + t)]),
        spr: spr(x),
        expl: `Add the equations to eliminate ${T('y')}: ${T(`2x = ${s + t}`)}, so ${T(`x = ${x}`)}.`,
      };
    }
    if (d === 2) {
      let a1, b1, a2, b2;
      do { a1 = r.nz(-5, 6); b1 = r.nz(-5, 6); a2 = r.nz(-5, 6); b2 = r.nz(-5, 6); } while (a1 * b2 - a2 * b1 === 0);
      const x = r.int(-6, 8), y = r.int(-6, 8);
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      const ask = r.pick(['x', 'y', 'x + y']);
      const val = ask === 'x' ? x : ask === 'y' ? y : x + y;
      return {
        stem: `${sys(poly([[a1, 'x'], [b1, 'y']]), c1, poly([[a2, 'x'], [b2, 'y']]), c2)}The solution to the given system of equations is ${T('(x, y)')}. What is the value of ${T(ask)}?`,
        mc: numMC(r, val, [ask === 'x' ? y : x, x - y, -val, val + 2]),
        spr: spr(val),
        expl: `Solving by elimination or substitution gives ${T(`x = ${x}`)} and ${T(`y = ${y}`)}${ask === 'x + y' ? `, so ${T(`x + y = ${x + y}`)}` : ''}. Check: ${T(`${poly([[a1, 'x'], [b1, 'y']]).replace('x', `(${x})`).replace('y', `(${y})`)} = ${c1}`)}.`,
      };
    }
    // hard: no solution / infinitely many
    const a = r.nz(-6, 7), b = r.nz(2, 7) * r.sign(), c = r.nz(-15, 15), m = r.pick([2, 3, 4, -2, -3]);
    if (r.chance(0.5)) {
      const e = m * c + r.nz(-6, 6);
      return {
        stem: `${sys(poly([[a, 'x'], [b, 'y']]), c, `kx ${m * b < 0 ? '-' : '+'} ${Math.abs(m * b)}y`, e)}In the given system of equations, ${T('k')} is a constant. If the system has no solution, what is the value of ${T('k')}?`,
        mc: numMC(r, m * a, [a, -m * a, m * b, m * c]),
        spr: spr(m * a), preferSpr: true,
        expl: `A system of two linear equations has no solution when the lines are parallel: the ${T('x')}- and ${T('y')}-coefficients are proportional but the constants are not. The ${T('y')}-coefficient was multiplied by ${T(m)} (${T(`${b} \\to ${m * b}`)}), so ${T(`k = ${m}(${a}) = ${m * a}`)}. The constants ${T(`${m}(${c}) = ${m * c}`)} and ${T(e)} differ, confirming no solution.`,
      };
    }
    return {
      stem: `${sys(poly([[a, 'x'], [b, 'y']]), c, poly([[m * a, 'x'], [m * b, 'y']]), 'k')}In the given system of equations, ${T('k')} is a constant. If the system has infinitely many solutions, what is the value of ${T('k')}?`,
      mc: numMC(r, m * c, [c, -m * c, m * c + m, m + c]),
      spr: spr(m * c), preferSpr: true,
      expl: `The second equation's left side is ${T(m)} times the first equation's. For infinitely many solutions the equations must be identical, so ${T(`k = ${m}(${c}) = ${m * c}`)}.`,
    };
  },
});

add({
  key: 'alg.inequality',
  sat: { domain: 'Algebra', skill: 'Linear inequalities in one or two variables' },
  act: { domain: 'Algebra', skill: 'Inequalities' },
  gen(r, d) {
    if (d === 1) {
      const a = r.int(2, 8), B = r.int(-6, 10), b = r.nz(-15, 15), c = a * B + b;
      const gt = r.chance(0.5);
      const correct = gt ? B + r.int(1, 4) : B - r.int(1, 4);
      const wrongs = gt ? [B, B - 1, B - 3, B - 6] : [B, B + 1, B + 3, B + 6];
      return {
        stem: `Which of the following values of ${T('x')} satisfies the inequality ${T(`${poly([[a, 'x'], [b, '']])} ${gt ? '>' : '<'} ${c}`)}?`,
        mc: numMC(r, correct, wrongs),
        expl: `Solve: ${T(`${a}x ${gt ? '>' : '<'} ${c - b}`)}, so ${T(`x ${gt ? '>' : '<'} ${B}`)}. Only ${T(correct)} satisfies this. Note that ${T(B)} itself does not, because the inequality is strict.`,
      };
    }
    if (d === 2) {
      const W = r.pick([1500, 2000, 2500, 3000]), w1 = r.int(150, 240), bx = r.pick([35, 40, 45, 55, 60, 65, 70]);
      const ans = Math.floor((W - w1) / bx);
      return {
        stem: `A freight elevator can carry a maximum of ${num(W)} pounds. A worker who weighs ${w1} pounds is loading boxes that each weigh ${bx} pounds. What is the maximum number of boxes the worker can bring on the elevator in one trip with the worker also on board?`,
        mc: numMC(r, ans, [Math.ceil((W - w1) / bx), Math.floor(W / bx), Math.floor((W + w1) / bx), ans - 2]),
        spr: spr(ans), preferSpr: true,
        expl: `Write ${T(`${w1} + ${bx}n \\le ${W}`)}, so ${T(`n \\le \\frac{${W - w1}}{${bx}} \\approx ${((W - w1) / bx).toFixed(2)}`)}. Since ${T('n')} must be a whole number, the maximum is ${T(ans)}.`,
      };
    }
    const pa = r.pick([12, 15, 18, 20]), ps = r.pick([6, 7, 8, 9]), R = r.pick([2400, 3000, 3600, 4500]), N = r.int(60, 110);
    const ans = Math.ceil((R - N * pa) / ps);
    if (ans <= 0) return this.gen(r, 2);
    return {
      stem: `A theater club sells adult tickets for ${money(pa)} each and student tickets for ${money(ps)} each. The club wants to raise at least ${money(R)}. If the club has sold ${N} adult tickets, what is the minimum number of student tickets it must sell to reach its goal?`,
      mc: numMC(r, ans, [Math.floor((R - N * pa) / ps), Math.ceil(R / ps), ans + ps, Math.ceil((R - N * ps) / pa)]),
      spr: spr(ans), preferSpr: true,
      expl: `Write ${T(`${pa}(${N}) + ${ps}s \\ge ${R}`)}. Then ${T(`${ps}s \\ge ${R - N * pa}`)}, so ${T(`s \\ge ${((R - N * pa) / ps).toFixed(2)}`)}. Round up to the next whole ticket: ${T(ans)}.`,
    };
  },
});

add({
  key: 'alg.slope',
  sat: { domain: 'Algebra', skill: 'Linear equations in two variables' },
  act: { domain: 'Functions', skill: 'Slope and lines' },
  gen(r, d) {
    if (d === 1) {
      const x1 = r.int(-6, 6), y1 = r.int(-6, 6), dx = r.nz(-6, 6), dy = r.nz(-9, 9);
      const x2 = x1 + dx, y2 = y1 + dy;
      const correct = T(fracTex(dy, dx));
      return {
        stem: `What is the slope of the line that passes through the points ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)} in the ${T('xy')}-plane?`,
        mc: buildMC(r, correct, [T(fracTex(dx, dy)), T(fracTex(-dy, dx)), x1 + x2 !== 0 ? T(fracTex(y1 + y2, x1 + x2)) : null, T(fracTex(-dx, dy))], () => T(fracTex(dy + r.nz(-3, 3), dx))),
        spr: { accept: [dy / dx], display: fracTex(dy, dx).includes('frac') ? `${frac(dy, dx).n}/${frac(dy, dx).d}` : String(dy / dx) },
        expl: `Slope ${T(`= \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${dy}}{${dx}} = ${fracTex(dy, dx)}`)}.`,
      };
    }
    if (d === 2) {
      const m = r.nz(-5, 5), p = r.nz(-6, 6), q = r.int(-10, 10), b = q - m * p;
      return {
        stem: `A line in the ${T('xy')}-plane has a slope of ${T(m)} and passes through the point ${T(`(${p}, ${q})`)}. What is the ${T('y')}-coordinate of the ${T('y')}-intercept of the line?`,
        mc: numMC(r, b, [q + m * p, q - p, m, p - m * q]),
        spr: spr(b),
        expl: `Use ${T('y = mx + b')}: ${T(`${q} = ${m}(${p}) + b`)}, so ${T(`b = ${q} - (${m * p}) = ${b}`)}.`,
      };
    }
    // perpendicular
    const p = r.pick([2, 3, 4, 5]), q = r.pick([1, 2, 3, 5, 7]);
    if (p === q) return this.gen(r, 2);
    const x0 = p * r.nz(-3, 3), y0 = r.int(-8, 8);
    const b = y0 + (q / p) * x0; // new slope -q/p
    return {
      stem: `Line ${T('\\ell')} is perpendicular to the line with equation ${T(`y = ${fracTex(p, q)}x + ${r.int(1, 9)}`)} and passes through the point ${T(`(${x0}, ${y0})`)}. What is the ${T('y')}-coordinate of the ${T('y')}-intercept of line ${T('\\ell')}?`,
      mc: numMC(r, b, [y0 - (q / p) * x0, y0 - (p / q) * x0, y0 + (p / q) * x0, -b]),
      spr: spr(b), preferSpr: true,
      expl: `Perpendicular slopes are negative reciprocals, so line ${T('\\ell')} has slope ${T(fracTex(-q, p))}. Then ${T(`${y0} = ${fracTex(-q, p)}(${x0}) + b`)}, giving ${T(`b = ${b}`)}.`,
    };
  },
});

// ======================= ADVANCED MATH =======================
add({
  key: 'adv.quadratic',
  sat: { domain: 'Advanced Math', skill: 'Nonlinear equations in one variable' },
  act: { domain: 'Algebra', skill: 'Quadratic equations' },
  gen(r, d) {
    if (d === 1) {
      const p = r.int(1, 12), q = r.int(1, 12);
      return {
        stem: `${eq(`(x - ${p})(x + ${q}) = 0`)}What is the positive solution to the given equation?`,
        mc: numMC(r, p, [q, p + q, Math.abs(p - q) || p + 1, p * q]),
        spr: spr(p),
        expl: `By the zero product property, ${T(`x - ${p} = 0`)} or ${T(`x + ${q} = 0`)}, so ${T(`x = ${p}`)} or ${T(`x = -${q}`)}. The positive solution is ${T(p)}.`,
      };
    }
    if (d === 2) {
      let r1, r2;
      do { r1 = r.nz(-9, 9); r2 = r.nz(-9, 9); } while (r1 === -r2);
      const B = -(r1 + r2), C = r1 * r2;
      const ask = r.pick(['sum', 'product']);
      const val = ask === 'sum' ? r1 + r2 : C;
      return {
        stem: `${eq(`${poly([[1, 'x^2'], [B, 'x'], [C, '']])} = 0`)}What is the ${ask} of the solutions to the given equation?`,
        mc: numMC(r, val, ask === 'sum' ? [B, C, -C, r1 - r2] : [-C, B, -B, r1 + r2]),
        spr: spr(val),
        expl: `Factor: ${T(`(x ${r1 < 0 ? '+' : '-'} ${Math.abs(r1)})(x ${r2 < 0 ? '+' : '-'} ${Math.abs(r2)}) = 0`)}, so the solutions are ${T(r1)} and ${T(r2)}. Their ${ask} is ${T(val)}. (Shortcut: for ${T('x^2 + bx + c = 0')}, the sum is ${T('-b')} and the product is ${T('c')}.)`,
      };
    }
    const v = r.pick(['one', 'count', 'sumfrac']);
    if (v === 'one') {
      const b = 2 * r.nz(-9, 9), k = (b * b) / 4;
      return {
        stem: `${eq(`x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + k = 0`)}In the given equation, ${T('k')} is a constant. If the equation has exactly one real solution, what is the value of ${T('k')}?`,
        mc: numMC(r, k, [b * b, Math.abs(b) / 2, b * b / 2, -k]),
        spr: spr(k), preferSpr: true,
        expl: `Exactly one real solution means the discriminant is zero: ${T(`b^2 - 4ac = (${b})^2 - 4(1)(k) = 0`)}, so ${T(`${b * b} = 4k`)} and ${T(`k = ${k}`)}.`,
      };
    }
    if (v === 'count') {
      const a = r.nz(-5, 5), b = r.int(-9, 9), c = r.nz(-9, 9);
      const disc = b * b - 4 * a * c;
      const ans = disc > 0 ? 'Exactly two' : disc === 0 ? 'Exactly one' : 'Zero';
      return {
        stem: `How many distinct real solutions does the equation ${T(`${poly([[a, 'x^2'], [b, 'x'], [c, '']])} = 0`)} have?`,
        mc: buildMC(r, ans, ['Exactly two', 'Exactly one', 'Zero', 'Infinitely many'].filter((x) => x !== ans), null, {}),
        expl: `The discriminant is ${T(`b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${disc}`)}. ${disc > 0 ? 'A positive discriminant means two distinct real solutions.' : disc === 0 ? 'A zero discriminant means exactly one real solution.' : 'A negative discriminant means no real solutions.'}`,
      };
    }
    let a = r.pick([2, 3, 4, 5]), p = r.nz(-9, 9), q = r.nz(-9, 9);
    // (ax - p)(x - q) = a x^2 - (aq + p) x + pq
    const B = -(a * q + p), C = p * q;
    const sum = (a * q + p) / a;
    return {
      stem: `${eq(`${poly([[a, 'x^2'], [B, 'x'], [C, '']])} = 0`)}What is the sum of the solutions to the given equation?`,
      mc: buildMC(r, T(fracTex(a * q + p, a)), [T(fracTex(-(a * q + p), a)), T(fracTex(C, a)), T(String(-B)), T(fracTex(a * q + p, 2 * a))], () => T(fracTex(a * q + p + r.nz(-4, 4), a))),
      spr: { accept: [sum], display: fracTex(a * q + p, a).includes('frac') ? `${frac(a * q + p, a).n}/${frac(a * q + p, a).d}` : String(sum) },
      preferSpr: true,
      expl: `For ${T('ax^2 + bx + c = 0')}, the sum of the solutions is ${T('-\\frac{b}{a}')}. Here that is ${T(`-\\frac{${B}}{${a}} = ${fracTex(-B, a)}`)}.`,
    };
  },
});

add({
  key: 'adv.vertex',
  sat: { domain: 'Advanced Math', skill: 'Nonlinear functions' },
  act: { domain: 'Functions', skill: 'Quadratic functions' },
  gen(r, d) {
    if (d === 1) {
      const a = r.int(1, 5), h = r.nz(-8, 8), k = r.nz(-12, 12);
      return {
        stem: `The function ${T('f')} is defined by ${T(`f(x) = ${a === 1 ? '' : a}(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 ${k < 0 ? '-' : '+'} ${Math.abs(k)}`)}. What is the minimum value of ${T('f(x)')}?`,
        mc: numMC(r, k, [h, -h, -k, a]),
        spr: spr(k),
        expl: `In vertex form ${T('a(x - h)^2 + k')} with ${T('a > 0')}, the minimum value is ${T('k')}. Since ${T('(x - h)^2 \\ge 0')}, the smallest value of ${T('f(x)')} is ${T(k)}, reached when ${T(`x = ${h}`)}.`,
      };
    }
    if (d === 2) {
      const h = r.nz(-7, 7), B = -2 * h, C = r.int(-15, 20), min = C - h * h;
      return {
        stem: `The function ${T('g')} is defined by ${T(`g(x) = ${poly([[1, 'x^2'], [B, 'x'], [C, '']])}`)}. What is the minimum value of ${T('g(x)')}?`,
        mc: numMC(r, min, [C, h, C + h * h, -min]),
        spr: spr(min),
        expl: `The vertex is at ${T(`x = -\\frac{b}{2a} = -\\frac{${B}}{2} = ${h}`)}. Then ${T(`g(${h}) = (${h})^2 ${B < 0 ? '-' : '+'} ${Math.abs(B)}(${h}) ${C < 0 ? '-' : '+'} ${Math.abs(C)} = ${min}`)}.`,
      };
    }
    const a = -r.int(1, 4), r1 = r.int(-8, 4);
    const r2 = r1 + 2 * r.int(1, 6);
    const h = (r1 + r2) / 2, k = a * (h - r1) * (h - r2);
    return {
      stem: `The function ${T('f')} is defined by ${T(`f(x) = ${a === -1 ? '-' : a}${fac(r1)}${fac(r2)}`)}. In the ${T('xy')}-plane, the graph of ${T('y = f(x)')} has its vertex at ${T('(h, k)')}. What is the value of ${T('k')}?`,
      mc: numMC(r, k, [-k, h, a * r1 * r2, k + a]),
      spr: spr(k), preferSpr: true,
      expl: `The ${T('x')}-intercepts are ${T(r1)} and ${T(r2)}, and the vertex lies halfway between them: ${T(`h = \\frac{${r1} + ${r2}}{2} = ${h}`)}. Then ${T(`k = f(${h}) = ${a}(${h - r1})(${h - r2}) = ${k}`)}.`,
    };
  },
});

add({
  key: 'adv.exponential',
  sat: { domain: 'Advanced Math', skill: 'Nonlinear functions' },
  act: { domain: 'Functions', skill: 'Exponential models' },
  gen(r, d) {
    if (d === 1) {
      const N = r.pick([1200, 2500, 4000, 8600, 15000, 32000]), p = r.pick([2, 3, 4, 5, 6, 8, 12]);
      const up = (1 + p / 100).toFixed(2), down = (1 - p / 100).toFixed(2), pd = (p / 100).toFixed(2);
      const noun = r.pick(['population of a town', 'number of members of an online club', 'number of trees in a reforestation project']);
      return {
        stem: `The ${noun} was ${num(N)} at the start of 2020 and increases by ${p}% each year. Which equation gives the ${noun.split(' of ')[0]}, ${T('P')}, ${T('t')} years after the start of 2020?`,
        mc: buildMC(r, T(`P = ${tnum(N)}(${up})^t`), [T(`P = ${tnum(N)}(${down})^t`), T(`P = ${tnum(N)}(${pd})^t`), T(`P = ${tnum(N)} + ${p}t`)]),
        expl: `Growth of ${p}% per year multiplies the amount by ${T(`1 + 0.${String(p).padStart(2, '0')} = ${up}`)} each year, so ${T(`P = ${tnum(N)}(${up})^t`)}.`,
      };
    }
    if (d === 2) {
      const p = r.pick([4, 6, 8, 10, 12, 15, 20, 25]), P = r.pick([18000, 24000, 32000, 45000]), b = (1 - p / 100).toFixed(2);
      const thing = r.pick(['car', 'laptop', 'boat', 'tractor']);
      return {
        stem: `The value ${T('V')}, in dollars, of a ${thing} ${T('t')} years after it was purchased is modeled by ${T(`V = ${tnum(P)}(${b})^t`)}. Which statement best describes how the value of the ${thing} changes over time?`,
        mc: buildMC(r, `It decreases by ${p}% each year.`, [`It decreases by ${100 - p}% each year.`, `It increases by ${p}% each year.`, `It decreases by ${money(b)} each year.`]),
        expl: `The base ${T(b)} is less than 1, so the value decreases. Since ${T(`${b} = 1 - ${(p / 100).toFixed(2)}`)}, the value keeps ${100 - p}% of itself each year, meaning it decreases by ${p}% each year.`,
      };
    }
    const opts = [[1.21, 10], [1.44, 20], [1.69, 30], [0.81, -10], [0.64, -20], [0.49, -30]];
    const [b, pct] = r.pick(opts);
    const k = r.pick([2]);
    const dir = pct > 0 ? 'increases' : 'decreases';
    const raw = Math.round(Math.abs(b - 1) * 100);
    return {
      stem: `The function ${T('A')} is defined by ${T(`A(t) = 500(${b})^{t/${k}}`)}, where ${T('t')} is the number of years since the start of an experiment. By what percent does ${T('A(t)')} change each year?`,
      mc: buildMC(r, `It ${dir} by ${Math.abs(pct)}%.`, [`It ${dir} by ${raw}%.`, `It ${dir} by ${raw / 2}%.`, `It ${dir === 'increases' ? 'decreases' : 'increases'} by ${Math.abs(pct)}%.`]),
      expl: `Rewrite: ${T(`(${b})^{t/2} = \\left((${b})^{1/2}\\right)^t = (${(1 + pct / 100).toFixed(1)})^t`)}. A yearly factor of ${T((1 + pct / 100).toFixed(1))} means ${T('A')} ${dir} by ${Math.abs(pct)}% per year. The ${raw}% change happens every 2 years, not every year.`,
    };
  },
});

add({
  key: 'adv.functions',
  sat: { domain: 'Advanced Math', skill: 'Nonlinear functions' },
  act: { domain: 'Functions', skill: 'Function notation and composition' },
  gen(r, d) {
    if (d === 1) {
      const a = r.nz(-4, 5), c = r.int(-10, 10), k = r.nz(-4, 4), v = a * k * k + c;
      return {
        stem: `The function ${T('f')} is defined by ${T(`f(x) = ${poly([[a, 'x^2'], [c, '']])}`)}. What is the value of ${T(`f(${k})`)}?`,
        mc: numMC(r, v, [a * 2 * k + c, -a * k * k + c, a * a * k * k + c, a * k + c]),
        spr: spr(v),
        expl: `Substitute ${T(k)}: ${T(`f(${k}) = ${a}(${k})^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${a}(${k * k}) ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${v}`)}.`,
      };
    }
    if (d === 2) {
      const a = r.nz(-4, 5), b = r.int(-9, 9), c = r.int(1, 9), k = r.nz(-4, 4);
      const g = k * k - c, fg = a * g + b, f = a * k + b, gf = f * f - c;
      return {
        stem: `The functions ${T('f')} and ${T('g')} are defined by ${T(`f(x) = ${poly([[a, 'x'], [b, '']])}`)} and ${T(`g(x) = x^2 - ${c}`)}. What is the value of ${T(`f(g(${k}))`)}?`,
        mc: numMC(r, fg, [gf, f + g, f * g, a * k * k + b]),
        spr: spr(fg),
        expl: `Work from the inside out: ${T(`g(${k}) = (${k})^2 - ${c} = ${g}`)}. Then ${T(`f(${g}) = ${a}(${g}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${fg}`)}.`,
      };
    }
    const a = r.nz(-5, 6), b = r.int(-9, 9), p = a + b, q = 4 * a + 2 * b;
    return {
      stem: `The function ${T('f')} is defined by ${T('f(x) = ax^2 + bx')}, where ${T('a')} and ${T('b')} are constants. If ${T(`f(1) = ${p}`)} and ${T(`f(2) = ${q}`)}, what is the value of ${T('a')}?`,
      mc: numMC(r, a, [b, q - p, (q - 2 * p), (q - p) / 3]),
      spr: spr(a), preferSpr: true,
      expl: `${T(`f(1) = a + b = ${p}`)} and ${T(`f(2) = 4a + 2b = ${q}`)}. Subtract twice the first equation from the second: ${T(`2a = ${q} - ${2 * p} = ${q - 2 * p}`)}, so ${T(`a = ${a}`)}.`,
    };
  },
});

add({
  key: 'adv.equivalent',
  sat: { domain: 'Advanced Math', skill: 'Equivalent expressions' },
  act: { domain: 'Algebra', skill: 'Polynomial expressions' },
  gen(r, d) {
    if (d === 1) {
      const a = r.int(1, 5), b = r.nz(-7, 7), c = r.int(1, 5), e = r.nz(-7, 7);
      const A = a * c, B = a * e + b * c, C = b * e;
      const f = (p, q, s) => T(poly([[p, 'x^2'], [q, 'x'], [s, '']]));
      return {
        stem: `Which expression is equivalent to ${T(`(${poly([[a, 'x'], [b, '']])})(${poly([[c, 'x'], [e, '']])})`)}?`,
        mc: buildMC(r, f(A, B, C), [f(A, 0, C), f(A, a * e - b * c, C), f(a + c, B, C), f(A, B, b + e)], () => f(A, B + r.nz(-3, 3), C)),
        expl: `Use FOIL: ${T(`${a === 1 ? '' : a}x \\cdot ${c === 1 ? '' : c}x = ${A === 1 ? '' : A}x^2`)}, outer + inner ${T(`= ${a * e}x + ${b * c}x = ${B}x`)}, last ${T(`= ${C}`)}.`,
      };
    }
    if (d === 2) {
      const a = r.int(2, 6), b = r.nz(-9, 9);
      const f = (p, q, s) => T(poly([[p, 'x^2'], [q, 'x'], [s, '']]));
      return {
        stem: `Which expression is equivalent to ${T(`(${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)})^2`)}?`,
        mc: buildMC(r, f(a * a, 2 * a * b, b * b), [f(a * a, 0, b * b), f(a, 2 * a * b, b * b), f(a * a, a * b, b * b), f(2 * a, 2 * b, 0)]),
        expl: `${T('(p + q)^2 = p^2 + 2pq + q^2')}. Here ${T(`(${a}x)^2 + 2(${a}x)(${b}) + (${b})^2 = ${poly([[a * a, 'x^2'], [2 * a * b, 'x'], [b * b, '']])}`)}. Squaring each term separately misses the middle term.`,
      };
    }
    const c = r.int(2, 5), a = r.int(2, 6), p = r.int(1, 9), q = r.int(1, 9);
    const A = a * c, k = -a * q + p * c, B = p * q;
    return {
      stem: `${eq(`(ax + ${p})(${c}x - ${q}) = ${A}x^2 + kx - ${B}`)}In the given equation, ${T('a')} and ${T('k')} are constants, and the equation is true for all values of ${T('x')}. What is the value of ${T('k')}?`,
      mc: numMC(r, k, [a * q + p * c, -k, p * c, -a * q]),
      spr: spr(k), preferSpr: true,
      expl: `Match ${T('x^2')} coefficients: ${T(`${c}a = ${A}`)}, so ${T(`a = ${a}`)}. The ${T('x')}-coefficient is ${T(`a(-${q}) + ${p}(${c}) = ${-a * q} + ${p * c} = ${k}`)}.`,
    };
  },
});

add({
  key: 'adv.exponents',
  sat: { domain: 'Advanced Math', skill: 'Equivalent expressions' },
  act: { domain: 'Number and Quantity', skill: 'Exponents and radicals' },
  gen(r, d) {
    if (d === 1) {
      const m = r.int(2, 9);
      let n = r.int(2, 9);
      while (m * n === m + n) n = r.int(2, 9); // 2 and 2 would make two choices x^4
      return {
        stem: `Which expression is equivalent to ${T(`x^{${m}} \\cdot x^{${n}}`)}, where ${T('x > 0')}?`,
        mc: buildMC(r, T(`x^{${m + n}}`), [T(`x^{${m * n}}`), T(`2x^{${m + n}}`), T(`x^{${Math.abs(m - n) || m + n + 1}}`)]),
        expl: `When multiplying powers with the same base, add the exponents: ${T(`x^{${m}+${n}} = x^{${m + n}}`)}.`,
      };
    }
    if (d === 2) {
      const a = r.int(2, 5), b = r.int(2, 4), c = r.int(1, 7);
      const e = a * b - c;
      return {
        stem: `Which expression is equivalent to ${T(`\\frac{(x^{${a}})^{${b}}}{x^{${c}}}`)}, where ${T('x > 0')}?`,
        mc: buildMC(r, T(`x^{${e}}`), [T(`x^{${a + b - c}}`), T(`x^{${a * b + c}}`), T(`x^{${(a * b) / c}}`.replace(/\d+\.\d+/, (m) => fracTex(a * b, c)))], () => T(`x^{${e + r.nz(-5, 5)}}`)),
        expl: `Power of a power multiplies exponents: ${T(`(x^{${a}})^{${b}} = x^{${a * b}}`)}. Dividing subtracts exponents: ${T(`x^{${a * b} - ${c}} = x^{${e}}`)}.`,
      };
    }
    const opts = [];
    for (let m = 1; m <= 4; m++) for (let n = m + 1; n <= 4; n++) for (let c = 1; c <= 6; c++) if ((m * c) % (n - m) === 0) opts.push([m, n, c]);
    const [m, n, c] = r.pick(opts);
    const x = (m * c) / (n - m);
    return {
      stem: `${eq(`${2 ** m}^{x + ${c}} = ${2 ** n}^{x}`)}What value of ${T('x')} satisfies the equation above?`,
      mc: numMC(r, x, [c, x + c, (n * c) / (n - m), m * c]),
      spr: spr(x), preferSpr: true,
      expl: `Write both sides as powers of 2: ${T(`2^{${m}(x + ${c})} = 2^{${n}x}`)}. Set exponents equal: ${T(`${m}x + ${m * c} = ${n}x`)}, so ${T(`${n - m}x = ${m * c}`)} and ${T(`x = ${x}`)}.`,
    };
  },
});

// ======================= PROBLEM-SOLVING & DATA ANALYSIS =======================
add({
  key: 'psda.percent',
  sat: { domain: 'Problem-Solving and Data Analysis', skill: 'Percentages' },
  act: { domain: 'Integrating Essential Skills', skill: 'Percentages' },
  gen(r, d) {
    if (d === 1) {
      let N, p, v;
      do { N = r.pick([40, 60, 80, 120, 150, 200, 250, 300, 400, 500, 640, 800]); p = r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 60, 75]); v = (p * N) / 100; } while (!Number.isInteger(v));
      return {
        stem: `What is ${p}% of ${N}?`,
        mc: numMC(r, v, [N / p, N - v, p * N / 10, v * 2]),
        spr: spr(v),
        expl: `${p}% of ${N} is ${T(`\\frac{${p}}{100} \\times ${N} = ${v}`)}.`,
      };
    }
    if (d === 2) {
      const combos = [[20, 25], [25, 20], [50, 20], [10, 10], [40, 25], [20, 10], [25, 40], [30, 10], [60, 50]];
      const [p, q] = r.pick(combos);
      const P = r.pick([40, 60, 80, 120, 200, 240]);
      const fin = Math.round(P * (1 + p / 100) * (1 - q / 100) * 100) / 100;
      return {
        stem: `The price of a jacket was ${money(P)}. The price was increased by ${p}%, and then the new price was decreased by ${q}%. What is the final price of the jacket, in dollars?`,
        mc: numMC(r, fin, [P * (1 + (p - q) / 100), P, P * (1 + p / 100), P * (1 - q / 100)], { fmt: (v) => money(v, Number.isInteger(v) ? 0 : 2), step: 2 }),
        spr: spr(fin),
        expl: `Multiply by the factors in order: ${T(`${P} \\times ${(1 + p / 100).toFixed(2)} \\times ${(1 - q / 100).toFixed(2)} = ${fin}`)}. You can't simply add ${T(`+${p}\\%`)} and ${T(`-${q}\\%`)}, because the second change applies to a different base.`,
      };
    }
    const combos = [[25, 20, 100], [50, 20, 120], [20, 25, 90], [40, 50, 70], [60, 25, 120], [30, 50, 65], [10, 50, 55]];
    const [p, q, ans] = r.pick(combos);
    return {
      stem: `The number ${T('x')} is ${p}% greater than the number ${T('y')}. The number ${T('y')} is ${q}% less than the number ${T('z')}. The value of ${T('x')} is what percent of the value of ${T('z')}?`,
      mc: numMC(r, ans, [100 + p - q, 100 - p + q, p + q, ans + 5], { step: 5 }),
      spr: spr(ans), preferSpr: true,
      expl: `${T(`x = ${(1 + p / 100).toFixed(2)}y`)} and ${T(`y = ${(1 - q / 100).toFixed(2)}z`)}. So ${T(`x = ${(1 + p / 100).toFixed(2)}(${(1 - q / 100).toFixed(2)})z = ${(ans / 100).toFixed(2)}z`)}, which is ${ans}% of ${T('z')}.`,
    };
  },
});

add({
  key: 'psda.ratio',
  sat: { domain: 'Problem-Solving and Data Analysis', skill: 'Ratios, rates, proportional relationships, and units' },
  act: { domain: 'Integrating Essential Skills', skill: 'Rates and proportions' },
  gen(r, d) {
    if (d === 1) {
      const rate = r.int(3, 18), M = r.int(2, 6), P = rate * M, K = r.int(7, 30), ans = rate * K;
      const item = r.pick([['printer', 'prints', 'pages'], ['machine', 'fills', 'bottles'], ['baker', 'decorates', 'cupcakes'], ['volunteer', 'packs', 'boxes']]);
      return {
        stem: `A ${item[0]} ${item[1]} ${P} ${item[2]} in ${M} minutes. At this rate, how many ${item[2]} does the ${item[0]} ${item[1].replace(/s$/, '')} in ${K} minutes?`,
        mc: numMC(r, ans, [P * K, P + K, Math.round((M * K) / P), ans + rate], { step: rate, spread: 3 }),
        spr: spr(ans),
        expl: `The rate is ${T(`\\frac{${P}}{${M}} = ${rate}`)} ${item[2]} per minute. In ${K} minutes: ${T(`${rate} \\times ${K} = ${ans}`)}.`,
      };
    }
    if (d === 2) {
      const s = 5 * r.int(2, 9), ans = Math.round(s * 3.6);
      return {
        stem: `A cyclist travels at a constant speed of ${s} meters per second. What is this speed in kilometers per hour? (1 kilometer = 1,000 meters)`,
        mc: numMC(r, ans, [Math.round(s / 3.6 * 10) / 10, s * 60, s * 36, s * 6], { step: 4 }),
        spr: spr(ans),
        expl: `${T(`${s}\\,\\tfrac{\\text{m}}{\\text{s}} \\times \\tfrac{3600\\text{ s}}{1\\text{ h}} \\times \\tfrac{1\\text{ km}}{1000\\text{ m}} = ${s} \\times 3.6 = ${ans}`)} km/h.`,
      };
    }
    const a = r.int(2, 5); let b; do b = r.int(3, 9); while (b <= a || gcd(a, b) !== 1);
    const part = r.int(3, 9), diff = (b - a) * part, total = (a + b) * part;
    return {
      stem: `The ratio of seniors to juniors in a club is ${a} to ${b}. There are ${diff} more juniors than seniors in the club. How many members does the club have if every member is either a senior or a junior?`,
      mc: numMC(r, total, [diff * (a + b), (a + b) * diff / a, diff + a + b, b * part], { step: a + b, spread: 3 }),
      spr: spr(total), preferSpr: true,
      expl: `Let seniors ${T(`= ${a}k`)} and juniors ${T(`= ${b}k`)}. Then ${T(`${b}k - ${a}k = ${diff}`)}, so ${T(`k = ${part}`)}. Total ${T(`= ${a + b}k = ${total}`)}.`,
    };
  },
});

add({
  key: 'psda.stats',
  sat: { domain: 'Problem-Solving and Data Analysis', skill: 'One-variable data: distributions and measures of center and spread' },
  act: { domain: 'Statistics and Probability', skill: 'Mean, median, and spread' },
  gen(r, d) {
    if (d === 1) {
      const n = r.int(5, 6), mean = r.int(8, 40);
      const vals = Array.from({ length: n - 1 }, () => mean + r.int(-9, 9));
      vals.push(mean * n - vals.reduce((s, v) => s + v, 0));
      if (vals[n - 1] < 0) return this.gen(r, d);
      const sorted = [...vals].sort((a, b) => a - b), med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      return {
        stem: `What is the mean of the data set ${T(vals.join(',\\ '))}?`,
        mc: numMC(r, mean, [med, mean + 1, Math.round((mean * n) / (n - 1)), mean - 2]),
        spr: spr(mean),
        expl: `The sum is ${T(mean * n)}, and there are ${n} values, so the mean is ${T(`\\frac{${mean * n}}{${n}} = ${mean}`)}.`,
      };
    }
    if (d === 2) {
      const n = r.pick([7, 8]);
      const vals = Array.from({ length: n }, () => r.int(2, 60));
      const s = [...vals].sort((a, b) => a - b);
      const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
      const mean = Math.round((vals.reduce((a, b) => a + b, 0) / n) * 10) / 10;
      return {
        stem: `The list below shows the number of minutes ${n} students spent on a homework assignment. What is the median of the data?<div class="eq">${T(vals.join(',\\ '))}</div>`,
        mc: numMC(r, med, [mean, vals[Math.floor(n / 2)], s[Math.floor(n / 2)] === med ? s[Math.floor(n / 2) + 1] : s[Math.floor(n / 2)], (s[0] + s[n - 1]) / 2], { step: 1 }),
        spr: spr(med),
        expl: `Order the values: ${T(s.join(',\\ '))}. ${n % 2 ? `The middle (4th) value is ${T(med)}.` : `With 8 values, the median is the mean of the 4th and 5th values: ${T(`\\frac{${s[3]} + ${s[4]}}{2} = ${med}`)}.`}`,
      };
    }
    const n = r.int(6, 14), m = r.int(20, 80), m2 = m + r.nz(-3, 4);
    const x = (n + 1) * m2 - n * m;
    if (x <= 0) return this.gen(r, d);
    return {
      stem: `The mean of a data set of ${n} numbers is ${m}. When one more number is added to the data set, the mean of the ${n + 1} numbers is ${m2}. What number was added?`,
      mc: numMC(r, x, [m2, n * m2 - n * m, m2 - m, x + n]),
      spr: spr(x), preferSpr: true,
      expl: `The original sum is ${T(`${n} \\times ${m} = ${n * m}`)}. The new sum is ${T(`${n + 1} \\times ${m2} = ${(n + 1) * m2}`)}. The added number is ${T(`${(n + 1) * m2} - ${n * m} = ${x}`)}.`,
    };
  },
});

const sprFrac = (n, d) => { const f = frac(n, d); const fs = `${f.n}/${f.d}`; return { accept: [n / d], display: fs.length <= 5 ? fs : String(Math.floor((n / d) * 10000) / 10000).replace(/^0/, '') }; };
const TWT_CTX = [
  { rows: ['Freshmen', 'Sophomores'], cols: ['Chess', 'Robotics', 'Debate'], who: 'students', what: 'club' },
  { rows: ['Morning', 'Evening'], cols: ['Yoga', 'Spin', 'Weights'], who: 'gym members', what: 'class' },
  { rows: ['Group A', 'Group B'], cols: ['Improved', 'No change', 'Declined'], who: 'participants', what: 'result' },
  { rows: ['Juniors', 'Seniors'], cols: ['Biology', 'Chemistry', 'Physics'], who: 'students', what: 'science elective' },
];
add({
  key: 'psda.probability',
  sat: { domain: 'Problem-Solving and Data Analysis', skill: 'Probability and conditional probability' },
  act: { domain: 'Statistics and Probability', skill: 'Probability' },
  gen(r, d) {
    const c = r.pick(TWT_CTX);
    const cells = c.rows.map(() => c.cols.map(() => r.int(4, 36)));
    const rowT = cells.map((row) => row.reduce((a, b) => a + b, 0));
    const colT = c.cols.map((_, j) => cells.reduce((s, row) => s + row[j], 0));
    const tot = rowT.reduce((a, b) => a + b, 0);
    const table = `<table class="data"><thead><tr><th></th>${c.cols.map((h) => `<th>${h}</th>`).join('')}<th>Total</th></tr></thead><tbody>${c.rows.map((rw, i) => `<tr><th>${rw}</th>${cells[i].map((v) => `<td>${v}</td>`).join('')}<td>${rowT[i]}</td></tr>`).join('')}<tr><th>Total</th>${colT.map((v) => `<td>${v}</td>`).join('')}<td>${tot}</td></tr></tbody></table>`;
    const i = r.int(0, c.rows.length - 1), j = r.int(0, c.cols.length - 1);
    const intro = `The table summarizes the ${c.what} chosen by ${tot} ${c.who}, grouped by category.${table}`;
    const F = (n, dd) => T(fracTex(n, dd));
    if (d === 1) {
      return {
        stem: `${intro}If one of these ${c.who} is selected at random, what is the probability that the person chose ${c.cols[j]}?`,
        mc: buildMC(r, F(colT[j], tot), [F(cells[i][j], tot), F(colT[j], rowT[i]), F(cells[i][j], colT[j])], () => F(colT[j] + r.nz(-5, 5), tot)),
        spr: sprFrac(colT[j], tot),
        expl: `${colT[j]} of the ${tot} ${c.who} chose ${c.cols[j]}, so the probability is ${T(`\\frac{${colT[j]}}{${tot}}${frac(colT[j], tot).d !== tot ? ' = ' + fracTex(colT[j], tot) : ''}`)}.`,
      };
    }
    if (d === 2) {
      return {
        stem: `${intro}If one of the ${c.who} in the "${c.rows[i]}" category is selected at random, what is the probability that the person chose ${c.cols[j]}?`,
        mc: buildMC(r, F(cells[i][j], rowT[i]), [F(cells[i][j], tot), F(cells[i][j], colT[j]), F(colT[j], tot)], () => F(cells[i][j] + r.nz(-4, 4), rowT[i])),
        spr: sprFrac(cells[i][j], rowT[i]),
        expl: `Restrict to the ${c.rows[i]} row: ${rowT[i]} people. Of those, ${cells[i][j]} chose ${c.cols[j]}. Probability ${T(`= \\frac{${cells[i][j]}}{${rowT[i]}}`)}.`,
      };
    }
    return {
      stem: `${intro}A person who chose ${c.cols[j]} will be selected at random. What is the probability that this person is in the category "${c.rows[i]}"?`,
      mc: buildMC(r, F(cells[i][j], colT[j]), [F(cells[i][j], rowT[i]), F(cells[i][j], tot), F(rowT[i], tot)], () => F(cells[i][j] + r.nz(-4, 4), colT[j])),
      spr: sprFrac(cells[i][j], colT[j]), preferSpr: true,
      expl: `The condition is "chose ${c.cols[j]}," so the denominator is that column's total, ${colT[j]}. Of those, ${cells[i][j]} are in "${c.rows[i]}." Probability ${T(`= \\frac{${cells[i][j]}}{${colT[j]}}`)}.`,
    };
  },
});

const SCATTER_CTX = [
  { x: 'Hours of practice per week', y: 'Free throws made (out of 50)', m: [2, 3], b: [10, 16], xMax: 10 },
  { x: 'Temperature (°F)', y: 'Cups of lemonade sold', m: [2, 4], b: [-100, -60], xMin: 60, xMax: 100 },
  { x: 'Age of tree (years)', y: 'Height (feet)', m: [1.5, 2.5], b: [2, 6], xMax: 20 },
  { x: 'Days since planting', y: 'Plant height (cm)', m: [0.5, 1.5], b: [1, 4], xMax: 24 },
];
add({
  key: 'psda.scatter',
  sat: { domain: 'Problem-Solving and Data Analysis', skill: 'Two-variable data: models and scatterplots' },
  act: { domain: 'Statistics and Probability', skill: 'Scatterplots and lines of fit' },
  gen(r, d) {
    const c = r.pick(SCATTER_CTX);
    const m = c.m[0] + r.int(0, (c.m[1] - c.m[0]) * 2) / 2;
    const b = r.int(c.b[0], c.b[1]);
    const xMin = c.xMin || 0, xMax = c.xMax;
    const n = 12;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = Math.round(xMin + ((i + 0.5) / n) * (xMax - xMin) + (r.next() - 0.5) * (xMax - xMin) / n);
      const y = Math.max(0, Math.round((m * x + b + (r.next() - 0.5) * (xMax - xMin) * m * 0.35) * 2) / 2);
      pts.push([x, y]);
    }
    const yMaxData = Math.max(...pts.map((p) => p[1]), m * xMax + b);
    const figure = svgScatter({ pts, line: [m, b], xLabel: c.x, yLabel: c.y, xMin, xMax, yMax: Math.ceil(yMaxData / 10) * 10 + 5 });
    const eqTex = `y = ${poly([[m, 'x'], [b, '']])}`;
    if (d === 1) {
      const xq = Math.round(xMin + (xMax - xMin) * (0.3 + r.next() * 0.5));
      const ans = Math.round((m * xq + b) * 10) / 10;
      return {
        figure,
        stem: `The scatterplot shows the relationship between two variables for 12 data points, along with a line of best fit with equation ${T(eqTex)}. Based on the line of best fit, what is the predicted value of ${T('y')} when ${T(`x = ${xq}`)}?`,
        mc: numMC(r, ans, [m * xq, ans + 2 * m, xq + b, ans - 3 * m], { step: Math.max(1, Math.round(m * 2)) }),
        expl: `Substitute into the line of best fit: ${T(`y = ${m}(${xq}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${ans}`)}.`,
      };
    }
    if (d === 2) {
      return {
        figure,
        stem: `The scatterplot shows data for 12 observations and a line of best fit. Which of the following is the best interpretation of the slope of the line of best fit, ${T(m)}, in this context?`,
        mc: buildMC(r, `For each increase of 1 in "${c.x.toLowerCase()}," the predicted "${c.y.toLowerCase()}" increases by ${m}.`, [
          `For each increase of 1 in "${c.y.toLowerCase()}," the predicted "${c.x.toLowerCase()}" increases by ${m}.`,
          `The predicted "${c.y.toLowerCase()}" when "${c.x.toLowerCase()}" is 0 is ${m}.`,
          `Every data point increases by exactly ${m}.`,
        ]),
        expl: `Slope is the predicted change in ${T('y')} per 1-unit increase in ${T('x')}. It describes the model, not every data point, and it isn't the ${T('y')}-intercept.`,
      };
    }
    const below = pts.filter(([x, y]) => y < m * x + b - 1e-9).length;
    return {
      figure,
      stem: `The scatterplot shows 12 data points and a line of best fit with equation ${T(eqTex)}. For how many of the 12 data points does the line of best fit predict a ${T('y')}-value greater than the actual ${T('y')}-value?`,
      mc: numMC(r, below, [n - below, below + 1, below - 1, 6]),
      spr: spr(below), preferSpr: true,
      expl: `The line over-predicts for points that lie <b>below</b> the line. Counting those points gives ${T(below)}.`,
    };
  },
});

// ======================= GEOMETRY & TRIG =======================
add({
  key: 'geo.area-volume',
  sat: { domain: 'Geometry and Trigonometry', skill: 'Area and volume' },
  act: { domain: 'Geometry', skill: 'Area, surface area, and volume' },
  gen(r, d) {
    if (d === 1) {
      const rad = r.int(2, 9), h = r.int(3, 12);
      return {
        stem: `A right circular cylinder has a radius of ${rad} centimeters and a height of ${h} centimeters. What is the volume, in cubic centimeters, of the cylinder?`,
        mc: buildMC(r, T(piTex(rad * rad * h)), [T(piTex(2 * rad * h)), T(piTex(rad * h * h)), T(piTex(2 * rad * rad * h)), T(piTex(rad * h))]),
        expl: `${T(`V = \\pi r^2 h = \\pi(${rad})^2(${h}) = ${piTex(rad * rad * h)}`)}. (This formula is on the reference sheet.)`,
      };
    }
    if (d === 2) {
      const w = r.int(3, 15), extra = r.int(2, 9), l = w + extra, P = 2 * (w + l), A = w * l;
      return {
        stem: `The length of a rectangle is ${extra} inches greater than its width. The perimeter of the rectangle is ${P} inches. What is the area, in square inches, of the rectangle?`,
        mc: numMC(r, A, [P * w / 2, w * w, l * l, (P / 4) ** 2], { step: w }),
        spr: spr(A),
        expl: `Let the width be ${T('w')}. Then ${T(`2w + 2(w + ${extra}) = ${P}`)}, so ${T(`4w = ${P - 2 * extra}`)} and ${T(`w = ${w}`)}. The length is ${T(l)}, and the area is ${T(`${w} \\times ${l} = ${A}`)}.`,
      };
    }
    if (r.chance(0.5)) {
      const s = r.int(2, 9), V = s ** 3, SA = 6 * s * s;
      return {
        stem: `A cube has a volume of ${num(V)} cubic units. What is the total surface area, in square units, of the cube?`,
        mc: numMC(r, SA, [s * s, 4 * s * s, V, 6 * s], { step: s }),
        spr: spr(SA), preferSpr: true,
        expl: `${T(`s^3 = ${V}`)}, so ${T(`s = ${s}`)}. Each of the 6 faces has area ${T(`${s}^2 = ${s * s}`)}, so the surface area is ${T(`6 \\times ${s * s} = ${SA}`)}.`,
      };
    }
    const k = r.pick([2, 3]), hk = r.pick([[1, 2], [1, 3], [2, 1], [3, 1]]);
    const factor = frac(k * k * hk[0], hk[1]);
    const ft = fracTex(factor.n, factor.d);
    return {
      stem: `A right circular cylinder has volume ${T('V')}. A second cylinder has a radius ${k} times the radius of the first cylinder and a height ${hk[1] === 1 ? `${hk[0]} times` : `${fracTex(1, hk[1]) === '\\frac{1}{2}' ? 'half' : 'one-third'} of`} the height of the first cylinder. What is the volume of the second cylinder in terms of ${T('V')}?`.replace('1 times', 'equal to'),
      mc: buildMC(r, T(`${ft}V`), [T(`${fracTex(k * hk[0], hk[1])}V`), T(`${fracTex(k * k, 1)}V`), T(`${fracTex(k * k * k * hk[0], hk[1])}V`)], () => T(`${r.int(2, 30)}V`)),
      expl: `Volume is ${T('\\pi r^2 h')}. Multiplying ${T('r')} by ${T(k)} multiplies the volume by ${T(k * k)}; the height change multiplies it by ${T(fracTex(hk[0], hk[1]))}. Total factor: ${T(`${k * k} \\times ${fracTex(hk[0], hk[1])} = ${ft}`)}.`,
    };
  },
});

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
add({
  key: 'geo.right-tri',
  sat: { domain: 'Geometry and Trigonometry', skill: 'Right triangles and trigonometry' },
  act: { domain: 'Geometry', skill: 'Right triangles' },
  gen(r, d) {
    const [a0, b0, c0] = r.pick(TRIPLES);
    const k = a0 > 6 ? 1 : r.int(1, 4), a = a0 * k, b = b0 * k, c = c0 * k;
    if (d === 1) {
      return {
        figure: svgRightTri({ a: String(a), b: String(b), c: '?' }),
        stem: `In the right triangle shown, the legs have lengths ${a} and ${b}. What is the length of the hypotenuse?`,
        mc: numMC(r, c, [a + b, Math.round(Math.sqrt(a * a + b * b + 2 * a * b)), c + k, b + 1]),
        spr: spr(c),
        expl: `Pythagorean theorem: ${T(`c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}`)}, so ${T(`c = ${c}`)}.`,
      };
    }
    if (d === 2) {
      return {
        figure: svgRightTri({ a: String(a), b: '?', c: String(c) }),
        stem: `In the right triangle shown, one leg has length ${a} and the hypotenuse has length ${c}. What is the length of the other leg?`,
        mc: numMC(r, b, [c - a, Math.round(Math.sqrt(c * c + a * a)), b + k, (a + c) / 2]),
        spr: spr(b),
        expl: `${T(`${a}^2 + b^2 = ${c}^2`)}, so ${T(`b^2 = ${c * c} - ${a * a} = ${b * b}`)} and ${T(`b = ${b}`)}.`,
      };
    }
    const s = r.int(2, 12);
    if (r.chance(0.5)) {
      return {
        stem: `In a 30°-60°-90° triangle, the side opposite the 30° angle has length ${s}. What is the length of the side opposite the 60° angle?`,
        mc: buildMC(r, T(sqrtTex(s, 3)), [T(String(2 * s)), T(sqrtTex(s, 2)), T(sqrtTex(2 * s, 3))]),
        expl: `The sides of a 30°-60°-90° triangle are in the ratio ${T('x : x\\sqrt{3} : 2x')}. With ${T(`x = ${s}`)}, the side opposite 60° is ${T(sqrtTex(s, 3))}.`,
      };
    }
    return {
      stem: `An isosceles right triangle has legs of length ${s}. What is the length of its hypotenuse?`,
      mc: buildMC(r, T(sqrtTex(s, 2)), [T(String(2 * s)), T(sqrtTex(s, 3)), T(sqrtTex(2 * s, 2))]),
      expl: `A 45°-45°-90° triangle has sides in the ratio ${T('x : x : x\\sqrt{2}')}, so the hypotenuse is ${T(sqrtTex(s, 2))}.`,
    };
  },
});

add({
  key: 'geo.trig',
  sat: { domain: 'Geometry and Trigonometry', skill: 'Right triangles and trigonometry' },
  act: { domain: 'Geometry', skill: 'Trigonometry' },
  gen(r, d) {
    const [a, b, c] = r.pick(TRIPLES.slice(0, 4));
    if (d === 1) {
      const fn = r.pick(['sin', 'cos', 'tan']);
      const val = fn === 'sin' ? [a, c] : fn === 'cos' ? [b, c] : [a, b];
      return {
        figure: svgRightTri({ a: String(a), b: String(b), c: String(c), labels: true }),
        stem: `In right triangle ${T('ABC')}, angle ${T('C')} is a right angle, ${T(`BC = ${a}`)}, ${T(`AC = ${b}`)}, and ${T(`AB = ${c}`)}. What is the value of ${T(`\\${fn} A`)}?`,
        mc: buildMC(r, T(fracTex(...val)), [T(fracTex(b, c)), T(fracTex(a, c)), T(fracTex(a, b)), T(fracTex(b, a)), T(fracTex(c, a))]),
        expl: `From angle ${T('A')}: opposite ${T(`= BC = ${a}`)}, adjacent ${T(`= AC = ${b}`)}, hypotenuse ${T(`= ${c}`)}. SOH-CAH-TOA gives ${T(`\\${fn} A = ${fracTex(...val)}`)}.`,
      };
    }
    if (d === 2) {
      let p, q, c1, c2, k;
      do { p = r.int(2, 5); q = r.int(1, 5); k = r.int(5, 20); c1 = r.int(-10, 20); c2 = 90 - c1 - (p + q) * k; } while (Math.abs(c2) > 30 || p * k + c1 <= 0 || q * k + c2 <= 0);
      return {
        stem: `In a right triangle, the two acute angles measure ${T(`(${poly([[p, 'x'], [c1, '']])})^\\circ`)} and ${T(`(${poly([[q, 'x'], [c2, '']])})^\\circ`)}. What is the value of ${T('x')}?`,
        mc: numMC(r, k, [(180 - c1 - c2) / (p + q), (90 - c1) / p, (90 + c1 + c2) / (p + q), k + 5]),
        spr: spr(k),
        expl: `The acute angles of a right triangle are complementary: ${T(`(${poly([[p, 'x'], [c1, '']])}) + (${poly([[q, 'x'], [c2, '']])}) = 90`)}, so ${T(`${p + q}x = ${90 - c1 - c2}`)} and ${T(`x = ${k}`)}. (This is why ${T('\\sin \\theta = \\cos(90^\\circ - \\theta)')}.)`,
      };
    }
    if (r.chance(0.5)) {
      return {
        stem: `In right triangle ${T('PQR')}, angle ${T('R')} is a right angle and ${T(`\\cos P = ${fracTex(b, c)}`)}. What is the value of ${T('\\tan P')}?`,
        mc: buildMC(r, T(fracTex(a, b)), [T(fracTex(b, a)), T(fracTex(a, c)), T(fracTex(c, b))]),
        spr: { accept: [a / b], display: `${a}/${b}` }, preferSpr: true,
        expl: `${T(`\\cos P = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{${b}}{${c}}`)}, so the opposite side is ${T(`\\sqrt{${c}^2 - ${b}^2} = ${a}`)}. Then ${T(`\\tan P = \\frac{${a}}{${b}}`)}.`,
      };
    }
    const deg = r.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 270, 300, 315]);
    const f = frac(deg, 180);
    const rad = `${f.n === 1 ? '' : f.n}\\pi${f.d === 1 ? '' : ''}`;
    const radTex = f.d === 1 ? `${f.n === 1 ? '' : f.n}\\pi` : `\\frac{${f.n === 1 ? '' : f.n}\\pi}{${f.d}}`;
    return {
      stem: `An angle measures ${T(radTex)} radians. What is the measure of the angle in degrees?`,
      mc: numMC(r, deg, [deg / 2, 360 - deg, deg + 30, 180 - deg].filter((v) => v > 0), { step: 15 }),
      spr: spr(deg), preferSpr: true,
      expl: `Multiply by ${T('\\frac{180^\\circ}{\\pi}')}: ${T(`${radTex} \\times \\frac{180^\\circ}{\\pi} = ${deg}^\\circ`)}.`,
    };
  },
});

add({
  key: 'geo.circles',
  sat: { domain: 'Geometry and Trigonometry', skill: 'Circles' },
  act: { domain: 'Geometry', skill: 'Circles' },
  gen(r, d) {
    if (d === 1) {
      const th = r.pick([30, 40, 45, 60, 72, 90, 120, 135, 150, 180, 240, 270]), R = r.int(2, 18);
      const arc = frac(th * 2 * R, 360);
      const area = frac(th * R * R, 360);
      return {
        stem: `A circle has a radius of ${R}. What is the length of an arc of this circle intercepted by a central angle of ${th}°?`,
        mc: buildMC(r, T(piTex(arc.n, arc.d)), [T(piTex(area.n, area.d)), T(piTex(th * R, 360)), T(piTex(2 * R)), T(piTex(th * 2 * R, 180))], () => T(piTex(arc.n + r.int(1, 6) * arc.d, arc.d))),
        expl: `Arc length ${T(`= \\frac{${th}}{360} \\times 2\\pi(${R}) = ${piTex(arc.n, arc.d)}`)}.`,
      };
    }
    if (d === 2) {
      const h = r.nz(-9, 9), k = r.nz(-9, 9), R = r.int(2, 9);
      const sq = (v, n) => `(${v} ${n < 0 ? '+' : '-'} ${Math.abs(n)})^2`;
      return {
        stem: `The equation of a circle in the ${T('xy')}-plane is ${T(`${sq('x', h)} + ${sq('y', k)} = ${R * R}`)}. What are the coordinates of the center of the circle?`,
        mc: buildMC(r, T(`(${h}, ${k})`), [T(`(${-h}, ${-k})`), T(`(${h}, ${-k})`), T(`(${-h}, ${k})`)]),
        expl: `In ${T('(x - h)^2 + (y - k)^2 = r^2')}, the center is ${T('(h, k)')}. Watch the signs: ${T(sq('x', h))} means ${T(`h = ${h}`)}. The center is ${T(`(${h}, ${k})`)} and the radius is ${T(R)}.`,
      };
    }
    const h = r.nz(-8, 8), k = r.nz(-8, 8), R = r.int(2, 10);
    const D = -2 * h, E = -2 * k, F = h * h + k * k - R * R;
    return {
      stem: `${eq(`${poly([[1, 'x^2'], [D, 'x'], [1, 'y^2'], [E, 'y'], [F, '']])} = 0`)}The equation above defines a circle in the ${T('xy')}-plane. What is the radius of the circle?`,
      mc: numMC(r, R, [R * R, Math.abs(F), Math.round(Math.sqrt(Math.abs(F))) || R + 2, R + 1]),
      spr: spr(R), preferSpr: true,
      expl: `Complete the square: ${T(`(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 + (y ${k < 0 ? '+' : '-'} ${Math.abs(k)})^2 = ${-F} + ${h * h} + ${k * k} = ${R * R}`)}. So ${T(`r^2 = ${R * R}`)} and ${T(`r = ${R}`)}.`,
    };
  },
});

add({
  key: 'geo.angles',
  sat: { domain: 'Geometry and Trigonometry', skill: 'Lines, angles, and triangles' },
  act: { domain: 'Geometry', skill: 'Angles, triangles, and polygons' },
  gen(r, d) {
    if (d === 1) {
      const A = r.int(25, 90), B = r.int(20, 160 - A), C = 180 - A - B;
      return {
        stem: `In triangle ${T('ABC')}, the measure of angle ${T('A')} is ${A}° and the measure of angle ${T('B')} is ${B}°. What is the measure, in degrees, of angle ${T('C')}?`,
        mc: numMC(r, C, [360 - A - B, A + B, 90 - A + B, C + 10], { step: 5 }),
        spr: spr(C),
        expl: `The angles of a triangle sum to ${T('180^\\circ')}: ${T(`180 - ${A} - ${B} = ${C}`)}.`,
      };
    }
    if (d === 2) {
      const n = r.pick([5, 6, 8, 9, 10, 12]), ans = ((n - 2) * 180) / n;
      return {
        stem: `What is the measure, in degrees, of each interior angle of a regular polygon with ${n} sides?`,
        mc: numMC(r, ans, [360 / n, (n - 2) * 180, 180 - ans / 2, ans + 10], { step: 6 }),
        spr: spr(ans),
        expl: `The interior angles sum to ${T(`(n - 2) \\times 180 = ${(n - 2) * 180}`)}. Divide equally among ${n} angles: ${T(`\\frac{${(n - 2) * 180}}{${n}} = ${ans}`)}.`,
      };
    }
    const p = r.int(2, 6), q = p + r.int(1, 5), s = p * r.int(2, 6), ans = (s * q) / p;
    if (r.chance(0.5)) {
      return {
        stem: `Triangle ${T('ABC')} is similar to triangle ${T('DEF')}, where ${T('A')}, ${T('B')}, and ${T('C')} correspond to ${T('D')}, ${T('E')}, and ${T('F')}, respectively. If ${T(`AB = ${p}`)}, ${T(`DE = ${q}`)}, and ${T(`BC = ${s}`)}, what is the length of ${T('EF')}?`,
        mc: numMC(r, ans, [(s * p) / q, s + q - p, s * q, ans + 1]),
        spr: spr(ans), preferSpr: true,
        expl: `Corresponding sides are proportional: ${T(`\\frac{EF}{BC} = \\frac{DE}{AB} = \\frac{${q}}{${p}}`)}. So ${T(`EF = ${s} \\times \\frac{${q}}{${p}} = ${fracTex(s * q, p)}`)}.`,
      };
    }
    const A1 = r.int(4, 30) * p * p;
    const A2 = (A1 * q * q) / (p * p);
    return {
      stem: `Triangle ${T('ABC')} is similar to triangle ${T('DEF')}. The length of each side of ${T('DEF')} is ${T(fracTex(q, p))} times the length of the corresponding side of ${T('ABC')}. If the area of triangle ${T('ABC')} is ${A1}, what is the area of triangle ${T('DEF')}?`,
      mc: numMC(r, A2, [(A1 * q) / p, A1 * q, (A1 * q * q * q) / (p * p * p), A1 + q], { step: q }),
      spr: spr(A2), preferSpr: true,
      expl: `When lengths are scaled by ${T('k')}, areas scale by ${T('k^2')}. So the area is ${T(`${A1} \\times \\left(${fracTex(q, p)}\\right)^2 = ${fracTex(A1 * q * q, p * p)}`)}.`,
    };
  },
});

// ======================= ACT-ONLY =======================
add({
  key: 'act.logs', sat: null,
  act: { domain: 'Functions', skill: 'Logarithms' },
  gen(r, d) {
    if (d === 1) {
      const b = r.pick([2, 3, 4, 5, 10]), n = r.int(2, b === 10 ? 5 : b === 2 ? 7 : 4);
      return {
        stem: `What is the value of ${T(`\\log_{${b}} ${tnum(b ** n)}`)}?`,
        mc: numMC(r, n, [b ** n / b, n + 1, b * n, n - 1]),
        expl: `${T(`${b}^{${n}} = ${tnum(b ** n)}`)}, so ${T(`\\log_{${b}} ${tnum(b ** n)} = ${n}`)}.`,
      };
    }
    if (d === 2) {
      const b = r.pick([2, 3, 4, 5]), n = r.int(2, 4);
      return {
        stem: `If ${T(`\\log_{${b}} x = ${n}`)}, what is the value of ${T('x')}?`,
        mc: numMC(r, b ** n, [b * n, n ** b, b + n, b ** (n + 1)]),
        expl: `By definition, ${T(`\\log_{${b}} x = ${n}`)} means ${T(`x = ${b}^{${n}} = ${b ** n}`)}.`,
      };
    }
    const opts = [[4, 8, 6], [5, 8, 4], [6, 16, 12], [5, 16, 14], [6, 32, 30], [7, 32, 28]]; // n, x, c where x(x-c)=2^n
    const [n, x, c] = r.pick(opts);
    return {
      stem: `What is the solution to the equation ${T(`\\log_2 x + \\log_2 (x - ${c}) = ${n}`)}?`,
      mc: numMC(r, x, [x - c, 2 ** n / 2, n + c, 2 ** n]),
      expl: `Combine the logs: ${T(`\\log_2[x(x - ${c})] = ${n}`)}, so ${T(`x(x - ${c}) = ${2 ** n}`)}. Solving ${T(`x^2 - ${c}x - ${2 ** n} = 0`)} gives ${T(`x = ${x}`)} or ${T(`x = ${-(2 ** n) / x}`)}. Reject the negative value because the log of a negative number is undefined.`,
    };
  },
});

add({
  key: 'act.complex', sat: null,
  act: { domain: 'Number and Quantity', skill: 'Complex numbers' },
  gen(r, d) {
    const a = r.nz(-7, 7), b = r.nz(-7, 7), c = r.nz(-7, 7), e = r.nz(-7, 7);
    if (d === 1) {
      return {
        stem: `For ${T('i = \\sqrt{-1}')}, what is ${T(`(${cx(a, b)}) + (${cx(c, e)})`)}?`,
        mc: buildMC(r, T(cx(a + c, b + e)), [T(cx(a + c, b - e)), T(cx(a - c, b + e)), T(cx(0, a + b + c + e)), T(cx(a * c, b * e))]),
        expl: `Add real parts and imaginary parts separately: ${T(`(${a} + ${c}) + (${b} + ${e})i = ${cx(a + c, b + e)}`)}.`,
      };
    }
    if (d === 2) {
      const re = a * c - b * e, im = a * e + b * c;
      return {
        stem: `For ${T('i = \\sqrt{-1}')}, which of the following is equivalent to ${T(`(${cx(a, b)})(${cx(c, e)})`)}?`,
        mc: buildMC(r, T(cx(re, im)), [T(cx(a * c + b * e, im)), T(cx(a * c, b * e)), T(cx(re, a * e - b * c))], () => T(cx(re + r.nz(-5, 5), im))),
        expl: `FOIL and use ${T('i^2 = -1')}: ${T(`${a * c} + ${a * e}i + ${b * c}i + ${b * e}i^2 = (${a * c} - (${b * e})) + (${a * e + b * c})i = ${cx(re, im)}`)}.`,
      };
    }
    const re = a * a - b * b, im = 2 * a * b;
    return {
      stem: `For ${T('i = \\sqrt{-1}')}, what is ${T(`(${cx(a, b)})^2`)} written in the form ${T('p + qi')}?`,
      mc: buildMC(r, T(cx(re, im)), [T(cx(a * a + b * b, im)), T(cx(a * a, b * b)), T(cx(re, 0))], () => T(cx(re, im + r.nz(-4, 4)))),
      expl: `${T(`(${cx(a, b)})^2 = ${a * a} + 2(${a})(${b})i + (${b})^2 i^2 = ${a * a} + ${im}i - ${b * b} = ${cx(re, im)}`)}.`,
    };
  },
});

add({
  key: 'act.sequences', sat: null,
  act: { domain: 'Functions', skill: 'Sequences' },
  gen(r, d) {
    if (d === 1) {
      const a = r.int(-10, 20), dd = r.nz(-6, 9), n = r.int(8, 25), v = a + (n - 1) * dd;
      return {
        stem: `The first term of an arithmetic sequence is ${a}, and each term after the first is ${Math.abs(dd)} ${dd > 0 ? 'more' : 'less'} than the term before it. What is the ${n}th term?`,
        mc: numMC(r, v, [a + n * dd, n * dd, a + (n - 2) * dd, v + a], { step: Math.abs(dd) }),
        expl: `${T(`a_n = a_1 + (n - 1)d = ${a} + (${n} - 1)(${dd}) = ${v}`)}.`,
      };
    }
    if (d === 2) {
      const a = r.int(1, 6), q = r.pick([2, 3, -2]), n = r.int(4, 6), v = a * q ** (n - 1);
      const seq = [0, 1, 2, 3].map((i) => a * q ** i);
      return {
        stem: `The first four terms of a geometric sequence are ${T(seq.join(',\\ '))}. What is the ${n}th term of the sequence?`,
        mc: numMC(r, v, [a * q ** n, a * q * (n - 1), -v, v / q + q]),
        expl: `The common ratio is ${T(q)}. ${T(`a_n = a_1 r^{n-1} = ${a}(${q})^{${n - 1}} = ${v}`)}.`,
      };
    }
    const a = r.int(1, 12), dd = r.int(2, 7), n = r.int(10, 30), S = (n * (2 * a + (n - 1) * dd)) / 2;
    return {
      stem: `What is the sum of the first ${n} terms of the arithmetic sequence ${T(`${a},\\ ${a + dd},\\ ${a + 2 * dd},\\ \\ldots`)}?`,
      mc: numMC(r, S, [n * (a + (n - 1) * dd), (n * (a + n * dd)), a + (n - 1) * dd, S + n * dd], { step: dd * 5 }),
      expl: `The ${n}th term is ${T(`${a} + ${n - 1}(${dd}) = ${a + (n - 1) * dd}`)}. Sum ${T(`= \\frac{n(a_1 + a_n)}{2} = \\frac{${n}(${a} + ${a + (n - 1) * dd})}{2} = ${S}`)}.`,
    };
  },
});

add({
  key: 'act.matrices', sat: null,
  act: { domain: 'Number and Quantity', skill: 'Matrices' },
  gen(r, d) {
    const A = [r.int(-6, 9), r.int(-6, 9), r.int(-6, 9), r.int(-6, 9)];
    const B = [r.int(-6, 9), r.int(-6, 9), r.int(-6, 9), r.int(-6, 9)];
    if (d === 1) {
      const S = A.map((v, i) => v + B[i]);
      return {
        stem: `What is ${T(`${mat(...A)} + ${mat(...B)}`)}?`,
        mc: buildMC(r, T(mat(...S)), [T(mat(...A.map((v, i) => v - B[i]))), T(mat(S[1], S[0], S[3], S[2])), T(mat(...A.map((v, i) => v * B[i])))]),
        expl: `Add corresponding entries: ${T(mat(...S))}.`,
      };
    }
    if (d === 2) {
      const k = r.pick([2, 3, -2]);
      const S = A.map((v, i) => k * v - B[i]);
      return {
        stem: `Given ${T(`A = ${mat(...A)}`)} and ${T(`B = ${mat(...B)}`)}, what is ${T(`${k}A - B`)}?`,
        mc: buildMC(r, T(mat(...S)), [T(mat(...A.map((v, i) => k * (v - B[i])))), T(mat(...A.map((v, i) => k * v + B[i]))), T(mat(...A.map((v, i) => v - k * B[i])))]),
        expl: `Multiply each entry of ${T('A')} by ${T(k)}, then subtract the corresponding entry of ${T('B')}: ${T(mat(...S))}.`,
      };
    }
    const det = A[0] * A[3] - A[1] * A[2];
    return {
      stem: `What is the determinant of ${T(mat(...A))}?`,
      mc: numMC(r, det, [A[0] * A[3] + A[1] * A[2], A[0] * A[1] - A[2] * A[3], -det, A[0] + A[3]]),
      expl: `For ${T('\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}')}, the determinant is ${T('ad - bc')}: ${T(`(${A[0]})(${A[3]}) - (${A[1]})(${A[2]}) = ${det}`)}.`,
    };
  },
});

add({
  key: 'act.counting', sat: null,
  act: { domain: 'Statistics and Probability', skill: 'Counting and arrangements' },
  gen(r, d) {
    if (d === 1) {
      const s = r.int(3, 8), p = r.int(2, 6), h = r.int(2, 5);
      return {
        stem: `A student has ${s} shirts, ${p} pairs of pants, and ${h} pairs of shoes. An outfit consists of one shirt, one pair of pants, and one pair of shoes. How many different outfits are possible?`,
        mc: numMC(r, s * p * h, [s + p + h, s * p + h, s * p, (s + p) * h], { step: 4 }),
        expl: `By the fundamental counting principle: ${T(`${s} \\times ${p} \\times ${h} = ${s * p * h}`)}.`,
      };
    }
    const n = r.int(6, 12);
    if (d === 2) {
      const v = n * (n - 1) * (n - 2);
      return {
        stem: `${n} runners are competing in a race. In how many different ways can first, second, and third place be awarded, assuming no ties?`,
        mc: numMC(r, v, [n * 3, n ** 3, v / 6, n * (n - 1)], { step: n }),
        expl: `Order matters: ${T(`${n} \\times ${n - 1} \\times ${n - 2} = ${v}`)}.`,
      };
    }
    const k = r.int(2, 4);
    const C = (nn, kk) => { let v = 1; for (let i = 0; i < kk; i++) v = (v * (nn - i)) / (i + 1); return v; };
    let P = 1; for (let i = 0; i < k; i++) P *= n - i;
    return {
      stem: `A committee of ${k} people is to be chosen from a group of ${n} people. How many different committees are possible?`,
      mc: numMC(r, C(n, k), [P, n * k, C(n, k - 1), C(n, k) * 2], { step: n }),
      expl: `Order doesn't matter, so use combinations: ${T(`\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${C(n, k)}`)}.`,
    };
  },
});
