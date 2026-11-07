// A practice question drawn natively: passage, figure, stem, and tappable answer choices.
// The question itself comes from the website's generators (js/gen), so it's identical to the site's.
import { Pressable, Text, View } from 'react-native';
import { DIFF_LABEL } from '../lib/shared';
import { isRight, type Q } from '../lib/questions';
import { type, useColors } from '../lib/theme';
import Icon from './Icon';
import { Rich, RichText } from './Rich';
import { tap } from './ui';

const L = (i: number) => 'ABCD'[i];

export default function QuestionView({ q, chosen, reveal, onChoose, bankNo, showMeta = true, review, struck, onStrike }: {
  q: Q; chosen?: number | string | null; reveal?: boolean; onChoose?: (i: number) => void; bankNo?: number | null; showMeta?: boolean; review?: boolean;
  /** Answer eliminator (practice tests): crossed-out choices, toggled with a long press. */
  struck?: number[]; onStrike?: (i: number) => void;
}) {
  const c = useColors();
  const right = reveal && isRight(q, chosen);
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
              <Pressable key={i} disabled={reveal || !onChoose} accessibilityRole="button" accessibilityLabel={`Choice ${L(i)}`}
                onPress={() => { tap(); onChoose?.(i); }} onLongPress={onStrike ? () => { tap(); onStrike(i); } : undefined}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderColor: border, backgroundColor: bg, opacity: st === 'dim' || struck?.includes(i) ? 0.45 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'right' ? c.green : st === 'wrong' ? c.red : c.fill }}>
                  {st === 'right' ? <Icon name="check" size={15} color="#fff" weight="bold" /> : st === 'wrong' ? <Icon name="close" size={14} color="#fff" weight="bold" /> : <Text style={[type.subhead, { fontWeight: '700', color: c.label2 }]}>{L(i)}</Text>}
                </View>
                <View style={{ flex: 1 }}><RichText html={ch} size={17} /></View>
                {struck?.includes(i) ? <View pointerEvents="none" style={{ position: 'absolute', left: 10, right: 10, top: '50%', height: 2, backgroundColor: c.label2 }} /> : null}
              </Pressable>
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
    </View>
  );
}
