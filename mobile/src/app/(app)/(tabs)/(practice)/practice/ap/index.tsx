// AP question bank: every AP class with its question count and progress. Same bank as studyfox.org/#/ap.
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';
import { Bar, Empty, Row, Screen, Section } from '../../../../../../components/ui';
import { loadAPCounts } from '../../../../../../lib/ap';
import { apDone, COURSES } from '../../../../../../lib/shared';
import { useStore } from '../../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../../lib/theme';
import { ClassesBar, myStudying } from '../../../../../../components/StudyPicker';

export default function APHub() {
  useStore();
  const c = useColors();
  const [counts, setCounts] = useState<Record<string, Record<string, number>> | null>(null);
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); loadAPCounts().then(setCounts, () => setCounts({})).finally(() => setLoading(false)); };
  useEffect(load, []);
  const done = apDone() as Record<string, { cid?: string }>;
  const doneBy: Record<string, number> = {};
  for (const v of Object.values(done)) if (v.cid) doneBy[v.cid] = (doneBy[v.cid] || 0) + 1;
  const list = COURSES.filter((x) => x.ap && counts?.[x.id]).map((x) => ({ x, n: Object.values(counts![x.id]).reduce((a, b) => a + b, 0), units: Object.keys(counts![x.id]).length }));
  const total = list.reduce((a, l) => a + l.n, 0);
  const mine = myStudying();
  const row = ({ x, n, units }: (typeof list)[number]) => (
    <Row key={x.id} icon={x.icon} iconColor={c.tint} title={x.title.replace(/^AP /, '')}
      subtitle={<View style={{ gap: 6, marginTop: 2 }}><Text style={[type.subhead, { color: c.label2 }]}>{n} questions · {units} units</Text><Bar value={Math.min(1, (doneBy[x.id] || 0) / n)} height={4} /></View>}
      onPress={() => router.push(`/practice/ap/${x.id}`)} />
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Stack.Screen options={{ title: 'AP Practice' }} />
      <ClassesBar where="ap" />
      {!counts ? <ActivityIndicator style={{ marginTop: 40 }} /> : !list.length ? <Empty icon="graduation" title="Couldn't load AP questions" body="Check your connection and pull to refresh." /> : (
        <>
          <Text style={[type.subhead, { color: c.label2, marginHorizontal: 20, marginTop: 8 }]}>{total.toLocaleString()} exam-style questions across {list.length} AP classes, sorted by unit and concept.</Text>
          {list.some((l) => mine.includes(l.x.id)) ? (
            <Section header="Your AP classes">
              {list.filter((l) => mine.includes(l.x.id)).map(row)}
            </Section>
          ) : null}
          <Section header={list.some((l) => mine.includes(l.x.id)) ? 'All AP classes' : undefined}>
            {list.filter((l) => !mine.includes(l.x.id)).map(({ x, n, units }) => (
              <Row key={x.id} icon={x.icon} iconColor={c.tint} title={x.title.replace(/^AP /, '')}
                subtitle={<View style={{ gap: 6, marginTop: 2 }}><Text style={[type.subhead, { color: c.label2 }]}>{n} questions · {units} units</Text><Bar value={Math.min(1, (doneBy[x.id] || 0) / n)} height={4} /></View>}
                onPress={() => router.push(`/practice/ap/${x.id}`)} />
            ))}
          </Section>
        </>
      )}
    </Screen>
  );
}
