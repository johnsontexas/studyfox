// Fox avatars. Every player is a fox; they pick its fur, eyes, mouth, shirt + shirt color (upper body
// only), hat and glasses. foxSVG(avatar) returns an SVG string (no DOM), so the iOS app renders the
// same art with SvgXml.
//
// An avatar is a small object: { fur, eyes, mouth, shirt, color, hat, glasses }. Item ids are stable:
// they're saved in settings.avatar (synced with progress) and members.avatar (shown on leaderboards).
//
// Adding items without a website update: insert a row in Supabase table avatar_items
// (supabase/avatar_items.sql, how-to in docs/avatar-items.md). loadAvatarItems() merges those rows
// into the lists below at startup. Items can be exclusive: unlock = { kind, n } (see UNLOCKS).

const INK = '#22201c';

/** Fur colors: natural fox shades only. Orange is the default fox. */
export const FURS = [
  { id: 'orange', name: 'Orange', fur: '#e07a35', dark: '#a9521f', light: '#fff7ee' },
  { id: 'rust', name: 'Rust', fur: '#c2562c', dark: '#8a3518', light: '#fff3ea' },
  { id: 'ginger', name: 'Ginger', fur: '#d8692a', dark: '#9c4416', light: '#fdf1e4' },
  { id: 'golden', name: 'Golden', fur: '#dca04a', dark: '#a8722a', light: '#fffaf0' },
  { id: 'sand', name: 'Sand', fur: '#e3c28f', dark: '#b08e5c', light: '#fffcf5' },
  { id: 'tan', name: 'Tan', fur: '#c9a27a', dark: '#93704e', light: '#fffaf3' },
  { id: 'cinnamon', name: 'Cinnamon', fur: '#a8643a', dark: '#723f20', light: '#f8ece0' },
  { id: 'brown', name: 'Brown', fur: '#8f5f3e', dark: '#5f3c26', light: '#f7ede3' },
  { id: 'chocolate', name: 'Dark brown', fur: '#5e3d2b', dark: '#3a2419', light: '#efe4da' },
  { id: 'cream', name: 'Cream', fur: '#efe2c8', dark: '#c2ad86', light: '#ffffff' },
  { id: 'arctic', name: 'Arctic white', fur: '#f1eee8', dark: '#c9c2b7', light: '#ffffff' },
  { id: 'grey', name: 'Grey', fur: '#9a9893', dark: '#686660', light: '#f7f6f3' },
  { id: 'smoky', name: 'Smoky', fur: '#7a746c', dark: '#4e4943', light: '#efece7' },
  { id: 'charcoal', name: 'Charcoal', fur: '#55524d', dark: '#34322f', light: '#ebe8e3' },
  // Exclusive: rare coat for students who answer a lot of questions.
  { id: 'silverfox', name: 'Silver fox', fur: '#c3c7cb', dark: '#7f868d', light: '#ffffff', unlock: { kind: 'questions', n: 1000 } },
];

/** Eye expressions. */
export const EYES = [
  { id: 'open', name: 'Dots' },
  { id: 'shiny', name: 'Shiny' },
  { id: 'smile', name: 'Smiling' },
  { id: 'wink', name: 'Wink' },
  { id: 'blink', name: 'Blinking' },
  { id: 'sparkle', name: 'Sparkly' },
  { id: 'side', name: 'Side-eye' },
  { id: 'mad', name: 'Mad' },
  { id: 'worried', name: 'Worried' },
  { id: 'sleepy', name: 'Sleepy' },
  { id: 'wide', name: 'Surprised' },
  { id: 'teary', name: 'Teary' },
  { id: 'focused', name: 'Focused' },
];

/** Mouth expressions. */
export const MOUTHS = [
  { id: 'smile', name: 'Smile' },
  { id: 'grin', name: 'Grin' },
  { id: 'teeth', name: 'Big smile' },
  { id: 'open', name: 'Laughing' },
  { id: 'tongue', name: 'Tongue out' },
  { id: 'blep', name: 'Blep' },
  { id: 'smirk', name: 'Smirk' },
  { id: 'cat', name: 'Cat smile' },
  { id: 'flat', name: 'Neutral' },
  { id: 'wavy', name: 'Nervous' },
  { id: 'frown', name: 'Frown' },
  { id: 'o', name: 'Oh' },
  { id: 'whistle', name: 'Whistling' },
];

