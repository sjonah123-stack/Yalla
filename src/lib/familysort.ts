import type { Progress, Root, UnitId, Word } from "../types";
import type { Course } from "./course";
import { mastery } from "./srs";

export const SORT_MIN_WORDS = 3;
export const SORT_TILES = 8;

/**
 * Two roots for a Family sort round: the unit's lowest-mastery roots with at least three words,
 * topped up from earlier units on the path when the unit has fewer than two.
 */
export function familySortRoots(course: Course, unitId: UnitId, p: Progress): [Root, Root] | null {
  const unit = course.byId[unitId];
  if (!unit) return null;
  const eligible = (rs: readonly Root[]) =>
    rs
      .filter((r) => r.words.length >= SORT_MIN_WORDS)
      .sort((a, b) => mastery(p.roots[a.r]) - mastery(p.roots[b.r]) || a.rank - b.rank);
  const out: Root[] = eligible(unit.roots).slice(0, 2);
  for (let i = unit.pathIndex - 1; i >= 0 && out.length < 2; i--)
    for (const r of eligible(course.units[i].roots)) {
      if (out.length >= 2) break;
      if (!out.includes(r)) out.push(r);
    }
  return out.length === 2 ? [out[0], out[1]] : null;
}

export interface SortTile {
  id: number;
  root: Root;
  word: Word;
}

const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Up to `n` word tiles split evenly between the two roots (at least three each), shuffled. */
export function familySortTiles(a: Root, b: Root, n = SORT_TILES): SortTile[] {
  const per = Math.max(SORT_MIN_WORDS, Math.floor(n / 2));
  const wa = shuffle(a.words).slice(0, Math.min(per, a.words.length));
  const wb = shuffle(b.words).slice(0, Math.min(per, b.words.length));
  const tiles: SortTile[] = [
    ...wa.map((word, i) => ({ id: i * 2, root: a, word })),
    ...wb.map((word, i) => ({ id: i * 2 + 1, root: b, word })),
  ];
  return shuffle(tiles);
}
