// Draws the website's lesson and question content with native views: text, lists, callout boxes,
// tables, SVG figures, and math. The content itself comes unchanged from js/content and js/gen.
import { memo, useMemo, type ReactNode } from 'react';
import { Platform, ScrollView, useWindowDimensions, View, type TextStyle } from 'react-native';
import { Text } from './AppText';
import { SvgXml } from 'react-native-svg';
import { decode, parseHTML, type HNode } from '../lib/html';
import { openLink } from '../lib/links';
import { serif, type as T, useColors, type Colors } from '../lib/theme';
import { MathBlock, MathInline } from './Math';

const INLINE = new Set(['b', 'strong', 'i', 'em', 'u', 'a', 'code', 'kbd', 'span', 'sub', 'sup', 'br', 'small', 'mark', 's', 'abbr', 'label']);
const isInline = (n: HNode) => n.t === 'text' || n.t === 'math' || (n.t === 'el' && INLINE.has(n.tag));
const has = (n: HNode, k: string) => n.t === 'el' && n.cls.includes(k);
const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

type Ctx = { c: Colors; size: number; lh: number; color: string; family?: string; width: number; box: string };

// ---------- SVG figures (graphs, triangles, reference shapes) ----------
function themeSvg(xml: string, c: Colors) {
  const s = c.site;
  const attrs = (cls: string[], tag: string) => {
    const a: Record<string, string> = {};
    const on = (k: string) => cls.includes(k);
    if (on('fig-grid')) Object.assign(a, { stroke: s.line, 'stroke-width': '1' });
    if (on('fig-axis')) Object.assign(a, { stroke: s.ink2, 'stroke-width': '1.5', fill: 'none' });
    if (on('fig-tick')) Object.assign(a, { fill: s.muted, 'font-size': '11' });
    if (on('fig-label')) Object.assign(a, { fill: s.ink, 'font-size': '12.5', 'font-weight': '600' });
    if (on('fig-pt')) a.fill = s.brand;
    if (on('fig-fit')) Object.assign(a, { stroke: s.bad, 'stroke-width': '2' });
    if (on('fig-shape')) Object.assign(a, { fill: s.brandSoft, stroke: s.ink, 'stroke-width': '1.8' });
    if (on('fig-mk')) a.stroke = 'none';
    const series = [s.brand, s.mid, s.good, s.bad];
    const sn = cls.find((k) => /^s\d$/.test(k));
    if (sn) {
      const col = series[+sn[1] % 4];
      if (on('fig-series')) Object.assign(a, { stroke: col, fill: 'none', 'stroke-width': '2', ...(sn === 's1' ? { 'stroke-dasharray': '6 4' } : sn === 's2' ? { 'stroke-dasharray': '2 3' } : {}) });
      else if (tag === 'g') a.fill = col;
    }
    return Object.entries(a).map(([k, v]) => ` ${k}="${v}"`).join('');
  };
  const out = xml
    .replace(/<(\w+)([^>]*?)\sclass="([^"]*)"/g, (_, tag, rest, cls) => `<${tag}${rest}${attrs(cls.split(/\s+/), tag)}`)
    .replace(/<circle(?![^>]*\sfill=)/g, `<circle fill="${s.ink}"`)
    .replace(/<text(?![^>]*\sfill=)/g, `<text fill="${s.ink}"`)
    .replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height|style|role|aria-label)="[^"]*"/g, '')}>`);
  const vb = (xml.match(/viewBox="([^"]+)"/)?.[1] || '0 0 100 60').split(/[\s,]+/).map(Number);
  return { xml: out, w: vb[2], h: vb[3] };
}

const Figure = memo(function Figure({ xml, max, ctx }: { xml: string; max: number; ctx: Ctx }) {
  const f = useMemo(() => themeSvg(xml, ctx.c), [xml, ctx.c]);
  const w = Math.min(ctx.width, max);
  return <View style={{ alignItems: 'center', marginVertical: 8 }}><SvgXml xml={f.xml} width={w} height={(w * f.h) / f.w} /></View>;
});

