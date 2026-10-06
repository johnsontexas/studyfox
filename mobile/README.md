# StudyFox iOS app (Expo)

The phone version of studyfox.org, built for quick study sessions: swipe flashcards, 5-question sets, speed rounds, and short lessons. It uses the same Supabase project, so a student who signs in with Google or Apple sees the same progress, flashcard sets, mistakes, and streak on the app and the website.

## How it stays in sync with the website

The app does not have its own copy of the content. It imports the website's code directly from `../js`:

| Shared from the website | Used for |
|---|---|
| `js/content/*` (courses, decks) | Courses, lessons, built-in flashcard sets |
| `js/gen/*` (question generators, numbered bank) | Quick sets, speed rounds, question of the day, bank numbers |
| `js/store.js` | Progress, accounts, flashcard sets, streaks, merge rules for sync |
| `js/views/legal.js`, `js/views/formulas.js` | Privacy Policy, Terms, formula sheet (same HTML) |
| `js/icons.js` | Icons in web previews (on iPhone the app uses SF Symbols) |
| `js/config.js` | Supabase project, creator, links |
| `css/styles.css` | Brand and figure colors (light and dark) |

So adding a course, a lesson, a flashcard deck, or a question generator on the website adds it to the app too. `scripts/sync-web.mjs` copies the site's color tokens into `src/generated/site.ts`; it runs automatically on `npm start`, `npm run web`, and EAS builds.

The app is fully native: lessons, questions, the formula sheet, and the legal pages are drawn with native views by `src/components/Rich.tsx`, and math is drawn as native SVG by MathJax (`src/components/Math.tsx`). Only the Desmos calculator uses a web view, since Desmos is itself a website. If lessons on the site start using a new HTML tag or CSS class, teach `Rich.tsx` how to draw it.

`npm test` (here or at the repo root) checks that every website export the app depends on still exists, that every course icon has an SF Symbol in the app, and that every math expression in the content renders natively. A change on the website that would break the app fails the tests instead.

When a website change adds a whole new page or feature (not just content), the app needs a matching screen in `src/app/`.

## Run it

```bash
cd mobile
npm install
npm start
```

Scan the QR code with the Expo Go app on your iPhone. Google sign-in and email accounts work in Expo Go. Native Sign in with Apple needs a real build (below).

`npm run web` runs it in a browser, which is handy for a quick look.

## One-time Supabase setup for the app

In the Supabase dashboard for the project in `js/config.js`:

1. **Authentication → URL Configuration → Redirect URLs**: add `studyfox://**` (the app) and `exp://**` (Expo Go while developing).
2. **Authentication → Providers → Apple**: add `StudyFOx` (iOS bundle ID) to **Client IDs** so native Sign in with Apple is accepted.

## Build and ship to the App Store

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```

The first build asks you to log in to your Expo and Apple Developer accounts and creates the signing certificates. The iOS bundle ID is `StudyFOx` (Android package `org.studyfox.app`) (set in `app.json`; change it before the first submission if you want a different one). Bump `version` in `app.json` for each App Store release.

## Layout

- `src/app/` screens (Expo Router). Signed-in screens live in `(app)/`; tabs are in `(app)/(tabs)/`.
- `src/lib/shared.ts` the single place the app imports website code from.
- `src/lib/setup.ts` gives React Native the browser globals the website modules expect (localStorage, WebCrypto, a stand-in for KaTeX).
- `src/lib/cloud.ts` Google/Apple sign-in and progress sync (the app's version of `js/cloud.js`).
- `src/components/Rich.tsx` and `Math.tsx` draw the website's lesson and question content natively.
- `src/components/ui.tsx` is the iOS design kit (inset grouped lists, SF Symbols, native controls); `src/lib/theme.ts` has Apple's system colors with StudyFox green as the tint.

## Not in the app (yet)

Full-length timed practice tests open studyfox.org instead; they're long and work best on a computer. The "explain in my language" translation help for English learners is website-only for now.
