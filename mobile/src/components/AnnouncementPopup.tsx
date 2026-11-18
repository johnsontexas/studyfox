// Pop-up announcement shown when the app opens (news posts with "pop up" on, from the admin console).
// Each one shows once; "Got it" or the button marks it seen. Checks again whenever the app comes back.
import { useEffect, useState } from 'react';
import { AppState, Image, Modal, ScrollView, Text, View } from 'react-native';
import { markPopupSeen, nextPopup, notificationsAllowed, setAnnouncementPush } from '../lib/announcements';
import type { NewsPost } from '../lib/cloud';
import { openLink } from '../lib/links';
import { type, useColors } from '../lib/theme';
import { Button, Icon } from './ui';

// Post bodies are plain text; [text](https://...) becomes a tappable link, like on the website.
const LINK = /\[([^\]\n]+)\]\(((?:https?:\/\/|#\/|studyfox:\/\/)[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;

export function PostBody({ body, color, link }: { body: string; color: string; link: string }) {
  return (
    <View style={{ gap: 8 }}>
      {body.split(/\n{2,}/).map((p, i) => {
        const parts: React.ReactNode[] = [];
        let last = 0;
        for (const m of p.matchAll(LINK)) {
          if (m.index! > last) parts.push(p.slice(last, m.index));
          const href = m[2] || m[3];
          parts.push(<Text key={m.index} style={{ color: link }} onPress={() => openLink(href)}>{m[1] || m[3]}</Text>);
          last = m.index! + m[0].length;
        }
        parts.push(p.slice(last));
        return <Text key={i} selectable style={[type.body, { color }]}>{parts}</Text>;
      })}
    </View>
  );
}

export default function AnnouncementPopup() {
  const c = useColors();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [askPush, setAskPush] = useState(false);

  useEffect(() => {
    const check = () => nextPopup().then(async (n) => {
      if (!n) return;
      setAskPush(!(await notificationsAllowed()));
      setPost((cur) => cur || n);
    }).catch(() => {});
    const t = setTimeout(check, 1200);
    const sub = AppState.addEventListener('change', (a) => { if (a === 'active') check(); });
    return () => { clearTimeout(t); sub.remove(); };
  }, []);

  if (!post) return null;
  const close = () => { markPopupSeen(post.id); setPost(null); };
  const cta = post.cta_url ? () => { close(); openLink(post.cta_url!.startsWith('/') ? `#${post.cta_url}` : post.cta_url!); } : null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={close} supportedOrientations={['portrait', 'landscape']}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: 22 }}>
        <View style={{ backgroundColor: c.bg, borderRadius: 26, overflow: 'hidden', maxHeight: '86%', maxWidth: 520, width: '100%', alignSelf: 'center', borderWidth: 1, borderColor: c.line }}>
          {post.image_url ? <Image source={{ uri: post.image_url }} accessibilityIgnoresInvertColors style={{ width: '100%', aspectRatio: 16 / 8 }} resizeMode="cover" />
            : <View style={{ backgroundColor: c.tint, paddingVertical: 22, alignItems: 'center' }}><Icon name="megaphone" size={34} color={c.onTint} /></View>}
          <ScrollView contentContainerStyle={{ padding: 22, gap: 10 }}>
            <Text style={[type.footnote, { color: c.tint, fontWeight: '600' }]}>ANNOUNCEMENT</Text>
            <Text style={[type.title2, { color: c.label }]}>{post.title}</Text>
            <PostBody body={post.body} color={c.label} link={c.tint} />
          </ScrollView>
          <View style={{ paddingHorizontal: 18, paddingBottom: 18, gap: 8 }}>
            {cta ? <Button title={post.cta_label || 'Open'} onPress={cta} /> : null}
            <Button title="Got it" kind={cta ? 'gray' : 'filled'} size={cta ? 'medium' : 'large'} onPress={close} />
            {askPush ? <Button title="Notify me about announcements" kind="plain" size="small" icon="bell" onPress={async () => { setAskPush(false); await setAnnouncementPush(true); }} /> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
