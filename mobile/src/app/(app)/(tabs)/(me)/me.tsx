// Me: profile and settings, matching the website's Settings page (name, test, test date, target
// scores, language, sign-in methods, backups), plus iPhone-only reminders and sync status.
import { myStudying, setStudying, StudyPicker } from '../../../../components/StudyPicker';
import { showPrompt } from '../../../../components/AndroidDialogs';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { router, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, Share, Text, View } from 'react-native';
import { Card, confirm, Icon, menu, Row, Screen, Section, Stat, SwitchRow } from '../../../../components/ui';
import { masteredCount } from '../../../../lib/cards';
import { cloudSignOut, deleteAccount, linkedProviders, linkProvider, syncNow, syncStatus } from '../../../../lib/cloud';
import { openWeb } from '../../../../lib/links';
import { getPrefs, KINDS, openSystemSettings, reschedule, setKind, setReminders, timeLabel, type Kind } from '../../../../lib/reminders';
import { BUILTIN_DECKS, CREATOR, SHARE_KINDS, shareMessage, STUDYFOX_INSTAGRAM, KOFI, LANGS, PROFICIENCY, SITE_URL, store, SUPPORT_EMAIL, SUPPORT_FORM_URL, timeAgo } from '../../../../lib/shared';
import { useStore } from '../../../../lib/store-hooks';
import { type, useColors } from '../../../../lib/theme';

const THEME_NAME: Record<string, string> = { system: 'Automatic', light: 'Light', dark: 'Dark' };
const langName = (l: string[]) => (l[2] === l[1] ? l[1] : `${l[2]} (${l[1]})`);

function ask(title: string, msg: string | undefined, value: string, keyboard: 'default' | 'number-pad', done: (v: string) => void) {
  if (Platform.OS === 'ios') Alert.prompt(title, msg, (v) => v != null && done(v), 'plain-text', value, keyboard);
  else if (Platform.OS === 'android') showPrompt(title, msg, value, keyboard, done);
  else { const v = window.prompt(title, value); if (v != null) done(v); }
}

// On iOS the picker sits in the row. On Android it can only open as a dialog, so the row shows a button.
function PickDateTime({ mode, value, label, minimumDate, onPick }: { mode: 'date' | 'time'; value: Date; label: string; minimumDate?: Date; onPick: (d: Date) => void }) {
  const c = useColors();
  if (Platform.OS === 'android') return (
    <Pressable accessibilityRole="button" hitSlop={10} onPress={() => DateTimePickerAndroid.open({ mode, value, minimumDate, onValueChange: (_, d) => onPick(d) })}>
      <Text style={[type.body, { color: c.tint }]}>{label}</Text>
    </Pressable>
  );
  return <DateTimePicker mode={mode} display="compact" accentColor={c.tint} minuteInterval={mode === 'time' ? 5 : undefined} value={value} minimumDate={minimumDate}
    onChange={(_, d) => { if (d) onPick(d); }} />;
}

