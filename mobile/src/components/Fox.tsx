// A student's fox avatar (js/avatar.js), drawn from the same SVG as the website.
import { SvgXml } from 'react-native-svg';
import { cleanAvatar, foxSVG } from '../lib/shared';

export default function Fox({ avatar, seed, size = 40 }: { avatar?: any; seed?: string; size?: number }) {
  return <SvgXml xml={foxSVG(cleanAvatar(avatar, seed), { size })} width={size} height={size} />;
}
