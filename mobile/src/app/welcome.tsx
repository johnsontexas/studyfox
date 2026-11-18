// Onboarding, same questions and rules as the website (js/views/welcome.js): name, age check (13+),
// goals, grade, language, how you heard about StudyFox, a friend's user number, email preference, and terms.
// The age check is a yes/no question: we don't ask for a date of birth (App Store guideline 5.1.1(v)).
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, menu, Pill, Row, Section, SwitchRow } from '../components/ui';
import { cloudSignOut, contentClient, deleteAccount } from '../lib/cloud';
import { setStudying, StudyPicker } from '../components/StudyPicker';
import { clearRef, LANGS, loadMember, ordinal, pendingRef, PROFICIENCY, setReferrer, setting, store, TERMS_VERSION, updateMemberProfile } from '../lib/shared';
import { AGE_BLOCK } from '../lib/store-hooks';
import { type, useColors } from '../lib/theme';

const MIN_AGE = 13;
const GOALS: [string, string][] = [['school', 'School classes'], ['flashcards', 'Flashcards'], ['english', 'English'], ['other', 'Something else']];
const GRADES = ['6th grade or below', '7th grade', '8th grade', '9th grade', '10th grade', '11th grade', '12th grade', 'College', 'Not in school'];

const DETAIL_FOR = ['other', 'other_creator', 'teacher'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Welcome() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const u = store.user();
  const s = store.data().settings;
  const [name, setName] = useState(u?.name || '');
  const [age, setAge] = useState<'' | 'ok' | 'under'>('');
  const heardCfg = setting('onboarding') as { ask_heard_about?: boolean; heard_about_options?: { id: string; label: string }[] };
  const [heard, setHeard] = useState<string>(s.heardAbout?.source || (pendingRef() ? 'friend' : ''));
  const [heardDetail, setHeardDetail] = useState<string>(s.heardAbout?.detail || '');
  const [friend, setFriend] = useState<string>(pendingRef());
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
    if (!name.trim()) return setErr('Enter your name.');
    if (!age) return setErr(`Tell us if you're ${MIN_AGE} or older.`);
    if (!agree && age === 'ok') return setErr('Please agree to the Terms of Use and Privacy Policy to continue.');
    const fr = friend.trim().replace(/^#/, '');
    if (fr && !/^\d{1,9}$/.test(fr)) return setErr("A friend's user number is digits only, like 42.");
    if (age === 'under') {
      // Under 13: keep nothing. Block sign-up on this device for a year.
      const b = new Date(); b.setFullYear(b.getFullYear() + 1);
      try { localStorage.setItem(AGE_BLOCK, iso(b)); } catch {}
      try { if (u?.cloud) { await deleteAccount(); await cloudSignOut(); } } catch (e) { console.warn(e); }
      store.forgetAccount();
      return;
    }
    if (fr && u?.cloud) {
      const r = await setReferrer(contentClient(), fr);
      if (r === 'not_found') return setErr(`We couldn't find user #${fr}. Check the number with your friend, or leave it blank.`);
      if (r === 'self') return setErr("That's your own user number. Enter your friend's number, or leave it blank.");
      clearRef();
    } else if (!fr) clearRef();
    if (heard) {
      const detail = DETAIL_FOR.includes(heard) ? heardDetail.trim().slice(0, 200) : '';
      store.data().settings.heardAbout = { source: heard, detail };
      if (u?.cloud) Promise.resolve(contentClient()?.from('signup_sources').upsert({ user_id: u.id, source: heard, detail, platform: Platform.OS })).catch(console.warn);
    }
    // Goals keep their old shape (sat, act, ap, ...) so anything reading them still works.
    const allGoals = [...goals, ...(studying.includes('SAT') ? ['sat'] : []), ...(studying.includes('ACT') ? ['act'] : []), ...(studying.some((id) => id !== 'SAT' && id !== 'ACT') ? ['ap'] : [])];
    const cur = store.data().settings;
    Object.assign(cur, {
      onboarded: new Date().toISOString(), ageOk: true, goals: allGoals, grade, emails, emailsAt: new Date().toISOString(),
      focus: allGoals.includes('act') && !allGoals.includes('sat') ? 'ACT' : cur.focus || 'SAT',
      lang, english: lang === 'en' ? '' : english,
      legal: { version: TERMS_VERSION, at: new Date().toISOString() },
    });
    setStudying(studying);
    store.updateProfile({ name: name.trim() });
    if (u?.cloud) {
      updateMemberProfile(contentClient(), name.trim(), true);
      loadMember(contentClient()).then((m: any) => m && Alert.alert(`Welcome to StudyFox, ${name.trim()}!`, `You're user #${m.no}, the ${ordinal(m.no)} student to join.`)).catch(() => {});
    }
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
          <Row title="Grade" value={grade || 'Choose'} onPress={() => menu('Grade', GRADES.map((g) => ({ title: g, onPress: () => setGrade(g) })))} />
        </Section>

        <Section header="How old are you?" footer={`StudyFox is for students ${MIN_AGE} and older. We don't ask for your birthday.`}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 }}>
            <Pill label={`${MIN_AGE} or older`} on={age === 'ok'} onPress={() => setAge('ok')} />
            <Pill label={`Under ${MIN_AGE}`} on={age === 'under'} onPress={() => setAge('under')} />
          </View>
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

        {heardCfg.ask_heard_about ? (
          <Section header="How did you hear about StudyFox?" footer="Optional.">
            <Row title="Choose one" value={(heardCfg.heard_about_options || []).find((o) => o.id === heard)?.label || ''} numberOfLines={2}
              onPress={() => menu('How did you hear about StudyFox?', (heardCfg.heard_about_options || []).map((o) => ({ title: o.label, onPress: () => setHeard(o.id) })))} />
            {DETAIL_FOR.includes(heard) ? <Field value={heardDetail} onChangeText={setHeardDetail} maxLength={200} placeholder="Tell us more, like the creator's name" /> : null}
          </Section>
        ) : null}
        {u?.cloud ? (
          <Section header="Did a friend share StudyFox?" footer="Optional. Their StudyFox user number is on their Me page or in their link.">
            <Field value={friend} onChangeText={setFriend} keyboardType="number-pad" maxLength={9} placeholder="Friend's user number, like 42" />
          </Section>
        ) : null}

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
