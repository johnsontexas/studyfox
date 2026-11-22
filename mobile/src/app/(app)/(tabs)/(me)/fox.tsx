// Your fox: pick fur, eyes, mouth, shirt and its color, hat, and glasses. Same items, locks, and saving
// as the website's Your fox page (js/avatar-editor.js). Exclusive items show how to earn them.
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../../../components/AppText';
import Fox from '../../../../components/Fox';
import Icon from '../../../../components/Icon';
import { Button, Card, Screen, tap } from '../../../../components/ui';
import { contentClient } from '../../../../lib/cloud';
import { defaultAvatar, earnFoxItem, followSet, followUrl, foxStats, foxUnlocked, isUnlocked, myAvatar, PART_NAMES, PARTS, saveAvatar, store, unlockText } from '../../../../lib/shared';
import { type, useColors } from '../../../../lib/theme';

type Item = { id: string; name: string; unlock?: { kind: string; n?: number; ig?: string } };

export default function FoxScreen() {
  const c = useColors();
  const [a, setA] = useState<any>(myAvatar());
  const [part, setPart] = useState<string>('fur');
  const stats = foxStats(), had = foxUnlocked();
  const set = (next: any) => { tap(); setA(next); saveAvatar(store.user()?.cloud ? contentClient() : null, next); };
  const items = [...((PARTS as any)[part] as Item[])].sort((x, y) => Number(!!x.unlock) - Number(!!y.unlock));
  return (
    <Screen header={{ title: 'Your', accent: 'fox' }}>
      <View style={{ alignItems: 'center', marginTop: 8 }}><Fox avatar={a} size={160} /></View>
      <Text style={[type.subhead, { color: c.label2, textAlign: 'center', marginHorizontal: 24, marginTop: 8 }]}>This is you on your profile, the Match leaderboards, and Top sharers.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, marginTop: 16 }}>
        {Object.entries(PART_NAMES as Record<string, string>).map(([k, n]) => (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: part === k }} onPress={() => { tap(); setPart(k); }}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: part === k ? c.tint : c.card }}>
            <Text style={[type.subhead, { color: part === k ? c.onTint : c.label, fontWeight: '600' }]}>{n}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Card style={{ marginHorizontal: 16, marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {items.map((o) => {
          const on = a[part] === o.id, open = isUnlocked(o, stats, had);
          return (
            <Pressable key={o.id} accessibilityRole="button" accessibilityLabel={open ? o.name : `${o.name}, locked. ${unlockText(o.unlock)}`} accessibilityState={{ selected: on }}
              onPress={() => (open ? set({ ...a, [part]: o.id }) : followUrl(o) ? (Linking.openURL(followUrl(o)!), followSet(o).forEach((p: any) => earnFoxItem(p[1].id)), set({ ...a, [part]: o.id })) : Alert.alert(`${o.name} is locked`, `${unlockText(o.unlock)} to earn it.`))}
              style={{ width: 96, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 14, borderWidth: 2, borderColor: on ? c.tint : 'transparent', backgroundColor: on ? c.tintSoft : o.unlock ? c.amber + '22' : 'transparent' }}>
              <View style={{ opacity: open ? 1 : 0.4 }}><Fox avatar={{ ...a, [part]: o.id }} size={60} /></View>
              {!open ? <View style={{ position: 'absolute', top: 6, right: 8 }}><Icon name="lock" size={14} color={c.label2} /></View> : null}
              <Text style={[type.caption, { color: c.label, fontWeight: on ? '700' : '400', textAlign: 'center' }]} numberOfLines={2}>{o.name}</Text>
              {o.unlock ? <Text style={[type.caption2, { color: c.label2, textAlign: 'center' }]} numberOfLines={3}>{open ? 'Earned' : unlockText(o.unlock)}</Text> : null}
            </Pressable>
          );
        })}
      </Card>
      <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 24 }}>
        <Button title="Shuffle Outfit" icon="shuffle" kind="tinted" onPress={() => set({ ...defaultAvatar(), fur: a.fur })} />
      </View>
    </Screen>
  );
}
