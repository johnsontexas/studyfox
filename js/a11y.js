// Accessibility options from Settings: reading font (incl. OpenDyslexic), text size, spacing,
// contrast, motion, and link underlines. Each one is a data attribute on <html> that styles.css reads.
import { store } from './store.js';

export const A11Y_DEFAULTS = { font: 'default', size: 'normal', spacing: false, contrast: false, motion: false, links: false };

const FONT_CSS = {
  dyslexic: ['https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5/index.css', 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5/700.css'],
  lexend: ['https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap'],
  atkinson: ['https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'],
};

export const a11y = () => ({ ...A11Y_DEFAULTS, ...(store.data().settings.a11y || {}) });

// Fonts load only once someone turns them on.
function loadFont(font) {
  for (const href of FONT_CSS[font] || []) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
  }
}

export function applyA11y() {
  const o = a11y(), d = document.documentElement.dataset;
  if (o.font !== 'default') loadFont(o.font);
  d.font = o.font; d.textSize = o.size;
  for (const k of ['spacing', 'contrast', 'motion', 'links']) { if (o[k]) d[k] = 'on'; else delete d[k]; }
}

const toggle = (key, label, hint) => `<label class="a11y-toggle"><span><b>${label}</b><span class="muted small">${hint}</span></span><input type="checkbox" class="switch" data-a11y="${key}"></label>`;

export const a11yCardHTML = () => `<div class="card stack" id="a11yCard">
  <h2 class="h3">Accessibility</h2>
  <p class="muted small">Changes apply right away on this device.</p>
  <div class="grid2">
    <label>Reading font<select data-a11y="font">
      <option value="default">StudyFox default</option>
      <option value="dyslexic">OpenDyslexic (dyslexia-friendly)</option>
      <option value="lexend">Lexend (easier reading)</option>
      <option value="atkinson">Atkinson Hyperlegible (low vision)</option>
    </select></label>
    <label>Text size<select data-a11y="size">
      <option value="normal">Normal</option><option value="large">Large</option><option value="xl">Extra large</option>
    </select></label>
  </div>
  ${toggle('spacing', 'Extra spacing', 'More space between letters, words, and lines.')}
  ${toggle('contrast', 'High contrast', 'Stronger text and borders.')}
  ${toggle('motion', 'Reduce motion', 'Turns off animations and card flips.')}
  ${toggle('links', 'Underline links', 'Makes every link easy to spot.')}
  <p class="a11y-sample">The quick brown fox jumps over the lazy dog. 0123456789</p>
</div>`;

export function wireA11y(root) {
  const o = a11y();
  root.querySelectorAll('[data-a11y]').forEach((el) => {
    const k = el.dataset.a11y;
    if (el.type === 'checkbox') el.checked = !!o[k]; else el.value = o[k];
    el.addEventListener('change', () => {
      const s = store.data().settings;
      s.a11y = { ...a11y(), [k]: el.type === 'checkbox' ? el.checked : el.value };
      store.save(); applyA11y();
    });
  });
}
