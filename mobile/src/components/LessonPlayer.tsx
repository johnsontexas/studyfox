// Native interactive lesson player: the app's version of js/views/lesson-player.js. Plays a lesson's blocks
// (lessons.blocks in Supabase, format and grading in js/content/blocks.js) one screen at a time or all on
// one page, following content_settings.lesson_player. Same rules as the website: questions can gate
// Continue, wrong answers get a hint and the note for that choice, and the answer shows after max_tries.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { blocksFor, choiceNotes, gradeInput, gradeMatch, gradeMulti, gradeOrder, isQuestion, screens as splitScreens, setting, store, youtubeId } from '../lib/shared';
import { type, useColors } from '../lib/theme';
import { Rich, RichText } from './Rich';
import { Bar, Button, buzz, Icon, menu, tap } from './ui';

const L = (i: number) => 'ABCDEFGH'[i];
const shuffle = (n: number) => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const scramble = (n: number) => { if (n < 2) return [...Array(n).keys()]; let s; do s = shuffle(n); while (s.every((v, i) => v === i)); return s; };
const plain = (h: string) => String(h || '').replace(/<[^>]+>/g, '').replace(/\$/g, '').trim();

type B = any;
type S = { tries: number; done?: boolean; ok?: boolean; wrong: number[]; picked: number[]; order: number[]; right: number[]; pairing: number[]; shown: number; flipped: number[]; open?: boolean; value?: string; why?: string; last?: any };
const init = (b: B): S => ({
  tries: 0, wrong: [], picked: [], shown: 1, flipped: [],
  order: b.type === 'order' ? scramble(b.items.length) : [],
  right: b.type === 'match' ? scramble(b.pairs.length) : [],
  pairing: b.type === 'match' ? b.pairs.map(() => -1) : [],
});

