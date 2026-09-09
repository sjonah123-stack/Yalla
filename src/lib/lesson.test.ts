import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { buildCourse } from "./course";
import { buildLesson, buildTest, LESSON_DEFAULTS, TEST_LEN } from "./lesson";
import { DAY, newRootState } from "./srs";
import { defaultProgress } from "./storage";
import type { RootState } from "../types";

const course = buildCourse(ROOTS);
const now = Date.now();
const mem = (due = now + 3 * DAY): RootState => ({
  ...newRootState(),
  reps: 2,
  ivl: 3,
  due,
  ok: 2,
});

const gaps = (q: readonly { r: string }[]) => {
  const first = new Map<string, number>();
  const out: number[] = [];
  q.forEach((r, i) => {
    if (first.has(r.r)) out.push(i - first.get(r.r)!);
    else first.set(r.r, i);
  });
  return out;
};

describe("buildLesson", () => {
  it("a brand-new learner: 4 intro roots twice, intro exposures at 0/3/6/9, no review", () => {
    const p = defaultProgress();
    const u = course.units[0];
    const q = buildLesson(course, u.id, p, LESSON_DEFAULTS, now);
    expect(q).toHaveLength(LESSON_DEFAULTS.len);
    expect(q.every((r) => r.unit === u.id)).toBe(true);
    const intro = u.roots.slice(0, 4).map((r) => r.r);
    expect([q[0].r, q[3].r, q[6].r, q[9].r]).toEqual(intro);
    for (const id of intro) expect(q.filter((r) => r.r === id)).toHaveLength(2);
    for (const g of gaps(q)) expect(g).toBeGreaterThanOrEqual(3);
  });
  it("mixes ~30% review from earlier units once they exist", () => {
    const p = defaultProgress();
    const u0 = course.units[0];
    const u1 = course.units[1];
    for (const r of u0.roots) p.roots[r.r] = mem(now - DAY);
    const q = buildLesson(course, u1.id, p, LESSON_DEFAULTS, now);
    const review = q.filter((r) => r.unit === u0.id);
    expect(review.length).toBe(Math.round(LESSON_DEFAULTS.len * 0.3));
    expect(new Set(review.map((r) => r.r)).size).toBe(review.length);
  });
  it("a fully memorized unit becomes weakest-first practice with review", () => {
    const p = defaultProgress();
    const u0 = course.units[0];
    const u1 = course.units[1];
    for (const r of [...u0.roots, ...u1.roots]) p.roots[r.r] = mem();
    const q = buildLesson(course, u1.id, p, LESSON_DEFAULTS, now);
    expect(q.length).toBeGreaterThan(0);
    expect(q.some((r) => r.unit === u1.id)).toBe(true);
    expect(q.filter((r) => r.unit === u0.id).length).toBeGreaterThan(0);
  });
  it("returns nothing for an unknown unit", () => {
    expect(buildLesson(course, "ghost-1", defaultProgress())).toEqual([]);
  });
});

describe("buildTest", () => {
  it("20 questions, every root at least twice, fixed mode mix, no immediate repeats", () => {
    for (const u of course.units) {
      const t = buildTest(course, u.id);
      expect(t).toHaveLength(TEST_LEN);
      for (const r of u.roots)
        expect(t.filter((x) => x.root === r).length).toBeGreaterThanOrEqual(2);
      const modes = t.map((x) => x.mode);
      expect(modes.filter((m) => m === "rootMeaning")).toHaveLength(8);
      expect(modes.filter((m) => m === "typeRoot")).toHaveLength(2);
      for (let i = 1; i < t.length; i++) expect(t[i].root, u.id).not.toBe(t[i - 1].root);
    }
  });
});
