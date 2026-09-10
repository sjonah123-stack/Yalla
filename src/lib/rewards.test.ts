import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { SECTION_BY_ID } from "../data/course";
import { buildCourse } from "./course";
import { DAY, newRootState } from "./srs";
import { defaultProgress } from "./storage";
import {
  applySessionEnd,
  awardSeals,
  GEM_BASE,
  GEM_PER_CORRECT,
  GEM_PERFECT,
  GEM_PLACEMENT,
  GEM_SECTION_CHEST,
  GEM_UNIT_CHEST,
  isPerfect,
  newSeals,
  pendingChests,
  SEAL_BY_ID,
  SEAL_IDS,
  SEALS,
  sessionGems,
  settle,
  type SessionEnd,
} from "./rewards";
import type { Progress, RootState, SealId } from "../types";

const course = buildCourse(ROOTS);
const now = 1_700_000_000_000;
const mem = (): RootState => ({ ...newRootState(), reps: 2, ivl: 3, due: now + 3 * DAY, ok: 2 });
const seenBad = (): RootState => ({ ...newRootState(), bad: 1, due: now });

const end = (over: Partial<SessionEnd> = {}): SessionEnd => ({
  kind: "lesson",
  ok: 8,
  bad: 0,
  best: 8,
  typedOk: 0,
  completed: true,
  ...over,
});

/** Progress with every unit of the given sections stamped complete. */
function withSections(p: Progress, ids: string[], placed = false): Progress {
  const units = { ...p.units };
  for (const id of ids)
    for (const u of SECTION_BY_ID[id].units)
      units[u] = { ...(units[u] ?? {}), completedAt: now - DAY, ...(placed ? { placed } : {}) };
  return { ...p, units };
}

describe("sessionGems", () => {
  it("pays base plus per-correct, and the perfect bonus on a clean completed run", () => {
    expect(sessionGems(end({ ok: 8, bad: 2 }))).toEqual({
      base: GEM_BASE,
      correct: 8 * GEM_PER_CORRECT,
      perfect: 0,
    });
    expect(sessionGems(end({ ok: 8, bad: 0 }))).toEqual({
      base: GEM_BASE,
      correct: 8 * GEM_PER_CORRECT,
      perfect: GEM_PERFECT,
    });
  });
  it("is never perfect when the learner quit early", () => {
    const e = end({ ok: 3, bad: 0, completed: false });
    expect(isPerfect(e)).toBe(false);
    expect(sessionGems(e)).toEqual({ base: GEM_BASE, correct: 3 * GEM_PER_CORRECT, perfect: 0 });
  });
  it("pays nothing for tests or for a session with no answers", () => {
    expect(sessionGems(end({ kind: "test", ok: 10 }))).toEqual({ base: 0, correct: 0, perfect: 0 });
    expect(sessionGems(end({ ok: 0, bad: 0 }))).toEqual({ base: 0, correct: 0, perfect: 0 });
    expect(isPerfect(end({ ok: 0, bad: 0 }))).toBe(false);
  });
});

describe("pendingChests", () => {
  it("lists a completed unit, but not placed or already-paid ones", () => {
    const p = defaultProgress();
    p.units["speech-1"] = { completedAt: now };
    p.units["speech-2"] = { completedAt: now, placed: true };
    p.units["movement-1"] = { completedAt: now, chestAt: now };
    expect(pendingChests(course, p).units).toEqual(["speech-1"]);
  });
  it("never pays a section chest for a section skipped via placement", () => {
    const p = defaultProgress();
    for (const id of SECTION_BY_ID.speech.units) p.units[id] = { completedAt: now, placed: true };
    expect(pendingChests(course, p)).toEqual({ units: [], sections: [] });
    p.units["speech-2"] = { completedAt: now };
    expect(pendingChests(course, p).sections).toEqual([]);
  });
  it("lists a section only when every unit is complete and it is unpaid", () => {
    const p = defaultProgress();
    p.units["speech-1"] = { completedAt: now };
    expect(pendingChests(course, p).sections).toEqual([]);
    p.units["speech-2"] = { completedAt: now };
    expect(pendingChests(course, p).sections).toEqual(["speech"]);
    p.sectionChests.speech = now;
    expect(pendingChests(course, p).sections).toEqual([]);
  });
  it("is empty for a fresh learner", () => {
    expect(pendingChests(course, defaultProgress())).toEqual({ units: [], sections: [] });
  });
});

