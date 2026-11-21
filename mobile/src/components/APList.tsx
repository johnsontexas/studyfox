// Every AP class with its question count, progress, and a one-tap Rush. Used by the AP side of the
// Practice tab and the AP Practice page. Same bank as studyfox.org/#/ap.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from './AppText';
import { loadAPCounts } from '../lib/ap';
import { apDone, COURSES, HARDEST_ID } from '../lib/shared';
import { type, useColors } from '../lib/theme';
import Icon from './Icon';
import { myStudying } from './StudyPicker';
import { Bar, Empty, Row, Section, tap } from './ui';

export const rushAP = (id: string) => router.push({ pathname: '/speed', params: { test: 'AP', ap: id, go: '1' } });

export function useAPCounts() {
  const [counts, setCounts] = useState<Record<string, Record<string, number>> | null>(null);
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); loadAPCounts().then(setCounts, () => setCounts({})).finally(() => setLoading(false)); };
  useEffect(load, []);
  return { counts, loading, load };
}

export default function APList({ counts }: { counts: Record<string, Record<string, number>> | null }) {
  const c = useColors();
  if (!counts) return <ActivityIndicator style={{ marginTop: 40 }} />;
  const done = apDone() as Record<string, { cid?: string }>;
  const doneBy: Record<string, number> = {};
  for (const v of Object.values(done)) if (v.cid) doneBy[v.cid] = (doneBy[v.cid] || 0) + 1;
  const list = COURSES.filter((x) => x.ap && counts[x.id]).map((x) => ({ x, n: Object.values(counts[x.id]).reduce((a, b) => a + b, 0), units: Object.keys(counts[x.id]).length }));
  if (!list.length) return <Empty icon="graduation" title="Couldn't load AP questions" body="Check your connection and pull to refresh." />;
  const total = list.reduce((a, l) => a + l.n, 0);
  const mine = myStudying();
  const row = ({ x, n, units }: (typeof list)[number]) => (
    <Row key={x.id} icon={x.icon} iconColor={c.tint} title={x.title.replace(/^AP /, '')}
      subtitle={<View style={{ gap: 6, marginTop: 2 }}><Text style={[type.subhead, { color: c.label2 }]}>{n} questions · {units} units</Text><Bar value={Math.min(1, (doneBy[x.id] || 0) / n)} height={4} /></View>}
      right={(
        <Pressable accessibilityRole="button" accessibilityLabel={`${x.title} Rush`} hitSlop={8} onPress={() => { tap(); rushAP(x.id); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.tintSoft }}>
          <Icon name="bolt" size={12} color={c.tint} />
          <Text style={[type.footnote, { fontWeight: '700', color: c.tint }]}>Rush</Text>
        </Pressable>
      )}
      onPress={() => router.push(`/practice/ap/${x.id}`)} />
  );
  const has = list.some((l) => mine.includes(l.x.id));
  return (
    <>
      <Text style={[type.subhead, { color: c.label2, marginHorizontal: 20, marginTop: 8 }]}>{total.toLocaleString()} exam-style questions across {list.length} AP classes, sorted by unit and concept.</Text>
      <Section header="Challenge">
        <Row icon="flame" iconColor={c.orange} title="Hardest questions" subtitle="Max-difficulty SAT and AP questions" onPress={() => router.push(`/practice/ap/${HARDEST_ID}`)} />
      </Section>
      {has ? <Section header="Your AP classes">{list.filter((l) => mine.includes(l.x.id)).map(row)}</Section> : null}
      <Section header={has ? 'All AP classes' : undefined}>{list.filter((l) => !mine.includes(l.x.id)).map(row)}</Section>
    </>
  );
}
