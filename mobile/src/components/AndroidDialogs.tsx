// Android has no action sheet or text prompt, and its alerts only hold three buttons, so menus and
// prompts there use this dialog. DialogHost is mounted once in the root layout.
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View } from 'react-native';
import { Text, TextInput } from './AppText';
import { type, useColors } from '../lib/theme';

type Item = { title: string; destructive?: boolean; onPress: () => void };
type Dialog =
  | { kind: 'menu'; title?: string; items: Item[] }
  | { kind: 'prompt'; title: string; msg?: string; value: string; keyboard: 'default' | 'number-pad'; done: (v: string) => void };

let show: (d: Dialog | null) => void = () => {};
export const showMenu = (title: string | undefined, items: Item[]) => show({ kind: 'menu', title, items });
export const showPrompt = (title: string, msg: string | undefined, value: string, keyboard: 'default' | 'number-pad', done: (v: string) => void) =>
  show({ kind: 'prompt', title, msg, value, keyboard, done });

export function DialogHost() {
  const c = useColors();
  const [d, setD] = useState<Dialog | null>(null);
  const [text, setText] = useState('');
  useEffect(() => {
    show = (next) => { if (next?.kind === 'prompt') setText(next.value); setD(next); };
    return () => { show = () => {}; };
  }, []);
  const close = () => setD(null);
  const button = (label: string, onPress: () => void, color: string = c.tint) => (
    <Pressable key={label} accessibilityRole="button" onPress={onPress} android_ripple={{ color: c.sep }} style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
      <Text style={[type.body, { color }]}>{label}</Text>
    </Pressable>
  );
  return (
    <Modal visible={!!d} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable accessibilityLabel="Close" onPress={close} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable style={{ backgroundColor: c.card, borderRadius: 16, maxHeight: '80%', overflow: 'hidden' }}>
            {d?.title ? <Text style={[type.headline, { color: c.label, padding: 20, paddingBottom: 8 }]}>{d.title}</Text> : null}
            {d?.kind === 'menu' ? (
              <>
                <ScrollView>{d.items.map((i) => button(i.title, () => { close(); i.onPress(); }, i.destructive ? c.red : c.label))}</ScrollView>
                {button('Cancel', close, c.label2)}
              </>
            ) : d?.kind === 'prompt' ? (
              <>
                {d.msg ? <Text style={[type.subhead, { color: c.label2, paddingHorizontal: 20 }]}>{d.msg}</Text> : null}
                <TextInput autoFocus value={text} onChangeText={setText} keyboardType={d.keyboard} selectTextOnFocus
                  style={[type.body, { color: c.label, margin: 20, marginBottom: 4, borderBottomWidth: 2, borderBottomColor: c.tint, paddingVertical: 8 }]} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  {button('Cancel', close, c.label2)}
                  {button('OK', () => { close(); d.done(text); })}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
