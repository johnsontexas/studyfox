-- Player numbers for leaderboards. With "Hide other students' names" on, the Match leaderboard shows
-- other players by their permanent number (Player #123) instead of their name. Returns only the
-- number for each user id asked about, nothing else from members. Applied as migration "member_numbers".
create or replace function public.member_numbers(ids uuid[]) returns table (user_id uuid, no bigint)
language sql stable security definer set search_path = '' as $$
  select m.user_id, m.no from public.members m
  where m.user_id = any (ids[1:50]);
$$;
revoke all on function public.member_numbers(uuid[]) from public;
grant execute on function public.member_numbers(uuid[]) to anon, authenticated;
