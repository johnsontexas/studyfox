import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { SourceSerif4_400Regular, SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AgreeGate from '../components/AgreeGate';
import AnnouncementPopup from '../components/AnnouncementPopup';
import { syncPushToken } from '../lib/announcements';
import { DialogHost } from '../components/AndroidDialogs';
import { contentClient, fetchStatus, initCloud, isPulling } from '../lib/cloud';
import { Icon } from '../components/ui';
import { SUPPORT_EMAIL } from '../lib/shared';
import { type } from '../lib/theme';
import { bank, initContent, store, TERMS_VERSION } from '../lib/shared';
import { reschedule, wireNotificationTaps } from '../lib/reminders';
import { hydrate } from '../lib/storage';
import { ageBlockedUntil, needsOnboarding, useStore, wireStore } from '../lib/store-hooks';
import { useAppearanceSetting, useColors, useScheme } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_600SemiBold_Italic, SourceSerif4_400Regular, SourceSerif4_600SemiBold });
  useEffect(() => {
    hydrate().catch(console.warn).finally(() => {
      wireStore();
      setReady(true);
      initCloud().catch(console.warn);
      // Lessons, decks, and custom questions come from Supabase (edited in the website's admin console).
      // The saved copy applies instantly; newer content redraws every screen when it arrives.
      initContent(contentClient()).then((changed) => { if (changed) store.emit(); }).catch(console.warn);
      // Build the numbered question bank in the background so the first answer doesn't stall.
      setTimeout(() => { bank('SAT'); bank('ACT'); }, 1500);
      // Keep study reminders current: skip today once you've studied, and mention the latest streak.
      let t: ReturnType<typeof setTimeout> | null = null;
      const later = () => { if (t) clearTimeout(t); t = setTimeout(reschedule, 3000); };
      reschedule();
      wireNotificationTaps();
      store.onSave(later);
      store.onChange(later);
      AppState.addEventListener('change', (a) => {
        if (a !== 'active') return;
        later();
        initContent(contentClient()).then((changed) => { if (changed) store.emit(); }).catch(() => {});
      });
    });
  }, []);
  useEffect(() => { if (ready && fontsLoaded) SplashScreen.hideAsync(); }, [ready, fontsLoaded]);
  if (!ready || !fontsLoaded) return null;
  return <App />;
}

function App() {
  useStore();
  useAppearanceSetting();
  const scheme = useScheme();
  const c = useColors();
  const signedIn = !!store.user();
  const blocked = !!ageBlockedUntil();
  const onboarding = signedIn && needsOnboarding();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: c.bg, card: c.card, text: c.label, border: c.sep, primary: c.tint } };
  const s = store.data().settings;
  const needsAgree = signedIn && !onboarding && s.legal?.version !== TERMS_VERSION;

  // Maintenance mode from the website's admin console; admins keep using the app.
  const [down, setDown] = useState<string | null>(null);
  useEffect(() => {
    const check = () => fetchStatus().then((st) => setDown(st?.maintenance && !st.admin ? st.message || '' : null)).catch(() => {});
    check();
    // Keep this phone's push token saved so announcements reach it (only if notifications are allowed).
    if (signedIn) syncPushToken().catch(() => {});
    const sub = AppState.addEventListener('change', (a) => { if (a === 'active') check(); });
    return () => sub.remove();
  }, [signedIn]);
  if (down !== null) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
        <Icon name="power" size={40} color={c.tint} />
        <Text style={[type.title2, { color: c.label, textAlign: 'center' }]}>StudyFox is taking a short break</Text>
        <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>{down || "We're making some updates and will be back soon. Your progress is saved."}</Text>
        <Text style={[type.footnote, { color: c.label2 }]}>{SUPPORT_EMAIL}</Text>
      </View>
    );
  }

  // Just signed in with Google/Apple: wait for the account's progress before deciding on onboarding.
  if (onboarding && store.user()?.cloud && isPulling()) {
    return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={c.tint} size="large" /></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemeProvider value={theme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Protected guard={blocked}>
            <Stack.Screen name="too-young" />
          </Stack.Protected>
          <Stack.Protected guard={!blocked && !signedIn}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={!blocked && onboarding}>
            <Stack.Screen name="welcome" />
          </Stack.Protected>
          <Stack.Protected guard={!blocked && signedIn && !onboarding}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Screen name="doc/[name]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth-callback" />
        </Stack>
        {needsAgree ? <AgreeGate /> : null}
        {signedIn && !onboarding && !needsAgree && !blocked ? <AnnouncementPopup /> : null}
        <DialogHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
