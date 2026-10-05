// Progress, like the website's dashboard: skill mastery, latest test score, and recent activity.
// Everything here is synced, so practice done on studyfox.org shows up too.
import { router, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { Bar, Card, Empty, Row, Screen, Section, Segmented, Stat } from '../../../../../components/ui';
import { syncNow } from '../../../../../lib/cloud';
import { setSession } from '../../../../../lib/questions';
import { keysFor, buildSet, newSeed, SECTIONS, store, taxonomy, timeAgo, today } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';
import type { Test } from '../../../../../lib/types';

const pct = (s?: { c: number; t: number }) => (s && s.t ? Math.round((100 * s.c) / s.t) : null);

export default function Progress() {
  useStore();
  const c = useColors();
  const d = store.data();
  const [test, setTest] = useState<Test>(d.settings.focus || 'SAT');
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => { setRefreshing(true); try { await syncNow(); } finally { setRefreshing(false); } }, []);
  const tax = taxonomy(test);
  const totals = Object.entries(d.stats as Record<string, { c: number; t: number }>).filter(([k]) => k.startsWith(test + '|')).reduce((a, [, x]) => ({ c: a.c + x.c, t: a.t + x.t }), { c: 0, t: 0 });
  const exams = (d.attempts as any[]).filter((a) => a.kind === 'exam' && a.test === test && /Total|Composite/.test(a.headlineLabel || ''));
  const recent = (d.attempts as any[]).filter((a) => a.test === test).slice(0, 8);
  const runs = (d.speed?.runs || []).filter((r: any) => r.test === test).slice(0, 5);
  const color = (p: number | null) => (p == null ? c.fill2 : p >= 80 ? c.green : p >= 60 ? c.orange : c.red);
  const week = [...Array(7)].map((_, i) => { const dt = new Date(); dt.setDate(dt.getDate() - (6 - i)); const k = dt.toISOString().slice(0, 10); return { k, n: d.activity[k] || 0, l: dt.toLocaleDateString(undefined, { weekday: 'narrow' }) }; });
  const maxN = Math.max(10, ...week.map((w) => w.n));
  const drill = (sec: string, dom: string) => {
    const keys = keysFor(test, sec, [dom]);
    if (!keys.length) return;
    setSession({ title: `${dom} drill`, test, section: sec, questions: buildSet({ test, keys, difficulty: 'mixed', count: 10, seed: newSeed() }) });
    router.push('/quiz');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Progress', headerLargeTitle: false }} />
      <Screen refreshControl={store.user()?.cloud ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.tint} /> : undefined}>
        <View style={{ marginHorizontal: 16, marginTop: 8 }}><Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT']]} value={test} onChange={setTest} /></View>

        <Card style={{ marginHorizontal: 16, marginTop: 14, flexDirection: 'row', paddingVertical: 18 }}>
          <Stat value={exams[0]?.headline ?? '—'} label={exams[0] ? `latest · target ${d.settings.target?.[test]}` : 'practice test'} />
          <Stat value={pct(totals) != null ? `${pct(totals)}%` : '—'} label={`of ${totals.t.toLocaleString()} right`} />
          <Stat value={store.streak()} label="day streak" color={c.orange} />
        </Card>

        <Card style={{ marginHorizontal: 16, marginTop: 12 }}>
          <Text style={[type.footnote, { color: c.label2, marginBottom: 10 }]}>Questions this week · {d.activity[today()] || 0} today</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 70 }}>
            {week.map((w) => (
              <View key={w.k} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
                <Text style={[type.caption2, { color: c.label2 }]}>{w.n || ''}</Text>
                <View style={{ width: 18, height: Math.round((w.n / maxN) * 44) + 4, borderRadius: 5, backgroundColor: w.n ? c.tint : c.fill }} />
                <Text style={[type.caption2, { color: c.label2 }]}>{w.l}</Text>
              </View>
            ))}
          </View>
        </Card>

        {Object.entries(tax).map(([sec, doms]) => (
          <Section key={sec} header={SECTIONS[test][sec]} footer={sec === Object.keys(tax).at(-1) ? 'Tap a skill area to drill 10 questions.' : undefined}>
            {Object.keys(doms).map((dom) => {
              const s = d.stats[`${test}|${sec}|${dom}`];
              const p = pct(s);
              return (
                <Row key={dom} title={dom} onPress={() => drill(sec, dom)} value={<Text style={[type.subhead, { color: c.label2, fontVariant: ['tabular-nums'] }]}>{p == null ? 'New' : `${p}%`}</Text>}
                  subtitle={<View style={{ marginTop: 6 }}><Bar value={(p ?? 0) / 100} color={color(p)} /></View>} />
              );
            })}
          </Section>
        ))}

        <Section header="Recent practice" footer="Includes sets and tests you did on studyfox.org.">
          {recent.length ? recent.map((a) => (
            <Row key={a.id} title={a.title} subtitle={timeAgo(a.date)}
              value={<Text style={[type.subhead, { color: c.label2, fontVariant: ['tabular-nums'] }]}>{a.kind === 'exam' ? a.headline : `${a.correct}/${a.total}`}</Text>} />
          )) : <Empty title="No practice yet" body="Sets you finish on the app or website show up here." />}
        </Section>

        {runs.length ? (
          <Section header="Speed Rush">
            {runs.map((r: any) => <Row key={r.id} title={`${SECTIONS[test][r.section]} · ${r.dur / 60} min`} subtitle={timeAgo(r.date)} value={`${r.correct}/${r.answered}`} />)}
          </Section>
        ) : null}
      </Screen>
    </>
  );
}
