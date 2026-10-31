// Onboarding, same questions and rules as the website (js/views/welcome.js): name, age check (13+),
// goals, grade, language, email preference, and terms.
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, menu, Pill, Row, Section, SwitchRow } from '../components/ui';
import { cloudSignOut, deleteAccount } from '../lib/cloud';
import { setStudying, StudyPicker } from '../components/StudyPicker';
import { LANGS, PROFICIENCY, store, TERMS_VERSION } from '../lib/shared';
import { AGE_BLOCK } from '../lib/store-hooks';
import { type, useColors } from '../lib/theme';

const MIN_AGE = 13;
const GOALS: [string, string][] = [['school', 'School classes'], ['flashcards', 'Flashcards'], ['english', 'English'], ['other', 'Something else']];
const GRADES = ['6th grade or below', '7th grade', '8th grade', '9th grade', '10th grade', '11th grade', '12th grade', 'College', 'Not in school'];

const ageOn = (dob: Date, now = new Date()) => {
  let a = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) a--;
  return a;
};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Welcome() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const u = store.user();
  const s = store.data().settings;
  const [name, setName] = useState(u?.name || '');
  const [dob, setDob] = useState<Date | null>(null);
  const [webDob, setWebDob] = useState('');
  const [goals, setGoals] = useState<string[]>((s.goals || []).filter((g: string) => !['sat', 'act', 'ap'].includes(g)));
  const [studying, setStudyingIds] = useState<string[]>(s.studying || []);
  const [grade, setGrade] = useState<string>(s.grade || '');
  const [lang, setLang] = useState<string>(s.lang || 'en');
  const [english, setEnglish] = useState<string>(s.english || 'intermediate');
  const [emails, setEmails] = useState(!!s.emails);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState('');
  const L = LANGS.find((l: string[]) => l[0] === lang) || LANGS[0];
  const langName = (l: string[]) => (l[2] === l[1] ? l[1] : `${l[2]} (${l[1]})`);

  const submit = async () => {
    setErr('');
    const birth = Platform.OS === 'web' ? (webDob ? new Date(webDob + 'T00:00:00') : null) : dob;
    if (!name.trim()) return setErr('Enter your name.');
    if (!birth || isNaN(birth.getTime()) || birth > new Date() || ageOn(birth) > 120) return setErr('Enter your date of birth.');
    if (!agree) return setErr('Please agree to the Terms of Use and Privacy Policy to continue.');
    if (ageOn(birth) < MIN_AGE) {
      // Under 13: keep nothing. Remember only the date they can come back, on this device.
      const b = new Date(birth); b.setFullYear(b.getFullYear() + MIN_AGE);
      try { localStorage.setItem(AGE_BLOCK, iso(b)); } catch {}
      try { if (u?.cloud) { await deleteAccount(); await cloudSignOut(); } } catch (e) { console.warn(e); }
      store.forgetAccount();
      return;
    }
    // Goals keep their old shape (sat, act, ap, ...) so anything reading them still works.
    const allGoals = [...goals, ...(studying.includes('SAT') ? ['sat'] : []), ...(studying.includes('ACT') ? ['act'] : []), ...(studying.some((id) => id !== 'SAT' && id !== 'ACT') ? ['ap'] : [])];
    const cur = store.data().settings;
    Object.assign(cur, {
      onboarded: new Date().toISOString(), dob: iso(birth), goals: allGoals, grade, emails, emailsAt: new Date().toISOString(),
      focus: allGoals.includes('act') && !allGoals.includes('sat') ? 'ACT' : cur.focus || 'SAT',
      lang, english: lang === 'en' ? '' : english,
      legal: { version: TERMS_VERSION, at: new Date().toISOString() },
    });
    setStudying(studying);
    store.updateProfile({ name: name.trim() });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 30, paddingBottom: ins.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 20, gap: 6 }}>
          <Text style={[type.largeTitle, { color: c.label }]}>Welcome</Text>
          <Text style={[type.body, { color: c.label2 }]}>A few quick questions to set things up.</Text>
        </View>

        <Section header="About you">
          <Field value={name} onChangeText={setName} placeholder="First name" textContentType="givenName" autoComplete="given-name" />
          <Row title="Birthday" accessory="none" right={Platform.OS === 'web'
            ? <TextInput value={webDob} onChangeText={setWebDob} placeholder="YYYY-MM-DD" placeholderTextColor={c.label3} style={[type.body, { color: c.label, width: 130, textAlign: 'right' }]} />
            : <DateTimePicker value={dob || new Date(2010, 0, 1)} mode="date" display="compact" maximumDate={new Date()} accentColor={c.tint} onChange={(_, d) => d && setDob(d)} />} />
          <Row title="Grade" value={grade || 'Choose'} onPress={() => menu('Grade', GRADES.map((g) => ({ title: g, onPress: () => setGrade(g) })))} />
        </Section>

        <Section header="What are you studying for?" footer="Search for the SAT, the ACT, or any AP class.">
          <StudyPicker value={studying} onChange={setStudyingIds} />
        </Section>

        <Section header="Anything else?" footer="Pick any.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 }}>
            {GOALS.map(([v, t]) => <Pill key={v} label={t} on={goals.includes(v)} onPress={() => setGoals(goals.includes(v) ? goals.filter((g) => g !== v) : [...goals, v])} />)}
          </View>
        </Section>

        <Section header="Language" footer={lang !== 'en' ? "The SAT and ACT are in English. We'll explain things in your language so you can learn it, then practice in English." : undefined}>
          <Row title="Primary Language" value={langName(L)} onPress={() => menu('Primary language', LANGS.slice(0, 12).map((l: string[]) => ({ title: langName(l), onPress: () => setLang(l[0]) })).concat([{ title: 'More languages…', onPress: () => menu('Primary language', LANGS.slice(12).map((l: string[]) => ({ title: langName(l), onPress: () => setLang(l[0]) }))) }]))} />
          {lang !== 'en' ? <Row title="Reading English" value={(PROFICIENCY.find((p: string[]) => p[0] === english) || PROFICIENCY[1])[1]} onPress={() => menu('How well do you read English?', PROFICIENCY.map(([v, n, d]: string[]) => ({ title: `${n}: ${d}`, onPress: () => setEnglish(v) })))} /> : null}
        </Section>

        <Section footer="Scholarships, competitions, and new courses. Turn this off anytime in Me.">
          <SwitchRow title="Email me updates" value={emails} onChange={setEmails} />
        </Section>
        <Section footer={<Text style={[type.footnote, { color: c.label2, marginHorizontal: 16, marginTop: 7 }]}>Read the <Text style={{ color: c.tint }} onPress={() => router.push('/doc/terms')}>Terms of Use</Text> and <Text style={{ color: c.tint }} onPress={() => router.push('/doc/privacy')}>Privacy Policy</Text>.</Text>}>
          <SwitchRow title="I agree to the Terms and Privacy Policy" value={agree} onChange={setAgree} />
        </Section>

        {err ? <Text style={[type.subhead, { color: c.red, textAlign: 'center', marginTop: 16, paddingHorizontal: 24 }]}>{err}</Text> : null}
        <View style={{ padding: 20 }}><Button title="Start Studying" onPress={submit} /></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
