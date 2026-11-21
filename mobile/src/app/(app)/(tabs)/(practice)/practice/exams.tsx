// Practice tests, like the website's #/exams: numbered full-length tests (the same for everyone),
// one-subject half tests, section tests, a test code box, and past tests.
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Text } from '../../../../../components/AppText';
import { Button, cardStyle, confirm, Field, Row, Screen, Section, Segmented, tap } from '../../../../../components/ui';
import { codeFor, discardInProgress, examDef, hasInProgress, inProgressTitle, parseCode, startExam } from '../../../../../lib/exams';
import { createExam, numberedTests, store, timeAgo } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';
import type { Test } from '../../../../../lib/types';

const HALF: Record<Test, string[]> = { SAT: ['sat-half-math', 'sat-half-rw'], ACT: ['act-half-math', 'act-half-english', 'act-half-reading', 'act-half-science'] };
const MORE: Record<Test, string[]> = { SAT: ['sat-full', 'sat-half', 'sat-math', 'sat-rw'], ACT: ['act-full', 'act-half', 'act-english', 'act-math', 'act-reading', 'act-science'] };

export default function Exams() {
  useStore();
  const c = useColors();
  const d = store.data();
  const [test, setTest] = useState<Test>(d.settings.focus || 'SAT');
  const [code, setCode] = useState('');
  const past = (d.attempts as any[]).filter((a) => a.kind === 'exam');

  const begin = async (key: string, seed?: number) => {
    if (hasInProgress() && !(await confirm('Start a new test?', `You already have a test in progress (${inProgressTitle()}). Starting a new one will discard it.`, 'Start New Test'))) return;
    const e = examDef(key);
    const title = (createExam(key, seed) as any).title;
    const ok = await confirm(title, `${e.blurb}.\n\nEach ${e.test === 'SAT' ? 'module' : 'section'} is timed and moves on when time runs out.${e.test === 'SAT' ? ' Module 2 adapts to how you did on Module 1.' : ''} You can save and exit any time.`, 'Start Test');
    if (!ok) return;
    startExam(key, seed);
    router.push('/exam');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Practice Tests', headerLargeTitle: false }} />
      <Screen>
        <View style={{ marginHorizontal: 16, marginTop: 8 }}><Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT']]} value={test} onChange={setTest} /></View>

        {hasInProgress() && store.data().inProgress?.kind === 'exam' ? (
          <Section header="In progress">
            <Row icon="pause" iconColor={c.orange} title={inProgressTitle() || 'Practice test'} subtitle="Pick up where you left off" onPress={() => router.push('/exam')} />
            <Row icon="trash" title="Discard" destructive onPress={async () => { if (await confirm('Discard this test?', 'Your answers in it won\'t be saved.', 'Discard')) discardInProgress(); }} />
          </Section>
        ) : null}

        <Section header="Full-length practice tests" footer={test === 'SAT' ? '98 questions, 2 hours 14 minutes, scored 400 to 1600.' : 'English, Math, Reading, and Science at real length and timing, scored 1 to 36.'}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12 }}>
            {numberedTests(test).map((t: any) => {
              const done = past.filter((a) => a.examKey === t.key && a.seed === t.seed);
              const best = done.length ? Math.max(...done.map((a) => +a.headline)) : null;
              return (
                <Pressable key={t.n} accessibilityRole="button" accessibilityLabel={`${t.title}${best != null ? `, best ${best}` : ', not taken'}`} onPress={() => { tap(); begin(t.key, t.seed); }}
                  style={({ pressed }) => [cardStyle(c, 14), { width: '30.5%', paddingVertical: 12, alignItems: 'center', gap: 2, opacity: pressed ? 0.7 : 1, backgroundColor: best != null ? c.tintSoft : c.card }]}>
                  <Text style={[type.title2, { color: best != null ? c.tint : c.label, fontVariant: ['tabular-nums'] }]}>{t.n}</Text>
                  <Text style={[type.caption, { color: c.label2 }]}>{best != null ? `Best ${best}` : 'Not taken'}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section header="Half tests: one subject">
          {HALF[test].map((k) => <Row key={k} icon="test2" iconColor={c.blue} title={examDef(k).title.replace(/^(SAT|ACT) /, '')} subtitle={examDef(k).blurb} onPress={() => begin(k)} />)}
        </Section>

        <Section header={`More ${test} tests`} footer="These are freshly generated each time.">
          {MORE[test].map((k) => <Row key={k} icon="test" iconColor={c.indigo} title={examDef(k).title} subtitle={examDef(k).blurb} onPress={() => begin(k)} />)}
        </Section>

        <Section header="Have a test code?" footer="Take the exact test a friend took, like SAT-FULL-48213.">
          <View style={{ flexDirection: 'row', gap: 10, padding: 12, alignItems: 'center' }}>
            <Field value={code} onChangeText={setCode} placeholder="Test code" autoCapitalize="characters" autoCorrect={false} style={{ flex: 1, backgroundColor: c.fill, borderRadius: 12 }} />
            <Button title="Take" size="medium" disabled={!code.trim()} onPress={() => { const p = parseCode(code); if (!p) Alert.alert('That test code is not valid.'); else begin(p.key, p.seed); }} />
          </View>
        </Section>

        <Section header="Your past tests">
          {past.length ? past.slice(0, 20).map((a) => (
            <Row key={a.id} title={a.title} subtitle={`${timeAgo(a.date)} · ${codeFor(a.examKey, a.seed)}`} onPress={() => router.push(`/results/${a.id}`)}
              value={<Text style={[type.headline, { color: c.tint, fontVariant: ['tabular-nums'] }]}>{a.headline}</Text>} />
          )) : <Row title="No tests yet" subtitle="Your scores will be saved here." />}
        </Section>
      </Screen>
    </>
  );
}
