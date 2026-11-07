// Speed Rush: three game modes on SAT, ACT, or AP questions, with streak scoring.
// Bests and runs are saved where the website's Speed page keeps them (same keys).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import { Bar, Button, buzz, Card, Icon, Row, Section, Segmented, Stat } from '../../components/ui';
import { apQ, loadAP, loadAPCounts, setAPSession, type APRow } from '../../lib/ap';
import { isRight, setSession, type Q } from '../../lib/questions';
import { buildSet, COURSES, DIFF_LABEL, fmtTime, keysFor, newSeed, pickAP, recordAP, SECTIONS, store, uid } from '../../lib/shared';
import type { Test } from '../../lib/types';
import { type, useColors } from '../../lib/theme';
import { useStore } from '../../lib/store-hooks';

type Mode = 'clock' | 'survival' | 'sprint';
type Src = Test | 'AP';
const MODES: Record<Mode, [string, string]> = { clock: ['Beat the Clock', 'Score as much as you can before time runs out.'], survival: ['Survival', 'Three lives, 20 seconds a question.'], sprint: ['Sprint', '20 questions, fastest time wins. Misses add 10s.'] };
const DURATIONS = [60, 120, 180, 300];
const SURVIVAL_SEC = 20, SPRINT_N = 20, PENALTY = 10;
type Cfg = { mode: Mode; test: Src; section: string; ap: string | null; dur: number; diff: string };
const mult = (s: number) => (s >= 10 ? 4 : s >= 6 ? 3 : s >= 3 ? 2 : 1);
// Same key as js/views/speed.js so bests match the website.
export const speedKey = (s: Cfg) => `${s.mode}|${s.test}|${s.test === 'AP' ? s.ap : s.section}|${s.mode === 'clock' ? s.dur : ''}|${s.diff}`;
const fmtScore = (mode: Mode, v: number) => (mode === 'sprint' ? fmtTime(Math.round(v)) : v.toLocaleString());
type G = { queue: (Q & { ap?: APRow })[]; seen: Set<string>; log: { q: Q & { ap?: APRow }; a: any; ok: boolean; ms: number }[]; streak: number; bestStreak: number; qStart: number; score: number; lives: number; penalty: number; elapsed: number; pool: APRow[] | null };
const fresh = (): G => ({ queue: [], seen: new Set(), log: [], streak: 0, bestStreak: 0, qStart: 0, score: 0, lives: 3, penalty: 0, elapsed: 0, pool: null });

