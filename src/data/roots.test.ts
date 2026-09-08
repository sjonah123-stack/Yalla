import { describe, expect, it } from "vitest";
import { ROOTS } from "./roots";
import { rootLetters } from "../lib/hebrew";

const FORMS = [
  "pa'al",
  "nif'al",
  "pi'el",
  "pu'al",
  "hif'il",
  "huf'al",
  "hitpa'el",
  "noun",
  "adj",
  "adv",
  "prep",
  "phrase",
  "interj",
];

describe("root bank integrity", () => {
  it("has unique ids", () => {
    expect(new Set(ROOTS.map((r) => r.r)).size).toBe(ROOTS.length);
  });
  it("every root has ≥2 words with all fields and a known form", () => {
    for (const r of ROOTS) {
      expect(r.words.length, r.r).toBeGreaterThanOrEqual(2);
      expect(rootLetters(r).length, r.r).toBeGreaterThanOrEqual(2);
      for (const w of r.words) {
        expect(w.h && w.t && w.g && w.b, `${r.r} ${w.h}`).toBeTruthy();
        expect(FORMS, `${r.r} ${w.h} ${w.b}`).toContain(w.b);
      }
    }
  });
});
