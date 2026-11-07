// AP question bank: every AP class with its question count and progress. Same bank as studyfox.org/#/ap.
import { Stack } from 'expo-router';
import { RefreshControl } from 'react-native';
import APList, { useAPCounts } from '../../../../../../components/APList';
import { ClassesBar } from '../../../../../../components/StudyPicker';
import { Screen } from '../../../../../../components/ui';
import { useStore } from '../../../../../../lib/store-hooks';

export default function APHub() {
  useStore();
  const { counts, loading, load } = useAPCounts();
  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Stack.Screen options={{ title: 'AP Practice' }} />
      <ClassesBar where="ap" />
      <APList counts={counts} />
    </Screen>
  );
}
