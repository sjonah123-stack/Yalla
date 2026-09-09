import { describe, expect, it } from "vitest";
import { defaultProgress, mergeProgress, mergeUnit, normalize, pruneHistory } from "./storage";
import { newRootState } from "./srs";

describe("normalize", () => {
  it("migrates a v1 blob, filling new settings", () => {
    const v1 = {
      v: 1,
      xp: 420,
      streak: 3,
      lastPlay: "2026-01-02",
      roots: { כתב: { ...newRootState(), reps: 2 } },
      history: {},
      settings: { sessionLen: 20, newPerSession: 8, cats: ["time"], nikud: false },
      updatedAt: 5,
    };
    const p = normalize(v1);
    expect(p.v).toBe(3);
    expect(p.xp).toBe(420);
    expect(p.roots["כתב"].reps).toBe(2);
    expect(p.settings.nikud).toBe(false);
    expect(p.settings.cats).toEqual(["time"]);
    expect(p.settings.audio).toBe(true);
    expect(p.settings.theme).toBe("system");
    expect(p.settings.dailyGoal).toBe(50);
    expect("newPerSession" in p.settings).toBe(false);
    expect(p.units).toEqual({});
    expect(p.placement).toBeNull();
    expect(p.lastUnit).toBeNull();
  });
  it("migrates a v2 blob keeping roots, xp and streak", () => {
    const v2 = { ...defaultProgress(), v: 2, xp: 900, streak: 7, roots: { דבר: newRootState() } };
    const p = normalize(v2);
    expect(p.v).toBe(3);
    expect(p.xp).toBe(900);
    expect(p.streak).toBe(7);
    expect(p.roots["דבר"]).toBeDefined();
  });
  it("drops unit records and placement for unknown units", () => {
    const p = normalize({
      ...defaultProgress(),
      units: { "speech-1": { testBest: 95 }, "ghost-9": { testBest: 100 } },
      placement: { at: 1, startUnit: "ghost-9", score: 50 },
      lastUnit: "ghost-9",
    });
    expect(Object.keys(p.units)).toEqual(["speech-1"]);
    expect(p.placement).toBeNull();
    expect(p.lastUnit).toBeNull();
  });
  it("tolerates garbage", () => {
    expect(normalize(null).xp).toBe(0);
    expect(normalize("x").settings.sessionLen).toBe(20);
    expect(normalize({ settings: { dailyGoal: 7 } }).settings.dailyGoal).toBe(50);
  });
});

describe("mergeUnit", () => {
  it("keeps best test, best time, earliest completion, any placement", () => {
    const m = mergeUnit(
      { testBest: 80, matchBestMs: 30000, completedAt: 200 },
      { testBest: 95, matchBestMs: 25000, completedAt: 100, placed: true },
    );
    expect(m).toEqual({ testBest: 95, matchBestMs: 25000, completedAt: 100, placed: true });
    expect(mergeUnit(undefined, { testBest: 50 })).toEqual({ testBest: 50 });
  });
});

describe("mergeProgress", () => {
  it("keeps the more-practiced root from either side", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.roots["כתב"] = { ...newRootState(), ok: 5, reps: 3, ivl: 7, due: 100 };
    b.roots["כתב"] = { ...newRootState(), ok: 1, reps: 1, ivl: 1, due: 50 };
    b.roots["דבר"] = { ...newRootState(), ok: 2, reps: 2, ivl: 3, due: 60 };
    a.updatedAt = 1;
    b.updatedAt = 2;
    const m = mergeProgress(a, b);
    expect(m.roots["כתב"].reps).toBe(3);
    expect(m.roots["דבר"].reps).toBe(2);
    expect(mergeProgress(b, a).roots["כתב"].reps).toBe(3);
  });
  it("takes max xp, per-day max history, later streak, newer settings", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.xp = 300;
    b.xp = 200;
    a.history["2026-01-01"] = { ok: 5, bad: 1, xp: 50 };
    b.history["2026-01-01"] = { ok: 3, bad: 2, xp: 30, mem: 4 };
    b.history["2026-01-02"] = { ok: 1, bad: 0, xp: 10 };
    a.streak = 2;
    a.lastPlay = "2026-01-01";
    b.streak = 3;
    b.lastPlay = "2026-01-02";
    a.settings.nikud = false;
    a.updatedAt = 10;
    b.updatedAt = 5;
    const m = mergeProgress(a, b);
    expect(m.xp).toBe(300);
    expect(m.history["2026-01-01"]).toEqual({ ok: 5, bad: 2, xp: 50, mem: 4 });
    expect(m.history["2026-01-02"].xp).toBe(10);
    expect(m.streak).toBe(3);
    expect(m.settings.nikud).toBe(false);
  });
  it("merges units per id and keeps the earliest placement", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.units["speech-1"] = { testBest: 70 };
    b.units["speech-1"] = { matchBestMs: 20000 };
    b.units["speech-2"] = { completedAt: 5 };
    a.placement = { at: 20, startUnit: "speech-2", score: 60 };
    b.placement = { at: 10, startUnit: "speech-1", score: 40 };
    const m = mergeProgress(a, b);
    expect(m.units["speech-1"]).toEqual({ testBest: 70, matchBestMs: 20000 });
    expect(m.units["speech-2"]).toEqual({ completedAt: 5 });
    expect(m.placement?.startUnit).toBe("speech-1");
  });
});