export default function LessonPlayer({ lesson, lessonKey, onFinish, onScreen, footer }: { lesson: any; lessonKey: string; onFinish: () => void; onScreen?: () => void; footer?: React.ReactNode }) {
  const c = useColors();
  const cfg = setting('lesson_player') as { mode?: string; gate_questions?: boolean; max_tries?: number; show_hint_after_wrong?: boolean; explain_every_choice?: boolean; celebrate?: boolean };
  const maxTries = Math.max(1, +(cfg.max_tries ?? 1) || 1);
  const stepsMode = cfg.mode !== 'scroll';
  const { scr, flat } = useMemo(() => {
    const scr = splitScreens(blocksFor(lesson)) as { title: string; blocks: B[] }[];
    return { scr, flat: scr.flatMap((s, si) => s.blocks.map((b) => ({ b, si }))) };
  }, [lesson]);
  const [st, setSt] = useState<S[]>(() => flat.map(({ b }) => init(b)));
  const saved = (store.data().lessonState || {})[lessonKey];
  const [cur, setCur] = useState(Math.min(saved?.screen || 0, Math.max(0, scr.length - 1)));
  const [finished, setFinished] = useState(false);

  const upd = (i: number, f: (s: S) => S) => setSt((a) => a.map((s, k) => (k === i ? f({ ...s }) : s)));
  const settle = (s: S, ok: boolean) => { s.tries++; if (ok || s.tries >= maxTries) { s.done = true; s.ok = ok; buzz(ok); } else buzz(false); return s; };
  const resolved = (i: number) => !isQuestion(flat[i].b) || st[i].done;
  const ready = (si: number) => !cfg.gate_questions || flat.every((x, i) => x.si !== si || resolved(i));
  const remember = (screen: number) => { (store.data().lessonState ||= {})[lessonKey] = { screen, ts: Date.now() }; store.save(); };
  const qs = flat.map((x, i) => (isQuestion(x.b) ? i : -1)).filter((i) => i >= 0);
  const first = qs.filter((i) => st[i].done && st[i].ok && st[i].tries === 1).length;
  const right = qs.filter((i) => st[i].ok).length;

  const hint = (b: B, s: S) => b.hint && cfg.show_hint_after_wrong && s.tries > 0 && !s.done ? <Note tone="plain" title="Hint" html={b.hint} /> : null;
  const left = (s: S) => `${maxTries - s.tries} ${maxTries - s.tries === 1 ? 'try' : 'tries'} left.`;
  const verdict = (s: S) => (s.done ? <Text style={[type.headline, { color: s.ok ? c.green : c.red }]}>{s.ok ? (s.tries === 1 ? 'Correct.' : 'Got it.') : "Here's the answer."}</Text> : null);

  function Note({ tone, title, html }: { tone: 'good' | 'bad' | 'plain'; title?: string; html: string }) {
    return (
      <View style={{ backgroundColor: tone === 'good' ? c.goodSoft : tone === 'bad' ? c.badSoft : c.bg, borderRadius: 14, padding: 12, gap: 4 }}>
        {title ? <Text style={[type.subhead, { fontWeight: '700', color: tone === 'good' ? c.green : tone === 'bad' ? c.red : c.label }]}>{title}</Text> : null}
        <RichText html={html} size={16} />
      </View>
    );
  }
  function Choice({ text, state, onPress, box, disabled }: { text: string; state: '' | 'right' | 'wrong' | 'sel'; onPress: () => void; box?: boolean; disabled?: boolean; letter?: string }) {
    return (
      <Pressable disabled={disabled} accessibilityRole="button" onPress={() => { tap(); onPress(); }}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, padding: 12, borderRadius: 16, borderWidth: 2,
          borderColor: state === 'right' ? c.green : state === 'wrong' ? c.red : state === 'sel' ? c.tint : c.line,
          backgroundColor: state === 'right' ? c.goodSoft : state === 'wrong' ? c.badSoft : c.bg, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
        <View style={{ width: 26, height: 26, borderRadius: box ? 7 : 13, alignItems: 'center', justifyContent: 'center', backgroundColor: state === 'right' ? c.green : state === 'wrong' ? c.red : state === 'sel' ? c.tint : c.fill }}>
          {state ? <Icon name={state === 'wrong' ? 'close' : 'check'} size={13} color="#fff" weight="bold" /> : null}
        </View>
        <View style={{ flex: 1 }}><RichText html={text} /></View>
      </Pressable>
    );
  }

  function block(b: B, i: number) {
    const s = st[i];
    switch (b.type) {
      case 'text': return <Rich html={b.html || ''} variant="lesson" inset={40} box={c.bg} />;
      case 'callout': {
        const tone = { tip: c.tint, rule: c.indigo, warning: c.orange, example: c.blue, key: c.amber }[b.kind as string] || c.tint;
        return (
          <View style={{ borderLeftWidth: 4, borderLeftColor: tone, backgroundColor: c.bg, borderRadius: 12, padding: 14, gap: 6 }}>
            {b.title ? <RichText html={b.title} weight="700" /> : null}
            <Rich html={b.html || ''} variant="small" inset={72} />
          </View>
        );
      }
      case 'mcq': {
        const notes = choiceNotes({ choices: b.choices.map((x: B) => x.text), answer: b.answer, choiceExpl: b.choices.map((x: B) => x.why || '') });
        const last = s.wrong[s.wrong.length - 1];
        return (
          <View style={{ gap: 10 }}>
            <Rich html={b.q} variant="question" inset={56} box={c.bg} />
            {b.choices.map((x: B, k: number) => (
              <Choice key={k} text={x.text} disabled={s.done || s.wrong.includes(k)} state={s.done && k === b.answer ? 'right' : s.wrong.includes(k) ? 'wrong' : ''}
                onPress={() => upd(i, (n) => { if (k !== b.answer) n.wrong = [...n.wrong, k]; return settle(n, k === b.answer); })} />
            ))}
            {!s.done && last != null ? <Note tone="bad" title="Not quite." html={`${notes[last].why || 'Take another look.'} ${left(s)}`} /> : null}
            {hint(b, s)}{verdict(s)}
            {s.done && b.why ? <Note tone="good" html={b.why} /> : null}
            {s.done && cfg.explain_every_choice && notes.some((n: { why: string }) => n.why) ? b.choices.map((x: B, k: number) => notes[k].why ? (
              <Text key={k} style={[type.footnote, { color: c.label2 }]}><Text style={{ fontWeight: '700', color: k === b.answer ? c.green : c.label }}>{L(k)}. </Text>{plain(notes[k].why)}</Text>
            ) : null) : null}
          </View>
        );
      }
      case 'multi': {
        const g = s.last;
        return (
          <View style={{ gap: 10 }}>
            <Rich html={b.q} variant="question" inset={56} box={c.bg} />
            <Text style={[type.footnote, { color: c.label2 }]}>Select all that apply.</Text>
            {b.choices.map((x: B, k: number) => (
              <Choice key={k} box text={x.text} disabled={s.done} state={s.done ? (x.correct ? 'right' : s.picked.includes(k) ? 'wrong' : '') : s.picked.includes(k) ? 'sel' : ''}
                onPress={() => upd(i, (n) => { n.picked = n.picked.includes(k) ? n.picked.filter((v) => v !== k) : [...n.picked, k]; n.last = null; return n; })} />
            ))}
            {!s.done ? <Button title="Check" size="medium" disabled={!s.picked.length} onPress={() => upd(i, (n) => { n.last = gradeMulti(b, n.picked); return settle(n, n.last.ok); })} /> : null}
            {!s.done && g && !g.ok ? <Note tone="bad" title="Not yet." html={`${g.wrong.length ? `${g.wrong.length} of your picks ${g.wrong.length === 1 ? "doesn't" : "don't"} belong. ` : ''}${g.missed.length ? `You're missing ${g.missed.length}. ` : ''}${left(s)}`} /> : null}
            {hint(b, s)}{verdict(s)}
            {s.done && b.why ? <Note tone="good" html={b.why} /> : null}
          </View>
        );
      }
      case 'input': {
        return (
          <View style={{ gap: 10 }}>
            <Rich html={b.q} variant="question" inset={56} box={c.bg} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput value={s.value || ''} editable={!s.done} onChangeText={(v) => upd(i, (n) => { n.value = v; return n; })} autoCapitalize="none" autoCorrect={false}
                keyboardType={b.numeric ? 'numbers-and-punctuation' : 'default'} placeholder={b.placeholder || (b.numeric ? 'Your answer, like 12 or 3/4' : 'Your answer')} placeholderTextColor={c.label3}
                returnKeyType="done" onSubmitEditing={() => check()}
                style={[type.body, { flex: 1, color: c.label, backgroundColor: c.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: c.line }]} />
              {!s.done ? <Button title="Check" size="medium" onPress={() => check()} /> : null}
            </View>
            {!s.done && s.tries ? <Note tone="bad" title="Not quite." html={`${s.why || 'Check your work and try again.'} ${left(s)}`} /> : null}
            {hint(b, s)}{verdict(s)}
            {s.done && !s.ok ? <Note tone="plain" title="Answer" html={`${s.why ? `${s.why} ` : ''}${String(b.answers[0])}`} /> : null}
            {s.done && b.why ? <Note tone="good" html={b.why} /> : null}
          </View>
        );
        function check() { const v = (s.value || '').trim(); if (!v || s.done) return; upd(i, (n) => { const g = gradeInput(b, v); n.why = g.why; return settle(n, g.ok); }); }
      }
      case 'order': {
        const g = s.last;
        const move = (k: number, d: number) => upd(i, (n) => { const o = [...n.order]; [o[k], o[k + d]] = [o[k + d], o[k]]; n.order = o; n.last = null; return n; });
        return (
          <View style={{ gap: 8 }}>
            <Rich html={b.q} variant="question" inset={56} box={c.bg} />
            <Text style={[type.footnote, { color: c.label2 }]}>Use the arrows to put them in order.</Text>
            {s.order.map((v, k) => {
              const ok = (s.done || g) && v === k;
              return (
                <View key={v} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 2, borderColor: ok ? c.green : s.done ? c.red : c.line, backgroundColor: c.bg }}>
                  <Text style={[type.headline, { color: c.tint, width: 20 }]}>{k + 1}</Text>
                  <View style={{ flex: 1 }}><RichText html={b.items[v]} /></View>
                  {!s.done ? (
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <Pressable disabled={!k} hitSlop={6} onPress={() => move(k, -1)} accessibilityLabel="Move up" style={{ opacity: k ? 1 : 0.3, padding: 6 }}><Icon name="back" size={16} color={c.label} /></Pressable>
                      <Pressable disabled={k === s.order.length - 1} hitSlop={6} onPress={() => move(k, 1)} accessibilityLabel="Move down" style={{ opacity: k < s.order.length - 1 ? 1 : 0.3, padding: 6 }}><Icon name="down" size={16} color={c.label} /></Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
            {!s.done ? <Button title="Check Order" size="medium" onPress={() => upd(i, (n) => { n.last = gradeOrder(b, n.order); return settle(n, n.last.ok); })} /> : null}
            {!s.done && g ? <Note tone="bad" title={`${g.right} of ${b.items.length} are in the right spot.`} html={`The green ones are placed correctly. ${left(s)}`} /> : null}
            {hint(b, s)}{verdict(s)}
            {s.done && !s.ok ? <Note tone="plain" title="Correct order" html={b.items.map((x: string, k: number) => `${k + 1}. ${x}`).join('<br>')} /> : null}
            {s.done && b.why ? <Note tone="good" html={b.why} /> : null}
          </View>
        );
      }
      case 'match': {
        const g = s.last;
        return (
          <View style={{ gap: 8 }}>
            <Rich html={b.q} variant="question" inset={56} box={c.bg} />
            {b.pairs.map((p: string[], k: number) => {
              const mark = s.done ? (s.pairing[k] === k ? 'ok' : 'bad') : g && s.pairing[k] === k ? 'ok' : '';
              return (
                <View key={k} style={{ padding: 10, borderRadius: 14, borderWidth: 2, borderColor: mark === 'ok' ? c.green : mark === 'bad' ? c.red : c.line, backgroundColor: c.bg, gap: 6 }}>
                  <RichText html={p[0]} weight="600" />
                  {s.done ? <RichText html={b.pairs[k][1]} color={c.label2} /> : (
                    <Pressable onPress={() => menu('Match with', s.right.map((r) => ({ title: plain(b.pairs[r][1]), onPress: () => upd(i, (n) => { const pr = [...n.pairing]; pr[k] = r; n.pairing = pr; n.last = null; return n; }) })))}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[type.body, { color: c.tint, flex: 1 }]}>{s.pairing[k] >= 0 ? plain(b.pairs[s.pairing[k]][1]) : 'Choose a match'}</Text>
                      <Icon name="down" size={13} color={c.tint} />
                    </Pressable>
                  )}
                </View>
              );
            })}
            {!s.done ? <Button title="Check Matches" size="medium" disabled={s.pairing.includes(-1)} onPress={() => upd(i, (n) => { n.last = gradeMatch(b, n.pairing); return settle(n, n.last.ok); })} /> : null}
            {!s.done && g ? <Note tone="bad" title={`${g.right} of ${b.pairs.length} match.`} html={`The green ones are right. ${left(s)}`} /> : null}
            {hint(b, s)}{verdict(s)}
            {s.done && b.why ? <Note tone="good" html={b.why} /> : null}
          </View>
        );
      }
      case 'reveal': return (
        <View style={{ backgroundColor: c.bg, borderRadius: 14, padding: 14, gap: 10 }}>
          <RichText html={b.prompt || ''} />
          {s.open ? <Note tone="good" html={b.html || ''} /> : <Button title={b.label || 'Show me'} size="small" kind="tinted" style={{ alignSelf: 'flex-start' }} onPress={() => upd(i, (n) => { n.open = true; return n; })} />}
        </View>
      );
      case 'steps': return (
        <View style={{ backgroundColor: c.bg, borderRadius: 14, padding: 14, gap: 10 }}>
          {b.title ? <RichText html={b.title} weight="700" /> : null}
          {b.steps.slice(0, s.shown).map((x: string, k: number) => (
            <View key={k} style={{ flexDirection: 'row', gap: 8 }}><Text style={[type.headline, { color: c.tint }]}>{k + 1}.</Text><View style={{ flex: 1 }}><RichText html={x} /></View></View>
          ))}
          {s.shown < b.steps.length ? <Button title={`Next Step (${s.shown + 1} of ${b.steps.length})`} size="small" kind="tinted" style={{ alignSelf: 'flex-start' }} onPress={() => upd(i, (n) => { n.shown++; return n; })} /> : null}
        </View>
      );
      case 'flip': return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {b.cards.map((x: { front: string; back: string }, k: number) => {
            const on = s.flipped.includes(k);
            return (
              <Pressable key={k} onPress={() => { tap(); upd(i, (n) => { n.flipped = on ? n.flipped.filter((v) => v !== k) : [...n.flipped, k]; return n; }); }}
                style={{ flexBasis: '47%', flexGrow: 1, minHeight: 110, borderRadius: 16, padding: 14, justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: on ? c.tintSoft : c.bg, borderWidth: 1, borderColor: c.line }}>
                <RichText html={on ? x.back : x.front} style={{ textAlign: 'center' }} />
                <Text style={[type.caption, { color: c.label2 }]}>{on ? 'Tap to flip back' : 'Tap to flip'}</Text>
              </Pressable>
            );
          })}
        </View>
      );
      case 'desmos': return (
        <Pressable onPress={() => { tap(); router.push({ pathname: '/calculator', params: { e: JSON.stringify(b.expressions || []), title: lesson.title } }); }}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: c.bg, opacity: pressed ? 0.7 : 1 })}>
          <Icon name="calculator" size={22} color={c.tint} />
          <View style={{ flex: 1 }}><Text style={[type.headline, { color: c.label }]}>Try it in Desmos</Text><Text style={[type.subhead, { color: c.label2 }]}>Opens the graphing calculator with these examples</Text></View>
          <Icon name="chevron" size={13} color={c.label3} />
        </Pressable>
      );
      case 'image': return b.src ? (
        <View style={{ gap: 6 }}>
          <Image source={{ uri: b.src }} accessibilityLabel={b.alt || ''} style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: 12 }} resizeMode="contain" />
          {b.caption ? <RichText html={b.caption} size={14} color={c.label2} /> : null}
        </View>
      ) : null;
      case 'video': {
        const id = youtubeId(b.url);
        return id ? (
          <View style={{ gap: 6 }}>
            <View style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
              <WebView source={{ uri: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1` }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction style={{ flex: 1 }} />
            </View>
            {b.caption ? <RichText html={b.caption} size={14} color={c.label2} /> : null}
          </View>
        ) : null;
      }
      default: return null;
    }
  }

  const screenView = (si: number) => (
    <View key={si} style={{ gap: 18 }}>
      {scr[si].title ? <Text style={[type.title3, { color: c.label }]}>{scr[si].title}</Text> : null}
      {flat.map((x, i) => (x.si === si ? (
        <View key={i} style={isQuestion(x.b) ? { backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 14 } : undefined}>{block(x.b, i)}</View>
      ) : null))}
    </View>
  );

  const finish = () => { setFinished(true); remember(0); onFinish(); onScreen?.(); };

  if (finished) {
    return (
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 30 }}>
        {cfg.celebrate ? <Icon name="trophy" size={48} color={c.amber} /> : null}
        <Text style={[type.title2, { color: c.label }]}>Lesson complete</Text>
        {qs.length ? <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>{first} of {qs.length} questions right on the first try{right > first ? `, ${right - first} more after a retry` : ''}.</Text> : null}
        {footer}
        <Button title="Replay Lesson" kind="plain" size="small" icon="reset" onPress={() => { setSt(flat.map(({ b }) => init(b))); setCur(0); setFinished(false); remember(0); }} />
      </View>
    );
  }

  if (!stepsMode) {
    return (
      <View style={{ gap: 24 }}>
        {scr.map((_, k) => screenView(k))}
        <Button title="Finish Lesson" icon="check" onPress={finish} />
      </View>
    );
  }

  const ok = ready(cur), last = cur === scr.length - 1;
  return (
    <View style={{ gap: 18 }}>
      {scr.length > 1 ? <Bar value={(cur + 1) / scr.length} /> : null}
      {screenView(cur)}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        {cur ? <Button title="" icon="back" kind="gray" style={{ width: 56 }} onPress={() => { setCur(cur - 1); onScreen?.(); }} /> : null}
        <Button style={{ flex: 1 }} disabled={!ok} icon={last ? 'check' : 'forward'} title={ok ? (last ? 'Finish Lesson' : 'Continue') : 'Answer to Continue'}
          onPress={() => { if (!ok) return; if (last) return finish(); setCur(cur + 1); remember(cur + 1); onScreen?.(); }} />
      </View>
    </View>
  );
}
