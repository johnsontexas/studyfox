-- Fox avatar items you can add without a site update, and student reviews.
-- Applied as migration "avatar_items_and_reviews". How to add items: docs/avatar-items.md.

-- Avatars now also have a shirt color part.
alter table public.members drop constraint if exists members_avatar_shape;
alter table public.members add constraint members_avatar_shape check (
  avatar is null or (
    jsonb_typeof(avatar) = 'object'
    and avatar - array['fur', 'eyes', 'mouth', 'shirt', 'color', 'hat', 'glasses'] = '{}'::jsonb
    and not jsonb_path_exists(avatar, '$.* ? (!(@ like_regex "^[a-z]{1,20}$"))')
  )
);

-- Extra items, merged into js/avatar.js at startup (loadAvatarItems).
--   part:    fur | eyes | mouth | shirt | color | hat | glasses
--   item_id: lowercase letters, unique per part, never reused (it's what students save)
--   art:     SVG fragment in the 100x100 fox space (all parts except fur and color). Placeholders:
--            {ink} outline, {fur} {dark} {light} fur shades, {c} {c2} shirt color and its shadow.
--   colors:  fur rows { "fur": "#hex", "dark": "#hex", "light": "#hex" }; color rows { "hex": "#hex" }
--   unlock:  null for everyone, or { "kind": "shares"|"streak"|"questions"|"lessons", "n": 10 }
create table if not exists public.avatar_items (
  part text not null check (part in ('fur', 'eyes', 'mouth', 'shirt', 'color', 'hat', 'glasses')),
  item_id text not null check (item_id ~ '^[a-z]{1,20}$'),
  name text not null check (char_length(name) between 1 and 40),
  art text not null default '' check (char_length(art) <= 6000 and art !~* '(<script|on[a-z]+\s*=|href|javascript:|foreignObject|<image|<use)'),
  colors jsonb,
  unlock jsonb check (unlock is null or (unlock->>'kind' in ('shares', 'streak', 'questions', 'lessons') and (unlock->>'n')::int > 0)),
  sort int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (part, item_id)
);
alter table public.avatar_items enable row level security;
drop policy if exists "avatar items are public" on public.avatar_items;
create policy "avatar items are public" on public.avatar_items for select using (not hidden or public.is_admin());
drop policy if exists "admins manage avatar items" on public.avatar_items;
create policy "admins manage avatar items" on public.avatar_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Reviews: stars out of 5, a few words, and whether to show the name. One per student (editable).
-- Kept private for now; a home page carousel will later read approved ones through a function.
create table if not exists public.reviews (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  body text not null default '' check (char_length(body) <= 1000),
  anonymous boolean not null default false,
  name text not null default '' check (char_length(name) <= 60),
  avatar jsonb,
  platform text not null default 'web' check (platform in ('web', 'ios')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
drop policy if exists "students read their review" on public.reviews;
create policy "students read their review" on public.reviews for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "students write their review" on public.reviews;
create policy "students write their review" on public.reviews for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "students edit their review" on public.reviews;
create policy "students edit their review" on public.reviews for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "admins manage reviews" on public.reviews;
create policy "admins manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A student's edit goes back for approval; only admins can approve.
create or replace function public.reviews_touch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  if not public.is_admin() then new.approved := false; end if;
  return new;
end $$;
drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch before insert or update on public.reviews for each row execute function public.reviews_touch();
