// Mistake log, shared with the website. Get a question right in a set to clear it.
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import QuestionView from '../../../../../components/QuestionView';
import { Button, confirm, Empty, Row, Screen, Section, Segmented } from '../../../../../components/ui';
import { mistakes, setSession, type Q } from '../../../../../lib/questions';
import { bankNo, regen, SECTIONS, store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';
import type { Test } from '../../../../../lib/types';

export default function Mistakes() {
  useStore();
  const c = useColors();
  const d = store.data();
  const [test, setTest] = useState<Test>(d.settings.focus || 'SAT');
  const [open, setOpen] = useState<string | null>(null);
  const items = mistakes(test);
  const retry = () => {
    const qs = items.slice(0, 30).map(([id]) => regen(id)).filter((q): q is Q => !!q);
    setSession({ title: 'Mistake review', test, section: 'mixed', questions: qs });
    router.push('/quiz');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Mistakes', headerLargeTitle: false }} />
      <Screen>
        <View style={{ marginHorizontal: 16, marginTop: 8 }}><Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT']]} value={test} onChange={setTest} /></View>
        {items.length ? (
          <>
            <View style={{ padding: 16 }}><Button title={`Retry ${Math.min(items.length, 30)} in a Set`} icon="target" onPress={retry} /></View>
            <Section header={`${items.length} to review`} footer="Tap a question to see the answer and explanation." style={{ marginTop: 0 }}>
              {items.slice(0, 60).map(([id, m]) => {
                const no = bankNo(id);
                const q = open === id ? regen(id) : null;
                return (
                  <View key={id}>
                    <Row title={`${no ? `#${no} · ` : ''}${m.skill}`} subtitle={`${SECTIONS[m.test as Test]?.[m.section] || ''} · ${m.domain}`}
                      accessory={<Text style={[type.subhead, { color: c.tint }]}>{open === id ? 'Hide' : 'Show'}</Text>} onPress={() => setOpen(open === id ? null : id)} />
                    {q ? (
                      <View style={{ padding: 16, paddingTop: 4, gap: 12 }}>
                        <QuestionView q={q} review showMeta={false} />
                        <Pressable onPress={async () => { if (await confirm('Remove from mistakes?', 'You can still find it in the question bank.', 'Remove')) { delete d.mistakes[id]; store.save(); } }}>
                          <Text style={[type.body, { color: c.red }]}>Remove from Mistakes</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </Section>
          </>
        ) : <Empty icon="checkCircle" title="Nothing to review" body="Questions you miss on the app or the website show up here." />}
      </Screen>
    </>
  );
}
