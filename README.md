# Yalla — Hebrew root trainer

A personal, gamified trainer for Hebrew roots (shorashim). Plain HTML/CSS/JS, no build step, no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and go to `http://localhost:8000`.

Progress is stored in the browser's `localStorage`. When the page is published as a Claude artifact it also syncs progress to the artifact's database, so phone and laptop share one record.

## How it works

- **Root bank** lives in `data/roots.js`: 179 roots, ~930 words, tagged by theme and frequency tier. Each root has example words with nikud, transliteration, gloss, and binyan/form.
- **Spaced repetition** (SM-2 style) per root: intervals 1 → 3 → 7 → 15 → 30+ days on correct answers; a miss resets the root to tomorrow. Mastery 0–5 is derived from the interval.
- **Modes** escalate with mastery: root → meaning, meaning → root, word → root, odd-one-out (which word is *not* from this root), and type-the-root (free recall, on-screen or physical keyboard; English keys map to the Israeli layout).
- **XP / levels / streaks**: 10–20 XP per answer with combo bonuses, level = √(XP/100)+1, streak counts consecutive days played.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Shell |
| `styles.css` | Styles (light + dark) |
| `app.js` | Game logic, SRS, views |
| `data/roots.js` | The root bank |
| `build.js` | `node build.js` bundles everything into `dist/yalla.html` (single file) |

## Adding roots

Append an object to the right `ROOTS_n` array in `data/roots.js`:

```js
{r:"כתב", m:"write", tier:1, cat:"speech", words:[
  {h:"כָּתַב", t:"katav", g:"he wrote", b:"pa'al"},
  ...
], note:"optional note shown after the question"}
```

`r` must be unique (use a digit suffix for homographs, e.g. `שכר2`; digits are stripped for display and typing).
