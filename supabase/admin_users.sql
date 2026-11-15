-- Admin console "Users" tab: one row per account with sign-up, last login, days active, and referrals.
-- Applied to the live project as migration "admin_users". Safe to re-run.
-- "Days active" counts user_activity rows (one per student per day), the closest thing to a login count
-- Supabase keeps: sessions refresh silently, so real sign-in events are rare.
create or replace function public.admin_users() returns table (
  no bigint, name text, email text, signed_up timestamptz, last_login timestamptz, days_active bigint,
  last_active date, platforms text, referred_by bigint, referred_by_name text, referrals bigint, referral_nos bigint[]
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  return query
  select m.no, coalesce(nullif(m.display_name, ''), ''), u.email::text, coalesce(u.created_at, m.created_at), u.last_sign_in_at,
    (select count(*) from public.user_activity a where a.user_id = m.user_id),
    (select max(a.day) from public.user_activity a where a.user_id = m.user_id),
    (select string_agg(distinct a.platform, ', ') from public.user_activity a where a.user_id = m.user_id),
    m.referred_by, (select nullif(p.display_name, '') from public.members p where p.no = m.referred_by),
    (select count(*) from public.members r where r.referred_by = m.no and r.user_id is not null),
    (select coalesce(array_agg(r.no order by r.no), '{}') from public.members r where r.referred_by = m.no and r.user_id is not null)
  from public.members m left join auth.users u on u.id = m.user_id
  where m.user_id is not null
  order by m.no;
end $$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
