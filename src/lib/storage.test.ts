import { describe, expect, it } from "vitest";
import { defaultProgress, mergeProgress, normalize, pruneHistory } from "./storage";
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
    expect(p.v).toBe(2);
    expect(p.xp).toBe(420);
    expect(p.roots["כתב"].reps).toBe(2);
    expect(p.settings.nikud).toBe(false);
    expect(p.settings.cats).toEqual(["time"]);
    expect(p.settings.audio).toBe(true);
    expect(p.settings.theme).toBe("system");
  });
  it("tolerates garbage", () => {
    expect(normalize(null).xp).toBe(0);
    expect(normalize("x").settings.sessionLen).toBe(20);
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
    b.history["2026-01-01"] = { ok: 3, bad: 2, xp: 30 };
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
    expect(m.history["2026-01-01"]).toEqual({ ok: 5, bad: 2, xp: 50 });
    expect(m.history["2026-01-02"].xp).toBe(10);
    expect(m.streak).toBe(3);
    expect(m.settings.nikud).toBe(false);
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
