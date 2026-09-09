import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { buildCourse } from "./course";
import { matchRoots, matchTiles, MATCH_PAIRS } from "./match";
import { defaultProgress } from "./storage";

const course = buildCourse(ROOTS);

describe("matchRoots", () => {
  it("returns 8 roots with distinct short labels for every unit", () => {
    const p = defaultProgress();
    for (const u of course.units) {
      const rs = matchRoots(course, u.id, p);
      expect(rs, u.id).toHaveLength(MATCH_PAIRS);
      expect(new Set(rs.map((r) => r.short.toLowerCase())).size).toBe(MATCH_PAIRS);
    }
  });
  it("tops up a small unit from earlier units", () => {
    const small = course.units.find((u) => u.roots.length < MATCH_PAIRS)!;
    const rs = matchRoots(course, small.id, defaultProgress());
    expect(rs.filter((r) => r.unit === small.id)).toHaveLength(small.roots.length);
    expect(rs.some((r) => r.unit !== small.id)).toBe(true);
  });
  it("tiles are two per root", () => {
    const rs = matchRoots(course, course.units[0].id, defaultProgress());
    const t = matchTiles(rs);
    expect(t).toHaveLength(16);
    expect(new Set(t.map((x) => x.id)).size).toBe(16);
  });
});
