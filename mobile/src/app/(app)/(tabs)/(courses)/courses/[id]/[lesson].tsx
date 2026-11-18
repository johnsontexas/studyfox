// A lesson, drawn natively from the same course files as the website (js/content/courses-*.js).
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import LessonPlayer from '../../../../../../components/LessonPlayer';
import { Rich, RichText } from '../../../../../../components/Rich';
import { Button, buzz, Empty, Icon, Row, Screen, Section, tap } from '../../../../../../components/ui';
import { setSession, skillSet } from '../../../../../../lib/questions';
import { getCourse, store } from '../../../../../../lib/shared';
import { useStore } from '../../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../../lib/theme';

const L = (i: number) => 'ABCD'[i];

export default function Lesson() {
  useStore();
  const c = useColors();
  const { id, lesson } = useLocalSearchParams<{ id: string; lesson: string }>();
  const co = getCourse(id);
  const idx = co ? co.lessons.findIndex((l) => l.id === lesson) : -1;
  const [chosen, setChosen] = useState<number | null>(null);
  const scroll = useRef<ScrollView>(null);
  if (!co || idx < 0) return <Screen><Empty icon="book" title="Lesson not found" /></Screen>;
  const l = co.lessons[idx], next = co.lessons[idx + 1];
  const key = `${co.id}/${l.id}`;
  const learned = store.data().learned as Record<string, number>;
  const k = l.check;
  // Interactive lessons (blocks edited in the admin console) play in the lesson player, like on the website.
  const interactive = Array.isArray((l as any).blocks) && (l as any).blocks.length > 0;

  const complete = () => {
    learned[key] = Date.now();
    store.save();
    buzz(true);
    if (next) router.replace(`/courses/${co.id}/${next.id}`); else router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.card }}>
      <Stack.Screen options={{ title: `Lesson ${idx + 1} of ${co.lessons.length}`, headerLargeTitle: false, headerStyle: { backgroundColor: c.card } }} />
      <ScrollView ref={scroll} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.card }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        <Text style={[type.footnote, { color: c.tint, fontWeight: '600', textTransform: 'uppercase', marginTop: 8 }]}>{co.title}</Text>
        <Text style={[type.title1, { color: c.label, marginTop: 4, marginBottom: 4 }]}>{l.title}</Text>
        <Text style={[type.subhead, { color: c.label2, marginBottom: 18 }]}>{l.mins} min{interactive ? ' · Interactive' : ' read'}</Text>

        {interactive ? (
          <LessonPlayer key={key} lesson={l} lessonKey={key} onScreen={() => scroll.current?.scrollTo({ y: 0, animated: true })}
            onFinish={() => { learned[key] = learned[key] || Date.now(); store.save(); buzz(true); }} />
        ) : <Rich html={l.body} variant="lesson" inset={40} box={c.bg} />}

        {!interactive && l.desmos ? (
          <Pressable onPress={() => { tap(); router.push({ pathname: '/calculator', params: { e: JSON.stringify(l.desmos), title: l.title } }); }}
            style={({ pressed }) => ({ marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: c.bg, opacity: pressed ? 0.7 : 1 })}>
            <Icon name="calculator" size={22} color={c.tint} />
            <View style={{ flex: 1 }}><Text style={[type.headline, { color: c.label }]}>Try it in Desmos</Text><Text style={[type.subhead, { color: c.label2 }]}>Opens the calculator with this lesson's examples</Text></View>
            <Icon name="chevron" size={13} color={c.label3} />
          </Pressable>
        ) : null}

        {!interactive && k ? (
          <View style={{ marginTop: 26, gap: 12 }}>
            <Text style={[type.title3, { color: c.label }]}>Quick check</Text>
            <Rich html={k.q} variant="question" inset={40} box={c.bg} />
            {k.choices.map((ch, i) => {
              const st = chosen != null ? (i === k.answer ? 'right' : i === chosen ? 'wrong' : 'dim') : '';
              return (
                <Pressable key={i} disabled={chosen != null} onPress={() => { tap(); setChosen(i); buzz(i === k.answer); setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120); }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, padding: 12, borderRadius: 16, borderWidth: 2,
                    borderColor: st === 'right' ? c.green : st === 'wrong' ? c.red : 'transparent', backgroundColor: st === 'right' ? c.goodSoft : st === 'wrong' ? c.badSoft : c.bg,
                    opacity: st === 'dim' ? 0.55 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'right' ? c.green : st === 'wrong' ? c.red : c.fill }}>
                    <Text style={[type.subhead, { fontWeight: '700', color: st === 'right' || st === 'wrong' ? '#fff' : c.label2 }]}>{L(i)}</Text>
                  </View>
                  <View style={{ flex: 1 }}><RichText html={ch} /></View>
                </Pressable>
              );
            })}
            {chosen != null ? (
              <View style={{ padding: 16, borderRadius: 16, backgroundColor: chosen === k.answer ? c.goodSoft : c.badSoft, gap: 6 }}>
                <Text style={[type.headline, { color: chosen === k.answer ? c.green : c.red }]}>{chosen === k.answer ? 'Correct' : 'Not quite'}</Text>
                <Rich html={k.why} variant="small" inset={72} />
              </View>
            ) : null}
          </View>
        ) : null}

        {l.practice ? (
          <Section header="Practice this skill" style={{ marginHorizontal: 0, marginTop: 26 }} footer={`${l.practice.skills ? l.practice.skills.join(', ') : 'Mixed questions'} · ${l.practice.test}`}>
            <Row icon="bolt" iconColor={c.tint} title="Start 10 Questions" onPress={() => {
              const p = l.practice!;
              setSession({ title: l.title, test: p.test, section: p.section, questions: skillSet(p.test, p.section, { skills: p.skills }, 10) });
              router.push('/quiz');
            }} />
          </Section>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 30 }}>
          {idx > 0 ? <Button title="" icon="back" kind="gray" style={{ width: 56 }} onPress={() => router.replace(`/courses/${co.id}/${co.lessons[idx - 1].id}`)} /> : null}
          <Button style={{ flex: 1 }} icon={learned[key] ? 'forward' : 'check'} onPress={complete}
            title={learned[key] ? (next ? 'Next Lesson' : 'Done') : next ? 'Complete and Continue' : 'Complete Course'} />
        </View>
      </ScrollView>
    </View>
  );
}
