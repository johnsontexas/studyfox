// Desmos graphing calculator (the one built into the digital SAT). Desmos is itself a web app, so it runs
// in a web view; lessons can preload their example expressions.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '../../components/AppText';
import { WebView } from 'react-native-webview';
import { Segmented } from '../../components/ui';
import { DESMOS_KEY } from '../../lib/shared';
import { type, useColors, useScheme } from '../../lib/theme';

export default function Calculator() {
  const c = useColors();
  const scheme = useScheme();
  const { e, title } = useLocalSearchParams<{ e?: string; title?: string }>();
  const [kind, setKind] = useState<'graphing' | 'scientific'>('graphing');
  let exprs: unknown[] = [];
  try { exprs = e ? JSON.parse(e) : []; } catch {}
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=${DESMOS_KEY}"></script>
<style>html,body{margin:0;height:100%;background:${scheme === 'dark' ? '#000' : '#fff'}}#c{position:fixed;inset:0}</style></head>
<body><div id="c"></div><script>
var el=document.getElementById('c');
if(!window.Desmos){el.innerHTML='<p style="font:17px -apple-system;padding:20px;color:#888">Could not load the Desmos calculator. Check your connection.</p>';}
else{${kind === 'scientific' ? 'Desmos.ScientificCalculator(el,{border:false});' : `var k=Desmos.GraphingCalculator(el,{keypad:true,expressions:true,settingsMenu:true,zoomButtons:true,border:false${scheme === 'dark' ? ',invertedColors:true' : ''}});
(${JSON.stringify(exprs)}).forEach(function(x,i){k.setExpression(typeof x==='string'?{id:'e'+i,latex:x}:Object.assign({id:'e'+i},x));});`}}
</script></body></html>`;

  return (
    <View style={{ flex: 1, backgroundColor: c.card }}>
      <Stack.Screen options={{
        headerShown: true, title: title || 'Calculator', headerStyle: { backgroundColor: c.card }, headerShadowVisible: false,
        headerRight: () => <Pressable hitSlop={10} onPress={() => router.back()}><Text style={[type.headline, { color: c.tint }]}>Done</Text></Pressable>,
      }} />
      {!exprs.length ? <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented options={[['graphing', 'Graphing'], ['scientific', 'Scientific']]} value={kind} onChange={setKind} /></View> : null}
      {Platform.OS === 'web'
        ? <iframe key={kind} srcDoc={html} title="Desmos" style={{ flex: 1, border: 0, width: '100%', height: '100%' } as any} />
        : <WebView key={kind + scheme} originWhitelist={['*']} source={{ html, baseUrl: 'https://studyfox.org/' }} style={{ flex: 1, backgroundColor: c.card }} />}
    </View>
  );
}
