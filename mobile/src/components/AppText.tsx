// Text and TextInput in the website's body font (Instrument Sans).
// Custom fonts ignore fontWeight on iOS, so the weight and italic in the style pick the matching font file.
// Styles that set their own fontFamily (Fraunces titles, the serif, monospace) are left alone.
import { createContext, useContext, type ComponentProps, type ComponentRef } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextStyle } from 'react-native';

const FILES: Record<string, string> = {
  '400': 'InstrumentSans_400Regular', '500': 'InstrumentSans_500Medium', '600': 'InstrumentSans_600SemiBold', '700': 'InstrumentSans_700Bold',
};

// Inside another Text, a span that sets no weight or italic keeps its parent's font (bold runs, Fraunces titles).
const Nested = createContext<string | null>(null);

export function sansFamily(style: TextStyle | undefined, parent: string | null = null): TextStyle | null {
  if (style?.fontFamily) return null;
  if (parent !== null && style?.fontWeight == null && style?.fontStyle == null) return null;
  if (parent && !parent.startsWith('InstrumentSans')) return null;
  const w = String(style?.fontWeight ?? '400');
  const n = w === 'bold' ? 700 : w === 'normal' ? 400 : Number(w) || 400;
  const key = n >= 700 ? '700' : n >= 600 ? '600' : n >= 500 ? '500' : '400';
  const file = FILES[key] + (style?.fontStyle === 'italic' ? '_Italic' : '');
  return { fontFamily: file, fontWeight: 'normal', fontStyle: 'normal' };
}

export function Text({ style, ...rest }: ComponentProps<typeof RNText>) {
  const parent = useContext(Nested);
  const flat = StyleSheet.flatten(style) ?? undefined;
  const fam = sansFamily(flat, parent);
  const mine = (fam?.fontFamily ?? flat?.fontFamily ?? parent ?? '') as string;
  return <Nested.Provider value={mine}><RNText {...rest} style={fam ? [style, fam] : style} /></Nested.Provider>;
}

export function TextInput({ style, ...rest }: ComponentProps<typeof RNTextInput>) {
  const fam = sansFamily((StyleSheet.flatten(style) ?? undefined) as TextStyle | undefined);
  return <RNTextInput {...rest} style={fam ? [style, fam] : style} />;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Text = ComponentRef<typeof RNText>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = ComponentRef<typeof RNTextInput>;
