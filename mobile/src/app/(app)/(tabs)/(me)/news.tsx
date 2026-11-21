// News posts from the StudyFox team. Posts are written in the website's admin console.
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl } from 'react-native';
import { Text } from '../../../../components/AppText';
import { PostBody } from '../../../../components/AnnouncementPopup';
import { Button, Card, Empty, Screen } from '../../../../components/ui';
import { openLink } from '../../../../lib/links';
import { fetchNews, type NewsPost } from '../../../../lib/cloud';
import { type, useColors } from '../../../../lib/theme';

export default function News() {
  const c = useColors();
  const [posts, setPosts] = useState<NewsPost[] | null>(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(() => { setLoading(true); fetchNews().then(setPosts, () => setPosts([])).finally(() => setLoading(false)); }, []);
  useEffect(load, [load]);
  return (
    <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Stack.Screen options={{ title: 'News' }} />
      {posts && !posts.length ? <Empty icon="news" title="No news yet" body="New courses, features, and announcements show up here." /> : null}
      {(posts || []).map((n) => (
        <Card key={n.id} style={{ marginHorizontal: 16, marginBottom: 12, gap: 6, overflow: 'hidden' }}>
          {n.image_url ? <Image source={{ uri: n.image_url }} accessibilityIgnoresInvertColors style={{ marginTop: -16, marginHorizontal: -16, marginBottom: 6, aspectRatio: 16 / 7 }} resizeMode="cover" /> : null}
          <Text style={[type.footnote, { color: n.pinned ? c.tint : c.label2 }]}>{n.pinned ? 'Pinned · ' : ''}{new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          <Text style={[type.headline, { color: c.label }]}>{n.title}</Text>
          <PostBody body={n.body} color={c.label} link={c.tint} />
          {n.cta_url ? <Button title={n.cta_label || 'Open'} size="small" kind="tinted" style={{ alignSelf: 'flex-start', marginTop: 4 }} onPress={() => openLink(n.cta_url!.startsWith('/') ? `#${n.cta_url}` : n.cta_url!)} /> : null}
        </Card>
      ))}
    </Screen>
  );
}
