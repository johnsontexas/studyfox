import { ClassesBar } from '../../../../../components/StudyPicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { Text } from '../../../../../components/AppText';
import APList, { rushAP, useAPCounts } from '../../../../../components/APList';
import { myStudying } from '../../../../../components/StudyPicker';
import { Bar, cardStyle, Icon, Row, Screen, Section, Segmented, tap } from '../../../../../components/ui';
import { mistakes, quickSet, setSession, skillSet, type Q } from '../../../../../lib/questions';
import { bank, getCourse, SECTIONS, store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { fonts, type, useColors } from '../../../../../lib/theme';
import type { Test } from '../../../../../lib/types';

type Kind = Test | 'AP';

const SEC: Record<string, [string, keyof ReturnType<typeof useColors>]> = { rw: ['book', 'blue'], math: ['integral', 'green'], english: ['pen', 'purple'], reading: ['scroll', 'indigo'], science: ['flask', 'teal'] };

export default function Practice() {
  useStore();
  const c = useColors();
  const d = store.data();
  const focus: Test = d.settings.focus || 'SAT';
  // Practice is split three ways. SAT and ACT also set the main test (settings.focus), like the website.
  const tab: Kind = d.settings.practiceTab === 'AP' ? 'AP' : focus;
  const setTab = (t: Kind) => { if (t === 'AP') d.settings.practiceTab = 'AP'; else { d.settings.practiceTab = t; d.settings.focus = t; } store.save(); };
  const ap = useAPCounts();
  const [count, setCount] = useState(5);
  const secs = SECTIONS[focus];
  const all = bank(focus);
  const done = d.bank as Record<string, { c: number }>;
  const miss = mistakes(focus).length;
  const weak = Object.entries(d.skillStats as Record<string, { c: number; t: number }>)
    .filter(([k, s]) => k.startsWith(focus + '|') && s.t >= 3)
    .map(([k, s]) => ({ sec: k.split('|')[1], skill: k.split('|')[2], p: Math.round((100 * s.c) / s.t), t: s.t }))
    .sort((a, b) => a.p - b.p).slice(0, 3);
  const go = (title: string, section: string, questions: Q[]) => { setSession({ title, test: focus, section, questions }); router.push('/quiz'); };
  const didAll = all.filter((e) => done[e.id]).length;

  return (
    <>
      <Screen header={{ title: tab, accent: 'practice', subtitle: tab === 'AP' ? 'Exam-style questions for every AP class, by unit.' : 'Short sets, Rush, full tests, and every answer explained.' }}
        refreshControl={tab === 'AP' ? <RefreshControl refreshing={ap.loading} onRefresh={ap.load} /> : undefined}>
        <ClassesBar where="practice" />
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT'], ['AP', 'AP']]} value={tab} onChange={setTab} />
        </View>
        {tab === 'AP' ? <APSide counts={ap.counts} /> : <>
        <QuickStart tiles={[
          { icon: 'bolt', label: `${focus} Rush`, sub: 'Beat the clock', color: c.tint, onPress: () => router.push({ pathname: '/speed', params: { test: focus, go: '1' } }) },
          { icon: 'shuffle', label: `Quick ${count}`, sub: 'Mixed, new first', color: c.orange, onPress: () => go(`${focus} mixed`, 'mixed', quickSet(focus, null, count)) },
          d.inProgress?.kind === 'exam'
            ? { icon: 'pause', label: 'Resume test', sub: d.inProgress.title, color: c.blue, onPress: () => router.push('/exam') }
            : { icon: 'test2', label: 'Practice test', sub: 'Timed and scored', color: c.blue, onPress: () => router.push('/practice/exams') },
        ]} />
        <View style={{ marginHorizontal: 16, marginTop: 14 }}>
          <View style={{ marginTop: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.subhead, { color: c.label2 }]}>{focus} question bank</Text>
              <Text style={[type.subhead, { color: c.label2, fontVariant: ['tabular-nums'] }]}>{didAll} / {all.length}</Text>
            </View>
            <Bar value={all.length ? didAll / all.length : 0} />
          </View>
        </View>

        <Section header="Practice tests" footer={`Numbered full-length ${focus} tests, one-subject half tests, and section tests. Timed and scored.`}>
          {d.inProgress?.kind === 'exam' ? <Row icon="pause" iconColor={c.orange} title={`Resume ${d.inProgress.title}`} subtitle="Test in progress" onPress={() => router.push('/exam')} /> : null}
          <Row icon="test2" iconColor={c.blue} title="Practice Tests" subtitle={focus === 'SAT' ? 'SAT Practice Tests 1 to 10, half tests, and more' : 'ACT Practice Tests 1 to 8, half tests, and more'} onPress={() => router.push('/practice/exams')} />
        </Section>

        <Section header={`${focus} Rush`} footer="Beat the clock, survive, or sprint. Streaks multiply your points, and bests sync with studyfox.org.">
          {Object.entries(secs).map(([k, name]) => <Row key={k} icon="bolt" iconColor={c.tint} title={`${name} Rush`} onPress={() => router.push({ pathname: '/speed', params: { test: focus, section: k, go: '1' } })} />)}
          <Row icon="timer" iconColor={c.orange} title="Choose Mode and Length" onPress={() => router.push({ pathname: '/speed', params: { test: focus } })} />
        </Section>

        <Section header="Quick sets" footer="New questions first, spread across every skill. Each one has a worked explanation.">
          <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={[type.body, { color: c.label }]}>Questions</Text>
            <Segmented style={{ flex: 1 }} options={[[5, '5'], [10, '10'], [20, '20']]} value={count} onChange={setCount} />
          </View>
          {Object.entries(secs).map(([k, name]) => {
            const tot = all.filter((e) => e.section === k);
            const did = tot.filter((e) => done[e.id]).length;
            const [ic, col] = SEC[k] || ['target', 'gray'];
            return <Row key={k} icon={ic} iconColor={c[col] as string} title={name} subtitle={`${did} of ${tot.length} done`} onPress={() => go(`${focus} ${name}`, k, quickSet(focus, k, count))} />;
          })}
          <Row icon="shuffle" iconColor={c.orange} title="Mixed" subtitle="A bit of everything" onPress={() => go(`${focus} mixed`, 'mixed', quickSet(focus, null, count))} />
        </Section>

        <Section>
          <Row icon="chartBar" iconColor={c.blue} title="Your Progress" subtitle="Skills, scores, and recent activity" onPress={() => router.push('/practice/progress')} />
          <Row icon="target" iconColor={c.red} title="Mistakes" value={miss ? String(miss) : undefined} subtitle={miss ? undefined : 'Nothing to fix right now'} onPress={() => router.push('/practice/mistakes')} />
          <Row icon="grid" iconColor={c.purple} title="Question Bank" subtitle={`Every ${focus} question, #1 to #${all.length}`} onPress={() => router.push('/practice/bank')} />
        </Section>

        {weak.length ? (
          <Section header="Focus next" footer="Your lowest-scoring skills with at least 3 answers.">
            {weak.map((w) => <Row key={w.sec + w.skill} title={w.skill} subtitle={`${w.p}% of ${w.t} right`} value="Drill" onPress={() => go(`${w.skill} drill`, w.sec, skillSet(focus, w.sec, { skills: [w.skill] }, 10))} />)}
          </Section>
        ) : null}

        <Section header="Tools">
          <Row icon="ruler" iconColor={c.teal} title="Formula Sheet" onPress={() => router.push('/practice/formulas')} />
          <Row icon="calculator" iconColor={c.gray} title="Desmos Calculator" subtitle="The same one built into the digital SAT" onPress={() => router.push('/calculator')} />
          <Row icon="cards" iconColor={c.indigo} title="Formula Flashcards" onPress={() => router.push('/study/builtin-math-formulas')} />
        </Section>
        </>}
      </Screen>
    </>
  );
}

type Tile = { icon: string; label: string; sub: string; color: string; onPress: () => void };
/** Big one-tap starts at the top of Practice. */
function QuickStart({ tiles }: { tiles: Tile[] }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 14 }}>
      {tiles.map((t) => (
        <Pressable key={t.label} accessibilityRole="button" accessibilityLabel={`${t.label}. ${t.sub}`} onPress={() => { tap(); t.onPress(); }}
          style={({ pressed }) => [cardStyle(c, 16), { flex: 1, padding: 12, gap: 6, minHeight: 104, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color }}><Icon name={t.icon} size={18} color="#fff" /></View>
          <Text numberOfLines={1} style={{ fontFamily: fonts.sansBold, fontSize: 16, color: c.label }}>{t.label}</Text>
          <Text numberOfLines={2} style={[type.caption, { color: c.label2 }]}>{t.sub}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The AP side of Practice: quick starts for your AP classes, then every class. */
function APSide({ counts }: { counts: Record<string, Record<string, number>> | null }) {
  const c = useColors();
  const mine = myStudying().filter((id) => getCourse(id)?.ap && counts?.[id]);
  const first = mine[0];
  const name = (id: string) => getCourse(id)!.title.replace(/^AP /, '');
  return (
    <>
      {first ? (
        <QuickStart tiles={[
          { icon: 'bolt', label: 'AP Rush', sub: name(first), color: c.tint, onPress: () => rushAP(first) },
          { icon: 'target', label: 'Practice', sub: name(first), color: c.orange, onPress: () => router.push(`/practice/ap/${first}`) },
          mine[1]
            ? { icon: 'bolt', label: 'AP Rush', sub: name(mine[1]), color: c.purple, onPress: () => rushAP(mine[1]) }
            : { icon: 'ruler', label: 'Formulas', sub: 'AP formula sheets', color: c.teal, onPress: () => router.push('/practice/formulas') },
        ]} />
      ) : (
        <View style={{ marginHorizontal: 16, marginTop: 14 }}>
          <Row icon="graduation" iconColor={c.purple} title="Pick your AP classes" subtitle="They'll get one-tap Practice and Rush here" onPress={() => router.push('/me')} />
        </View>
      )}
      <APList counts={counts} />
    </>
  );
}
