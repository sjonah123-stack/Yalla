import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import type { RootState } from "../types";
import { DAY, newRootState } from "./srs";
import { defaultShuk, mergeShuk } from "./storage";
import {
  BASE_RATE,
  HOUR,
  MIN_SALE,
  buyPerk,
  collect,
  cumulativeCost,
  fmtShekels,
  incomeRate,
  levelMult,
  pending,
  sales,
  shekels,
  stalls,
  startRush,
  storageFull,
  tierOf,
  till,
  upgradeCost,
  upgradeStall,
} from "./shuk";

const now = 1_700_000_000_000;
const fresh = (): RootState => ({ ...newRootState(), reps: 2, ivl: 3, due: now + 3 * DAY, ok: 2 });
const wilted = (): RootState => ({ ...fresh(), due: now - 1 });

describe("stalls", () => {
  const speech = ROOTS.filter((r) => r.cat === "speech");
  it("fresh roots stock and earn; due roots wilt; unseen roots don't open a stall", () => {
    const p = {
      roots: { [speech[0].r]: fresh(), [speech[1].r]: fresh(), [speech[2].r]: wilted() },
      shuk: defaultShuk(),
    };
    const all = stalls(ROOTS, p, now);
    const s = all.find((x) => x.id === "speech")!;
    expect(s).toMatchObject({ open: true, stock: 3, fresh: 2, wilted: 1, rate: 2 * BASE_RATE });
    expect(all.find((x) => x.id === "sport")!.open).toBe(false);
    expect(incomeRate(all)).toBe(2 * BASE_RATE);
  });
  it("levels multiply income and landmarks double it", () => {
    expect(levelMult(0)).toBe(1);
    expect(levelMult(4)).toBe(2);
    expect(levelMult(10)).toBe((1 + 2.5) * 2);
    expect(levelMult(25)).toBeCloseTo((1 + 6.25) * 4);
  });
});

describe("accrual", () => {
  const speech = ROOTS.filter((r) => r.cat === "speech");
  // Reviewed 1 day ago with a 3-day interval: fresh for the next two days.
  const freshSince = (reviewedAgo: number, ivl = 3): RootState => ({
    ...newRootState(),
    reps: 2,
    ivl,
    due: now - reviewedAgo + ivl * DAY,
    ok: 2,
  });
  const shop = (
    roots: Record<string, RootState>,
    over: Partial<ReturnType<typeof defaultShuk>> = {},
  ) => ({
    roots,
    shuk: { ...defaultShuk(), lastCollect: now - 2 * HOUR, ...over },
  });
  const one = { [speech[0].r]: freshSince(DAY) };

  it("each fresh root pays BASE_RATE per hour since the last collection", () => {
    expect(pending(ROOTS, shop(one), now)).toBe(2 * BASE_RATE);
    const two = { ...one, [speech[1].r]: freshSince(DAY) };
    expect(pending(ROOTS, shop(two), now)).toBe(4 * BASE_RATE);
  });
  it("caps at the storage window (4h, then the perk)", () => {
    const old = shop(one, { lastCollect: now - 30 * HOUR });
    expect(pending(ROOTS, old, now)).toBe(4 * BASE_RATE);
    expect(storageFull(old.shuk, now)).toBe(true);
    expect(
      pending(ROOTS, shop(one, { lastCollect: now - 30 * HOUR, perks: { storage: 3 } }), now),
    ).toBe(24 * BASE_RATE);
  });
  it("a root that wilted mid-window keeps what it earned before it came due", () => {
    const wiltedHourAgo = { [speech[0].r]: { ...freshSince(3 * DAY + HOUR) } };
    expect(pending(ROOTS, shop(wiltedHourAgo), now)).toBe(BASE_RATE);
  });
  it("a root reviewed mid-window is not paid backwards in time", () => {
    const justNow = { [speech[0].r]: freshSince(HOUR / 2) };
    expect(pending(ROOTS, shop(justNow), now)).toBe(BASE_RATE / 2);
  });
  it("stall levels multiply a root's income", () => {
    expect(pending(ROOTS, shop(one, { levels: { speech: 4 } }), now)).toBe(4 * BASE_RATE);
  });
  it("a never-opened Shuk has nothing pending, and collecting starts the clock", () => {
    const p = { roots: one, shuk: defaultShuk() };
    expect(pending(ROOTS, p, now)).toBe(0);
    const c = collect(ROOTS, p, now);
    expect(c.got).toBe(0);
    expect(c.s.lastCollect).toBe(now);
  });
  it("rush hour multiplies only the overlapping part", () => {
    const rushed = shop(one, { rush: { from: now - HOUR, until: now + HOUR, mult: 3 } });
    expect(pending(ROOTS, rushed, now)).toBe(2 * BASE_RATE + 2 * BASE_RATE);
    expect(till(ROOTS, rushed, now)).toBeCloseTo(4 * BASE_RATE);
  });
  it("collecting banks the income", () => {
    const c = collect(ROOTS, shop(one), now);
    expect(c.got).toBe(2 * BASE_RATE);
    expect(c.s.earned).toBe(2 * BASE_RATE);
    expect(pending(ROOTS, { roots: one, shuk: c.s }, now)).toBe(0);
  });
});

