-- One row of progress per signed-in user. Run in the Supabase SQL editor.
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "read own progress" on public.progress for select using ((select auth.uid()) = user_id);
create policy "insert own progress" on public.progress for insert with check ((select auth.uid()) = user_id);
create policy "update own progress" on public.progress for update using ((select auth.uid()) = user_id);
create policy "delete own progress" on public.progress for delete using ((select auth.uid()) = user_id);

-- Admins: the only accounts that can post news or shut the site down. Nobody can read or edit
-- this table from the browser; is_admin() checks it on the server with a confirmed email.
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
insert into public.admins (email) values ('danieljohnsonhtx@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u join public.admins a on lower(a.email) = lower(u.email)
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- News posts: everyone can read, only admins can write.
create table if not exists public.news (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 8000),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.news enable row level security;
create policy "anyone reads news" on public.news for select using (true);
create policy "admins add news" on public.news for insert to authenticated with check ((select public.is_admin()));
create policy "admins edit news" on public.news for update to authenticated using ((select public.is_admin()));
create policy "admins delete news" on public.news for delete to authenticated using ((select public.is_admin()));

-- One-row site switch: maintenance mode plus the message shown while it is on.
create table if not exists public.site_status (
  id int primary key default 1 check (id = 1),
  maintenance boolean not null default false,
  message text not null default '' check (char_length(message) <= 500),
  updated_at timestamptz not null default now()
);
-- App Store link for the "Download on iOS" footer button; hidden while empty.
alter table public.site_status add column if not exists ios_app_url text not null default '' check (ios_app_url = '' or ios_app_url ~ '^https://');
insert into public.site_status (id) values (1) on conflict do nothing;
alter table public.site_status enable row level security;
create policy "anyone reads status" on public.site_status for select using (true);
create policy "admins edit status" on public.site_status for update to authenticated using ((select public.is_admin()));

-- Editable study content (admin console: #/admin/content). Everyone reads; admins write.
create table if not exists public.courses (
  id text primary key check (id ~ '^[a-z0-9-]{1,60}$'), subject text not null, icon text not null default 'book',
  title text not null check (char_length(title) between 1 and 120), blurb text not null default '', level text not null default '',
  ap boolean not null default false, sort int not null default 0, hidden boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists public.lessons (
  course_id text not null references public.courses (id) on delete cascade on update cascade, id text not null check (id ~ '^[a-z0-9-]{1,60}$'),
  sort int not null default 0, title text not null check (char_length(title) between 1 and 160), mins int not null default 5, body text not null default '',
  "check" jsonb, practice jsonb, desmos jsonb, desmos_bounds jsonb, hidden boolean not null default false, updated_at timestamptz not null default now(),
  primary key (course_id, id)
);
create table if not exists public.decks (
  id text primary key check (id ~ '^[a-z0-9-]{1,60}$'), title text not null, "desc" text not null default '', tag text not null default '',
  cards jsonb not null default '[]'::jsonb, sort int not null default 0, hidden boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists public.questions (
  id bigint generated always as identity primary key, test text not null check (test in ('SAT', 'ACT')), section text not null, domain text not null,
  skill text not null, difficulty int not null default 2 check (difficulty between 1 and 3), passage text not null default '', stem text not null,
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 5), answer int not null,
  expl text not null default '', hidden boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.hidden_questions (id text primary key, note text not null default '', created_at timestamptz not null default now());
do $$ declare t text; begin
  foreach t in array array['courses', 'lessons', 'decks', 'questions', 'hidden_questions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "anyone reads %1$s" on public.%1$I', t);
    execute format('create policy "anyone reads %1$s" on public.%1$I for select using (true)', t);
    execute format('drop policy if exists "admins write %1$s" on public.%1$I', t);
    execute format('create policy "admins write %1$s" on public.%1$I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;
create index if not exists lessons_course_sort on public.lessons (course_id, sort);
create index if not exists questions_test on public.questions (test, section);
-- Apps compare this to their cached copy and only download content when it changes.
create or replace function public.content_version() returns text language sql stable security definer set search_path = '' as $$
  select coalesce(greatest((select max(updated_at) from public.courses), (select max(updated_at) from public.lessons), (select max(updated_at) from public.decks),
    (select max(updated_at) from public.questions), (select max(created_at) from public.hidden_questions))::text, '')
    || ':' || (select count(*) from public.hidden_questions)::text || ':' || (select count(*) from public.lessons)::text || ':' || (select count(*) from public.courses)::text
    || ':' || (select count(*) from public.questions)::text || ':' || (select count(*) from public.decks)::text;
$$;
grant execute on function public.content_version() to anon, authenticated;
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['courses', 'lessons', 'decks', 'questions'] loop
    execute format('drop trigger if exists touch on public.%I', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- AP question bank (#/ap): multiple choice by course, unit, and concept. Loaded per course, not part of content_version().
create table if not exists public.ap_questions (
  id bigint generated always as identity primary key,
  course_id text not null references public.courses (id) on delete cascade on update cascade,
  unit text not null, concept text not null default '',
  difficulty int not null default 2 check (difficulty between 1 and 3),
  stem text not null, choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 5),
  answer int not null, expl text not null default '', hidden boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ap_questions_course on public.ap_questions (course_id, unit);
alter table public.ap_questions enable row level security;
create policy "anyone reads ap_questions" on public.ap_questions for select using (true);
create policy "admins write ap_questions" on public.ap_questions for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create trigger touch before update on public.ap_questions for each row execute function public.touch_updated_at();
create or replace function public.ap_bank_version(cid text) returns text language sql stable security definer set search_path = '' as $$
  select coalesce(max(updated_at)::text, '') || ':' || count(*)::text from public.ap_questions where course_id = cid;
$$;
grant execute on function public.ap_bank_version(text) to anon, authenticated;
create or replace function public.ap_bank_counts() returns table (course_id text, unit text, n bigint) language sql stable security definer set search_path = '' as $$
  select course_id, unit, count(*) from public.ap_questions where not hidden group by 1, 2;
$$;
grant execute on function public.ap_bank_counts() to anon, authenticated;

-- News photos: public bucket, admins upload.
alter table public.news add column if not exists image_url text not null default '' check (image_url = '' or image_url ~ '^https://');
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('news-images', 'news-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']) on conflict (id) do nothing;
create policy "admins upload news images" on storage.objects for insert to authenticated with check (bucket_id = 'news-images' and (select public.is_admin()));
create policy "admins delete news images" on storage.objects for delete to authenticated using (bucket_id = 'news-images' and (select public.is_admin()));

-- Flashcard Match leaderboard. set_key is the built-in deck id, or a hash of a personal set's cards
-- so shared copies of the same set share one board.
create table if not exists public.match_scores (
  id bigint generated always as identity primary key,
  set_key text not null check (char_length(set_key) between 1 and 120),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  seconds numeric(6,1) not null check (seconds >= 1 and seconds < 3600),
  created_at timestamptz not null default now()
);
create index if not exists match_scores_set_idx on public.match_scores (set_key, seconds);
alter table public.match_scores enable row level security;
create policy "match scores are public" on public.match_scores for select to anon, authenticated using (true);
create policy "players add their own scores" on public.match_scores for insert to authenticated with check (user_id = auth.uid());
create policy "players delete their own scores" on public.match_scores for delete to authenticated using (user_id = auth.uid());
