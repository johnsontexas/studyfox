-- Aggregate-only numbers for the public sponsor page (#/sponsor). No per-user data leaves this function.
create or replace function public.sponsor_stats()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'students',   (select count(*) from auth.users),
    'new_7d',     (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'new_30d',    (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'wau',        (select count(distinct user_id) from public.user_activity where day > current_date - 7),
    'mau',        (select count(distinct user_id) from public.user_activity where day > current_date - 30),
    'courses',    (select count(*) from public.courses where not coalesce(hidden, false)),
    'ap_courses', (select count(*) from public.courses where ap and not coalesce(hidden, false)),
    'questions',  (select count(*) from public.questions) + (select count(*) from public.ap_questions),
    'since',      (select min(created_at)::date from auth.users),
    'weekly',     (select coalesce(json_agg(json_build_object('wk', wk, 'n', n) order by wk), '[]'::json) from (
                     select date_trunc('week', created_at)::date wk, count(*) n from auth.users
                     where created_at > now() - interval '12 weeks' group by 1) t),
    'sources',    (select coalesce(json_agg(json_build_object('source', source, 'n', n) order by n desc), '[]'::json) from (
                     select source, count(*) n from public.signup_sources where source <> 'other' group by 1 order by 2 desc limit 6) t),
    'updated_at', now()
  );
$$;
revoke all on function public.sponsor_stats() from public;
grant execute on function public.sponsor_stats() to anon, authenticated;
