// A flashcard that flips in 3D when tapped.
import { useEffect } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { fonts, type, useColors } from '../lib/theme';
import Icon from './Icon';
import { tap } from './ui';

export const faceSize = (s: string) => (s.length < 24 ? 32 : s.length < 60 ? 25 : s.length < 140 ? 21 : 18);

type Props = { front: string; back: string; flipped: boolean; onFlip: () => void; starred?: boolean; onStar?: () => void; hint?: string; style?: StyleProp<ViewStyle> };

export default function FlipCard({ front, back, flipped, onFlip, starred, onStar, hint = 'Tap to flip', style }: Props) {
  const c = useColors();
  const rot = useSharedValue(flipped ? 180 : 0);
  // A quick, gentle turn: eased (no bounce), a flat perspective, and a slight dip in size mid-flip.
  useEffect(() => { rot.value = withTiming(flipped ? 180 : 0, { duration: 280, easing: Easing.out(Easing.cubic) }); }, [flipped, rot]);
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 2400 }, { rotateY: `${rot.value}deg` }, { scale: interpolate(rot.value, [0, 90, 180], [1, 0.97, 1]) }],
    opacity: rot.value < 90 ? 1 : 0,
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 2400 }, { rotateY: `${rot.value + 180}deg` }, { scale: interpolate(rot.value, [0, 90, 180], [1, 0.97, 1]) }],
    opacity: rot.value < 90 ? 0 : 1,
  }));

  const face = (txt: string, isBack: boolean) => {
    const fs = faceSize(txt);
    return (
      <View style={{ flex: 1, padding: 26, justifyContent: 'center' }}>
        <Text style={[type.eyebrow, { position: 'absolute', top: 18, left: 20, color: isBack ? c.amber : c.tint }]}>{isBack ? 'Definition' : 'Term'}</Text>
        {onStar ? (
          <Pressable hitSlop={14} accessibilityLabel={starred ? 'Unstar card' : 'Star card'} onPress={() => { tap(); onStar(); }} style={{ position: 'absolute', top: 14, right: 16, zIndex: 2 }}>
            <Icon name={starred ? 'starFill' : 'star'} size={22} color={starred ? c.amber : c.label3} />
          </Pressable>
        ) : null}
        <Text style={{ fontFamily: isBack ? fonts.serif : fonts.display, fontSize: isBack ? fs - 2 : fs + 2, lineHeight: (isBack ? fs - 2 : fs + 2) * 1.3, color: c.label, textAlign: 'center' }}>{txt}</Text>
        {!isBack ? <Text style={[type.footnote, { position: 'absolute', bottom: 16, alignSelf: 'center', color: c.label3 }]}>{hint}</Text> : null}
      </View>
    );
  };
  const base: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderBottomWidth: 4, borderBottomColor: c.ledge, backfaceVisibility: 'hidden', boxShadow: '0 10px 28px rgba(20,35,26,0.10)' };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${flipped ? back : front}. Double tap to flip.`} onPress={() => { tap(); onFlip(); }} style={[{ height: 380 }, style]}>
      <Animated.View style={[base, frontStyle]} pointerEvents={flipped ? 'none' : 'auto'}>{face(front, false)}</Animated.View>
      <Animated.View style={[base, backStyle]} pointerEvents={flipped ? 'auto' : 'none'}>{face(back, true)}</Animated.View>
    </Pressable>
  );
}
