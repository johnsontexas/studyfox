-- Classes and study groups. Anyone signed in can make one from their dashboard and gets a join code.
-- The person who makes it is its admin. Students join with the code (during onboarding or later).
--   kind 'class': only the admin shares flashcard sets and manages the class (a teacher's class).
--   kind 'group': every member can share sets with the group (friends studying together).
-- topic (optional) is a study option id: 'SAT', 'ACT', or an AP course id like 'ap-bio'.
-- The leaderboard counts correct answers, only in that topic when one is set, read from each
-- member's synced progress. Nobody reads these tables directly; everything goes through the functions.
-- Safe to re-run.

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null check (char_length(name) between 1 and 60),
  kind text not null default 'class' check (kind in ('class', 'group')),
  topic text check (topic is null or char_length(topic) <= 40),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;

create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create index if not exists class_members_user on public.class_members (user_id);
alter table public.class_members enable row level security;

create table if not exists public.class_sets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null,
  added_name text not null default '',
  title text not null check (char_length(title) between 1 and 120),
  set jsonb not null,                 -- { title, desc, cards: [{ t, d }] }
  created_at timestamptz not null default now()
);
create index if not exists class_sets_class on public.class_sets (class_id, created_at desc);
alter table public.class_sets enable row level security;

-- Correct answers in a topic (or everything when topic is null) from a progress blob.
create or replace function public.class_score(p jsonb, p_topic text) returns bigint
 language sql immutable set search_path to '' as $$
  select case
    when p_topic in ('SAT', 'ACT') then
      (select coalesce(sum((v->>'c')::bigint), 0) from jsonb_each(coalesce(p->'stats', '{}')) s(k, v) where k like p_topic || '|%')
    when p_topic is null then
      (select coalesce(sum((v->>'c')::bigint), 0) from jsonb_each(coalesce(p->'stats', '{}')) s(k, v))
      + (select count(*) from jsonb_each(coalesce(p->'ap', '{}')) a(k, v) where v->>'c' = '1')
    else
      (select count(*) from jsonb_each(coalesce(p->'ap', '{}')) a(k, v) where v->>'cid' = p_topic and v->>'c' = '1')
  end
$$;

-- Six-letter join code without look-alike letters (no I, L, O, 0, 1).
create or replace function public.class_new_code() returns text
 language plpgsql volatile set search_path to '' as $$
declare abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; c text;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); end loop;
    exit when not exists (select 1 from public.classes where code = c);
  end loop;
  return c;
end $$;

create or replace function public.class_is_member(p_class uuid) returns boolean
 language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.class_members where class_id = p_class and user_id = auth.uid())
$$;

create or replace function public.class_is_owner(p_class uuid) returns boolean
 language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.classes where id = p_class and owner = auth.uid())
$$;

-- Make a class or group. The maker joins it as its admin. Returns the class id.
create or replace function public.class_create(p_name text, p_kind text, p_topic text, p_member_name text) returns uuid
 language plpgsql security definer set search_path to '' as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in to make a class.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Give it a name.'; end if;
  if (select count(*) from public.classes where owner = auth.uid()) >= 20 then raise exception 'You can run up to 20 classes and groups.'; end if;
  insert into public.classes (code, name, kind, topic, owner)
    values (public.class_new_code(), left(trim(p_name), 60), case when p_kind = 'group' then 'group' else 'class' end, nullif(trim(coalesce(p_topic, '')), ''), auth.uid())
    returning id into cid;
  insert into public.class_members (class_id, user_id, name) values (cid, auth.uid(), left(coalesce(p_member_name, ''), 40));
  return cid;
end $$;

-- Join with a code. Returns the class id. Joining twice is fine.
create or replace function public.class_join(p_code text, p_member_name text) returns uuid
 language plpgsql security definer set search_path to '' as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in to join a class.'; end if;
  select id into cid from public.classes where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if cid is null then raise exception 'No class or group has that code. Check it and try again.'; end if;
  if not public.class_is_member(cid) and (select count(*) from public.class_members where user_id = auth.uid()) >= 30 then
    raise exception 'You can be in up to 30 classes and groups.'; end if;
  insert into public.class_members (class_id, user_id, name) values (cid, auth.uid(), left(coalesce(p_member_name, ''), 40))
    on conflict (class_id, user_id) do update set name = excluded.name;
  return cid;
end $$;

-- Leave a class. The admin can't leave their own class (they delete it instead).
create or replace function public.class_leave(p_class uuid) returns void
 language plpgsql security definer set search_path to '' as $$
begin
  if public.class_is_owner(p_class) then raise exception 'You run this one. Delete it instead.'; end if;
  delete from public.class_members where class_id = p_class and user_id = auth.uid();
end $$;

-- The caller's classes and groups.
create or replace function public.my_classes() returns table (id uuid, name text, kind text, topic text, code text, is_owner boolean, members bigint, sets bigint)
 language sql stable security definer set search_path to '' as $$
  select c.id, c.name, c.kind, c.topic, c.code, c.owner = auth.uid(),
    (select count(*) from public.class_members x where x.class_id = c.id),
    (select count(*) from public.class_sets s where s.class_id = c.id)
  from public.classes c join public.class_members m on m.class_id = c.id and m.user_id = auth.uid()
  order by m.joined_at desc
$$;

-- One class for a member: info, leaderboard, and shared sets.
create or replace function public.class_detail(p_class uuid) returns jsonb
 language plpgsql stable security definer set search_path to '' as $$
