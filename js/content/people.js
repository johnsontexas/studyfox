// Contributors (Supabase table contributors) and editable pages (table site_pages), loaded with the rest
// of the content by live.js. The built-in list below is used until the first download, or offline.
// Shared by the website and the iOS app: no DOM here.

export const SECTIONS = [
  ['creator', 'Creator'],
  ['contributor', 'Contributors'],
  ['support', 'Support'],
  ['donor', 'Donors'],
  ['influencer', 'Creators who shared StudyFox'],
];

export const PEOPLE = {
  contributors: [
    { name: 'Daniel Johnson', section: 'creator', role: 'Creator', blurb: 'Built StudyFox so every student can prepare for school, AP exams, and the SAT and ACT for free.', url: 'https://johnsontexas.com', image_url: 'assets/creator-thumb.jpg', sort: 0 },
    { name: 'Lucas Borgarello', section: 'contributor', role: 'Contributor', blurb: '', url: '', image_url: '', sort: 10 },
    { name: 'Enrique Ortiz', section: 'contributor', role: 'Contributor', blurb: '', url: '', image_url: '', sort: 20 },
    { name: 'BetterU LLC', section: 'support', role: 'Support', blurb: '', url: 'https://betterullc.com', image_url: '', sort: 30 },
  ],
  pages: {}, // slug -> { title, intro, sections: [{ title, html, style: 'card' | 'plain' | 'motto' | 'team', image?, image_alt? }] }
};

/** Replace with downloaded rows. */
export function applyPeople(contributors, pages) {
  if (Array.isArray(contributors) && contributors.length) {
    PEOPLE.contributors = contributors.filter((c) => !c.hidden).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  }
  if (Array.isArray(pages)) PEOPLE.pages = Object.fromEntries(pages.map((p) => [p.slug, p]));
}

/** Contributors grouped by section, in SECTIONS order, skipping empty sections. */
export const bySection = () => SECTIONS.map(([id, label]) => ({ id, label, people: PEOPLE.contributors.filter((c) => c.section === id) })).filter((s) => s.people.length);

/** One-line credit for the footer: "Made by Daniel Johnson with Lucas Borgarello and Enrique Ortiz. Support from BetterU LLC." */
export function creditLine() {
  const names = (s) => PEOPLE.contributors.filter((c) => c.section === s).map((c) => c.name);
  const list = (a) => (a.length < 3 ? a.join(' and ') : `${a.slice(0, -1).join(', ')}, and ${a[a.length - 1]}`);
  const made = names('creator'), helped = names('contributor'), support = names('support');
  return [made.length ? `Made by ${list(made)}${helped.length ? ` with ${list(helped)}` : ''}.` : '', support.length ? `Support from ${list(support)}.` : ''].filter(Boolean).join(' ');
}
