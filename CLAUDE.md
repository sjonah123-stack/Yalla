# Yalla — working notes for Claude

A Hebrew root (shoresh) trainer: Vite + React 19 + TypeScript + zustand. The user is Jonah.
Read `README.md` first; this file is the part that isn't obvious from the code.

## Commands

```bash
npm run dev            # http://localhost:5173 (the .claude/launch.json entry is `yalla-dev`)
npm test               # vitest, node env, src/**/*.test.ts — must stay green
npm run lint && npx tsc -p tsconfig.app.json --noEmit
npm run build          # PWA → dist/
npm run build:artifact # single-file dist/yalla.html; fails on purpose if Firebase leaks in
firebase deploy --only hosting,firestore:rules   # targets `app` (yalla-677b9) + `roots` (yalla-roots)
```

Ship = commit on `main` + deploy. Both live URLs serve the same build:
https://yalla-roots.web.app (canonical, `CANONICAL_HOST` in `src/lib/site.ts`) and
https://yalla-677b9.web.app (legacy: `shouldMove` sends people to the canonical host when the
device has no progress or syncs to an account; otherwise Home shows a move banner).

## Non-negotiables

- **Both build targets matter.** The artifact build must be offline-complete: no Google Fonts
  links, no network fonts, no Firebase. `cloud-loader.ts` folds the cloud module out via the
  `__ARTIFACT__` define; keep every Firebase import inside `src/lib/cloud.ts`.
- **Unit ids are stable forever** (`speech-1`). Grow a section by appending serials in
  `src/data/course.ts`; add a theme by appending a `SectionDef` (never reorder — path position
  is what unlocks the next unit for existing users). Saved progress refers to unit ids.
- **Root bank rules** are enforced by `src/data/roots.test.ts`: 5–10 roots per unit, unique
  `r` (digit suffix = homograph with a different `short` and a `note`), nikud on every word,
  no vocalized word under two roots anywhere, unique `short`/gloss within a unit, `short`
  ≤16 chars and one sense. Counts in the README prose go stale — update them with a batch.
- **Pure logic in `src/lib`, tested.** Rewards (`rewards.ts`), sync decisions
  (`storage.ts`: `mergeProgress`, `reconcileSignIn`, `applyIncoming`), SRS, lessons and
  placement are all pure functions with vitest coverage. Stores are thin wrappers.
- **Design tokens** live in `src/styles/tokens.css`; all component CSS is in
  `src/styles/global.css`, sectioned by view. The look is "Yalla Mobile": cream ground,
  clay cards with a hard drop shadow (`--drop`), plum / coral / gold, chunky radii, Assistant
  (UI) + Frank Ruhl Libre (Hebrew). No borders, no blurred shadows. Dark mode is the same
  language on a deep plum ground — keep both palettes in tokens.css.

## How progress and sync work

- `Progress` (`src/types.ts`) is one JSON record in `localStorage` (`yalla.v3`), normalized on
  load by `normalize()`. Every mutation goes through `persist()` in `src/store/progress.ts`,
  which saves locally and debounces a push to the attached `RemoteBackend`.
- Web build: Google sign-in (Firebase Auth) + one Firestore doc `users/{uid}` =
  `{ v, updatedAt, resetAt, json }`. On sign-in `reconcileSignIn` merges for a never-synced
  device or the same uid, replaces for a different uid, and never uploads another person's
  local record. `resetAt` is an epoch: a reset wins wholesale on merge. Snapshot updates merge
  in but never push back. Signing in counts as onboarding. If the account record can't be
  loaded at sign-in (offline), the device stays local-only (`pulled: false`) and `resync()`
  re-attaches on `online` / foreground — never upload over an unknown record.
- Artifact build: the same merge against the Claude artifact DB (`connectRemote`).
- Firebase project `yalla-677b9`; public config in `src/lib/firebase-config.ts`. `authDomain`
  is the page's own origin on the hosts in `FIRST_PARTY_AUTH_HOSTS` (first-party sign-in, the
  only way redirect sign-in works on iPhones / installed PWAs); a host goes in that list only
  after `https://<host>/__/auth/handler` is an authorized redirect URI on the OAuth client in
  Google Cloud Credentials. Phones sign in by redirect, desktops by popup. Rules in
  `firestore.rules`.

## Rewards

Gems: 15 + 3×correct (+20 perfect) per lesson/practice; +50 unit chest (once, `chestAt`);
+50 section chest (once, only if no unit in the section was placed); +40 for the first
placement; a speed round pays 15 only if the timer ran out + 3×min(right, 20), never perfect.
Thirteen seals with ASCII ids in `SEALS`. All settled by `applySessionEnd` at
session end — never sprinkle rewards into `recordAnswer`.

## UI conventions (v0.7)

- Never call `confirm()`/`alert()`: use `useUi.getState().confirm({ title, body, actions })`
  (resolves to the tapped action's value, null on Escape/backdrop). `ConfirmSheet` is mounted on
  both App branches (Play and the shell).
- Hebrew text goes through `<Heb>` (adds `lang="he"`); root glyph divs carry `lang="he"`.
- View headers: `.view-h` with `div.actions` holding `<HeaderGear />` (Home has its own gear).
- Tricky roots (`isTricky`, `trickyRoots`, `trickyQueue` in `srs.ts`) and session milestones
  (`crossings`) are pure and tested; `Plan` = `{ kind: "practice", focus?: "tricky" }`.
- Back / Escape close the top layer; layers come from `layerStack` in `src/lib/history.ts`;
  never call `history.*` outside `src/store/nav.ts`. Session exits go through `session.quit()`
  (running) and `session.leave()` (summary); tools leave via `ui.leaveTool()`.
- Question modes: rootMeaning, meaningRoot, wordRoot, buildWord (root + form → word), cloze (sentence
  blank), typeRoot, typeWord (dictation), hearWord, whichBinyan. No odd-one-out (removed v0.8).
  Example sentences live in `src/data/sentences/*.ts` keyed by the exact vocalized word;
  `src/data/sentences.test.ts` enforces the rules. Conjugation is generated by rule
  (`src/lib/conjugate.ts`, strong roots only) — never stored.
- Sounds via `playCue`/`buzz` in `src/lib/sound.ts`, always gated on `settings.sounds`. Speech keeps
  nikud (`speak()` strips cantillation only).
- The daily plan is a session chain: `session.startChain(dailyPlan(...))`, `nextInChain()`.
- Content flags live in `Progress.flags` (tombstoned on clear); text export via `flagsToText`.
- Tap targets are 44px (hit expanders via `::after` on small controls); focus ring = `--ring`.

## Verifying UI changes

The in-app browser pane is often hidden (screenshots come back blank). A reliable
alternative: headless Chrome over CDP against the dev server at 402×874 — see the
`shots-*.mjs` pattern (spawn Chrome with `--remote-debugging-port`, `Page.captureScreenshot`).
Seed state through `localStorage.setItem('yalla.v3', …)` and reload.
