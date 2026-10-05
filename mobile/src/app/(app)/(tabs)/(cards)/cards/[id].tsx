import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Share, Text, useWindowDimensions, View } from 'react-native';
import FlipCard from '../../../../../components/FlipCard';
import { Button, confirm, Empty, Icon, IconButton, menu, Row, Screen, Section, tap } from '../../../../../components/ui';
import { getSet, masteredCount, progress, shareUrl } from '../../../../../lib/cards';
import { store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';

export default function SetScreen() {
  useStore();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSet(id);
  const [page, setPage] = useState(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  if (!s) return <Screen><Stack.Screen options={{ title: '' }} /><Empty icon="cards" title="Set not found" body="It may have been deleted on another device." /></Screen>;

  const p = progress(s.id);
  const m = masteredCount(s);
  const enc = encodeURIComponent(s.id);
  const small = s.cards.length < 4;
  const star = (k: number) => { p.starred = p.starred.includes(k) ? p.starred.filter((x) => x !== k) : [...p.starred, k]; store.save(); };
  const cardW = width - 32;

  const more = () => menu(s.title, [
    ...(s.builtin
      ? [{ title: 'Make an Editable Copy', onPress: () => { const nid = store.upsertSet({ title: `${s.title} (copy)`, desc: s.desc, cards: s.cards.map((x) => ({ ...x })) }); router.push(`/edit-set?id=${encodeURIComponent(nid)}`); } }]
      : [{ title: 'Edit Set', onPress: () => router.push(`/edit-set?id=${enc}`) }]),
    ...(m ? [{ title: 'Reset Progress', onPress: () => { p.mastery = {}; store.save(); } }] : []),
    ...(!s.builtin ? [{ title: 'Delete Set', destructive: true, onPress: async () => { if (await confirm(`Delete "${s.title}"?`, "This can't be undone.", 'Delete')) { store.deleteSet(s.id); router.back(); } } }] : []),
  ]);

  return (
    <>
      <Stack.Screen options={{
        title: '', headerLargeTitle: false,
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <IconButton name="share" label="Share set" onPress={() => Share.share({ message: `Study "${s.title}" on StudyFox: ${shareUrl(s)}` })} />
            <IconButton name="more" label="More" onPress={more} />
          </View>
        ),
      }} />
      <Screen>
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Text style={[type.title2, { color: c.label }]}>{s.title}</Text>
          <Text style={[type.subhead, { color: c.label2, marginTop: 4 }]}>{s.cards.length} terms · {m} mastered{s.builtin ? ' · Free study set' : ''}</Text>
        </View>

        <FlatList
          data={s.cards}
          horizontal
          pagingEnabled={false}
          snapToInterval={cardW + 12}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingVertical: 16 }}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)))}
          renderItem={({ item, index }) => (
            <FlipCard front={item.t} back={item.d} flipped={!!flipped[index]} onFlip={() => setFlipped({ ...flipped, [index]: !flipped[index] })}
              starred={p.starred.includes(index)} onStar={() => star(index)} style={{ width: cardW, height: 230 }} />
          )}
        />
        <Text style={[type.footnote, { color: c.label2, textAlign: 'center', marginTop: -6 }]}>{page + 1} of {s.cards.length} · swipe for more</Text>

        <View style={{ paddingHorizontal: 16, marginTop: 18, gap: 12 }}>
          <Button title="Study" icon="swipe" onPress={() => router.push(`/study/${enc}`)} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Mode icon="learn" title="Learn" color={c.purple} disabled={small} onPress={() => router.push(`/learn/${enc}`)} />
            <Mode icon="test" title="Test" color={c.blue} disabled={small} onPress={() => router.push(`/test/${enc}`)} />
            <Mode icon="match" title="Match" color={c.orange} disabled={s.cards.length < 2} onPress={() => router.push(`/match/${enc}`)} />
          </View>
          {small ? <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>Learn and Test need at least 4 cards.</Text> : null}
        </View>

        {s.desc ? <Text style={[type.subhead, { color: c.label2, marginHorizontal: 20, marginTop: 20 }]}>{s.desc}</Text> : null}
        <Section header={`Terms (${s.cards.length})`}>
          {s.cards.map((x, k) => (
            <Row key={k} title={<Text style={[type.headline, { color: c.label }]}>{x.t}</Text>} subtitle={x.d} accessory="none" numberOfLines={4}
              right={
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Pressable hitSlop={10} onPress={() => { tap(); star(k); }} accessibilityLabel="Star card">
                    <Icon name={p.starred.includes(k) ? 'starFill' : 'star'} size={20} color={p.starred.includes(k) ? c.yellow : c.label3} />
                  </Pressable>
                  {(p.mastery[k] || 0) >= 2 ? <Icon name="checkCircle" size={16} color={c.good} /> : null}
                </View>
              } />
          ))}
        </Section>
      </Screen>
    </>
  );
}

function Mode({ icon, title, color, onPress, disabled }: { icon: string; title: string; color: string; onPress: () => void; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable disabled={disabled} accessibilityRole="button" onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: c.card, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[type.subhead, { color: c.label, fontWeight: '600' }]}>{title}</Text>
    </Pressable>
  );
}
