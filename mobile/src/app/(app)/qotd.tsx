// Question of the Day race. Same race and leaderboard as the website dashboard (js/qotd.js,
// supabase/qotd_race.sql): Start reveals today's shared question and starts the server clock,
// one answer, and right answers go on the board fastest first. Wrong answers still see why.
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/AppText';
import ModalBar from '../../components/ModalBar';
import QuestionView from '../../components/QuestionView';
import Fox from '../../components/Fox';
import { Button, buzz, Icon } from '../../components/ui';
import { contentClient } from '../../lib/cloud';
import { fmtMs, myAvatar, qotdAnswer, qotdBoard, qotdStart, qotdStatus, qotdYesterday, store } from '../../lib/shared';
import { type, useColors } from '../../lib/theme';
import type { Q } from '../../lib/types';

type Row = { user_id: string; name: string; ms: number; avatar?: any };
const SECTION: Record<string, string> = { math: 'Math', rw: 'Reading and Writing' };

export default function QotdRace() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const me = store.user();
  const [st, setSt] = useState<any>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [t0, setT0] = useState(0);
  const [board, setBoard] = useState<Row[] | null>(null);
  const [yday, setYday] = useState<Row | null>(null);

  // Keep the state; when the race is running, start the on-screen clock from the server's start time.
  const apply = (s: any) => {
    setSt(s);
    if (s?.status === 'started') { const n = Date.now(); setT0(Math.min(n, Date.parse(s.started_at) || n)); setNow(n); }
  };
  const loadBoard = (day?: string) => {
    qotdBoard(contentClient()).then(setBoard, () => setBoard([]));
    if (day) qotdBoard(contentClient(), qotdYesterday(day)).then((r: Row[]) => setYday(r[0] || null), () => {});
  };
  useEffect(() => { qotdStatus(contentClient()).then((s: any) => { apply(s); loadBoard(s?.day); }, () => setErr(true)); }, []);
  useEffect(() => {
    if (st?.status !== 'started') return;
    const iv = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(iv);
  }, [st?.status]);

  const start = async () => {
    setBusy(true);
    try { apply(await qotdStart(contentClient())); } catch (e: any) { Alert.alert('Could not start', e.message); }
    setBusy(false);
  };
  const answer = async (i: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const s = await qotdAnswer(contentClient(), i);
      setSt(s); buzz(!!s.correct);
      store.recordAnswer({ ...s.question, uid: s.question.id }, !!s.correct); store.save();
      loadBoard();
    } catch (e: any) { Alert.alert('Could not save your answer', e.message); }
    setBusy(false);
  };

  const title = st?.status === 'started' ? fmtMs(Math.max(0, now - t0)) : 'Question of the Day';
  const done = st?.status === 'done';

  const boardView = (
    <View style={{ marginTop: 18, gap: 8 }}>
      <Text style={[type.headline, { color: c.label }]}>{"Today's fastest"}</Text>
      {(board || []).map((r, n) => {
        const you = !!me?.cloud && r.user_id === (me as any).id;
        return (
          <View key={r.user_id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
              <Fox avatar={you ? myAvatar() : r.avatar} seed={r.user_id} size={28} />
              <Text style={[type.subhead, { color: you ? c.tint : c.label, fontWeight: you ? '700' : '400' }]}>{`${n + 1}. ${r.name || 'Student'}${you ? ' (you)' : ''}`}</Text>
            </View>
            <Text style={[type.subhead, { color: c.label, fontWeight: '700', fontVariant: ['tabular-nums'] }]}>{fmtMs(r.ms)}</Text>
          </View>
        );
      })}
      <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>
        {board == null ? 'Loading...' : !board.length ? 'No right answers yet today. Be the first on the board.' : ''}
      </Text>
      {yday ? <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>{`Yesterday's fastest: ${yday.name || 'Student'} in ${fmtMs(yday.ms)}`}</Text> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ModalBar title={title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 28, gap: 12 }}>
        {err ? <Text style={[type.body, { color: c.label2 }]}>The Question of the Day could not load. Try again in a bit.</Text>
          : !st ? <Text style={[type.body, { color: c.label2 }]}>Loading...</Text>
          : !st.available ? <Text style={[type.body, { color: c.label2 }]}>No question today. Check back tomorrow.</Text>
          : st.status === 'new' ? (
            <View style={{ gap: 12, paddingTop: 12 }}>
              <View style={{ alignSelf: 'center' }}><Icon name="timer" size={56} color={c.orange} /></View>
              <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>{`Today: ${SECTION[st.section] || 'SAT'}${st.domain ? `, ${st.domain}` : ''}`}</Text>
              <Text style={[type.body, { color: c.label, textAlign: 'center' }]}>Everyone gets the same question. You get one try, and the clock starts when you press Start. Right answers go on the leaderboard, fastest first.</Text>
              {me?.cloud ? <Button title="Start Question of the Day" onPress={start} disabled={busy} />
                : <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>Sign in with an account that syncs to play, so your time counts.</Text>}
            </View>
          ) : (
            <>
              <QuestionView q={st.question as Q} chosen={done ? st.chosen : null} reveal={done} onChoose={done ? undefined : answer} />
              {done ? (
                <View style={{ backgroundColor: c.card, borderRadius: 12, padding: 14, gap: 6 }}>
                  <Text style={[type.headline, { color: st.correct ? c.good : c.red }]}>{st.correct ? `Right in ${fmtMs(st.ms)}!` : 'Not quite.'}</Text>
                  <Text style={[type.subhead, { color: c.label }]}>
                    {st.correct ? `You're #${st.rank} today.${st.beat != null ? ` You were faster than ${st.beat}% of students today.` : ''}` : "Wrong answers don't go on the leaderboard, but the explanation above shows why."}
                  </Text>
                  <Text style={[type.footnote, { color: c.label2 }]}>A new question comes out at midnight Central time.</Text>
                </View>
              ) : null}
            </>
          )}
        {st?.available && st.status !== 'started' ? boardView : null}
      </ScrollView>
    </View>
  );
}
