# StudyFox: App Store Connect answers

Everything below is ready to paste into App Store Connect for the iOS app in `mobile/`. Character counts are checked against Apple's limits.

Files in this folder:

- `StudyFox-App-Store-Assets.zip`: everything below in one file
- `screenshots/`: the 10 screenshots for iPhone 6.3" (1206×2622 and 1179×2556) and iPad 13" (2064×2752 and 2048×2732), each as PNG and JPG
- `creative-assets/`: product page header and search results assets (see "Header and search results" below)
- `app-icon-1024.png`: 1024×1024 App Store icon, no transparency

Upload the screenshots in file-name order:

1. Today: "Study for every class." (the whole app at a glance)
2. Flashcard set: "Make flashcards in seconds."
3. SAT question: "Get ready for the SAT."
4. AP Biology course: "49 classes. Every AP subject."
5. Lessons: "Short lessons that make it click."
6. Swipe study: "Swipe what you know."
7. SAT & ACT: "4,000+ practice questions."
8. Learn mode: "Quizzes you until it sticks."
9. Speed Rush: "How many SAT questions in 2 minutes?"
10. Progress: "Know exactly what to work on."

The first three show up in search results, so they cover the three big things: everything in one app, the flashcard maker, and SAT prep.

---

## Header and search results

In App Store Connect: your version page → **Header and Search Results**. There are two versions; pick one, or use both to compare with Product Page Optimization.

| File | Where it goes | Size |
|---|---|---|
| `A-every-class-header-3840x1646` (.png/.jpg) | Header | 3840×1646 (21:9) |
| `A-every-class-search-results-3840x2560` (.png/.jpg) | Search Results | 3840×2560 (3:2) |
| `A-every-class-universal-5244x2950.png` | Header or Search Results (one file for both) | 5244×2950 (16:9, PNG only) |
| `B-sat-…` | Same three, SAT-focused version | Same sizes |

- **A, "Study for every class":** the whole app, with the flashcard set, Today screen, and an SAT question.
- **B, "Get ready for the SAT":** SAT-focused, with the question bank, an answered question, and Speed Rush.

These follow Apple's creative asset rules: no transparency, a 4+ age rating, short text, and no prices, URLs, awards, or platform logos. Apple crops these differently on each device, so the logo, headline, and phones sit in the middle with plain background around the edges.

---

## App Information

| Field | Answer |
|---|---|
| **Name** (30 max) | `StudyFox: Courses & Flashcards` (30) |
| **Subtitle** (30 max) | `Every AP Class, SAT & ACT Prep` (30) |
| **Primary category** | Education |
| **Secondary category** | Reference |
| **Content rights** | "Yes, it contains, shows, or accesses third-party content, and I have the necessary rights." (The Desmos calculator loads from Desmos under their API terms. Get a production key first; see the main README.) |
| **Bundle ID** | `org.studyfox.app` (already set in `mobile/app.json`) |
| **SKU** | `studyfox-ios-1` (any unique string; users never see it) |

## Pricing and Availability

- **Price:** Free (USD 0)
- **Availability:** All countries and regions
- **In-app purchases / subscriptions:** None
- **Made for Kids (Kids category):** No, because StudyFox is for ages 13 and up

---

## Version 1.0 page

### Promotional text (170 max, can be changed anytime without review)

```
Courses for 49 classes including every AP subject, a flashcard maker with no limits, and 4,000+ SAT and ACT practice questions. No ads.
```
(135)

### Description (4000 max)

```
StudyFox is a study app for every class you take. Short lessons for 49 courses, including every AP subject. A flashcard maker with no limits. SAT and ACT practice with every answer explained. All in one app, with no ads.

COURSES FOR EVERY CLASS
• 49 courses and 300+ short lessons, each with a quick check at the end
• Math: Algebra 1, Geometry, Algebra 2, Precalculus, Calculus, and Statistics
• Science: Biology, Chemistry, and Physics
• English, History, and Study Skills
• Every AP class, including AP U.S. History, AP World History, AP Biology, AP Chemistry, AP Psychology, AP Calculus, AP Computer Science, and more
• Pick up where you left off right from the Today screen

A FLASHCARD MAKER WITH NO LIMITS
• Make unlimited sets with unlimited cards
• Type them in, or paste a whole list from your notes and StudyFox splits it into cards
• Swipe to sort what you know and what you're still learning, star the hard ones, shuffle, or study definition-first
• Learn mode quizzes you with multiple choice, then written answers, until you've mastered every term
• Test mode builds a practice test from your set and grades it for you
• Match: race the clock to pair every term with its definition
• Share any set with a link, and open sets your friends share with you
• Ready-made sets for SAT and ACT vocabulary, math formulas, grammar rules, and more

SAT AND ACT PRACTICE
• 4,000+ numbered practice questions, each with a worked explanation
• Quick 5, 10, or 20 question sets you can finish anywhere
• Speed rounds to build test-day pace
• A mistake list so you can retry what you missed
• "Focus next" shows your weakest skills and drills them
• The Desmos graphing calculator and the SAT formula sheet built in
• A new question of the day, every day

KEEP YOUR STREAK GOING
• Today shows your streak, your flashcards, and your next lesson in one place
• Sign in with Apple or Google to sync your progress with studyfox.org, where you can also take full-length timed practice tests
• Light and dark mode

Made for every student. No ads, no limits.

StudyFox is for students 13 and older.

SAT® and AP® are trademarks of the College Board, and ACT® is a trademark of ACT, Inc. None of them is affiliated with or endorses StudyFox. All practice questions are original.

Questions or ideas? Email danieljohnsonhtx@gmail.com.
```

### Keywords (100 max, commas, no spaces)

```
cram,study,quiz,vocab,test,exam,biology,chemistry,history,math,homework,school,lessons,maker,algebra
```
(100)

