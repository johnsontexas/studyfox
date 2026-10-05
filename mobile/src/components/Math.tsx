// Native math: MathJax turns TeX into SVG paths in JavaScript, and react-native-svg draws them.
// No web view involved. Every expression in the site's content renders (checked by scripts/check-shared.mjs).
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
import 'mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import { memo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', { InputJax: new TeX({ packages: ['base', 'ams', 'noundefined'] }), OutputJax: new SVG({ fontCache: 'none' }) });

type Svg = { xml: string; w: number; h: number; va: number };
const cache = new Map<string, Svg>();
export function texToSvg(tex: string, display = false): Svg {
  const key = (display ? 'D' : 'I') + tex;
  let v = cache.get(key);
  if (!v) {
    const svg: string = adaptor.innerHTML(doc.convert(tex, { display }));
    const num = (re: RegExp) => parseFloat(svg.match(re)?.[1] || '0');
    v = {
      // Size is set on the outer <svg> below; inner rects (fraction bars, roots) keep theirs.
      xml: svg.replace(/^<svg[^>]*>/, (tag) => tag.replace(/ (style|width|height|role|focusable)="[^"]*"/g, '')).replace(/ (data-[\w-]+|aria-hidden)="[^"]*"/g, ''),
      w: num(/width="([\d.]+)ex"/), h: num(/height="([\d.]+)ex"/), va: num(/vertical-align: (-?[\d.]+)ex/),
    };
    if (cache.size > 2000) cache.delete(cache.keys().next().value!);
    cache.set(key, v);
  }
  return v;
}

/** Inline math sized to the surrounding text. Place inside <Text>. */
export const MathInline = memo(function MathInline({ tex, fontSize, color }: { tex: string; fontSize: number; color: string }) {
  const m = texToSvg(tex);
  const ex = fontSize * 0.46;
  return (
    <View style={{ width: m.w * ex, height: m.h * ex, transform: [{ translateY: -m.va * ex }] }}>
      <SvgXml xml={m.xml} width={m.w * ex} height={m.h * ex} color={color} />
    </View>
  );
});

/** Centered display math that shrinks to fit narrow screens. */
export const MathBlock = memo(function MathBlock({ tex, fontSize, color, maxWidth }: { tex: string; fontSize: number; color: string; maxWidth: number }) {
  const m = texToSvg(tex, true);
  let ex = fontSize * 0.5;
  if (m.w * ex > maxWidth) ex = maxWidth / m.w;
  return (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      <SvgXml xml={m.xml} width={m.w * ex} height={m.h * ex} color={color} />
    </View>
  );
});
