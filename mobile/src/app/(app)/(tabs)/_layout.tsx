import { Tabs } from 'expo-router';
import TabBar from '../../../components/TabBar';
import { useColors } from '../../../lib/theme';

export const unstable_settings = { initialRouteName: '(today)' };

// Five tabs with StudyFox's own floating tab bar (components/TabBar.tsx).
export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="(today)" />
      <Tabs.Screen name="(cards)" />
      <Tabs.Screen name="(practice)" />
      <Tabs.Screen name="(courses)" />
      <Tabs.Screen name="(me)" />
    </Tabs>
  );
}
