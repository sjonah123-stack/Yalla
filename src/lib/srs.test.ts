import { describe, expect, it } from "vitest";
import { applyAnswer, buildQueue, dayKey, mastery, newRootState, touchStreak, DAY } from "./srs";
import { ROOTS } from "../data/roots";
import { defaultProgress } from "./storage";

const now = Date.UTC(2026, 0, 15, 12);

describe("dayKey", () => {
  it("uses the local calendar day, not UTC", () => {
    const d = new Date(2026, 0, 15, 23, 30); // local 23:30
    expect(dayKey(d)).toBe("2026-01-15");
    const e = new Date(2026, 0, 16, 0, 10);
    expect(dayKey(e)).toBe("2026-01-16");
  });
});

describe("applyAnswer", () => {
  it("progresses 1 → 3 → ivl*ease on first-attempt corrects", () => {
    let s = applyAnswer(undefined, true, true, now);
    expect(s.ivl).toBe(1);
    expect(s.due).toBe(now + DAY);
    s = applyAnswer(s, true, true, now);
    expect(s.ivl).toBe(3);
    s = applyAnswer(s, true, true, now);
    expect(s.ivl).toBe(Math.round(3 * 2.6)); // ease 2.5 + 0.05*2
  });
  it("clamps ease to [1.3, 3]", () => {
    let s = newRootState();
    for (let i = 0; i < 20; i++) s = applyAnswer(s, true, true, now);
    expect(s.ease).toBe(3);
    for (let i = 0; i < 20; i++) s = applyAnswer(s, false, true, now);
    expect(s.ease).toBeCloseTo(1.3);
  });
  it("resets on a miss and gives partial credit on retry", () => {
    let s = applyAnswer(undefined, true, true, now);
    s = applyAnswer(s, true, true, now);
    s = applyAnswer(s, false, true, now);
    expect(s.reps).toBe(0);
    expect(s.ivl).toBe(0);
    expect(s.due).toBe(now);
    s = applyAnswer(s, true, false, now);
    expect(s.reps).toBe(1);
    expect(s.ivl).toBe(1);
  });
  it("does not mutate its input", () => {
    const a = newRootState();
    applyAnswer(a, true, true, now);
    expect(a.ok).toBe(0);
  });
});

describe("mastery", () => {
  it("buckets by interval", () => {
    const st = (ivl: number) => ({ ...newRootState(), reps: 1, ivl });
    expect(mastery(undefined)).toBe(0);
    expect(mastery(st(1))).toBe(1);
    expect(mastery(st(3))).toBe(2);
    expect(mastery(st(7))).toBe(3);
    expect(mastery(st(15))).toBe(4);
    expect(mastery(st(30))).toBe(5);
  });
});

describe("touchStreak", () => {
  it("increments on consecutive days and resets after a gap", () => {
    const d = new Date(2026, 2, 10);
    let s = touchStreak(0, null, d);
    expect(s.streak).toBe(1);
    s = touchStreak(s.streak, s.lastPlay, d); // same day: no change
    expect(s.streak).toBe(1);
    s = touchStreak(s.streak, s.lastPlay, new Date(2026, 2, 11));
    expect(s.streak).toBe(2);
    s = touchStreak(s.streak, s.lastPlay, new Date(2026, 2, 14));
    expect(s.streak).toBe(1);
  });
});

describe("buildQueue", () => {
  it("puts due roots first and caps new roots", () => {
    const p = defaultProgress();
    const dueIds = ROOTS.slice(0, 3).map((r) => r.r);
    for (const id of dueIds)
      p.roots[id] = { ...newRootState(), reps: 2, ivl: 3, due: now - DAY, ok: 2 };
    for (const r of ROOTS.slice(3, 20))
      p.roots[r.r] = { ...newRootState(), reps: 3, ivl: 7, due: now + 5 * DAY, ok: 3 };
    const q = buildQueue(ROOTS, p, 10, 4, now);
    expect(q).toHaveLength(10);
    for (const id of dueIds) expect(q.some((r) => r.r === id)).toBe(true);
    const fresh = q.filter((r) => !p.roots[r.r]);
    expect(fresh.length).toBeLessThanOrEqual(4);
  });
  it("falls back to unseen roots for a brand-new learner", () => {
    const p = defaultProgress();
    expect(buildQueue(ROOTS, p, 10, 4, now)).toHaveLength(10);
  });
  it("respects the theme filter", () => {
    const p = defaultProgress();
    p.settings.cats = ["time"];
    const q = buildQueue(ROOTS, p, 20, 0, now);
    expect(q.every((r) => r.cat === "time")).toBe(true);
  });
});
