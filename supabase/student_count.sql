-- Public student count for the home page ("Join X other students"). Returns only a number.
create or replace function public.student_count() returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from auth.users
$$;
revoke all on function public.student_count() from public;
grant execute on function public.student_count() to anon, authenticated;
