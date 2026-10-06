// News posts from the StudyFox team. Posts are written in the website's admin console.
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, Text, View } from 'react-native';
import { Card, Empty, Screen } from '../../../../components/ui';
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
          <View style={{ gap: 8 }}>{n.body.split(/\n{2,}/).map((p, i) => <Text key={i} selectable style={[type.body, { color: c.label }]}>{p}</Text>)}</View>
        </Card>
      ))}
    </Screen>
  );
}
