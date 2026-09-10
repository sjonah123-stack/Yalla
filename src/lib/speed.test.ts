import { describe, expect, it } from "vitest";
import { buildSpeedQueue, speedBestEver, speedBestToday, SPEED_LEN } from "./speed";
import { ROOTS } from "../data/roots";
import { defaultProgress } from "./storage";
import { applyAnswer } from "./srs";

const now = Date.now();
const seenP = (n: number) => {
  const p = defaultProgress();
  for (const r of ROOTS.slice(0, n)) p.roots[r.r] = applyAnswer(undefined, true, true, now);
  return p;
};

describe("buildSpeedQueue", () => {
  it("is empty when nothing has been seen", () => {
    expect(buildSpeedQueue(ROOTS, defaultProgress(), SPEED_LEN, now)).toEqual([]);
  });
  it("fills to len with seen roots only and no adjacent repeat", () => {
    const p = seenP(6);
    for (let k = 0; k < 10; k++) {
      const q = buildSpeedQueue(ROOTS, p, SPEED_LEN, now);
      expect(q).toHaveLength(SPEED_LEN);
      expect(q.every((r) => ROOTS.slice(0, 6).includes(r))).toBe(true);
      for (let i = 1; i < q.length; i++) expect(q[i]).not.toBe(q[i - 1]);
    }
  });
  it("a single seen root repeats (nothing else to show)", () => {
    expect(buildSpeedQueue(ROOTS, seenP(1), 5, now)).toHaveLength(5);
  });
});

describe("speed bests", () => {
  it("reads today's and the all-time best", () => {
    const h = {
      "2026-01-01": { ok: 1, bad: 0, xp: 1, speedBest: 12 },
      "2026-01-02": { ok: 1, bad: 0, xp: 1 },
    };
    expect(speedBestToday(h, "2026-01-01")).toBe(12);
    expect(speedBestToday(h, "2026-01-02")).toBe(0);
    expect(speedBestEver(h)).toBe(12);
    expect(speedBestEver({})).toBe(0);
  });
});
