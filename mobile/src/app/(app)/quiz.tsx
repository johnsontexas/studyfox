// Practice set: tap an answer to check it right away, read the explanation, move on.
// Answers count toward the same stats, mistake log, and numbered bank as the website.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import { Button, buzz, Card, Empty, Icon, Stat } from '../../components/ui';
import { isRight, saveAttempt, setSession, takeSession, type Session } from '../../lib/questions';
import { bankNo, store } from '../../lib/shared';
import { type, useColors } from '../../lib/theme';
import { useStore } from '../../lib/store-hooks';

export default function Quiz() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const [session, setS] = useState<Session | null>(() => takeSession());
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string | null>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const scroll = useRef<ScrollView>(null);

  if (!session || !session.questions.length) {
    return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar /><Empty icon="search" title="No questions" body="Nothing matched. Try a different section." /></View>;
  }
  const qs = session.questions;
  const q = qs[i];
  const revealed = !!shown[i];

  const check = (a: number | string | null) => {
    if (revealed) return;
    const ok = isRight(q, a);
    if (a != null && a !== '') { store.recordAnswer(q, ok); store.save(); buzz(ok); }
    setAnswers({ ...answers, [i]: a });
    setShown({ ...shown, [i]: true });
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120);
  };
  const next = () => {
    setTyped('');
    if (i + 1 < qs.length) { setI(i + 1); scroll.current?.scrollTo({ y: 0, animated: false }); }
    else { saveAttempt(session, answers, started.current); setDone(true); }
  };

  if (done) {
    const right = qs.filter((qq, k) => isRight(qq, answers[k])).length;
    const missed = qs.filter((qq, k) => answers[k] != null && answers[k] !== '' && !isRight(qq, answers[k]));
    const great = right === qs.length;
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title={session.title} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 24, gap: 14 }}>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Icon name={great ? 'trophy' : 'checkCircle'} size={60} color={great ? c.yellow : c.tint} />
            <Text style={[type.title1, { color: c.label }]}>{great ? 'Perfect score' : right >= qs.length * 0.7 ? 'Nice work' : 'Set complete'}</Text>
          </View>
          <Card style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <Stat value={`${right}/${qs.length}`} label="correct" />
            <Stat value={`${Math.round((100 * right) / qs.length)}%`} label="accuracy" />
            <Stat value={store.streak()} label="day streak" color={c.orange} />
          </Card>
          {missed.length ? <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>{missed.length} missed question{missed.length === 1 ? ' was' : 's were'} saved to your mistakes.</Text> : null}
          {missed.length ? <Button title={`Retry ${missed.length} Missed`} icon="target"
            onPress={() => { const s = { ...session, title: `Retry: ${session.title}`, questions: missed }; setSession(s); setS(s); setI(0); setAnswers({}); setShown({}); setDone(false); started.current = Date.now(); }} /> : null}
          <Button title="Done" kind={missed.length ? 'tinted' : 'filled'} onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={`${i + 1} of ${qs.length}`} progress={(i + (revealed ? 1 : 0)) / qs.length} />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <QuestionView q={q} chosen={answers[i]} reveal={revealed} onChoose={check} bankNo={bankNo(q.id)} />
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: ins.bottom + 10, backgroundColor: c.bg }}>
        {revealed ? (
          <Button title={i + 1 < qs.length ? 'Next Question' : 'See Results'} onPress={next} />
        ) : q.type === 'spr' ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput value={typed} onChangeText={setTyped} placeholder="Your answer" placeholderTextColor={c.label3} keyboardType="numbers-and-punctuation" autoCorrect={false}
              onSubmitEditing={() => typed.trim() && check(typed.trim())} returnKeyType="done"
              style={[type.title3, { flex: 1, color: c.label, backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, height: 52 }]} />
            <Button title="Check" disabled={!typed.trim()} onPress={() => check(typed.trim())} />
          </View>
        ) : (
          <Button title="Skip" kind="gray" onPress={() => check(null)} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
