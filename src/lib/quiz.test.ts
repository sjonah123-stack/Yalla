import { describe, expect, it } from "vitest";
import { makeQuestion, modeFor, similarRoots, xpFor, verbForms } from "./quiz";
import { rootLetters } from "./hebrew";
import { ROOTS } from "../data/roots";

const byId = (id: string) => ROOTS.find((r) => r.r === id)!;

describe("similarRoots", () => {
  it("never returns the root or a same-letter homograph, and returns n", () => {
    const r = byId("שכר2");
    const out = similarRoots(r, ROOTS, 3);
    expect(out).toHaveLength(3);
    expect(out).not.toContain(r);
    expect(out.every((x) => rootLetters(x) !== "שכר")).toBe(true);
  });
  it("prefers roots sharing consonants", () => {
    const r = byId("כתב");
    const out = similarRoots(r, ROOTS, 3);
    expect(out.every((x) => [..."כתב"].some((c) => rootLetters(x).includes(c)))).toBe(true);
  });
});

describe("modeFor", () => {
  it("only offers recognition at mastery 0", () => {
    for (let i = 0; i < 30; i++)
      expect(["rootMeaning", "meaningRoot"]).toContain(modeFor(byId("כתב"), 0, { audio: true }));
  });
  it("never offers hearWord without audio, and never whichBinyan with <2 binyanim", () => {
    const r = ROOTS.find((x) => new Set(verbForms(x).map((w) => w.b)).size < 2)!;
    for (let i = 0; i < 50; i++) {
      const m = modeFor(r, 5, { audio: false });
      expect(m).not.toBe("hearWord");
      expect(m).not.toBe("whichBinyan");
    }
  });
});

describe("makeQuestion", () => {
  it("builds 4 options with exactly one correct for choice modes", () => {
    for (const mode of ["rootMeaning", "meaningRoot", "wordRoot", "oddOne", "hearWord"] as const) {
      const q = makeQuestion(byId("דבר"), ROOTS, mode);
      expect(q.opts).toHaveLength(4);
      expect(q.opts!.filter((o) => o.ok)).toHaveLength(1);
    }
  });
  it("whichBinyan options are distinct binyanim including the answer", () => {
    const r = ROOTS.find((x) => new Set(verbForms(x).map((w) => w.b)).size >= 2)!;
    const q = makeQuestion(r, ROOTS, "whichBinyan");
    expect(new Set(q.opts!.map((o) => o.sub)).size).toBe(4);
    expect(q.opts!.find((o) => o.ok)!.sub).toBe(q.binyan);
  });
  it("typeRoot answer strips homograph digits", () => {
    expect(makeQuestion(byId("שכר2"), ROOTS, "typeRoot").answer).toBe("שכר");
  });
});

describe("xpFor", () => {
  it("scales by mode, combo, and retry", () => {
    expect(xpFor("rootMeaning", 0, true)).toBe(10);
    expect(xpFor("typeRoot", 0, true)).toBe(20);
    expect(xpFor("rootMeaning", 3, true)).toBe(15);
    expect(xpFor("rootMeaning", 6, true)).toBe(20);
    expect(xpFor("typeRoot", 0, false)).toBe(10);
  });
});
