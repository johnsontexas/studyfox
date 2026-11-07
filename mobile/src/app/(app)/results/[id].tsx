// Results for a finished practice test or set, like the website's #/results/:id: the score, each
// section's score, and every question with your answer and the explanation.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../../components/ModalBar';
import QuestionView from '../../../components/QuestionView';
import { Button, Card, Empty, Icon, Section, Stat } from '../../../components/ui';
import { codeFor, SECTION_NAMES } from '../../../lib/exams';
import { isRight, type Q } from '../../../lib/questions';
import { bankNo, fmtTime, regen, store } from '../../../lib/shared';
import { useStore } from '../../../lib/store-hooks';
import { type, useColors } from '../../../lib/theme';

export default function Results() {
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const a: any = store.getAttempt(id);
  const [open, setOpen] = useState<string | null>(null);
  const mods = useMemo(() => (a?.modules || []).map((m: any) => ({ ...m, questions: (m.qids || []).map(regen) as (Q | null)[] })), [a?.id]);
  if (!a) return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar /><Empty icon="test2" title="Result not found" /></View>;
  const exam = a.kind === 'exam';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={a.title} />
      <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 24 }}>
        <View style={{ alignItems: 'center', paddingVertical: 18, gap: 4 }}>
          <Text style={[type.subhead, { color: c.label2 }]}>{exam ? a.headlineLabel || 'Score' : 'Correct'}</Text>
          <Text style={[type.largeTitle, { fontSize: 60, lineHeight: 68, color: c.tint, fontVariant: ['tabular-nums'] }]}>{exam ? a.headline : `${a.correct}/${a.total}`}</Text>
          {exam && /Total|Composite/.test(a.headlineLabel || '') && store.data().settings.target?.[a.test] ? <Text style={[type.footnote, { color: c.label2 }]}>Target {store.data().settings.target[a.test]}</Text> : null}
        </View>
        {exam && a.sections ? (
          <Card style={{ marginHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 16 }}>
            {Object.entries(a.sections).map(([k, v]: any) => <Stat key={k} value={v.score} label={`${SECTION_NAMES[k] || k} · ${v.correct}/${v.total}`} />)}
          </Card>
        ) : null}
        <Card style={{ marginHorizontal: 16, marginTop: 12, flexDirection: 'row', paddingVertical: 14 }}>
          <Stat value={`${a.correct}/${a.total}`} label="correct" />
          <Stat value={fmtTime(a.timeSpent || 0)} label="time" />
        </Card>
        {exam ? <Text selectable style={[type.footnote, { color: c.label2, marginHorizontal: 20, marginTop: 10 }]}>Test code <Text style={{ fontWeight: '700', color: c.label }}>{codeFor(a.examKey, a.seed)}</Text>. Share it so a friend can take the same test. Scores are estimates.</Text> : null}

        {mods.map((m: any, mi: number) => (
          <Section key={mi} header={`${m.name}${m.route ? ` · ${m.route === 'hard' ? 'harder' : 'easier'} module` : ''}`}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 }}>
              {m.questions.map((q: Q | null, i: number) => {
                if (!q) return null;
                const k = `${mi}-${i}`, ok = isRight(q, m.answers?.[i]), skipped = m.answers?.[i] == null || m.answers?.[i] === '';
                return (
                  <Pressable key={k} accessibilityRole="button" accessibilityLabel={`Question ${i + 1}, ${ok ? 'correct' : skipped ? 'skipped' : 'wrong'}`} onPress={() => setOpen(open === k ? null : k)}
                    style={{ width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? c.goodSoft : c.badSoft, borderWidth: open === k ? 2 : 0, borderColor: c.tint }}>
                    <Text style={[type.subhead, { fontWeight: '700', color: ok ? c.green : c.red }]}>{i + 1}</Text>
                    {m.marked?.includes(i) ? <View style={{ position: 'absolute', top: -5, right: -4 }}><Icon name="bookmarkFill" size={12} color={c.orange} /></View> : null}
                  </Pressable>
                );
              })}
            </View>
            {open?.startsWith(`${mi}-`) ? (() => {
              const i = +open.split('-')[1], q = m.questions[i] as Q;
              return <View style={{ padding: 16, paddingTop: 4 }}><QuestionView q={q} chosen={m.answers?.[i] ?? null} reveal bankNo={bankNo(q.id)} /></View>;
            })() : null}
          </Section>
        ))}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}><Button title="Done" onPress={() => router.back()} /></View>
      </ScrollView>
    </View>
  );
}
