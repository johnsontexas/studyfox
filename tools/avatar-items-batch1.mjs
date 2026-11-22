// Batch 1 of avatar_items rows (Nov 2026). Writes supabase/seed/avatar_items_batch1.sql and mockups/avatar-items-batch1.html.
import { writeFileSync } from 'fs';
import { addItems, foxSVG, defaultAvatar, PARTS } from '../js/avatar.js';
const B = 'M6 104C8 85 27 77.5 50 77.5S92 85 94 104z';
const rows = [
  ['hat','cowboy','Cowboy hat','<path d="M18 34c8 4 56 4 64 0-2 5-14 8-32 8s-30-3-32-8z" fill="#8a5a33"/><path d="M33 34c0-12 6-20 17-20s17 8 17 20c-10 2-24 2-34 0z" fill="#a8703f"/><path d="M33 30c10 2 24 2 34 0v4c-10 2-24 2-34 0z" fill="#4e3420"/>',null],
  ['hat','fedora','Fedora','<path d="M22 35c10 3 46 3 56 0-3 4-14 6-28 6s-25-2-28-6z" fill="#4a4a4a"/><path d="M34 35c-1-12 5-20 16-20s17 8 16 20c-10 2-22 2-32 0z" fill="#5f5f5f"/><path d="M45 17c2 3 8 3 10 0" stroke="#3a3a3a" stroke-width="2" fill="none"/><path d="M34 30c10 2 22 2 32 0v4c-10 2-22 2-32 0z" fill="#2b2a29"/>',null],
  ['hat','visor','Visor','<path d="M27 30h46v6H27z" fill="{c}"/><path d="M27 36h46c4 0 8 3 8 5-12 1-40 1-54-1z" fill="{c2}"/>',null],
  ['hat','chef','Chef hat','<path d="M34 36V24c-6-1-8-6-6-10 2-5 8-6 11-3 2-5 8-6 11-6s9 1 11 6c3-3 9-2 11 3 2 4 0 9-6 10v12z" fill="#ffffff" stroke="{ink}" stroke-width="1.4" stroke-linejoin="round"/><path d="M34 31h32v5H34z" fill="#e9e4da"/>',null],
  ['hat','party','Party hat','<path d="M38 36L50 8l12 28z" fill="#e8816b"/><path d="M42.5 26h15M40 31h20" stroke="#f7f5f0" stroke-width="2.5"/><circle cx="50" cy="8" r="3.2" fill="#d9a53a"/>',{kind:'streak',n:7}],
  ['hat','propeller','Propeller beanie','<path d="M27 36c0-15 10-24 23-24s23 9 23 24z" fill="#3f74b5"/><path d="M50 12c-6 0-10 10-10 24h20c0-14-4-24-10-24z" fill="#d9a53a"/><path d="M25 32h50v7H25z" fill="#c8413f"/><path d="M50 12V6" stroke="{ink}" stroke-width="2"/><path d="M38 5c4-2 8-1 12 1 4-2 8-3 12-1-4 3-8 2-12 0-4 2-8 3-12 0z" fill="#c8413f"/>',{kind:'follow',tiktok:'studyfoxapp'}],
  ['hat','halo','Halo','<ellipse cx="50" cy="12" rx="17" ry="5" fill="none" stroke="#e8c24a" stroke-width="4"/>',{kind:'review'}],
  ['hat','wizard','Wizard hat','<path d="M28 36L52 0l20 36z" fill="#4a3a7a"/><path d="M24 34c10 4 42 4 52 0-2 5-12 7-26 7s-24-2-26-7z" fill="#3a2d63"/><circle cx="48" cy="20" r="2.2" fill="#e8c24a"/><circle cx="58" cy="28" r="1.6" fill="#e8c24a"/><circle cx="44" cy="30" r="1.4" fill="#e8c24a"/>',{kind:'streak',n:100}],
  ['glasses','threed','3D glasses','<path d="M28 45h44v13H28z" fill="#f7f5f0" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/><path d="M31 47.5h15v8H31z" fill="#c8413f" opacity=".85"/><path d="M54 47.5h15v8H54z" fill="#3f9fc0" opacity=".85"/><path d="M28 47l-4-2M72 47l4-2" stroke="{ink}" stroke-width="2.4" stroke-linecap="round"/>',null],
  ['glasses','nerd','Thick frames','<rect x="29" y="45" width="19" height="13" rx="3" fill="#ffffff" fill-opacity=".25" stroke="{ink}" stroke-width="3.5"/><rect x="52" y="45" width="19" height="13" rx="3" fill="#ffffff" fill-opacity=".25" stroke="{ink}" stroke-width="3.5"/><path d="M48 49h4M29 48l-5-2M71 48l5-2" stroke="{ink}" stroke-width="3" stroke-linecap="round"/>',{kind:'questions',n:500}],
  ['glasses','heart','Heart shades','<path d="M39 58c-6-4-10-7-10-11 0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 4-4 7-10 11z" fill="#d94a6a" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/><path d="M61 58c-6-4-10-7-10-11 0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 4-4 7-10 11z" fill="#d94a6a" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/><path d="M49 47h2M29 47l-5-2M71 47l5-2" stroke="{ink}" stroke-width="2.4" stroke-linecap="round"/>',{kind:'review'}],
  ['shirt','puffer','Puffer jacket',`<path d="${B}" fill="{c}"/><path d="M14 92c24-3 48-3 72 0M10 100c27-3 53-3 80 0" stroke="{c2}" stroke-width="2" fill="none"/><path d="M38 81c0-5 6-8 12-8s12 3 12 8c-3 4-7 5-12 5s-9-1-12-5z" fill="{c2}"/><path d="M50 86v18" stroke="{ink}" stroke-width="1.6"/>`,null],
  ['shirt','foxtee','StudyFox tee',`<path d="${B}" fill="{c}"/><path d="M40 80c2 5 6 7 10 7s8-2 10-7" fill="{c2}"/><path d="M43 92l3-4 4 3 4-3 3 4-2 7-5 3-5-3z" fill="#e07a35"/><path d="M46 99l4 3 4-3-4-2z" fill="#fff7ee"/>`,{kind:'follow',tiktok:'studyfoxapp'}],
  ['shirt','labcoat','Lab coat',`<path d="${B}" fill="#f7f5f0" stroke="{ink}" stroke-width="1.2"/><path d="M40 80l10 12 10-12" fill="{c}"/><path d="M38 79l12 25M62 79l-12 25" stroke="#d6d0c4" stroke-width="2.4" fill="none"/><path d="M66 92h10v5H66z" fill="#3f74b5"/>`,{kind:'lessons',n:25}],
  ['shirt','tux','Tuxedo',`<path d="${B}" fill="#2b2a29"/><path d="M40 79l10 25 10-25z" fill="#f7f5f0"/><path d="M43 81l7 4-7 4zM57 81l-7 4 7 4z" fill="{c}"/><circle cx="50" cy="94" r="1" fill="{ink}"/><circle cx="50" cy="99" r="1" fill="{ink}"/>`,{kind:'streak',n:60}],
  ['fur','redwood','Redwood',{fur:'#b4532d',dark:'#7d3419',light:'#fdf0e6'},null],
  ['fur','midnight','Midnight',{fur:'#4a4f5c',dark:'#2c3039',light:'#e6e8ec'},{kind:'streak',n:50}],
  ['color','plum','Plum',{hex:'#6b3a5a'},null],
  ['color','denim','Denim',{hex:'#4f6a8f'},null],
  ['color','terracotta','Terracotta',{hex:'#b5643f'},null],
];
const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const sql = rows.map(([part, id, name, x, u], i) => {
  const isC = typeof x === 'object';
  return `(${q(part)}, ${q(id)}, ${q(name)}, ${q(isC ? '' : x)}, ${isC ? q(JSON.stringify(x)) + '::jsonb' : 'null'}, ${u ? q(JSON.stringify(u)) + '::jsonb' : 'null'}, ${100 + i})`;
});
writeFileSync('supabase/seed/avatar_items_batch1.sql', `insert into public.avatar_items (part, item_id, name, art, colors, unlock, sort) values\n${sql.join(',\n')}\non conflict do nothing;\n`);
addItems(rows.map(([part, item_id, name, x, unlock]) => ({ part, item_id, name, ...(typeof x === 'object' ? { colors: x } : { art: x }), unlock })));
const base = { ...defaultAvatar('preview'), hat: 'none', glasses: 'none' };
const cells = rows.map(([part, id, name, , u]) => { if (!PARTS[part].some((p) => p.id === id)) throw new Error('rejected ' + id); return `<figure>${foxSVG({ ...base, [part]: id }, { size: 120 })}<figcaption>${name}<br><small>${u ? JSON.stringify(u) : 'free'}</small></figcaption></figure>`; });
writeFileSync('mockups/avatar-items-batch1.html', `<style>body{font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px;padding:20px}figure{margin:0;text-align:center;width:140px}</style>${cells.join('')}`);
console.log('ok', rows.length);
