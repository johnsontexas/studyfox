// Desmos calculator (floating, draggable), reference sheet, and modal helper.
import { icon } from './icons.js';
import { tex, $ } from './util.js';

// Desmos's public demo key. Request a free production key at desmos.com/api before launch.
export const DESMOS_KEY = 'dcb31709b452b1cf9dc26972add0fda6';
let desmosPromise = null;
export function loadDesmos() {
  if (window.Desmos) return Promise.resolve(window.Desmos);
  if (!desmosPromise) {
    desmosPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = `https://www.desmos.com/api/v1.10/calculator.js?apiKey=${DESMOS_KEY}`;
      s.onload = () => res(window.Desmos);
      s.onerror = () => { desmosPromise = null; rej(new Error('Could not load the Desmos calculator. Check your connection.')); };
      document.head.appendChild(s);
    });
  }
  return desmosPromise;
}

export async function mountCalculator(el, kind = 'graphing') {
  const D = await loadDesmos();
  const opts = { keypad: true, expressions: true, settingsMenu: true, zoomButtons: true, expressionsCollapsed: false, border: false };
  return kind === 'scientific' ? D.ScientificCalculator(el, { border: false }) : D.GraphingCalculator(el, opts);
}

// ---------- Floating calculator ----------
let floatCalc = null;
export function toggleCalculator(defaultKind = 'graphing') {
  if (floatCalc) { floatCalc.el.classList.toggle('hidden'); return; }
  const el = document.createElement('div');
  el.className = 'calc-float';
  el.innerHTML = `
    <div class="calc-head">
      <span class="grip" aria-hidden="true">${icon('grip')}</span><b>Calculator</b>
      <div class="seg sm"><button data-k="graphing" class="on">Graphing</button><button data-k="scientific">Scientific</button></div>
      <span class="grow"></span>
      <button class="icon-btn" data-act="wide" title="Expand" aria-label="Expand">${icon('expand')}</button>
      <button class="icon-btn" data-act="close" title="Close" aria-label="Close">${icon('x')}</button>
    </div>
    <div class="calc-body"><div class="calc-loading">Loading Desmos…</div></div>`;
  document.body.appendChild(el);
  const body = $('.calc-body', el);
  floatCalc = { el, calcs: {}, kind: defaultKind };
  async function show(kind) {
    floatCalc.kind = kind;
    el.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
    Object.values(floatCalc.calcs).forEach((c) => (c.host.style.display = 'none'));
    if (!floatCalc.calcs[kind]) {
      const host = document.createElement('div'); host.className = 'calc-host'; body.appendChild(host);
      try { floatCalc.calcs[kind] = { host, calc: await mountCalculator(host, kind) }; $('.calc-loading', el)?.remove(); }
      catch (e) { body.innerHTML = `<div class="calc-loading">${e.message}</div>`; return; }
    }
    floatCalc.calcs[kind].host.style.display = '';
    floatCalc.calcs[kind].calc.resize?.();
  }
  el.addEventListener('click', (e) => {
    const k = e.target.closest('[data-k]')?.dataset.k;
    if (k) show(k);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') el.classList.add('hidden');
    if (act === 'wide') { el.classList.toggle('wide'); setTimeout(() => Object.values(floatCalc.calcs).forEach((c) => c.calc.resize?.()), 50); }
  });
  // drag
  const head = $('.calc-head', el);
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = el.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev) => { el.style.left = Math.max(0, Math.min(innerWidth - 80, ev.clientX - ox)) + 'px'; el.style.top = Math.max(0, Math.min(innerHeight - 40, ev.clientY - oy)) + 'px'; el.style.right = 'auto'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  new ResizeObserver(() => Object.values(floatCalc.calcs).forEach((c) => c.calc.resize?.())).observe(el);
  show(defaultKind);
}
export function hideCalculator() { floatCalc?.el.classList.add('hidden'); }
export function destroyCalculator() {
  if (!floatCalc) return;
  Object.values(floatCalc.calcs).forEach((c) => c.calc.destroy?.());
  floatCalc.el.remove(); floatCalc = null;
}

