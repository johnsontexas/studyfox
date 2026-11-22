import { Stack } from 'expo-router';
import { useColors } from '../../lib/theme';

export const unstable_settings = { anchor: '(tabs)' };

// Signed-in app. Study modes open full screen; editing and importing open as sheets, like iOS apps do.
export default function AppLayout() {
  const c = useColors();
  const full = { presentation: 'fullScreenModal', animation: 'slide_from_bottom' } as const;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="study/[id]" options={full} />
      <Stack.Screen name="learn/[id]" options={full} />
      <Stack.Screen name="test/[id]" options={full} />
      <Stack.Screen name="match/[id]" options={full} />
      <Stack.Screen name="qotd" options={full} />
      <Stack.Screen name="classes" options={full} />
      <Stack.Screen name="class/[id]" options={full} />
      <Stack.Screen name="quiz" options={{ ...full, gestureEnabled: false }} />
      <Stack.Screen name="ap-quiz" options={{ ...full, gestureEnabled: false }} />
      <Stack.Screen name="speed" options={{ ...full, gestureEnabled: false }} />
      <Stack.Screen name="exam" options={{ ...full, gestureEnabled: false }} />
      <Stack.Screen name="results/[id]" options={full} />
      <Stack.Screen name="edit-set" options={{ presentation: 'modal' }} />
      <Stack.Screen name="import-set" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.6, 1], sheetGrabberVisible: true, contentStyle: { backgroundColor: c.bg } }} />
      <Stack.Screen name="share/[data]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="calculator" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
