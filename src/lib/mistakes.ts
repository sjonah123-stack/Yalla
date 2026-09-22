import type { Mistake, Progress, Root } from "../types";
import { mastery, DAY } from "./srs";
import { MISTAKES_MAX } from "./storage";

// ---------- The mistake notebook ----------

/** How far back "fix my mistakes" looks. */
export const MISTAKE_WINDOW = 21 * DAY;
/** A root proven at this mastery no longer needs fixing. */
export const FIXED_MASTERY = 3;

/** Append a mistake, keeping the newest MISTAKES_MAX. */
export function addMistake(list: readonly Mistake[], m: Mistake): Mistake[] {
  const out = [...list, m];
  return out.length > MISTAKES_MAX ? out.slice(-MISTAKES_MAX) : out;
}

export interface MistakeRoot {
  root: Root;
  count: number;
  last: number;
}

/**
 * Roots missed within the window that haven't been re-proven, most-missed first (then most
 * recent). These feed the "Fix my mistakes" round.
 */
export function mistakeRoots(
  roots: readonly Root[],
  p: Pick<Progress, "mistakes" | "roots">,
  now: number,
): MistakeRoot[] {
  const byId = new Map(roots.map((r) => [r.r, r]));
  const agg = new Map<string, { count: number; last: number }>();
  for (const m of p.mistakes) {
    if (now - m.at > MISTAKE_WINDOW) continue;
    const a = agg.get(m.root) ?? { count: 0, last: 0 };
    a.count++;
    a.last = Math.max(a.last, m.at);
    agg.set(m.root, a);
  }
  const out: MistakeRoot[] = [];
  for (const [id, a] of agg) {
    const root = byId.get(id);
    if (!root || mastery(p.roots[id]) >= FIXED_MASTERY) continue;
    out.push({ root, ...a });
  }
  return out.sort((x, y) => y.count - x.count || y.last - x.last);
}

export interface Confusion {
  a: Root;
  b: Root;
  count: number;
}

/** Pairs of roots mixed up with each other (either direction), most frequent first. */
export function confusions(
  roots: readonly Root[],
  p: Pick<Progress, "mistakes">,
  limit = 6,
): Confusion[] {
  const byId = new Map(roots.map((r) => [r.r, r]));
  const agg = new Map<string, number>();
  for (const m of p.mistakes) {
    if (!m.pickedRoot || m.pickedRoot === m.root) continue;
    const key = [m.root, m.pickedRoot].sort().join("|");
    agg.set(key, (agg.get(key) ?? 0) + 1);
  }
  const out: Confusion[] = [];
  for (const [key, count] of agg) {
    const [x, y] = key.split("|");
    const a = byId.get(x);
    const b = byId.get(y);
    if (a && b) out.push({ a, b, count });
  }
  return out.sort((x, y) => y.count - x.count).slice(0, limit);
}
