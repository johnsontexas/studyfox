// Navigation stack for one tab. Each tab's main page draws its own big Fraunces header over the
// forest glow; pages you open from it get a native back bar (swipe back works) with a Fraunces title.
import { Stack } from 'expo-router';
import { fonts, useColors } from '../lib/theme';

const ROOTS = ['index', 'cards/index', 'practice/index', 'courses/index', 'me'];

export default function TabStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: !ROOTS.includes(route.name),
        headerLargeTitle: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.tint,
        headerTitleStyle: { color: c.label, fontFamily: fonts.display, fontSize: 18 },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: c.bg },
      })}
    />
  );
}
