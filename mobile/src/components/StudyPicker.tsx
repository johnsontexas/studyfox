// "What you're studying for": the SAT, the ACT, and any AP classes. Same data as the website's
// js/studying.js (settings.studying), picked with a search field in onboarding and the Me tab.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from './AppText';
import { COURSES, courseIcon, store } from '../lib/shared';
import { useStore } from '../lib/store-hooks';
import { type, useColors } from '../lib/theme';
import Icon from './Icon';
import { Row, SearchField } from './ui';

type Opt = { id: string; label: string; icon: string; kind: 'test' | 'ap' };
export const studyOptions = (): Opt[] => [
  { id: 'SAT', label: 'SAT', icon: 'sat', kind: 'test' },
  { id: 'ACT', label: 'ACT', icon: 'act', kind: 'test' },
  ...COURSES.filter((c) => c.ap).map((c) => ({ id: c.id, label: c.title, icon: courseIcon(c), kind: 'ap' as const })),
];
const byId = (id: string) => studyOptions().find((o) => o.id === id);

export const myStudying = (): string[] => (store.user() ? ((store.data().settings.studying as string[]) || []).filter(byId) : []);

export function setStudying(ids: string[]) {
  const s = store.data().settings;
  s.studying = ids;
  if (ids.includes('ACT') && !ids.includes('SAT')) s.focus = 'ACT';
  else if (ids.includes('SAT') && !ids.includes('ACT')) s.focus = 'SAT';
  store.save();
}

/** Selected chips plus a search field with matching results. */
export function StudyPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const c = useColors();
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase().replace(/^ap\s*/, '');
  const results = studyOptions().filter((o) => !value.includes(o.id) && (!t || o.label.toLowerCase().replace(/^ap /, '').includes(t))).slice(0, t ? 8 : 5);
  return (
    <View style={{ paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingBottom: 6 }}>
        {value.length ? value.map((id) => (
          <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Remove ${byId(id)?.label}`} onPress={() => onChange(value.filter((x) => x !== id))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingLeft: 12, paddingRight: 9, borderRadius: 999, backgroundColor: c.tintSoft, borderWidth: 1, borderColor: c.tint }}>
            <Text style={[type.subhead, { fontWeight: '700', color: c.tint }]}>{byId(id)?.label}</Text>
            <Icon name="close" size={11} color={c.tint} weight="bold" />
          </Pressable>
        )) : <Text style={[type.subhead, { color: c.label2 }]}>Nothing picked yet.</Text>}
      </View>
      <SearchField value={q} onChangeText={setQ} placeholder="Search SAT, ACT, or an AP class" />
      <View style={{ marginTop: 4 }}>
        {results.map((o) => <Row key={o.id} icon={o.icon} iconColor={c.tint} title={o.label} accessory={<Icon name="plus" size={15} color={c.tint} weight="semibold" />} onPress={() => { onChange([...value, o.id]); setQ(''); }} />)}
        {!results.length ? <Text style={[type.subhead, { color: c.label2, paddingHorizontal: 16, paddingVertical: 8 }]}>No matches.</Text> : null}
      </View>
    </View>
  );
}

/** "Studying for" chips at the top of Courses, Practice, AP, and Today. Each chip opens the right page. */
export function ClassesBar({ where }: { where: 'courses' | 'practice' | 'ap' | 'today' }) {
  useStore();
  const c = useColors();
  const mine = myStudying().map(byId).filter(Boolean) as Opt[];
  if (!store.user()) return null;
  const open = (o: Opt) => {
    if (o.kind === 'test') { const s = store.data().settings; if (s.focus !== o.id) { s.focus = o.id; store.save(); } router.push('/practice'); }
    else router.push(where === 'courses' ? `/courses/${o.id}` : `/practice/ap/${o.id}`);
  };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10, alignItems: 'center' }}>
      {mine.map((o) => (
        <Pressable key={o.id} accessibilityRole="button" onPress={() => open(o)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: c.tintSoft, opacity: pressed ? 0.7 : 1 })}>
          <Icon name={o.icon} size={14} color={c.tint} weight="semibold" />
          <Text style={[type.subhead, { fontWeight: '700', color: c.tint }]}>{o.label}</Text>
        </Pressable>
      ))}
      <Pressable accessibilityRole="button" onPress={() => router.push('/me')} style={{ paddingVertical: 7, paddingHorizontal: 6 }}>
        <Text style={[type.subhead, { fontWeight: '600', color: mine.length ? c.label2 : c.tint }]}>{mine.length ? 'Edit' : 'Pick what you\'re studying for'}</Text>
      </Pressable>
    </ScrollView>
  );
}
