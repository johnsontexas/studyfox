import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Text, TextInput } from '../../../../../components/AppText';
import { Bar, Empty, Pill, Row, Screen, SearchField, Section } from '../../../../../components/ui';
import { COURSES, courseIcon, store, SUBJECTS } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { subjectColor, type, useColors } from '../../../../../lib/theme';
import type { Course } from '../../../../../lib/types';
import { ClassesBar, myStudying } from '../../../../../components/StudyPicker';

const haystack = (c: Course) => [c.title, c.blurb, c.level, c.subject, ...c.lessons.map((l) => l.title)].join(' ').toLowerCase();

export default function Courses() {
  useStore();
  const c = useColors();
  const [subject, setSubject] = useState('All');
  const [q, setQ] = useState('');
  const learned = store.data().learned as Record<string, number>;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const match = (x: Course) => (subject !== 'AP' || x.ap) && (subject === 'All' || subject === 'AP' || x.subject === subject) && words.every((w) => haystack(x).includes(w));
  const mine = myStudying().map((id) => COURSES.find((x) => x.id === id)).filter(Boolean) as Course[];
  const groups = SUBJECTS.map((s) => [s, COURSES.filter((x) => x.subject === s && match(x))] as const).filter(([, cs]) => cs.length);

  return (
    <>
      <Screen header={{ title: 'Every', accent: 'class', subtitle: `${COURSES.length} free courses, including every AP class.` }}>
        <ClassesBar where="courses" />
        <SearchField value={q} onChangeText={setQ} placeholder='Try "APUSH" or "photosynthesis"' />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10 }}>
          {['All', 'AP', ...SUBJECTS].map((s) => <Pill key={s} label={s === 'AP' ? 'AP' : s} on={subject === s} onPress={() => setSubject(s)} />)}
        </ScrollView>
        {!q && subject === 'All' && mine.length ? (
          <Section header="Your classes">
            {mine.map((x) => <Row key={x.id} icon={courseIcon(x)} iconColor={subjectColor(c, x.subject)} title={x.title} subtitle={`${x.lessons.length} lessons · ${x.level}`} onPress={() => router.push(`/courses/${x.id}`)} />)}
          </Section>
        ) : null}
        {groups.length ? groups.map(([s, cs]) => (
          <Section key={s} header={s}>
            {cs.map((x) => {
              const done = x.lessons.filter((l) => learned[`${x.id}/${l.id}`]).length;
              return (
                <Row key={x.id} icon={courseIcon(x)} iconColor={subjectColor(c, x.subject)} title={x.title} onPress={() => router.push(`/courses/${x.id}`)}
                  subtitle={
                    <View style={{ gap: 5, marginTop: 1 }}>
                      <Text style={[type.subhead, { color: c.label2 }]}>{x.lessons.length} lessons · {x.level}</Text>
                      {done ? <Bar value={done / x.lessons.length} color={c.good} /> : null}
                    </View>
                  } />
              );
            })}
          </Section>
        )) : <Empty icon="search" title="No courses found" body={`Nothing matches "${q}". Try another word, or pick All.`} />}
      </Screen>
    </>
  );
}
