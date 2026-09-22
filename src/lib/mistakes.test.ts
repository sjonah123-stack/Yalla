import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import type { Mistake, Progress } from "../types";
import { DAY, newRootState } from "./srs";
import { MISTAKES_MAX, defaultProgress, mergeProgress, normalize } from "./storage";
import { addMistake, confusions, mistakeRoots } from "./mistakes";

const now = 1_700_000_000_000;
const [A, B, C] = ROOTS;
const miss = (root: string, at: number, pickedRoot?: string): Mistake => ({
  at,
  root,
  mode: "meaningRoot",
  picked: "x",
  ...(pickedRoot ? { pickedRoot } : {}),
});

describe("mistake notebook", () => {
  it("keeps the newest MISTAKES_MAX", () => {
    let l: Mistake[] = [];
    for (let i = 0; i < MISTAKES_MAX + 5; i++) l = addMistake(l, miss(A.r, i));
    expect(l).toHaveLength(MISTAKES_MAX);
    expect(l[0].at).toBe(5);
  });
  it("lists recent, unproven roots most-missed first", () => {
    const p: Pick<Progress, "mistakes" | "roots"> = {
      mistakes: [
        miss(A.r, now - DAY),
        miss(B.r, now - 2 * DAY),
        miss(B.r, now - DAY),
        miss(C.r, now - 40 * DAY),
      ],
      roots: {},
    };
    expect(mistakeRoots(ROOTS, p, now).map((m) => m.root.r)).toEqual([B.r, A.r]);
    const proven = { ...p, roots: { [B.r]: { ...newRootState(), reps: 3, ivl: 7 } } };
    expect(mistakeRoots(ROOTS, proven, now).map((m) => m.root.r)).toEqual([A.r]);
  });
  it("pairs confusions in either direction", () => {
    const p = { mistakes: [miss(A.r, 1, B.r), miss(B.r, 2, A.r), miss(A.r, 3, C.r), miss(A.r, 4)] };
    const c = confusions(ROOTS, p);
    expect(c[0].count).toBe(2);
    expect(new Set([c[0].a.r, c[0].b.r])).toEqual(new Set([A.r, B.r]));
    expect(c).toHaveLength(2);
  });
  it("merges as a union and survives normalize", () => {
    const a = { ...defaultProgress(), mistakes: [miss(A.r, 1), miss(B.r, 3)] };
    const b = { ...defaultProgress(), mistakes: [miss(A.r, 1), miss(C.r, 2)] };
    const m = mergeProgress(a, b);
    expect(m.mistakes.map((x) => x.at)).toEqual([1, 2, 3]);
    expect(normalize(JSON.parse(JSON.stringify(m))).mistakes).toEqual(m.mistakes);
    expect(normalize({ mistakes: [{ at: 1, root: "x", mode: "bogus" }] }).mistakes).toEqual([]);
  });
});