describe("pruneHistory", () => {
  it("keeps only the trailing N days", () => {
    const p = defaultProgress();
    for (let i = 0; i < 500; i++)
      p.history[
        `2020-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}x${i}`
      ] = { ok: 1, bad: 0, xp: 1 };
    expect(Object.keys(pruneHistory(p, 400).history)).toHaveLength(400);
  });
});

describe("normalize (rewards fields)", () => {
  it("fills reward defaults for a legacy blob", () => {
    const p = normalize({ v: 2, xp: 10, roots: {}, history: {}, settings: {}, updatedAt: 3 });
    expect(p.gems).toBe(0);
    expect(p.seals).toEqual({});
    expect(p.bestCombo).toBe(0);
    expect(p.perfectLessons).toBe(0);
    expect(p.typedOk).toBe(0);
    expect(p.sectionChests).toEqual({});
  });
  it("infers onboardedAt for legacy blobs: seen root → non-null, empty → null", () => {
    const seen = normalize({
      v: 2,
      roots: { כתב: { ...newRootState(), ok: 1 } },
      updatedAt: 77,
    });
    expect(seen.onboardedAt).toBe(77);
    const seenNoStamp = normalize({ v: 2, roots: { כתב: { ...newRootState(), bad: 1 } } });
    expect(seenNoStamp.onboardedAt).toBe(1);
    expect(normalize({ v: 2, lastUnit: "speech-1", updatedAt: 9 }).onboardedAt).toBe(9);
    expect(
      normalize({ v: 3, placement: { at: 1, startUnit: "speech-2", score: 50 }, updatedAt: 4 })
        .onboardedAt,
    ).toBe(4);
    expect(normalize({ v: 2, roots: { כתב: newRootState() } }).onboardedAt).toBeNull();
    expect(normalize(defaultProgress()).onboardedAt).toBeNull();
    expect(normalize({ ...defaultProgress(), onboardedAt: 123 }).onboardedAt).toBe(123);
  });
  it("drops unknown or non-numeric seals", () => {
    const p = normalize({
      ...defaultProgress(),
      seals: { "xp-500": 5, ghost: 6, "combo-5": "soon", "streak-3": null },
    });
    expect(p.seals).toEqual({ "xp-500": 5 });
  });
  it("drops unknown sections in sectionChests", () => {
    const p = normalize({
      ...defaultProgress(),
      sectionChests: { speech: 10, ghost: 11, movement: "x" },
    });
    expect(p.sectionChests).toEqual({ speech: 10 });
  });
  it("coerces negative, float and garbage counters", () => {
    const p = normalize({
      ...defaultProgress(),
      gems: -5,
      bestCombo: 3.7,
      perfectLessons: "2",
      typedOk: NaN,
    });
    expect(p.gems).toBe(0);
    expect(p.bestCombo).toBe(3);
    expect(p.perfectLessons).toBe(0);
    expect(p.typedOk).toBe(0);
    expect(normalize({ ...defaultProgress(), gems: 12.9 }).gems).toBe(12);
  });
  it("preserves chestAt on unit records", () => {
    const p = normalize({
      ...defaultProgress(),
      units: { "speech-1": { completedAt: 1, chestAt: 2 } },
    });
    expect(p.units["speech-1"]).toEqual({ completedAt: 1, chestAt: 2 });
  });
});

describe("mergeUnit chestAt", () => {
  it("keeps the earliest chest payout", () => {
    expect(mergeUnit({ chestAt: 30 }, { chestAt: 20 })).toEqual({ chestAt: 20 });
    expect(mergeUnit({ chestAt: 30 }, {})).toEqual({ chestAt: 30 });
    expect(mergeUnit({}, {})).toEqual({});
  });
});

describe("mergeProgress (rewards fields)", () => {
  it("takes max gems (not the sum) and max counters", () => {
    const a = { ...defaultProgress(), gems: 120, bestCombo: 4, perfectLessons: 1, typedOk: 9 };
    const b = { ...defaultProgress(), gems: 80, bestCombo: 7, perfectLessons: 3, typedOk: 2 };
    const m = mergeProgress(a, b);
    expect(m.gems).toBe(120);
    expect(m.bestCombo).toBe(7);
    expect(m.perfectLessons).toBe(3);
    expect(m.typedOk).toBe(9);
  });
  it("unions seals and sectionChests keeping the earliest timestamp", () => {
    const a = {
      ...defaultProgress(),
      seals: { "xp-500": 50, "first-root": 5 },
      sectionChests: { speech: 100, movement: 300 },
    };
    const b = {
      ...defaultProgress(),
      seals: { "xp-500": 40, "combo-5": 60 },
      sectionChests: { speech: 200, time: 150 },
    };
    const m = mergeProgress(a, b);
    expect(m.seals).toEqual({ "xp-500": 40, "first-root": 5, "combo-5": 60 });
    expect(m.sectionChests).toEqual({ speech: 100, movement: 300, time: 150 });
  });
  it("keeps the earliest onboardedAt; null only when both are null", () => {
    const a = { ...defaultProgress(), onboardedAt: 20 };
    const b = { ...defaultProgress(), onboardedAt: 10 };
    expect(mergeProgress(a, b).onboardedAt).toBe(10);
    expect(mergeProgress(a, defaultProgress()).onboardedAt).toBe(20);
    expect(mergeProgress(defaultProgress(), b).onboardedAt).toBe(10);
    expect(mergeProgress(defaultProgress(), defaultProgress()).onboardedAt).toBeNull();
  });
});