export default function Speed() {
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const d = store.data();
  const { go, test: pTest, section: pSec, ap: pAp } = useLocalSearchParams<{ go?: string; test?: Src; section?: string; ap?: string }>();
  const [cfg, setCfg] = useState<Cfg>(() => {
    const l = d.speed?.runs?.[0];
    // Opened from a SAT, ACT, or AP page: start on that test (and section or class), keeping the last mode and length.
    if (pTest) return { mode: l?.mode || 'clock', test: pTest, section: pSec || (l?.test === pTest && l?.section) || 'math', ap: pAp || (pTest === 'AP' ? l?.ap || null : null), dur: l?.dur || 120, diff: l?.diff || 'mixed' };
    return l ? { mode: l.mode || 'clock', test: l.test, section: l.section || 'math', ap: l.ap || null, dur: l.dur || 120, diff: l.diff || 'mixed' } : { mode: 'clock', test: d.settings.focus || 'SAT', section: 'math', ap: null, dur: 120, diff: 'mixed' };
  });
  const [apList, setApList] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => { loadAPCounts().then((cnt) => setApList(COURSES.filter((x) => x.ap && cnt[x.id]).map((x) => ({ id: x.id, title: x.title.replace(/^AP /, '') }))), () => {}); }, []);
  const [phase, setPhase] = useState<'setup' | 'play' | 'done'>('setup');
  const autostart = useRef(go === '1');
  const [left, setLeft] = useState(cfg.dur);
  const [q, setQ] = useState<(Q & { ap?: APRow }) | null>(null);
  const [typed, setTyped] = useState('');
  const [reveal, setReveal] = useState<{ a: any } | null>(null);
  const [pop, setPop] = useState('');
  const game = useRef<G>(fresh());
  const scroll = useRef<ScrollView>(null);
  const [summary, setSummary] = useState<{ score: number | null; prev?: number; record: boolean; correct: number; answered: number; avg: string; bestStreak: number; missed: (Q & { ap?: APRow })[] } | null>(null);

  const isAP = cfg.test === 'AP';
  const secs = isAP ? {} : SECTIONS[cfg.test as Test];
  const section = isAP ? 'ap' : (secs as any)[cfg.section] ? cfg.section : 'math' in secs ? 'math' : Object.keys(secs)[0];
  const apId = cfg.ap && apList.some((a) => a.id === cfg.ap) ? cfg.ap : apList[0]?.id || null;
  const eff: Cfg = { ...cfg, section, ap: isAP ? apId : null };

  const more = async () => {
    const g = game.current;
    if (isAP) {
      if (!g.pool) { const all = await loadAP(apId!); g.pool = all.filter((x) => eff.diff === 'mixed' || x.difficulty === +eff.diff); if (!g.pool.length) g.pool = all; }
      const unseen = g.pool.filter((x) => !g.seen.has('ap' + x.id));
      const add = (pickAP(unseen.length >= 5 ? unseen : g.pool, 10) as APRow[]).map(apQ);
      add.forEach((x) => g.seen.add(x.uid)); g.queue.push(...add);
    } else {
      const add = buildSet({ test: cfg.test as Test, keys: keysFor(cfg.test as Test, section), difficulty: eff.diff, count: 10, seed: newSeed(), exclude: g.seen });
      add.forEach((x) => g.seen.add(x.uid)); g.queue.push(...add);
    }
  };
  const nextQ = async () => {
    const g = game.current;
    if (g.queue.length < 3) await more();
    g.qStart = Date.now();
    if (eff.mode === 'survival') setLeft(SURVIVAL_SEC);
    setQ(g.queue[0] || null); setTyped(''); setReveal(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const start = async () => {
    if (isAP && !apId) return;
    game.current = fresh();
    setCfg(eff);
    setLeft(eff.mode === 'clock' ? eff.dur : SURVIVAL_SEC); setPhase('play'); await nextQ();
  };

  // AP needs its class list before it can start.
  useEffect(() => { if (autostart.current && (!isAP || apId)) { autostart.current = false; start(); } }, [apId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== 'play') return;
    const iv = setInterval(() => { if (!reveal) { game.current.elapsed++; setLeft((l) => (cfg.mode === 'sprint' ? l : l - 1)); } }, 1000);
    return () => clearInterval(iv);
  }, [phase, reveal, cfg.mode]);
  useEffect(() => {
    if (phase !== 'play' || left > 0 || reveal) return;
    if (cfg.mode === 'clock') finish(); else if (cfg.mode === 'survival') answer(null, true);
  }, [left, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (a: number | string | null, timedOut = false) => {
    const g = game.current;
    if (reveal || !g.queue.length) return;
    const cur = g.queue.shift()!;
    const ok = a != null && isRight(cur, a);
    if (a != null) { if (cur.ap) recordAP(cfg.ap!, cur.ap, ok); else store.recordAnswer(cur, ok); buzz(ok); }
    g.log.push({ q: cur, a, ok, ms: Date.now() - g.qStart });
    let gained = 0;
    if (ok) { g.streak++; gained = 100 * mult(g.streak); g.score += gained; } else g.streak = 0;
    g.bestStreak = Math.max(g.bestStreak, g.streak);
    if (cfg.mode === 'survival' && (!ok || timedOut)) g.lives--;
    if (cfg.mode === 'sprint' && !ok && a != null) g.penalty += PENALTY;
    const over = (cfg.mode === 'survival' && g.lives <= 0) || (cfg.mode === 'sprint' && g.log.length >= SPRINT_N);
    setPop(ok ? `+${gained}` : timedOut ? "Time's up" : a == null ? 'Skipped' : cfg.mode === 'sprint' ? `+${PENALTY}s` : 'Miss');
    setReveal({ a });
    setTimeout(() => { setPop(''); if (over) finish(); else nextQ(); }, ok ? 350 : 1100);
  };

  const finish = () => {
    const d = store.data();
    const g = game.current;
    const answered = g.log.filter((x) => x.a != null);
    const correct = answered.filter((x) => x.ok).length;
    const score = cfg.mode === 'sprint' ? (g.log.length >= SPRINT_N ? g.elapsed + g.penalty : null) : g.score;
    const key = speedKey(cfg);
    d.speed ||= { best: {}, runs: [] };
    const prev = d.speed.best[key];
    const record = score != null && (prev == null || (cfg.mode === 'sprint' ? score < prev : score > prev));
    if (record) d.speed.best[key] = score;
    if (score != null) {
      d.speed.runs.unshift({ id: uid(), key, date: Date.now(), mode: cfg.mode, test: cfg.test, section: cfg.section, ap: cfg.ap, dur: cfg.dur, diff: cfg.diff, score, correct, answered: answered.length, bestStreak: g.bestStreak });
      d.speed.runs = d.speed.runs.slice(0, 100);
    }
    store.save();
    const avg = answered.length ? (answered.reduce((s, x) => s + x.ms, 0) / answered.length / 1000).toFixed(1) : '0';
    setSummary({ score, prev, record, correct, answered: answered.length, avg, bestStreak: g.bestStreak, missed: answered.filter((x) => !x.ok).map((x) => x.q) });
    setPhase('done');
  };

  if (phase === 'setup') {
    const best = d.speed?.best[speedKey(eff)];
    const pad = { padding: 12 };
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title="Speed Rush" />
        <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 30 }}>
          <Section header="Mode">
            {(Object.keys(MODES) as Mode[]).map((m) => <Row key={m} icon={m === 'clock' ? 'timer' : m === 'survival' ? 'heart' : 'bolt'} iconColor={m === 'survival' ? c.red : c.orange} title={MODES[m][0]} subtitle={MODES[m][1]} accessory={cfg.mode === m ? 'check' : 'none'} onPress={() => setCfg({ ...cfg, mode: m })} />)}
          </Section>
          <Section header="Questions"><View style={pad}><Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT'], ['AP', 'AP']]} value={cfg.test} onChange={(test) => setCfg({ ...cfg, test, section: 'math' })} /></View></Section>
          {isAP ? (
            <Section header="AP class">{apList.length ? apList.map((a) => <Row key={a.id} title={a.title} accessory={apId === a.id ? 'check' : 'none'} onPress={() => setCfg({ ...cfg, ap: a.id })} />) : <Row title="Loading AP classes..." />}</Section>
          ) : (
            <Section header="Section"><View style={pad}><Segmented options={Object.entries(secs).map(([k, v]) => [k, (v as string).replace('Reading and Writing', 'Reading & Writing')] as [string, string])} value={section} onChange={(s) => setCfg({ ...cfg, section: s })} /></View></Section>
          )}
          {cfg.mode === 'clock' ? <Section header="Time"><View style={pad}><Segmented options={DURATIONS.map((t) => [t, `${t / 60} min`] as [number, string])} value={cfg.dur} onChange={(dur) => setCfg({ ...cfg, dur })} /></View></Section> : null}
          <Section header="Difficulty" footer={best != null ? `Your best here: ${fmtScore(cfg.mode, best)}${cfg.mode === 'sprint' ? '' : ' points'}.` : 'No best score yet. Streaks multiply points: x2 at 3, x3 at 6, x4 at 10.'}>
            <View style={pad}><Segmented options={(['1', '2', '3', 'mixed'] as const).map((x) => [x, x === 'mixed' ? 'Mixed' : DIFF_LABEL[x]] as [string, string])} value={cfg.diff} onChange={(diff) => setCfg({ ...cfg, diff })} /></View>
          </Section>
          <View style={{ padding: 16 }}><Button title="Start" icon="timer" disabled={isAP && !apId} onPress={start} /></View>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'done' && summary) {
    const head = cfg.mode === 'sprint' ? (summary.score != null ? fmtTime(summary.score) : 'Unfinished') : `${summary.score!.toLocaleString()} points`;
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title="Speed Rush" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 24, gap: 14 }}>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Icon name={summary.record ? 'trophy' : 'timer'} size={60} color={summary.record ? c.yellow : c.orange} />
            <Text style={[type.title1, { color: c.label }]}>{summary.record ? 'New personal best' : cfg.mode === 'survival' ? 'Out of lives' : cfg.mode === 'sprint' ? 'Sprint done' : "Time's up"}</Text>
            <Text style={[type.largeTitle, { color: c.tint }]}>{head}</Text>
            {summary.prev != null ? <Text style={[type.subhead, { color: c.label2 }]}>{summary.record ? 'Previous' : 'Best on this setup'}: {fmtScore(cfg.mode, summary.prev)}</Text> : null}
          </View>
          <Card style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <Stat value={summary.correct} label="correct" />
            <Stat value={`${summary.answered ? Math.round((100 * summary.correct) / summary.answered) : 0}%`} label="accuracy" />
            <Stat value={`${summary.avg}s`} label="per question" />
            <Stat value={summary.bestStreak} label="best streak" color={c.orange} />
          </Card>
          <Button title="Go Again" onPress={start} />
          {summary.missed.length ? <Button title={`Review ${summary.missed.length} Missed`} kind="tinted" icon="target" onPress={() => {
            if (isAP) { setAPSession({ cid: cfg.ap!, title: 'Speed Rush review', rows: summary.missed.map((m) => m.ap!) }); router.replace('/ap-quiz'); }
            else { setSession({ title: 'Speed Rush review', test: cfg.test as Test, section, questions: summary.missed }); router.replace('/quiz'); }
          }} /> : null}
          <Button title="Change Settings" kind="plain" onPress={() => setPhase('setup')} />
        </ScrollView>
      </View>
    );
  }

  const g = game.current;
  const m = mult(g.streak);
  const clock = cfg.mode === 'clock' ? fmtTime(Math.max(0, left)) : cfg.mode === 'survival' ? `${Math.max(0, left)}s` : fmtTime(g.elapsed + g.penalty);
  const barV = cfg.mode === 'clock' ? left / cfg.dur : cfg.mode === 'survival' ? left / SURVIVAL_SEC : g.log.length / SPRINT_N;
  const warn = (cfg.mode === 'clock' && left <= 10) || (cfg.mode === 'survival' && left <= 5);
  const flash = reveal ? (g.log[g.log.length - 1]?.ok ? c.goodSoft : c.badSoft) : c.bg;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: flash }}>
      <ModalBar title="" onClose={finish} right={<Button title="End" kind="plain" size="small" onPress={finish} />} />
      <View style={{ paddingHorizontal: 20, gap: 10, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 34, fontWeight: '700', color: warn ? c.red : c.label, fontVariant: ['tabular-nums'] }}>{clock}</Text>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            {cfg.mode === 'survival' ? <View style={{ flexDirection: 'row', gap: 2 }}>{[0, 1, 2].map((k) => <Icon key={k} name="heart" size={17} color={k < g.lives ? c.red : c.fill} />)}</View> : null}
            <Text style={[type.headline, { color: c.label, fontVariant: ['tabular-nums'] }]}>{cfg.mode === 'sprint' ? `${g.log.length}/${SPRINT_N}` : g.score.toLocaleString()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="flame" size={18} color={c.orange} /><Text style={[type.headline, { color: c.label }]}>{g.streak}{m > 1 ? ` x${m}` : ''}</Text></View>
          </View>
        </View>
        <Bar value={barV} color={warn ? c.red : c.orange} height={5} />
        {pop ? <Text style={[type.title3, { color: pop.startsWith('+') && !pop.endsWith('s') ? c.green : c.red, textAlign: 'right' }]}>{pop}</Text> : null}
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {q ? <QuestionView q={q} chosen={reveal?.a} reveal={!!reveal && q.type === 'mc'} onChoose={(i) => answer(i)} showMeta={!!q.ap} /> : null}
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
