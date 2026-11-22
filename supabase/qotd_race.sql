-- Question of the Day race. One shared SAT question a day (days start at midnight Central).
-- Students press Start, the server records the time, and the question comes back without its answer.
-- Their one answer is graded and timed on the server. Correct answers go on the day's leaderboard,
-- fastest first. Wrong answers still get the explanation but no board spot.
-- Questions are filled ahead of time by tools/qotd-fill.mjs (the site's own generator).
-- Nobody reads these tables directly; everything goes through the functions below.

create table if not exists public.qotd_days (
  day date primary key,
  question jsonb not null            -- full question, including answer and explanation
);
alter table public.qotd_days enable row level security;

create table if not exists public.qotd_attempts (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null,
  name text not null default '',
  started_at timestamptz not null default clock_timestamp(),
  answered_at timestamptz,
  chosen int,
  correct boolean,
  ms int,
  primary key (user_id, day)
);
alter table public.qotd_attempts enable row level security;
create index if not exists qotd_attempts_board on public.qotd_attempts (day, ms) where correct;

create or replace function public.qotd_today() returns date
 language sql stable set search_path to '' as $$ select (now() at time zone 'America/Chicago')::date $$;

-- The question with its answer, explanation and per-choice notes removed.
create or replace function public.qotd_public(q jsonb) returns jsonb
 language sql immutable set search_path to '' as $$ select q - 'answer' - 'expl' - 'choiceExpl' - 'accept' - 'answerDisplay' - 'steps' - 'hint' $$;

-- What today looks like for the caller, without starting anything:
-- {day, available, status: 'new' | 'started' | 'done', ...} (no question text until they start).
create or replace function public.qotd_status() returns jsonb
 language plpgsql stable security definer set search_path to '' as $$
declare d date := public.qotd_today(); q jsonb; a public.qotd_attempts;
begin
  select question into q from public.qotd_days where day = d;
  if q is null then return jsonb_build_object('day', d, 'available', false); end if;
  if auth.uid() is null then return jsonb_build_object('day', d, 'available', true, 'status', 'new', 'section', q->'section', 'domain', q->'domain'); end if;
  select * into a from public.qotd_attempts where user_id = auth.uid() and day = d;
  if a is null then return jsonb_build_object('day', d, 'available', true, 'status', 'new', 'section', q->'section', 'domain', q->'domain'); end if;
  if a.answered_at is null then return jsonb_build_object('day', d, 'available', true, 'status', 'started', 'question', public.qotd_public(q), 'started_at', a.started_at); end if;
  return jsonb_build_object('day', d, 'available', true, 'status', 'done', 'question', q, 'chosen', a.chosen, 'correct', a.correct, 'ms', a.ms,
    'rank', case when a.correct then (select count(*) from public.qotd_attempts x where x.day = d and x.correct and x.ms < a.ms) + 1 end,
    'beat', (select round(100.0 * count(*) filter (where not x.correct or x.ms > a.ms) / greatest(count(*), 1)) from public.qotd_attempts x where x.day = d and x.answered_at is not null and x.user_id <> a.user_id));
end $$;

-- Start the clock (once per day; starting again keeps the first start time) and get the question.
create or replace function public.qotd_start(p_name text) returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare d date := public.qotd_today(); q jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in to play the Question of the Day race.'; end if;
  select question into q from public.qotd_days where day = d;
  if q is null then raise exception 'There is no question today. Check back tomorrow.'; end if;
  insert into public.qotd_attempts (user_id, day, name) values (auth.uid(), d, left(coalesce(p_name, ''), 40)) on conflict do nothing;
  return public.qotd_status();
end $$;

-- Lock in the one answer. Time is measured on the server from Start to now.
create or replace function public.qotd_answer(p_choice int) returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare d date := public.qotd_today(); q jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in to play the Question of the Day race.'; end if;
  select question into q from public.qotd_days where day = d;
  update public.qotd_attempts set answered_at = clock_timestamp(), chosen = p_choice,
    correct = (p_choice = (q->>'answer')::int),
    ms = least(extract(epoch from clock_timestamp() - started_at) * 1000, 2147483647)::int
   where user_id = auth.uid() and day = d and answered_at is null;
  return public.qotd_status();
end $$;

-- Fastest correct answers for a day (default today). Public, like the Match leaderboards.
create or replace function public.qotd_board(p_day date default null) returns table(user_id uuid, name text, ms int)
 language sql stable security definer set search_path to '' as $$
  select user_id, name, ms from public.qotd_attempts
   where day = coalesce(p_day, public.qotd_today()) and correct order by ms limit 50;
$$;

revoke all on function public.qotd_status(), public.qotd_start(text), public.qotd_answer(int), public.qotd_board(date) from public, anon, authenticated;
grant execute on function public.qotd_status(), public.qotd_board(date) to anon, authenticated;
grant execute on function public.qotd_start(text), public.qotd_answer(int) to authenticated;
