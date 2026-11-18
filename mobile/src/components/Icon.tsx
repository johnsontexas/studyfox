// Native SF Symbols on iOS. On web (previews only) the website's own SVG icons stand in.
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { icon as siteIcon } from '../lib/shared';
import { useColors } from '../lib/theme';

// App icon name -> [SF Symbol, website icon fallback]
const MAP = {
  news: ['newspaper', 'news'], power: ['power', 'power'], support: ['questionmark.bubble', 'mail'],
  close: ['xmark', 'x'], check: ['checkmark', 'check'], back: ['chevron.left', 'left'], forward: ['chevron.right', 'right'],
  chevron: ['chevron.right', 'right'], down: ['chevron.down', 'down'], plus: ['plus', 'edit'], more: ['ellipsis.circle', 'grip'],
  share: ['square.and.arrow.up', 'upload'], paste: ['doc.on.clipboard', 'clipboard'], link: ['link', 'link'], trash: ['trash', 'trash'],
  edit: ['pencil', 'edit'], copy: ['plus.square.on.square', 'cards'], undo: ['arrow.uturn.backward', 'left'],
  star: ['star', 'star'], starFill: ['star.fill', 'star'], shuffle: ['shuffle', 'shuffle'], swap: ['arrow.left.arrow.right', 'swap'],
  cards: ['rectangle.on.rectangle.angled', 'cards'], swipe: ['hand.draw', 'cards'], learn: ['brain.head.profile', 'brain'], test: ['checklist', 'clipboard'],
  match: ['square.grid.2x2', 'puzzle'], bolt: ['bolt.fill', 'bolt'], timer: ['stopwatch', 'timer'], target: ['scope', 'target'],
  flame: ['flame.fill', 'flame'], grid: ['number', 'grid'], ruler: ['function', 'ruler'], calculator: ['plus.forwardslash.minus', 'calculator'],
  test2: ['doc.text', 'clipboard'], book: ['book', 'book'], bookFill: ['book.fill', 'book'], globe: ['safari', 'globe'], doc: ['doc.plaintext', 'scroll'],
  hand: ['hand.raised', 'scroll'], person: ['person.crop.circle', 'users'], mail: ['envelope', 'link'], moon: ['circle.lefthalf.filled', 'contrast'],
  calendar: ['calendar', 'timer'], logout: ['rectangle.portrait.and.arrow.right', 'right'], reset: ['arrow.counterclockwise', 'shuffle'],
  search: ['magnifyingglass', 'search'], sparkle: ['sparkles', 'star'], instagram: ['camera', 'instagram'], heart: ['heart.fill', 'heart'], xmarkCircle: ['xmark.circle.fill', 'x'],
  checkCircle: ['checkmark.circle.fill', 'check'], trophy: ['trophy.fill', 'star'], graduation: ['graduationcap.fill', 'book'], skip: ['forward', 'right'],
  // Subjects (course icons in js/content use the website's icon names)
  integral: ['function', 'integral'], triangle: ['triangle', 'triangle'], chart: ['chart.xyaxis.line', 'chart'], dna: ['allergens', 'dna'],
  flask: ['flask', 'flask'], landmark: ['building.columns', 'landmark'], code: ['chevron.left.forwardslash.chevron.right', 'code'],
  leaf: ['leaf', 'leaf'], scale: ['scalemass', 'scale'], coins: ['dollarsign.circle', 'coins'], map: ['map', 'map'], music: ['music.note', 'music'],
  palette: ['paintpalette', 'palette'], scroll: ['scroll', 'scroll'], users: ['person.2', 'users'], brain: ['brain', 'brain'], home: ['house', 'home'],
  pen: ['pencil.line', 'edit'], bell: ['bell.fill', 'timer'], clock: ['clock.fill', 'timer'], sync: ['arrow.triangle.2.circlepath', 'shuffle'], download: ['square.and.arrow.down', 'upload'],
  rush: ['bolt.circle.fill', 'bolt'], bookmark: ['bookmark', 'bookmark'], bookmarkFill: ['bookmark.fill', 'bookmark'], pause: ['pause.fill', 'pause'],
  eye: ['eye', 'timer'], eyeSlash: ['eye.slash', 'timer'], strike: ['strikethrough', 'x'], chartBar: ['chart.bar.fill', 'chart'], puzzle: ['puzzlepiece', 'puzzle'],
  // Social accounts (js/content/socials.js) and announcements
  tiktok: ['music.note', 'tiktok'], youtube: ['play.rectangle.fill', 'youtube'], 'x-social': ['xmark', 'x-social'], threads: ['at', 'threads'],
  discord: ['bubble.left.and.bubble.right.fill', 'discord'], megaphone: ['megaphone.fill', 'megaphone'],
} as const;
export type IconName = keyof typeof MAP;

export default function Icon({ name, size = 20, color, weight = 'regular' }: { name: IconName | string; size?: number; color?: string; weight?: SymbolWeight }) {
  const c = useColors();
  const [sf, web] = (MAP as Record<string, readonly [string, string]>)[name] || ['circle', name];
  const tint = color || c.label;
  if (Platform.OS === 'ios') return <SymbolView name={sf as any} size={size} tintColor={tint} weight={weight} resizeMode="scaleAspectFit" style={{ width: size, height: size }} />;
  const xml = siteIcon(web, { fill: name === 'starFill' }).replace(/ class="[^"]*"| aria-hidden="true"/g, '');
  return <SvgXml xml={xml} width={size} height={size} color={tint} />;
}
