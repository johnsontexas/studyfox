// Match: pair terms with definitions as fast as you can. Wrong pairs add a second.
// The best time is stored where the website keeps it (setProgress.matchBest).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../../components/ModalBar';
import { Button, buzz, Icon, tap } from '../../../components/ui';
import { getSet, progress, shuffle, touch } from '../../../lib/cards';
import { type, useColors } from '../../../lib/theme';
import { useStore } from '../../../lib/store-hooks';

type Tile = { i: number; txt: string; kind: 't' | 'd'; gone?: boolean };

export default function Match() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSet(id)!;
  const p = progress(s.id);
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [miss, setMiss] = useState<number[]>([]);
  const [now, setNow] = useState(0);
  const start = useRef(0);
  const penalty = useRef(0);
  const [result, setResult] = useState<{ time: number; best: boolean } | null>(null);

  useEffect(() => {
    if (phase !== 'play') return;
    const iv = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(iv);
  }, [phase]);

  const play = () => {
    const picks = shuffle(s.cards.map((_, i) => i)).slice(0, Math.min(6, s.cards.length));
    setTiles(shuffle(picks.flatMap((i) => [{ i, txt: s.cards[i].t, kind: 't' as const }, { i, txt: s.cards[i].d, kind: 'd' as const }])));
    setSel(null); setMiss([]); penalty.current = 0; start.current = Date.now(); setNow(Date.now()); setPhase('play');
  };

  const pick = (k: number) => {
    const t = tiles[k];
    if (t.gone) return;
    tap();
    if (sel === null) return setSel(k);
    if (sel === k) return setSel(null);
    const a = tiles[sel];
    if (a.i === t.i && a.kind !== t.kind) {
      const next = tiles.map((x, j) => (j === k || j === sel ? { ...x, gone: true } : x));
      setTiles(next); setSel(null);
      if (next.every((x) => x.gone)) {
        const time = (Date.now() - start.current) / 1000 + penalty.current;
        const best = !p.matchBest || time < p.matchBest;
        if (best) p.matchBest = time;
        touch(s.id);
        buzz(true);
        setResult({ time, best }); setPhase('done');
      }
    } else {
      penalty.current += 1;
      buzz(false);
      setMiss([sel, k]); setSel(null);
      setTimeout(() => setMiss([]), 450);
    }
  };

  const elapsed = phase === 'play' ? (now - start.current) / 1000 + penalty.current : 0;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={phase === 'play' ? `${elapsed.toFixed(1)}s` : 'Match'} />
      {phase === 'intro' ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 12 }}>
          <View style={{ alignSelf: 'center' }}><Icon name="match" size={60} color={c.orange} /></View>
          <Text style={[type.title1, { color: c.label, textAlign: 'center' }]}>Ready to match?</Text>
          <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>Tap a term, then its definition, as fast as you can. Wrong pairs add a second.</Text>
          {p.matchBest ? <Text style={[type.headline, { color: c.label, textAlign: 'center', marginTop: 6 }]}>Your best: {p.matchBest.toFixed(1)}s</Text> : null}
          <Button title="Start" style={{ marginTop: 16 }} onPress={play} />
        </View>
      ) : phase === 'done' && result ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 12 }}>
          <View style={{ alignSelf: 'center' }}><Icon name={result.best ? 'trophy' : 'timer'} size={60} color={result.best ? c.yellow : c.tint} /></View>
          <Text style={{ fontSize: 48, fontWeight: '700', color: c.label, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{result.time.toFixed(1)}s</Text>
          <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>{result.best ? 'New personal best!' : `Your best is ${p.matchBest!.toFixed(1)}s.`}</Text>
          <Button title="Play Again" style={{ marginTop: 16 }} onPress={play} />
          <Button title="Done" kind="tinted" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, paddingBottom: ins.bottom + 16, alignContent: 'stretch' }}>
          {tiles.map((t, k) => (
            <View key={k} style={{ width: '48%', flexGrow: 1, height: `${100 / Math.ceil(tiles.length / 2) - 2}%` }}>
              {t.gone ? null : (
                <Animated.View entering={ZoomIn.delay(k * 30)} exiting={FadeOut.duration(180)} style={{ flex: 1 }}>
                  <Pressable onPress={() => pick(k)} accessibilityRole="button"
                    style={({ pressed }) => ({ flex: 1, borderRadius: 16, padding: 10, justifyContent: 'center', borderWidth: 2,
                      borderColor: miss.includes(k) ? c.red : sel === k ? c.tint : 'transparent',
                      backgroundColor: miss.includes(k) ? c.badSoft : sel === k ? c.tintSoft : c.card, transform: [{ scale: pressed ? 0.96 : 1 }] })}>
                    <Text numberOfLines={6} adjustsFontSizeToFit minimumFontScale={0.65} style={[t.kind === 't' ? type.headline : type.subhead, { color: c.label, textAlign: 'center' }]}>{t.txt}</Text>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
