// A small parser for the website's content markup (lessons, questions, legal pages). The markup
// comes from our own files, so this handles the subset they use rather than all of HTML.
// $...$ is math, matched across the whole string first, exactly like js/util.js tex().

export type HNode =
  | { t: 'text'; s: string }
  | { t: 'math'; tex: string }
  | { t: 'svg'; xml: string; cls: string[] }
  | { t: 'el'; tag: string; cls: string[]; attrs: Record<string, string>; kids: HNode[] };

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', times: '×', minus: '−', deg: '°' };
export const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] ?? m);

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'wbr']);

export function parseHTML(html: string): HNode[] {
  const svgs: string[] = [];
  const maths: string[] = [];
  let src = String(html ?? '')
    .replace(/<svg[\s\S]*?<\/svg>/g, (m) => `<svgph data-i="${svgs.push(m) - 1}"></svgph>`)
    .replace(/\$([^$]+)\$/g, (_, tex) => `\u0001${maths.push(decode(tex)) - 1}\u0002`)
    .replace(/<!--[\s\S]*?-->/g, '');

  const root: HNode & { t: 'el' } = { t: 'el', tag: 'root', cls: [], attrs: {}, kids: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const addText = (raw: string) => {
    if (!raw) return;
    for (const part of raw.split(/(\u0001\d+\u0002)/)) {
      if (!part) continue;
      const m = part.match(/^\u0001(\d+)\u0002$/);
      top().kids.push(m ? { t: 'math', tex: maths[+m[1]] } : { t: 'text', s: decode(part) });
    }
  };

  const re = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let last = 0;
  for (let m; (m = re.exec(src)); ) {
    addText(src.slice(last, m.index));
    last = re.lastIndex;
    const [, close, rawTag, rawAttrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of rawAttrs.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    const cls = (attrs.class || '').split(/\s+/).filter(Boolean);
    if (tag === 'svgph') { top().kids.push({ t: 'svg', xml: svgs[+attrs['data-i']], cls: (svgs[+attrs['data-i']].match(/^<svg[^>]*class="([^"]*)"/)?.[1] || '').split(/\s+/) }); continue; }
    const el: HNode = { t: 'el', tag, cls, attrs, kids: [] };
    top().kids.push(el);
    if (!selfClose && !VOID.has(tag)) stack.push(el);
  }
  addText(src.slice(last));
  return root.kids;
}

/** Plain text of a node tree (for accessibility labels and search). */
export function textOf(nodes: HNode[]): string {
  return nodes.map((n) => (n.t === 'text' ? n.s : n.t === 'math' ? n.tex : n.t === 'el' ? textOf(n.kids) : '')).join('');
}
