import { describe, expect, it } from "vitest";
import { canBuildWord, makeQuestion, modeFor, similarRoots, xpFor, verbForms } from "./quiz";
import type { Root } from "../types";
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
    for (const mode of [
      "rootMeaning",
      "meaningRoot",
      "wordRoot",
      "buildWord",
      "hearWord",
    ] as const) {
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
  it("buildWord: one correct word in the asked form, own-root distractors in other forms", () => {
    const r = ROOTS.find(canBuildWord)!;
    for (let i = 0; i < 30; i++) {
      const q = makeQuestion(r, ROOTS, "buildWord");
      expect(new Set(q.opts!.map((o) => o.label)).size).toBe(4);
      const ok = q.opts!.filter((o) => o.ok);
      expect(ok).toHaveLength(1);
      expect(ok[0].w!.b).toBe(q.form);
      expect(r.words).toContain(ok[0].w);
      expect(q.word).toBe(ok[0].w);
      for (const o of q.opts!) if (!o.ok && r.words.includes(o.w!)) expect(o.w!.b).not.toBe(q.form);
    }
  });
  it("typeRoot answer strips homograph digits", () => {
    expect(makeQuestion(byId("שכר2"), ROOTS, "typeRoot").answer).toBe("שכר");
  });
});

describe("modeFor (buildWord, quick)", () => {
  it("never offers buildWord to a single-form root", () => {
    const r: Root = {
      r: "זזז",
      m: "x",
      short: "x",
      rank: 1,
      cat: "speech",
      unit: "speech-1",
      words: [
        { h: "זָז", t: "a", g: "a", b: "noun" },
        { h: "זִיז", t: "b", g: "b", b: "noun" },
      ],
    };
    for (let i = 0; i < 50; i++) expect(modeFor(r, 5, { audio: true })).not.toBe("buildWord");
  });
  it("quick context never offers typing or listening", () => {
    for (let i = 0; i < 50; i++) {
      const m = modeFor(byId("כתב"), 5, { audio: true, quick: true });
      expect(m).not.toBe("typeRoot");
      expect(m).not.toBe("hearWord");
    }
  });
});

describe("xpFor", () => {
  it("scales by mode, combo, and retry", () => {
    expect(xpFor("rootMeaning", 0, true)).toBe(10);
    expect(xpFor("typeRoot", 0, true)).toBe(20);
    expect(xpFor("rootMeaning", 3, true)).toBe(15);
    expect(xpFor("rootMeaning", 6, true)).toBe(20);
    expect(xpFor("typeRoot", 0, false)).toBe(10);
    expect(xpFor("buildWord", 0, true)).toBe(20);
  });
});
