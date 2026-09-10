import type { Progress, Root, UnitId } from "../types";
import type { Course } from "./course";
import { applyAnswer, DAY, newRootState, seen } from "./srs";

export const PLACEMENT_LEN = 30;

/** One root per stride of the path (lowest rank first), in path order. */
export function placementSample(course: Course, n?: number): Root[] {
  const K = course.units.length;
  // Every unit is sampled at least once, so long paths get a longer sweep.
  n ??= Math.max(PLACEMENT_LEN, K);
  if (!K) return [];
  const used = new Map<UnitId, number>();
  const out: Root[] = [];
  for (let i = 0; i < n; i++) {
    const u = course.units[Math.floor((i * K) / n)];
    const k = used.get(u.id) ?? 0;
    if (k < u.roots.length) {
      out.push(u.roots[k]);
      used.set(u.id, k + 1);
    }
  }
  return out;
}

export interface PlacementAnswer {
  root: Root;
  ok: boolean;
}

/** Walk answers in path order; stop where 2 of the last 4 are wrong. */
export function placementResult(
  course: Course,
  answers: readonly PlacementAnswer[],
): { startUnit: UnitId; score: number } {
  const ordered = answers
    .slice()
    .sort(
      (a, b) =>
        course.byId[a.root.unit].pathIndex - course.byId[b.root.unit].pathIndex ||
        a.root.rank - b.root.rank,
    );
  const score = ordered.length
    ? Math.round((ordered.filter((a) => a.ok).length / ordered.length) * 100)
    : 0;
  for (let i = 0; i < ordered.length; i++) {
    const win = ordered.slice(Math.max(0, i - 3), i + 1);
    if (win.filter((a) => !a.ok).length >= 2) {
      const firstWrong = win.find((a) => !a.ok)!;
      return { startUnit: firstWrong.root.unit, score };
    }
  }
  const last = course.units[course.units.length - 1];
  return { startUnit: last?.id ?? ordered[0]?.root.unit, score };
}

/**
 * Apply a finished placement test. Correct answers count as two first-try corrects (memorized);
 * units before the start unit are marked complete and their unseen roots pre-scheduled a week out
 * (ok/bad stay 0, so the learn card still shows once and a later miss resets them honestly).
 */
export function applyPlacement(
  course: Course,
  p: Progress,
  answers: readonly PlacementAnswer[],
  now: number = Date.now(),
): Progress {
  const { startUnit, score } = placementResult(course, answers);
  const roots = { ...p.roots };
  const units = { ...p.units };
  for (const a of answers) {
    if (!a.ok) continue;
    // A placement-correct root counts as memorized: its second step is granted on the spot.
    const learned = applyAnswer(roots[a.root.r], true, true, now);
    roots[a.root.r] = { ...applyAnswer(learned, true, true, learned.due), due: now + 3 * DAY };
  }
  const startIdx = course.byId[startUnit]?.pathIndex ?? 0;
  for (const u of course.units) {
    if (u.pathIndex >= startIdx) break;
    units[u.id] = {
      ...(units[u.id] ?? {}),
      completedAt: units[u.id]?.completedAt ?? now,
      placed: true,
    };
    for (const r of u.roots) {
      if (seen(roots[r.r]) || (roots[r.r]?.reps ?? 0) > 0) continue;
      roots[r.r] = { ...newRootState(), reps: 2, ivl: 7, due: now + 7 * DAY };
    }
  }
  return { ...p, roots, units, placement: { at: now, startUnit, score }, lastUnit: startUnit };
}