/** Upper-body tops. Each uses the chosen shirt color. */
export const SHIRTS = [
  { id: 'tee', name: 'Crew-neck tee' },
  { id: 'vneck', name: 'V-neck tee' },
  { id: 'henley', name: 'Henley' },
  { id: 'polo', name: 'Polo' },
  { id: 'oxford', name: 'Button-down' },
  { id: 'mockneck', name: 'Mock neck' },
  { id: 'turtleneck', name: 'Turtleneck' },
  { id: 'stripes', name: 'Striped tee' },
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'vest', name: 'Sweater vest' },
  { id: 'cardigan', name: 'Cardigan' },
  { id: 'tie', name: 'Shirt and tie' },
  { id: 'varsity', name: 'Varsity jacket' },
  { id: 'jersey', name: 'Jersey' },
  // Exclusives
  { id: 'sash', name: 'Ambassador sash', unlock: { kind: 'shares', n: 5 } },
  { id: 'letterman', name: 'Gold letter jacket', unlock: { kind: 'streak', n: 30 } },
];

/** Shirt colors. Muted, printed-looking shades that sit well next to fox fur. */
export const COLORS = [
  { id: 'navy', name: 'Navy', hex: '#2f4f7f' },
  { id: 'blue', name: 'Blue', hex: '#3f74b5' },
  { id: 'sky', name: 'Sky', hex: '#8dbbe0' },
  { id: 'forest', name: 'Forest', hex: '#2f6b4a' },
  { id: 'sage', name: 'Sage', hex: '#94b49a' },
  { id: 'olive', name: 'Olive', hex: '#7a7a3a' },
  { id: 'mustard', name: 'Mustard', hex: '#d9a53a' },
  { id: 'cream', name: 'Cream', hex: '#efe4cc' },
  { id: 'white', name: 'White', hex: '#f7f5f0' },
  { id: 'grey', name: 'Heather grey', hex: '#a4a7ab' },
  { id: 'black', name: 'Black', hex: '#2b2a29' },
  { id: 'maroon', name: 'Maroon', hex: '#7c2a35' },
  { id: 'red', name: 'Red', hex: '#c8413f' },
  { id: 'coral', name: 'Coral', hex: '#e8816b' },
  { id: 'pink', name: 'Pink', hex: '#e7a3b5' },
  { id: 'lilac', name: 'Lilac', hex: '#a993cf' },
  { id: 'purple', name: 'Purple', hex: '#6a4a9a' },
  { id: 'teal', name: 'Teal', hex: '#2f7f80' },
];

export const HATS = [
  { id: 'none', name: 'No hat' },
  { id: 'cap', name: 'Baseball cap' },
  { id: 'backwards', name: 'Backwards cap' },
  { id: 'beanie', name: 'Beanie' },
  { id: 'grad', name: 'Graduation cap' },
  { id: 'beret', name: 'Beret' },
  { id: 'bucket', name: 'Bucket hat' },
  { id: 'headband', name: 'Headband' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'bow', name: 'Bow' },
  { id: 'flower', name: 'Flower' },
  // Exclusives
  { id: 'crown', name: 'Crown', unlock: { kind: 'shares', n: 10 } },
  { id: 'flame', name: 'Streak flame', unlock: { kind: 'streak', n: 14 } },
  { id: 'laurel', name: 'Laurel wreath', unlock: { kind: 'lessons', n: 50 } },
];

export const GLASSES = [
  { id: 'none', name: 'No glasses' },
  { id: 'round', name: 'Round glasses' },
  { id: 'square', name: 'Square glasses' },
  { id: 'wire', name: 'Wire frames' },
  { id: 'half', name: 'Reading glasses' },
  { id: 'shades', name: 'Sunglasses' },
  { id: 'cateye', name: 'Cat-eye glasses' },
  { id: 'monocle', name: 'Monocle' },
  { id: 'goggles', name: 'Lab goggles' },
  // Exclusive
  { id: 'gold', name: 'Gold frames', unlock: { kind: 'questions', n: 250 } },
];

