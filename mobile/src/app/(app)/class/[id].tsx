// One class or study group: join code, topic leaderboard, shared flashcard sets, and admin tools
// for the person who made it. Same as the website's #/classes/:id (js/views/classes.js).
import { useCallback, useState } from 'react';
import { Alert, Share, ScrollView, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Text } from '../../../components/AppText';
import ModalBar from '../../../components/ModalBar';
import Fox from '../../../components/Fox';
import { Bar, Button, confirm, Field, menu, Row, Section, Segmented } from '../../../components/ui';
import { contentClient } from '../../../lib/cloud';
import {
  myAvatar,
  classDetail, classSet, classTopics, deleteClass, kindLabel, leaveClass, newJoinCode, removeMember, shareSet, SITE_URL, store, topicLabel, unshareSet, updateClass,
} from '../../../lib/shared';
import { type, useColors } from '../../../lib/theme';

type BoardRow = { user_id: string; name: string; owner: boolean; me: boolean; score: number; avatar?: any };
type SetRow = { id: string; title: string; added_name: string; mine: boolean; count: number };
type Detail = { id: string; name: string; kind: 'class' | 'group'; topic: string | null; code: string; is_owner: boolean; can_share: boolean; board: BoardRow[]; sets: SetRow[] };

export default function ClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState<{ name: string; kind: 'class' | 'group'; topic: string } | null>(null);
  const cl = () => contentClient();
  const fail = (e: any) => Alert.alert('Something went wrong', e.message);

  const load = useCallback(() => classDetail(cl(), id).then((x: Detail) => { setD(x); setEdit({ name: x.name, kind: x.kind, topic: x.topic || '' }); }, (e: any) => setErr(e.message)), [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (err) return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar title="Class" /><Text style={[type.body, { color: c.label2, padding: 20 }]}>{err}</Text></View>;
  if (!d || !edit) return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar title="Class" /><Text style={[type.body, { color: c.label2, padding: 20 }]}>Loading...</Text></View>;

  const max = Math.max(1, ...d.board.map((r) => r.score));
  const invite = `Join my ${d.kind === 'group' ? 'study group' : 'class'} "${d.name}" on StudyFox with code ${d.code}: ${SITE_URL.replace(/\/$/, '')}/#/join/${d.code}`;

  const share = () => {
    const sets = store.sets().filter((s: any) => s.cards?.length);
    if (!sets.length) return Alert.alert('No sets yet', 'Make a flashcard set first, then share it here.');
    menu('Share a set with the class', sets.map((s: any) => ({ title: `${s.title || 'Untitled set'} (${s.cards.length})`, onPress: () => shareSet(cl(), d.id, s).then(load, fail) })));
  };
  const openSet = async (s: SetRow) => {
    try {
      const full = await classSet(cl(), s.id);
      const cards = (full.cards || []).map((x: any) => ({ t: String(x.t ?? ''), d: String(x.d ?? '') }));
      const nid = store.upsertSet({ title: full.title || 'Shared set', desc: full.desc || '', cards, fromClass: d.id });
      router.push(`/cards/${encodeURIComponent(nid)}`);
    } catch (e) { fail(e); }
  };
  const setActions = (s: SetRow) => menu(s.title, [
    { title: 'Save to my sets and study', onPress: () => openSet(s) },
    ...(s.mine || d.is_owner ? [{ title: 'Remove from class', destructive: true, onPress: () => unshareSet(cl(), s.id).then(load, fail) }] : []),
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={d.name} />
      <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 28 }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: 20, paddingBottom: 0, gap: 4 }}>
          <Text style={[type.footnote, { color: c.label2 }]}>{`${kindLabel(d.kind)}${d.is_owner ? ' · You are the admin' : ''}`}</Text>
          <Text style={[type.title2, { color: c.label }]}>{d.name}</Text>
          <Text style={[type.subhead, { color: c.label2 }]}>{d.topic ? `Leaderboard: correct answers in ${topicLabel(d.topic)}` : 'Leaderboard: correct answers in every subject'}</Text>
        </View>

        <Section header="Join code">
          <Row title={d.code} accessory="none" />
          <Row icon="share" iconColor={c.orange} title="Share Invite" onPress={() => Share.share({ message: invite })} />
          <Row icon="link" iconColor={c.blue} title="Copy Code" onPress={() => { Clipboard.setStringAsync(d.code); Alert.alert('Code copied'); }} />
          {d.is_owner ? <Row icon="edit" iconColor={c.gray} title="Make a New Code" onPress={() => confirm('New code?', 'The old code stops working. Nobody already in is removed.', 'New code').then((y) => { if (y) newJoinCode(cl(), d.id).then(load, fail); })} /> : null}
        </Section>

        <Section header="Leaderboard" footer="Answers you practice on StudyFox count here once they sync.">
          {d.board.map((r, n) => (
            <Row key={r.user_id} title={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Fox avatar={r.me ? myAvatar() : r.avatar} seed={r.user_id} size={28} /><Text style={[type.body, { color: c.label, flexShrink: 1 }]} numberOfLines={1}>{`${n + 1}. ${r.name || 'Student'}${r.me ? ' (you)' : ''}${r.owner ? ' · Admin' : ''}`}</Text></View>} accessory="none"
              subtitle={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}><View style={{ flex: 1 }}><Bar value={r.score / max} color={r.me ? c.tint : c.good} /></View><Text style={[type.footnote, { color: c.label, fontWeight: '700' }]}>{r.score}</Text></View>}
              onPress={d.is_owner && !r.me ? () => confirm(`Remove ${r.name}?`, `They leave ${d.name}.`, 'Remove').then((y) => { if (y) removeMember(cl(), d.id, r.user_id).then(load, fail); }) : undefined} />
          ))}
        </Section>

        <Section header="Shared flashcard sets" footer={d.can_share ? undefined : 'Only the class admin shares sets in a class.'}>
          {d.sets.length ? d.sets.map((s) => <Row key={s.id} icon="cards" iconColor={c.indigo} title={s.title} subtitle={`${s.count} cards${s.added_name ? ` · from ${s.added_name}` : ''}`} onPress={() => setActions(s)} />)
            : <Row title={d.can_share ? 'No sets yet' : 'No sets shared yet'} accessory="none" />}
          {d.can_share ? <Row icon="plus" iconColor={c.tint} title="Share a Set" onPress={share} /> : null}
        </Section>

        {d.is_owner ? (
          <>
            <Section header="Class settings">
              <Field value={edit.name} onChangeText={(v) => setEdit({ ...edit, name: v })} maxLength={60} placeholder="Name" />
              <View style={{ padding: 12 }}><Segmented options={[['class', 'Class'], ['group', 'Study group']]} value={edit.kind} onChange={(k) => setEdit({ ...edit, kind: k })} /></View>
              <Row title="Leaderboard topic" value={topicLabel(edit.topic || null)}
                onPress={() => menu('Topic', [{ title: 'All subjects', onPress: () => setEdit({ ...edit, topic: '' }) }, ...classTopics().map(([tid, label]: string[]) => ({ title: label, onPress: () => setEdit({ ...edit, topic: tid }) }))])} />
            </Section>
            <View style={{ paddingHorizontal: 16, marginTop: 10, gap: 10 }}>
              <Button title="Save" onPress={() => updateClass(cl(), d.id, edit.name.trim(), edit.kind, edit.topic).then(() => { Alert.alert('Saved'); load(); }, fail)} disabled={!edit.name.trim()} />
              <Button title="Delete" kind="destructive" onPress={() => confirm(`Delete ${d.name}?`, "Its leaderboard and shared sets go away for everyone. This can't be undone.", 'Delete').then((y) => { if (y) deleteClass(cl(), d.id).then(() => router.back(), fail); })} />
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Button title={`Leave ${d.kind === 'group' ? 'Group' : 'Class'}`} kind="destructive" onPress={() => confirm(`Leave ${d.name}?`, 'You can join again with the code.', 'Leave').then((y) => { if (y) leaveClass(cl(), d.id).then(() => router.back(), fail); })} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
