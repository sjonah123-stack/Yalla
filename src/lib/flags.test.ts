import { describe, expect, it } from "vitest";
import { activeFlags, flagsToText, isActiveFlag } from "./flags";
import { ROOTS } from "../data/roots";
import { defaultProgress } from "./storage";

describe("flags", () => {
  it("a cleared flag is not active; a re-flag after a clear is", () => {
    expect(isActiveFlag(undefined)).toBe(false);
    expect(isActiveFlag({ at: 5, why: "gloss" })).toBe(true);
    expect(isActiveFlag({ at: 5, why: "gloss", cleared: 6 })).toBe(false);
    expect(isActiveFlag({ at: 7, why: "gloss", cleared: 6 })).toBe(true);
  });
  it("lists active flags newest first and renders a grouped text block", () => {
    const p = defaultProgress();
    const [a, b] = ROOTS;
    p.flags[a.r] = { at: 1_700_000_000_000, why: "nikud", note: "dagesh?" };
    p.flags[b.r] = { at: 1_700_000_100_000, why: "gloss" };
    p.flags["zzz"] = { at: 1, why: "other", cleared: 2 };
    expect(activeFlags(p).map(([id]) => id)).toEqual([b.r, a.r]);
    const text = flagsToText(p, ROOTS);
    expect(text).toContain(`(${a.short}) · ${a.unit} · nikud · "dagesh?"`);
    expect(text).toContain(`(${b.short}) · ${b.unit} · gloss`);
    expect(text).not.toContain("zzz");
    expect(text.startsWith("## ")).toBe(true);
  });
});
