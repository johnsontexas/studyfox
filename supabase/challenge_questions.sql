-- Hardest questions: a challenge flag on both question tables. Challenge questions leave the regular
-- banks and make up their own "Hardest questions" set (js/content/ap-bank.js, course id 'hardest').
alter table public.questions add column if not exists challenge boolean not null default false;
alter table public.ap_questions add column if not exists challenge boolean not null default false;

create or replace function public.ap_bank_counts() returns table(course_id text, unit text, n bigint)
 language sql stable security definer set search_path to '' as $$
  select course_id, unit, count(*) from public.ap_questions where not hidden and not challenge group by 1, 2;
$$;

create or replace function public.ap_bank_version(cid text) returns text
 language sql stable security definer set search_path to '' as $$
  select case when cid = 'hardest' then
    coalesce(greatest((select max(updated_at) from public.ap_questions where challenge), (select max(updated_at) from public.questions where challenge))::text, '')
    || ':' || ((select count(*) from public.ap_questions where challenge) + (select count(*) from public.questions where challenge))::text
  else (select coalesce(max(updated_at)::text, '') || ':' || count(*)::text from public.ap_questions where course_id = cid) end;
$$;
