// Hand-drawn SVG icon set (replaces emoji). Icons use currentColor, so they follow light/dark mode.
// icon(name) -> small line icon; sticker(name) -> large outlined illustration with pastel fills.

const P = {
  news: '<path d="M4 6h12v12a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M16 10h4v8a2 2 0 0 1-4 0"/><path d="M7.5 9.5h5M7.5 13h5M7.5 16.5h3"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  power: '<path d="M12 3.5v8"/><path d="M7 6.5a7.5 7.5 0 1 0 10 0"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 14v5.5h14V14"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  shuffle: '<path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.6-3.5M13 10.5c.9-1.9 2-3.5 3.5-3.5H20M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5"/>',
  swap: '<path d="M4 8.5h15M15.5 5L19 8.5 15.5 12M20 15.5H5M8.5 12L5 15.5 8.5 19"/>',
  edit: '<path d="M14.5 5.5l4 4L8 20H4v-4zM12.5 7.5l4 4"/>',
  brain: '<path d="M12 5.5v13M12 5.5A3 3 0 0 0 6.5 6 3 3 0 0 0 4.5 11a3 3 0 0 0 1 5 3 3 0 0 0 6.5 2.5M12 5.5A3 3 0 0 1 17.5 6a3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-6.5 2.5"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 10l1.5 1.5 3-3M8.5 15.5h7"/>',
  puzzle: '<path d="M5 8h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 1 0 4V19H5v-3.5a2 2 0 1 0 0-4z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3h4M18.5 6.5l1.5-1.5"/>',
  highlighter: '<path d="M14.5 4.5l5 5-8 8H8l-1.5 1.5H3.5l3-3v-3.5zM11 8l5 5M3.5 21h17"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 6.5h8v3H8zM8.5 13h.01M12 13h.01M15.5 13h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
  ruler: '<path d="M4 20L20 4M4 20V9M4 20h11M7 17l1.5 1.5M10 14l1.5 1.5M13 11l1.5 1.5M16 8l1.5 1.5"/>',
  bookmark: '<path d="M6.5 3.5h11V21L12 17l-5.5 4z"/>',
  pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.3 3.6-8.3.5 1.8 1.5 2.8 2.4 3.3.3-2.8 1.8-5.1 3.7-6.3-.4 2.8 3.3 5.5 3.3 10.2 0 4.2-2.6 7.3-6.5 7.3z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  cards: '<rect x="3.5" y="7" width="12" height="13" rx="2"/><path d="M8 7V5a1.5 1.5 0 0 1 1.5-1.5h9.5A1.5 1.5 0 0 1 20.5 5v10a1.5 1.5 0 0 1-1.5 1.5h-3.5"/>',
  chart: '<path d="M4 4v16h16M7.5 15l4-4.5 3 3L20 7"/>',
  expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
  grip: '<circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  triangle: '<path d="M12 4.5l8.5 15h-17z"/>',
  integral: '<path d="M16 4.5c-1.8-1.2-3.8-.4-4.3 2l-2.4 11c-.5 2.4-2.5 3.2-4.3 2"/>',
  dna: '<path d="M7 3c0 5 10 7 10 12 0 2.5-1.5 4.5-2.5 6M17 3c0 5-10 7-10 12 0 2.5 1.5 4.5 2.5 6M9 7h6M9.5 17h5"/>',
  flask: '<path d="M9.5 3.5h5M10.5 3.5V9L5 18.8A1.5 1.5 0 0 0 6.3 21h11.4a1.5 1.5 0 0 0 1.3-2.2L13.5 9V3.5M7.5 15h9"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  landmark: '<path d="M3.5 9.5L12 4l8.5 5.5zM6 9.5v8M10 9.5v8M14 9.5v8M18 9.5v8M3.5 20.5h17"/>',
  book: '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2zM12 6.5v14"/>',
  code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  leaf: '<path d="M5 19.5c0-8.5 5.5-15 15-15 0 10-6 15.5-14 15.5M5 19.5l7.5-7.5"/>',
  scale: '<path d="M12 4v16M7.5 20h9M4.5 7h15M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z"/>',
  coins: '<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v8c0 1.4 2.5 2.5 5.5 2.5M3.5 11c0 1.4 2.5 2.5 5.5 2.5"/><ellipse cx="15" cy="13" rx="5.5" ry="2.5"/><path d="M9.5 13v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4"/>',
  map: '<path d="M3.5 6.5l5-2 7 2.5 5-2v13l-5 2-7-2.5-5 2zM8.5 4.5v13M15.5 7v13"/>',
  music: '<path d="M9 17.5V5.5l10-2v12M9 9l10-2"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-1 1.4-2.2-.7-1.3.2-2.8 1.7-2.8h2.4a3 3 0 0 0 3-3A8.5 8.5 0 0 0 12 3.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
  scroll: '<path d="M8 4.5h10a2 2 0 0 1 2 2V8h-4M8 4.5a2 2 0 0 0-2 2v11a2.5 2.5 0 0 1-2.5 2.5h11A2.5 2.5 0 0 0 17 17.5V6.5a2 2 0 0 0-2-2M9.5 9.5h4M9.5 13h4"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M15.5 5a3.5 3.5 0 0 1 0 7M17.5 14.2c2 .7 3.2 2.6 3.5 5.3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  home: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h4.5v-5.5h3V20H18V9.5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.4 4.6 5 4.8"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".9" fill="currentColor"/>',
  arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
};

