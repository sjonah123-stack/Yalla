import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { buildCourse, unitStatus } from "./course";
import { applyPlacement, placementResult, placementSample } from "./placement";
import { defaultProgress } from "./storage";

const course = buildCourse(ROOTS);
const now = Date.now();

describe("placementSample", () => {
  it("covers the path in order with one root per stride, lowest rank first", () => {
    const s = placementSample(course, 30);
    expect(s).toHaveLength(30);
    const idx = s.map((r) => course.byId[r.unit].pathIndex);
    for (let i = 1; i < idx.length; i++) expect(idx[i]).toBeGreaterThanOrEqual(idx[i - 1]);
    expect(new Set(s.map((r) => r.unit)).size).toBe(course.units.length);
    expect(s[0]).toBe(course.units[0].roots[0]);
  });
});

describe("placementResult", () => {
  const s = placementSample(course, 30);
  it("all correct → last unit", () => {
    const r = placementResult(
      course,
      s.map((root) => ({ root, ok: true })),
    );
    expect(r.startUnit).toBe(course.units[course.units.length - 1].id);
    expect(r.score).toBe(100);
  });
  it("stops where 2 of the last 4 are wrong, starting at the first wrong of that window", () => {
    const answers = s.map((root, i) => ({ root, ok: !(i === 10 || i === 12) }));
    const r = placementResult(course, answers);
    expect(r.startUnit).toBe(s[10].unit);
  });
  it("a lone miss does not stop the walk", () => {
    const answers = s.map((root, i) => ({ root, ok: i !== 5 }));
    expect(placementResult(course, answers).startUnit).toBe(
      course.units[course.units.length - 1].id,
    );
  });
});

describe("applyPlacement", () => {
  it("memorizes correct roots, completes earlier units, pre-schedules their unseen roots", () => {
    const s = placementSample(course, 30);
    const answers = s.map((root, i) => ({ root, ok: i < 8 || (i > 8 && i < 10) }));
    const p = applyPlacement(course, defaultProgress(), answers, now);
    const start = course.byId[p.placement!.startUnit];
    expect(start.pathIndex).toBeGreaterThan(0);
    for (const u of course.units) {
      if (u.pathIndex < start.pathIndex) {
        expect(p.units[u.id]?.placed).toBe(true);
        expect(unitStatus(u, course, p)).toBe("complete");
        for (const r of u.roots) expect(p.roots[r.r].reps).toBeGreaterThanOrEqual(2);
      }
    }
    expect(unitStatus(start, course, p)).not.toBe("locked");
    expect(p.roots[s[0].r].ivl).toBe(3);
    expect(p.roots[s[0].r].ok).toBe(2);
    expect(p.lastUnit).toBe(start.id);
    // a wrong answer writes nothing
    expect(p.roots[s[8].r]?.ok ?? 0).toBe(0);
  });
});
