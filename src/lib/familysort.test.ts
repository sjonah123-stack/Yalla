import { describe, expect, it } from "vitest";
import { familySortRoots, familySortTiles, SORT_MIN_WORDS } from "./familysort";
import { buildCourse } from "./course";
import { ROOTS } from "../data/roots";
import { defaultProgress } from "./storage";

const course = buildCourse(ROOTS);

describe("familySortRoots", () => {
  it("yields two distinct roots with enough words for every unit", () => {
    for (const u of course.units) {
      const pair = familySortRoots(course, u.id, defaultProgress());
      expect(pair, u.id).not.toBeNull();
      const [a, b] = pair!;
      expect(a).not.toBe(b);
      expect(a.words.length).toBeGreaterThanOrEqual(SORT_MIN_WORDS);
      expect(b.words.length).toBeGreaterThanOrEqual(SORT_MIN_WORDS);
    }
  });
  it("returns null for an unknown unit", () => {
    expect(familySortRoots(course, "nope-1", defaultProgress())).toBeNull();
  });
});

describe("familySortTiles", () => {
  it("makes 6–8 tiles with stable ids, split between the two roots, no shared word", () => {
    for (const u of course.units.slice(0, 20)) {
      const [a, b] = familySortRoots(course, u.id, defaultProgress())!;
      const tiles = familySortTiles(a, b);
      expect(tiles.length).toBeGreaterThanOrEqual(6);
      expect(tiles.length).toBeLessThanOrEqual(8);
      expect(new Set(tiles.map((t) => t.id)).size).toBe(tiles.length);
      expect(tiles.filter((t) => t.root === a).length).toBeGreaterThanOrEqual(3);
      expect(tiles.filter((t) => t.root === b).length).toBeGreaterThanOrEqual(3);
      expect(new Set(tiles.map((t) => t.word.h)).size).toBe(tiles.length);
    }
  });
});
