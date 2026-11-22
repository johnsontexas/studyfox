// Classes and study groups (same as the website's Dashboard > Classes, js/views/classes.js).
// Join with a 6-letter code, or start a class (only you share sets) or a study group (everyone shares).
import { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import ModalBar from '../../components/ModalBar';
import { Button, Field, menu, Row, Section, Segmented } from '../../components/ui';
import { contentClient } from '../../lib/cloud';
import { classTopics, cleanCode, createClass, joinClass, kindLabel, myClasses, store, topicLabel } from '../../lib/shared';
import { type, useColors } from '../../lib/theme';

type Cls = { id: string; name: string; kind: string; topic: string | null; is_owner: boolean; members: number; sets: number };

export default function Classes() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const [list, setList] = useState<Cls[] | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'class' | 'group'>('class');
  const [topic, setTopic] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const signedIn = !!store.user()?.cloud;

  useFocusEffect(useCallback(() => { if (signedIn) myClasses(contentClient()).then(setList, () => setList([])); }, [signedIn]));

  const join = async () => {
    const k = cleanCode(code);
    if (k.length !== 6) return Alert.alert('Check the code', 'Codes are 6 letters and numbers, like ABC123.');
    setBusy(true);
    try { const id = await joinClass(contentClient(), k); setCode(''); router.push(`/class/${id}`); } catch (e: any) { Alert.alert('Could not join', e.message); }
    setBusy(false);
  };
  const make = async () => {
    if (!name.trim()) return Alert.alert('Give it a name');
    setBusy(true);
    try { const id = await createClass(contentClient(), name.trim(), kind, topic); setName(''); router.push(`/class/${id}`); } catch (e: any) { Alert.alert('Could not create it', e.message); }
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title="Classes" />
      <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 28 }} keyboardShouldPersistTaps="handled">
        {!signedIn ? <Text style={[type.body, { color: c.label2, padding: 20 }]}>Sign in with an account that syncs to join classes.</Text> : (
          <>
            <Section header="Join with a code" footer="Get the code from your teacher or friends.">
              <Field value={code} onChangeText={(v) => setCode(cleanCode(v))} autoCapitalize="characters" autoCorrect={false} maxLength={6} placeholder="ABC123" />
            </Section>
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}><Button title="Join" onPress={join} disabled={busy || cleanCode(code).length !== 6} /></View>

            <Section header="Your classes">
              {list == null ? <Row title="Loading..." accessory="none" />
                : !list.length ? <Row title="You are not in any classes yet" accessory="none" />
                : list.map((x) => (
                  <Row key={x.id} icon="users" iconColor={x.kind === 'group' ? c.purple : c.tint} title={x.name} onPress={() => router.push(`/class/${x.id}`)}
                    subtitle={`${kindLabel(x.kind)}${x.is_owner ? ' · Admin' : ''} · ${topicLabel(x.topic)} · ${x.members} ${x.members === 1 ? 'member' : 'members'}`} />
                ))}
            </Section>

            <Section header="Start a class or group" footer={kind === 'class' ? 'Only you share flashcard sets. Good for teachers and tutors.' : 'Everyone in the group can share flashcard sets.'}>
              <Field value={name} onChangeText={setName} maxLength={60} placeholder="Name, like Period 3 AP Bio" />
              <View style={{ padding: 12 }}><Segmented options={[['class', 'Class'], ['group', 'Study group']]} value={kind} onChange={setKind} /></View>
              <Row title="Leaderboard topic" value={topicLabel(topic || null)}
                onPress={() => menu('The leaderboard only counts this subject', [{ title: 'All subjects', onPress: () => setTopic('') }, ...classTopics().map(([id, label]: string[]) => ({ title: label, onPress: () => setTopic(id) }))])} />
            </Section>
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}><Button title="Create" kind="tinted" onPress={make} disabled={busy || !name.trim()} /></View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
