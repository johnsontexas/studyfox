// Swipe study: tap to flip, swipe right if you know it, left if you're still learning.
// "Know it" moves a card one step toward mastered (the same mastery scale as Learn mode on the site).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { Text } from '../../../components/AppText';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import FlipCard from '../../../components/FlipCard';
import ModalBar from '../../../components/ModalBar';
import { Button, buzz, Icon, menu, tap } from '../../../components/ui';
import { getSet, lvl, progress, shuffle, touch } from '../../../lib/cards';
import { store } from '../../../lib/shared';
import { type, useColors } from '../../../lib/theme';
import { useStore } from '../../../lib/store-hooks';

type Opts = { shuffle: boolean; starred: boolean; back: boolean };

export default function Study() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSet(id)!;
  const p = progress(s.id);
  // The round (what's left and both piles) is saved in the set's progress, so leaving or reshuffling keeps it.
  const saved = p.session && p.session.size ? p.session : null;
  const [opts, setOpts] = useState<Opts>(() => ({ shuffle: saved?.shuffle ?? true, starred: saved?.starred ?? false, back: false }));
  const build = (o: Opts, only?: number[]) => {
    let idx = only || s.cards.map((_, k) => k);
    if (o.starred && !only) idx = idx.filter((k) => p.starred.includes(k));
    return o.shuffle ? shuffle(idx) : idx;
  };
  const valid = (a: number[] = []) => a.filter((i) => i < s.cards.length);
  const [queue, setQueue] = useState<number[]>(() => (saved ? valid(saved.queue) : build(opts)));
  const [roundSize, setRoundSize] = useState(() => saved?.size ?? queue.length);
  const [known, setKnown] = useState<number[]>(() => valid(saved?.known));
  const [learning, setLearning] = useState<number[]>(() => valid(saved?.learning));
  useEffect(() => {
    p.session = { queue, known, learning, size: roundSize, shuffle: opts.shuffle, starred: opts.starred };
    store.save();
  }, [queue, known, learning, roundSize, opts.shuffle, opts.starred]); // eslint-disable-line react-hooks/exhaustive-deps
  const [flipped, setFlipped] = useState(false);
  const history = useRef<{ k: number; prev: number; dir: 1 | -1 }[]>([]);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const restart = (o: Opts, only?: number[]) => {
    const q = build(o, only);
    setQueue(q); setRoundSize(q.length); setKnown([]); setLearning([]); setFlipped(false); history.current = [];
    x.value = 0; y.value = 0;
  };

  const commit = (dir: 1 | -1) => {
    const k = queue[0];
    if (k == null) return;
    history.current.push({ k, prev: p.mastery[k] || 0, dir });
    p.mastery[k] = dir === 1 ? Math.min(2, lvl(p, k) + 1) : 0;
    p.studied = (p.studied || 0) + 1;
    touch(s.id);
    if (dir === 1) setKnown((a) => [...a, k]); else setLearning((a) => [...a, k]);
    setQueue((q) => q.slice(1));
    setFlipped(false);
  };

  const undo = () => {
    const h = history.current.pop();
    if (!h) return;
    tap();
    p.mastery[h.k] = h.prev; store.save();
    if (h.dir === 1) setKnown((a) => a.slice(0, -1)); else setLearning((a) => a.slice(0, -1));
    setQueue((q) => [h.k, ...q]);
    setFlipped(false);
  };

  // Animate the card away, then sort it. A timer (not the animation callback) commits, so it's reliable everywhere.
  const busy = useRef(false);
  const fling = (dir: 1 | -1) => {
    if (busy.current || queue[0] == null) return;
    busy.current = true;
    buzz(dir === 1);
    x.value = withTiming(dir * width * 1.3, { duration: 220 });
    setTimeout(() => { busy.current = false; commit(dir); }, 230);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => { x.value = e.translationX; y.value = e.translationY * 0.2; })
    .onEnd((e) => {
      const dir = e.translationX > 110 || e.velocityX > 900 ? 1 : e.translationX < -110 || e.velocityX < -900 ? -1 : 0;
      if (dir) scheduleOnRN(fling, dir as 1 | -1);
      else { x.value = withSpring(0); y.value = withSpring(0); }
    });

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${interpolate(x.value, [-width, width], [-12, 12])}deg` }] }));
  const knowStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 100], [0, 1], 'clamp') }));
  const learnStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-100, 0], [1, 0], 'clamp') }));

  const k = queue[0];
  const next = queue[1];
  const done = roundSize - queue.length;
  useEffect(() => { x.value = 0; y.value = 0; }, [k, x, y]);
  const face = (i: number) => (opts.back ? [s.cards[i].d, s.cards[i].t] : [s.cards[i].t, s.cards[i].d]);
  // Shuffle and card side only change how the remaining cards are shown; the piles stay put.
  const setOpt = (key: keyof Opts) => {
    const o = { ...opts, [key]: !opts[key] };
    setOpts(o);
    if (key === 'starred') return restart(o);
    if (key === 'shuffle') {
      const order = s.cards.map((_, i) => i);
      setQueue((q) => (o.shuffle ? shuffle(q) : order.filter((i) => q.includes(i))));
    }
    setFlipped(false);
  };
  const options = () => menu('Study options', [
    { title: opts.shuffle ? 'Turn Shuffle Off' : 'Turn Shuffle On', onPress: () => setOpt('shuffle') },
    { title: opts.starred ? 'Study All Cards' : 'Study Starred Cards Only', onPress: () => setOpt('starred') },
    { title: opts.back ? 'Show Term First' : 'Show Definition First', onPress: () => setOpt('back') },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={`${Math.min(done + 1, roundSize)} / ${roundSize}`} progress={roundSize ? done / roundSize : 1}
        right={<Pressable hitSlop={10} onPress={options} accessibilityLabel="Options"><Icon name="more" size={24} color={c.tint} /></Pressable>} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <Count n={learning.length} label="Learning" color={c.orange} />
        <Count n={known.length} label="Know" color={c.green} right />
      </View>

      {k == null ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
          {roundSize === 0 ? (
            <>
              <Icon name="star" size={48} color={c.label3} />
              <Text style={[type.title2, { color: c.label, textAlign: 'center' }]}>No starred cards</Text>
              <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>Star cards on the set page to study just those.</Text>
              <Button title="Study all cards" onPress={() => setOpt('starred')} />
            </>
          ) : (
            <>
              <View style={{ alignSelf: 'center' }}><Icon name={learning.length ? 'checkCircle' : 'trophy'} size={56} color={learning.length ? c.tint : c.yellow} /></View>
              <Text style={[type.title1, { color: c.label, textAlign: 'center' }]}>{learning.length ? 'Round done' : 'You knew them all'}</Text>
              <Text style={[type.body, { color: c.label2, textAlign: 'center', marginBottom: 12 }]}>{known.length} known, {learning.length} still learning. {Object.values(p.mastery).filter((v) => v >= 2).length} of {s.cards.length} mastered overall.</Text>
              {learning.length ? <Button title={`Keep studying ${learning.length}`} onPress={() => restart(opts, learning)} /> : null}
              <Button title="Restart all cards" kind="tinted" onPress={() => restart(opts)} />
              {s.cards.length >= 4 ? <Button title="Quiz me in Learn" kind="plain" icon="learn" onPress={() => router.replace(`/learn/${encodeURIComponent(s.id)}`)} /> : null}
            </>
          )}
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
          <View style={{ flex: 1 }}>
            {next != null ? <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: -12, borderRadius: 24, backgroundColor: c.card, opacity: 0.6 }} /> : null}
            <GestureDetector gesture={pan}>
              <Animated.View style={[{ flex: 1 }, cardStyle]}>
                <FlipCard key={k} front={face(k)[0]} back={face(k)[1]} flipped={flipped} onFlip={() => setFlipped(!flipped)} hint="Tap to flip · swipe to sort"
                  starred={p.starred.includes(k)} onStar={() => { p.starred = p.starred.includes(k) ? p.starred.filter((z) => z !== k) : [...p.starred, k]; store.save(); }} style={{ flex: 1, height: undefined }} />
                <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24, borderWidth: 3, borderColor: c.green, backgroundColor: c.goodSoft, alignItems: 'center', justifyContent: 'center' }, knowStyle]}>
                  <Icon name="checkCircle" size={64} color={c.green} />
                  <Text style={[type.title2, { color: c.green, marginTop: 8 }]}>Know it</Text>
                </Animated.View>
                <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24, borderWidth: 3, borderColor: c.orange, backgroundColor: c.warnSoft, alignItems: 'center', justifyContent: 'center' }, learnStyle]}>
                  <Icon name="undo" size={56} color={c.orange} />
                  <Text style={[type.title2, { color: c.orange, marginTop: 8 }]}>Still learning</Text>
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 34, paddingTop: 26, paddingBottom: ins.bottom + 12 }}>
            <Round icon="close" color={c.orange} label="Still learning" onPress={() => fling(-1)} />
            <Pressable hitSlop={10} disabled={!history.current.length} onPress={undo} accessibilityLabel="Undo" style={{ opacity: history.current.length ? 1 : 0.3 }}>
              <Icon name="undo" size={22} color={c.label2} />
            </Pressable>
            <Round icon="check" color={c.green} label="Know it" onPress={() => fling(1)} />
          </View>
        </View>
      )}
    </View>
  );
}

function Count({ n, label, color, right }: { n: number; label: string; color: string; right?: boolean }) {
  return (
    <View style={{ flexDirection: right ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ minWidth: 28, paddingHorizontal: 8, height: 24, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[type.subhead, { color: '#fff', fontWeight: '700', fontVariant: ['tabular-nums'] }]}>{n}</Text>
      </View>
      <Text style={[type.subhead, { color }]}>{label}</Text>
    </View>
  );
}

function Round({ icon, color, label, onPress }: { icon: string; color: string; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ width: 70, height: 70, borderRadius: 35, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.10)', transform: [{ scale: pressed ? 0.92 : 1 }] })}>
      <Icon name={icon} size={30} color={color} weight="bold" />
    </Pressable>
  );
}
