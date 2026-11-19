-- Daily user growth for the unlisted /growth.html page. Returns only per-day totals (no user data),
-- the same kind of number student_count() already makes public.
create or replace function public.user_growth() returns table (day date, total_users int, new_users int)
language sql stable security definer set search_path = '' as $$
  select day, total_users, new_users from public.user_count order by day
$$;
revoke all on function public.user_growth() from public;
grant execute on function public.user_growth() to anon, authenticated;
