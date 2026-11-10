// Appearance from Settings: a color theme (a preset, or the student's own colors) layered on top of light or
// dark mode. Saved in settings.appearance (synced with progress). The reading font lives in settings.a11y.font
// (js/a11y.js) so older settings keep working; this card just shows it next to the colors.
import { store } from './store.js';

// light/dark: the main color in each mode. accent: highlights (streak flame, stars, buttons on the home page).
export const PRESETS = [
  { id: 'forest', name: 'Forest', light: '#1f6b47', dark: '#5fcf94', accent: '#f2b33d' }, // the original look
  { id: 'ocean', name: 'Ocean', light: '#1d5f9e', dark: '#7cbcf3', accent: '#f2b33d' },
  { id: 'teal', name: 'Lagoon', light: '#0f766e', dark: '#5eead4', accent: '#f59e0b' },
  { id: 'lavender', name: 'Lavender', light: '#6340b8', dark: '#b8a2f7', accent: '#f2b33d' },
  { id: 'berry', name: 'Berry', light: '#a3246b', dark: '#f491c8', accent: '#f5c04a' },
  { id: 'sunset', name: 'Sunset', light: '#c2410c', dark: '#fb9a63', accent: '#f5c04a' },
  { id: 'sepia', name: 'Paper', light: '#8a5a2b', dark: '#dcae78', accent: '#c48a2c', tint: 9 },
  { id: 'slate', name: 'Graphite', light: '#334155', dark: '#b4c0d0', accent: '#64748b', tint: 0 },
];

export const APPEARANCE_DEFAULTS = { preset: 'forest', brand: '#1f6b47', accent: '#f2b33d', tint: 5 };
export const appearance = () => ({ ...APPEARANCE_DEFAULTS, ...(store.data().settings.appearance || {}) });