export const PARTS = { fur: FURS, eyes: EYES, mouth: MOUTHS, shirt: SHIRTS, color: COLORS, hat: HATS, glasses: GLASSES };
export const PART_NAMES = { fur: 'Fur', eyes: 'Eyes', mouth: 'Mouth', shirt: 'Shirt', color: 'Shirt color', hat: 'Hat', glasses: 'Glasses' };

/** How exclusive items are earned. stats = { shares, streak, questions, lessons }. */
export const UNLOCKS = {
  shares: (n) => `Share StudyFox with ${n} ${n === 1 ? 'friend' : 'friends'} who join`,
  streak: (n) => `Reach a ${n}-day study streak`,
  questions: (n) => `Answer ${n.toLocaleString()} practice questions`,
  lessons: (n) => `Finish ${n} lessons`,
};
export const unlockText = (u) => (u && UNLOCKS[u.kind] ? UNLOCKS[u.kind](u.n) : '');
/** True if the item is free, or the student has met its unlock goal (or unlocked it before). */
export function isUnlocked(item, stats = {}, had = []) {
  if (!item?.unlock) return true;
  if (had.includes(item.id)) return true;
  return (stats[item.unlock.kind] || 0) >= item.unlock.n;
}

const ids = (list, free = false) => list.filter((x) => !free || !x.unlock).map((x) => x.id);

// Small seeded random, so the same account always gets the same starting fox.
function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed || Math.random())) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

// A few hand-picked starting looks, then the rest are mixed at random from the free items.
const PRESETS = [
  { shirt: 'oxford', color: 'sky', glasses: 'round', hat: 'none', eyes: 'open', mouth: 'smile' },
  { shirt: 'vest', color: 'forest', glasses: 'square', hat: 'none', eyes: 'smile', mouth: 'grin' },
  { shirt: 'polo', color: 'navy', glasses: 'none', hat: 'cap', eyes: 'wink', mouth: 'smirk' },
  { shirt: 'cardigan', color: 'mustard', glasses: 'wire', hat: 'beret', eyes: 'open', mouth: 'cat' },
  { shirt: 'hoodie', color: 'grey', glasses: 'none', hat: 'headphones', eyes: 'sparkle', mouth: 'teeth' },
  { shirt: 'turtleneck', color: 'black', glasses: 'round', hat: 'none', eyes: 'focused', mouth: 'flat' },
  { shirt: 'tie', color: 'white', glasses: 'half', hat: 'none', eyes: 'smile', mouth: 'smile' },
  { shirt: 'henley', color: 'sage', glasses: 'none', hat: 'beanie', eyes: 'open', mouth: 'tongue' },
];

