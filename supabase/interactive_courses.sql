-- Interactive courses, richer question explanations, editable behavior settings, and sign-up sources.
-- Applied to the live project as migration "interactive_courses_and_rich_explanations". Safe to re-run.

-- Interactive lessons: an ordered list of typed blocks (see js/content/blocks.js for every type and its fields).
-- null means the lesson still uses its classic HTML body + quick check (the player shows those too).
alter table public.lessons add column if not exists blocks jsonb check (blocks is null or jsonb_typeof(blocks) = 'array');

-- Richer questions: one explanation per choice (why it's right, or the mistake that leads to it), a hint, and solution steps.
alter table public.questions add column if not exists choice_expl jsonb check (choice_expl is null or jsonb_typeof(choice_expl) = 'array');
alter table public.questions add column if not exists hint text not null default '';
alter table public.questions add column if not exists steps jsonb check (steps is null or jsonb_typeof(steps) = 'array');
alter table public.ap_questions add column if not exists choice_expl jsonb check (choice_expl is null or jsonb_typeof(choice_expl) = 'array');
alter table public.ap_questions add column if not exists hint text not null default '';
alter table public.ap_questions add column if not exists steps jsonb check (steps is null or jsonb_typeof(steps) = 'array');

-- How lessons, question feedback, and onboarding behave. Everyone reads; admins edit (admin console > Content > Settings).
-- Defaults for every key also live in js/content/settings.js, so a missing key never breaks anything.
create table if not exists public.content_settings (
  key text primary key check (key ~ '^[a-z0-9_]{1,60}$'),
  value jsonb not null default '{}'::jsonb,
  note text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.content_settings enable row level security;
drop policy if exists "anyone reads content_settings" on public.content_settings;
create policy "anyone reads content_settings" on public.content_settings for select using (true);
drop policy if exists "admins write content_settings" on public.content_settings;
create policy "admins write content_settings" on public.content_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop trigger if exists touch on public.content_settings;
create trigger touch before update on public.content_settings for each row execute function public.touch_updated_at();

insert into public.content_settings (key, value, note) values
('lesson_player', '{
  "mode": "steps",
  "gate_questions": true,
  "max_tries": 2,
  "show_hint_after_wrong": true,
  "explain_every_choice": true,
  "celebrate": true
}', 'Interactive lessons. mode: "steps" (one screen at a time) or "scroll" (all at once). gate_questions: a question must be answered before Continue. max_tries: attempts before the answer is shown.'),
('question_feedback', '{
  "explain_every_choice": true,
  "show_hint_button": true,
  "second_try": false,
  "auto_detect_mistakes": true,
  "ask_what_went_wrong": true,
  "mistake_tags": ["Didn''t know the concept", "Misread the question", "Calculation slip", "Fell for a trap answer", "Ran out of time / guessed"]
}', 'Question banks and practice. explain_every_choice: show why each choice is right or wrong. second_try: let students retry once before revealing. auto_detect_mistakes: guess the mistake behind a wrong number (sign flip, off by one, ...). ask_what_went_wrong: ask students to tag their mistake.'),
('onboarding', '{
  "ask_heard_about": true,
  "heard_about_options": [
    {"id": "short_form", "label": "StudyFox short videos (TikTok, Reels, YouTube Shorts)"},
    {"id": "long_form", "label": "StudyFox long videos (YouTube)"},
    {"id": "other_creator", "label": "Another creator''s video or post"},
    {"id": "friend", "label": "A friend or classmate"},
    {"id": "teacher", "label": "A teacher, tutor, or counselor"},
    {"id": "search", "label": "Google or another search engine"},
    {"id": "ai", "label": "ChatGPT or another AI assistant"},
    {"id": "app_store", "label": "The App Store"},
    {"id": "other", "label": "Somewhere else"}
  ]
}', 'Sign-up questions. heard_about_options: the choices for "How did you hear about StudyFox?" (id is stored, label is shown).')
on conflict (key) do nothing;

-- "How did you hear about StudyFox?" answers. Students write their own row; admins read all.
create table if not exists public.signup_sources (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  source text not null check (char_length(source) between 1 and 40),
  detail text not null default '' check (char_length(detail) <= 200),
  platform text not null default 'web' check (platform in ('web', 'ios', 'android')),
  created_at timestamptz not null default now()
);
alter table public.signup_sources enable row level security;
drop policy if exists "students add their source" on public.signup_sources;
create policy "students add their source" on public.signup_sources for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "students update their source" on public.signup_sources;
create policy "students update their source" on public.signup_sources for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "admins read sources" on public.signup_sources;
create policy "admins read sources" on public.signup_sources for select to authenticated using ((select public.is_admin()) or user_id = (select auth.uid()));

-- Content version now also changes when settings change.
create or replace function public.content_version() returns text language sql stable security definer set search_path = '' as $$
  select coalesce(greatest((select max(updated_at) from public.courses), (select max(updated_at) from public.lessons), (select max(updated_at) from public.decks),
    (select max(updated_at) from public.questions), (select max(created_at) from public.hidden_questions), (select max(updated_at) from public.content_settings))::text, '')
    || ':' || (select count(*) from public.hidden_questions)::text || ':' || (select count(*) from public.lessons)::text || ':' || (select count(*) from public.courses)::text
    || ':' || (select count(*) from public.questions)::text || ':' || (select count(*) from public.decks)::text || ':' || (select count(*) from public.content_settings)::text;
$$;
grant execute on function public.content_version() to anon, authenticated;
