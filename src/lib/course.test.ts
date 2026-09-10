import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { SECTIONS, UNIT_IDS } from "../data/course";
import {
  buildCourse,
  currentUnit,
  memorized,
  memorizedCount,
  newlyCompleted,
  nextLockedUnit,
  unitCracked,
  unitStatus,
  unitTitle,
  sectionSummary,
} from "./course";
import { DAY, newRootState } from "./srs";
import { defaultProgress } from "./storage";
import type { RootState } from "../types";

const course = buildCourse(ROOTS);
const now = Date.now();
const mem = (): RootState => ({ ...newRootState(), reps: 2, ivl: 3, due: now + 3 * DAY, ok: 2 });
const learnedSt = (): RootState => ({ ...newRootState(), reps: 1, ivl: 1, due: now + DAY, ok: 1 });
const seenBad = (): RootState => ({ ...newRootState(), bad: 1, due: now });

describe("buildCourse", () => {
  it("has 24 units in path order, every root in exactly one unit", () => {
    expect(course.units).toHaveLength(UNIT_IDS.length);
    expect(course.units.map((u) => u.id)).toEqual([...UNIT_IDS]);
    const counted = course.units.reduce((a, u) => a + u.roots.length, 0);
    expect(counted).toBe(ROOTS.length);
    course.units.forEach((u, i) => expect(u.pathIndex).toBe(i));
  });
  it("sorts unit roots by rank and titles units per section", () => {
    for (const u of course.units)
      for (let i = 1; i < u.roots.length; i++)
        expect(u.roots[i].rank).toBeGreaterThan(u.roots[i - 1].rank);
    expect(unitTitle(course.byId["speech-1"])).toBe("Speech 1");
    // A section with a single unit takes the section's title.
    const solo = buildCourse(
      ROOTS.filter((r) => r.unit === "time-1"),
      [{ ...SECTIONS.find((s) => s.id === "time")!, units: ["time-1"] }],
    );
    expect(unitTitle(solo.byId["time-1"])).toBe("Time");
    expect(course.sections).toBe(SECTIONS);
  });
});

describe("unitStatus", () => {
  const u1 = course.units[0];
  const u2 = course.units[1];
  const u3 = course.units[2];
  it("first unit available, later units locked for a new learner", () => {
    const p = defaultProgress();
    expect(unitStatus(u1, course, p)).toBe("available");
    expect(unitStatus(u2, course, p)).toBe("locked");
    expect(currentUnit(course, p)).toBe(u1);
    expect(nextLockedUnit(course, p)).toBe(u2);
  });
  it("started → learned → complete as roots progress; complete unlocks the next unit", () => {
    const p = defaultProgress();
    p.roots[u1.roots[0].r] = seenBad();
    expect(unitStatus(u1, course, p)).toBe("started");
    for (const r of u1.roots) p.roots[r.r] = learnedSt();
    expect(unitStatus(u1, course, p)).toBe("learned");
    expect(unitStatus(u2, course, p)).toBe("locked");
    for (const r of u1.roots) p.roots[r.r] = mem();
    expect(unitStatus(u1, course, p)).toBe("complete");
    expect(unitStatus(u2, course, p)).toBe("available");
    expect(unitStatus(u3, course, p)).toBe("locked");
    expect(currentUnit(course, p)).toBe(u2);
    expect(newlyCompleted(course, p).map((u) => u.id)).toEqual([u1.id]);
    expect(memorizedCount(ROOTS, p)).toBe(u1.roots.length);
  });
  it("gold from a test score, and test-out unlocks the next unit", () => {
    const p = defaultProgress();
    p.units[u2.id] = { testBest: 92 };
    expect(unitStatus(u2, course, p)).toBe("gold");
    expect(unitStatus(u3, course, p)).toBe("available");
    p.units[u2.id] = { testBest: 80 };
    expect(unitStatus(u2, course, p)).toBe("locked");
  });
  it("a sticky completedAt keeps the unit complete but flags it cracked when roots decay", () => {
    const p = defaultProgress();
    p.units[u1.id] = { completedAt: now };
    p.roots[u1.roots[0].r] = mem();
    expect(unitStatus(u1, course, p)).toBe("complete");
    expect(unitCracked(course.byId[u1.id], p)).toBe(true);
    for (const r of u1.roots) p.roots[r.r] = mem();
    expect(unitCracked(course.byId[u1.id], p)).toBe(false);
  });
  it("placement unlocks every unit up to the start unit", () => {
    const p = defaultProgress();
    p.placement = { at: now, startUnit: u3.id, score: 70 };
    expect(unitStatus(u2, course, p)).toBe("available");
    expect(unitStatus(u3, course, p)).toBe("available");
    expect(unitStatus(course.units[3], course, p)).toBe("locked");
  });
  it("a unit with any seen root is never locked (pre-path learners)", () => {
    const p = defaultProgress();
    const late = course.units[10];
    p.roots[late.roots[0].r] = seenBad();
    expect(unitStatus(late, course, p)).toBe("started");
  });
  it("lastUnit wins for Continue while still open", () => {
    const p = defaultProgress();
    p.roots[u2.roots[0].r] = seenBad();
    p.lastUnit = u2.id;
    expect(currentUnit(course, p)).toBe(u2);
    for (const r of u2.roots) p.roots[r.r] = mem();
    expect(currentUnit(course, p)).toBe(u1);
  });
  it("memorized means interval ≥ 3", () => {
    expect(memorized(learnedSt())).toBe(false);
    expect(memorized(mem())).toBe(true);
    expect(memorized(undefined)).toBe(false);
  });
});

describe("sectionSummary", () => {
  it("marks the first section open and current for a new learner, later ones locked", () => {
    const p = defaultProgress();
    const first = sectionSummary(SECTIONS[0], course, p);
    expect(first.state).toBe("open");
    expect(first.isCurrent).toBe(true);
    expect(first.memorized).toBe(0);
    expect(first.pct).toBe(0);
    expect(first.units.map((u) => u.id)).toEqual([...SECTIONS[0].units]);
    const later = sectionSummary(SECTIONS[3], course, p);
    expect(later.state).toBe("locked");
    expect(later.isCurrent).toBe(false);
  });
  it("is done at 100% memorized and counts match memorizedCount", () => {
    const p = defaultProgress();
    for (const u of course.units.filter((u) => u.section.id === SECTIONS[0].id))
      for (const r of u.roots) p.roots[r.r] = mem();
    const s = sectionSummary(SECTIONS[0], course, p);
    expect(s.state).toBe("done");
    expect(s.pct).toBe(100);
    expect(s.memorized).toBe(memorizedCount(s.roots, p));
  });
});
