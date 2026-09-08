# Yalla — יאללה

A personal, gamified trainer for Hebrew roots (shorashim). 179 hand-curated roots, 930 vocalized words with transliteration, gloss and binyan. Spaced repetition, seven question modes, audio, a binyan primer, and a progress dashboard.

Vite + React + TypeScript. Installable as a PWA, fully offline, or buildable as one self-contained HTML file.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build          # PWA → dist/  (deploy to any static host)
npm run build:artifact # single file → dist/yalla.html (+ yalla.artifact.html for a Claude artifact)
npm test               # vitest: SRS, quiz, Hebrew normalization, storage merge, data integrity
npm run lint
```

Progress lives in `localStorage` (`yalla.v2`; a `yalla.v1` record from the original app is migrated on first load). Inside a Claude artifact it also syncs to the artifact DB with a per-root merge, so phone and laptop share one record without either overwriting the other.

## How it works

- **Scheduling** — SM-2-flavored per root: right answers push a root 1 → 3 → 7 → 15 → 30+ days out; a miss brings it back tomorrow and re-queues it four questions later in the same session. Mastery 0–5 is derived from the current interval. Streaks count local calendar days and only advance on a correct answer.
- **Sessions** — due roots first, then a capped number of new roots (most frequent tier first), then the weakest seen roots. New roots get a "meet this root" card before their first question.
- **Modes**, gated by mastery so you move from recognition to production: root → meaning, meaning → root, word → root, odd one out, **listen** → root, **which binyan**, and typing the root on an on-screen Hebrew keyboard (or a physical one — Hebrew, or the English keys in the same positions).
- **Distractors** are scored by letter overlap with the answer, so wrong options are genuinely confusable rather than random.
- **XP** — 10 for recognition, 15 for odd-one-out and listening, 20 for typing and binyan; +5 at combo ×3 and ×6; half for a retry. Level = ⌊√(XP/100)⌋ + 1.
- **Audio** uses the browser's speech synthesis with a Hebrew voice when one exists; otherwise speaker buttons and the listening mode disappear rather than mispronouncing.

## Layout

| Path | What |
|---|---|
| `src/data/roots.ts` | The root bank (typed; see below to add roots) |
| `src/data/binyanim.ts` | The seven binyanim: pattern, gloss, example |
| `src/lib/srs.ts` | Scheduling, mastery, streak, queue building |
| `src/lib/quiz.ts` | Distractors, mode selection, question generation, XP |
| `src/lib/hebrew.ts` | Nikud stripping, final-letter normalization, keyboard maps |
| `src/lib/storage.ts` | localStorage, v1 → v2 migration, per-root merge, artifact DB |
| `src/lib/stats.ts` | Heatmap, accuracy trend, mastery distribution, upcoming reviews |
| `src/store/` | zustand stores: persisted progress, ephemeral session, UI |
| `src/views/` | Home, Play (+ Learn, Summary), Bank, Patterns, Progress, Settings |
| `src/styles/tokens.css` | The design system: spacing, type scale, palette, motion |
| `scripts/inline-artifact.mjs` | Emits the single-file build |

## Adding roots

Append to `ROOTS` in `src/data/roots.ts`:

```ts
{r:"שרש",m:"root",tier:1,cat:"nature",words:[
 {h:"שֹׁרֶשׁ",t:"shoresh",g:"root",b:"noun"},
 {h:"הִשְׁתָּרֵשׁ",t:"hishtaresh",g:"took root",b:"hitpa'el"}]},
```

`r` must be unique — use a digit suffix for homographs (`שכר2`); digits are stripped for display and typing. `b` is one of the seven binyanim or `noun` / `adj` / `adv` / `prep` / `phrase` / `interj`; TypeScript rejects anything else, and `npm test` checks the whole bank.