// ---------- Inline ----------
function inline(n: HNode, ctx: Ctx, key: number | string, first = false): ReactNode {
  const { c } = ctx;
  if (n.t === 'text') return n.s.replace(/\s+/g, ' ').replace(first ? /^ / : /$^/, '');
  if (n.t === 'math') return <MathInline key={key} tex={n.tex} fontSize={ctx.size} color={ctx.color} />;
  if (n.t === 'svg') return null;
  const kids = n.kids.map((k, i) => inline(k, ctx, `${key}.${i}`, first && i === 0));
  const style: { -readonly [K in keyof TextStyle]: TextStyle[K] } = {};
  switch (n.tag) {
    case 'br': return '\n';
    case 'b': case 'strong': style.fontWeight = '700'; break;
    case 'i': case 'em': style.fontStyle = 'italic'; break;
    case 'u': style.textDecorationLine = 'underline'; break;
    case 's': style.textDecorationLine = 'line-through'; break;
    case 'code': case 'kbd': Object.assign(style, { fontFamily: mono, fontSize: ctx.size * 0.88, backgroundColor: ctx.box }); break;
    case 'sub': case 'sup': case 'small': style.fontSize = ctx.size * 0.72; break;
    case 'a': {
      const href = n.attrs.href || '';
      return <Text key={key} style={{ color: c.tint }} onPress={() => openLink(href)}>{kids}</Text>;
    }
  }
  if (has(n, 'muted') || has(n, 'pnum')) style.color = c.label2;
  if (has(n, 'small') || has(n, 'pnum')) style.fontSize = ctx.size * 0.8;
  if (has(n, 'blank')) style.letterSpacing = 1;
  if (has(n, 'tag')) Object.assign(style, { fontSize: ctx.size * 0.75, fontWeight: '600', color: c.label2 });
  return <Text key={key} style={style}>{kids}</Text>;
}

function Para({ nodes, ctx, style }: { nodes: HNode[]; ctx: Ctx; style?: TextStyle }) {
  return (
    <Text selectable style={[{ fontSize: ctx.size, lineHeight: ctx.lh, color: ctx.color, fontFamily: ctx.family }, style]}>
      {nodes.map((n, i) => inline(n, ctx, i, i === 0))}
    </Text>
  );
}

// ---------- Blocks ----------
function blocks(nodes: HNode[], ctx: Ctx, gap = 12): ReactNode[] {
  const out: ReactNode[] = [];
  let run: HNode[] = [];
  const flush = () => {
    if (run.some((n) => n.t === 'math' || (n.t === 'text' && n.s.trim()) || (n.t === 'el' && n.tag !== 'br'))) {
      // A paragraph that is only one math expression is shown as display math.
      const only = run.filter((n) => !(n.t === 'text' && !n.s.trim()));
      out.push(only.length === 1 && only[0].t === 'math' && ctx.size >= 17 && run.length <= 3
        ? <MathBlock key={out.length} tex={(only[0] as any).tex} fontSize={ctx.size} color={ctx.color} maxWidth={ctx.width} />
        : <Para key={out.length} nodes={run} ctx={ctx} />);
    }
    run = [];
  };
  for (const n of nodes) {
    if (isInline(n)) { run.push(n); continue; }
    flush();
    const b = block(n, ctx, out.length);
    if (b) out.push(b);
  }
  flush();
  return out.map((b, i) => <View key={i} style={{ marginTop: i ? gap : 0 }}>{b}</View>);
}

function Box({ children, bg, accent }: { children: ReactNode; bg: string; accent?: string }) {
  return <View style={{ backgroundColor: bg, borderRadius: 14, padding: 14, borderLeftWidth: accent ? 4 : 0, borderLeftColor: accent }}>{children}</View>;
}

