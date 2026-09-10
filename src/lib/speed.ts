import type { DayStats, Progress, Root } from "../types";
import { buildQueue, seen } from "./srs";

export const SPEED_MS = 60_000;
export const SPEED_LEN = 80;
export const SPEED_MIN_ROOTS = 4;
/** A miss freezes the round this long, showing the answer. */
export const SPEED_MISS_MS = 1500;

/**
 * A long queue for a timed round: due roots first, then the weakest, cycled until `len` with
 * no adjacent repeat. Empty when nothing has been seen.
 */
export function buildSpeedQueue(
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "settings">,
  len = SPEED_LEN,
  now = Date.now(),
): Root[] {
  const pool = roots.filter((r) => seen(p.roots[r.r]));
  const base = buildQueue(pool, p, len, 0, now);
  if (!base.length) return [];
  const out: Root[] = [];
  let round = base.slice();
  while (out.length < len) {
    if (!round.length) {
      round = base.slice();
      for (let i = round.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [round[i], round[j]] = [round[j], round[i]];
      }
      if (round.length > 1 && round[0] === out[out.length - 1])
        [round[0], round[1]] = [round[1], round[0]];
    }
    out.push(round.shift()!);
  }
  return out;
}

export const speedBestToday = (history: Record<string, DayStats>, day: string): number =>
  history[day]?.speedBest ?? 0;

export const speedBestEver = (history: Record<string, DayStats>): number =>
  Object.values(history).reduce((m, h) => Math.max(m, h.speedBest ?? 0), 0);
