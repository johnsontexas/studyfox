import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '../../../../../../components/AppText';
import { Bar, Button, Empty, Icon, IconTile, Row, Screen, Section } from '../../../../../../components/ui';
import { getCourse, store } from '../../../../../../lib/shared';
import { useStore } from '../../../../../../lib/store-hooks';
import { subjectColor, type, useColors } from '../../../../../../lib/theme';

export default function CourseScreen() {
  useStore();
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = getCourse(id);
  if (!course) return <Screen><Empty icon="book" title="Course not found" /></Screen>;
  const learned = store.data().learned as Record<string, number>;
  const done = course.lessons.filter((l) => learned[`${course.id}/${l.id}`]).length;
  const next = course.lessons.find((l) => !learned[`${course.id}/${l.id}`]) || course.lessons[0];
  const mins = course.lessons.reduce((s, l) => s + (l.mins || 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: course.title, headerLargeTitle: false }} />
      <Screen>
        <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, gap: 8 }}>
          <IconTile name={course.icon} color={subjectColor(c, course.subject)} size={64} />
          <Text style={[type.title2, { color: c.label, textAlign: 'center', marginTop: 4 }]}>{course.title}</Text>
          <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>{course.blurb}</Text>
          <Text style={[type.footnote, { color: c.label2 }]}>{course.lessons.length} lessons · about {mins} min · {course.level}</Text>
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 18, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}><Bar value={done / course.lessons.length} color={c.good} height={6} /></View>
            <Text style={[type.footnote, { color: c.label2 }]}>{done} of {course.lessons.length}</Text>
          </View>
          <Button title={done ? 'Continue' : 'Start Course'} icon="forward" onPress={() => router.push(`/courses/${course.id}/${next.id}`)} />
        </View>
        <Section header="Lessons">
          {course.lessons.map((l, i) => {
            const ok = learned[`${course.id}/${l.id}`];
            return (
              <Row key={l.id} title={l.title} onPress={() => router.push(`/courses/${course.id}/${l.id}`)}
                subtitle={`${l.mins} min${l.check ? ' · quick check' : ''}${l.desmos ? ' · calculator' : ''}`}
                value={ok ? <Icon name="checkCircle" size={20} color={c.good} /> : <Text style={[type.subhead, { color: c.label3, fontVariant: ['tabular-nums'] }]}>{i + 1}</Text>} />
            );
          })}
        </Section>
      </Screen>
    </>
  );
}
