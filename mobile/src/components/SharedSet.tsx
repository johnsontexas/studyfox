// Preview of a set from a share link (from the website or the app) with a Save button.
import { router } from 'expo-router';
import { View } from 'react-native';
import { Text } from './AppText';
import type { CardT } from '../lib/cards';
import { store } from '../lib/shared';
import { type, useColors } from '../lib/theme';
import { Button, Row, Section } from './ui';

export default function SharedSet({ set }: { set: { title: string; desc: string; cards: CardT[] } }) {
  const c = useColors();
  return (
    <View>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
        <Text style={[type.footnote, { color: c.tint, fontWeight: '600', textTransform: 'uppercase' }]}>Shared set</Text>
        <Text style={[type.title2, { color: c.label }]}>{set.title}</Text>
        {set.desc ? <Text style={[type.subhead, { color: c.label2 }]}>{set.desc}</Text> : null}
      </View>
      <View style={{ padding: 16 }}>
        <Button title={`Save ${set.cards.length} Cards`} icon="plus"
          onPress={() => { const nid = store.upsertSet({ title: set.title, desc: set.desc, cards: set.cards }); router.dismissAll(); setTimeout(() => router.push(`/cards/${encodeURIComponent(nid)}`), 350); }} />
      </View>
      <Section header={`${set.cards.length} terms`} style={{ marginTop: 4 }}>
        {set.cards.map((x, i) => <Row key={i} title={<Text style={[type.headline, { color: c.label }]}>{x.t}</Text>} subtitle={x.d} numberOfLines={4} />)}
      </Section>
    </View>
  );
}
