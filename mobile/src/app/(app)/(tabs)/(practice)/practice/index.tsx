import { ClassesBar } from '../../../../../components/StudyPicker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Bar, Row, Screen, Section, Segmented } from '../../../../../components/ui';
import { openWeb } from '../../../../../lib/links';
import { mistakes, quickSet, setSession, skillSet, type Q } from '../../../../../lib/questions';
import { bank, SECTIONS, SITE_URL, store } from '../../../../../lib/shared';
import { useStore } from '../../../../../lib/store-hooks';
import { type, useColors } from '../../../../../lib/theme';
import type { Test } from '../../../../../lib/types';

const SEC: Record<string, [string, keyof ReturnType<typeof useColors>]> = { rw: ['book', 'blue'], math: ['integral', 'green'], english: ['pen', 'purple'], reading: ['scroll', 'indigo'], science: ['flask', 'teal'] };

export default function Practice() {
  useStore();
  const c = useColors();
  const d = store.data();
  const focus: Test = d.settings.focus || 'SAT';
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
      <Screen header={{ title: 'SAT & ACT', accent: 'practice', subtitle: 'Short sets, Speed Rush, and every answer explained.' }}>
        <ClassesBar where="practice" />
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <Segmented options={[['SAT', 'SAT'], ['ACT', 'ACT']]} value={focus} onChange={(f) => { d.settings.focus = f; store.save(); }} />
          <View style={{ marginTop: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.subhead, { color: c.label2 }]}>{focus} question bank</Text>
              <Text style={[type.subhead, { color: c.label2, fontVariant: ['tabular-nums'] }]}>{didAll} / {all.length}</Text>
            </View>
            <Bar value={all.length ? didAll / all.length : 0} />
          </View>
        </View>

        <Section header="AP Practice" footer="Exam-style questions for every AP class, by unit and concept.">
          <Row icon="graduation" iconColor={c.purple} title="AP Question Bank" subtitle="All 30 AP classes" onPress={() => router.push('/practice/ap')} />
        </Section>

        <Section header="Speed Rush" footer="Beat the clock, survive, or sprint. Streaks multiply your points, and bests sync with studyfox.org.">
          <Row icon="bolt" iconColor={c.tint} title="Start Rush" subtitle="Same settings as last time" onPress={() => router.push('/speed?go=1')} />
          <Row icon="timer" iconColor={c.orange} title="Choose Mode and Questions" onPress={() => router.push('/speed')} />
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
        <Section footer="Full-length timed tests work best on a computer.">
          <Row icon="test2" iconColor={c.blue} title="Full Practice Tests" accessory={<Text style={[type.subhead, { color: c.label3 }]}>studyfox.org</Text>} onPress={() => openWeb(`${SITE_URL}/#/exams`)} />
        </Section>
      </Screen>
    </>
  );
}
