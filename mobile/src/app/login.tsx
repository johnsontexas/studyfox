// Sign in. Google and Apple accounts use the same Supabase project as studyfox.org, so progress
// syncs between the website and the app. Email accounts use Supabase too, so they sync as well.
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import Backdrop from '../components/Backdrop';
import { Button, Field, Logo, Scribble, Section, tap } from '../components/ui';
import { appleAvailable, cloudEnabled, emailSignIn, emailSignUp, signInWithApple, signInWithGoogle } from '../lib/cloud';
import { COURSES, lessonCount, SITE_URL, store } from '../lib/shared';
import { openWeb } from '../lib/links';
import { fonts, type, useColors, useScheme } from '../lib/theme';

const GOOGLE = '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';

export default function Login() {
  const c = useColors();
  const scheme = useScheme();
  const ins = useSafeAreaInsets();
  const [email, setEmail] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [apple, setApple] = useState(false);
  const [accentW, setAccentW] = useState(0);
  useEffect(() => { appleAvailable().then(setApple); }, []);

  const run = async (what: string, fn: () => Promise<unknown>) => {
    setErr(''); setBusy(what);
    try { await fn(); } catch (e: any) { if (e?.code !== 'ERR_REQUEST_CANCELED') setErr(e?.message || 'Something went wrong.'); }
    setBusy(null);
  };
  const submitEmail = () => run('email', async () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) throw new Error('Enter a valid email address.');
    if (form.password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (!cloudEnabled) { if (mode === 'signup') await store.signup(form); else await store.login(form.email, form.password); return; }
    // The cloud session is picked up by lib/cloud.ts, which downloads progress and opens the app.
    const r = mode === 'signup' ? await emailSignUp(form) : await emailSignIn(form.email, form.password);
    if (r.confirm) {
      setNote(`We sent a link to ${form.email}. Open it to ${r.moved ? 'finish moving your account to the cloud' : 'confirm your account'}, then sign in here.`);
      if (r.moved) await store.login(form.email, form.password);
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <Backdrop height={520} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: ins.top + 50, paddingBottom: ins.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 24, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Logo size={34} />
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 24, color: c.label }}>Study<Text style={{ color: c.tint }}>Fox</Text></Text>
          </View>
          <View style={{ marginTop: 18 }}>
            <Text style={[type.largeTitle, { fontSize: 42, lineHeight: 46, color: c.label }]}>Study for every class.</Text>
            <View style={{ alignSelf: 'flex-start' }}>
              <Text onLayout={(e) => setAccentW(e.nativeEvent.layout.width)} style={[type.largeTitle, { fontSize: 42, lineHeight: 50, fontFamily: fonts.displayItalic, color: c.tint }]}>Pay for none of it.</Text>
              {accentW ? <Scribble width={accentW} /> : null}
            </View>
          </View>
          <Text style={[type.body, { color: c.label2 }]}>Flashcards, courses for every AP class, and SAT and ACT practice. Free for every student: no ads, no paywall.</Text>
          <View style={{ flexDirection: 'row', gap: 22, marginTop: 6 }}>
            {[[`${COURSES.length}`, 'courses'], [`${lessonCount()}`, 'lessons'], ['25+', 'languages']].map(([n, l]) => (
              <View key={l}><Text style={[type.number, { color: c.label }]}>{n}</Text><Text style={[type.footnote, { color: c.label2 }]}>{l}</Text></View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 30 }} />

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {cloudEnabled && apple ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={scheme === 'dark' ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={14} style={{ height: 52 }} onPress={() => run('apple', signInWithApple)} />
          ) : null}
          {cloudEnabled ? (
            <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => { tap(); run('google', signInWithGoogle); }}
              style={({ pressed }) => ({ height: 52, borderRadius: 14, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: pressed || busy === 'google' ? 0.6 : 1 })}>
              <SvgXml xml={GOOGLE} width={19} height={19} />
              <Text style={[type.headline, { color: c.label }]}>Continue with Google</Text>
            </Pressable>
          ) : null}
          {!email ? <Button title="Continue with Email" kind="gray" icon="mail" onPress={() => setEmail(true)} /> : null}
        </View>

        {email ? (
          <>
            <Section footer={note || (mode === 'signup' ? 'Your progress syncs with studyfox.org and your other devices.' : undefined)}>
              {mode === 'signup' ? <Field value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="First name" textContentType="givenName" autoComplete="given-name" /> : null}
              <Field value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="Email" autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />
              <Field value={form.password} onChangeText={(password) => setForm({ ...form, password })} placeholder={mode === 'signup' ? 'Password (6+ characters)' : 'Password'} secureTextEntry
                textContentType={mode === 'signup' ? 'newPassword' : 'password'} onSubmitEditing={submitEmail} returnKeyType="go" />
            </Section>
            <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 4 }}>
              <Button title={mode === 'signup' ? 'Create Account' : 'Sign In'} loading={busy === 'email'} onPress={submitEmail} />
              {mode === 'login' ? <Button title="Forgot your password?" kind="plain" size="medium" onPress={() => openWeb(`${SITE_URL}/#/login`)} /> : null}
              <Button title={mode === 'signup' ? 'I already have an account' : 'Create a new account'} kind="plain" size="medium" onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setErr(''); }} />
            </View>
          </>
        ) : null}

        {err ? <Text selectable style={[type.subhead, { color: c.red, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }]}>{err}</Text> : null}
        <Text style={[type.footnote, { color: c.label2, textAlign: 'center', marginTop: 18, paddingHorizontal: 32 }]}>
          By continuing, you agree to the <Text style={{ color: c.tint }} onPress={() => router.push('/doc/terms')}>Terms of Use</Text> and <Text style={{ color: c.tint }} onPress={() => router.push('/doc/privacy')}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
