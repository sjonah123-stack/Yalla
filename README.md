# Yalla — יאללה

A personal trainer for Hebrew roots (shorashim), built like a mix of Duolingo and Quizlet: a **course path** through every root in the bank, organized by theme into units of ~8 roots, with **flashcards, a timed match game, a unit test and a placement test** inside each unit. The headline number is *roots memorized*, and "memorized" is earned honestly — two first-try correct answers on separate days. Lessons pay **gems** into a chest, milestones earn **seals**, and a first-run welcome screen offers placement or the first root.

506 hand-curated roots, 2,518 vocalized words with transliteration, gloss and binyan, in 25 themed sections. The bank is built to grow to 500+ in batches.

Vite + React + TypeScript. Installable as a PWA, fully offline, or buildable as one self-contained HTML file. Live at https://yalla-roots.web.app (the canonical address; the older https://yalla-677b9.web.app still serves the app and moves people over once nothing local would be lost).

The look is the "Yalla Mobile" design: a warm cream ground, clay cards with a hard drop shadow, plum / coral / gold accents, chunky radii, Assistant for UI text and Frank Ruhl Libre for Hebrew. Fonts are self-hosted so the artifact build stays offline-complete. Dark mode is the same language on a deep plum ground.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build          # PWA → dist/  (`firebase deploy --only hosting,firestore:rules` — hosting targets `app` and `roots` publish the same build to both sites)
npm run build:artifact # single file → dist/yalla.html (+ yalla.artifact.html for a Claude artifact)
npm test               # vitest: course, lessons, placement, match, SRS, quiz, Hebrew, storage, rewards, session wiring, data integrity
npm run lint
```

Progress lives in `localStorage` (`yalla.v3`; older `v2` / `v1` records migrate on first load) and is local-first: the app works fully offline.

**Sign in with Google** (Settings → Account, or the link on the welcome screen) and progress follows you: the web app keeps one Firestore document per user (`users/{uid}`, the whole record as JSON) and merges it with the device record per root, per day and per unit, so phone and laptop never overwrite each other. Live updates from another device arrive through a snapshot listener; a "Reset progress" propagates as a wipe (a `resetAt` epoch beats a merge). Signing in on a device that someone else used replaces the local record instead of merging it. Signing in while offline keeps the device local-only until the account record has been loaded (nothing is ever uploaded over an unknown record); the pull, and any failed save, retry on reconnect and whenever the app comes back to the foreground. Signing out asks (in an in-app sheet) whether to keep a copy on the device; Reset and leaving a test or placement early confirm the same way. The Account row shows when the account was last saved. Inside a Claude artifact the same merge runs against the artifact DB; the Firebase SDK is never bundled into the single-file build.

Firebase project `yalla-677b9`: Hosting + Firestore (`firestore.rules` allows each user only their own document) + Google sign-in. The public web config is committed in `src/lib/firebase-config.ts`. On the hosting origins listed in `FIRST_PARTY_AUTH_HOSTS` the app uses its own origin as `authDomain` (every Hosting site serves `/__/auth/*`), so sign-in is first-party: that is what lets the redirect flow complete on iPhones and installed PWAs, where Safari blocks the third-party storage a cross-origin `authDomain` needs. Phones and installed apps sign in by redirect, desktops by popup. Each listed host's `https://<host>/__/auth/handler` must be an authorized redirect URI on the project's OAuth client in Google Cloud (Credentials → "Web client (auto created by Google Service)"); elsewhere (dev server) the default `yalla-677b9.firebaseapp.com` domain and the popup flow are used. Google sign-in is enabled in the console and both web.app hosts are authorized domains.

## How it works

- **Home** — the dashboard: streak, gems, roots memorized, today's XP ring, level bar, the Continue card and shortcuts to Practice, the current unit's tools and the seals.
- **The path** — 25 theme sections (speech, movement, senses & mind, … technology, education, military, city & travel, shopping & commerce, animals & farm, science & numbers, sport & leisure) split into 63 units, shown as one card per theme; the open theme lists its units as chips. A unit is *locked* until the one before it is complete (or you test out of it), *started* once quizzed, *learned* when every root has been answered right once, *complete* when every root is memorized, and *gold* after a unit test at 90%+. A complete unit whose roots slip shows as needing repair.
- **Memorized** — a root's interval reaches 3 days: two first-try corrects with no lapse since. A root's schedule advances only on a first-try correct answer once the root is due — never twice in one sitting, and a same-session drill or an early review leaves the schedule alone — so the second correct has to come on a later day. That is the whole loop: learn today, lock in tomorrow.
- **Tricky roots** — a root missed twice (`lapses ≥ 2`) and not yet back at mastery 3 is *tricky*. Home lists them with a "Drill them" round (a practice restricted to those roots, two passes each), the Roots bank has a Tricky chip and tags, and it self-clears once the root climbs back. Lessons don't force tricky roots in: the SRS already brings them back when due.
- **Lessons** — 16 questions on one unit: up to 4 new roots (each introduced with a "meet this root" card and drilled once more later), ~30% cumulative review from earlier units, and the unit's weakest roots. Misses are re-queued four questions later. **Practice** is a global review of due roots; new roots only enter through the path.
- **Flashcards** — root on the front, meaning and word family on the back; swipe right = know, left = still learning, looping the pile until empty. **Match** — 8 roots and their meanings as 16 tiles against the clock; a wrong pair costs half a second; best time per unit. **Test** — 20 fixed questions covering every root twice; 90%+ turns the unit gold and unlocks the next one. **Placement** — a one-time sweep of the path, one question per unit; units before your level are marked complete and their roots come back for review a week later, so a wrong guess self-corrects.
- **Scheduling** — SM-2-flavored per root: right answers push a root 1 → 3 → 7 → 15 → 30+ days out; a miss brings it back tomorrow. Streaks count local calendar days and only advance on a correct answer. A daily XP goal (20 / 50 / 100) fills the ring on the path.
- **Modes**, gated by mastery so you move from recognition to production: root → meaning, meaning → root, word → root, odd one out, listen → root, which binyan, and typing the root on an on-screen Hebrew keyboard (or a physical one — Hebrew, or the English keys in the same positions). Distractors are scored by letter overlap so wrong options are genuinely confusable.
- **Gems and chests** — a lesson or practice pays 15 gems + 3 per correct answer (+20 for a flawless run), collected by tapping the chest on the summary screen. The first time a unit becomes complete its chest pays +50; finishing every unit of a section pays a +50 section chest. Placement pays 40 once. Gems and chest markers are stored on the progress record, so a chest is never paid twice, even across devices.
- **Seals** — twelve milestones (first root, ten memorized, first unit, Speech master, combo ×5, 3-day streak, 500 XP, perfect lesson, typist, Movement master, gem hoarder, level 5), checked at the end of every session; new ones show on the summary and all of them on the Progress page.
- **Onboarding** — a first-run welcome screen: place me (the placement test) or start from the first root. Reset progress brings it back.
- **Audio** uses the browser's speech synthesis with a Hebrew voice when one exists.

## Layout

| Path | What |
|---|---|
| `src/data/roots/<section>.ts` | The root bank, one file per theme section; `index.ts` concatenates them |
| `src/data/course.ts` | Section order and unit order (unit membership lives on each root) |
| `src/data/binyanim.ts` | The seven binyanim: pattern, gloss, example |
| `src/lib/course.ts` | Course building, unit status, memorized counts |
| `src/lib/lesson.ts` | Lesson and unit-test builders |
| `src/lib/placement.ts` | Placement sampling, result rule, writes |
| `src/lib/rewards.ts` | Gems, chests, seals: pure reward rules applied at session end |
| `src/lib/match.ts` | Match pair selection |
| `src/lib/srs.ts` | Scheduling, mastery, streak, practice queue |
| `src/lib/quiz.ts` | Distractors, mode selection, question generation, XP |
| `src/lib/hebrew.ts` | Nikud stripping, final-letter normalization, keyboard maps |
| `src/lib/storage.ts` | localStorage, migrations, per-root/unit merge, the remote seam (debounced push, reconcile on sign-in) |
| `src/lib/cloud.ts` | Firebase Auth (Google) + Firestore backend; lazy-loaded, excluded from the artifact build |
| `src/lib/stats.ts` | Heatmap, accuracy trend, memorized trend, upcoming reviews |
| `src/store/` | zustand stores: persisted progress, session plans, UI, cloud account, the built course |
| `src/views/` | Welcome, Home (dashboard), Path (theme cards), Unit sheet, Play (+ Summary / results with the chest), Flashcards, Match, Bank, Patterns, Progress, Settings |
| `src/styles/tokens.css` | The design system: spacing, type scale, palette (light + dark), radii, drops, motion |
| `scripts/inline-artifact.mjs` | Emits the single-file build |

## Adding roots

Roots go in the file for their theme, e.g. `src/data/roots/nature.ts`:

```ts
{
  r: "שרש", m: "root / take root", short: "root", rank: 12, cat: "nature", unit: "nature-3",
  words: [
    { h: "שֹׁרֶשׁ", t: "shoresh", g: "root", b: "noun" },
    { h: "הִשְׁתָּרֵשׁ", t: "hishtaresh", g: "took root", b: "hitpa'el" },
  ],
},
```

- `r` must be unique — a digit suffix marks a homograph (`שכר2`); digits are stripped for display and typing. Homographs need different `short` labels.
- `short` is one sense in at most two words: it is the Match tile and the multiple-choice label. `m` can list several senses.
- `rank` orders roots within their section (1 = most useful) and must be unique within a unit.
- `unit` must be listed under its section in `src/data/course.ts`. **Growing a section = appending a new serial** (`nature-3`) to that section's `units`; never rename or reuse a unit id — saved progress refers to them. A new theme is a new `SectionDef`.
- Every unit needs 5–10 roots; every word needs nikud; no vocalized word may appear under two roots. `npm test` enforces all of this.
