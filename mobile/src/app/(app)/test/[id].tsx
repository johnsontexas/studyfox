// Practice test from a flashcard set: true/false, multiple choice, and written (same mix as the website).
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { Text, TextInput } from '../../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../../components/ModalBar';
import { Button, buzz, Card, Icon, Section, Segmented, SwitchRow, tap } from '../../../components/ui';
import { getSet, norm, progress, shuffle, touch } from '../../../lib/cards';
import { type, useColors } from '../../../lib/theme';
import { useStore } from '../../../lib/store-hooks';

type TQ = { type: 'tf' | 'mc' | 'wr'; i: number; prompt: string; shown?: string; opts?: string[]; correct: boolean | number | string };

export default function Test() {
  // Re-read progress when a sync from the website lands, so writes go to the current copy.
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSet(id)!;
  const [cfg, setCfg] = useState({ n: Math.min(10, s.cards.length), tf: true, mc: true, wr: true, withTerm: false });
  const [qs, setQs] = useState<TQ[] | null>(null);
  const [ans, setAns] = useState<Record<number, any>>({});
  const [graded, setGraded] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  const build = () => {
    const types = (['tf', 'mc', 'wr'] as const).filter((t) => cfg[t]);
    const ansOf = (i: number) => (cfg.withTerm ? s.cards[i].t : s.cards[i].d);
    const prm = (i: number) => (cfg.withTerm ? s.cards[i].d : s.cards[i].t);
    const list: TQ[] = shuffle(s.cards.map((_, i) => i)).slice(0, cfg.n).map((i, k) => {
      const t = types[k % types.length];
      if (t === 'tf') {
        const truth = Math.random() < 0.5;
        const shown = truth ? i : shuffle(s.cards.map((_, j) => j).filter((j) => j !== i))[0];
        return { type: t, i, prompt: prm(i), shown: ansOf(shown), correct: truth };
      }
      if (t === 'mc') {
        const o = shuffle([i, ...shuffle(s.cards.map((_, j) => j).filter((j) => j !== i && ansOf(j) !== ansOf(i))).slice(0, 3)]);
        return { type: t, i, prompt: prm(i), opts: o.map(ansOf), correct: o.indexOf(i) };
      }
      return { type: t, i, prompt: prm(i), correct: ansOf(i) };
    });
    setQs(shuffle(list).sort((a, b) => ['tf', 'mc', 'wr'].indexOf(a.type) - ['tf', 'mc', 'wr'].indexOf(b.type)));
    setAns({}); setGraded(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const okAt = (q: TQ, k: number) => (q.type === 'wr' ? norm(ans[k] || '') === norm(String(q.correct)) : ans[k] === q.correct);
  const submit = () => {
    const p = progress(s.id);
    qs!.forEach((q, k) => { if (!okAt(q, k)) p.mastery[q.i] = 0; });
    touch(s.id);
    setGraded(true);
    buzz(qs!.every(okAt));
    scroll.current?.scrollTo({ y: 0, animated: true });
  };
  const right = qs ? qs.filter(okAt).length : 0;
  const counts = [5, 10, 20, s.cards.length].filter((n, k, a) => n <= s.cards.length && a.indexOf(n) === k);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={qs ? 'Test' : 'New Test'} right={qs && !graded ? <Button title="Options" kind="plain" size="small" onPress={() => setQs(null)} /> : undefined} />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: ins.bottom + 30 }} keyboardShouldPersistTaps="handled">
        {!qs ? (
          <>
            <Section header="Questions">
              <View style={{ padding: 12 }}>
                <Segmented options={counts.map((n) => [n, n === s.cards.length ? `All ${n}` : String(n)] as [number, string])} value={cfg.n} onChange={(n) => setCfg({ ...cfg, n })} />
              </View>
            </Section>
            <Section header="Question types">
              <SwitchRow title="True or false" value={cfg.tf} onChange={(tf) => setCfg({ ...cfg, tf })} />
              <SwitchRow title="Multiple choice" value={cfg.mc} onChange={(mc) => setCfg({ ...cfg, mc })} />
              <SwitchRow title="Written" value={cfg.wr} onChange={(wr) => setCfg({ ...cfg, wr })} />
            </Section>
            <Section footer="Answer with the term instead of the definition.">
              <SwitchRow title="Answer with term" value={cfg.withTerm} onChange={(withTerm) => setCfg({ ...cfg, withTerm })} />
            </Section>
            <View style={{ padding: 16, marginTop: 8 }}><Button title="Start Test" disabled={!cfg.tf && !cfg.mc && !cfg.wr} onPress={build} /></View>
          </>
        ) : (
          <View style={{ padding: 16, gap: 14 }}>
            {graded ? (
              <Card style={{ alignItems: 'center', gap: 4, paddingVertical: 22 }}>
                <Text style={{ fontSize: 56, fontWeight: '700', color: c.label, fontVariant: ['tabular-nums'] }}>{Math.round((100 * right) / qs.length)}%</Text>
                <Text style={[type.subhead, { color: c.label2 }]}>{right} of {qs.length} correct</Text>
                <Button title="New Test" size="medium" style={{ marginTop: 12, alignSelf: 'stretch' }} onPress={build} />
              </Card>
            ) : null}
            {qs.map((q, k) => {
              const ok = graded && okAt(q, k);
              return (
                <Card key={k} style={{ gap: 12, borderWidth: graded ? 2 : 0, borderColor: ok ? c.green : c.red }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[type.footnote, { color: c.label2 }]}>{k + 1} of {qs.length} · {q.type === 'tf' ? 'True or false' : q.type === 'mc' ? 'Multiple choice' : 'Written'}</Text>
                    {graded ? <Icon name={ok ? 'checkCircle' : 'xmarkCircle'} size={20} color={ok ? c.green : c.red} /> : null}
                  </View>
                  <Text style={[type.title3, { color: c.label }]}>{q.prompt}</Text>
                  {q.type === 'tf' ? (
                    <>
                      <Text style={[type.body, { color: c.label2, paddingLeft: 12, borderLeftWidth: 3, borderColor: c.sep }]}>{q.shown}</Text>
                      <View style={{ flexDirection: 'row', gap: 10 }}>{[true, false].map((v) => <Opt key={String(v)} label={v ? 'True' : 'False'} on={ans[k] === v} disabled={graded} onPress={() => setAns({ ...ans, [k]: v })} grow />)}</View>
                    </>
                  ) : null}
                  {q.type === 'mc' ? <View style={{ gap: 8 }}>{q.opts!.map((o, j) => <Opt key={j} label={o} on={ans[k] === j} disabled={graded} onPress={() => setAns({ ...ans, [k]: j })} />)}</View> : null}
                  {q.type === 'wr' ? (
                    <TextInput value={ans[k] || ''} onChangeText={(v) => setAns({ ...ans, [k]: v })} editable={!graded} autoCapitalize="none" autoCorrect={false} placeholder="Your answer" placeholderTextColor={c.label3}
                      style={[type.body, { color: c.label, backgroundColor: c.fill, borderRadius: 12, padding: 12 }]} />
                  ) : null}
                  {graded && !ok ? (
                    <Text style={[type.subhead, { color: c.label }]}>Answer: <Text style={{ fontWeight: '600' }}>{q.type === 'tf' ? (q.correct ? 'True' : `False (it's "${s.cards[q.i][cfg.withTerm ? 't' : 'd']}")`) : q.type === 'mc' ? q.opts![q.correct as number] : String(q.correct)}</Text></Text>
                  ) : null}
                </Card>
              );
            })}
            {!graded ? <Button title="Submit" onPress={submit} /> : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Opt({ label, on, onPress, disabled, grow }: { label: string; on: boolean; onPress: () => void; disabled?: boolean; grow?: boolean }) {
  const c = useColors();
  return (
    <Pressable disabled={disabled} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => { tap(); onPress(); }}
      style={{ flex: grow ? 1 : undefined, padding: 13, borderRadius: 12, backgroundColor: on ? c.tint : c.fill }}>
      <Text style={[type.body, { color: on ? c.onTint : c.label, textAlign: grow ? 'center' : 'left', fontWeight: on ? '600' : '400' }]}>{label}</Text>
    </Pressable>
  );
}

