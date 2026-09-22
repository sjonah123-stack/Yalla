import { describe, expect, it } from "vitest";
import { defaultProgress, mergeProgress } from "./storage";
import type { Progress } from "../types";
import { touchStreak } from "./srs";
import {
  FREEZE_COST,
  addPurchase,
  applyFreezes,
  cantBuy,
  flameSize,
  freezesOwned,
  gemBalance,
  repairOffer,
  repairStreak,
  streakAtRisk,
  visibleStreak,
} from "./shop";

const d = (day: number) => new Date(2026, 8, day, 12); // Sept 2026
const withFreezes = (p: Progress, n: number): Progress => {
  for (let i = 0; i < n; i++) p = addPurchase(p, "freeze", FREEZE_COST, i + 1, `f${i}`);
  return p;
};

describe("gem ledger", () => {
  it("balance is lifetime gems minus purchases; merge never un-spends", () => {
    const p = { ...defaultProgress(), gems: 200 };
    const a = addPurchase(p, "bag", 60, 1, "a");
    const b = addPurchase(p, "rush", 40, 2, "b");
    expect(gemBalance(a)).toBe(140);
    expect(gemBalance(mergeProgress(a, b))).toBe(100);
  });
  it("freezes cap at two; accents buy once; gems must cover the cost", () => {
    const p = withFreezes({ ...defaultProgress(), gems: 500 }, 2);
    expect(freezesOwned(p)).toBe(2);
    expect(cantBuy(p, "freeze", FREEZE_COST)).toBe("max");
    const q = addPurchase(p, "accent:jaffa", 150, 3, "j");
    expect(cantBuy(q, "accent:jaffa", 150)).toBe("owned");
    expect(cantBuy({ ...defaultProgress(), gems: 10 }, "bag", 60)).toBe("gems");
  });
});

describe("streak freezes", () => {
  const played = (last: number, streak = 5): Progress => ({
    ...defaultProgress(),
    gems: 500,
    streak,
    lastPlay: `2026-09-${String(last).padStart(2, "0")}`,
  });

  it("covers a missed day with an owned freeze, keeping the streak alive", () => {
    const p = applyFreezes(withFreezes(played(10), 1), d(12));
    expect(p.frozenDays).toEqual({ "2026-09-11": "freeze" });
    expect(freezesOwned(p)).toBe(0);
    expect(visibleStreak(p, d(12))).toBe(5);
    expect(touchStreak(p.streak, p.lastPlay, d(12), p.frozenDays).streak).toBe(6);
  });
  it("uses nothing when the gap is bigger than the freezes held", () => {
    const p = withFreezes(played(10), 1);
    expect(applyFreezes(p, d(13))).toBe(p);
    expect(visibleStreak(p, d(13))).toBe(0);
  });
  it("uses nothing when yesterday was played", () => {
    const p = withFreezes(played(11), 2);
    expect(applyFreezes(p, d(12))).toBe(p);
    expect(streakAtRisk(p, d(12))).toBe(true);
  });
  it("crosses a DST change and a month boundary by calendar day", () => {
    const p = withFreezes({ ...played(1), lastPlay: "2026-10-24" }, 2);
    const q = applyFreezes(p, new Date(2026, 9, 27, 12)); // Europe/US DST shifts late Oct
    expect(Object.keys(q.frozenDays).sort()).toEqual(["2026-10-25", "2026-10-26"]);
  });
});

describe("streak repair", () => {
  const broken = { ...defaultProgress(), gems: 500, streak: 12, lastPlay: "2026-09-09" };
  it("offers a repair for up to two missed days and restores the streak", () => {
    const offer = repairOffer(broken, d(12));
    expect(offer).toMatchObject({ streak: 12, days: ["2026-09-10", "2026-09-11"], cost: 120 });
    const p = repairStreak(broken, 1, d(12))!;
    expect(visibleStreak(p, d(12))).toBe(12);
    expect(gemBalance(p)).toBe(380);
    expect(freezesOwned(p)).toBe(0);
    expect(repairOffer(p, d(12))).toBeNull();
  });
  it("no offer after three missed days, for a 1-day streak, or without the gems", () => {
    expect(repairOffer(broken, d(13))).toBeNull();
    expect(repairOffer({ ...broken, streak: 1 }, d(12))).toBeNull();
    expect(repairStreak({ ...broken, gems: 50 }, 1, d(12))).toBeNull();
  });
  it("merge prefers a repair over a freeze for the same day", () => {
    const a = { ...defaultProgress(), frozenDays: { "2026-09-10": "freeze" as const } };
    const b = { ...defaultProgress(), frozenDays: { "2026-09-10": "repair" as const } };
    expect(mergeProgress(a, b).frozenDays["2026-09-10"]).toBe("repair");
    expect(mergeProgress(b, a).frozenDays["2026-09-10"]).toBe("repair");
  });
});

describe("flame", () => {
  it("grows at 7, 30 and 100", () => {
    expect([0, 1, 6, 7, 29, 30, 100].map(flameSize)).toEqual([0, 1, 1, 2, 2, 3, 4]);
  });
});
