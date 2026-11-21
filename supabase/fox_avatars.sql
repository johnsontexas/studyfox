-- Fox avatars (js/avatar.js). Each member can save { fur, eyes, mouth, shirt, hat, glasses }; leaderboards show them.
-- Only short item ids are stored, never images. Applied as migration "fox_avatars".
alter table public.members add column if not exists avatar jsonb;
alter table public.members drop constraint if exists members_avatar_shape;
alter table public.members add constraint members_avatar_shape check (
  avatar is null or (
    jsonb_typeof(avatar) = 'object'
    and avatar - array['fur', 'eyes', 'mouth', 'shirt', 'hat', 'glasses'] = '{}'::jsonb
    and not jsonb_path_exists(avatar, '$.* ? (!(@ like_regex "^[a-z]{1,20}$"))')
  )
);

-- Save the signed-in student's fox.
create or replace function public.set_my_avatar(a jsonb) returns void
language sql volatile security definer set search_path = '' as $$
  update public.members set avatar = a where user_id = (select auth.uid());
$$;
revoke all on function public.set_my_avatar(jsonb) from public;
grant execute on function public.set_my_avatar(jsonb) to authenticated;

-- Player number and fox for leaderboard rows (like member_numbers, plus the avatar).
create or replace function public.member_cards(ids uuid[]) returns table (user_id uuid, no bigint, avatar jsonb)
language sql stable security definer set search_path = '' as $$
  select m.user_id, m.no, m.avatar from public.members m where m.user_id = any (ids[1:50]);
$$;
revoke all on function public.member_cards(uuid[]) from public;
grant execute on function public.member_cards(uuid[]) to anon, authenticated;

-- Top sharers now also returns each student's fox.
drop function if exists public.top_sharers(int);
create function public.top_sharers(lim int default 20) returns table (no bigint, name text, referrals bigint, avatar jsonb)
language sql stable security definer set search_path = '' as $$
  select m.no, coalesce(nullif(m.display_name, ''), 'Student'), count(r.no), m.avatar
  from public.members m join public.members r on r.referred_by = m.no and r.user_id is not null
  where m.user_id is not null and m.show_on_leaderboard
  group by m.no, m.display_name, m.avatar order by count(r.no) desc, m.no limit least(greatest(lim, 1), 5000);
$$;
grant execute on function public.top_sharers(int) to anon, authenticated;
