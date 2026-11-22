# Adding fox avatar items without a site update

Built-in items live in `js/avatar.js`. Extra items go in the Supabase table **`avatar_items`**
(`supabase/avatar_items_and_reviews.sql`). The website and the iOS app load them at startup
(`loadAvatarItems`), so a new row shows up for everyone on their next visit, with no deploy or App Store update.

Only admins (`public.is_admin()`) can write to the table. Everyone can read rows where `hidden = false`.

## Columns

| column | what it is |
| --- | --- |
| `part` | `fur`, `eyes`, `mouth`, `shirt`, `color` (shirt color), `hat`, or `glasses` |
| `item_id` | lowercase letters only, up to 20 (`tophat`). This is what students save, so never rename or reuse one. It can't match a built-in id. |
| `name` | what students see (`Top hat`) |
| `art` | for every part except `fur` and `color`: an SVG fragment drawn in the fox's 100 x 100 space |
| `colors` | `fur`: `{"fur":"#hex","dark":"#hex","light":"#hex"}`. `color`: `{"hex":"#hex"}` |
| `unlock` | `null` for everyone, or an exclusive: `{"kind":"shares","n":10}`. Kinds: `shares` (friends who joined with their link), `streak` (days), `questions` (answered), `lessons` (finished). Tap-to-earn (tapping opens the page and unlocks it; we can't check): follow `{"kind":"follow","ig":"studyfoxapp"}` (or `"tiktok"`, `"yt"`, `"x"` instead of `"ig"`), review `{"kind":"review"}` (opens the Trustpilot page). Website/app builds before Nov 22 2026 only know `ig` follows, so keep new kinds `hidden` until the update is live |
| `sort` | order within the part (built-ins come first) |
| `hidden` | `true` hides it without deleting it. Anyone already wearing it falls back to their default for that part. |

## Drawing the art

- Coordinates: the fox head is centered around (50, 50). Eyes sit at (39, 51) and (61, 51), the nose at (50, 62), the mouth around y = 66 to 70, the top of the head at y = 27, and the shoulders from y = 79 down.
- Outline: `stroke="{ink}" stroke-width="2"`, with round caps and joins, like the built-ins.
- Placeholders filled in per fox: `{ink}` outline, `{fur}` `{dark}` `{light}` fur shades, `{c}` `{c2}` shirt color and its shadow.
- Allowed tags: `path circle ellipse rect line polyline polygon g text`, with plain drawing attributes only.
  Anything else (scripts, links, images, `on...=` handlers) is rejected by the database and again by the app.
- Keep fur colors and shirt colors natural and muted, to match the rest.

## Examples (run in the Supabase SQL editor, or ask Claude to run them)

```sql
-- A hat for everyone
insert into public.avatar_items (part, item_id, name, art, sort) values
('hat', 'tophat', 'Top hat',
 '<path d="M36 30h28l-2-16H38z" fill="#2b2a29" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/><path d="M28 31c6-2 38-2 44 0-6 3-38 3-44 0z" fill="#2b2a29" stroke="{ink}" stroke-width="2"/><path d="M38 26h24" stroke="#c8413f" stroke-width="3"/>',
 10);

-- An exclusive shirt for a 60-day streak
insert into public.avatar_items (part, item_id, name, art, unlock) values
('shirt', 'blazer', 'Blazer',
 '<path d="M10 104C12 86 28 79 50 79s38 7 40 25z" fill="{c}" stroke="{ink}" stroke-width="2"/><path d="M40 80l10 12 10-12" fill="#f7f5f0" stroke="{ink}" stroke-width="2"/>',
 '{"kind":"streak","n":60}');

-- A new natural fur color
insert into public.avatar_items (part, item_id, name, colors) values
('fur', 'fawn', 'Fawn', '{"fur":"#d6a77a","dark":"#a07750","light":"#fffaf3"}');

-- A new shirt color
insert into public.avatar_items (part, item_id, name, colors) values
('color', 'rust', 'Rust', '{"hex":"#a8502f"}');

-- Hide one
update public.avatar_items set hidden = true where part = 'hat' and item_id = 'tophat';
```

Preview new art before inserting: add it to a copy of `mockups/fox-avatars.html` or call `foxSVG()` from `js/avatar.js` in Node.

## Reviews

Students' reviews go in `public.reviews`: one per student, stars 1 to 5, text, and `anonymous`.
They're private until an admin sets `approved = true`. Any edit by the student sets it back to false.
A future home page carousel should read approved rows through a `security definer` function that returns
`name` and `avatar` only when `anonymous` is false.
