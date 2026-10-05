// StudyFox building blocks, modeled on studyfox.org: cards with a thin border and a solid "ledge"
// bottom edge, Fraunces headlines with an amber-underlined accent word, forest-green pill buttons,
// branded segmented controls, and haptics.
import * as Haptics from 'expo-haptics';
import { Children, Fragment, isValidElement, useState, type ReactNode } from 'react';
import {
  ActionSheetIOS, ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View,
  type ScrollViewProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { fonts, type, useColors } from '../lib/theme';
import Backdrop from './Backdrop';
import Icon, { type IconName } from './Icon';

export { Icon };

// ---- Haptics ----
const native = Platform.OS !== 'web';
export const tap = () => { if (native) Haptics.selectionAsync(); };
export const thud = () => { if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
export const buzz = (ok: boolean) => { if (native) Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error); };

// ---- Alerts and menus ----
export function confirm(title: string, msg: string, ok: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${msg}`));
  return new Promise((res) => Alert.alert(title, msg, [{ text: 'Cancel', style: 'cancel', onPress: () => res(false) }, { text: ok, style: 'destructive', onPress: () => res(true) }]));
}
export type MenuItem = { title: string; destructive?: boolean; onPress: () => void };
/** Native action sheet on iOS. */
export function menu(title: string | undefined, items: MenuItem[]) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { title, options: [...items.map((i) => i.title), 'Cancel'], cancelButtonIndex: items.length, destructiveButtonIndex: items.map((i, k) => (i.destructive ? k : -1)).filter((k) => k >= 0) },
      (k) => items[k]?.onPress(),
    );
  } else if (Platform.OS === 'web') {
    const k = window.prompt(`${title || ''}\n${items.map((i, n) => `${n + 1}. ${i.title}`).join('\n')}\nType a number:`);
    if (k) items[+k - 1]?.onPress();
  } else {
    Alert.alert(title || '', undefined, [...items.slice(0, 2).map((i) => ({ text: i.title, onPress: i.onPress, style: i.destructive ? 'destructive' as const : 'default' as const })), { text: 'Cancel', style: 'cancel' }]);
  }
}

// ---- Text ----
type TP = { children?: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; selectable?: boolean; color?: string; center?: boolean };
const makeText = (variant: keyof typeof type, tone: 'label' | 'label2' = 'label') => function T({ children, style, numberOfLines, selectable, color, center }: TP) {
  const c = useColors();
  return <Text selectable={selectable} numberOfLines={numberOfLines} style={[type[variant], { color: color || c[tone] }, center && { textAlign: 'center' }, style]}>{children}</Text>;
};
export const LargeTitle = makeText('largeTitle');
export const Title1 = makeText('title1');
export const Title2 = makeText('title2');
export const Title3 = makeText('title3');
export const Headline = makeText('headline');
export const Body = makeText('body');
export const Callout = makeText('callout');
export const Subhead = makeText('subhead', 'label2');
export const Footnote = makeText('footnote', 'label2');
export const Caption = makeText('caption', 'label2');

/** The website's hand-drawn amber underline. */
export function Scribble({ width, color }: { width: number; color?: string }) {
  return (
    <Svg width={width} height={10} viewBox="0 0 200 12" preserveAspectRatio="none" style={{ marginTop: -4 }}>
      <Path d="M2 8c40-6 90-7 196-3" fill="none" stroke={color || '#f2b33d'} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}

/** Big Fraunces page title with an italic accent word underlined in amber, like the website's headlines. */
export function PageHeader({ title, accent, subtitle, right, eyebrow }: { title: string; accent?: string; subtitle?: string; right?: ReactNode; eyebrow?: string }) {
  const c = useColors();
  const [w, setW] = useState(0);
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={[type.eyebrow, { color: c.tint, marginBottom: 4 }]}>{eyebrow}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Text style={[type.largeTitle, { color: c.label }]}>{title}{accent ? ' ' : ''}</Text>
            {accent ? (
              <View>
                <Text onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[type.largeTitle, { fontFamily: fonts.displayItalic, color: c.tint }]}>{accent}</Text>
                {w ? <Scribble width={w} /> : null}
              </View>
            ) : null}
          </View>
        </View>
        {right}
      </View>
      {subtitle ? <Text style={[type.subhead, { color: c.label2, marginTop: 6 }]}>{subtitle}</Text> : null}
    </View>
  );
}

// ---- Screens ----
type ScreenProps = ScrollViewProps & { children: ReactNode; header?: Parameters<typeof PageHeader>[0]; backdrop?: boolean };
/**
 * Scrolling page. With `header`, it's a tab's main page: the forest glow and drifting shapes behind a
 * big Fraunces title. Without it, it sits under a native navigation bar (detail pages).
 */
export function Screen({ children, style, header, backdrop, ...rest }: ScreenProps) {
  const c = useColors();
  const ins = useSafeAreaInsets();
  const top = !!header;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {top || backdrop ? <Backdrop /> : null}
      <ScrollView
        contentInsetAdjustmentBehavior={top ? 'never' : 'automatic'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={{ flex: 1 }}
        contentContainerStyle={[{ paddingBottom: top ? 120 : 40, paddingTop: top ? ins.top + 8 : Platform.OS === 'web' ? 12 : 0 }, style]}
        {...rest}>
        {header ? <PageHeader {...header} /> : null}
        {children}
      </ScrollView>
    </View>
  );
}

// ---- Cards and lists ----
/** The website's card: surface, thin border, solid bottom ledge. */
export const cardStyle = (c: ReturnType<typeof useColors>, radius = 18): ViewStyle => ({
  backgroundColor: c.card, borderRadius: radius, borderWidth: 1, borderColor: c.line, borderBottomWidth: 3, borderBottomColor: c.ledge,
});

export function Section({ header, footer, children, style }: { header?: string; footer?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const kids = Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ marginHorizontal: 16, marginTop: header ? 26 : 16 }, style]}>
      {header ? <Text style={[type.title3, { fontSize: 19, color: c.label, marginLeft: 4, marginBottom: 9 }]}>{header}</Text> : null}
      <View style={[cardStyle(c), { overflow: 'hidden' }]}>
        {kids.map((k, i) => (
          <Fragment key={i}>
            {i > 0 && !(isValidElement(k) && (k.props as any)?.noSep) ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: isValidElement(k) && (k.props as any)?.icon ? 62 : 16 }} /> : null}
            {k}
          </Fragment>
        ))}
      </View>
      {footer ? (typeof footer === 'string' ? <Text style={[type.footnote, { color: c.label2, marginHorizontal: 6, marginTop: 8 }]}>{footer}</Text> : footer) : null}
    </View>
  );
}

/** Colored rounded-square icon. */
export function IconTile({ name, color, size = 32 }: { name: IconName | string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.55} color="#fff" weight="semibold" />
    </View>
  );
}

type RowProps = {
  title: ReactNode; subtitle?: ReactNode; value?: ReactNode; icon?: IconName | string; iconColor?: string;
  onPress?: () => void; accessory?: 'chevron' | 'check' | 'none' | ReactNode; destructive?: boolean; tint?: boolean; noSep?: boolean; right?: ReactNode; numberOfLines?: number;
};
export function Row({ title, subtitle, value, icon, iconColor, onPress, accessory, destructive, tint, right, numberOfLines = 2 }: RowProps) {
  const c = useColors();
  const acc = accessory ?? (onPress ? 'chevron' : 'none');
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingVertical: subtitle ? 11 : 12, paddingLeft: 16, paddingRight: 14, gap: 14 }}>
      {icon ? <IconTile name={icon} color={iconColor || c.tint} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {typeof title === 'string' ? <Text numberOfLines={numberOfLines} style={[type.body, { fontWeight: '500', color: destructive ? c.bad : tint ? c.tint : c.label }]}>{title}</Text> : title}
        {subtitle ? (typeof subtitle === 'string' ? <Text numberOfLines={3} style={[type.subhead, { color: c.label2 }]}>{subtitle}</Text> : subtitle) : null}
      </View>
      {value != null ? (typeof value === 'string' || typeof value === 'number' ? <Text style={[type.body, { color: c.label2 }]}>{value}</Text> : value) : null}
      {right}
      {acc === 'chevron' ? <Icon name="chevron" size={13} color={c.label3} weight="bold" /> : acc === 'check' ? <Icon name="check" size={17} color={c.tint} weight="semibold" /> : acc !== 'none' ? acc : null}
    </View>
  );
  if (!onPress) return body;
  return <Pressable accessibilityRole="button" onPress={() => { tap(); onPress(); }} style={({ pressed }) => ({ backgroundColor: pressed ? c.fill : 'transparent' })}>{body}</Pressable>;
}

export function SwitchRow({ title, subtitle, value, onChange, icon, iconColor }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; icon?: string; iconColor?: string }) {
  const c = useColors();
  return <Row title={title} subtitle={subtitle} icon={icon} iconColor={iconColor} accessory="none" right={<Switch value={value} onValueChange={(v) => { tap(); onChange(v); }} trackColor={{ true: c.tint }} />} />;
}

// ---- Buttons ----
type BtnProps = { title: string; onPress?: () => void; kind?: 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive' | 'amber'; icon?: IconName | string; size?: 'small' | 'medium' | 'large'; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle> };
export function Button({ title, onPress, kind = 'filled', icon, size = 'large', disabled, loading, style }: BtnProps) {
  const c = useColors();
  const bg = { filled: c.tint, tinted: c.tintSoft, gray: c.card, plain: 'transparent', destructive: c.badSoft, amber: c.amber }[kind];
  const fg = { filled: c.onTint, tinted: c.tint, gray: c.label, plain: c.tint, destructive: c.bad, amber: c.onAmber }[kind];
  const h = { small: 36, medium: 46, large: 54 }[size];
  const ledge = kind === 'filled' || kind === 'amber' ? 'rgba(0,0,0,0.22)' : kind === 'gray' ? c.ledge : 'transparent';
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={() => { tap(); onPress?.(); }}
      style={({ pressed }) => [{
        height: h, borderRadius: size === 'small' ? h / 2 : 16, paddingHorizontal: size === 'small' ? 14 : 20, backgroundColor: bg,
        borderWidth: kind === 'gray' ? 1 : 0, borderColor: c.line, borderBottomWidth: pressed || kind === 'plain' || kind === 'tinted' || kind === 'destructive' ? (kind === 'gray' ? 1 : 0) : 3, borderBottomColor: ledge,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: disabled ? 0.4 : 1, transform: [{ translateY: pressed && ledge !== 'transparent' ? 2 : 0 }],
      }, style]}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={size === 'small' ? 14 : 17} color={fg} weight="semibold" /> : null}
      {title ? <Text style={[size === 'small' ? type.subhead : type.headline, { color: fg, fontWeight: '700' }]}>{title}</Text> : null}
    </Pressable>
  );
}

/** Round icon button for toolbars and headers. */
export function IconButton({ name, onPress, label, color, size = 22, filled }: { name: IconName | string; onPress: () => void; label: string; color?: string; size?: number; filled?: boolean }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: filled ? 9 : 2, borderRadius: 999, backgroundColor: filled ? c.card : 'transparent', borderWidth: filled ? 1 : 0, borderColor: c.line })}>
      <Icon name={name} size={size} color={color || c.tint} />
    </Pressable>
  );
}

// ---- Controls ----
/** Segmented control in the website's style: the selected option is a raised card. */
export function Segmented<T extends string | number>({ options, value, onChange, style }: { options: [T, string][]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: c.fill2, borderRadius: 13, padding: 3, gap: 3 }, style]}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { if (!on) { tap(); onChange(v); } }}
            style={{ flex: 1, minHeight: 34, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.card : 'transparent', borderWidth: on ? 1 : 0, borderColor: c.line, borderBottomWidth: on ? 2 : 0, borderBottomColor: c.ledge }}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[type.subhead, { fontWeight: on ? '700' : '500', color: on ? c.label : c.label2 }]}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ style, ...props }: TextInputProps) {
  const c = useColors();
  return <TextInput placeholderTextColor={c.label3} {...props} style={[type.body, { color: c.label, minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 }, style]} />;
}

/** Rounded search field (pages have their own titles instead of a navigation bar). */
export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  const c = useColors();
  return (
    <View style={[cardStyle(c, 14), { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginHorizontal: 16, marginTop: 12 }]}>
      <Icon name="search" size={17} color={c.label2} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={c.label2} clearButtonMode="while-editing" autoCorrect={false}
        style={[type.body, { flex: 1, color: c.label, paddingVertical: 11 }]} />
    </View>
  );
}

export function Bar({ value, color, height = 6, track }: { value: number; color?: string; height?: number; track?: string }) {
  const c = useColors();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || c.fill2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, borderRadius: height, backgroundColor: color || c.tint }} />
    </View>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const c = useColors();
  const base: ViewStyle = { ...cardStyle(c), padding: 16 };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return <Pressable accessibilityRole="button" onPress={() => { tap(); onPress(); }} style={({ pressed }) => [base, { transform: [{ translateY: pressed ? 2 : 0 }], borderBottomWidth: pressed ? 1 : 3 }, style]}>{children}</Pressable>;
}

export function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={[type.number, { fontSize: 26, lineHeight: 30, color: color || c.label, fontVariant: ['tabular-nums'] }]}>{value}</Text>
      <Text style={[type.caption, { color: c.label2, textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

export function Pill({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={() => { tap(); onPress?.(); }}
      style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999, backgroundColor: on ? c.tint : c.card, borderWidth: 1, borderColor: on ? c.tint : c.line, opacity: pressed ? 0.75 : 1 })}>
      <Text style={[type.subhead, { fontWeight: '700', color: on ? c.onTint : c.label }]}>{label}</Text>
    </Pressable>
  );
}

/** Small rounded label, like the website's .tag. */
export function Tag({ label, tone = 'brand' }: { label: string; tone?: 'brand' | 'amber' | 'plain' }) {
  const c = useColors();
  const [bg, fg] = tone === 'amber' ? [c.amberSoft, c.dark ? c.amber : '#8a5a00'] : tone === 'plain' ? [c.fill2, c.label2] : [c.tintSoft, c.tint];
  return <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }}><Text style={[type.caption, { fontWeight: '700', color: fg }]}>{label}</Text></View>;
}

export function Empty({ icon, title, body, children }: { icon?: IconName | string; title: string; body?: string; children?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 36, paddingHorizontal: 32 }}>
      {icon ? <Icon name={icon} size={44} color={c.label3} /> : null}
      <Text style={[type.title3, { color: c.label, textAlign: 'center' }]}>{title}</Text>
      {body ? <Text style={[type.subhead, { color: c.label2, textAlign: 'center' }]}>{body}</Text> : null}
      {children}
    </View>
  );
}

// The StudyFox fox mark (same paths as the website's logo).
export const LOGO_XML = '<svg viewBox="-2 2 70 62"><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M8 6l16 14h16l16-14-2 30-22 24-22-24z" fill="#f9a825"/><path d="M10 36l22 24 22-24-12-4-10 9-10-9z" fill="#fff8ec"/><path d="M26.5 54h11L32 60z" fill="#1a1a1a"/><circle cx="23" cy="28" r="3" fill="#1a1a1a"/><circle cx="41" cy="28" r="3" fill="#1a1a1a"/></svg>';
export const Logo = ({ size = 56 }: { size?: number }) => <SvgXml xml={LOGO_XML} width={size} height={size * 0.886} />;
