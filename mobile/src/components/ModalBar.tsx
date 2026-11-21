// Top bar for full-screen study modes: close button, title, and an optional action on the right.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type, useColors } from '../lib/theme';
import { Bar, IconButton } from './ui';

export default function ModalBar({ title, right, progress, onClose }: { title?: string; right?: ReactNode; progress?: number; onClose?: () => void }) {
  const c = useColors();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: ins.top + 4, paddingHorizontal: 16, paddingBottom: 10, gap: 10, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 36 }}>
        <View style={{ width: 70 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' }}>
            <IconButton name="close" label="Close" size={15} color={c.label2} onPress={onClose || (() => router.back())} />
          </View>
        </View>
        <Text numberOfLines={1} style={[type.headline, { flex: 1, textAlign: 'center', color: c.label }]}>{title}</Text>
        <View style={{ width: 70, alignItems: 'flex-end' }}>{right}</View>
      </View>
      {progress != null ? <Bar value={progress} /> : null}
    </View>
  );
}
