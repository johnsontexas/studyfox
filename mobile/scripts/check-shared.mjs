// Guards the link between the website and the app. The app imports website modules directly
// (see src/lib/shared.ts); this fails loudly if one of those exports is renamed or removed.
// Run from the repo root with `npm test`, or here with `npm test`.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Some website modules render math at import time; give them a stand-in for KaTeX.
globalThis.window ??= globalThis;
globalThis.katex ??= { renderToString: (src) => src };

const here = dirname(fileURLToPath(import.meta.url));
const shared = readFileSync(resolve(here, '../src/lib/shared.ts'), 'utf8');
const libDir = resolve(here, '../src/lib');
let failures = 0;
const fail = (msg) => { failures++; console.error('  FAIL ' + msg); };

// export { a, b } from '../../../js/x.js'
for (const m of shared.matchAll(/export \{([^}]+)\} from '([^']+\.js)'/g)) {
  const names = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
  const mod = await import(pathToFileURL(resolve(libDir, m[2])).href);
  for (const n of names) if (!(n in mod)) fail(`${m[2]} no longer exports ${n}`);
}
// import * as x from '../../../js/x.js'  ...  x.name
for (const m of shared.matchAll(/import \* as (\w+) from '([^']+\.js)'/g)) {
  const mod = await import(pathToFileURL(resolve(libDir, m[2])).href);
  for (const u of new Set([...shared.matchAll(new RegExp(`\\b${m[1]}\\.(\\w+)`, 'g'))].map((x) => x[1]))) {
    if (!(u in mod)) fail(`${m[2]} no longer exports ${u}`);
  }
}

// Every course icon must exist on the website (js/icons.js) and be mapped to an SF Symbol in the app.
const { icon } = await import(pathToFileURL(resolve(here, '../../js/icons.js')).href);
const { COURSES } = await import(pathToFileURL(resolve(here, '../../js/content/courses.js')).href);
const iconSrc = readFileSync(resolve(here, '../src/components/Icon.tsx'), 'utf8');
const empty = icon('__none__');
for (const c of COURSES) {
  if (icon(c.icon) === empty) fail(`course "${c.id}" uses icon "${c.icon}", which js/icons.js doesn't have`);
  if (!new RegExp(`\\b${c.icon}: \\[`).test(iconSrc)) fail(`course "${c.id}" uses icon "${c.icon}"; add it to the MAP in mobile/src/components/Icon.tsx`);
}

// The app draws math natively with MathJax. Every expression in courses, the question bank, and the
// formula sheet must convert without errors. (Skipped if the app's packages aren't installed.)
const req = createRequire(resolve(here, '../package.json'));
let mj = null;
try { mj = { mathjax: req('mathjax-full/js/mathjax.js').mathjax, TeX: req('mathjax-full/js/input/tex.js').TeX, SVG: req('mathjax-full/js/output/svg.js').SVG, lite: req('mathjax-full/js/adaptors/liteAdaptor.js').liteAdaptor, reg: req('mathjax-full/js/handlers/html.js').RegisterHTMLHandler }; } catch { console.log('  (math check skipped: run npm install in mobile/)'); }
if (mj) {
  for (const f of ['base/BaseConfiguration', 'ams/AmsConfiguration', 'noundefined/NoUndefinedConfiguration']) req(`mathjax-full/js/input/tex/${f}.js`);
  const ad = mj.lite(); mj.reg(ad);
  const doc = mj.mathjax.document('', { InputJax: new mj.TeX({ packages: ['base', 'ams', 'noundefined'] }), OutputJax: new mj.SVG({ fontCache: 'none' }) });
  const { bank } = await import(pathToFileURL(resolve(here, '../../js/gen/bank.js')).href);
  const { regen } = await import(pathToFileURL(resolve(here, '../../js/gen/index.js')).href);
  const { formulasView } = await import(pathToFileURL(resolve(here, '../../js/views/formulas.js')).href);
  const hs = [];
  for (const c of COURSES) for (const l of c.lessons) { hs.push(l.body); if (l.check) hs.push(l.check.q, l.check.why, ...l.check.choices); }
  for (const t of ['SAT', 'ACT']) for (const e of bank(t)) { const q = regen(e.id); hs.push(q.passage, q.stem, q.expl, ...(q.choices || []), q.answerDisplay ? `$${q.answerDisplay}$` : ''); }
  const fr = { innerHTML: '' }; formulasView(fr); hs.push(fr.innerHTML);
  const texs = new Set(); for (const h of hs) if (h) for (const m of String(h).matchAll(/\$([^$]+)\$/g)) texs.add(m[1]);
  const dec = (x) => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  for (const t of texs) { const out = ad.innerHTML(doc.convert(dec(t), { display: false })); if (/data-mjx-error|merror/.test(out)) fail(`math "${t}" doesn't render in the app (${out.match(/data-mjx-error="([^"]*)"/)?.[1] || 'error'})`); }
}

// Pages the app renders by capturing website views must still only set innerHTML.
const capture = (view) => { const root = { innerHTML: '', addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }; view(root); return root.innerHTML; };
const legal = await import(pathToFileURL(resolve(here, '../../js/views/legal.js')).href);
for (const v of ['privacyView', 'termsView']) if (!capture(legal[v]).includes('<h1>')) fail(`js/views/legal.js ${v} no longer renders a page`);

if (failures) { console.error(`\nThe app depends on these website exports. Update mobile/src/lib/shared.ts to match.`); process.exit(1); }
console.log('App and website share code correctly.');
