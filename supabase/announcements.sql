-- Announcements: every news post can also pop up on people's screens when they open StudyFox
-- (website and app) and/or send a push notification to the iPhone app.
-- Run once in the Supabase SQL editor. Safe to run again.

-- 1. Extra options on news posts (set in the admin console when posting).
alter table public.news add column if not exists popup boolean not null default false;        -- show as a pop-up on open
alter table public.news add column if not exists popup_until timestamptz;                       -- stop showing the pop-up after this (optional)
alter table public.news add column if not exists notify boolean not null default false;        -- send a push notification
alter table public.news add column if not exists notified_at timestamptz;                       -- when the push went out
alter table public.news add column if not exists cta_label text not null default '' check (char_length(cta_label) <= 40);
alter table public.news add column if not exists cta_url text not null default '' check (cta_url = '' or cta_url ~ '^(https://|studyfox://|/|#/)');

-- 2. Push tokens from the iPhone app. Nobody can read this table directly; the app registers
--    through register_push_token(), and only the trigger below reads it.
create table if not exists public.push_tokens (
  token text primary key check (token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,}\]$'),
  user_id uuid references auth.users (id) on delete cascade,
  platform text not null default '' check (platform in ('', 'ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from anon, authenticated;

create or replace function public.register_push_token(p_token text, p_platform text default 'ios') returns void
language sql security definer set search_path = '' as $$
  insert into public.push_tokens (token, user_id, platform) values (p_token, auth.uid(), coalesce(p_platform, ''))
  on conflict (token) do update set user_id = coalesce(auth.uid(), public.push_tokens.user_id), platform = excluded.platform, updated_at = now();
$$;
create or replace function public.unregister_push_token(p_token text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_tokens where token = p_token;
$$;
revoke all on function public.register_push_token(text, text) from public;
revoke all on function public.unregister_push_token(text) from public;
grant execute on function public.register_push_token(text, text) to anon, authenticated;
grant execute on function public.unregister_push_token(text) to anon, authenticated;

-- How many devices will get a push (shown in the admin console). Admins only.
create or replace function public.push_device_count() returns int
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then return null; end if;
  return (select count(*)::int from public.push_tokens);
end $$;
revoke all on function public.push_device_count() from public;
grant execute on function public.push_device_count() to authenticated;

-- 3. Send the push through Expo's push service when a post is saved with notify on.
--    pg_net sends the requests in the background, so posting stays instant.
create extension if not exists pg_net with schema extensions;

create or replace function public.news_send_push() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  msg_body text;
  batch jsonb;
begin
  if not new.notify or new.notified_at is not null then return new; end if;
  new.notified_at := now();
  -- Plain text preview: drop [text](link) markup down to its text, squash whitespace, keep it short.
  msg_body := regexp_replace(regexp_replace(new.body, '\[([^\]]+)\]\([^)]+\)', '\1', 'g'), '\s+', ' ', 'g');
  if char_length(msg_body) > 178 then msg_body := left(msg_body, 175) || '...'; end if;
  for batch in
    select jsonb_agg(jsonb_build_object(
      'to', t.token, 'title', new.title, 'body', msg_body, 'sound', 'default',
      'data', jsonb_build_object('kind', 'announcement', 'id', new.id, 'url', '/news')))
    from (select token, (row_number() over (order by token) - 1) / 100 as grp from public.push_tokens) t
    group by t.grp
  loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := batch,
      headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
    );
  end loop;
  return new;
end $$;

drop trigger if exists send_push on public.news;
create trigger send_push before insert or update of notify, notified_at on public.news
  for each row execute function public.news_send_push();

-- 4. Social accounts, edited in Admin console > Socials. Shown on the website and in the app.
insert into public.content_settings (key, value, note) values ('socials', '{
  "links": [
    {"platform": "tiktok", "handle": "studyfoxapp", "show": true},
    {"platform": "instagram", "handle": "studyfoxapp", "show": true}
  ]
}', 'StudyFox social accounts shown in the footer, About page, and the app. Edit them in Admin console > Socials.')
on conflict (key) do nothing;
