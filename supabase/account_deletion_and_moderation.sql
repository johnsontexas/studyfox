create policy "admins delete any score" on public.match_scores for delete to authenticated using ((select public.is_admin()));

-- Leaderboard moderation. Anyone signed in can report a name (admins review them in the admin console)
-- or block a player, which hides that player's times from them.
create table if not exists public.match_reports (
  id bigint generated always as identity primary key,
  reporter uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reported_user uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  set_key text not null check (char_length(set_key) between 1 and 120),
  created_at timestamptz not null default now()
);
alter table public.match_reports enable row level security;
create policy "players file reports" on public.match_reports for insert to authenticated with check (reporter = auth.uid());
create policy "admins read reports" on public.match_reports for select to authenticated using ((select public.is_admin()));
create policy "admins clear reports" on public.match_reports for delete to authenticated using ((select public.is_admin()));
create table if not exists public.match_blocks (
  blocker uuid not null default auth.uid() references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
alter table public.match_blocks enable row level security;
create policy "players manage their own blocks" on public.match_blocks for all to authenticated using (blocker = auth.uid()) with check (blocker = auth.uid());

-- Deletes the caller's login. Everything they own goes with it through on delete cascade.
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in.'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
