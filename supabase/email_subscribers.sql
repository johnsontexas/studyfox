-- Email subscribers: everyone who opted in to StudyFox emails (settings.emails in their synced progress).
-- A trigger on progress keeps it current: checking the box adds them, unchecking removes them, and
-- deleting the account removes them. Admins only; the admin console copies the list in one click.
create table if not exists public.email_subscribers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  opted_in_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.email_subscribers enable row level security;
drop policy if exists "admins read subscribers" on public.email_subscribers;
create policy "admins read subscribers" on public.email_subscribers for select to authenticated using ((select public.is_admin()));

create or replace function public.sync_email_subscriber() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.data->'settings'->>'emails', 'false') = 'true' then
    insert into public.email_subscribers (user_id, email, name, opted_in_at, updated_at)
    select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
           nullif(new.data->'settings'->>'emailsAt', '')::timestamptz, now()
    from auth.users u where u.id = new.user_id and u.email is not null
    on conflict (user_id) do update set email = excluded.email, opted_in_at = excluded.opted_in_at, updated_at = now();
  else
    delete from public.email_subscribers where user_id = new.user_id;
  end if;
  return null;
end $$;
revoke all on function public.sync_email_subscriber() from public, anon, authenticated;
drop trigger if exists sync_email_subscriber on public.progress;
create trigger sync_email_subscriber after insert or update of data on public.progress for each row execute function public.sync_email_subscriber();

-- Backfill from everyone already synced.
insert into public.email_subscribers (user_id, email, name, opted_in_at)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
       nullif(p.data->'settings'->>'emailsAt', '')::timestamptz
from public.progress p join auth.users u on u.id = p.user_id
where p.data->'settings'->>'emails' = 'true' and u.email is not null
on conflict (user_id) do nothing;
