// Match: pair terms with definitions as fast as you can. Wrong pairs add a second.
// The best time and time history are stored where the website keeps them (setProgress.matchBest,
// matchTimes), and times post to the same public leaderboard as studyfox.org.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../../components/ModalBar';
import { Button, buzz, confirm, Icon, menu, Segmented, tap } from '../../../components/ui';
import { blockMatchPlayer, fetchMatchBoard, postMatchTime, reportMatchPlayer } from '../../../lib/cloud';
import { store } from '../../../lib/shared';
import { boardKey, boardName, getSet, progress, shuffle, touch } from '../../../lib/cards';
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
  const pairs = Math.min(6, s.cards.length);
  const key = boardKey(s, pairs);
  const me = store.user() as any;
  const [tab, setTab] = useState<'all' | 'me'>('all');
  const [board, setBoard] = useState<{ user_id: string; name: string; seconds: number }[] | null | 'error'>(null);
  const loadBoard = () => fetchMatchBoard(key).then(setBoard, () => setBoard('error'));
  useEffect(() => { loadBoard(); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play') return;
    const iv = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(iv);
  }, [phase]);

  const play = () => {
    const picks = shuffle(s.cards.map((_, i) => i)).slice(0, pairs);
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
        const time = Math.round(((Date.now() - start.current) / 1000 + penalty.current) * 10) / 10;
        const best = !p.matchBest || time < p.matchBest;
        if (best) p.matchBest = time;
        p.matchTimes = [...(p.matchTimes || []), { s: time, at: Date.now() }].slice(-50);
        touch(s.id);
        if (me?.cloud && time >= 1) postMatchTime(key, boardName(me.name), time).then(loadBoard, () => {});
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

  const moderate = (userId: string, name: string) => menu(name, [
    { title: 'Report Name', onPress: async () => {
      try { await reportMatchPlayer(key, userId, name); Alert.alert('Report sent', 'Thanks. We review reports within 24 hours.'); } catch (e: any) { Alert.alert('Could not report', e.message); }
    } },
    { title: 'Block Player', destructive: true, onPress: async () => {
      if (!(await confirm(`Block ${name}?`, 'You will no longer see their times on any leaderboard.', 'Block'))) return;
      try { await blockMatchPlayer(userId); loadBoard(); } catch (e: any) { Alert.alert('Could not block', e.message); }
    } },
  ]);
  const mine = [...((p.matchTimes || []) as { s: number; at: number }[])].sort((a, b) => a.s - b.s).slice(0, 10);
  const Board = () => (
    <View style={{ marginTop: 18, gap: 8 }}>
      <Segmented options={[['all', 'Everyone'], ['me', 'My times']]} value={tab} onChange={setTab} />
      {(tab === 'me' ? mine.map((r, n) => ({ k: String(r.at), left: `${n + 1}. ${new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, right: r.s, you: false, other: null as null | { id: string; name: string } }))
        : Array.isArray(board) ? board.map((r, n) => ({ k: r.user_id, left: `${n + 1}. ${(me?.cloud && r.user_id === me.id) || !store.data().settings.hideNames ? r.name : `Player ${n + 1}`}${me?.cloud && r.user_id === me.id ? ' (you)' : ''}`, right: r.seconds, you: me?.cloud && r.user_id === me.id, other: me?.cloud && r.user_id !== me.id ? { id: r.user_id, name: r.name } : null }))
        : []).map((r) => (
        <View key={r.k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 }}>
          <Text style={[type.subhead, { color: r.you ? c.tint : c.label, fontWeight: r.you ? '700' : '400' }]}>{r.left}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={[type.subhead, { color: c.label, fontWeight: '700', fontVariant: ['tabular-nums'] }]}>{r.right.toFixed(1)}s</Text>
            {tab === 'all' && me?.cloud ? (r.other ? <Pressable accessibilityRole="button" accessibilityLabel={`Report or block ${r.other.name}`} hitSlop={10} onPress={() => { tap(); moderate(r.other!.id, r.other!.name); }}><Text style={[type.subhead, { color: c.label2, fontWeight: '700' }]}>•••</Text></Pressable> : <View style={{ width: 22 }} />) : null}
          </View>
        </View>
      ))}
      <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>
        {tab === 'me' ? (mine.length ? '' : 'Play a round to see your times here.')
          : board === 'error' ? 'The leaderboard could not load.' : board == null ? 'Loading...' : !board.length ? 'No times yet. Be the first on the board.' : !me?.cloud ? 'Sign in with an account that syncs to post your times.' : ''}
      </Text>
    </View>
  );

  const elapsed = phase === 'play' ? (now - start.current) / 1000 + penalty.current : 0;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={phase === 'play' ? `${elapsed.toFixed(1)}s` : 'Match'} />
      {phase === 'intro' ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28, paddingBottom: ins.bottom + 28, gap: 12 }}>
          <View style={{ alignSelf: 'center' }}><Icon name="match" size={60} color={c.orange} /></View>
          <Text style={[type.title1, { color: c.label, textAlign: 'center' }]}>Ready to match?</Text>
          <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>Tap a term, then its definition, as fast as you can. Wrong pairs add a second.</Text>
          {p.matchBest ? <Text style={[type.headline, { color: c.label, textAlign: 'center', marginTop: 6 }]}>Your best: {p.matchBest.toFixed(1)}s</Text> : null}
          <Button title="Start" style={{ marginTop: 16 }} onPress={play} />
          <Board />
        </ScrollView>
      ) : phase === 'done' && result ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28, paddingBottom: ins.bottom + 28, gap: 12 }}>
          <View style={{ alignSelf: 'center' }}><Icon name={result.best ? 'trophy' : 'timer'} size={60} color={result.best ? c.yellow : c.tint} /></View>
          <Text style={{ fontSize: 48, fontWeight: '700', color: c.label, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{result.time.toFixed(1)}s</Text>
          <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>{result.best ? 'New personal best!' : `Your best is ${p.matchBest!.toFixed(1)}s.`}</Text>
          <Button title="Play Again" style={{ marginTop: 16 }} onPress={play} />
          <Button title="Done" kind="tinted" onPress={() => router.back()} />
          <Board />
        </ScrollView>
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
