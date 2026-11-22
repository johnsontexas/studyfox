// Follow sets (Nov 2026): each social account unlocks a matching hat + shirt.
//   StudyFox Instagram: StudyFox cap (built-in) + StudyFox tee
//   StudyFox TikTok:    StudyFox beanie + StudyFox hoodie
//   Daniel's Instagram: propeller cap + striped tee and overalls (from a photo of Daniel) + Founder aviators (built-in)
// Run: node tools/avatar-items-follow-sets.mjs  -> writes supabase/seed/avatar_items_follow_sets.sql and a preview.
import { writeFileSync } from 'fs';
import { addItems, foxSVG, defaultAvatar } from '../js/avatar.js';

const B = 'M6 104C8 85 27 77.5 50 77.5S92 85 94 104z';
const FOX = '<path d="M43 92l3-4 4 3 4-3 3 4-2 7-5 3-5-3z" fill="#e07a35"/><path d="M46 99l4 3 4-3-4-2z" fill="#fff7ee"/>';
const DAN = { kind: 'follow', ig: 'txdanieljohnson' };
const SF_IG = { kind: 'follow', ig: 'studyfoxapp' };
const SF_TT = { kind: 'follow', tiktok: 'studyfoxapp' };

export const ITEMS = [
  ['hat', 'propeller', "Daniel's propeller cap",
    '<path d="M27 34c0-13 10-21 23-21s23 8 23 21z" fill="#f2c230"/>'
    + '<path d="M27 34c0-11 5-18 12-20-3 6-4 13-4 20z" fill="#2f4fa0"/><path d="M73 34c0-11-5-18-12-20 3 6 4 13 4 20z" fill="#c8413f"/>'
    + '<path d="M24 32c9-3 43-3 52 0 3 4-1 10-6 11-11-3-29-3-40 0-5-1-9-7-6-11z" fill="#2f7a4a"/><path d="M27 33c9-2 37-2 46 0" stroke="#f2c230" stroke-width="1.4" fill="none"/>'
    + '<path d="M50 14V8" stroke="{ink}" stroke-width="2"/><path d="M38 7c4-3 8-2 12 0-4 3-8 3-12 0z" fill="#c8413f"/><path d="M62 7c-4-3-8-2-12 0 4 3 8 3 12 0z" fill="#2f4fa0"/><circle cx="50" cy="7.5" r="1.8" fill="#f2c230"/>',
    DAN, 200],
  ['shirt', 'danoveralls', "Daniel's overalls",
    `<path d="${B}" fill="#f7f5f0"/><path d="M12 90h76M8 98h84" stroke="#c8413f" stroke-width="4.5" fill="none"/><path d="M40 80c2 5 6 7 10 7s8-2 10-7" fill="#c8413f"/>`
    + '<path d="M36 104V91h28v13z" fill="#5b7fae"/><path d="M33 80l7 12M67 80l-7 12" stroke="#5b7fae" stroke-width="5" stroke-linecap="round" fill="none"/>'
    + '<circle cx="40" cy="92.5" r="1.7" fill="#d6d0c4"/><circle cx="60" cy="92.5" r="1.7" fill="#d6d0c4"/><path d="M45 97h10" stroke="#3f5f8a" stroke-width="1.4"/>',
    DAN, 201],
  ['hat', 'foxbeanie', 'StudyFox beanie',
    '<path d="M27 36c0-15 10-24 23-24s23 9 23 24z" fill="#d9772e"/><path d="M25 32h50v7H25z" fill="#b25d1f"/>'
    + '<path d="M44 27l2-7 4 3.5 4-3.5 2 7c-1.5 2-3.5 3-6 3s-4.5-1-6-3z" fill="#f7f5f0"/><circle cx="50" cy="11" r="4.5" fill="#f7f5f0"/>',
    SF_TT, 202],
  ['shirt', 'foxhoodie', 'StudyFox hoodie',
    `<path d="${B}" fill="#d9772e"/><path d="M32 82c4 6 10 9 18 9s14-3 18-9" fill="#b25d1f"/><path d="M45 90v9M55 90v9" stroke="#f7f5f0" stroke-width="1.8" stroke-linecap="round"/>`
    + '<path d="M44 97l2.5-3.5 3.5 2.6 3.5-2.6 2.5 3.5-1.7 6-4.3 2.4-4.3-2.4z" fill="#f7f5f0"/>',
    SF_TT, 203],
];

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const sql = `-- Follow sets. Applied Nov 22 2026.
update public.avatar_items set unlock = '${JSON.stringify(SF_IG)}'::jsonb, hidden = false where item_id = 'foxtee';
update public.avatar_items set name = ${q(ITEMS[0][2])}, art = ${q(ITEMS[0][3])}, unlock = '${JSON.stringify(DAN)}'::jsonb, hidden = false where item_id = 'propeller';
insert into public.avatar_items (part, item_id, name, art, unlock, sort) values
${ITEMS.slice(1).map(([p, id, n, a, u, s]) => `(${q(p)}, ${q(id)}, ${q(n)}, ${q(a)}, '${JSON.stringify(u)}'::jsonb, ${s})`).join(',\n')}
on conflict do nothing;
`;
writeFileSync(new URL('../supabase/seed/avatar_items_follow_sets.sql', import.meta.url), sql);

addItems(ITEMS.map(([part, item_id, name, art, unlock]) => ({ part, item_id: item_id === 'propeller' ? 'propellerx' : item_id, name, art, unlock })));
const base = { ...defaultAvatar('preview'), glasses: 'none', hat: 'none' };
const dan = { ...base, hat: 'propellerx', shirt: 'danoveralls', mouth: 'teeth', glasses: 'none' };
const sf = { ...base, hat: 'foxbeanie', shirt: 'foxhoodie' };
writeFileSync(new URL('../mockups/avatar-follow-sets.html', import.meta.url),
  `<body style="font-family:sans-serif;display:flex;gap:24px;padding:20px">${[[dan, "Daniel's set"], [sf, 'StudyFox TikTok set'], [{ ...base, hat: 'foxcap', shirt: 'foxtee' }, 'StudyFox Instagram set']]
    .map(([a, t]) => `<figure style="margin:0;text-align:center">${foxSVG(a, { size: 180 })}<figcaption>${t}</figcaption></figure>`).join('')}`);
console.log('ok');
