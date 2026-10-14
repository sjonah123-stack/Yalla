import type { Progress, Root, RootFlag, RootState } from "../types";
import { normLetters, rootLetters, stripNikud } from "./hebrew";
import { isDue, isTricky, seen } from "./srs";
import { memorized } from "./course";
import { isActiveFlag } from "./flags";

/** The Roots tab's filter chips. */
export type BankChip = "all" | "due" | "learning" | "memorized" | "unmet" | "tricky" | "flagged";

/** Does a root's state pass the selected filter chip? */
export function matchesChip(
  chip: BankChip,
  st: RootState | undefined,
  now: number,
  flag: RootFlag | undefined,
): boolean {
  switch (chip) {
    case "due":
      return isDue(st, now);
    case "learning":
      return seen(st) && !memorized(st);
    case "memorized":
      return memorized(st);
    case "unmet":
      return !seen(st);
    case "tricky":
      return isTricky(st);
    case "flagged":
      return isActiveFlag(flag);
    default:
      return true;
  }
}

/** Does a root match the search box: its letters, meaning, theme, or any word, gloss or transliteration? */
export function matchesSearch(r: Root, filter: string): boolean {
  const f = filter.trim().toLowerCase();
  if (!f) return true;
  const fh = normLetters(f);
  return (
    rootLetters(r).includes(fh) ||
    r.m.toLowerCase().includes(f) ||
    r.cat.includes(f) ||
    r.words.some(
      (w) =>
        stripNikud(w.h).includes(f) ||
        w.g.toLowerCase().includes(f) ||
        w.t.toLowerCase().includes(f),
    )
  );
}

/** The roots the Roots tab lists for a search and chip, in bank order. */
export function bankRoots(
  roots: readonly Root[],
  filter: string,
  chip: BankChip,
  p: Pick<Progress, "roots" | "flags">,
  now: number,
): Root[] {
  return roots.filter(
    (r) => matchesSearch(r, filter) && matchesChip(chip, p.roots[r.r], now, p.flags[r.r]),
  );
}
