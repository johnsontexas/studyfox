// Behavior settings for lessons, question feedback, and onboarding. The live values come from the
// Supabase table content_settings (edited in Admin > Content > Settings) and are applied by live.js;
// these defaults fill in anything missing, so a deleted or half-filled key never breaks a page.
// Shared by the website and the iOS app: no DOM here.

export const SETTING_DEFAULTS = {
  lesson_player: {
    mode: 'steps',                  // 'steps' = one screen at a time, 'scroll' = the whole lesson on one page
    gate_questions: true,           // a question on the screen must be answered before Continue
    max_tries: 2,                   // attempts before the answer is revealed
    show_hint_after_wrong: true,
    explain_every_choice: true,     // after answering, show why each choice is right or wrong
    celebrate: true,
  },
  question_feedback: {
    explain_every_choice: true,
    show_hint_button: true,
    second_try: false,              // one retry before the answer is revealed (AP bank)
    auto_detect_mistakes: true,     // guess the slip behind a wrong number (sign flip, off by one, ...)
    ask_what_went_wrong: true,      // ask students to tag their mistake after a miss
    mistake_tags: ["Didn't know the concept", 'Misread the question', 'Calculation slip', 'Fell for a trap answer', 'Ran out of time / guessed'],
  },
  onboarding: {
    ask_heard_about: true,
    heard_about_options: [
      { id: 'short_form', label: 'StudyFox short videos (TikTok, Reels, YouTube Shorts)' },
      { id: 'long_form', label: 'StudyFox long videos (YouTube)' },
      { id: 'other_creator', label: "Another creator's video or post" },
      { id: 'friend', label: 'A friend or classmate' },
      { id: 'teacher', label: 'A teacher, tutor, or counselor' },
      { id: 'search', label: 'Google or another search engine' },
      { id: 'ai', label: 'ChatGPT or another AI assistant' },
      { id: 'app_store', label: 'The App Store' },
      { id: 'other', label: 'Somewhere else' },
    ],
  },
  // StudyFox's social accounts (Admin console > Socials). platform: instagram, tiktok, youtube, x,
  // threads, discord, or website. handle is the @name (or invite code / address); show: false hides one.
  socials: {
    links: [
      { platform: 'tiktok', handle: 'studyfoxapp', show: true },
      { platform: 'instagram', handle: 'studyfoxapp', show: true },
    ],
  },
};

const overrides = {};

/** Replace the server values (rows of { key, value }). */
export function applySettings(rows) {
  for (const k of Object.keys(overrides)) delete overrides[k];
  for (const r of rows || []) if (r && r.key && r.value && typeof r.value === 'object') overrides[r.key] = r.value;
}

/** The merged settings object for one key: defaults, then whatever the server sets. */
export function setting(key) {
  return { ...(SETTING_DEFAULTS[key] || {}), ...(overrides[key] || {}) };
}
