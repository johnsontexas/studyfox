// Privacy Policy and Terms of Use from the website's js/views/legal.js, drawn natively.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Rich } from '../../components/Rich';
import { captureView } from '../../lib/capture';
import { privacyView, termsView } from '../../lib/shared';
import { type, useColors } from '../../lib/theme';

export default function Doc() {
  const c = useColors();
  const { name } = useLocalSearchParams<{ name: string }>();
  const html = useMemo(() => captureView(name === 'privacy' ? privacyView : termsView), [name]);
  return (
    <View style={{ flex: 1, backgroundColor: c.card }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 }}>
        <Pressable hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}><Text style={[type.headline, { color: c.tint }]}>Done</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Rich html={html} variant="small" inset={40} box={c.bg} />
      </ScrollView>
    </View>
  );
}
