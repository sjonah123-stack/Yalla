import type { Mode, Progress, Root, UnitId } from "../types";
import type { Course } from "./course";
import { memorized } from "./course";
import { isDue, mastery, seen } from "./srs";

const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export interface LessonOptions {
  len: number;
  /** Unseen roots introduced per lesson. */
  newCap: number;
  /** Share of slots given to cumulative review of earlier units. */
  reviewShare: number;
}
export const LESSON_DEFAULTS: LessonOptions = { len: 16, newCap: 4, reviewShare: 0.3 };

/** Minimum distance between two slots of the same root. */
const GAP = 3;

/**
 * A lesson for one unit. Introduces up to `newCap` unseen roots (two slots each: learn card +
 * drill), mixes in ~30% review from earlier units, and fills with the unit's weakest roots.
 * The result may contain the same root twice.
 */
export function buildLesson(
  course: Course,
  unitId: UnitId,
  p: Progress,
  o: LessonOptions = LESSON_DEFAULTS,
  now: number = Date.now(),
): Root[] {
  const unit = course.byId[unitId];
  if (!unit) return [];
  const st = (r: Root) => p.roots[r.r];
  const unseen = unit.roots.filter((r) => !seen(st(r)));
  const weak = unit.roots
    .filter((r) => seen(st(r)) && !memorized(st(r)))
    .sort((a, b) => mastery(st(a)) - mastery(st(b)) || (st(a)?.due ?? 0) - (st(b)?.due ?? 0));
  const strong = unit.roots.filter((r) => memorized(st(r)));

  const intro = unseen.slice(0, o.newCap);
  const reviewN = Math.round(o.len * o.reviewShare);
  const pool = course.units
    .filter((u) => u.pathIndex < unit.pathIndex)
    .flatMap((u) => u.roots)
    .filter((r) => seen(st(r)));
  const due = pool.filter((r) => isDue(st(r), now)).sort((a, b) => st(a)!.due - st(b)!.due);
  const notDue = shuffle(pool.filter((r) => !isDue(st(r), now))).sort(
    (a, b) => mastery(st(a)) - mastery(st(b)),
  );
  const reviewAll = [...due, ...notDue];
  const review = reviewAll.slice(0, reviewN);

  const others: Root[] = [...review];
  const budget = () => o.len - intro.length * 2 - others.length;
  const take = (list: Root[]) => {
    for (const r of list) {
      if (budget() <= 0) break;
      if (!others.includes(r) && !intro.includes(r)) others.push(r);
    }
  };
  take(weak);
  take(strong.filter((r) => isDue(st(r), now)));
  const moreUnseen = unseen.slice(o.newCap);
  take(moreUnseen);
  take(strong);
  take(reviewAll.slice(reviewN));
  // Still short (early units, new learner): drill the extra unseen roots a second time.
  if (budget() > 0) for (const r of moreUnseen) if (budget() > 0) others.push(r);

  return layout(intro, others);
}

/**
 * Intro first-exposures at 0, 3, 6, 9. Everything else: a fresh root while any remain, unless a
 * repeat is overdue (first slot ≥ 2·GAP ago); repeats always ≥ GAP after their first slot.
 */
function layout(intro: Root[], others: Root[]): Root[] {
  let best: Root[] = [];
  let bestBad = Infinity;
  for (let attempt = 0; attempt < 30 && bestBad > 0; attempt++) {
    const rest = shuffle([...intro, ...others]);
    const total = intro.length + rest.length;
    const out: Root[] = [];
    const firstAt = new Map<Root, number>();
    let introI = 0;
    let bad = 0;
    const repeatIdx = (pos: number, minGap: number) => {
      let idx = -1;
      let earliest = Infinity;
      rest.forEach((r, i) => {
        const f = firstAt.get(r);
        if (f !== undefined && pos - f >= minGap && f < earliest) {
          earliest = f;
          idx = i;
        }
      });
      return idx;
    };
    for (let pos = 0; pos < total; pos++) {
      if (introI < intro.length && pos === introI * GAP) {
        const r = intro[introI++];
        out.push(r);
        firstAt.set(r, pos);
        continue;
      }
      let idx = repeatIdx(pos, 2 * GAP);
      if (idx < 0) idx = rest.findIndex((r) => !firstAt.has(r) && !intro.includes(r));
      if (idx < 0) idx = repeatIdx(pos, GAP);
      if (idx < 0) {
        idx = 0;
        bad++;
      }
      const r = rest.splice(idx, 1)[0];
      out.push(r);
      if (!firstAt.has(r)) firstAt.set(r, pos);
    }
    if (bad < bestBad) {
      bestBad = bad;
      best = out;
    }
  }
  return best;
}

// ---------- Unit test ----------
export interface TestItem {
  root: Root;
  mode: Mode;
}
export const TEST_LEN = 20;
const TEST_MODES: Mode[] = [
  ...Array<Mode>(8).fill("rootMeaning"),
  ...Array<Mode>(6).fill("meaningRoot"),
  ...Array<Mode>(4).fill("wordRoot"),
  ...Array<Mode>(2).fill("typeRoot"),
];

/** 20 fixed questions covering every root of the unit at least twice, no root twice in a row. */
export function buildTest(course: Course, unitId: UnitId): TestItem[] {
  const unit = course.byId[unitId];
  if (!unit || unit.roots.length === 0) return [];
  const roots: Root[] = [];
  const order = shuffle(unit.roots);
  for (let i = 0; roots.length < TEST_LEN; i++) roots.push(order[i % order.length]);
  // Round-robin already avoids adjacency; shuffle in blocks so the order isn't predictable.
  const blocks: Root[][] = [];
  for (let i = 0; i < roots.length; i += order.length)
    blocks.push(shuffle(roots.slice(i, i + order.length)));
  const seq: Root[] = [];
  for (const b of blocks) {
    if (seq.length && b[0] === seq[seq.length - 1] && b.length > 1) [b[0], b[1]] = [b[1], b[0]];
    seq.push(...b);
  }
  const modes = shuffle(TEST_MODES);
  return seq.slice(0, TEST_LEN).map((root, i) => ({ root, mode: modes[i] }));
}

/** Percentage score, 0–100. */
export const testScore = (ok: number, total: number): number =>
  total ? Math.round((ok / total) * 100) : 0;
