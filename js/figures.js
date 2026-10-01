// Small inline-SVG figure builders. Colors come from CSS classes (see .fig-* in styles.css).
import { esc } from './util.js';

function niceStep(range, ticks = 5) {
  const raw = range / ticks;
  const p = 10 ** Math.floor(Math.log10(raw));
  const n = raw / p;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
}

function axes({ W, H, L, B, Tp, R, xMin, xMax, yMin, yMax, xLabel, yLabel }) {
  const sx = (x) => L + ((x - xMin) / (xMax - xMin)) * (W - L - R);
  const sy = (y) => H - B - ((y - yMin) / (yMax - yMin)) * (H - B - Tp);
  let g = '';
  const xs = niceStep(xMax - xMin, 6), ys = niceStep(yMax - yMin, 5);
  for (let x = Math.ceil(xMin / xs) * xs; x <= xMax + 1e-9; x += xs) {
    g += `<line class="fig-grid" x1="${sx(x)}" y1="${sy(yMin)}" x2="${sx(x)}" y2="${sy(yMax)}"/>`;
    g += `<text class="fig-tick" x="${sx(x)}" y="${H - B + 16}" text-anchor="middle">${+x.toFixed(4)}</text>`;
  }
  for (let y = Math.ceil(yMin / ys) * ys; y <= yMax + 1e-9; y += ys) {
    g += `<line class="fig-grid" x1="${sx(xMin)}" y1="${sy(y)}" x2="${sx(xMax)}" y2="${sy(y)}"/>`;
    g += `<text class="fig-tick" x="${L - 6}" y="${sy(y) + 4}" text-anchor="end">${+y.toFixed(4)}</text>`;
  }
  g += `<line class="fig-axis" x1="${sx(xMin)}" y1="${sy(yMin)}" x2="${sx(xMax)}" y2="${sy(yMin)}"/>`;
  g += `<line class="fig-axis" x1="${sx(xMin)}" y1="${sy(yMin)}" x2="${sx(xMin)}" y2="${sy(yMax)}"/>`;
  g += `<text class="fig-label" x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle">${esc(xLabel)}</text>`;
  g += `<text class="fig-label" transform="translate(14 ${(Tp + H - B) / 2}) rotate(-90)" text-anchor="middle">${esc(yLabel)}</text>`;
  return { g, sx, sy };
}

export function svgScatter({ pts, line, xLabel, yLabel, xMin = 0, xMax, yMin = 0, yMax }) {
  const W = 460, H = 320, L = 56, B = 46, Tp = 14, R = 16;
  const { g, sx, sy } = axes({ W, H, L, B, Tp, R, xMin, xMax, yMin, yMax, xLabel, yLabel });
  let s = g;
  if (line) {
    const [m, b] = line;
    let x1 = xMin, x2 = xMax;
    const clampX = (y) => (y - b) / m;
    let y1 = m * x1 + b, y2 = m * x2 + b;
    if (y1 < yMin) { x1 = clampX(yMin); y1 = yMin; }
    if (y2 > yMax) { x2 = clampX(yMax); y2 = yMax; }
    s += `<line class="fig-fit" x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}"/>`;
  }
  for (const [x, y] of pts) s += `<circle class="fig-pt" cx="${sx(x)}" cy="${sy(y)}" r="4.5"/>`;
  return `<figure class="fig"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatterplot of ${esc(yLabel)} versus ${esc(xLabel)}">${s}</svg></figure>`;
}

const MARKS = ['circle', 'square', 'triangle', 'diamond'];
function marker(kind, x, y) {
  if (kind === 'square') return `<rect class="fig-mk" x="${x - 4}" y="${y - 4}" width="8" height="8"/>`;
  if (kind === 'triangle') return `<path class="fig-mk" d="M${x} ${y - 5} L${x + 5} ${y + 4} L${x - 5} ${y + 4} Z"/>`;
  if (kind === 'diamond') return `<path class="fig-mk" d="M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5} L${x - 5} ${y} Z"/>`;
  return `<circle class="fig-mk" cx="${x}" cy="${y}" r="4"/>`;
}

export function svgLineChart({ xs, series, xLabel, yLabel, title }) {
  const W = 480, H = 320, L = 60, B = 46, Tp = 30, R = 16;
  const all = series.flatMap((s) => s.values);
  const lo = Math.min(0, ...all), hi = Math.max(...all);
  const ys = niceStep(hi - lo, 5);
  const yMax = Math.ceil(hi / ys) * ys + (hi % ys === 0 ? ys : 0);
  const yMin = lo < 0 ? Math.floor(lo / ys) * ys : 0;
  const { g, sx, sy } = axes({ W, H, L, B, Tp, R, xMin: Math.min(0, xs[0]), xMax: xs[xs.length - 1] + niceStep(xs[xs.length - 1] - xs[0], 6) / 2, yMin, yMax, xLabel, yLabel });
  let s = g;
  series.forEach((ser, i) => {
    const path = ser.values.map((v, j) => `${j ? 'L' : 'M'}${sx(xs[j])} ${sy(v)}`).join(' ');
    s += `<path class="fig-series s${i}" d="${path}"/>`;
    ser.values.forEach((v, j) => (s += `<g class="s${i}">${marker(MARKS[i % 4], sx(xs[j]), sy(v))}</g>`));
  });
  // legend
  let lx = L + 6;
  series.forEach((ser, i) => {
    s += `<g class="s${i}">${marker(MARKS[i % 4], lx + 5, 14)}</g><text class="fig-tick" x="${lx + 14}" y="18">${esc(ser.name)}</text>`;
    lx += 26 + ser.name.length * 6.6;
  });
  return `<figure class="fig">${title ? `<figcaption>${esc(title)}</figcaption>` : ''}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title || 'Line graph')}">${s}</svg></figure>`;
}

// Right triangle: right angle at C (bottom-left), B top-left, A bottom-right.
// a = BC (vertical, opposite A), b = AC (horizontal, opposite B), c = AB (hypotenuse)
export function svgRightTri({ a, b, c, labels = false }) {
  const W = 300, H = 210;
  const C = [50, 180], Bv = [50, 30], A = [260, 180];
  let s = `<path class="fig-shape" d="M${C} L${Bv} L${A} Z"/>`;
  s += `<path class="fig-axis" d="M${C[0]} ${C[1] - 16} h16 v16" fill="none"/>`;
  const lab = (t, x, y, anchor = 'middle') => (t ? `<text class="fig-label" x="${x}" y="${y}" text-anchor="${anchor}">${esc(t)}</text>` : '');
  s += lab(a, 38, 110, 'end') + lab(b, 155, 200) + lab(c, 166, 96, 'start');
  if (labels) s += lab('C', 40, 196, 'end') + lab('B', 44, 24, 'end') + lab('A', 268, 196, 'start');
  return `<figure class="fig fig-sm"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Right triangle">${s}</svg><figcaption class="fig-note">Figure not drawn to scale.</figcaption></figure>`;
}

export function htmlTable({ caption, head, rows }) {
  return `<table class="data">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
}
