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

## Google and Apple sign-in (cross-device progress)

Every page except Home, Log in, Sign up, Privacy, and Terms requires an account. Without setup, the site works fully offline: email accounts save progress in the browser. To turn on Google/Apple sign-in and cloud sync:

1. Create a free project at https://supabase.com.
2. In the SQL editor, run `supabase/schema.sql` (creates the `progress` table with per-user access rules).
3. Authentication → Providers: enable **Google** (needs an OAuth client ID/secret from Google Cloud Console) and **Apple** (needs an Apple Developer account: Services ID, key, and team ID). Supabase's docs for each provider walk through it.
4. Authentication → URL Configuration: set the Site URL to your deployed URL and add `http://localhost:8080` to the redirect allow list.
5. Put the project URL and anon (publishable) key in `js/config.js`.

Signing in merges any guest progress on the device into the account. After that, every save syncs automatically (debounced, and flushed when the tab is hidden).

## What's inside

| Area | Files |
|---|---|
| Free courses by subject (registry and SAT/ACT courses in `courses.js`; school courses in `courses-math.js`, `courses-science.js`, `courses-humanities.js`; AP courses in `courses-ap-*.js`) | `js/content/courses*.js`, `js/views/learn.js` |
| Math generators (26 skill families, 3 difficulties, SAT + ACT) | `js/gen/math.js` |
| Reading/Writing + ACT English/Reading | `js/gen/rw.js`, `js/content/rw-bank.js`, `js/content/act-reading.js` |
| ACT Science (procedural experiments with tables and graphs) | `js/gen/science.js` |
| Registry, taxonomy, practice-set builder | `js/gen/index.js` |
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
