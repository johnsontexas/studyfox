// Floating tab bar in StudyFox style: a rounded glass bar with the website's ledge edge. The active tab
// grows into a forest-green pill with its label; tapping it again returns to the top of that tab.
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type, useColors } from '../lib/theme';
import Icon from './Icon';
import { tap } from './ui';

const TABS: Record<string, [string, string]> = {
  '(today)': ['Today', 'home'], '(cards)': ['Cards', 'cards'], '(practice)': ['Practice', 'bolt'], '(courses)': ['Courses', 'book'], '(me)': ['Me', 'person'],
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const ins = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(ins.bottom - 6, 10), alignItems: 'center' }}>
      <View style={{ borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: c.line, borderBottomWidth: 3, borderBottomColor: c.ledge, boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
        <BlurView intensity={Platform.OS === 'ios' ? 70 : 0} tint={c.dark ? 'dark' : 'light'} style={{ flexDirection: 'row', padding: 6, gap: 2, backgroundColor: Platform.OS === 'ios' ? (c.dark ? 'rgba(18,26,21,0.72)' : 'rgba(255,255,255,0.78)') : c.card }}>
          {state.routes.map((route, i) => {
            const [label, icon] = TABS[route.name] || [route.name, 'home'];
            const on = state.index === i;
            const press = () => {
              tap();
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              const inner = (route as { state?: { key: string; index?: number } }).state;
              if (on) { if (inner?.key && (inner.index ?? 0) > 0) navigation.dispatch({ type: 'POP_TO_TOP', target: inner.key }); }
              else if (!e.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <Animated.View key={route.key} layout={LinearTransition.duration(220)}>
                <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} onPress={press}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, height: 46, paddingHorizontal: on ? 16 : 14, borderRadius: 23, backgroundColor: on ? c.tint : 'transparent', opacity: pressed ? 0.7 : 1 })}>
                  <Icon name={icon} size={20} color={on ? c.onTint : c.label2} weight={on ? 'semibold' : 'regular'} />
                  {on ? <Text style={[type.subhead, { fontWeight: '700', color: c.onTint }]}>{label}</Text> : null}
                </Pressable>
              </Animated.View>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
