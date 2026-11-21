// Learn mode, same rules as the website: multiple choice first, then typed answers, until every term is mastered.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text, TextInput } from '../../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../../components/ModalBar';
import { Button, buzz, Icon, menu, tap } from '../../../components/ui';
import { getSet, lvl, norm, progress, shuffle, touch, writtenOk } from '../../../lib/cards';
import { newSeed, rng, store } from '../../../lib/shared';
import { type, useColors } from '../../../lib/theme';
import { useStore } from '../../../lib/store-hooks';

export default function Learn() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSet(id)!;
  const p = progress(s.id);
  const [withTerm, setWithTerm] = useState(false);
  const [round, setRound] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [answer, setAnswer] = useState<{ ok: boolean; pick?: number; typed?: string } | null>(null);
  const [typed, setTyped] = useState('');
  const [, force] = useState(0);

  const mastered = s.cards.filter((_, i) => lvl(p, i) >= 2).length;
  const promptOf = (i: number) => (withTerm ? s.cards[i].d : s.cards[i].t);
  const answerOf = (i: number) => (withTerm ? s.cards[i].t : s.cards[i].d);

  const newRound = () => {
    const pool = shuffle(s.cards.map((_, i) => i).filter((i) => lvl(p, i) < 2));
    pool.sort((a, b) => lvl(p, b) - lvl(p, a)); // finish nearly-learned terms first
    setRound(pool.slice(0, 7)); setPos(0); setResults([]); setAnswer(null); setTyped('');
  };
  useEffect(newRound, []); // eslint-disable-line react-hooks/exhaustive-deps

  const i = round[pos];
  const written = i != null && lvl(p, i) >= 1;
  const opts = useMemo(() => {
    if (i == null || written) return [];
    const others = shuffle(s.cards.map((_, j) => j).filter((j) => j !== i && norm(answerOf(j)) !== norm(answerOf(i)))).slice(0, 3);
    return shuffle([i, ...others]);
  }, [i, written, withTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const grade = (ok: boolean, extra: { pick?: number; typed?: string }) => {
    if (answer) return;
    p.mastery[i] = ok ? Math.min(2, lvl(p, i) + 1) : 0;
    p.studied = (p.studied || 0) + 1;
    touch(s.id);
    buzz(ok);
    setResults((r) => [...r, ok]);
    if (!ok) setRound((r) => [...r, i]); // see it again this round
    setAnswer({ ok, ...extra });
  };
  const advance = () => { setPos(pos + 1); setAnswer(null); setTyped(''); };
  const override = () => { p.mastery[i] = 2; store.save(); setRound((r) => r.slice(0, -1)); setResults((r) => [...r.slice(0, -1), true]); advance(); };

  let body;
  if (mastered === s.cards.length) {
    body = (
      <View style={{ gap: 12, paddingTop: 50 }}>
        <View style={{ alignSelf: 'center' }}><Icon name="trophy" size={60} color={c.yellow} /></View>
        <Text style={[type.title1, { color: c.label, textAlign: 'center' }]}>Every term mastered</Text>
        <Text style={[type.body, { color: c.label2, textAlign: 'center', marginBottom: 12 }]}>Keep them fresh with a practice test or a round of Match.</Text>
        <Button title="Take a test" onPress={() => router.replace(`/test/${encodeURIComponent(s.id)}`)} />
        <Button title="Start over" kind="tinted" onPress={() => { p.mastery = {}; store.save(); newRound(); force((n) => n + 1); }} />
      </View>
    );
  } else if (i == null) {
    const right = results.filter(Boolean).length;
    body = (
      <View style={{ gap: 12, paddingTop: 50 }}>
        <View style={{ alignSelf: 'center' }}><Icon name="checkCircle" size={56} color={c.tint} /></View>
        <Text style={[type.title1, { color: c.label, textAlign: 'center' }]}>Round complete</Text>
        <Text style={[type.body, { color: c.label2, textAlign: 'center', marginBottom: 12 }]}>{right} of {results.length} right this round. {mastered} of {s.cards.length} terms mastered.</Text>
        <Button title="Continue" onPress={newRound} />
      </View>
    );
  } else {
    body = (
      <View style={{ gap: 16 }}>
        <Text style={[type.footnote, { color: written ? c.orange : c.tint, fontWeight: '600', textTransform: 'uppercase' }]}>{written ? 'Type the answer' : 'Choose the answer'}</Text>
        <Text style={{ fontSize: 26, lineHeight: 33, fontWeight: '600', color: c.label }}>{promptOf(i)}</Text>
        {!written ? (
          <View style={{ gap: 10, marginTop: 6 }}>
            {opts.map((j) => {
              const st = answer ? (j === i ? 'right' : j === answer.pick ? 'wrong' : 'dim') : '';
              return (
                <Pressable key={j} disabled={!!answer} accessibilityRole="button" onPress={() => { tap(); grade(j === i, { pick: j }); }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 2,
                    borderColor: st === 'right' ? c.green : st === 'wrong' ? c.red : 'transparent',
                    backgroundColor: st === 'right' ? c.goodSoft : st === 'wrong' ? c.badSoft : c.card, opacity: st === 'dim' ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                  <Text style={[type.body, { flex: 1, color: c.label }]}>{answerOf(j)}</Text>
                  {st === 'right' ? <Icon name="checkCircle" size={22} color={c.green} /> : st === 'wrong' ? <Icon name="xmarkCircle" size={22} color={c.red} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <TextInput value={typed} onChangeText={setTyped} editable={!answer} autoFocus autoCapitalize="none" autoCorrect={false} placeholder="Your answer" placeholderTextColor={c.label3}
              onSubmitEditing={() => typed.trim() && grade(writtenOk(typed, answerOf(i)), { typed })} returnKeyType="done"
              style={[type.title3, { fontWeight: '400', color: c.label, backgroundColor: c.card, borderRadius: 14, padding: 16 }]} />
            {!answer ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Check" disabled={!typed.trim()} style={{ flex: 1 }} onPress={() => grade(writtenOk(typed, answerOf(i)), { typed })} />
                <Button title="Don't know" kind="gray" onPress={() => grade(false, { typed: '' })} />
              </View>
            ) : null}
          </View>
        )}
        {answer ? (
          <View style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: answer.ok ? c.goodSoft : c.badSoft }}>
            <Text style={[type.title3, { color: answer.ok ? c.green : c.red }]}>{answer.ok ? rng(newSeed()).pick(['Nice!', 'Great job!', 'Correct!', "You've got it!"]) : 'Not quite'}</Text>
            {!answer.ok ? <Text style={[type.body, { color: c.label }]}>Answer: <Text style={{ fontWeight: '600' }}>{answerOf(i)}</Text></Text> : null}
            {!answer.ok && answer.typed ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[type.subhead, { color: c.label2, flex: 1 }]}>You wrote: {answer.typed}</Text>
                <Button title="I was right" kind="plain" size="small" onPress={override} />
              </View>
            ) : null}
            <Button title="Continue" onPress={advance} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title="Learn" progress={mastered / s.cards.length}
        right={<Pressable hitSlop={10} accessibilityLabel="Options" onPress={() => menu('Learn', [{ title: withTerm ? 'Answer with Definition' : 'Answer with Term', onPress: () => { setWithTerm(!withTerm); setAnswer(null); setTyped(''); } }])}><Icon name="more" size={24} color={c.tint} /></Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Text style={[type.footnote, { color: c.label2, marginBottom: 14 }]}>{mastered} of {s.cards.length} mastered</Text>
        {body}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
