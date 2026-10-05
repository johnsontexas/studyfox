// Paste a StudyFox share link (from the website or a friend) to save a copy of that set.
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Field, Section } from '../../components/ui';
import SharedSet from '../../components/SharedSet';
import { parseShared } from '../../lib/cards';
import { type, useColors } from '../../lib/theme';

export default function ImportSet() {
  const c = useColors();
  const [link, setLink] = useState('');
  const set = link.trim() ? parseShared(link) : null;
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {set ? <SharedSet set={set} /> : (
        <>
          <View style={{ paddingHorizontal: 20, gap: 6 }}>
            <Text style={[type.title2, { color: c.label }]}>Import a Set</Text>
            <Text style={[type.subhead, { color: c.label2 }]}>Paste a StudyFox share link from the website or a friend.</Text>
          </View>
          <Section footer={link.trim() ? "That link didn't work. It may have been cut off when it was copied." : undefined}>
            <Field value={link} onChangeText={setLink} placeholder="studyfox.org/#/share/..." autoCapitalize="none" autoCorrect={false} />
          </Section>
          <View style={{ padding: 16 }}><Button title="Paste Link" icon="paste" kind="tinted" onPress={async () => setLink(await Clipboard.getStringAsync())} /></View>
        </>
      )}
    </ScrollView>
  );
}
