// One AP class: practice a unit, one concept inside a unit, or a mix of everything.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Text } from '../../../../../../components/AppText';
import { Bar, Button, Card, Empty, Pill, Screen, Section, Segmented, Stat } from '../../../../../../components/ui';
import { loadAP, setAPSession, type APRow } from '../../../../../../lib/ap';
import { apStats, apUnits, getCourse, HARDEST, HARDEST_ID, pickAP } from '../../../../../../lib/shared';
import { useStore } from '../../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../../lib/theme';

type Mode = 'smart' | 'new' | 'missed';
const pctText = (s: { did: number; right: number; n: number }) => `${s.did} of ${s.n} done${s.did ? ` · ${Math.round((100 * s.right) / s.did)}% right` : ''}`;

export default function APCourse() {
  useStore();
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hardest = id === HARDEST_ID;
  const course = hardest ? (HARDEST as unknown as NonNullable<ReturnType<typeof getCourse>>) : getCourse(id);
  const [qs, setQs] = useState<APRow[] | null>(null);
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<Mode>('smart');
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { loadAP(id).then(setQs, () => setQs([])); }, [id]);

  if (!course) return <Empty icon="search" title="Class not found" />;
  const title = course.title;
  const start = (pool: APRow[], label: string) => {
    const rows = pickAP(pool, count, mode) as APRow[];
    if (!rows.length) return Alert.alert(mode === 'missed' ? 'Nothing missed here yet' : mode === 'new' ? "You've done every question here" : 'No questions here yet', mode === 'smart' ? undefined : 'Switch to "New first" to keep practicing.');
    setAPSession({ cid: id, title: label, rows });
    router.push('/ap-quiz');
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: title.replace(/^AP /, '') }} />
      {!qs ? <ActivityIndicator style={{ marginTop: 40 }} /> : !qs.length ? <Empty icon="graduation" title="No questions yet" body="Check your connection, or try again later." /> : (() => {
        const all = apStats(qs);
        const units = apUnits(course, qs) as string[];
        return (
          <>
            <Card style={{ marginHorizontal: 16, marginTop: 12, gap: 12 }}>
              <View style={{ flexDirection: 'row' }}>
                <Stat value={`${all.did}/${all.n}`} label="done" />
                <Stat value={all.right} label="correct" color={c.green} />
                <Stat value={all.did - all.right} label="to retry" color={c.orange} />
              </View>
              <Bar value={all.n ? all.did / all.n : 0} />
            </Card>

            <Section header="Set up">
              <View style={{ padding: 12, gap: 10 }}>
                <Segmented options={[[10, '10 questions'], [20, '20'], [40, '40']]} value={count} onChange={setCount} />
                <Segmented options={[['smart', 'New first'], ['new', 'Only new'], ['missed', 'Only missed']]} value={mode} onChange={setMode} />
              </View>
            </Section>
            <View style={{ marginHorizontal: 16, marginTop: 14, gap: 10 }}>
              <Button title="Mixed from All Units" icon="shuffle" onPress={() => start(qs, 'Mixed review')} />
              {hardest ? <Text style={[type.subhead, { color: c.label2 }]}>Max-difficulty SAT and AP questions, harder than the hardest real exam items. Every choice is explained. Expect to miss some.</Text>
                : <Button title={`${title.replace(/^AP /, '')} Rush`} icon="bolt" kind="tinted" onPress={() => router.push({ pathname: '/speed', params: { test: 'AP', ap: id, go: '1' } })} />}
            </View>

            <Section header="Units" footer="Tap a unit to see its concepts.">
              {units.map((u) => {
                const pool = qs.filter((q) => q.unit === u);
                const s = apStats(pool);
                const concepts = [...new Set(pool.map((q) => q.concept).filter(Boolean))];
                const isOpen = open === u;
                return (
                  <View key={u} style={{ padding: 14, gap: 10 }}>
                    <Text onPress={() => setOpen(isOpen ? null : u)} style={[type.headline, { color: c.label }]}>{u}</Text>
                    <Text style={[type.subhead, { color: c.label2 }]}>{pctText(s)}</Text>
                    <Bar value={s.n ? s.did / s.n : 0} height={4} />
                    {isOpen ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {concepts.map((k) => { const cs = apStats(pool.filter((q) => q.concept === k)); return <Pill key={k} label={`${k} ${cs.did}/${cs.n}`} onPress={() => start(pool.filter((q) => q.concept === k), k)} />; })}
                      </View>
                    ) : null}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Button title="Practice" size="small" style={{ flex: 1 }} onPress={() => start(pool, u)} />
                      {concepts.length ? <Button title={isOpen ? 'Hide concepts' : `${concepts.length} concepts`} size="small" kind="tinted" style={{ flex: 1 }} onPress={() => setOpen(isOpen ? null : u)} /> : null}
                    </View>
                  </View>
                );
              })}
            </Section>
          </>
        );
      })()}
    </Screen>
  );
}