declare c public.classes;
begin
  if not public.class_is_member(p_class) then raise exception 'You are not in this class.'; end if;
  select * into c from public.classes where id = p_class;
  return jsonb_build_object(
    'id', c.id, 'name', c.name, 'kind', c.kind, 'topic', c.topic, 'code', c.code,
    'is_owner', c.owner = auth.uid(), 'can_share', c.owner = auth.uid() or c.kind = 'group',
    'board', coalesce((select jsonb_agg(r order by r.score desc, r.name) from (
        select m.user_id, m.name, m.user_id = c.owner as owner, m.user_id = auth.uid() as me,
          coalesce(public.class_score(p.data, c.topic), 0) as score, mb.avatar
        from public.class_members m left join public.progress p on p.user_id = m.user_id
          left join public.members mb on mb.user_id = m.user_id
        where m.class_id = c.id) r), '[]'),
    'sets', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'added_name', s.added_name,
        'mine', s.added_by = auth.uid(), 'count', jsonb_array_length(coalesce(s.set->'cards', '[]')), 'created_at', s.created_at) order by s.created_at desc)
      from public.class_sets s where s.class_id = c.id), '[]'));
end $$;

-- One shared set with its cards (members only).
create or replace function public.class_set(p_set uuid) returns jsonb
 language plpgsql stable security definer set search_path to '' as $$
declare s public.class_sets;
begin
  select * into s from public.class_sets where id = p_set;
  if s is null or not public.class_is_member(s.class_id) then raise exception 'That set is not shared with you.'; end if;
  return s.set || jsonb_build_object('id', s.id, 'class_id', s.class_id);
end $$;

-- Share a flashcard set. Classes: admin only. Groups: any member.
create or replace function public.class_share_set(p_class uuid, p_set jsonb, p_member_name text) returns uuid
 language plpgsql security definer set search_path to '' as $$
declare sid uuid; k text;
begin
  select kind into k from public.classes where id = p_class;
  if not public.class_is_member(p_class) then raise exception 'You are not in this class.'; end if;
  if k = 'class' and not public.class_is_owner(p_class) then raise exception 'Only the class admin can share sets here.'; end if;
  if jsonb_typeof(p_set->'cards') <> 'array' or jsonb_array_length(p_set->'cards') = 0 then raise exception 'That set has no cards.'; end if;
  if jsonb_array_length(p_set->'cards') > 1000 or length(p_set::text) > 500000 then raise exception 'That set is too big to share.'; end if;
  if (select count(*) from public.class_sets where class_id = p_class) >= 200 then raise exception 'This class already has 200 sets.'; end if;
  insert into public.class_sets (class_id, added_by, added_name, title, set)
    values (p_class, auth.uid(), left(coalesce(p_member_name, ''), 40), left(coalesce(nullif(trim(p_set->>'title'), ''), 'Untitled set'), 120),
      jsonb_build_object('title', p_set->'title', 'desc', coalesce(p_set->'desc', '""'), 'cards', p_set->'cards'))
    returning id into sid;
  return sid;
end $$;

-- Remove a shared set: whoever shared it, or the class admin.
create or replace function public.class_unshare_set(p_set uuid) returns void
 language plpgsql security definer set search_path to '' as $$
begin
  delete from public.class_sets s where s.id = p_set and (s.added_by = auth.uid() or public.class_is_owner(s.class_id));
end $$;

-- Admin tools: rename, change kind or topic, new code, remove a member, delete.
create or replace function public.class_update(p_class uuid, p_name text, p_kind text, p_topic text) returns void
 language plpgsql security definer set search_path to '' as $$
begin
  if not public.class_is_owner(p_class) then raise exception 'Only the class admin can change this.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Give it a name.'; end if;
  update public.classes set name = left(trim(p_name), 60), kind = case when p_kind = 'group' then 'group' else 'class' end,
    topic = nullif(trim(coalesce(p_topic, '')), '') where id = p_class;
end $$;

create or replace function public.class_new_join_code(p_class uuid) returns text
 language plpgsql security definer set search_path to '' as $$
declare c text := public.class_new_code();
begin
  if not public.class_is_owner(p_class) then raise exception 'Only the class admin can change the code.'; end if;
  update public.classes set code = c where id = p_class;
  return c;
end $$;

create or replace function public.class_remove_member(p_class uuid, p_user uuid) returns void
 language plpgsql security definer set search_path to '' as $$
begin
  if not public.class_is_owner(p_class) then raise exception 'Only the class admin can remove people.'; end if;
  if p_user = auth.uid() then raise exception 'You can''t remove yourself.'; end if;
  delete from public.class_members where class_id = p_class and user_id = p_user;
end $$;

create or replace function public.class_delete(p_class uuid) returns void
 language plpgsql security definer set search_path to '' as $$
begin
  if not public.class_is_owner(p_class) then raise exception 'Only the class admin can delete it.'; end if;
  delete from public.classes where id = p_class;
end $$;

revoke all on function public.class_score(jsonb, text), public.class_new_code(), public.class_is_member(uuid), public.class_is_owner(uuid),
  public.class_create(text, text, text, text), public.class_join(text, text), public.class_leave(uuid), public.my_classes(),
  public.class_detail(uuid), public.class_set(uuid), public.class_share_set(uuid, jsonb, text), public.class_unshare_set(uuid),
  public.class_update(uuid, text, text, text), public.class_new_join_code(uuid), public.class_remove_member(uuid, uuid), public.class_delete(uuid)
  from public, anon, authenticated;
grant execute on function public.class_create(text, text, text, text), public.class_join(text, text), public.class_leave(uuid), public.my_classes(),
  public.class_detail(uuid), public.class_set(uuid), public.class_share_set(uuid, jsonb, text), public.class_unshare_set(uuid),
  public.class_update(uuid, text, text, text), public.class_new_join_code(uuid), public.class_remove_member(uuid, uuid), public.class_delete(uuid)
  to authenticated;
