import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../components/ui';
import { type, useColors } from '../lib/theme';

// Same rule as the website: under-13 sign-ups are blocked on this device (for a year; we don't ask for a birthday).
export default function TooYoung() {
  const c = useColors();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 32, paddingTop: ins.top + 90, alignItems: 'center', gap: 14 }}>
      <View style={{ width: 88, height: 88, borderRadius: 20, backgroundColor: '#1f6b47', alignItems: 'center', justifyContent: 'center' }}><Logo size={56} /></View>
      <Text style={[type.title2, { color: c.label, textAlign: 'center' }]}>Thanks for your interest in StudyFox</Text>
      <Text style={[type.body, { color: c.label2, textAlign: 'center' }]}>StudyFox is for students 13 and older, so we can't create an account for you yet. You're welcome to come back once you've turned 13.</Text>
      <Text style={[type.footnote, { color: c.label2, textAlign: 'center' }]}>We didn't keep any of the information you entered.</Text>
    </View>
  );
}
