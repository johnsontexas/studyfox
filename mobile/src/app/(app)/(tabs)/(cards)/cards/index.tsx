import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { Text, TextInput } from '../../../../../components/AppText';
import { Bar, Button, Empty, IconButton, menu, Row, Screen, SearchField, Section } from '../../../../../components/ui';
import { masteredCount, norm, progress, type SetT } from '../../../../../lib/cards';
import { BUILTIN_DECKS, store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';

export default function Cards() {
  useStore();
  const c = useColors();
  const [q, setQ] = useState('');
  const hit = (s: SetT) => !q || norm(`${s.title} ${s.desc || ''} ${s.tag || ''}`).includes(norm(q));
  const mine: SetT[] = store.sets().filter(hit);
  const built: SetT[] = BUILTIN_DECKS.filter(hit);
  const add = () => menu(undefined, [
    { title: 'New set', onPress: () => router.push('/edit-set') },
    { title: 'Import a shared link', onPress: () => router.push('/import-set') },
  ]);

  const row = (s: SetT) => {
    const m = masteredCount(s);
    const star = progress(s.id).starred.length;
    return (
      <Row key={s.id} title={s.title} onPress={() => router.push(`/cards/${encodeURIComponent(s.id)}`)}
        subtitle={
          <View style={{ gap: 6, marginTop: 2 }}>
            <Text style={[type.subhead, { color: c.label2 }]}>{s.cards.length} terms{s.tag ? ` · ${s.tag}` : ''}{star ? ` · ${star} starred` : ''}</Text>
            {m ? <Bar value={m / s.cards.length} color={c.good} /> : null}
          </View>
        } />
    );
  };

  return (
    <>
      <Screen header={{ title: 'Your', accent: 'flashcards', subtitle: 'Flip, swipe, learn, test, and match.', right: <IconButton name="plus" label="New set" filled onPress={add} /> }}>
        <SearchField value={q} onChangeText={setQ} placeholder="Search sets" />
        {mine.length ? (
          <Section header="My sets">{mine.map(row)}</Section>
        ) : !q ? (
          <Empty icon="cards" title="Make your first set" body="Type terms and definitions, or paste a list from your notes and StudyFox splits it into cards.">
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Button title="New set" icon="plus" size="medium" onPress={() => router.push('/edit-set')} />
              <Button title="Import link" icon="link" kind="tinted" size="medium" onPress={() => router.push('/import-set')} />
            </View>
          </Empty>
        ) : null}
        {built.length ? <Section header="Free study sets" footer="Make an editable copy of any free set from its page.">{built.map(row)}</Section> : null}
        {q && !mine.length && !built.length ? <Empty icon="search" title="No results" body={`No sets match "${q}".`} /> : null}
      </Screen>
    </>
  );
}