describe("spending", () => {
  it("costs grow ×1.15 and balance is earned minus everything bought", () => {
    expect(upgradeCost(0)).toBe(40);
    expect(upgradeCost(1)).toBe(46);
    expect(cumulativeCost(2)).toBe(86);
    const s = { ...defaultShuk(), earned: 100 };
    const a = upgradeStall(s, "speech")!;
    expect(shekels(a)).toBe(60);
    const b = upgradeStall(a, "speech")!;
    expect(shekels(b)).toBe(14);
    expect(upgradeStall(b, "speech")).toBeNull();
    expect(buyPerk({ ...defaultShuk(), earned: 599 }, "storage")).toBeNull();
    expect(shekels(buyPerk({ ...defaultShuk(), earned: 600 }, "storage")!)).toBe(0);
  });
  it("merging two devices' upgrades keeps both and clamps the balance at zero", () => {
    const s = { ...defaultShuk(), earned: 50 };
    const a = upgradeStall(s, "speech")!;
    const b = upgradeStall(s, "food")!;
    const m = mergeShuk(a, b);
    expect(m.levels).toEqual({ speech: 1, food: 1 });
    expect(shekels(m)).toBe(0);
  });
});

describe("rush and sales", () => {
  it("a stronger rush replaces, the same extends, a weaker one is ignored", () => {
    let s = startRush(defaultShuk(), 2, 30, now);
    expect(s.rush).toEqual({ from: now, until: now + 30 * 60_000, mult: 2 });
    s = startRush(s, 2, 30, now + 10 * 60_000);
    expect(s.rush!.until).toBe(now + 40 * 60_000);
    expect(s.rush!.from).toBe(now);
    const weaker = startRush(
      { ...s, rush: { from: now, until: now + 3 * HOUR, mult: 3 } },
      2,
      30,
      now,
    );
    expect(weaker.rush!.mult).toBe(3);
    const stronger = startRush(s, 3, 30, now + 1000);
    expect(stronger.rush).toEqual({ from: now + 1000, until: now + 1000 + 30 * 60_000, mult: 3 });
  });
  it("each right answer sells for about a minute of income, never below the floor", () => {
    expect(sales(defaultShuk(), 60, 10)).toBe(10 * MIN_SALE);
    expect(sales(defaultShuk(), 600, 10)).toBe(100);
    expect(sales({ ...defaultShuk(), perks: { haggle: 1 } }, 600, 10)).toBe(150);
    expect(sales(defaultShuk(), 0, 10)).toBe(0);
  });
});

describe("tiers and formatting", () => {
  it("tiers by lifetime earnings", () => {
    expect(tierOf(0)).toBe(0);
    expect(tierOf(999)).toBe(0);
    expect(tierOf(1000)).toBe(1);
    expect(tierOf(2_000_000)).toBe(4);
  });
  it("formats compactly", () => {
    expect(fmtShekels(950)).toBe("₪950");
    expect(fmtShekels(12_400)).toBe("₪12.4k");
    expect(fmtShekels(3_100_000)).toBe("₪3.1M");
  });
});
