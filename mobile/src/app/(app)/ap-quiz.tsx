// AP practice set: tap an answer, see the explanation, move on. Results are saved where the
// website's AP bank keeps them (store.data().ap), so progress matches on studyfox.org.
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View, type ScrollViewInstance } from 'react-native';
import { Text } from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import { Button, buzz, Card, Empty, Icon, Stat } from '../../components/ui';
import { apQ, takeAPSession, type APRow } from '../../lib/ap';
import { recordAP, store } from '../../lib/shared';
import { useStore } from '../../lib/store-hooks';
import { type, useColors } from '../../lib/theme';

export default function APQuiz() {
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const [session, setS] = useState(() => takeAPSession());
  const qs = useMemo(() => (session?.rows || []).map(apQ), [session]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [done, setDone] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  if (!session || !qs.length) return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar /><Empty icon="search" title="No questions" body="Pick a unit to practice." /></View>;
  const q = qs[i];
  const revealed = i in answers;
  const right = (k: number) => answers[k] === qs[k].answer;

  const check = (a: number | null) => {
    if (revealed) return;
    if (a != null) { const ok = a === q.answer; recordAP(session.cid, q.ap, ok); store.save(); buzz(ok); }
    setAnswers({ ...answers, [i]: a });
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120);
  };
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); scroll.current?.scrollTo({ y: 0, animated: false }); }
    else setDone(true);
  };

  if (done) {
    const n = qs.filter((_, k) => right(k)).length;
    const missed = qs.map((qq, k) => (answers[k] != null && !right(k) ? qq.ap : null)).filter((r): r is APRow => !!r);
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title={session.title} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 24, gap: 14 }}>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <Icon name={n === qs.length ? 'trophy' : 'checkCircle'} size={60} color={n === qs.length ? c.yellow : c.tint} />
            <Text style={[type.title1, { color: c.label }]}>{n === qs.length ? 'Perfect score' : n >= qs.length * 0.7 ? 'Nice work' : 'Set complete'}</Text>
            <Text style={[type.subhead, { color: c.label2 }]}>{session.title}</Text>
          </View>
          <Card style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <Stat value={`${n}/${qs.length}`} label="correct" />
            <Stat value={`${Math.round((100 * n) / qs.length)}%`} label="accuracy" />
            <Stat value={store.streak()} label="day streak" color={c.orange} />
          </Card>
          {missed.length ? <Button title={`Retry ${missed.length} Missed`} icon="target"
            onPress={() => { setS({ ...session, title: `Retry: ${session.title}`, rows: missed }); setI(0); setAnswers({}); setDone(false); }} /> : null}
          <Button title="Done" kind={missed.length ? 'tinted' : 'filled'} onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={`${i + 1} of ${qs.length}`} progress={(i + (revealed ? 1 : 0)) / qs.length} />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <QuestionView q={q} chosen={answers[i]} reveal={revealed} onChoose={check} />
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: ins.bottom + 10, backgroundColor: c.bg }}>
        {revealed ? <Button title={i + 1 < qs.length ? 'Next Question' : 'See Results'} onPress={next} /> : <Button title="Skip" kind="gray" onPress={() => check(null)} />}
      </View>
    </View>
  );
}
