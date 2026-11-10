# StudyFox: free study material for school

Created by Daniel Johnson. Free courses for math (Algebra 1 through Calculus, Statistics), science (Biology, Chemistry, Physics), English, history, and study skills, plus 28 AP courses (every AP history, social science, science, English, math, computer science, and arts course, and AP world language exam skills), flashcards, and full SAT and ACT prep. No ads, no paywalls, no limits. A static web app (plain HTML/CSS/JavaScript modules, no build step).

## Run it locally

```bash
cd ~/Downloads/Projects/PracTee
python3 -m http.server 8080
```

Then open http://localhost:8080. The page has to be served over HTTP (not opened as a file), because it uses JavaScript modules.

## Test the question generators

```bash
npm test
```

This first checks every course and lesson (duplicate ids, quick-check answers, unbalanced `$` math), then generates about 34,000 questions and 40 full practice tests and checks each one for malformed output: duplicate choices, NaN or undefined values, bad answer keys, grid-in answers that are too long, and unsimplified math like `1x` or `+ 0`.

## Deploy for free

Any static host works: Netlify (drag the folder onto app.netlify.com/drop), GitHub Pages, Cloudflare Pages, or Vercel.

Before launch, get a free production key at https://www.desmos.com/api and replace `DESMOS_KEY` in `js/tools.js`. The current key is Desmos's public demo key, which shows a "Trial Key" badge.

## Google Search

`sitemap.xml` and `robots.txt` sit at the site root. In Google Search Console, add the property `https://studyfox.org`, verify it, then submit `https://studyfox.org/sitemap.xml` under Sitemaps. Pages use hash URLs (`#/learn`) and most need sign-in, so the sitemap lists the homepage only.

## Google and Apple sign-in (cross-device progress)

Every page except Home, Log in, Sign up, Privacy, and Terms requires an account. Without setup, the site works fully offline: email accounts save progress in the browser. To turn on Google/Apple sign-in and cloud sync:

1. Create a free project at https://supabase.com.
2. In the SQL editor, run `supabase/schema.sql` (creates the `progress` table with per-user access rules).
3. Authentication → Providers: enable **Google** (needs an OAuth client ID/secret from Google Cloud Console) and **Apple** (needs an Apple Developer account: Services ID, key, and team ID). Supabase's docs for each provider walk through it.
4. Authentication → URL Configuration: set the Site URL to your deployed URL and add `http://localhost:8080` to the redirect allow list.
5. Put the project URL and anon (publishable) key in `js/config.js`.

Signing in merges any guest progress on the device into the account. After that, every save syncs automatically (debounced, and flushed when the tab is hidden).

## Editing content without a deploy

Courses, lessons, flashcard decks, and hand-written questions live in Supabase (tables `courses`, `lessons`, `decks`, `questions`, `hidden_questions`; see `supabase/schema.sql`). Edit them in the admin console: **Admin → Lessons, decks, and questions** (`#/admin/content`). Changes show up on the website and in the iOS app the next time someone opens them; there's nothing to deploy or resubmit.

- `js/content/live.js` loads the content (cached, and only re-downloaded when `content_version()` changes) and swaps it into `COURSES` and `BUILTIN_DECKS`, so every page and the app use it.
- The files in `js/content/` are the built-in copy: used if someone opens the site offline for the first time, and the source that seeded the database. Editing them no longer changes what students see once the database has content; edit in the admin console instead.
- Generated math and science questions come from code (`js/gen/`). In the console you can hide any of them by bank number, and add your own questions, which join the end of the numbered bank.

### Interactive lessons, explanations, and settings

