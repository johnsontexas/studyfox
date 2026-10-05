// Opened from a studyfox://share/... link.
import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { Empty } from '../../../components/ui';
import SharedSet from '../../../components/SharedSet';
import { parseShared } from '../../../lib/cards';
import { useColors } from '../../../lib/theme';

export default function SharedLink() {
  const c = useColors();
  const { data } = useLocalSearchParams<{ data: string }>();
  const set = parseShared(String(data || ''));
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
      {set ? <SharedSet set={set} /> : <Empty icon="link" title="This link is broken" body="It may have been cut off when it was copied." />}
    </ScrollView>
  );
}
