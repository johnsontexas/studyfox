// About StudyFox and its creator (same text as studyfox.org/#/about).
import { Stack } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Button, Card, Screen } from '../../../../components/ui';
import { openWeb } from '../../../../lib/links';
import { BETTERU_URL, CREATOR, CREATOR_SITE, INSTAGRAM, STUDYFOX_INSTAGRAM } from '../../../../lib/shared';
import { type, useColors } from '../../../../lib/theme';

export default function About() {
  const c = useColors();
  const p = [type.body, { color: c.label }];
  return (
    <Screen>
      <Stack.Screen options={{ title: 'About' }} />
      <View style={{ paddingHorizontal: 16, gap: 14, paddingTop: 8 }}>
        <Text style={p}>Good study material shouldn't cost money. StudyFox gives every high school student free courses for every AP class, AP practice questions, SAT and ACT prep, and flashcards, with no ads and no paywalls.</Text>
        <Card style={{ gap: 10, alignItems: 'flex-start' }}>
          <Image source={{ uri: `${CREATOR_SITE}/images/Media/portrait.png` }} accessibilityLabel={`Portrait of ${CREATOR}`} style={{ width: 120, height: 120, borderRadius: 16 }} />
          <Text style={[type.title3, { color: c.label }]}>About me</Text>
          <Text selectable style={p}>Hi, I'm {CREATOR}, a student at Strake Jesuit College Prep in Houston, Texas, class of 2027. I'm interested in neuroscience and brain imaging. I did neuroethics research at Georgetown and now build computational models based on fruit fly neural circuits. I'm also vice captain of my cross country team.</Text>
          <Text selectable style={p}>I built StudyFox because I wanted one place where any student could learn a class, practice it, and get ready for the test, without paying for it.</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button title="johnsontexas.com" size="small" kind="tinted" onPress={() => openWeb(CREATOR_SITE)} />
            <Button title={`@${INSTAGRAM}`} size="small" kind="gray" onPress={() => openWeb(`https://instagram.com/${INSTAGRAM}`)} />
          </View>
        </Card>
        <Card style={{ gap: 8 }}>
          <Text style={[type.title3, { color: c.label }]}>Built with help from BetterU LLC</Text>
          <Text style={p}>StudyFox was made with help from BetterU LLC, a small software company I co-founded that builds apps for getting better together with your friends.</Text>
          <Button title="betterullc.com" size="small" kind="tinted" onPress={() => openWeb(BETTERU_URL)} />
        </Card>
        <Button title={`Follow @${STUDYFOX_INSTAGRAM} on Instagram`} icon="instagram" onPress={() => openWeb(`https://instagram.com/${STUDYFOX_INSTAGRAM}`)} />
      </View>
    </Screen>
  );
}