/** The starting fox: orange fur and a random preppy-leaning look. Same seed, same fox. */
export function defaultAvatar(seed) {
  const r = rng(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  if (r() < 0.5) return { fur: 'orange', ...pick(PRESETS) };
  return {
    fur: 'orange',
    eyes: pick(['open', 'open', 'shiny', 'smile', 'wink']),
    mouth: pick(['smile', 'smile', 'grin', 'teeth', 'cat', 'tongue']),
    shirt: r() < 0.6 ? pick(['polo', 'oxford', 'vest', 'cardigan', 'tie']) : pick(ids(SHIRTS, true)),
    color: pick(ids(COLORS)),
    hat: r() < 0.6 ? 'none' : pick(ids(HATS, true).slice(1)),
    glasses: r() < 0.5 ? pick(['round', 'square', 'wire']) : pick(ids(GLASSES, true)),
  };
}

/** Fill in missing or unknown parts, so old or bad data still draws a fox. */
export function cleanAvatar(a, seed) {
  const d = defaultAvatar(seed);
  const src = a && typeof a === 'object' ? a : {};
  return Object.fromEntries(Object.keys(PARTS).map((k) => [k, ids(PARTS[k]).includes(src[k]) ? src[k] : d[k]]));
}

/* ---------- Items from Supabase (table avatar_items) ---------- */

// Only plain drawing tags and attributes are allowed in item art, so a row can't run script.
const SAFE = /^(?:[^<]|<\/?(?:path|circle|ellipse|rect|line|polyline|polygon|g|text)\b(?:\s+(?:d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|opacity|fill-opacity|transform|font-size|font-weight|font-family|text-anchor)="[^"<>]*")*\s*\/?>)*$/;
export const safeArt = (svg) => typeof svg === 'string' && svg.length < 6000 && SAFE.test(svg);

/**
 * Merge rows from avatar_items into the item lists. Rows: { part, item_id, name, art, colors, unlock, sort }.
 * art is an SVG fragment in the 100x100 fox space; it can use {ink} {fur} {dark} {light} {c} {c2}.
 * Fur rows use colors { fur, dark, light }; shirt-color rows use colors { hex }.
 */
export function addItems(rows) {
  for (const r of rows || []) {
    const list = PARTS[r.part];
    if (!list || !/^[a-z]{1,20}$/.test(r.item_id || '') || list.some((x) => x.id === r.item_id)) continue;
    const item = { id: r.item_id, name: String(r.name || r.item_id).slice(0, 40) };
    if (r.unlock && UNLOCKS[r.unlock.kind] && Number(r.unlock.n) > 0) item.unlock = { kind: r.unlock.kind, n: Number(r.unlock.n) };
    const hex = (v) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : null);
    if (r.part === 'fur') { const c = r.colors || {}; if (!hex(c.fur)) continue; Object.assign(item, { fur: c.fur, dark: hex(c.dark) || c.fur, light: hex(c.light) || '#ffffff' }); }
    else if (r.part === 'color') { if (!hex(r.colors?.hex)) continue; item.hex = r.colors.hex; }
    else { if (!safeArt(r.art)) continue; item.art = r.art; }
    list.push(item);
  }
}

/** Load extra items once (call at startup with a Supabase client). Resolves the number added. */
export async function loadAvatarItems(client) {
  try {
    const sb = await client;
    if (!sb) return 0;
    const { data, error } = await sb.from('avatar_items').select('part,item_id,name,art,colors,unlock,sort').eq('hidden', false).order('sort');
    if (error) return 0;
    const before = Object.values(PARTS).reduce((n, l) => n + l.length, 0);
    addItems(data);
    return Object.values(PARTS).reduce((n, l) => n + l.length, 0) - before;
  } catch { return 0; }
}

/* ---------- Drawing (100 x 100, clipped to a circle) ---------- */

// Flat style: shapes are solid color with no outline (S). Small pieces that need an edge to read,
// like glasses frames and open mouths, use the outlined version (SO).
const S = (d, fill, extra = '') => (fill === 'none' ? '' : `<path d="${d}" fill="${fill}"${extra.replace(/ stroke-width="[^"]*"/g, '')}/>`);
const SO = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
const L = (d, w = 2.4, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (cx, cy, r, fill, sw = 1.6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
}
const isLight = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170; };

const BODY = 'M6 104C8 85 27 77.5 50 77.5S92 85 94 104z';
const CREW = 'M40 80c2 5 6 7 10 7s8-2 10-7';
function shirt(id, c) {
  const c2 = shade(c, -0.22), trim = isLight(c) ? '#2f4f7f' : '#f7f5f0';
  switch (id) {
    case 'vneck': return S(BODY, c) + S('M40 80l10 11 10-11', c2);
    case 'henley': return S(BODY, c) + S(CREW, c2) + L('M50 87v10', 1.6) + C(50, 90, 1, INK, 0) + C(50, 94, 1, INK, 0);
    case 'polo': return S(BODY, c) + S('M40 80l10 9 10-9-4 11h-12z', c2) + L('M50 89v10', 1.6) + C(50, 93, 1, INK, 0);
    case 'oxford': return S(BODY, c) + S('M40 79l10 8-6 7-6-8zM60 79l-10 8 6 7 6-8z', shade(c, 0.25)) + L('M50 87v17', 1.6) + C(50, 96, 1, INK, 0) + C(50, 101, 1, INK, 0);
    case 'mockneck': return S(BODY, c) + S('M39 80c1-4 6-6 11-6s10 2 11 6c-2 4-6 6-11 6s-9-2-11-6z', c2);
    case 'turtleneck': return S(BODY, c) + S('M38 81c0-6 6-10 12-10s12 4 12 10c-3 4-7 6-12 6s-9-2-12-6z', c2) + L('M40 77c6 2 14 2 20 0', 1.4);
    case 'stripes': return S(BODY, '#f7f5f0') + L('M15 90h70M12 97h76', 4, c) + S(BODY, 'none') + S(CREW, '#f7f5f0');
    case 'hoodie': return S(BODY, c) + S('M32 82c4 6 10 9 18 9s14-3 18-9', c2) + L('M45 90v9M55 90v9', 1.8, '#f7f5f0') + S('M38 104c0-5 5-7 12-7s12 2 12 7', c2);
    case 'vest': return S(BODY, '#f7f5f0') + S('M22 104c1-12 6-19 14-22l14 18 14-18c8 3 13 10 14 22z', c) + L('M36 82l14 18 14-18', 2) + S('M44 80l6 7 6-7', '#f7f5f0');
    case 'cardigan': return S(BODY, '#f7f5f0') + S('M38 80l12 14 12-14 14 6c7 5 10 10 12 18H12c2-8 5-13 12-18z', c) + L('M50 94v10', 2) + C(46, 99, 1.3, INK, 0);
    case 'tie': return S(BODY, '#f7f5f0') + S('M40 80l10 7 10-7 2 7-12 4-12-4z', '#ffffff') + S('M47 88h6l2 4-3 12h-4l-3-12z', c);
    case 'varsity': return S(BODY, c) + S('M10 104c1-12 6-19 13-22l4 22z', '#f4efe6') + S('M90 104c-1-12-6-19-13-22l-4 22z', '#f4efe6') + L('M50 86v18', 2) + S('M37 80l13 8 13-8', INK);
    case 'jersey': return S(BODY, c) + S('M38 80c2 7 6 10 12 10s10-3 12-10', trim) + `<text x="50" y="102" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="12" fill="${trim}" stroke="${INK}" stroke-width=".8">1</text>`;
    case 'sash': return S(BODY, c) + S(CREW, c2) + S('M30 82l44 22h-14L26 88z', '#d9a53a') + `<path d="M58 99l2 2.5 3-.3-2 2.2 1 3-3-1.4-2.6 1.8.4-3.1-2.4-2 3.1-.4z" fill="#fff"/>`;
    case 'letterman': return S(BODY, '#d9a53a') + S('M10 104c1-12 6-19 13-22l4 22zM90 104c-1-12-6-19-13-22l-4 22z', INK) + L('M50 86v18', 2) + S('M37 80l13 8 13-8', '#7c2a35') + `<text x="36" y="101" font-family="Georgia,serif" font-weight="700" font-size="12" fill="#7c2a35">S</text>`;
    default: return S(BODY, c) + S(CREW, c2);
  }
}

function hat(id) {
  switch (id) {
    case 'cap': return S('M28 33c2-12 11-18 22-18s20 6 22 18z', '#2f5d9e') + S('M60 33c8-1 16 1 22 5-8 1-15 0-22-1z', '#24497c') + C(50, 15, 2.2, '#24497c');
    case 'backwards': return S('M28 33c2-12 11-18 22-18s20 6 22 18z', '#c8413f') + S('M40 33c-8-1-16 1-22 5 8 1 15 0 22-1z', '#a33331') + S('M45 30h10v4H45z', '#f7f5f0', ' stroke-width="1.4"');
    case 'beanie': return S('M27 36c0-15 10-24 23-24s23 9 23 24z', '#c8413f') + S('M25 32h50v7H25z', '#a33331') + C(50, 11, 5, '#ffffff', 2);
    case 'grad': return S('M32 30c0-5 8-8 18-8s18 3 18 8v6H32z', INK) + S('M50 12l30 10-30 10-30-10z', '#2b2926') + L('M76 23v12', 1.8, '#d9a53a') + C(76, 36, 2, '#d9a53a', 0);
    case 'beret': return S('M26 30c0-10 12-16 26-15s24 7 22 15c-1 4-8 6-24 6s-24-2-24-6z', '#7c2a35') + L('M52 15v-4', 2.4);
    case 'bucket': return S('M34 31c1-10 7-15 16-15s15 5 16 15z', '#d9c38f') + S('M22 36c4-5 14-6 28-6s24 1 28 6c-6 3-16 4-28 4s-22-1-28-4z', '#c4ab72');
    case 'headband': return S('M24 38c6-6 15-9 26-9s20 3 26 9l-2 5c-6-5-14-8-24-8s-18 3-24 8z', '#3f74b5');
    case 'headphones': return L('M22 52c0-22 12-34 28-34s28 12 28 34', 5, INK) + L('M22 52c0-22 12-34 28-34s28 12 28 34', 2.5, '#2f5d9e') + S('M16 46h9v16h-9z', '#2f5d9e') + S('M75 46h9v16h-9z', '#2f5d9e');
    case 'bow': return S('M50 26l-12-8v16z', '#e7a3b5') + S('M50 26l12-8v16z', '#e7a3b5') + C(50, 26, 3.4, '#c96487', 2);
    case 'flower': return [0, 72, 144, 216, 288].map((a) => `<ellipse cx="68" cy="22" rx="3.4" ry="5.2" fill="#f7f5f0" stroke="${INK}" stroke-width="1.4" transform="rotate(${a} 68 27)"/>`).join('') + C(68, 27, 2.6, '#d9a53a', 1.4);
    case 'crown': return S('M33 32l-2-16 10 8 9-12 9 12 10-8-2 16z', '#d9a53a') + C(50, 25, 2.2, '#c8413f', 1.4);
    case 'flame': return S('M50 30c-7 0-11-5-10-11 1-5 5-6 5-11 4 3 4 6 4 8 2-2 2-5 1-8 6 4 11 9 10 15-1 5-5 7-10 7z', '#e8772e') + S('M50 29c-3 0-5-2-4-5 1-2 3-3 3-5 3 2 5 4 5 6 0 3-2 4-4 4z', '#f2c14e', ' stroke-width="1.2"');
    case 'laurel': return [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${30 + i * 3}" cy="${36 - i * 4}" rx="2.6" ry="5" fill="#7a9a4a" stroke="${INK}" stroke-width="1.2" transform="rotate(${-40 + i * 12} ${30 + i * 3} ${36 - i * 4})"/><ellipse cx="${70 - i * 3}" cy="${36 - i * 4}" rx="2.6" ry="5" fill="#7a9a4a" stroke="${INK}" stroke-width="1.2" transform="rotate(${40 - i * 12} ${70 - i * 3} ${36 - i * 4})"/>`).join('');
    default: return '';
  }
}

function glasses(id) {
  const lens = (cx, r = 7, color = INK, w = 2.4) => `<circle cx="${cx}" cy="51" r="${r}" fill="#ffffff" fill-opacity=".25" stroke="${color}" stroke-width="${w}"/>`;
  switch (id) {
    case 'round': return lens(39) + lens(61) + L('M46 50c2-2 6-2 8 0M32 50l-8-3M68 50l8-3', 2);
    case 'wire': return lens(39, 6.5, '#8a8f96', 1.4) + lens(61, 6.5, '#8a8f96', 1.4) + L('M45.5 50c2-1.5 7-1.5 9 0M32.5 50l-8-3M67.5 50l8-3', 1.3, '#8a8f96');
    case 'gold': return lens(39, 7, '#c9a24a', 2.2) + lens(61, 7, '#c9a24a', 2.2) + L('M46 50c2-2 6-2 8 0M32 50l-8-3M68 50l8-3', 1.8, '#c9a24a');
    case 'square': return SO('M30 45h17v12H30z', '#ffffff', ' fill-opacity=".25"') + SO('M53 45h17v12H53z', '#ffffff', ' fill-opacity=".25"') + L('M47 49h6M30 48l-6-2M70 48l6-2', 2.4);
    case 'half': return SO('M31 52h15l-1 4c-1 2-3 3-6 3s-6-1-7-3z', '#ffffff', ' fill-opacity=".3"') + SO('M54 52h15l-1 4c-1 2-3 3-6 3s-6-1-7-3z', '#ffffff', ' fill-opacity=".3"') + L('M46 53h8M31 52l-6-2M69 52l6-2', 1.8);
    case 'shades': return SO('M29 46h18l-1 7c-1 4-4 6-8 6s-8-2-9-6z', INK) + SO('M53 46h18l-1 7c-1 4-4 6-8 6s-8-2-9-6z', INK) + L('M47 48h6M29 47l-5-2M71 47l5-2', 2.4);
    case 'cateye': return SO('M29 46c6-1 13 0 18 1l-1 6c-1 4-4 6-8 6s-7-2-8-6z', '#e7a3b5', ' fill-opacity=".55"') + SO('M53 47c5-1 12-2 18-1l-1 7c-1 4-4 6-8 6s-7-2-8-6z', '#e7a3b5', ' fill-opacity=".55"') + L('M47 49h6', 2.2) + L('M29 46l-4-4M71 46l4-4', 2.4);
    case 'monocle': return `<circle cx="61" cy="51" r="7.5" fill="#ffffff" fill-opacity=".3" stroke="#c9a24a" stroke-width="2.6"/>` + L('M66 57c2 8 0 14-4 20', 1.4, '#c9a24a');
    case 'goggles': return L('M24 49h52', 4, '#2f6f6a') + SO('M29 44h17v13H29z', '#bfe8e3', ' fill-opacity=".7"') + SO('M54 44h17v13H54z', '#bfe8e3', ' fill-opacity=".7"') + L('M46 50h8', 2.4);
    default: return '';
  }
}

const dot = (x, y, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`;
const shine = (x, y, r = 1.1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;
function faceEyes(id) {
  switch (id) {
    case 'smile': return L('M35 52c2-3 6-3 8 0M57 52c2-3 6-3 8 0', 2.6);
    case 'wink': return dot(39, 51) + L('M57 52c2-3 6-3 8 0', 2.6);
    case 'blink': return L('M35 51h8M57 51h8', 2.6);
    case 'shiny': return dot(39, 51) + dot(61, 51) + shine(40.1, 49.9) + shine(62.1, 49.9);
    case 'sparkle': return dot(39, 51, 3.6) + dot(61, 51, 3.6) + shine(40.2, 49.8) + shine(62.2, 49.8) + shine(37.9, 52.3, .55) + shine(59.9, 52.3, .55);
    case 'side': return L('M35 48.5h8M57 48.5h8', 1.6) + dot(41.5, 51.5, 2.4) + dot(63.5, 51.5, 2.4);
    case 'mad': return dot(39, 52) + dot(61, 52) + L('M33 45l10 3M67 45l-10 3', 2.6);
    case 'worried': return dot(39, 52) + dot(61, 52) + L('M34 47l9-3M66 47l-9-3', 2.2);
    case 'sleepy': return L('M35 50c2 3 6 3 8 0M57 50c2 3 6 3 8 0', 2.6) + L('M35 50h8M57 50h8', 2);
    case 'wide': return `<circle cx="39" cy="51" r="4.6" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="61" cy="51" r="4.6" fill="#fff" stroke="${INK}" stroke-width="2"/>` + dot(39, 51.5, 2) + dot(61, 51.5, 2);
    case 'teary': return dot(39, 51) + dot(61, 51) + shine(40, 49.8) + shine(62, 49.8) + `<path d="M35 55c-1 2-1 3.5 0 4.5 1-1 1-2.5 0-4.5z" fill="#8dbbe0"/>`;
    case 'focused': return dot(39, 52, 2.6) + dot(61, 52, 2.6) + L('M34 47.5h9M57 47.5h9', 2.2);
    default: return dot(39, 51) + dot(61, 51) + shine(40, 49.6) + shine(62, 49.6);
  }
}
function mouth(id) {
  switch (id) {
    case 'grin': return SO('M43 67c2 4 12 4 14 0z', '#fff', ' stroke-width="1.8"');
    case 'teeth': return SO('M42 66c1 6 15 6 16 0z', '#fff', ' stroke-width="1.8"') + L('M46 66.5v2.4M50 66.7v2.8M54 66.5v2.4', 1);
    case 'open': return SO('M44 67c0 6 12 6 12 0z', '#a33b3b', ' stroke-width="1.8"');
    case 'tongue': return SO('M48 68v3.4a2 2 0 0 0 4 0V68', '#e8838a', ' stroke-width="1.4"') + L('M44 67c3 2 9 2 12 0', 2);
    case 'blep': return L('M50 64.5v2M45.5 67c2 2 7 2 9 0', 2) + SO('M51 68.5v2.4a1.6 1.6 0 0 0 3.2 0v-2.6', '#e8838a', ' stroke-width="1.2"');
    case 'smirk': return L('M45 68c3 1 7 0 10-3', 2);
    case 'cat': return L('M50 64.5v2M44 67c1.5 2 4.5 2 6 0 1.5 2 4.5 2 6 0', 2);
    case 'flat': return L('M46 68h8', 2);
    case 'wavy': return L('M44 68c1.5-1.5 3-1.5 4 0s2.5 1.5 4 0 2.5-1.5 4 0', 1.8);
    case 'frown': return L('M45 70c2-3 8-3 10 0', 2);
    case 'o': return `<ellipse cx="50" cy="69" rx="2.4" ry="3" fill="#a33b3b" stroke="${INK}" stroke-width="1.8"/>`;
    case 'whistle': return `<circle cx="51" cy="68.5" r="1.8" fill="none" stroke="${INK}" stroke-width="1.8"/>` + L('M56 64c1.5-1 3-1 4 0M58 61c1-1 2.5-1 3.5 0', 1.2);
    default: return L('M50 64.5v2M45.5 67c2 2 7 2 9 0', 2);
  }
}

// Art from Supabase rows, with the fox's colors filled in.
const fill = (art, v) => art.replace(/\{(ink|fur|dark|light|c|c2)\}/g, (_, k) => v[k]);
const draw = (list, id, fn, v) => { const it = list.find((x) => x.id === id); return it?.art ? fill(it.art, v) : fn(id, v.c); };

let uid = 0;
/**
 * The fox as an SVG string. size is the rendered width/height; bg is the circle color
 * (pass 'none' for no circle).
 */
export function foxSVG(avatar, { size = 64, bg, title = '' } = {}) {
  const a = cleanAvatar(avatar);
  const f = FURS.find((x) => x.id === a.fur);
  const c = COLORS.find((x) => x.id === a.color)?.hex || '#3f74b5';
  const v = { ink: INK, fur: f.fur, dark: f.dark, light: f.light, c, c2: shade(c, -0.22) };
  const id = `fx${(uid = (uid + 1) % 1e6)}`;
  // Circle behind the fox: soft sage, a shade deeper for pale furs so they don't fade into it.
  if (bg == null) bg = isLight(f.fur) ? '#c4d8ca' : '#e1efe6';
  const neck = `<path d="M40 68h20v14H40z" fill="${f.light}"/>`;
  const head =
    // ears: clean triangles with the inner ear set inside
    S('M24 44L22 12 45 37z', f.fur) + S('M76 44l2-32-23 25z', f.fur) +
    `<path d="M26.5 37.5L25 19.5 38.5 34z" fill="${f.dark}"/><path d="M73.5 37.5L75 19.5 61.5 34z" fill="${f.dark}"/>` +
    // head: flat across the top between the ears, wide cheeks, a soft chin that stays above the collar
    S('M30 35h40l18 22-22 14-16 4-16-4-22-14z', f.fur) +
    `<path d="M12 57L50 63 88 57 66 71 50 75 34 71z" fill="${f.light}"/>` +
    `<path d="M45.6 59.5h8.8L50 64.5z" fill="${INK}"/>` +
    draw(EYES, a.eyes, faceEyes, v) + draw(MOUTHS, a.mouth, mouth, v);
  const label = title ? `<title>${title.replace(/[<&>]/g, '')}</title>` : '';
  return `<svg class="fox-av" viewBox="0 0 100 100" width="${size}" height="${size}" role="${title ? 'img' : 'presentation'}"${title ? '' : ' aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${label}` +
    `<defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${bg === 'none' ? '' : `<rect width="100" height="100" fill="${bg}"/>`}${neck}${draw(SHIRTS, a.shirt, shirt, v)}${head}${draw(GLASSES, a.glasses, glasses, v)}<g transform="translate(0 5)">${draw(HATS, a.hat, hat, v)}</g></g></svg>`;
}
