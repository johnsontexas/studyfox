// Production build, run by Netlify on every deploy (see netlify.toml). Locally the site runs straight from js/.
// Bundles and minifies js/app.js into build/ (one file per page group, loaded on demand), minifies the CSS,
// and points index.html at the built files. File names carry a content hash so they can be cached forever.
import { build } from 'esbuild';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'build');
rmSync(OUT, { recursive: true, force: true });

const js = await build({
  entryPoints: [join(ROOT, 'js/app.js')], bundle: true, splitting: true, format: 'esm', minify: true, target: 'es2020',
  external: ['https://*'], outdir: OUT, entryNames: '[name]-[hash]', chunkNames: 'c-[hash]', metafile: true, legalComments: 'none',
});
const css = await build({
  entryPoints: [join(ROOT, 'css/styles.css')], bundle: true, minify: true, outdir: OUT, entryNames: '[name]-[hash]', metafile: true,
  external: ['*.svg', '*.png', '*.woff2'],
});
const out = (meta, start) => basename(Object.keys(meta.outputs).find((f) => basename(f).startsWith(start) && !f.endsWith('.map')));
const appJs = out(js.metafile, 'app-'), stylesCss = out(css.metafile, 'styles-');

const file = join(ROOT, 'index.html');
let html = readFileSync(file, 'utf8');
const swaps = [['href="css/styles.css"', `href="build/${stylesCss}"`], ['href="js/app.js"', `href="build/${appJs}"`], ['src="js/app.js"', `src="build/${appJs}"`]];
for (const [a, b] of swaps) {
  if (!html.includes(a)) throw new Error(`index.html is missing ${a}`);
  html = html.replace(a, b);
}
writeFileSync(file, html);
console.log(`Built build/${appJs}, build/${stylesCss} and ${Object.keys(js.metafile.outputs).length - 1} more files.`);
