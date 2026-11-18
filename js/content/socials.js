// StudyFox's social accounts, shown in the website footer and About page and in the app's Me and About
// screens. The live list is content_settings key 'socials' (Admin console > Socials), loaded by live.js,
// so changing a handle needs no deploy or app update. Shared by the website and the app: no DOM here.
import { setting } from './settings.js';

export const SOCIAL_PLATFORMS = {
  instagram: { name: 'Instagram', icon: 'instagram', url: (h) => `https://instagram.com/${h}` },
  tiktok: { name: 'TikTok', icon: 'tiktok', url: (h) => `https://www.tiktok.com/@${h}` },
  youtube: { name: 'YouTube', icon: 'youtube', url: (h) => `https://www.youtube.com/@${h}` },
  x: { name: 'X', icon: 'x-social', url: (h) => `https://x.com/${h}` },
  threads: { name: 'Threads', icon: 'threads', url: (h) => `https://www.threads.net/@${h}` },
  discord: { name: 'Discord', icon: 'discord', url: (h) => `https://discord.gg/${h}` },
  website: { name: 'Website', icon: 'globe', url: (h) => (/^https?:\/\//.test(h) ? h : `https://${h}`) },
};

const clean = (h) => String(h || '').trim().replace(/^@/, '');

/** Visible social links: [{ platform, name, icon, handle, label, href }], in the admin's order. */
export function socials() {
  return (setting('socials').links || [])
    .filter((l) => l && SOCIAL_PLATFORMS[l.platform] && l.show !== false && (clean(l.handle) || l.url))
    .map((l) => {
      const p = SOCIAL_PLATFORMS[l.platform];
      const handle = clean(l.handle);
      const href = /^https:\/\//.test(l.url || '') ? l.url : p.url(handle);
      const label = l.label || (l.platform === 'website' || l.platform === 'discord' ? p.name : `@${handle}`);
      return { platform: l.platform, name: p.name, icon: p.icon, handle, label, href };
    });
}