Words already in the name and subtitle (StudyFox, courses, flashcards, every, AP, class, SAT, ACT, prep) count automatically, so they aren't repeated here. Don't add competitor names like "Quizlet"; Apple rejects that (guideline 2.3.7).

### URLs

| Field | Answer |
|---|---|
| **Support URL** (required) | `https://studyfox.org` (Apple wants a page where users can reach you. A short contact page would be safer than the home page) |
| **Marketing URL** (optional) | `https://studyfox.org` |
| **Privacy Policy URL** (required) | `https://studyfox.org/#/privacy` |

### Other version fields

| Field | Answer |
|---|---|
| **Version** | `1.0` (matches `version` in `mobile/app.json`) |
| **Copyright** | `2026 Daniel Johnson` |
| **Routing app coverage file** | Leave empty |
| **Game Center** | Off |
| **Release** | "Manually release this version" so you can check the live listing first |

---

## App Review Information

| Field | Answer |
|---|---|
| **Sign-in required** | Yes |
| **Demo account** | Leave blank and use the note below, or make a Google account just for review and enter it |
| **Contact** | Daniel Johnson · danieljohnsonhtx@gmail.com · your phone number |

**Notes for the reviewer** (paste this):

```
StudyFox is a study app for high school students: short lessons for 49 courses (including every AP class), a flashcard maker with Learn, Test, and Match modes, and SAT/ACT practice questions with explanations. There are no purchases, ads, or subscriptions.

Signing in: on the first screen, use Sign in with Apple, or create an email account with any email and a password of 6+ characters. New accounts answer a short onboarding form; the date of birth must be 13 or older because the app is for ages 13+.

Things to try:
- Today tab: Quick 5 (five practice questions with explanations)
- Courses tab: open any course and a lesson
- Cards tab: the pencil button makes a new set; add a few cards, open it and try Study, Learn, Test, and Match

Accounts can be deleted in the Me tab.
```

Email accounts only exist on the device they were made on, which is why the note asks the reviewer to sign up on the spot.

---

## Age rating questionnaire

Answer **None / No** to everything:

| Question | Answer |
|---|---|
| Cartoon or fantasy violence, realistic violence, prolonged graphic or sadistic violence | None |
| Profanity or crude humor | None |
| Mature or suggestive themes | None |
| Horror or fear themes | None |
| Medical or treatment information | None |
| Alcohol, tobacco, or drug use or references | None |
| Simulated gambling, contests | None |
| Sexual content or nudity, graphic sexual content | None |
| Unrestricted web access | No (it only opens studyfox.org, Desmos, and your Instagram) |
| User-generated content | No (sets are private; sharing sends a copy by link, with no public feed, profiles, or chat) |
| Messaging and chat | No |
| Advertising | No |
| Parental controls / age assurance | No |
| Health or wellness topics | No |

That works out to **4+**. Because your Terms require users to be 13+, use the **age rating override** in App Store Connect to raise it to **13+** so the listing matches your Terms.

---

## App Privacy ("nutrition label")

**Do you or your third-party partners collect data from this app?** Yes.

Apple counts data as "collected" only when it leaves the device. Email accounts stay on the device, so this covers Sign in with Apple and Google, where progress syncs to Supabase.

| Data type | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|
| **Contact Info › Name** | Yes | No | App Functionality |
| **Contact Info › Email Address** | Yes | No | App Functionality, Developer's Advertising or Marketing (only if they opt in to emails) |
| **Identifiers › User ID** | Yes | No | App Functionality |
| **User Content › Other User Content** (flashcard sets, answers, scores) | Yes | No | App Functionality |
| **Other Data › Other Data Types** (date of birth, grade, study goals, language) | Yes | No | App Functionality, Product Personalization |

Answer **Not collected** for everything else: Health & Fitness, Financial Info, Location, Sensitive Info, Contacts, Browsing History, Search History, Purchases, Usage Data, Diagnostics, Photos or Videos, Audio, Gameplay Content, and other contact info (phone, address).

**Tracking:** No. The app doesn't need the App Tracking Transparency prompt.

**Privacy manifest:** Expo builds it from `mobile/app.json`. Add `ios.privacyManifests` with `NSPrivacyTracking: false` and the data types above. Expo's own packages already declare the system APIs they use.

---

## Export compliance

Already handled: `mobile/app.json` sets `ITSAppUsesNonExemptEncryption` to `false`, so App Store Connect won't ask.

---

## Before you submit

1. **Account deletion (guideline 5.1.1(v), likely rejection).** In the Me tab, "Delete account data" deletes synced progress but leaves the Supabase login account, and it only appears for Apple and Google accounts. Apple requires deleting the account itself. Add a Supabase Edge Function that calls `auth.admin.deleteUser()` with the service-role key (the `on delete cascade` in `supabase/schema.sql` then removes the progress), call it from both `mobile/src/lib/cloud.ts` and `js/cloud.js`, and rename the button "Delete account." For Sign in with Apple users, Apple also requires revoking their token through Apple's REST API.
2. **iPad.** `mobile/app.json` has `"supportsTablet": true`, so Apple will ask for iPad screenshots and test the app on an iPad. The app is laid out for phones and stretches edge to edge on an iPad with small text. Either set `supportsTablet` to `false` (iPads then run it as an iPhone app and no iPad screenshots are needed), or give the screens a max width before adding iPad screenshots.
3. **Production Desmos key.** The demo key shows a "Trial Key" badge in the calculator; swap it for a real one (see the main README).
4. **Supabase redirect URLs.** Add `studyfox://**` under Authentication → URL Configuration, and add `org.studyfox.app` to the Apple provider's Client IDs (steps in `mobile/README.md`), or Google and Apple sign-in will fail in the store build.
