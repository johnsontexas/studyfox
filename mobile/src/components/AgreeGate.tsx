// Blocking prompt when the Terms or Privacy Policy change (TERMS_VERSION in js/views/legal.js),
// the same rule as the website's requireAgreement().
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { cloudSignOut } from '../lib/cloud';
import { store, TERMS_VERSION } from '../lib/shared';
import { type, useColors } from '../lib/theme';
import { Button, Section, SwitchRow } from './ui';

export default function AgreeGate() {
  const c = useColors();
  const [ok, setOk] = useState(false);
  const updated = !!store.data().settings.legal;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.4)', justifyContent: 'center', padding: 24 }}>
      <View style={{ backgroundColor: c.bg, borderRadius: 26, paddingVertical: 22, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 22, gap: 6 }}>
          <Text style={[type.title3, { color: c.label, textAlign: 'center' }]}>{updated ? 'We updated our Terms' : 'One more step'}</Text>
          <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>{updated ? 'Please review and accept the new Terms of Use and Privacy Policy to keep using StudyFox.' : 'Please review and accept our Terms of Use and Privacy Policy.'}</Text>
          <Text style={[type.subhead, { textAlign: 'center' }]}><Text style={{ color: c.tint }} onPress={() => router.push('/doc/terms')}>Terms of Use</Text><Text style={{ color: c.label2 }}>  ·  </Text><Text style={{ color: c.tint }} onPress={() => router.push('/doc/privacy')}>Privacy Policy</Text></Text>
        </View>
        <Section style={{ marginTop: 12 }}><SwitchRow title="I'm 13 or older and I agree" value={ok} onChange={setOk} /></Section>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 6 }}>
          <Button title="Continue" disabled={!ok} onPress={() => { store.data().settings.legal = { version: TERMS_VERSION, at: new Date().toISOString() }; store.save(); }} />
          <Button title="Sign Out" kind="plain" size="medium" onPress={async () => { if (store.user()?.cloud) await cloudSignOut(); store.logout(); }} />
        </View>
      </View>
    </View>
  );
}
