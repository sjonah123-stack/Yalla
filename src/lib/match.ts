import type { Progress, Root, UnitId } from "../types";
import type { Course } from "./course";
import { mastery } from "./srs";

export const MATCH_PAIRS = 8;

/**
 * Roots for a Match round: the unit's 8 lowest-mastery roots, topped up from the previous unit
 * in the section (then the previous unit on the path). Short labels must be distinct.
 */
export function matchRoots(course: Course, unitId: UnitId, p: Progress, n = MATCH_PAIRS): Root[] {
  const unit = course.byId[unitId];
  if (!unit) return [];
  const byWeakness = (rs: readonly Root[]) =>
    rs.slice().sort((a, b) => mastery(p.roots[a.r]) - mastery(p.roots[b.r]) || a.rank - b.rank);
  const out: Root[] = [];
  const shorts = new Set<string>();
  const add = (rs: readonly Root[]) => {
    for (const r of rs) {
      if (out.length >= n) return;
      const k = r.short.toLowerCase();
      if (shorts.has(k)) continue;
      shorts.add(k);
      out.push(r);
    }
  };
  add(byWeakness(unit.roots));
  for (let i = unit.pathIndex - 1; i >= 0 && out.length < n; i--)
    add(byWeakness(course.units[i].roots));
  return out;
}

export interface MatchTile {
  id: number;
  root: Root;
  kind: "root" | "meaning";
}

const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function matchTiles(roots: readonly Root[]): MatchTile[] {
  const tiles = roots.flatMap((root, i) => [
    { id: i * 2, root, kind: "root" as const },
    { id: i * 2 + 1, root, kind: "meaning" as const },
  ]);
  return shuffle(tiles);
}

export const formatMs = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;
