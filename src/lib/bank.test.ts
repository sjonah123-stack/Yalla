import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { bankRoots, matchesSearch } from "./bank";
import type { RootState } from "../types";

const NOW = Date.UTC(2026, 9, 14, 12);
const DAY = 86_400_000;
const st = (o: Partial<RootState>): RootState => ({
  ease: 2.5,
  ivl: 1,
  due: NOW + DAY,
  reps: 1,
  lapses: 0,
  ok: 1,
  bad: 0,
  ...o,
});

describe("bank filtering", () => {
  it("searches letters, meanings, words, glosses and transliterations", () => {
    const ktv = ROOTS.find((r) => r.r === "כתב")!;
    expect(matchesSearch(ktv, "כתב")).toBe(true);
    expect(matchesSearch(ktv, "  WRITE ")).toBe(true);
    expect(matchesSearch(ktv, "michtav")).toBe(true);
    expect(matchesSearch(ktv, "zzzz")).toBe(false);
    expect(matchesSearch(ktv, "")).toBe(true);
  });
  it("applies the chip to each root's state", () => {
    const p = {
      roots: {
        כתב: st({ due: NOW - 1 }),
        אמר: st({ ivl: 7, due: NOW + 7 * DAY }),
      },
      flags: { דבר: { at: 1, why: "gloss" as const } },
    };
    expect(bankRoots(ROOTS, "", "due", p, NOW).map((r) => r.r)).toEqual(["כתב"]);
    expect(bankRoots(ROOTS, "", "memorized", p, NOW).map((r) => r.r)).toEqual(["אמר"]);
    expect(bankRoots(ROOTS, "", "flagged", p, NOW).map((r) => r.r)).toEqual(["דבר"]);
    expect(bankRoots(ROOTS, "", "unmet", p, NOW).length).toBe(ROOTS.length - 2);
    expect(bankRoots(ROOTS, "", "all", p, NOW).length).toBe(ROOTS.length);
    expect(bankRoots(ROOTS, "say", "memorized", p, NOW).map((r) => r.r)).toEqual(["אמר"]);
  });
});
