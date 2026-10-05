// Speed Rush: answer as many questions as you can before time runs out.
// Bests and runs are saved where the website's Speed page keeps them.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import { Bar, Button, buzz, Card, Icon, Row, Section, Segmented, Stat } from '../../components/ui';
import { isRight, setSession, type Q } from '../../lib/questions';
import { buildSet, DIFF_LABEL, fmtTime, keysFor, newSeed, SECTIONS, store, uid } from '../../lib/shared';
import type { Test } from '../../lib/types';
import { type, useColors } from '../../lib/theme';
import { useStore } from '../../lib/store-hooks';

const DURATIONS = [60, 120, 180, 300];
type Cfg = { test: Test; section: string; dur: number; diff: string };
const bestKey = (s: Cfg) => `${s.test}|${s.section}|${s.dur}|${s.diff}`;

export default function Speed() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const d = store.data();
  // Start from the last run's settings, so "Start Rush" on Today is one tap.
  const { go } = useLocalSearchParams<{ go?: string }>();
  const [cfg, setCfg] = useState<Cfg>(() => {
    const last = d.speed?.runs?.[0];
    return last ? { test: last.test, section: last.section, dur: last.dur, diff: last.diff } : { test: d.settings.focus || 'SAT', section: 'math', dur: 120, diff: '1' };
  });
  const [phase, setPhase] = useState<'setup' | 'play' | 'done'>('setup');
  const autostart = useRef(go === '1');
  const [left, setLeft] = useState(cfg.dur);
  const [q, setQ] = useState<Q | null>(null);
  const [typed, setTyped] = useState('');
  const [flash, setFlash] = useState<'' | 'ok' | 'bad'>('');
  const game = useRef({ queue: [] as Q[], seen: new Set<string>(), log: [] as { q: Q; a: any; ok: boolean; ms: number }[], streak: 0, bestStreak: 0, qStart: 0 });
  const scroll = useRef<ScrollView>(null);
  const [summary, setSummary] = useState<{ correct: number; answered: number; prev: number; record: boolean; avg: number; bestStreak: number; missed: Q[] } | null>(null);

  const secs = SECTIONS[cfg.test];
  const section = secs[cfg.section] ? cfg.section : 'math' in secs ? 'math' : Object.keys(secs)[0];

  const more = () => {
    const g = game.current;
    const add = buildSet({ test: cfg.test, keys: keysFor(cfg.test, section), difficulty: cfg.diff, count: 10, seed: newSeed(), exclude: g.seen });
    add.forEach((x) => g.seen.add(x.uid));
    g.queue.push(...add);
  };
  const nextQ = () => {
    const g = game.current;
    if (g.queue.length < 3) more();
    g.qStart = Date.now();
    setQ(g.queue[0]); setTyped('');
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const start = () => {
    game.current = { queue: [], seen: new Set(), log: [], streak: 0, bestStreak: 0, qStart: 0 };
    setCfg({ ...cfg, section });
    setLeft(cfg.dur); setPhase('play'); nextQ();
  };

  useEffect(() => { if (autostart.current) { autostart.current = false; start(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== 'play') return;
    const iv = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => { if (phase === 'play' && left <= 0) finish(); }, [left, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (a: number | string | null) => {
    const g = game.current;
    const cur = g.queue.shift()!;
    const ok = a != null && isRight(cur, a);
    if (a != null) { store.recordAnswer(cur, ok); buzz(ok); }
    g.log.push({ q: cur, a, ok, ms: Date.now() - g.qStart });
    g.streak = ok ? g.streak + 1 : 0;
    g.bestStreak = Math.max(g.bestStreak, g.streak);
    setFlash(a == null ? '' : ok ? 'ok' : 'bad');
    setTimeout(() => setFlash(''), 350);
    nextQ();
  };

  const finish = () => {
    const d = store.data();
    const g = game.current;
    const answered = g.log.filter((x) => x.a != null);
    const correct = answered.filter((x) => x.ok).length;
    const key = bestKey({ ...cfg, section });
    d.speed ||= { best: {}, runs: [] };
    const prev = d.speed.best[key] || 0;
    const record = correct > prev;
    if (record) d.speed.best[key] = correct;
    d.speed.runs.unshift({ id: uid(), date: Date.now(), test: cfg.test, section, dur: cfg.dur, diff: cfg.diff, correct, answered: answered.length, bestStreak: g.bestStreak });
    d.speed.runs = d.speed.runs.slice(0, 100);
    store.save();
    const avg = answered.length ? Math.round(answered.reduce((s, x) => s + x.ms, 0) / answered.length / 1000) : 0;
    setSummary({ correct, answered: answered.length, prev, record, avg, bestStreak: g.bestStreak, missed: answered.filter((x) => !x.ok).map((x) => x.q) });
    setPhase('done');
  };

  if (phase === 'setup') {
    const best = d.speed?.best[bestKey({ ...cfg, section })];
    const recent = (d.speed?.runs || []).slice(0, 4);
    const pad = { padding: 12 };
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title="Speed Rush" />
        <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 30 }}>
          <View style={{ alignItems: 'center', gap: 6, paddingTop: 10, paddingHorizontal: 30 }}>
            <Icon name="timer" size={44} color={c.orange} />
            <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>Answer as many as you can before the clock runs out. Every answer jumps to the next question.</Text>
          </View>
          <Section header="Test"><View style={pad}><Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT']]} value={cfg.test} onChange={(test) => setCfg({ ...cfg, test, section: 'math' })} /></View></Section>
          <Section header="Section"><View style={pad}><Segmented options={Object.entries(secs).map(([k, v]) => [k, v.replace('Reading and Writing', 'Reading & Writing')] as [string, string])} value={section} onChange={(s) => setCfg({ ...cfg, section: s })} /></View></Section>
          <Section header="Time"><View style={pad}><Segmented options={DURATIONS.map((t) => [t, `${t / 60} min`] as [number, string])} value={cfg.dur} onChange={(dur) => setCfg({ ...cfg, dur })} /></View></Section>
          <Section header="Difficulty" footer={best ? `Your best here: ${best} correct.` : 'No best score yet for this setup.'}>
            <View style={pad}><Segmented options={(['1', '2', '3', 'mixed'] as const).map((x) => [x, x === 'mixed' ? 'Mixed' : DIFF_LABEL[x]] as [string, string])} value={cfg.diff} onChange={(diff) => setCfg({ ...cfg, diff })} /></View>
          </Section>
          <View style={{ padding: 16 }}><Button title="Start" icon="timer" onPress={start} /></View>
          {recent.length ? (
            <Section header="Recent runs">
              {recent.map((r: any) => <Row key={r.id} title={`${r.test} ${SECTIONS[r.test as Test][r.section]}`} subtitle={`${r.dur / 60} min · best streak ${r.bestStreak}`} value={`${r.correct}/${r.answered}`} />)}
            </Section>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  if (phase === 'done' && summary) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title="Speed Rush" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 24, gap: 14 }}>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Icon name={summary.record && summary.correct ? 'trophy' : 'timer'} size={60} color={summary.record && summary.correct ? c.yellow : c.orange} />
            <Text style={[type.title1, { color: c.label }]}>{summary.record && summary.correct ? 'New personal best' : "Time's up"}</Text>
            <Text style={[type.subhead, { color: c.label2 }]}>{summary.record ? (summary.prev ? `Previous best: ${summary.prev}` : 'First run on this setup.') : `Best on this setup: ${summary.prev}`}</Text>
          </View>
          <Card style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <Stat value={summary.correct} label="correct" />
            <Stat value={`${summary.answered ? Math.round((100 * summary.correct) / summary.answered) : 0}%`} label="accuracy" />
            <Stat value={`${summary.avg}s`} label="per question" />
            <Stat value={summary.bestStreak} label="best streak" color={c.orange} />
          </Card>
          <Button title="Go Again" onPress={start} />
          {summary.missed.length ? <Button title={`Review ${summary.missed.length} Missed`} kind="tinted" icon="target"
            onPress={() => { setSession({ title: 'Speed Rush review', test: cfg.test, section, questions: summary.missed }); router.replace('/quiz'); }} /> : null}
          <Button title="Change Settings" kind="plain" onPress={() => setPhase('setup')} />
        </ScrollView>
      </View>
    );
  }

  const correct = game.current.log.filter((x) => x.ok).length;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: flash === 'ok' ? c.goodSoft : flash === 'bad' ? c.badSoft : c.bg }}>
      <ModalBar title="" onClose={finish} right={<Button title="End" kind="plain" size="small" onPress={finish} />} />
      <View style={{ paddingHorizontal: 20, gap: 10, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 34, fontWeight: '700', color: left <= 10 ? c.red : c.label, fontVariant: ['tabular-nums'] }}>{fmtTime(left)}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="checkCircle" size={18} color={c.green} /><Text style={[type.headline, { color: c.label }]}>{correct}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="flame" size={18} color={c.orange} /><Text style={[type.headline, { color: c.label }]}>{game.current.streak}</Text></View>
          </View>
        </View>
        <Bar value={left / cfg.dur} color={left <= 10 ? c.red : c.orange} height={5} />
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {q ? <QuestionView q={q} onChoose={(i) => answer(i)} showMeta={false} /> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: ins.bottom + 10 }}>
        {q?.type === 'spr' ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput value={typed} onChangeText={setTyped} autoFocus placeholder="Your answer" placeholderTextColor={c.label3} keyboardType="numbers-and-punctuation" autoCorrect={false}
              onSubmitEditing={() => typed.trim() && answer(typed.trim())} returnKeyType="done"
              style={[type.title3, { flex: 1, color: c.label, backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, height: 52 }]} />
            <Button title="Submit" disabled={!typed.trim()} onPress={() => answer(typed.trim())} />
          </View>
        ) : <Button title="Skip" kind="gray" onPress={() => answer(null)} />}
      </View>
    </KeyboardAvoidingView>
  );
}
