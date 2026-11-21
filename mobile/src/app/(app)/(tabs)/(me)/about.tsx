// About StudyFox, its team, and its socials. Same source as studyfox.org/#/about: the page text is
// editable in Supabase (site_pages 'about', admin console > Content > People and pages) and contributors
// come from the contributors table; the built-in copy below shows until those load.
// The app never shows donation links or asks for donations (App Store guideline 3.1.1).
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { contentClient } from '../../../../lib/cloud';
import { Image, View } from 'react-native';
import { Text } from '../../../../components/AppText';
import { Rich } from '../../../../components/Rich';
import { Button, Card, Screen } from '../../../../components/ui';
import { openWeb } from '../../../../lib/links';
import { bySection, BETTERU_URL, CREATOR, CREATOR_SITE, INSTAGRAM, PEOPLE, SITE_URL, socials, store, topSharers, withRanks } from '../../../../lib/shared';
import { useStore } from '../../../../lib/store-hooks';
import { type, useColors } from '../../../../lib/theme';

const abs = (u: string) => (!u ? '' : /^https?:\/\//.test(u) ? u : `${SITE_URL.replace(/\/$/, '')}/${u.replace(/^\//, '')}`);
// Drop the website's {{icon:name}} markers and any paragraph that mentions donating.
const clean = (html: string) => String(html || '').replace(/\{\{icon:[a-z-]+\}\}/g, '').replace(/<(p|li)[^>]*>(?:(?!<\/\1>)[\s\S])*(donat|chip in|ko-fi)(?:(?!<\/\1>)[\s\S])*<\/\1>/gi, '');

const FACTS: [string, string][] = [
  ['School', 'Strake Jesuit College Prep, Houston, Texas, class of 2027'],
  ['Faith', 'Catholic, and the reason StudyFox is free'],
  ['Running', 'I run cross country and track'],
  ['Fitness', 'I run a lot, lift, and play sports for recreation'],
  ['Apps', 'Co-founder of Better U LLC, which ships apps to the App Store, and president of the SJ App Club'],
  ['Technology', 'I like tinkering with anything I can take apart or build, from websites to games'],
  ['Languages', 'English and Spanish, learning Mandarin and German'],
  ['Leadership', 'House Captain of Faber House, and a member of House Council (our student council)'],
  ['Service', 'National Honor Society, and a mission trip to Guatemala with Orphan Outreach'],
];

function Team() {
  const c = useColors();
  return (
    <View style={{ gap: 10 }}>
      {bySection().map((s: { id: string; label: string; people: any[] }) => (
        <Card key={s.id} style={{ gap: 10 }}>
          <Text style={[type.footnote, { color: c.tint, fontWeight: '700' }]}>{s.label.toUpperCase()}</Text>
          {s.people.map((p) => (
            <View key={p.name} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {p.image_url ? <Image source={{ uri: abs(p.image_url) }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.tintSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={[type.headline, { color: c.tint }]}>{p.name[0]}</Text></View>}
              <View style={{ flex: 1 }}>
                <Text style={[type.headline, { color: p.url ? c.tint : c.label }]} onPress={p.url ? () => openWeb(p.url) : undefined}>{p.name}</Text>
                {p.blurb || p.role ? <Text style={[type.subhead, { color: c.label2 }]}>{p.blurb || p.role}</Text> : null}
              </View>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

/** Top sharers: students whose referral links brought in the most friends (names hidden if they asked). */
function TopSharers() {
  const c = useColors();
  const [rows, setRows] = useState<{ no: number; name: string; referrals: number; rank: number }[]>([]);
  useEffect(() => { topSharers(contentClient(), 10).then((r) => setRows(withRanks(r))).catch(() => {}); }, []);
  if (!rows.length) return null;
  const hide = !!store.data().settings.hideNames;
  return (
    <Card style={{ gap: 8 }}>
      <Text style={[type.title3, { color: c.label }]}>Top sharers</Text>
      <Text style={[type.subhead, { color: c.label2 }]}>Students whose links brought the most friends to StudyFox.</Text>
      {rows.map((r) => (
        <View key={r.no} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[type.body, { color: c.label }]}>{r.rank}. {hide || !r.name ? `Player #${r.no}` : r.name}</Text>
          <Text style={[type.body, { color: c.label2 }]}>{r.referrals} {r.referrals === 1 ? 'friend' : 'friends'}</Text>
        </View>
      ))}
    </Card>
  );
}

function Socials() {
  const c = useColors();
  const list = socials();
  if (!list.length) return null;
  return (
    <Card style={{ gap: 10 }}>
      <Text style={[type.title3, { color: c.label }]}>Follow StudyFox</Text>
      <Text style={[type.subhead, { color: c.label2 }]}>New courses, features, and study tips.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {list.map((l: { href: string; icon: string; label: string }, i: number) => <Button key={l.href} title={l.label} icon={l.icon} size="small" kind={i ? 'gray' : 'filled'} onPress={() => openWeb(l.href)} />)}
      </View>
    </Card>
  );
}

export default function About() {
  useStore();
  const c = useColors();
  const p = [type.body, { color: c.label }];
  const page = (PEOPLE.pages as Record<string, unknown>).about as { title: string; intro?: string; sections?: { title?: string; html?: string; style?: string; image?: string; image_alt?: string }[] } | undefined;

  if (page?.sections?.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'About' }} />
        <View style={{ paddingHorizontal: 16, gap: 14, paddingTop: 8 }}>
          <Text style={[type.title2, { color: c.label }]}>{page.title}</Text>
          {page.intro ? <Text style={[type.body, { color: c.label2 }]}>{page.intro}</Text> : null}
          {page.sections.map((x, i) => x.style === 'team' ? (
            <View key={i} style={{ gap: 10 }}>{x.title ? <Text style={[type.title3, { color: c.label }]}>{x.title}</Text> : null}<Team /></View>
          ) : (
            <Card key={i} style={{ gap: 8 }}>
              {x.image ? <Image source={{ uri: abs(x.image) }} accessibilityLabel={x.image_alt || ''} style={{ width: 120, height: 178, borderRadius: 16 }} /> : null}
              {x.title ? <Text style={[type.title3, { color: c.label }]}>{x.title}</Text> : null}
              <Rich html={clean(x.html || '')} variant="lesson" inset={64} />
            </Card>
          ))}
          <TopSharers />
          <Socials />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'About' }} />
      <View style={{ paddingHorizontal: 16, gap: 14, paddingTop: 8 }}>
        <Text style={[type.title2, { color: c.label }]}>Free, because everyone deserves the resources to learn</Text>
        <Text style={p}>StudyFox gives every high school student free courses for every AP class, AP practice questions, SAT and ACT prep, and flashcards, with no ads, no paywalls, and no limits.</Text>
        <Card style={{ gap: 8 }}>
          <Text style={[type.title3, { color: c.label }]}>Why it's completely free</Text>
          <Text style={p}>Where you go to school, or how much your family can spend on tutoring, shouldn't decide how well you can prepare. Every course, practice question, practice test, and flashcard is free for every student, and it's going to stay that way.</Text>
        </Card>
        <Card style={{ gap: 10, alignItems: 'flex-start' }}>
          <Image source={{ uri: abs('assets/creator.jpg') }} accessibilityLabel={`Portrait of ${CREATOR}`} style={{ width: 120, height: 178, borderRadius: 16 }} />
          <Text style={[type.title3, { color: c.label }]}>About me</Text>
          <Text style={p}>I'm {CREATOR}, the creator of StudyFox.</Text>
          {FACTS.map(([k, v]) => <Text key={k} selectable style={p}><Text style={{ fontWeight: '700' }}>{k}: </Text>{v}</Text>)}
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button title="johnsontexas.com" size="small" kind="tinted" onPress={() => openWeb(CREATOR_SITE)} />
            <Button title={`@${INSTAGRAM}`} size="small" kind="gray" onPress={() => openWeb(`https://instagram.com/${INSTAGRAM}`)} />
            <Button title="betterullc.com" size="small" kind="gray" onPress={() => openWeb(BETTERU_URL)} />
          </View>
        </Card>
        <Text style={[type.title3, { color: c.label }]}>The team</Text>
        <Team />
        <TopSharers />
        <Socials />
      </View>
    </Screen>
  );
}