describe("settle", () => {
  it("pays 50 per unit and 50 per section, stamps markers, and pays 0 the second time", () => {
    const p0 = withSections(defaultProgress(), ["speech"]);
    const { p, receipt } = settle(course, p0, now);
    expect(receipt.unitChests).toEqual(["speech-1", "speech-2"]);
    expect(receipt.sectionChests).toEqual(["speech"]);
    expect(receipt.parts.units).toBe(2 * GEM_UNIT_CHEST);
    expect(receipt.parts.sections).toBe(GEM_SECTION_CHEST);
    expect(receipt.gems).toBe(2 * GEM_UNIT_CHEST + GEM_SECTION_CHEST);
    expect(p.gems).toBe(150);
    expect(p.units["speech-1"].chestAt).toBe(now);
    expect(p.units["speech-2"].chestAt).toBe(now);
    expect(p.sectionChests.speech).toBe(now);
    // Existing unit facts survive the stamp.
    expect(p.units["speech-1"].completedAt).toBe(now - DAY);

    const again = settle(course, p, now + 1);
    expect(again.receipt.gems).toBe(0);
    expect(again.receipt.unitChests).toEqual([]);
    expect(again.receipt.sectionChests).toEqual([]);
    expect(again.p.gems).toBe(150);
    expect(again.p.units["speech-1"].chestAt).toBe(now);
  });
  it("adds extra parts to the total", () => {
    const { p, receipt } = settle(course, defaultProgress(), now, { placement: GEM_PLACEMENT });
    expect(receipt.parts.placement).toBe(GEM_PLACEMENT);
    expect(receipt.gems).toBe(GEM_PLACEMENT);
    expect(p.gems).toBe(GEM_PLACEMENT);
    const r2 = settle(course, defaultProgress(), now, { base: 15, correct: 9 });
    expect(r2.receipt.gems).toBe(24);
    expect(r2.receipt.parts).toEqual({
      base: 15,
      correct: 9,
      perfect: 0,
      units: 0,
      sections: 0,
      placement: 0,
    });
  });
  it("fires the gems-300 seal in the same call that crosses 300", () => {
    const p0 = { ...defaultProgress(), gems: 250 };
    const { p, receipt } = settle(course, p0, now, { base: 50 });
    expect(p.gems).toBe(300);
    expect(receipt.newSeals).toContain("gems-300");
    expect(p.seals["gems-300"]).toBe(now);
    expect(
      settle(course, { ...defaultProgress(), gems: 250 }, now, { base: 49 }).receipt.newSeals,
    ).not.toContain("gems-300");
  });
  it("does not mutate its input", () => {
    const p0 = withSections(defaultProgress(), ["speech"]);
    const snapshot = JSON.stringify(p0);
    settle(course, p0, now);
    expect(JSON.stringify(p0)).toBe(snapshot);
  });
});

