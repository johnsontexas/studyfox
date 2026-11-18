// Create or edit a flashcard set. "Paste a List" turns notes into many cards at once.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field, Icon, Row, Section, Segmented, tap } from '../../components/ui';
import { parseImport, type CardT, type RowT, type SepT } from '../../lib/cards';
import { importPrefs, store } from '../../lib/shared';
import { type, useColors } from '../../lib/theme';

export default function EditSet() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? store.getSet(id) : null;
  const [title, setTitle] = useState(existing?.title || '');
  const [desc, setDesc] = useState(existing?.desc || '');
  const [cards, setCards] = useState<CardT[]>(existing ? existing.cards.map((x: CardT) => ({ ...x })) : [{ t: '', d: '' }, { t: '', d: '' }, { t: '', d: '' }]);
  const [importing, setImporting] = useState(false);
  const [imp, setImp] = useState(() => { const p = importPrefs(store.data().settings); return { txt: '', sep: p.sep as SepT, row: p.row as RowT, cSep: p.cSep as string, cRow: p.cRow as string }; });
  const scroll = useRef<ScrollView>(null);
  const parsed = parseImport(imp.txt, imp.sep, imp.row, imp.cSep, imp.cRow);

  const update = (i: number, f: 't' | 'd', v: string) => setCards(cards.map((x, k) => (k === i ? { ...x, [f]: v } : x)));
  const addCard = () => { setCards([...cards, { t: '', d: '' }]); setTimeout(() => scroll.current?.scrollToEnd(), 60); };
  const save = () => {
    const clean = cards.map((x) => ({ t: x.t.trim(), d: x.d.trim() })).filter((x) => x.t || x.d);
    if (!title.trim()) return Alert.alert('Add a title', 'Give your set a name, like "Unit 3 vocab".');
    if (clean.length < 2) return Alert.alert('Add more cards', 'A set needs at least two cards.');
    const sid = store.upsertSet({ ...(existing || {}), title: title.trim(), desc: desc.trim(), cards: clean });
    router.back();
    if (!existing) setTimeout(() => router.push(`/cards/${encodeURIComponent(sid)}`), 350);
  };
  const txt = (style?: object) => [type.body, { color: c.label }, style];

  // The bar is drawn in the screen, not with Stack.Screen header options: updating native header
  // options on every keystroke made iOS drop the keyboard, so you couldn't type a set's name.
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.bar, { borderBottomColor: c.sep, paddingTop: Platform.OS === 'ios' ? 14 : ins.top + 10 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ width: 80 }}><Text style={[type.body, { color: c.tint }]}>Cancel</Text></Pressable>
        <Text style={[type.headline, { color: c.label, flex: 1, textAlign: 'center' }]}>{existing ? 'Edit Set' : 'New Set'}</Text>
        <Pressable hitSlop={10} onPress={save} style={{ width: 80, alignItems: 'flex-end' }}><Text style={[type.headline, { color: c.tint }]}>{existing ? 'Save' : 'Create'}</Text></Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : undefined} style={{ flex: 1 }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: ins.bottom + 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <Section>
          <Field value={title} onChangeText={setTitle} placeholder="Title, like Unit 3 vocab" autoFocus={!existing} returnKeyType="next" style={{ fontWeight: '600' }} />
          <Field value={desc} onChangeText={setDesc} placeholder="Description (optional)" multiline />
        </Section>

        {importing ? (
          <Section header="Paste a list" footer={`${parsed.length} card${parsed.length === 1 ? '' : 's'} found. One card per line, like "Mitochondria - Makes ATP".`}>
            <TextInput value={imp.txt} onChangeText={(t) => setImp({ ...imp, txt: t })} multiline autoFocus autoCapitalize="none" placeholder={'Mitochondria - Makes ATP\nRibosome - Builds proteins'} placeholderTextColor={c.label3}
              style={[type.body, { color: c.label, minHeight: 150, padding: 16, textAlignVertical: 'top' }]} />
            <View style={{ padding: 12, gap: 10 }}>
              <Text style={[type.footnote, { color: c.label2 }]}>Between term and definition</Text>
              <Segmented options={[['dash', 'Dash'], ['tab', 'Tab'], ['comma', 'Comma'], ['custom', 'Custom']]} value={imp.sep} onChange={(sep) => setImp({ ...imp, sep })} />
              {imp.sep === 'custom' && <TextInput value={imp.cSep} onChangeText={(cSep) => setImp({ ...imp, cSep })} autoCapitalize="none" autoCorrect={false} placeholder="Type a separator, like :" placeholderTextColor={c.label3}
                style={[type.body, styles.custom, { color: c.label, borderColor: c.sep }]} />}
              <Text style={[type.footnote, { color: c.label2 }]}>Between cards</Text>
              <Segmented options={[['nl', 'New line'], ['semi', 'Semicolon'], ['custom', 'Custom']]} value={imp.row} onChange={(row) => setImp({ ...imp, row })} />
              {imp.row === 'custom' && <TextInput value={imp.cRow} onChangeText={(cRow) => setImp({ ...imp, cRow })} autoCapitalize="none" autoCorrect={false} placeholder="Type a separator, like |  (\n = new line)" placeholderTextColor={c.label3}
                style={[type.body, styles.custom, { color: c.label, borderColor: c.sep }]} />}
            </View>
            <Row title={`Add ${parsed.length} Cards`} tint accessory="none" onPress={() => { if (!parsed.length) return; store.data().settings.importSep = { sep: imp.sep, row: imp.row, cSep: imp.cSep, cRow: imp.cRow }; store.save(); setCards([...cards.filter((x) => x.t || x.d), ...parsed]); setImporting(false); setImp({ ...imp, txt: '' }); }} />
            <Row title="Cancel" accessory="none" onPress={() => setImporting(false)} />
          </Section>
        ) : (
          <Section>
            <Row icon="paste" iconColor={c.blue} title="Paste a List" subtitle="Turn notes into cards in one step" onPress={() => setImporting(true)} />
          </Section>
        )}

        {cards.map((x, i) => (
          <Section key={i} header={`Card ${i + 1}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput value={x.t} onChangeText={(v) => update(i, 't', v)} placeholder="Term" placeholderTextColor={c.label3} multiline style={txt({ flex: 1, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 12 })} />
              <Pressable hitSlop={10} accessibilityLabel={`Delete card ${i + 1}`} style={{ paddingHorizontal: 14 }}
                onPress={() => { tap(); const n = cards.filter((_, k) => k !== i); setCards(n.length ? n : [{ t: '', d: '' }]); }}>
                <Icon name="trash" size={18} color={c.label3} />
              </Pressable>
            </View>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.sep, marginLeft: 16 }} />
            <TextInput value={x.d} onChangeText={(v) => update(i, 'd', v)} placeholder="Definition" placeholderTextColor={c.label3} multiline style={txt({ paddingHorizontal: 16, paddingVertical: 12 })} />
          </Section>
        ))}
        <Section>
          <Row icon="plus" iconColor={c.tint} title="Add Card" accessory="none" onPress={addCard} />
        </Section>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  custom: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
