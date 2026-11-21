// Full practice test runner: timed modules, adaptive SAT Module 2, mark for review, answer eliminator,
// a question map, the Check Your Work page, and breaks. Mirrors the website's js/views/runner.js and
// saves the finished test in the same attempt shape, so scores show on studyfox.org too.
import { router } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Alert, AppState, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { Text, TextInput } from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import { Button, confirm, Empty, Icon, menu, tap } from '../../components/ui';
import { currentRun, DIRECTIONS, discardInProgress, finishExam, lastModuleIndex, nextModule, persist, type Run } from '../../lib/exams';
import type { Q } from '../../lib/questions';
import { bankNo, fmtTime } from '../../lib/shared';
import { useStore } from '../../lib/store-hooks';
import { type, useColors } from '../../lib/theme';

const answered = (a: unknown) => a != null && a !== '';

export default function Exam() {
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const [r] = useState<Run | null>(() => currentRun());
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const [view, setView] = useState<'q' | 'review'>('q');
  const [navOpen, setNavOpen] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const lastSave = useRef(0);

  const m: any = r?.modules[r.current];
  const isBreak = !!m && 'break' in m;

  // One clock for module time and break time. Saves every few seconds so nothing is lost if the app closes.
  useEffect(() => {
    if (!r) return;
    const id = setInterval(() => {
      const cur: any = r.modules[r.current];
      if (!cur) return;
      if (cur.break) {
        cur.left = Math.max(0, (cur.left ?? cur.break * 60) - 1);
        if (cur.left === 0) { nextModule(r); setView('q'); }
      } else if (!cur.done) {
        cur.timeLeft--;
        if (cur.timeLeft === 300) Alert.alert('5 minutes left', `5 minutes remain in ${cur.name}.`);
        if (cur.timeLeft <= 0) { cur.timeLeft = 0; finishModule(true); return; }
      }
      if (Date.now() - lastSave.current > 5000) { lastSave.current = Date.now(); persist(); }
      redraw();
    }, 1000);
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') persist(); });
    return () => { clearInterval(id); sub.remove(); persist(); };
  }, [r]);

  if (!r || !m) {
    return <View style={{ flex: 1, backgroundColor: c.bg }}><ModalBar /><Empty icon="test2" title="No test in progress" body="Start one from Practice Tests." /></View>;
  }

  function finishModule(timeUp = false) {
    const cur: any = r!.modules[r!.current];
    cur.done = true;
    if (r!.current >= lastModuleIndex(r!)) {
      const id = finishExam(r!);
      router.replace(`/results/${id}`);
      return;
    }
    nextModule(r!);
    setView('q'); setNavOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
    const nm: any = r!.modules[r!.current];
    if (timeUp) Alert.alert("Time's up", nm.break ? 'Take a break before the next section.' : `Starting ${nm.name}.`);
    redraw();
  }

  const leave = () => menu(undefined, [
    { title: 'Save and Exit', onPress: () => { persist(); router.back(); } },
    { title: 'End Test and See Results', onPress: async () => { if (await confirm('End the test now?', 'Unanswered questions count as wrong.', 'End Test')) { const id = finishExam(r); router.replace(`/results/${id}`); } } },
    { title: 'Discard Test', destructive: true, onPress: async () => { if (await confirm('Discard this test?', "Your answers won't be saved or scored.", 'Discard')) { discardInProgress(); router.back(); } } },
  ]);

  // ---- Break ----
  if (isBreak) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title="Break" onClose={leave} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
          <Text style={[type.subhead, { color: c.label2 }]}>Remaining break time</Text>
          <Text style={[type.largeTitle, { fontSize: 64, lineHeight: 72, color: c.label, fontVariant: ['tabular-nums'] }]}>{fmtTime(m.left ?? m.break * 60)}</Text>
          <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>On test day you'd have {m.break} minutes. Stretch, drink some water, and stay off your notes.</Text>
          <Button title="Resume Testing" onPress={() => { nextModule(r); setView('q'); redraw(); }} />
        </View>
      </View>
    );
  }

  const qs: Q[] = m.questions || [];
  const n = qs.length;
  const timeLeft: number = m.timeLeft ?? 0;
  const timerText = hideTimer ? '' : fmtTime(timeLeft);
  const right = (
    <Pressable accessibilityRole="button" accessibilityLabel={hideTimer ? 'Show timer' : 'Hide timer'} onPress={() => setHideTimer(!hideTimer)} hitSlop={8}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {hideTimer ? <Icon name="eye" size={17} color={c.label2} /> : <Text style={[type.headline, { color: timeLeft <= 300 ? c.red : c.label, fontVariant: ['tabular-nums'] }]}>{timerText}</Text>}
    </Pressable>
  );
  const go = (i: number) => { r.qi = i; setView('q'); setNavOpen(false); scroll.current?.scrollTo({ y: 0, animated: false }); redraw(); };
  const isLast = r.current === lastModuleIndex(r);

  // ---- Question map (shared by the sheet and the Check Your Work page) ----
  const grid = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {qs.map((_, i) => {
        const a = answered(m.answers[i]), mk = m.marked.includes(i), cur = i === r.qi && view === 'q';
        return (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Question ${i + 1}${a ? '' : ', unanswered'}${mk ? ', marked for review' : ''}`} onPress={() => go(i)}
            style={{ width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: cur ? 2 : 1, borderStyle: a ? 'solid' : 'dashed', borderColor: cur ? c.tint : c.line, backgroundColor: a ? c.tintSoft : 'transparent' }}>
            <Text style={[type.subhead, { fontWeight: '700', color: a ? c.tint : c.label2 }]}>{i + 1}</Text>
            {mk ? <View style={{ position: 'absolute', top: -5, right: -4 }}><Icon name="bookmarkFill" size={13} color={c.red} /></View> : null}
          </Pressable>
        );
      })}
    </View>
  );

  // ---- Check Your Work ----
  if (view === 'review') {
    const un = qs.filter((_, i) => !answered(m.answers[i])).length;
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ModalBar title={m.name} right={right} onClose={leave} />
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <Text style={[type.title2, { color: c.label }]}>Check Your Work</Text>
          <Text style={[type.body, { color: c.label2 }]}>On test day you can't move on until time runs out. Here you can tap {isLast ? 'Submit' : 'Next Module'} when you're ready.</Text>
          {un ? <Text style={[type.headline, { color: c.red }]}>You have {un} unanswered question{un > 1 ? 's' : ''}.</Text> : null}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={[type.footnote, { color: c.label2 }]}>Dashed: unanswered</Text>
            <Text style={[type.footnote, { color: c.label2 }]}>Bookmark: for review</Text>
          </View>
          {grid}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: ins.bottom + 10 }}>
          <Button title="Back" kind="gray" style={{ flex: 1 }} onPress={() => go(n - 1)} />
          <Button title={isLast ? 'Submit' : 'Next Module'} style={{ flex: 1 }} onPress={async () => { if (!un || (await confirm(isLast ? 'Submit the test?' : 'Go to the next module?', `${un} question${un > 1 ? 's are' : ' is'} unanswered. You can't come back to this ${r.test === 'SAT' ? 'module' : 'section'}.`, isLast ? 'Submit' : 'Next Module'))) finishModule(); }} />
        </View>
      </View>
    );
  }

  // ---- Question ----
  const q = qs[r.qi];
  const chosen = m.answers[r.qi];
  const marked = m.marked.includes(r.qi);
  const setAnswer = (a: number | string | null) => {
    m.answers[r.qi] = typeof a === 'number' && m.answers[r.qi] === a ? null : a;
    if (typeof a === 'number' && m.elim[r.qi]) m.elim[r.qi] = m.elim[r.qi].filter((x: number) => x !== a);
    redraw();
  };
  const strike = (i: number) => {
    const el: number[] = (m.elim[r.qi] ||= []);
    if (el.includes(i)) m.elim[r.qi] = el.filter((x) => x !== i);
    else { el.push(i); if (m.answers[r.qi] === i) m.answers[r.qi] = null; }
    redraw();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={m.name} right={right} onClose={leave} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: marked }} onPress={() => { tap(); if (marked) m.marked.splice(m.marked.indexOf(r.qi), 1); else m.marked.push(r.qi); redraw(); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: marked ? c.badSoft : c.fill }}>
          <Icon name={marked ? 'bookmarkFill' : 'bookmark'} size={14} color={marked ? c.red : c.label2} />
          <Text style={[type.footnote, { fontWeight: '600', color: marked ? c.red : c.label2 }]}>{marked ? 'Marked' : 'Mark for Review'}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        {q.section === 'math' ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Calculator" onPress={() => router.push('/calculator')} hitSlop={6} style={{ padding: 6 }}>
            <Icon name="calculator" size={19} color={c.label2} />
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Directions" onPress={() => Alert.alert('Directions', DIRECTIONS[q.section] || DIRECTIONS.rw)} hitSlop={6} style={{ padding: 6 }}>
          <Icon name="doc" size={19} color={c.label2} />
        </Pressable>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <QuestionView q={q} chosen={chosen} onChoose={setAnswer} bankNo={bankNo(q.id)} showMeta={false} struck={m.elim[r.qi] || []} onStrike={strike} />
        {q.type === 'mc' ? <Text style={[type.caption, { color: c.label3, marginTop: 12, textAlign: 'center' }]}>Press and hold a choice to cross it out.</Text> : (
          <TextInput value={typeof chosen === 'string' ? chosen : ''} onChangeText={(v) => setAnswer(v.replace(/[^0-9./-]/g, '').slice(0, 6))} placeholder="Your answer" placeholderTextColor={c.label3}
            keyboardType="numbers-and-punctuation" autoCorrect={false} returnKeyType="done"
            style={[type.title3, { marginTop: 14, color: c.label, backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, height: 52 }]} />
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: ins.bottom + 10 }}>
        <Button title="Back" kind="gray" size="medium" disabled={r.qi === 0} onPress={() => go(r.qi - 1)} />
        <Pressable accessibilityRole="button" accessibilityLabel="Question map" onPress={() => setNavOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 }}>
          <Text style={[type.headline, { color: c.label }]}>{r.qi + 1} of {n}</Text>
          <Icon name="down" size={13} color={c.label2} weight="semibold" />
        </Pressable>
        <Button title="Next" size="medium" onPress={() => (r.qi < n - 1 ? go(r.qi + 1) : (setView('review'), persist()))} />
      </View>

      <Modal visible={navOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setNavOpen(false)}>
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <Text style={[type.headline, { color: c.label }]}>{m.name}</Text>
            <Button title="Done" kind="plain" size="small" onPress={() => setNavOpen(false)} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
            {grid}
            <Button title="Go to Review Page" kind="tinted" onPress={() => { setNavOpen(false); setView('review'); }} />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