function Table({ n, ctx }: { n: HNode & { t: 'el' }; ctx: Ctx }) {
  const { c } = ctx;
  const rows: { head: boolean; cells: (HNode & { t: 'el' })[] }[] = [];
  let caption: HNode[] | null = null;
  const walk = (x: HNode, head: boolean) => {
    if (x.t !== 'el') return;
    if (x.tag === 'caption') { caption = x.kids; return; }
    if (x.tag === 'tr') { rows.push({ head, cells: x.kids.filter((k): k is HNode & { t: 'el' } => k.t === 'el' && (k.tag === 'td' || k.tag === 'th')) }); return; }
    x.kids.forEach((k) => walk(k, head || x.tag === 'thead'));
  };
  walk(n, false);
  const cols = Math.max(...rows.map((r) => r.cells.length), 1);
  const len = (x: HNode): number => (x.t === 'text' ? x.s.length : x.t === 'math' ? x.tex.length * 0.6 : x.t === 'el' ? x.kids.reduce((s, k) => s + len(k), 0) : 0);
  const widths = [...Array(cols)].map((_, i) => Math.min(230, Math.max(70, ...rows.map((r) => (r.cells[i] ? Math.min(len(r.cells[i]), 40) * ctx.size * 0.52 + 24 : 0)))));
  const total = widths.reduce((s, w) => s + w, 0);
  const scale = total < ctx.width ? ctx.width / total : 1;
  const cellCtx = { ...ctx, size: ctx.size - 2, lh: (ctx.size - 2) * 1.35, family: undefined };
  return (
    <View>
      {caption ? <Para nodes={caption} ctx={{ ...cellCtx, color: c.label }} style={{ fontWeight: '700', marginBottom: 6 }} /> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -2 }}>
        <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: c.sep }}>
          {rows.map((r, ri) => (
            <View key={ri} style={{ flexDirection: 'row', backgroundColor: r.head ? ctx.box : 'transparent', borderTopWidth: ri ? 1 : 0, borderColor: c.sep }}>
              {r.cells.map((cell, ci) => (
                <View key={ci} style={{ width: widths[ci] * scale, padding: 9, borderLeftWidth: ci ? 1 : 0, borderColor: c.sep }}>
                  <Para nodes={cell.kids} ctx={{ ...cellCtx, color: c.label }} style={{ fontWeight: r.head || cell.tag === 'th' ? '600' : '400' }} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function block(n: HNode, ctx: Ctx, key: number): ReactNode {
  const { c } = ctx;
  if (n.t === 'svg') return <Figure xml={n.xml} max={n.cls.includes('ref-svg') ? 150 : 480} ctx={ctx} />;
  if (n.t !== 'el') return null;
  const kids = n.kids;
  switch (n.tag) {
    case 'p':
      return <Para nodes={kids} ctx={has(n, 'pass-head') ? { ...ctx, family: undefined, size: ctx.size - 3, lh: ctx.lh - 4, color: c.label2 } : has(n, 'muted') ? { ...ctx, color: c.label2 } : ctx} />;
    case 'h1': return <Para nodes={kids} ctx={{ ...ctx, color: c.label, family: undefined }} style={T.title1} />;
    case 'h2': return <Para nodes={kids} ctx={{ ...ctx, color: c.label, family: undefined }} style={{ ...T.title3, marginTop: 10 }} />;
    case 'h3': case 'h4': case 'summary': return <Para nodes={kids} ctx={{ ...ctx, color: c.label, family: undefined }} style={{ ...T.title3, marginTop: 8 }} />;
    case 'ul': case 'ol': {
      const items = kids.filter((k): k is HNode & { t: 'el' } => k.t === 'el' && k.tag === 'li');
      return (
        <View style={{ gap: 8 }}>
          {items.map((li, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, paddingRight: 4 }}>
              <Text style={{ fontSize: ctx.size, lineHeight: ctx.lh, color: n.tag === 'ol' ? c.label2 : c.tint, minWidth: n.tag === 'ol' ? 20 : 10, fontVariant: ['tabular-nums'] }}>{n.tag === 'ol' ? `${i + 1}.` : '•'}</Text>
              <View style={{ flex: 1 }}>{blocks(li.kids, ctx, 8)}</View>
            </View>
          ))}
        </View>
      );
    }
    case 'table': return <Table n={n} ctx={ctx} />;
    case 'figure': return <View>{blocks(kids, ctx, 4)}</View>;
    case 'figcaption': case 'caption':
      return <Para nodes={kids} ctx={{ ...ctx, family: undefined, size: 13, lh: 18, color: has(n, 'fig-note') ? c.label2 : c.label }} style={{ textAlign: 'center', fontWeight: has(n, 'fig-note') ? '400' : '600' }} />;
    case 'pre': return <Box bg={ctx.box}><Text selectable style={{ fontFamily: mono, fontSize: 14, lineHeight: 20, color: c.label }}>{decode(textOfRaw(kids))}</Text></Box>;
    case 'hr': return <View style={{ height: 1, backgroundColor: c.sep }} />;
    case 'button': return null;
    case 'a': return has(n, 'btn') ? <Text style={[T.headline, { color: c.tint }]} onPress={() => openLink(n.attrs.href || '')}>{textOfRaw(kids)}</Text> : <Para nodes={[n]} ctx={ctx} />;
  }
  // divs and everything else, styled by class
  if (has(n, 'tip')) return <Box bg={c.tintSoft}>{blocks(kids, ctx, 8)}</Box>;
  if (has(n, 'rule')) return <Box bg={ctx.box} accent={c.tint}>{blocks(kids, ctx, 8)}</Box>;
  if (has(n, 'worked')) return <Box bg={ctx.box}>{blocks(kids, ctx, 8)}</Box>;
  if (has(n, 'ex')) {
    const good = has(n, 'ex-good');
    return <Box bg={good ? c.goodSoft : c.badSoft} accent={good ? c.good : c.bad}>{blocks(kids, { ...ctx, color: c.label }, 4)}</Box>;
  }
  if (has(n, 'eq') || has(n, 'fmath')) {
    const only = kids.filter((k) => !(k.t === 'text' && !k.s.trim()));
    if (only.length === 1 && only[0].t === 'math') return <MathBlock tex={only[0].tex} fontSize={ctx.size + 1} color={ctx.color} maxWidth={ctx.width - (has(n, 'fmath') ? 28 : 0)} />;
    return <Para nodes={kids} ctx={ctx} style={{ textAlign: 'center' }} />;
  }
  if (has(n, 'fname')) return <Para nodes={kids} ctx={{ ...ctx, size: 12, lh: 16, color: c.label2, family: undefined }} style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 }} />;
  if (has(n, 'fgrid')) return <View style={{ gap: 10 }}>{kids.filter((k) => k.t === 'el').map((k, i) => <View key={i}>{block(k, ctx, i)}</View>)}</View>;
  if (has(n, 'fcell') || has(n, 'card')) return <Box bg={has(n, 'card') ? 'transparent' : ctx.box}>{blocks(kids, { ...ctx, width: ctx.width - 28 }, 6)}</Box>;
  if (has(n, 'ref-grid')) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {kids.filter((k) => k.t === 'el').map((k, i) => (
          <View key={i} style={{ width: (ctx.width - 10) / 2, backgroundColor: ctx.box, borderRadius: 14, padding: 10, alignItems: 'center' }}>
            {blocks((k as any).kids, { ...ctx, width: (ctx.width - 10) / 2 - 20, size: 15, lh: 20 }, 4)}
          </View>
        ))}
      </View>
    );
  }
  if (has(n, 'muted')) return <View>{blocks(kids, { ...ctx, color: c.label2, size: has(n, 'small') ? ctx.size - 2 : ctx.size, lh: has(n, 'small') ? ctx.lh - 3 : ctx.lh })}</View>;
  return <View>{blocks(kids, ctx)}</View>;
}

