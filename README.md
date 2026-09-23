# Yalla — יאללה

A personal trainer for Hebrew roots (shorashim), built like a mix of Duolingo and Quizlet: a **course path** through every root in the bank, organized by theme into units of ~8 roots, with **flashcards, a timed match game, a unit test and a placement test** inside each unit. The headline number is *roots memorized*, and "memorized" is earned honestly — two first-try correct answers on separate days. Lessons pay **gems** into a chest, milestones earn **seals**, and a first-run welcome screen offers placement or the first root.

506 hand-curated roots, 2,510 vocalized words with transliteration, gloss and binyan, in 25 themed sections. The bank is built to grow to 500+ in batches.

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

**Push reminders** run as a scheduled Cloud Function (`functions/`, Node 22, every 15 min): it reads `push/{uid}` (`{ sub, hour, tz, on, lastSent }`, written by Settings → Daily reminder), skips anyone who already played today in their time zone, and sends a Web Push through `web-push`. The service worker gets its `push` / `notificationclick` handlers from `public/push-sw.js` (Workbox `importScripts`). Deploying functions needs the Blaze plan and the VAPID private key as a secret:

```bash
firebase functions:secrets:set VAPID_PRIVATE_KEY   # the private half of VAPID_PUBLIC_KEY in firebase-config.ts
firebase deploy --only functions,hosting,firestore:rules
```

Progress lives in `localStorage` (`yalla.v3`; older `v2` / `v1` records migrate on first load) and is local-first: the app works fully offline.

**Sign in with Google** (Settings → Account, or the link on the welcome screen) and progress follows you: the web app keeps one Firestore document per user (`users/{uid}`, the whole record as JSON) and merges it with the device record per root, per day and per unit, so phone and laptop never overwrite each other. Live updates from another device arrive through a snapshot listener; a "Reset progress" propagates as a wipe (a `resetAt` epoch beats a merge). Signing in on a device that someone else used replaces the local record instead of merging it. Signing in while offline keeps the device local-only until the account record has been loaded (nothing is ever uploaded over an unknown record); the pull, and any failed save, retry on reconnect and whenever the app comes back to the foreground. Signing out asks (in an in-app sheet) whether to keep a copy on the device; Reset and leaving a test or placement early confirm the same way. The Account row shows when the account was last saved. Inside a Claude artifact the same merge runs against the artifact DB; the Firebase SDK is never bundled into the single-file build.

Firebase project `yalla-677b9`: Hosting + Firestore (`firestore.rules` allows each user only their own document) + Google sign-in. The public web config is committed in `src/lib/firebase-config.ts`. On the hosting origins listed in `FIRST_PARTY_AUTH_HOSTS` the app uses its own origin as `authDomain` (every Hosting site serves `/__/auth/*`), so sign-in is first-party: that is what lets the redirect flow complete on iPhones and installed PWAs, where Safari blocks the third-party storage a cross-origin `authDomain` needs. Phones and installed apps sign in by redirect, desktops by popup. Each listed host's `https://<host>/__/auth/handler` must be an authorized redirect URI on the project's OAuth client in Google Cloud (Credentials → "Web client (auto created by Google Service)"); elsewhere (dev server) the default `yalla-677b9.firebaseapp.com` domain and the popup flow are used. Google sign-in is enabled in the console and both web.app hosts are authorized domains.

## How it works

### v1.0: the Shuk and the daily loop

