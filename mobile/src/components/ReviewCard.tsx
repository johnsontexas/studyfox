// "Review StudyFox" on the Today tab: sends students to Trustpilot for an honest, public review.
// Same link as the website's dashboard card (REVIEW_URL in js/config.js).
import { Pressable } from 'react-native';
import { Text } from './AppText';
import { Button, Card } from './ui';
import { openWeb } from '../lib/links';
import { REVIEW_URL, SUPPORT_FORM_URL } from '../lib/shared';
import { type, useColors } from '../lib/theme';

export default function ReviewCard() {
  const c = useColors();
  return (
    <Card style={{ marginHorizontal: 16, gap: 10 }}>
      <Text style={[type.headline, { color: c.label }]}>Review StudyFox</Text>
      <Text style={[type.subhead, { color: c.label2 }]}>Tell other students what you honestly think. Reviews are on Trustpilot, an independent site, so StudyFox can't edit or remove them.</Text>
      <Button title="Write a Review on Trustpilot" onPress={() => openWeb(REVIEW_URL)} />
      <Pressable accessibilityRole="link" onPress={() => openWeb(SUPPORT_FORM_URL)}>
        <Text style={[type.subhead, { color: c.tint }]}>Found a bug or have an idea? Send it with the suggestion and bug form.</Text>
      </Pressable>
    </Card>
  );
}