/** Every icon name (for pickers, like the course icon in the admin console). */
export const ICON_NAMES = Object.keys(P);

export function icon(name, { fill = false, cls = '' } = {}) {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// Stickers: thick ink outline + pastel fills from the theme tokens.
const S = {
  trophy: `<path d="M22 14h36v14a18 18 0 0 1-36 0z" fill="var(--accent)"/><path d="M22 18H12v4a12 12 0 0 0 12 12M58 18h10v4a12 12 0 0 1-12 12" fill="none"/>
    <path d="M36 46h8v10h-8z" fill="var(--peach)"/><rect x="26" y="56" width="28" height="10" rx="3" fill="var(--lilac)"/><path d="M33 24l4 4 8-8" fill="none"/>`,
  medal: `<path d="M26 8l8 22M54 8l-8 22" fill="none"/><path d="M22 6h12l8 20h-12zM58 6H46l-8 20h12z" fill="var(--brand-soft)"/>
    <circle cx="40" cy="50" r="20" fill="var(--accent)"/><path d="M40 39l3.4 7 7.6 1-5.5 5.3 1.3 7.5L40 56.3l-6.8 3.5 1.3-7.5L29 47l7.6-1z" fill="var(--surface)"/>`,
  puzzle: `<path d="M14 24h14a6 6 0 1 1 12 0h14v14a6 6 0 1 1 0 12v14H14z" fill="var(--good-soft)"/><path d="M40 24v40M14 44h40" fill="none" stroke-dasharray="4 5"/>`,
  stopwatch: `<circle cx="40" cy="44" r="24" fill="var(--brand-soft)"/><path d="M34 10h12M40 10v10M59 23l5-5" fill="none"/><path d="M40 44V30M40 44l9 7" fill="none"/><circle cx="40" cy="44" r="3" fill="var(--ink)"/>`,
  party: `<path d="M12 68l14-40 26 26z" fill="var(--accent)"/><path d="M19 48l13 13M23 37l20 20" fill="none"/>
    <path d="M44 12c4 6-4 10 0 16M58 22c6 2 2 10 10 10" fill="none"/><circle cx="62" cy="12" r="4" fill="var(--bad-soft)"/><circle cx="68" cy="50" r="4" fill="var(--good-soft)"/><rect x="30" y="8" width="7" height="7" rx="1.5" fill="var(--lilac)" transform="rotate(20 33 11)"/>`,
};

export function sticker(name) {
  return `<svg class="sticker" viewBox="0 0 80 80" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${S[name] || ''}</svg>`;
}
