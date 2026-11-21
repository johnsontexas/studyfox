// "Rate StudyFox" on the Today tab: stars out of 5, a few words, and whether to stay anonymous.
// Same table and rules as the website's dashboard card (js/review.js).
import { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { Text } from './AppText';
import Icon from './Icon';
import { Button, Card, Field, tap } from './ui';
import { contentClient } from '../lib/cloud';
import { openWeb } from '../lib/links';
import { loadReview, saveReview, store, SUPPORT_FORM_URL } from '../lib/shared';
import { type, useColors } from '../lib/theme';

export default function ReviewCard() {
  const c = useColors();
  const cloud = !!store.user()?.cloud;
  const [stars, setStars] = useState(0);
  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (cloud) loadReview(contentClient()).then((r: any) => { if (r) { setStars(r.stars); setBody(r.body || ''); setAnon(!!r.anonymous); setSaved(true); } }); }, [cloud]);
  const submit = async () => {
    if (!stars) return Alert.alert('Pick 1 to 5 stars first.');
    const err = await saveReview(contentClient(), { stars, body, anonymous: anon }, 'ios');
    if (err) return Alert.alert('Could not save', err);
    setSaved(true); Alert.alert('Thank you!', 'Your review is saved. You can edit it anytime.');
  };
  return (
    <Card style={{ marginHorizontal: 16, gap: 10 }}>
      <Text style={[type.headline, { color: c.label }]}>Rate StudyFox</Text>
      <Text style={[type.subhead, { color: c.label2 }]}>How is StudyFox helping you? Your review helps other students find it.</Text>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} accessibilityRole="radio" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} accessibilityState={{ checked: stars === n }} hitSlop={6} onPress={() => { tap(); setStars(n); }}>
            <Icon name={n <= stars ? 'starFill' : 'star'} size={30} color={n <= stars ? c.amber : c.label3} />
          </Pressable>
        ))}
      </View>
      <Field value={body} onChangeText={setBody} multiline maxLength={1000} placeholder="What do you like? What helped most?" style={{ minHeight: 80, backgroundColor: c.bg, borderRadius: 10 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={[type.subhead, { color: c.label, flex: 1 }]}>Stay anonymous (shows as "A StudyFox student", no name or fox)</Text>
        <Switch value={anon} onValueChange={setAnon} />
      </View>
      {cloud ? <Button title={saved ? 'Update Review' : 'Submit Review'} onPress={submit} />
        : <Text style={[type.subhead, { color: c.label2 }]}>Sign in with a synced account to leave a review.</Text>}
      <Pressable accessibilityRole="link" onPress={() => openWeb(SUPPORT_FORM_URL)}>
        <Text style={[type.subhead, { color: c.tint }]}>Found a bug or have an idea? Send it with the suggestion and bug form.</Text>
      </Pressable>
    </Card>
  );
}
