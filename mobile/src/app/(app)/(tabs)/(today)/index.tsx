// Today: built for quick studying, in the website's style. Greeting, daily goal and streak cards (tilted
// and floating, like the website's homepage mockups), Speed Rush, then one-tap ways to study.
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Bar, Button, cardStyle, Icon, IconTile, Logo, Row, Scribble, Screen, Section, Tag, tap } from '../../../../components/ui';
import { ClassesBar } from '../../../../components/StudyPicker';
import { masteredCount, recentSets } from '../../../../lib/cards';
import { fetchNews, syncNow, type NewsPost } from '../../../../lib/cloud';
import { mistakes, quickSet, setSession, type Q } from '../../../../lib/questions';
import { getPrefs, markAsked, setReminders } from '../../../../lib/reminders';
import { COURSES, questionOfTheDay, SECTIONS, store, today } from '../../../../lib/shared';
import { useStore } from '../../../../lib/store-hooks';
import { fonts, type, useColors } from '../../../../lib/theme';
import type { Test } from '../../../../lib/types';

const GOAL = 10; // questions a day

// Most recently studied course with lessons left.
function continueCourse() {
  const learned = store.data().learned as Record<string, number>;
  let best: { c: (typeof COURSES)[number]; ts: number } | null = null;
  for (const [k, ts] of Object.entries(learned)) {
    const c = COURSES.find((x) => x.id === k.split('/')[0]);
    if (c && (!best || ts > best.ts)) best = { c, ts };
  }
  if (!best) return null;
  const c = best.c;
  const done = c.lessons.filter((l) => learned[`${c.id}/${l.id}`]).length;
  const next = c.lessons.find((l) => !learned[`${c.id}/${l.id}`]);
  return next ? { c, next, done } : null;
}

function Ring({ value, size = 58, color, track }: { value: number; size?: number; color: string; track: string }) {
  const r = size / 2 - 5, len = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={7} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - Math.min(1, value))} />
    </Svg>
  );
}

