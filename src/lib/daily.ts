import type { Mode, Progress, Root } from "../types";
import { seeded } from "./rng";
import { lapsesOf, mastery, seen } from "./srs";
import { canBuildWord, canCloze } from "./quiz";

// ---------- Root of the day ----------
//
// Chosen once per day (on the first tick of the day) from the learner's weakest seen roots with a
// seeded pick, and stamped in `Progress.quests` as "day:root:<id>" so it stays put all day and
// every device agrees (the earliest stamp wins if two devices chose independently).

const POOL = 12;
const PREFIX = (day: string) => `${day}:root:`;

/** The stored root of the day, if chosen. */
export function dailyRootId(p: Pick<Progress, "quests">, day: string): string | null {
  let best: { id: string; at: number } | null = null;
  const pre = PREFIX(day);
  for (const [k, at] of Object.entries(p.quests))
    if (k.startsWith(pre) && (!best || at < best.at)) best = { id: k.slice(pre.length), at };
  return best?.id ?? null;
}

/** Pick today's root (without storing it): seeded among the weakest seen roots. */
export function pickDailyRoot(
  roots: readonly Root[],
  p: Pick<Progress, "roots">,
  day: string,
): Root | null {
  const seenRoots = roots.filter((r) => seen(p.roots[r.r]));
  if (!seenRoots.length) return null;
  const weakest = seenRoots
    .slice()
    .sort(
      (a, b) =>
        mastery(p.roots[a.r]) - mastery(p.roots[b.r]) ||
        lapsesOf(p.roots[b.r]) - lapsesOf(p.roots[a.r]) ||
        (a.r < b.r ? -1 : 1),
    )
    .slice(0, POOL);
  return weakest[Math.floor(seeded(`daily:${day}`)() * weakest.length)];
}

/** Stamp today's root if none is stored yet. */
export function ensureDailyRoot(
  roots: readonly Root[],
  p: Progress,
  day: string,
  now: number,
): Progress {
  if (dailyRootId(p, day)) return p;
  const r = pickDailyRoot(roots, p, day);
  return r ? { ...p, quests: { ...p.quests, [PREFIX(day) + r.r]: now } } : p;
}

/** Words of the root the learner doesn't know yet (discovery material). */
export const unknownWords = (root: Root, known: ReadonlySet<string>) =>
  root.words.filter((w) => !known.has(w.h));

/**
 * The four questions of the daily mini-round, easiest to hardest: recognise, discover a new
 * family member, use a word, produce.
 */
export function dailyModes(
  root: Root,
  p: Pick<Progress, "roots">,
  known: ReadonlySet<string>,
): Mode[] {
  const m = mastery(p.roots[root.r]);
  return [
    "rootMeaning",
    unknownWords(root, known).length ? "guessWord" : "wordRoot",
    canCloze(root) ? "cloze" : canBuildWord(root) ? "buildWord" : "wordRoot",
    m >= 2 ? "typeRoot" : "meaningRoot",
  ];
}
