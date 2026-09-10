import { describe, expect, it } from "vitest";
import {
  applyAnswer,
  buildQueue,
  crossings,
  dayKey,
  isTricky,
  mastery,
  newRootState,
  touchStreak,
  trickyQueue,
  trickyRoots,
  DAY,
} from "./srs";
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
  it("progresses 1 → 3 → ivl*ease on first-attempt corrects, one step per due day", () => {
    let s = applyAnswer(undefined, true, true, now);
    expect(s.ivl).toBe(1);
    expect(s.due).toBe(now + DAY);
    s = applyAnswer(s, true, true, s.due);
    expect(s.ivl).toBe(3);
    s = applyAnswer(s, true, true, s.due);
    expect(s.ivl).toBe(Math.round(3 * 2.6)); // ease 2.5 + 0.05*2
  });
  it("a second right answer in the same sitting does not advance the root", () => {
    let s = applyAnswer(undefined, true, true, now);
    const again = applyAnswer(s, true, true, now + 1000); // first try in a later session, same day
    expect(again.reps).toBe(1);
    expect(again.ivl).toBe(1);
    expect(again.due).toBe(s.due);
    expect(again.ok).toBe(2);
    expect(mastery(again)).toBe(1); // not memorized
    s = applyAnswer(again, true, true, s.due); // the next day it is
    expect(mastery(s)).toBe(2);
  });
  it("a same-session drill never demotes a mature root", () => {
    const mature = { ...newRootState(), reps: 5, ivl: 20, due: now + 20 * DAY, ok: 5 };
    const d = applyAnswer(mature, true, false, now);
    expect([d.reps, d.ivl, d.due, d.ok]).toEqual([5, 20, mature.due, 6]);
  });
  it("clamps ease to [1.3, 3]", () => {
    let s = newRootState();
    for (let i = 0; i < 20; i++) s = applyAnswer(s, true, true, Math.max(now, s.due));
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

describe("tricky", () => {
  const miss = (s?: ReturnType<typeof newRootState>) => applyAnswer(s, false, true, now);
  const twice = () => miss(miss(applyAnswer(undefined, true, true, now)));
  it("two misses make a root tricky, one does not", () => {
    expect(isTricky(miss(applyAnswer(undefined, true, true, now)))).toBe(false);
    expect(isTricky(twice())).toBe(true);
  });
  it("clears once the root climbs back to mastery 3, not at memorized", () => {
    let s = twice();
    s = applyAnswer(s, true, false, now); // relearn: ivl 1
    expect(isTricky(s)).toBe(true);
    s = applyAnswer(s, true, true, s.due); // ivl 3 = memorized
    expect(mastery(s)).toBe(2);
    expect(isTricky(s)).toBe(true);
    // Lower ease after the misses means one or two more due days before interval ≥ 7.
    let days = 0;
    while (mastery(s) < 3 && days < 4) {
      s = applyAnswer(s, true, true, s.due);
      days++;
    }
    expect(mastery(s)).toBeGreaterThanOrEqual(3);
    expect(days).toBeLessThanOrEqual(2);
    expect(isTricky(s)).toBe(false);
  });
  it("unseen and placement-prescheduled roots are never tricky", () => {
    expect(isTricky(undefined)).toBe(false);
    expect(isTricky({ ...newRootState(), reps: 2, ivl: 7, due: now + 7 * DAY })).toBe(false);
  });
  it("trickyRoots lists only tricky roots, most lapses first", () => {
    const [a, b, c] = ROOTS;
    const p = { roots: { [a.r]: twice(), [b.r]: miss(twice()), [c.r]: miss(undefined) } };
    expect(trickyRoots(ROOTS, p).map((r) => r.r)).toEqual([b.r, a.r]);
  });
  it("trickyQueue drills a short set twice with no adjacent repeat and caps a long one", () => {
    const short = { roots: Object.fromEntries(ROOTS.slice(0, 3).map((r) => [r.r, twice()])) };
    for (let i = 0; i < 20; i++) {
      const q = trickyQueue(ROOTS, short, 10);
      expect(q).toHaveLength(6);
      for (let k = 1; k < q.length; k++) expect(q[k]).not.toBe(q[k - 1]);
      expect(new Set(q).size).toBe(3);
    }
    const long = { roots: Object.fromEntries(ROOTS.slice(0, 12).map((r) => [r.r, twice()])) };
    const q = trickyQueue(ROOTS, long, 10);
    expect(q).toHaveLength(10);
    expect(new Set(q).size).toBe(10);
    expect(trickyQueue(ROOTS, { roots: {} }, 10)).toEqual([]);
  });
});

describe("crossings", () => {
  it("reports the new level when xp crosses a boundary, else null", () => {
    expect(crossings({ xp: 99, todayXp: 0 }, { xp: 100, todayXp: 1 }, 50).level).toBe(2);
    expect(crossings({ xp: 0, todayXp: 0 }, { xp: 50, todayXp: 50 }, 50).level).toBeNull();
  });
  it("jumping two levels reports the top one", () => {
    expect(crossings({ xp: 0, todayXp: 0 }, { xp: 400, todayXp: 0 }, 50).level).toBe(3);
  });
  it("reports the daily goal only on the session that crosses it", () => {
    expect(crossings({ xp: 0, todayXp: 30 }, { xp: 0, todayXp: 60 }, 50).goal).toBe(true);
    expect(crossings({ xp: 0, todayXp: 60 }, { xp: 0, todayXp: 90 }, 50).goal).toBe(false);
    expect(crossings({ xp: 0, todayXp: 0 }, { xp: 0, todayXp: 50 }, 50).goal).toBe(true);
  });
  it("a session that straddles midnight never reports the goal", () => {
    expect(crossings({ xp: 0, todayXp: 40 }, { xp: 0, todayXp: 10 }, 50).goal).toBe(false);
  });
});