/** A card that gently bobs, like the floating mockups on the website's homepage. */
function Floaty({ children, rotate, delay = 0, style }: { children: ReactNode; rotate: number; delay?: number; style?: object }) {
  const still = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => { if (!still) t.value = withRepeat(withTiming(1, { duration: 3000 + delay, easing: Easing.inOut(Easing.sin) }), -1, true); }, [still, t, delay]);
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate}deg` }, { translateY: -5 * t.value }] }));
  return <Animated.View style={[s, style]}>{children}</Animated.View>;
}

export default function Today() {
  useStore();
  const c = useColors();
  const ins = useSafeAreaInsets();
  const d = store.data();
  const u = store.user();
  const focus: Test = d.settings.focus || 'SAT';
  const streak = store.streak();
  const todayN = d.activity[today()] || 0;
  const sets = recentSets(3);
  const course = continueCourse();
  const miss = mistakes(focus).length;
  const qotd = questionOfTheDay(focus);
  const lastRun = d.speed?.runs?.[0];
  const best = lastRun ? d.speed.best[lastRun.key || `${lastRun.test}|${lastRun.section}|${lastRun.dur}|${lastRun.diff}`] || 0 : 0;
  const [askReminders, setAskReminders] = useState(!getPrefs().asked && !getPrefs().on);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<NewsPost[]>([]);
  useEffect(() => { fetchNews(2).then(setNews, () => {}); }, []);
  const refresh = useCallback(async () => { setRefreshing(true); try { await syncNow(); setNews(await fetchNews(2).catch(() => [])); } finally { setRefreshing(false); } }, []);
  const go = (title: string, section: string, questions: Q[]) => { setSession({ title, test: focus, section, questions }); router.push('/quiz'); };
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Up late,' : hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const first = u ? u.name.split(' ')[0] : 'friend';
  const [nameW, setNameW] = useState(0);
  const week = [...Array(7)].map((_, i) => { const dt = new Date(); dt.setDate(dt.getDate() - (6 - i)); return d.activity[dt.toISOString().slice(0, 10)] || 0; });

  return (
    <Screen backdrop contentInsetAdjustmentBehavior="never" style={{ paddingTop: ins.top + 6, paddingBottom: 120 }}
      refreshControl={u?.cloud ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.tint} /> : undefined}>
      {/* Brand bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 8 }}>
        <Logo size={26} />
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 20, color: c.label }}>Study<Text style={{ color: c.tint }}>Fox</Text></Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push('/practice/progress')} accessibilityLabel={`${streak} day streak`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: c.amberSoft }}>
          <Icon name="flame" size={16} color={c.flame} />
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 17, color: c.dark ? c.amber : '#8a4a10' }}>{streak}</Text>
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <Text style={[type.largeTitle, { color: c.label }]}>{hello}</Text>
        <View style={{ alignSelf: 'flex-start' }}>
          <Text onLayout={(e) => setNameW(e.nativeEvent.layout.width)} style={[type.largeTitle, { fontFamily: fonts.displayItalic, color: c.tint }]}>{first}.</Text>
          {nameW ? <Scribble width={nameW} /> : null}
        </View>
      </View>

      <ClassesBar where="today" />
      {store.data().inProgress?.kind === 'exam' ? (
        <View style={{ marginHorizontal: 16, marginTop: 12 }}>
          <Row icon="pause" iconColor={c.orange} title={`Resume ${store.data().inProgress.title}`} subtitle="You have a practice test in progress" onPress={() => router.push('/exam')} />
        </View>
      ) : null}

      {/* Goal and streak, tilted like the website's mock cards */}
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20 }}>
        <Floaty rotate={-2} style={{ flex: 1.15 }}>
          <View style={[cardStyle(c, 16), { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ring value={todayN / GOAL} color={todayN >= GOAL ? c.good : c.tint} track={c.fill2} />
              <Text style={{ position: 'absolute', fontFamily: fonts.displayBold, fontSize: 17, color: c.label }}>{Math.min(todayN, 99)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[type.headline, { color: c.label }]}>{todayN >= GOAL ? 'Goal done' : 'Daily goal'}</Text>
              <Text style={[type.footnote, { color: c.label2 }]}>{todayN} of {GOAL} today</Text>
            </View>
          </View>
        </Floaty>
        <Floaty rotate={3} delay={700} style={{ flex: 1 }}>
          <View style={[cardStyle(c, 16), { padding: 14, gap: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="flame" size={18} color={c.flame} />
              <Text style={[type.headline, { color: c.label }]}>{streak ? `${streak}-day streak` : 'No streak yet'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 26 }}>
              {week.map((n, i) => <View key={i} style={{ flex: 1, height: Math.min(26, 4 + n * 2.2), borderRadius: 3, backgroundColor: n ? (i === 6 ? c.flame : c.tint) : c.fill2 }} />)}
            </View>
          </View>
        </Floaty>
      </View>

      {/* Speed Rush */}
      <LinearGradient colors={[c.hero[0], c.hero[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 16, marginTop: 22, borderRadius: 24, padding: 20, gap: 12, borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -20, top: -24, opacity: 0.16 }}><Icon name="bolt" size={150} color="#fff8ec" /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Tag label="Speed Rush" tone="amber" />
          {best ? <Text style={[type.footnote, { color: 'rgba(255,248,236,0.8)', fontWeight: '600' }]}>Best: {lastRun?.mode === 'sprint' ? `${best}s` : lastRun?.key ? `${best} pts` : `${best} right`}</Text> : null}
        </View>
        <Text style={[type.title1, { color: '#fff8ec' }]}>How many can you get right in {lastRun ? lastRun.dur / 60 : 2} minutes?</Text>
        <Text style={[type.subhead, { color: 'rgba(255,248,236,0.78)' }]}>
          {lastRun ? (lastRun.test === 'AP' ? (COURSES.find((x) => x.id === lastRun.ap)?.title || 'AP') : `${lastRun.test} ${SECTIONS[lastRun.test as Test]?.[lastRun.section] || ''}`) : `${focus} Math`}. Every answer jumps straight to the next question.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Button title="Start Rush" kind="amber" icon="bolt" style={{ flex: 1 }} onPress={() => router.push('/speed?go=1')} />
          <Pressable accessibilityRole="button" accessibilityLabel="Rush settings" onPress={() => { tap(); router.push('/speed'); }}
            style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,248,236,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="timer" size={22} color="#fff8ec" />
          </Pressable>
        </View>
      </LinearGradient>

      {askReminders ? (
        <View style={[cardStyle(c), { marginHorizontal: 16, marginTop: 16, padding: 16, gap: 12 }]}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconTile name="bell" color={c.red} />
            <View style={{ flex: 1 }}>
              <Text style={[type.headline, { color: c.label }]}>Want a daily nudge?</Text>
              <Text style={[type.subhead, { color: c.label2 }]}>One evening reminder, skipped on days you've already studied.</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Not now" kind="gray" size="medium" style={{ flex: 1 }} onPress={() => { markAsked(); setAskReminders(false); }} />
            <Button title="Turn on" size="medium" style={{ flex: 1 }} onPress={async () => { await setReminders(true); setAskReminders(false); }} />
          </View>
        </View>
      ) : null}

      {/* Quick study */}
      <Text style={[type.title2, { color: c.label, marginHorizontal: 20, marginTop: 28, marginBottom: 12 }]}>Quick study</Text>
      <View style={{ marginHorizontal: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile icon="target" color={c.green} title="Quick 5" sub={`${focus} · 5 min`} onPress={() => go(`${focus} Quick 5`, 'mixed', quickSet(focus, null, 5))} />
          <Tile icon="cards" color={c.indigo} title="Flashcards" sub={sets[0] ? sets[0].title : 'Pick a deck'} onPress={() => (sets[0] ? router.push(`/study/${encodeURIComponent(sets[0].id)}`) : router.push('/cards'))} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile icon="xmarkCircle" color={c.red} title="Mistakes" sub={miss ? `${miss} to fix` : 'All clear'} onPress={() => router.push('/practice/mistakes')} />
          <Tile icon="book" color={c.teal} title="Courses" sub={course ? course.c.title : `${COURSES.length} courses`} onPress={() => (course ? router.push(`/courses/${course.c.id}/${course.next.id}`) : router.push('/courses'))} />
        </View>
      </View>

      {sets.length || course ? (
        <Section header="Pick up where you left off">
          {sets.map((s) => {
            const m = masteredCount(s);
            return (
              <Row key={s.id} icon="cards" iconColor={c.indigo} title={s.title} onPress={() => router.push(`/study/${encodeURIComponent(s.id)}`)}
                subtitle={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}><View style={{ flex: 1 }}><Bar value={m / s.cards.length} color={c.good} /></View><Text style={[type.footnote, { color: c.label2 }]}>{m}/{s.cards.length}</Text></View>} />
            );
          })}
          {course ? (
            <Row icon={course.c.icon} iconColor={c.teal} title={course.next.title} subtitle={`${course.c.title} · lesson ${course.c.lessons.indexOf(course.next) + 1} of ${course.c.lessons.length}`}
              onPress={() => router.push(`/courses/${course.c.id}/${course.next.id}`)} />
          ) : null}
        </Section>
      ) : null}

      {news.length ? (
        <Section header="Latest news">
          {news.map((n) => <Row key={n.id} icon="news" iconColor={c.tint} title={n.title} subtitle={new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} onPress={() => router.push('/news')} />)}
        </Section>
      ) : null}

      <Section header="Question of the day" footer={`A new ${focus} question every day.`}>
        <Row icon="sparkle" iconColor={c.yellow} title={qotd.skill} subtitle={`${SECTIONS[focus][qotd.section]} · ${qotd.domain}`} onPress={() => go('Question of the day', qotd.section, [qotd])} />
      </Section>

      <Section header="Explore">
        <Row icon="chartBar" iconColor={c.blue} title="Your progress" subtitle="Skills, scores, and recent activity" onPress={() => router.push('/practice/progress')} />
        <Row icon="grid" iconColor={c.purple} title="Question bank" subtitle={`Every ${focus} question, by number`} onPress={() => router.push('/practice/bank')} />
      </Section>
    </Screen>
  );
}

function Tile({ icon, color, title, sub, onPress }: { icon: string; color: string; title: string; sub: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [cardStyle(c), { flex: 1, minHeight: 108, padding: 14, justifyContent: 'space-between', transform: [{ translateY: pressed ? 2 : 0 }], borderBottomWidth: pressed ? 1 : 3 }]}>
      <IconTile name={icon} color={color} size={34} />
      <View>
        <Text style={[type.title3, { fontSize: 18, color: c.label }]}>{title}</Text>
        <Text numberOfLines={1} style={[type.footnote, { color: c.label2 }]}>{sub}</Text>
      </View>
    </Pressable>
  );
}