- **Interactive lessons.** A lesson's `blocks` column (Supabase `lessons.blocks`) holds an ordered list of blocks: text, callouts, multiple choice, select-all, type-the-answer (with common wrong answers and the mistake behind each), put-in-order, match pairs, think-then-reveal, step-by-step examples, flip cards, Desmos, images, YouTube videos, and screen breaks. Every type and its fields are documented at the top of `js/content/blocks.js`. Build them in **Admin > Content > Courses > (lesson) > Interactive lesson**, with a live preview. Lessons without blocks still play in the same player (`js/views/lesson-player.js`). Algebra 1's "Solving linear equations" and "Slope" are full examples.
- **Why each answer is right or wrong.** Questions (`questions`, `ap_questions`) have `choice_expl` (one note per choice: why it's right, or the mistake that leads to it), `hint`, and `steps`. Students who miss see the note for the choice they picked, then every choice explained (`js/explain.js`, `js/qview.js`). For generated math, wrong numbers are checked for common slips (sign flip, reciprocal, off by one, doubled, and so on). Edit AP questions in **Admin > Content > AP questions**; fill in the thin ones in bulk with `ANTHROPIC_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node tools/enrich-ap-questions.mjs --course ap-bio --limit 50` (add `--dry` to preview).
- **Generated questions explain their wrong answers.** In `js/gen/math.js` and `js/gen/science.js`, wrong answers are written as `Wx(value, 'the mistake that produces it')` (`W` in `js/util.js`). This never changes which questions are generated. Reading/Writing bank items can add `ww` (one reason per wrong answer, same order as `w`). After checking an answer, students can tap any choice to see why it's right or wrong.
- **Deeper lessons.** Every Algebra 1 lesson is a full interactive lesson; use them as the model. `ANTHROPIC_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node tools/deepen-lessons.mjs --course geometry --limit 3` drafts the same kind of lesson for classic lessons (add `--dry` to preview), checks every block, and saves it for you to review in the admin console.
- **Appearance.** Settings has color themes (presets plus custom colors) and fonts, including OpenDyslexic (`js/appearance.js`, `js/a11y.js`), and an option to hide other students' names on leaderboards.
- **Settings.** How lessons and feedback behave (one screen at a time or scrolling, tries before the answer shows, hints, mistake tags) and the "How did you hear about StudyFox?" choices live in `content_settings`, edited in **Admin > Content > Settings**. Defaults are in `js/content/settings.js`.
- **People and pages.** The Contributors page, footer credit, and About page come from `contributors` and `site_pages` (**Admin > Content > People and pages**).
- **User numbers and referrals.** Every account gets the next number in `members` when it signs up (#1 was the first student). Numbers never change or get reused, even after an account is deleted. Referral links are `studyfox.org/referral/<number>` (redirect in `netlify.toml`); onboarding fills in the friend's number, and the Contributors page lists top sharers by first name (students can opt out in Settings). SQL: `supabase/interactive_courses.sql`, `supabase/members_and_contributors.sql`.

## iOS app

`mobile/` is an Expo app (the phone version, built around flashcards and quick study). It uses the same Supabase project, so Google and Apple accounts share progress between the app and the site. See `mobile/README.md` to run and ship it.

**Keeping the app in sync:** the app imports this site's code directly (`js/content`, `js/gen`, `js/store.js`, `js/icons.js`, `js/config.js`, the legal and formula pages, and the colors in `css/styles.css`). New courses, lessons, decks, and question generators show up in the app with no extra work. `npm test` also checks every export the app depends on, so renaming one fails the tests. A brand-new page or feature on the site needs a matching screen in `mobile/src/app/`.

## What's inside

| Area | Files |
|---|---|
| Free courses by subject (registry and SAT/ACT courses in `courses.js`; school courses in `courses-math.js`, `courses-science.js`, `courses-humanities.js`; AP courses in `courses-ap-*.js`) | `js/content/courses*.js`, `js/views/learn.js` |
| Math generators (26 skill families, 3 difficulties, SAT + ACT) | `js/gen/math.js` |
| Reading/Writing + ACT English/Reading | `js/gen/rw.js`, `js/content/rw-bank.js`, `js/content/act-reading.js` |
| ACT Science (procedural experiments with tables and graphs) | `js/gen/science.js` |
| Registry, taxonomy, practice-set builder | `js/gen/index.js` |
| Numbered question bank (SAT #1, ACT #1, ...; fixed seeds so numbers are stable) | `js/gen/bank.js` |
| Practice tests (adaptive SAT modules, ACT sections, scoring) | `js/exams.js` |
| Test-day interface (timer, navigator, eliminator, highlighter, mark for review) | `js/views/runner.js` |
| Desmos, reference sheet, modals | `js/tools.js` |
| Flashcards (Flashcards / Learn / Test / Match, import, share links) | `js/views/flashcards.js`, `js/content/decks.js` |
| Accounts and progress (localStorage + Supabase sync) | `js/store.js`, `js/cloud.js`, `js/config.js` |
| Speed practice (timed sprint, personal bests) | `js/views/speed.js` |
| Privacy Policy and Terms of Use | `js/views/legal.js` |
| Native-language help for English learners (translated explanations and questions) | `js/i18n.js` |

Every generated question has an ID (`generator|test|difficulty|seed`) that regenerates it exactly. That lets the mistake log, results pages, and test codes work without storing question text.

## Adding content

- **New math skill:** add a generator with `add({ key, sat, act, gen(r, d) {...} })` in `js/gen/math.js`, then run `npm test`.
- **More reading/writing questions:** add items to the arrays in `js/content/rw-bank.js`. They show up automatically.
- **More ACT reading passages:** add to `js/content/act-reading.js`.
- **New built-in flashcard deck:** add to `js/content/decks.js`.
- **New course or lesson:** add it to the matching `js/content/courses-*.js` file (or `courses.js` for SAT/ACT), with a `subject` from `SUBJECTS` in `courses.js`. Mark AP courses with `ap: true` so they show under the AP filter. A `$` starts KaTeX math, so write money as "dollars" in prose, and use the `table()` helper from `lesson-kit.js` for tables. Each lesson can include an embedded Desmos calculator (`desmos`), a quick check question (`check`), and a link to practice specific skills (`practice`).

## Known limits and next steps

- Email accounts are device-only. Google and Apple accounts sync once Supabase is configured (see above).
- Review `js/views/legal.js` with someone qualified before launch; it is a reasonable starting draft, not legal advice.
- The reading/writing bank is hand-written and finite (~85 items plus unlimited generated transitions and data questions), so heavy users will see repeats. Adding items is the highest-value content work.
- Scores are estimates. The real SAT uses IRT-based equating, which isn't public.