describe("awardSeals", () => {
  const cases: Array<{ id: SealId; make: () => Progress }> = [
    {
      id: "first-root",
      make: () => ({ ...defaultProgress(), roots: { [ROOTS[0].r]: seenBad() } }),
    },
    {
      id: "ten-memorized",
      make: () => ({
        ...defaultProgress(),
        roots: Object.fromEntries(ROOTS.slice(0, 10).map((r) => [r.r, mem()])),
      }),
    },
    {
      id: "first-unit",
      make: () => ({ ...defaultProgress(), units: { "time-1": { completedAt: now } } }),
    },
    { id: "speech-done", make: () => withSections(defaultProgress(), ["speech"], true) },
    { id: "combo-5", make: () => ({ ...defaultProgress(), bestCombo: 5 }) },
    { id: "streak-3", make: () => ({ ...defaultProgress(), streak: 3 }) },
    { id: "xp-500", make: () => ({ ...defaultProgress(), xp: 500 }) },
    { id: "perfect-lesson", make: () => ({ ...defaultProgress(), perfectLessons: 1 }) },
    { id: "typist", make: () => ({ ...defaultProgress(), typedOk: 5 }) },
    { id: "movement-done", make: () => withSections(defaultProgress(), ["movement"]) },
    { id: "gems-300", make: () => ({ ...defaultProgress(), gems: 300 }) },
    { id: "level-5", make: () => ({ ...defaultProgress(), xp: 1600 }) },
  ];

  it("has 12 seals with unique ids and letters in alef-bet order", () => {
    expect(SEALS).toHaveLength(12);
    expect(new Set(SEAL_IDS).size).toBe(12);
    expect(new Set(SEALS.map((s) => s.letter)).size).toBe(12);
    expect(SEALS.map((s) => s.letter).join("")).toBe("אבגדהוזחטיכל");
    expect(SEAL_IDS).toEqual([
      "first-root",
      "ten-memorized",
      "first-unit",
      "speech-done",
      "combo-5",
      "streak-3",
      "xp-500",
      "perfect-lesson",
      "typist",
      "movement-done",
      "gems-300",
      "level-5",
    ]);
    for (const s of SEALS) {
      expect(SEAL_BY_ID[s.id]).toBe(s);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.hint.length).toBeGreaterThan(0);
    }
    expect(cases.map((c) => c.id)).toEqual([...SEAL_IDS]);
  });

  it("awards nothing to a fresh learner", () => {
    const { p, earned } = awardSeals(course, defaultProgress(), now);
    expect(earned).toEqual([]);
    expect(p.seals).toEqual({});
  });

  it.each(cases)("awards exactly $id for its minimal fixture", ({ id, make }) => {
    const { p, earned } = awardSeals(course, make(), now);
    expect(earned).toContain(id);
    expect(p.seals[id]).toBe(now);
    // Fixtures are minimal: a subset relationship is allowed (speech-done implies first-unit,
    // ten-memorized implies first-root...) but the target must never be missing, and nothing
    // unrelated to the fixture may fire.
    const implied: Partial<Record<SealId, SealId[]>> = {
      "ten-memorized": ["first-root"],
      "speech-done": ["first-unit"],
      "movement-done": ["first-unit"],
      "level-5": ["xp-500"],
    };
    const allowed = new Set<SealId>([id, ...(implied[id] ?? [])]);
    for (const e of earned) expect(allowed.has(e)).toBe(true);
  });

  it("is sticky: a dropped streak keeps streak-3, and re-awarding keeps the first timestamp", () => {
    const first = awardSeals(course, { ...defaultProgress(), streak: 3 }, now);
    expect(first.earned).toEqual(["streak-3"]);
    const later = awardSeals(course, { ...first.p, streak: 0 }, now + DAY);
    expect(later.earned).toEqual([]);
    expect(later.p.seals["streak-3"]).toBe(now);
  });

  it("level-5 fires at 1600 XP, not 1599", () => {
    expect(awardSeals(course, { ...defaultProgress(), xp: 1599 }, now).earned).not.toContain(
      "level-5",
    );
    expect(awardSeals(course, { ...defaultProgress(), xp: 1600 }, now).earned).toContain("level-5");
  });

  it("returns the same object when nothing changes", () => {
    const p = { ...defaultProgress(), seals: { "xp-500": 5 }, xp: 600 };
    expect(awardSeals(course, p, now).p).toBe(p);
  });
});