function textOfRaw(nodes: HNode[]): string {
  return nodes.map((n) => (n.t === 'text' ? n.s : n.t === 'math' ? `$${n.tex}$` : n.t === 'el' ? textOfRaw(n.kids) : '')).join('');
}

// ---------- Public components ----------
type Variant = 'lesson' | 'question' | 'passage' | 'small';
const VARIANTS: Record<Variant, { size: number; lh: number; serif?: boolean }> = {
  lesson: { size: 17, lh: 26 },
  question: { size: 17, lh: 25 },
  passage: { size: 17, lh: 27, serif: true },
  small: { size: 15, lh: 21 },
};

/** Block content (lesson bodies, passages, explanations). `inset` is the horizontal padding around it. */
export const Rich = memo(function Rich({ html, variant = 'lesson', inset = 40, color, box }: { html: string; variant?: Variant; inset?: number; color?: string; box?: string }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const v = VARIANTS[variant];
  const nodes = useMemo(() => parseHTML(html), [html]);
  const ctx: Ctx = { c, size: v.size, lh: v.lh, color: color || c.label, family: v.serif ? serif : undefined, width: Math.min(width, 700) - inset, box: box || c.fill };
  return <View>{blocks(nodes, ctx)}</View>;
});

/** One line of inline content (answer choices, prompts). */
export const RichText = memo(function RichText({ html, size = 17, color, weight, style }: { html: string; size?: number; color?: string; weight?: TextStyle['fontWeight']; style?: TextStyle }) {
  const c = useColors();
  // An answer that's only math (like 64π/3) uses display style, so fractions are full size and easy to read.
  const nodes = useMemo(() => {
    const only = String(html).match(/^\s*\$([^$]+)\$\s*$/);
    return parseHTML(only && /\\[dt]?frac|\\sqrt|\^|_/.test(only[1]) ? `$\\displaystyle ${only[1]}$` : html);
  }, [html]);
  const ctx: Ctx = { c, size, lh: Math.round(size * 1.35), color: color || c.label, width: 300, box: c.fill };
  return <Para nodes={nodes} ctx={ctx} style={{ fontWeight: weight, ...style }} />;
});