// ---------- Modal ----------
export function modal(html, { title = '', wide = false, onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${title}"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close title="Close" aria-label="Close">${icon('x')}</button></div><div class="modal-body">${html}</div></div>`;
  const close = () => { wrap.remove(); removeEventListener('keydown', key); onClose?.(); };
  const key = (e) => { if (e.key === 'Escape') close(); };
  wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
  addEventListener('keydown', key);
  document.body.appendChild(wrap);
  return { el: wrap, close };
}

export function confirmBox(msg, { ok = 'Confirm', danger = false } = {}) {
  return new Promise((res) => {
    const m = modal(`<p>${msg}</p><div class="row end gap"><button class="btn ghost" data-no>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-yes>${ok}</button></div>`, { title: 'Are you sure?', onClose: () => res(false) });
    m.el.querySelector('[data-no]').onclick = () => { m.close(); };
    m.el.querySelector('[data-yes]').onclick = () => { res(true); m.el.remove(); };
  });
}

// ---------- Reference sheet (matches the formulas provided on the digital SAT) ----------
const shape = (svg) => `<svg viewBox="0 0 120 80" class="ref-svg">${svg}</svg>`;
const REF = [
  [shape('<circle cx="60" cy="40" r="30" class="fig-shape"/><line x1="60" y1="40" x2="90" y2="40" class="fig-axis"/><text x="72" y="36" class="fig-label">r</text><circle cx="60" cy="40" r="2"/>'), 'A = \\pi r^2 \\qquad C = 2\\pi r'],
  [shape('<rect x="20" y="18" width="80" height="44" class="fig-shape"/><text x="58" y="75" class="fig-label">ℓ</text><text x="104" y="44" class="fig-label">w</text>'), 'A = \\ell w'],
  [shape('<path d="M15 65 L105 65 L70 15 Z" class="fig-shape"/><line x1="70" y1="15" x2="70" y2="65" class="fig-axis" stroke-dasharray="3 3"/><text x="74" y="45" class="fig-label">h</text><text x="56" y="78" class="fig-label">b</text>'), 'A = \\tfrac{1}{2}bh'],
  [shape('<path d="M25 65 L100 65 L25 15 Z" class="fig-shape"/><path d="M25 57 h8 v8" class="fig-axis" fill="none"/><text x="14" y="44" class="fig-label">b</text><text x="60" y="78" class="fig-label">a</text><text x="66" y="36" class="fig-label">c</text>'), 'c^2 = a^2 + b^2'],
  [shape('<path d="M20 65 L100 65 L20 18 Z" class="fig-shape"/><text x="6" y="44" class="fig-label">x</text><text x="46" y="78" class="fig-label">x√3</text><text x="64" y="36" class="fig-label">2x</text><text x="26" y="30" class="fig-tick">60°</text><text x="78" y="61" class="fig-tick">30°</text>'), '\\text{Special right triangles}'],
  [shape('<path d="M30 65 L90 65 L30 15 Z" class="fig-shape"/><text x="16" y="44" class="fig-label">s</text><text x="56" y="78" class="fig-label">s</text><text x="62" y="36" class="fig-label">s√2</text><text x="34" y="30" class="fig-tick">45°</text><text x="70" y="61" class="fig-tick">45°</text>'), '\\text{(45°-45°-90°)}'],
  [shape('<path d="M25 30 L75 30 L95 15 L45 15 Z M25 30 L25 68 L75 68 L75 30 M75 68 L95 53 L95 15" class="fig-shape"/><text x="46" y="78" class="fig-label">ℓ</text><text x="88" y="68" class="fig-label">w</text><text x="12" y="52" class="fig-label">h</text>'), 'V = \\ell wh'],
  [shape('<ellipse cx="60" cy="18" rx="30" ry="8" class="fig-shape"/><path d="M30 18 L30 62 A30 8 0 0 0 90 62 L90 18" class="fig-shape"/><text x="95" y="44" class="fig-label">h</text><text x="62" y="15" class="fig-tick">r</text>'), 'V = \\pi r^2 h'],
  [shape('<circle cx="60" cy="40" r="30" class="fig-shape"/><ellipse cx="60" cy="40" rx="30" ry="8" class="fig-axis" fill="none" stroke-dasharray="3 3"/><text x="70" y="36" class="fig-label">r</text>'), 'V = \\tfrac{4}{3}\\pi r^3'],
  [shape('<ellipse cx="60" cy="64" rx="30" ry="8" class="fig-shape"/><path d="M30 64 L60 10 L90 64" class="fig-shape"/><line x1="60" y1="10" x2="60" y2="64" class="fig-axis" stroke-dasharray="3 3"/><text x="64" y="44" class="fig-label">h</text>'), 'V = \\tfrac{1}{3}\\pi r^2 h'],
  [shape('<path d="M25 62 L75 62 L95 50 L45 50 Z" class="fig-shape"/><path d="M25 62 L60 10 L75 62 M60 10 L95 50" class="fig-shape"/><text x="46" y="76" class="fig-label">ℓ</text><text x="92" y="64" class="fig-label">w</text>'), 'V = \\tfrac{1}{3}\\ell wh'],
];
export function referenceSheetHTML() {
  return `<div class="ref-grid">${REF.map(([svg, f]) => `<div class="ref-cell">${svg}<div>${tex(`$${f}$`)}</div></div>`).join('')}</div>
  <ul class="ref-facts">
    <li>The number of degrees of arc in a circle is 360.</li>
    <li>The number of radians of arc in a circle is ${tex('$2\\pi$')}.</li>
    <li>The sum of the measures in degrees of the angles of a triangle is 180.</li>
  </ul>`;
}
export function openReference() { return modal(referenceSheetHTML(), { title: 'Reference Sheet', wide: true }); }
