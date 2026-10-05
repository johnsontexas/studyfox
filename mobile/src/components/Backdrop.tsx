// Page atmosphere for the main tabs: the website's forest glow at the top, with a few small StudyFox
// shapes (leaves, fox-ear triangles, sparkles, rings, an amber squiggle) drifting slowly behind it.
// Shapes stay still when Reduce Motion is on.
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '../lib/theme';

type Kind = 'leaf' | 'ear' | 'spark' | 'ring' | 'dot' | 'squiggle';

function Shape({ kind, size, color }: { kind: Kind; size: number; color: string }) {
  const s = size;
  switch (kind) {
    case 'leaf': return <Path d={`M${s * 0.1} ${s * 0.9} C ${s * 0.1} ${s * 0.3}, ${s * 0.5} ${s * 0.1}, ${s * 0.92} ${s * 0.08} C ${s * 0.9} ${s * 0.6}, ${s * 0.6} ${s * 0.9}, ${s * 0.1} ${s * 0.9} Z M${s * 0.1} ${s * 0.9} L ${s * 0.6} ${s * 0.4}`} fill={color} stroke={color} strokeWidth={1.5} />;
    case 'ear': return <Path d={`M${s * 0.5} ${s * 0.05} L ${s * 0.95} ${s * 0.92} L ${s * 0.05} ${s * 0.92} Z`} fill={color} />;
    case 'spark': return <Path d={`M${s / 2} 0 C ${s * 0.55} ${s * 0.4}, ${s * 0.6} ${s * 0.45}, ${s} ${s / 2} C ${s * 0.6} ${s * 0.55}, ${s * 0.55} ${s * 0.6}, ${s / 2} ${s} C ${s * 0.45} ${s * 0.6}, ${s * 0.4} ${s * 0.55}, 0 ${s / 2} C ${s * 0.4} ${s * 0.45}, ${s * 0.45} ${s * 0.4}, ${s / 2} 0 Z`} fill={color} />;
    case 'ring': return <Circle cx={s / 2} cy={s / 2} r={s / 2 - 3} stroke={color} strokeWidth={3} fill="none" />;
    case 'dot': return <Circle cx={s / 2} cy={s / 2} r={s / 2} fill={color} />;
    case 'squiggle': return <Path d={`M2 ${s * 0.6} C ${s * 0.2} ${s * 0.2}, ${s * 0.35} ${s * 0.2}, ${s * 0.5} ${s * 0.5} S ${s * 0.8} ${s * 0.8}, ${s - 2} ${s * 0.35}`} stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
  }
}

type Spec = { kind: Kind; x: number; y: number; size: number; color: 'amber' | 'brand' | 'mint' | 'cream' | 'flame'; rot: number; dx: number; dy: number; dur: number; delay: number };
const SPECS: Spec[] = [
  { kind: 'leaf', x: 0.78, y: 18, size: 34, color: 'brand', rot: 20, dx: 8, dy: 10, dur: 7000, delay: 0 },
  { kind: 'spark', x: 0.9, y: 120, size: 18, color: 'amber', rot: 0, dx: -6, dy: 8, dur: 5200, delay: 400 },
  { kind: 'ear', x: 0.62, y: 70, size: 16, color: 'flame', rot: -14, dx: 6, dy: -8, dur: 6100, delay: 900 },
  { kind: 'ring', x: 0.05, y: 200, size: 22, color: 'mint', rot: 0, dx: 10, dy: 6, dur: 8000, delay: 200 },
  { kind: 'squiggle', x: 0.44, y: 6, size: 40, color: 'amber', rot: -8, dx: -10, dy: 6, dur: 9000, delay: 600 },
  { kind: 'dot', x: 0.28, y: 150, size: 8, color: 'cream', rot: 0, dx: 6, dy: -10, dur: 5600, delay: 1200 },
  { kind: 'leaf', x: 0.92, y: 300, size: 22, color: 'mint', rot: 140, dx: -8, dy: 10, dur: 7600, delay: 300 },
  { kind: 'spark', x: 0.12, y: 60, size: 12, color: 'cream', rot: 0, dx: 4, dy: 6, dur: 4800, delay: 1500 },
];

const Drifter = memo(function Drifter({ spec, color, width, still }: { spec: Spec; color: string; width: number; still: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    t.value = withDelay(spec.delay, withRepeat(withTiming(1, { duration: spec.dur, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [still, spec, t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: spec.dx * t.value }, { translateY: spec.dy * t.value }, { rotate: `${spec.rot + 10 * t.value}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: spec.x * width - spec.size / 2, top: spec.y }, style]}>
      <Svg width={spec.size} height={spec.size}><Shape kind={spec.kind} size={spec.size} color={color} /></Svg>
    </Animated.View>
  );
});

export default function Backdrop({ height = 380 }: { height?: number }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const still = useReducedMotion();
  const palette = {
    amber: c.dark ? 'rgba(242,179,61,0.35)' : 'rgba(242,179,61,0.55)',
    brand: c.dark ? 'rgba(95,207,148,0.22)' : 'rgba(31,107,71,0.16)',
    mint: c.dark ? 'rgba(134,220,174,0.25)' : 'rgba(58,165,122,0.22)',
    cream: c.dark ? 'rgba(255,248,236,0.22)' : 'rgba(242,179,61,0.35)',
    flame: c.dark ? 'rgba(232,121,43,0.35)' : 'rgba(232,121,43,0.35)',
  };
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: height + 200 }]}>
      <LinearGradient colors={[c.glow[0], c.glow[1]]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height }} />
      {SPECS.map((s, i) => <Drifter key={i} spec={{ ...s, y: s.y + 40 }} color={palette[s.color]} width={width} still={still} />)}
    </View>
  );
}