describe("applySessionEnd", () => {
  it("raises bestCombo, accumulates typedOk, counts a perfect lesson, and pays session gems", () => {
    const p0 = { ...defaultProgress(), bestCombo: 3, typedOk: 2 };
    const { p, receipt } = applySessionEnd(
      course,
      p0,
      end({ ok: 6, bad: 0, best: 6, typedOk: 2 }),
      now,
    );
    expect(p.bestCombo).toBe(6);
    expect(p.typedOk).toBe(4);
    expect(p.perfectLessons).toBe(1);
    expect(receipt.parts).toEqual({
      base: GEM_BASE,
      correct: 6 * GEM_PER_CORRECT,
      perfect: GEM_PERFECT,
      units: 0,
      sections: 0,
      placement: 0,
    });
    expect(p.gems).toBe(receipt.gems);
    expect(receipt.newSeals).toEqual(["combo-5", "perfect-lesson"]);
  });
  it("keeps a higher existing bestCombo and does not count an imperfect or quit run", () => {
    const p0 = { ...defaultProgress(), bestCombo: 9 };
    const a = applySessionEnd(course, p0, end({ ok: 6, bad: 1, best: 4 }), now);
    expect(a.p.bestCombo).toBe(9);
    expect(a.p.perfectLessons).toBe(0);
    const b = applySessionEnd(course, p0, end({ ok: 6, bad: 0, best: 4, completed: false }), now);
    expect(b.p.perfectLessons).toBe(0);
    expect(b.receipt.parts.perfect).toBe(0);
    expect(b.receipt.gems).toBe(GEM_BASE + 6 * GEM_PER_CORRECT);
  });
  it("a perfect test still counts typedOk/combo but pays no gems and no perfect lesson", () => {
    const { p, receipt } = applySessionEnd(
      course,
      defaultProgress(),
      end({ kind: "test", ok: 10, bad: 0, best: 10, typedOk: 3 }),
      now,
    );
    expect(p.perfectLessons).toBe(0);
    expect(p.typedOk).toBe(3);
    expect(p.bestCombo).toBe(10);
    expect(receipt.gems).toBe(0);
  });
  it("also settles pending chests at session end", () => {
    // speech-1 alone: a unit chest but not yet the (two-unit) section chest.
    const p0 = { ...defaultProgress(), units: { "speech-1": { completedAt: now } } };
    const { p, receipt } = applySessionEnd(course, p0, end({ ok: 1, bad: 3, best: 1 }), now);
    expect(receipt.unitChests).toEqual(["speech-1"]);
    expect(receipt.sectionChests).toEqual([]);
    expect(p.units["speech-1"].chestAt).toBe(now);
    expect(receipt.gems).toBe(GEM_BASE + GEM_PER_CORRECT + GEM_UNIT_CHEST);
    expect(receipt.newSeals).toContain("first-unit");
  });
  it("a single-unit section pays its unit and section chests together", () => {
    const solo = buildCourse(
      ROOTS.filter((r) => r.unit === "time-1"),
      [{ ...SECTION_BY_ID.time, units: ["time-1"] }],
    );
    const p0 = { ...defaultProgress(), units: { "time-1": { completedAt: now } } };
    const { receipt } = applySessionEnd(
      solo,
      p0,
      end({ kind: "practice", ok: 1, bad: 3, best: 1 }),
      now,
    );
    expect(receipt.unitChests).toEqual(["time-1"]);
    expect(receipt.sectionChests).toEqual(["time"]);
    expect(receipt.gems).toBe(GEM_BASE + GEM_PER_CORRECT + GEM_UNIT_CHEST + GEM_SECTION_CHEST);
  });
});

describe("newSeals", () => {
  it("lists ids present after but not before, in seal order", () => {
    const before = { ...defaultProgress(), seals: { "xp-500": 1 } };
    const after = {
      ...defaultProgress(),
      seals: { "level-5": 3, "xp-500": 1, "first-root": 2 },
    };
    expect(newSeals(before, after)).toEqual(["first-root", "level-5"]);
    expect(newSeals(after, before)).toEqual([]);
    expect(newSeals(before, before)).toEqual([]);
  });
});