export default function Me() {
  useStore();
  const c = useColors();
  const u = store.user()!;
  const d = store.data();
  const s = d.settings;
  const [rem, setRem] = useState(getPrefs());
  const [links, setLinks] = useState<string[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const sync = syncStatus();

  useEffect(() => { if (u?.cloud) linkedProviders().then(setLinks).catch(() => setLinks([])); }, [u?.cloud]);
  const refresh = useCallback(async () => { setRefreshing(true); try { await syncNow(); } finally { setRefreshing(false); } }, []);

  const totals = Object.values(d.stats as Record<string, { c: number; t: number }>).reduce((a, x) => ({ c: a.c + x.c, t: a.t + x.t }), { c: 0, t: 0 });
  const mastered = [...store.sets(), ...BUILTIN_DECKS].reduce((n, x) => n + masteredCount(x), 0);
  const lessons = Object.keys(d.learned).length;
  const days = s.testDate ? Math.ceil((new Date(s.testDate + 'T08:00').getTime() - Date.now()) / 86400000) : null;
  const lang = LANGS.find((l: string[]) => l[0] === (s.lang || 'en')) || LANGS[0];
  const prof = PROFICIENCY.find((p: string[]) => p[0] === (s.english || 'intermediate')) || PROFICIENCY[1];
  const set = (patch: Record<string, unknown>) => { Object.assign(store.data().settings, patch); store.save(); store.emit(); };
  const signOut = async () => { if (u?.cloud) await cloudSignOut(); store.logout(); };

  const setTarget = (test: 'SAT' | 'ACT') => {
    const [lo, hi, step] = test === 'SAT' ? [400, 1600, 10] : [1, 36, 1];
    ask(`${test} target score`, `Between ${lo} and ${hi}.`, String(s.target?.[test] ?? ''), 'number-pad', (v) => {
      const n = Math.round(+v / step) * step;
      if (!n || n < lo || n > hi) return Alert.alert('Not a valid score', `${test} scores go from ${lo} to ${hi}.`);
      set({ target: { ...s.target, [test]: n } });
    });
  };
  const pickLanguage = (from = 0) => {
    const page = LANGS.slice(from, from + 10);
    menu('Primary language', [
      ...page.map((l: string[]) => ({ title: langName(l), onPress: () => set({ lang: l[0], english: l[0] === 'en' ? '' : s.english || 'intermediate' }) })),
      ...(from + 10 < LANGS.length ? [{ title: 'More Languages', onPress: () => setTimeout(() => pickLanguage(from + 10), 350) }] : []),
    ]);
  };
  const toggleReminders = async (on: boolean) => {
    const r = await setReminders(on);
    setRem(getPrefs());
    if (r.denied) Alert.alert('Notifications are off for StudyFox', 'Turn them on in iPhone Settings to get study reminders.', [{ text: 'Not Now', style: 'cancel' }, { text: 'Open Settings', onPress: openSystemSettings }]);
  };
  const exportBackup = async () => {
    try {
      const f = new File(Paths.cache, `studyfox-backup-${new Date().toISOString().slice(0, 10)}.json`);
      f.write(store.exportAll());
      await Sharing.shareAsync(f.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your StudyFox backup' });
    } catch (e: any) { Alert.alert('Could not export', e.message); }
  };
  const importBackup = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', 'text/plain'], copyToCacheDirectory: true });
      if (r.canceled) return;
      if (!(await confirm('Import this backup?', 'It replaces the progress on this iPhone, and your synced progress if you sync.', 'Import'))) return;
      store.importAll(await new File(r.assets[0].uri).text());
      reschedule();
      Alert.alert('Backup imported');
    } catch (e: any) { Alert.alert('Could not import', e.message); }
  };
  const connect = async (p: 'google' | 'apple') => {
    try {
      if (await linkProvider(p)) { setLinks(await linkedProviders()); Alert.alert(`${p === 'apple' ? 'Apple' : 'Google'} connected`, 'Either one now opens this same account.'); }
    } catch (e: any) { Alert.alert('Could not connect', e.message); }
  };

  return (
    <>
      <Screen header={{ title: 'Your', accent: 'account' }} refreshControl={u?.cloud ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.tint} /> : undefined}>
        <Card style={{ marginHorizontal: 16, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 14 }}
          onPress={() => ask('Name', undefined, u.name, 'default', (v) => { if (v.trim()) store.updateProfile({ name: v.trim() }); })}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: '600', color: c.onTint }}>{(u?.name || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.title3, { color: c.label }]}>{u?.name}</Text>
            <Text style={[type.subhead, { color: c.label2 }]} numberOfLines={2}>{u?.cloud ? u.email || `${u.provider === 'apple' ? 'Apple' : 'Google'} account` : `${u?.email} · this iPhone only`}</Text>
          </View>
          <Text style={[type.subhead, { color: c.tint }]}>Edit</Text>
        </Card>

        <Card style={{ marginHorizontal: 16, marginTop: 12, flexDirection: 'row', paddingVertical: 18 }}>
          <Stat value={store.streak()} label="day streak" color={c.orange} />
          <Stat value={totals.t ? `${Math.round((100 * totals.c) / totals.t)}%` : '—'} label={`of ${totals.t.toLocaleString()} right`} />
          <Stat value={mastered} label="cards mastered" />
          <Stat value={lessons} label="lessons done" />
        </Card>

        <Section header="Study reminders" footer={rem.on ? "One a day at this time, picked from the kinds below. Skipped on days you've already studied." : 'A short daily nudge about what to practice next. Turn it off anytime.'}>
          <SwitchRow icon="bell" iconColor={c.red} title="Daily Reminder" value={rem.on} onChange={toggleReminders} />
          {rem.on ? (
            <Row icon="clock" iconColor={c.orange} title="Time" accessory="none"
              right={Platform.OS === 'web' ? <Text style={[type.body, { color: c.label2 }]}>{timeLabel(rem)}</Text> : (
                <PickDateTime mode="time" label={timeLabel(rem)} value={new Date(2000, 0, 1, rem.hour, rem.minute)}
                  onPick={(t) => { setReminders(true, { hour: t.getHours(), minute: t.getMinutes() }).then(() => setRem(getPrefs())); }} />
              )} />
          ) : null}
        </Section>
        {rem.on ? (
          <Section header="Remind me about" footer="Tapping a reminder opens that exact thing, like a Rush, a flashcard set, or your next lesson.">
            {(Object.keys(KINDS) as Kind[]).map((k) => (
              <SwitchRow key={k} title={KINDS[k][0]} subtitle={KINDS[k][1]} value={rem.kinds[k]} onChange={(v) => setKind(k, v).then(() => setRem(getPrefs()))} />
            ))}
          </Section>
        ) : null}

        <Section header="What you're studying for" footer="These show at the top of Courses, Practice, and AP Practice.">
          <StudyPicker value={myStudying()} onChange={setStudying} />
        </Section>

        <Section header="Test prep">
          <Row icon="target" iconColor={c.red} title="Main Test" value={s.focus || 'SAT'} onPress={() => menu('Main test', ['SAT', 'ACT'].map((t) => ({ title: t, onPress: () => set({ focus: t }) })))} />
          <Row icon="calendar" iconColor={c.red} title="Test Date" accessory="none"
            subtitle={days != null && days >= 0 ? `${days} day${days === 1 ? '' : 's'} to go` : undefined}
            right={Platform.OS === 'web' ? <Text style={[type.body, { color: c.label2 }]}>{s.testDate || 'Not set'}</Text> : (
              <PickDateTime mode="date" label={s.testDate || 'Set date'} value={s.testDate ? new Date(s.testDate + 'T12:00') : new Date()} minimumDate={new Date()}
                onPick={(date) => set({ testDate: date.toISOString().slice(0, 10) })} />
            )} />
          <Row icon="trophy" iconColor={c.yellow} title="SAT Target" value={String(s.target?.SAT ?? 1400)} onPress={() => setTarget('SAT')} />
          <Row icon="trophy" iconColor={c.yellow} title="ACT Target" value={String(s.target?.ACT ?? 30)} onPress={() => setTarget('ACT')} />
        </Section>

        <Section header="Preferences" footer={s.lang && s.lang !== 'en' ? 'The SAT and ACT are in English, so questions stay in English.' : undefined}>
          <Row icon="globe" iconColor={c.blue} title="Language" value={langName(lang)} onPress={() => pickLanguage()} />
          {s.lang && s.lang !== 'en' ? (
            <Row icon="book" iconColor={c.blue} title="Reading English" value={prof[1]}
              onPress={() => menu('How well do you read English?', PROFICIENCY.map(([v, n, dsc]: string[]) => ({ title: `${n}: ${dsc}`, onPress: () => set({ english: v }) })))} />
          ) : null}
          <Row icon="moon" iconColor={c.indigo} title="Appearance" value={THEME_NAME[s.theme] || 'Automatic'} onPress={() => menu('Appearance', Object.entries(THEME_NAME).map(([k, v]) => ({ title: v, onPress: () => set({ theme: k }) })))} />
          <SwitchRow icon="mail" iconColor={c.teal} title="Email Updates" subtitle="New courses, features, and study opportunities" value={!!s.emails} onChange={(v) => set({ emails: v, emailsAt: new Date().toISOString() })} />
        </Section>

        {u?.cloud ? (
          <Section header="Account and sync" footer="Connect both Google and Apple so either one opens this account. Pull down to sync now.">
            <Row icon="sync" iconColor={c.green} title="Synced with studyfox.org" accessory="none" onPress={refresh}
              value={refreshing ? <ActivityIndicator /> : <Text style={[type.subhead, { color: sync.failed ? c.red : c.label2 }]}>{sync.failed ? 'Not synced' : sync.at ? timeAgo(sync.at) : 'Waiting'}</Text>} />
            {(['google', 'apple'] as const).map((id) => {
              const on = links?.includes(id);
              return (
                <Row key={id} title={id === 'google' ? 'Google' : 'Apple'} accessory="none" onPress={links && !on ? () => connect(id) : undefined}
                  right={links == null ? <ActivityIndicator /> : on
                    ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icon name="checkCircle" size={17} color={c.good} /><Text style={[type.subhead, { color: c.label2 }]}>Connected</Text></View>
                    : <Text style={[type.body, { color: c.tint }]}>Connect</Text>} />
              );
            })}
          </Section>
        ) : null}

        <Section header="StudyFox" footer={`Made by ${CREATOR}. Free for every student: no ads, no paywalls, no limits.`}>
          <Row icon="share" iconColor={c.orange} title="Share" subtitle="Your streak, your progress, or StudyFox itself"
            onPress={() => menu('What do you want to share?', (SHARE_KINDS as string[][]).map(([k, t]) => ({ title: t, onPress: () => Share.share({ message: shareMessage(k).text }) })))} />
          <Row icon="news" iconColor={c.tint} title="News" onPress={() => router.push('/news')} />
          <Row icon="heart" iconColor={c.tint} title="About StudyFox" onPress={() => router.push('/about')} />
          <Row icon="mail" iconColor={c.teal} title="Contact Us" subtitle={SUPPORT_EMAIL}
            onPress={() => menu(SUPPORT_EMAIL, [{ title: 'Copy Email Address', onPress: () => { Clipboard.setStringAsync(SUPPORT_EMAIL); Alert.alert('Copied', SUPPORT_EMAIL); } }, { title: 'Write an Email', onPress: () => openWeb(`mailto:${SUPPORT_EMAIL}`) }])} />
          {SUPPORT_FORM_URL ? <Row icon="support" iconColor={c.teal} title="Suggestion Box" subtitle="Send an idea or report a problem" onPress={() => openWeb(SUPPORT_FORM_URL)} /> : null}
          <Row icon="globe" iconColor={c.tint} title="studyfox.org" onPress={() => openWeb(SITE_URL)} />
          <Row icon="instagram" iconColor={c.pink} title={`@${STUDYFOX_INSTAGRAM}`} onPress={() => openWeb(`https://instagram.com/${STUDYFOX_INSTAGRAM}`)} />
          <Row icon="heart" iconColor={c.pink} title="Donate on Ko-fi" subtitle="Helps keep StudyFox free and running" onPress={() => openWeb(KOFI)} />
          <Row icon="hand" iconColor={c.gray} title="Privacy Policy" onPress={() => router.push('/doc/privacy')} />
          <Row icon="doc" iconColor={c.gray} title="Terms of Use" onPress={() => router.push('/doc/terms')} />
        </Section>

        <Section header="Your data" footer={u?.cloud ? 'Your progress is also backed up to your account automatically.' : 'Your progress is saved on this iPhone. Export a backup to keep it safe, or sign in with Google or Apple to sync.'}>
          <Row icon="share" iconColor={c.blue} title="Export Backup" onPress={exportBackup} />
          <Row icon="download" iconColor={c.blue} title="Import Backup" onPress={importBackup} />
        </Section>

        <Section>
          <Row title="Sign Out" tint accessory="none" onPress={signOut} />
        </Section>
        <Section footer="SAT®, AP®, and ACT® are trademarks of their owners, which are not affiliated with and do not endorse this app.">
          <Row title="Reset All Progress" destructive accessory="none" onPress={async () => { if (await confirm('Reset all progress?', 'This permanently deletes your scores, mistakes, and flashcard sets.', 'Reset')) store.resetAll(); }} />
          {u?.cloud ? <Row title="Delete Account" destructive accessory="none" onPress={async () => {
            if (!(await confirm('Delete your account?', 'This permanently deletes your account, synced progress, and leaderboard times from our servers and this iPhone. It cannot be undone.', 'Delete Account'))) return;
            try { await deleteAccount(); store.resetAll(); await cloudSignOut(); store.logout(); } catch (e: any) { Alert.alert('Could not delete', e.message); }
          }} /> : null}
        </Section>
      </Screen>
    </>
  );
}