const hex = (s) => (/^#[0-9a-f]{6}$/i.test(s || '') ? s : null);
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const inkOn = (h) => (lum(h) > 0.4 ? '#111111' : '#ffffff');

/** The colors in use: { light, dark, accent, tint } from the preset, or the student's custom picks. */
export function palette(a = appearance()) {
  if (a.preset !== 'custom') { const p = PRESETS.find((x) => x.id === a.preset) || PRESETS[0]; return { light: p.light, dark: p.dark, accent: p.accent, tint: p.tint ?? 5 }; }
  const brand = hex(a.brand) || PRESETS[0].light;
  // Dark mode needs a lighter version of the same color to stay readable on a dark background.
  const dark = lum(brand) < 0.25 ? `color-mix(in srgb, ${brand} 55%, #ffffff)` : brand;
  return { light: brand, dark, accent: hex(a.accent) || PRESETS[0].accent, tint: Math.max(0, Math.min(14, +a.tint || 0)) };
}

function css(p) {
  const light = `--brand: ${p.light}; --brand-2: color-mix(in srgb, ${p.light} 80%, #000); --brand-ink: ${inkOn(p.light)};
    --brand-soft: color-mix(in srgb, ${p.light} 13%, #ffffff); --accent: ${p.accent};
    --bg: color-mix(in srgb, ${p.light} ${p.tint}%, #f8f8f6); --surface-2: color-mix(in srgb, ${p.light} ${Math.max(4, p.tint + 4)}%, #f3f3f1);
    --line: color-mix(in srgb, ${p.light} ${Math.max(6, p.tint + 6)}%, #e4e4e1); --line-strong: color-mix(in srgb, ${p.light} ${Math.max(10, p.tint + 10)}%, #cfcfcb);`;
  const darkInk = p.dark.startsWith('#') ? inkOn(p.dark) : '#0b0d0c';
  const dark = `--brand: ${p.dark}; --brand-2: color-mix(in srgb, ${p.dark} 80%, #fff); --brand-ink: ${darkInk};
    --brand-soft: color-mix(in srgb, ${p.dark} 16%, #101312); --accent: color-mix(in srgb, ${p.accent} 60%, #000);
    --bg: color-mix(in srgb, ${p.dark} ${Math.round(p.tint * 0.6)}%, #0b0d0c); --surface: color-mix(in srgb, ${p.dark} ${Math.round(p.tint * 0.6) + 3}%, #121514);
    --surface-2: color-mix(in srgb, ${p.dark} ${Math.round(p.tint * 0.6) + 6}%, #181c1a); --line: color-mix(in srgb, ${p.dark} 10%, #222826); --line-strong: color-mix(in srgb, ${p.dark} 16%, #2e3532);`;
  return `:root { ${light} }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${dark} } }
:root[data-theme="dark"] { ${dark} }`;
}

/** Apply the saved appearance. Forest with default settings needs no overrides. */
export function applyAppearance() {
  const a = appearance();
  let el = document.getElementById('sfAppearance');
  if (a.preset === 'forest') { el?.remove(); return; }
  if (!el) { el = document.createElement('style'); el.id = 'sfAppearance'; document.head.append(el); }
  el.textContent = css(palette(a));
}

const swatch = (p, on) => `<button type="button" class="theme-swatch${on ? ' on' : ''}" data-preset="${p.id}" aria-pressed="${on}" title="${p.name}">
  <span class="ts-dots"><i style="background:${p.light}"></i><i style="background:${p.dark}"></i><i style="background:${p.accent}"></i></span><span>${p.name}</span></button>`;

export const appearanceCardHTML = () => {
  const a = appearance();
  return `<div class="card stack" id="appearanceCard">
  <h2 class="h3">Appearance</h2>
  <p class="muted small">Pick a color theme and a font. Light or dark mode still follows the Theme setting above.</p>
  <div><b class="small">Color theme</b><div class="theme-grid">${PRESETS.map((p) => swatch(p, a.preset === p.id)).join('')}
    <button type="button" class="theme-swatch${a.preset === 'custom' ? ' on' : ''}" data-preset="custom" aria-pressed="${a.preset === 'custom'}"><span class="ts-dots"><i style="background:${a.brand}"></i><i style="background:${a.accent}"></i><i class="ts-plus">+</i></span><span>Custom</span></button></div></div>
  <div class="grid2 theme-custom" ${a.preset === 'custom' ? '' : 'hidden'}>
    <label>Main color<span class="row gap"><input type="color" data-ap="brand" value="${a.brand}" aria-label="Main color"><input data-ap="brand" value="${a.brand}" maxlength="7" class="mono" aria-label="Main color hex"></span></label>
    <label>Highlight color<span class="row gap"><input type="color" data-ap="accent" value="${a.accent}" aria-label="Highlight color"><input data-ap="accent" value="${a.accent}" maxlength="7" class="mono" aria-label="Highlight color hex"></span></label>
    <label>Background tint<input type="range" min="0" max="14" data-ap="tint" value="${a.tint}"></label>
  </div>
  <label>Font<select data-a11y="font">
    <option value="default">StudyFox default</option>
    <option value="dyslexic">OpenDyslexic (dyslexia-friendly)</option>
    <option value="lexend">Lexend (easier reading)</option>
    <option value="atkinson">Atkinson Hyperlegible (low vision)</option>
    <option value="nunito">Nunito (rounded)</option>
    <option value="comic">Comic Neue (casual)</option>
    <option value="serif">Serif (book style)</option>
    <option value="system">System font</option>
  </select></label>
  <div class="theme-sample"><span class="btn primary sm">Button</span><span class="tag">Tag</span><span class="pill on">Selected</span><span class="theme-accent">${'★'.repeat(3)}</span><span class="small">The quick brown fox jumps over the lazy dog.</span></div>
</div>`;
};

export function wireAppearance(root, onChange) {
  const card = root.querySelector('#appearanceCard');
  if (!card) return;
  const save = (patch) => {
    const s = store.data().settings;
    s.appearance = { ...appearance(), ...patch };
    store.save(); applyAppearance(); onChange?.();
  };
  card.addEventListener('click', (e) => {
    const b = e.target.closest('[data-preset]'); if (!b) return;
    const preset = b.dataset.preset;
    save({ preset });
    card.querySelectorAll('[data-preset]').forEach((x) => { const on = x.dataset.preset === preset; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    card.querySelector('.theme-custom').hidden = preset !== 'custom';
  });
  card.addEventListener('input', (e) => {
    const el = e.target.closest('[data-ap]'); if (!el) return;
    const k = el.dataset.ap;
    if (k === 'tint') return save({ tint: +el.value });
    if (!hex(el.value)) return;
    card.querySelectorAll(`[data-ap="${k}"]`).forEach((x) => { if (x !== el) x.value = el.value; });
    save({ [k]: el.value.toLowerCase() });
  });
}