- **The Shuk** (tab ₪) — an idle market tycoon fed by what you learn. Each of the 25 themes is a stall (newsstand, spice stall, falafel…); every memorized root is stock that earns shekels every hour, even while the app is closed, up to the storage cap (4h, upgradeable to 24h). Come back and **collect**. A root that is due for review has **wilted** and earns nothing until you restock it (a review round of that stall's due roots). Shekels buy stall levels (×1.15 cost each, landmarks at 10/25/50/100 double income) and perks (storage, rush length, haggling). Finishing a lesson or review starts a **rush hour** (×2, ×3 when perfect); every right answer **sells** about a minute of income. The market grows Stand → Stall → Shop → Market → Mall.
- **Gem shop** — gems finally buy things: streak freezes (hold two), a streak repair within two missed days, a rush token, lucky bags, and accent colours (Jaffa, Galilee, Negev).
- **Daily quests** — three a day (same three on every device), each paying gems + shekels; all three unlock a **lucky bag** with a random prize (shekels, a jackpot, gems, a freeze, a ×3 rush).
- **Streak freeze & repair** — a missed day is covered automatically by a held freeze; the flame grows at 7, 30 and 100 days.
- **Weekly league** — Monday to Sunday against 20 rivals paced to your own recent weeks, plus "You, last week". Top 4 promote, bottom 4 demote, Clay → Bronze → Silver → Gold → Diamond; promotion pays gems.
- **Combo fever** — XP ×1.5 from 5 in a row, ×2 from 10.
- **Root of the day** — four quick questions on one of your weakest roots, including a **discovery** question: a family member you haven't met, guessed from the root.
- **Mini stories** — 30 graded passages built from bank roots, unlocked once you've met every root in them; tap a word for its root, reveal the English, answer comprehension questions.
- **Mistake notebook** — every miss is logged; "Fix my mistakes" drills the roots you keep missing, and mix-up cards put two confused roots side by side.
- **Listening mode** — a hands-free loop: hear the word, then see the meaning; Known / Again.
- **Reminders** — a daily Web Push at the hour you pick (signed in; on iPhone from the installed app).

- **Home** — the dashboard: streak, gems, roots memorized, today's XP ring, level bar, the Continue card and shortcuts to Practice, the current unit's tools and the seals.
- **The path** — 25 theme sections (speech, movement, senses & mind, … technology, education, military, city & travel, shopping & commerce, animals & farm, science & numbers, sport & leisure) split into 63 units, shown as one card per theme; the open theme lists its units as chips. A unit is *locked* until the one before it is complete (or you test out of it), *started* once quizzed, *learned* when every root has been answered right once, *complete* when every root is memorized, and *gold* after a unit test at 90%+. A complete unit whose roots slip shows as needing repair.
- **Memorized** — a root's interval reaches 3 days: two first-try corrects with no lapse since. A root's schedule advances only on a first-try correct answer once the root is due — never twice in one sitting, and a same-session drill or an early review leaves the schedule alone — so the second correct has to come on a later day. That is the whole loop: learn today, lock in tomorrow.
- **Example sentences** — 1,012 vocalized sentences, one per word for the two most useful words of every root (`src/data/sentences`), shown under the word in the Roots list and on the answer sheet, and used by the **fill the blank** question (the word is removed from its sentence; pick it from the family). The blank's other tiles never include a family word of the same kind (a second noun or verb of the root could fit just as well). Every sentence was audited by hand for gender, number and person agreement with its word (the word is the bank's form: verbs are "he …", adjectives masculine singular), and the sentence test enforces the mechanical part: key is a bank word, sentence contains it verbatim, nikud, ≤12 words, translation; no masculine-singular key after a pronoun or plural noun of another gender/number; the English opens with the Hebrew's pronoun; and a prefix glued to the key keeps the key's pointing right (the article's dagesh, soft בגדכפת after בְּ/לְ/וְ).
- **Dictation** — "Listen. Type the word": hear a word, type its letters. Single words only. Needs a Hebrew voice.
- **The keyboard** — the standard Israeli layout, key for key as on a phone (ק ר א ט ו ן ם פ ⌫ / ש ד ג כ ע י ח ל ך ף / ז ס ב ה נ מ צ ת ץ), final letters included; final and medial forms count as the same letter. Filling the last slot waits for *check*, so a slip can still be deleted. A physical keyboard works too (Hebrew, or the English keys in the same spots; Enter checks).
- **Binyan lessons** — each binyan on the Patterns tab has a page (how to spot it, its four tenses on one root, what it tends to mean, one root across every binyan, and all its verbs, the ones from roots you've met first with their sentences) and a lesson: five verbs of that binyan, first met ("what does this pi'el verb mean?" — the other tiles are the same root in other binyanim, so the pattern decides), then used (spot the pi'el among four verbs, fill it into its sentence, or build it from the root). Verbs of roots you've met come first, then the nearest ones ahead on the path. Lessons count word memory (N / M verbs known per binyan), XP, streak and gems like a practice, and never move a root's review schedule.
- **Conjugate** — a drill on the Patterns page for strong (regular) roots in pa'al, pi'el and hif'il: pick the right past/present form for a person; forms are generated by rule (`src/lib/conjugate.ts`), never stored.
- **Today's session** — Home chains due reviews → tricky roots → the next lesson into one tap; each summary's Continue starts the next step.
- **Word-level memory** — every word-based answer also counts for that word (`Progress.words`); known words (two rights, more rights than wrongs) get a check in the Roots list and are asked about less.
- **Sounds** — synthesized blips on answers, a chest jingle, a tap of vibration where the platform allows (Android); a Settings toggle. **Tour** — three cards on the first Home visit; replayable from Settings.
- **Pronunciation** — words are spoken with their nikud (the system voices read vowel points; unpointed Hebrew is ambiguous); "Pronunciation" is a flag reason.
- **Flag this root** — content feedback: from the answer sheet or a Roots row, flag a root (wrong meaning, nikud, transliteration, doesn't belong, other, plus an optional note). Flags live in the synced progress record; Settings lists them and can share/copy a review block; clearing keeps a tombstone so it survives a merge.
- **Back navigation** — swipe-back / Android back / Escape close the top layer (confirm, settings, unit sheet, tool, session, then tabs back to Home) instead of leaving the app; scroll position is restored per tab. The Path has a sticky theme index rail.
- **Tricky roots** — a root missed twice (`lapses ≥ 2`) and not yet back at mastery 3 is *tricky*. Home lists them with a "Drill them" round (a practice restricted to those roots, two passes each), the Roots bank has a Tricky chip and tags, and it self-clears once the root climbs back. Lessons don't force tricky roots in: the SRS already brings them back when due.
- **Speed round** — 60 seconds of mixed review over every root you've seen (no typing or listening); a miss freezes 1.5 s. Score = right answers; best per day on Home; gems 15 + 3 × right (capped at 20), never a perfect bonus. The "Speed demon" seal is 20 in one round.
- **Lessons** — 16 questions on one unit: up to 4 new roots (each introduced with a "meet this root" card and drilled once more later), ~30% cumulative review from earlier units, and the unit's weakest roots. Misses are re-queued four questions later. **Practice** is a global review of due roots; new roots only enter through the path.
- **Flashcards** — root on the front, meaning and word family on the back; swipe right = know, left = still learning, looping the pile until empty. **Match** — 8 roots and their meanings as 16 tiles against the clock; a wrong pair costs half a second; best time per unit. **Family sort** — six to eight words from two roots; tap each into the right family against the clock.  **Test** — 20 fixed questions covering every root twice; 90%+ turns the unit gold and unlocks the next one. **Placement** — a one-time sweep of the path, one question per unit; units before your level are marked complete and their roots come back for review a week later, so a wrong guess self-corrects.
- **Scheduling** — SM-2-flavored per root: right answers push a root 1 → 3 → 7 → 15 → 30+ days out; a miss brings it back tomorrow. Streaks count local calendar days and only advance on a correct answer. A daily XP goal (20 / 50 / 100) fills the ring on the path.
- **Modes**, gated by mastery so you move from recognition to production: root → meaning, meaning → root, word → root, build the word (root × pattern), listen → root, which binyan, fill the blank, dictation, and typing the root on the on-screen Hebrew keyboard (or a physical one). Binyan lessons add a verb's meaning and spot-the-pattern. Distractors are scored by letter overlap so wrong options are genuinely confusable.
- **Gems and chests** — a lesson or practice pays 15 gems + 3 per correct answer (+20 for a flawless run), collected by tapping the chest on the summary screen. The first time a unit becomes complete its chest pays +50; finishing every unit of a section pays a +50 section chest. Placement pays 40 once. Gems and chest markers are stored on the progress record, so a chest is never paid twice, even across devices.
- **Seals** — thirteen milestones (first root, ten memorized, first unit, Speech master, combo ×5, 3-day streak, 500 XP, perfect lesson, typist, Movement master, gem hoarder, level 5), checked at the end of every session; new ones show on the summary and all of them on the Progress page.
- **Onboarding** — a first-run welcome screen: place me (the placement test) or start from the first root. Reset progress brings it back.
- **Audio** uses the browser's speech synthesis with a Hebrew voice when one exists.

## Layout

| Path | What |
|---|---|
| `src/data/roots/<section>.ts` | The root bank, one file per theme section; `index.ts` concatenates them |
| `src/data/course.ts` | Section order and unit order (unit membership lives on each root) |
| `src/data/binyanim.ts` | The seven binyanim: pattern, gloss, example, how to spot it, tenses, what it does |
| `src/lib/binyan.ts` | Binyan lessons: verbs per binyan, lesson picking and order, the page's showcase root |
| `src/lib/course.ts` | Course building, unit status, memorized counts |
| `src/lib/lesson.ts` | Lesson and unit-test builders |
| `src/lib/placement.ts` | Placement sampling, result rule, writes |
| `src/lib/rewards.ts` | Gems, chests, seals: pure reward rules applied at session end |
| `src/lib/shuk.ts` | The market tycoon: stalls, income, accrual, upgrades, perks, rush, sales, tiers |
| `src/lib/shop.ts` | Gem ledger, streak freezes and repair |
| `src/lib/quests.ts` | Daily quests and lucky bags |
| `src/lib/league.ts` | Weekly league: rivals, the ghost, standings, settling |
| `src/lib/daily.ts`, `mistakes.ts`, `stories.ts` | Root of the day, the mistake notebook, story unlocks |
| `src/data/stories/` | Mini stories (tags map words to roots) |
| `functions/` | Scheduled push reminders (Cloud Functions) |
| `src/lib/match.ts` | Match pair selection |
| `src/lib/srs.ts` | Scheduling, mastery, streak, practice queue |
| `src/lib/quiz.ts` | Distractors, mode selection, question generation, XP |
| `src/lib/hebrew.ts` | Nikud stripping, final-letter normalization, keyboard maps |
| `src/lib/storage.ts` | localStorage, migrations, per-root/unit merge, the remote seam (debounced push, reconcile on sign-in) |
| `src/lib/cloud.ts` | Firebase Auth (Google) + Firestore backend; lazy-loaded, excluded from the artifact build |
| `src/lib/stats.ts` | Heatmap, accuracy trend, memorized trend, upcoming reviews |
| `src/store/` | zustand stores: persisted progress, session plans, UI, cloud account, the built course |
| `src/views/` | Welcome, Home (dashboard), Path (theme cards), Unit sheet, Play (+ Summary / results with the chest), Flashcards, Match, Bank, Patterns (+ a page per binyan), Progress, Settings |
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
