// The website's formula sheet (js/views/formulas.js), drawn natively.
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Rich } from '../../../../../components/Rich';
import { Button, Screen } from '../../../../../components/ui';
import { captureView } from '../../../../../lib/capture';
import { formulasView } from '../../../../../lib/shared';

export default function Formulas() {
  // Drop the website's title row (title, buttons); the native header shows the title.
  const html = useMemo(() => captureView(formulasView).replace(/^[\s\S]*?<\/div><\/div>/, ''), []);
  return (
    <>
      <Stack.Screen options={{ title: 'Formula Sheet' }} />
      <Screen>
        <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 16 }}>
          <Button title="Study as Flashcards" icon="cards" kind="tinted" onPress={() => router.push('/study/builtin-math-formulas')} />
          <Rich html={html} variant="small" inset={32} />
        </View>
      </Screen>
    </>
  );
}
