// The numbered question bank (SAT #1, #2, ...), same numbers as the website. Tap any number to try it.
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../../../../components/AppText';
import { Pill, Segmented, tap } from '../../../../../components/ui';
import { setSession } from '../../../../../lib/questions';
import { bank, DIFF_LABEL, regen, SECTIONS, store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';
import type { BankEntry, Test } from '../../../../../lib/types';

export default function Bank() {
  useStore();
  const c = useColors();
  const d = store.data();
  const test: Test = d.settings.focus || 'SAT';
  const secs = SECTIONS[test];
  const [sec, setSec] = useState(Object.keys(secs)[0]);
  const section = secs[sec] ? sec : Object.keys(secs)[0];
  const [diff, setDiff] = useState<string>('mixed');
  const [domain, setDomain] = useState<string>('all');
  const all = bank(test).filter((e) => e.section === section);
  const domains = [...new Set(all.map((e) => e.domain))];
  const dom = domains.includes(domain) ? domain : 'all';
  const list = all.filter((e) => (dom === 'all' || e.domain === dom) && (diff === 'mixed' || e.difficulty === +diff));
  const done = d.bank as Record<string, { c: number }>;
  const open = (e: BankEntry) => {
    const q = regen(e.id);
    if (!q) return;
    tap();
    setSession({ title: `${test} #${e.no}`, test, section, questions: [q] });
    router.push('/quiz');
  };
  const legend = (bg: string, label: string) => <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: bg }} /><Text style={[type.footnote, { color: c.label2 }]}>{label}</Text></View>;

  return (
    <>
      <Stack.Screen options={{ title: `${test} Question Bank`, headerLargeTitle: false }} />
      <FlatList
        style={{ backgroundColor: c.bg }}
        contentInsetAdjustmentBehavior="automatic"
        data={list}
        keyExtractor={(e) => e.id}
        numColumns={6}
        initialNumToRender={90}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 6, marginBottom: 6 }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 4, paddingTop: 8, paddingBottom: 14, gap: 12 }}>
            <Segmented options={Object.entries(secs).map(([k, v]) => [k, v.replace('Reading and Writing', 'Reading & Writing')] as [string, string])} value={section} onChange={(v) => { setSec(v); setDomain('all'); }} />
            <Segmented options={[['mixed', 'All'], ...(['1', '2', '3'] as const).map((k) => [k, DIFF_LABEL[k]] as [string, string])]} value={diff} onChange={setDiff} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['all', ...domains].map((d) => <Pill key={d} label={d === 'all' ? 'All domains' : d} on={dom === d} onPress={() => { tap(); setDomain(d); }} />)}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 14 }}>{legend(c.card, 'Not done')}{legend(c.green, 'Correct')}{legend(c.red, 'Missed')}</View>
            <Text style={[type.footnote, { color: c.label2 }]}>{list.filter((e) => done[e.id]).length} of {list.length} done{list.length < all.length ? ' (filtered)' : ''}. Numbers match studyfox.org.</Text>
          </View>
        }
        renderItem={({ item: e }) => {
          const st = done[e.id] ? (done[e.id].c ? 'r' : 'm') : 'n';
          return (
            <Pressable onPress={() => open(e)} accessibilityLabel={`Question ${e.no}, ${e.skill}`}
              style={({ pressed }) => ({ flex: 1 / 6, aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'r' ? c.green : st === 'm' ? c.red : c.card, opacity: pressed ? 0.6 : 1 })}>
              <Text style={[type.footnote, { fontWeight: '600', color: st === 'n' ? c.label : '#fff', fontVariant: ['tabular-nums'] }]}>{e.no}</Text>
            </Pressable>
          );
        }}
      />
    </>
  );
}
