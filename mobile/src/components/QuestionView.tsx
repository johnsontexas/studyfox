// A practice question drawn natively: passage, figure, stem, and tappable answer choices.
// The question itself comes from the website's generators (js/gen), so it's identical to the site's.
// After answering, every choice can be tapped to see why it's right or wrong (js/explain.js, same notes as the
// website), followed by the hint, the step-by-step solution, and "What happened?" tags for a miss.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { choiceNotes, DIFF_LABEL, setting, store } from '../lib/shared';
import { isRight, type Q } from '../lib/questions';
import { type, useColors } from '../lib/theme';
import Icon from './Icon';
import { Rich, RichText } from './Rich';
import { tap } from './ui';

const L = (i: number) => 'ABCDE'[i];
const NO_NOTE = "This isn't the answer. Work through the explanation step by step and compare it with how you got this choice; the step where they differ is the mistake.";

/** "What happened?" chips after a miss, saved per question in store.data().mistakeTags (same as the website). */
function WhatWentWrong({ qid }: { qid: string }) {
  const c = useColors();
  const cfg = setting('question_feedback') as { ask_what_went_wrong?: boolean; mistake_tags?: string[] };
  const [cur, setCur] = useState<string | undefined>((store.data().mistakeTags || {})[qid]?.tag);
  if (!cfg.ask_what_went_wrong || !qid) return null;
  const pick = (t: string) => {
    const tags = (store.data().mistakeTags ||= {});
    if (tags[qid]?.tag === t) delete tags[qid]; else tags[qid] = { tag: t, ts: Date.now() };
    store.save(); setCur(tags[qid]?.tag); tap();
  };
  return (
    <View style={{ gap: 8 }}>
      <Text style={[type.footnote, { color: c.label2 }]}>What happened? Tagging misses shows you patterns later.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(cfg.mistake_tags || []).map((t) => (
          <Pressable key={t} onPress={() => pick(t)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: cur === t ? c.tint : c.line, backgroundColor: cur === t ? c.tintSoft : c.card }}>
            <Text style={[type.footnote, { color: cur === t ? c.tint : c.label, fontWeight: '600' }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Fold({ title, icon, children, open: start = false }: { title: string; icon: string; children: React.ReactNode; open?: boolean }) {
  const c = useColors();
  const [open, setOpen] = useState(start);
  return (
    <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => { tap(); setOpen(!open); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 }}>
        <Icon name={icon} size={17} color={c.tint} />
        <Text style={[type.headline, { color: c.label, flex: 1 }]}>{title}</Text>
        <Icon name={open ? 'down' : 'chevron'} size={14} color={c.label2} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>{children}</View> : null}
    </View>
  );
}

export default function QuestionView({ q, chosen, reveal, onChoose, bankNo, showMeta = true, review, struck, onStrike }: {
  q: Q; chosen?: number | string | null; reveal?: boolean; onChoose?: (i: number) => void; bankNo?: number | null; showMeta?: boolean; review?: boolean;
  /** Answer eliminator (practice tests): crossed-out choices, toggled with a long press. */
  struck?: number[]; onStrike?: (i: number) => void;
}) {
  const c = useColors();
  const right = reveal && isRight(q, chosen);
  const [peek, setPeek] = useState<number | null>(null);
  const answered = reveal || review;
  const notes: { why: string; auto: boolean }[] = q.type === 'mc' ? choiceNotes(q) : [];
  const fb = setting('question_feedback') as { explain_every_choice?: boolean };
  const picked = typeof chosen === 'number' ? chosen : null;
  const wrongPick = picked != null && picked !== q.answer ? notes[picked] : null;
  const extra = q as Q & { hint?: string; steps?: string[] };
  const noteFor = (i: number) => (i === q.answer ? notes[i]?.why || q.expl || '' : notes[i]?.why || NO_NOTE);
  return (
    <View style={{ gap: 16 }}>
      {showMeta ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {[bankNo ? `#${bankNo}` : null, q.skill, DIFF_LABEL[q.difficulty]].filter(Boolean).map((t) => (
            <View key={t} style={{ backgroundColor: c.fill, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={[type.caption, { color: c.label2, fontWeight: '600' }]}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {q.passage ? <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16 }}><Rich html={q.passage} variant="passage" inset={72} /></View> : null}
      {q.figure ? <Rich html={q.figure} variant="small" inset={40} /> : null}
      <Rich html={q.stem} variant="question" inset={40} />

      {q.type === 'mc' ? (
        <View style={{ gap: 10 }}>
          {q.choices!.map((ch, i) => {
            const st = reveal ? (i === q.answer ? 'right' : i === chosen ? 'wrong' : 'dim') : i === chosen ? 'picked' : '';
            const border = st === 'right' ? c.green : st === 'wrong' ? c.red : st === 'picked' ? c.tint : 'transparent';
            const bg = st === 'right' ? c.goodSoft : st === 'wrong' ? c.badSoft : c.card;
            return (
              <View key={i} style={{ gap: 6 }}>
              <Pressable disabled={answered ? false : !onChoose} accessibilityRole="button" accessibilityLabel={answered ? `Why ${L(i)} is ${i === q.answer ? 'right' : 'wrong'}` : `Choice ${L(i)}`}
                onPress={() => { tap(); if (answered) setPeek(peek === i ? null : i); else onChoose?.(i); }} onLongPress={onStrike ? () => { tap(); onStrike(i); } : undefined}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderColor: border, backgroundColor: bg, opacity: st === 'dim' || struck?.includes(i) ? 0.45 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'right' ? c.green : st === 'wrong' ? c.red : c.fill }}>
                  {st === 'right' ? <Icon name="check" size={15} color="#fff" weight="bold" /> : st === 'wrong' ? <Icon name="close" size={14} color="#fff" weight="bold" /> : <Text style={[type.subhead, { fontWeight: '700', color: c.label2 }]}>{L(i)}</Text>}
                </View>
                <View style={{ flex: 1 }}><RichText html={ch} size={17} /></View>
                {struck?.includes(i) ? <View pointerEvents="none" style={{ position: 'absolute', left: 10, right: 10, top: '50%', height: 2, backgroundColor: c.label2 }} /> : null}
                {answered && peek !== i ? <Text style={[type.caption, { color: c.label2 }]}>{i === q.answer ? '' : 'Why not?'}</Text> : null}
              </Pressable>
              {answered && peek === i ? (
                <View style={{ backgroundColor: i === q.answer ? c.goodSoft : c.badSoft, borderRadius: 14, padding: 12, gap: 4, marginHorizontal: 6 }}>
                  <Text style={[type.subhead, { fontWeight: '700', color: i === q.answer ? c.green : c.red }]}>{i === q.answer ? `${L(i)} is correct.` : `Why not ${L(i)}?`}</Text>
                  <RichText html={noteFor(i)} size={15} />
                  {notes[i]?.auto ? <Text style={[type.caption, { color: c.label2 }]}>Detected from the numbers.</Text> : null}
                </View>
              ) : null}
              </View>
            );
          })}
        </View>
      ) : reveal || review ? (
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 6 }}>
          {!review ? <Text style={[type.body, { color: c.label }]}>Your answer: <Text style={{ fontWeight: '600' }}>{chosen ? String(chosen) : 'none'}</Text></Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={[type.body, { color: c.label }]}>Correct answer:</Text><RichText html={`$${q.answerDisplay}$`} weight="600" /></View>
        </View>
      ) : (
        <Text style={[type.footnote, { color: c.label2 }]}>Type your answer below. Fractions like 3/4 and decimals like .75 both work.</Text>
      )}

      {reveal || review ? (
        <View style={{ backgroundColor: review ? c.card : right ? c.goodSoft : c.badSoft, borderRadius: 16, padding: 16, gap: 8 }}>
          <Text style={[type.headline, { color: review ? c.label : right ? c.green : c.red }]}>
            {review ? 'Explanation' : right ? 'Correct' : chosen == null || chosen === '' ? 'Skipped' : 'Not quite'}{!review && q.type === 'mc' && !right ? ` · the answer is ${L(q.answer!)}` : ''}
          </Text>
          <Rich html={q.expl} variant="small" inset={72} />
        </View>
      ) : null}

      {answered && q.type === 'mc' ? (
        <>
          {wrongPick?.why ? (
            <View style={{ backgroundColor: c.badSoft, borderRadius: 16, padding: 16, gap: 6 }}>
              <Text style={[type.headline, { color: c.red }]}>Why {L(picked!)} doesn't work</Text>
              <RichText html={wrongPick.why} size={16} />
              {wrongPick.auto ? <Text style={[type.caption, { color: c.label2 }]}>Detected from the numbers. Compare it with your work.</Text> : null}
            </View>
          ) : null}
          <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>Tap any choice to see why it's right or wrong.</Text>
          {fb.explain_every_choice && notes.some((n) => n.why) ? (
            <Fold title="Every choice explained" icon="test">
              {q.choices!.map((ch, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                  <Text style={[type.subhead, { fontWeight: '700', color: i === q.answer ? c.green : i === picked ? c.red : c.label2, width: 18 }]}>{L(i)}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <RichText html={ch} size={15} weight="600" />
                    <RichText html={i === q.answer ? notes[i].why || 'This is the answer. See the explanation above.' : notes[i].why || NO_NOTE} size={15} color={c.label2} />
                  </View>
                </View>
              ))}
            </Fold>
          ) : null}
        </>
      ) : null}
      {answered && extra.hint ? (
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 14, gap: 4, borderWidth: 1, borderColor: c.line }}>
          <Text style={[type.headline, { color: c.label }]}>Hint</Text>
          <RichText html={extra.hint} size={16} />
        </View>
      ) : null}
      {answered && Array.isArray(extra.steps) && extra.steps.length ? (
        <Fold title="Step-by-step solution" icon="test">
          {extra.steps.map((x, i) => <View key={i} style={{ flexDirection: 'row', gap: 8 }}><Text style={[type.subhead, { color: c.tint, fontWeight: '700' }]}>{i + 1}.</Text><View style={{ flex: 1 }}><RichText html={x} size={16} /></View></View>)}
        </Fold>
      ) : null}
      {reveal && !right && chosen != null && chosen !== '' && q.id ? <WhatWentWrong qid={String(q.id)} /> : null}
    </View>
  );
}
