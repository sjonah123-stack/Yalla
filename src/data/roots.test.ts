import { describe, expect, it } from "vitest";
import { ROOTS } from "./roots";
import { SECTIONS, SECTION_BY_CAT, UNIT_IDS } from "./course";
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
const NIKUD = /[ְ-ׇ]/;
/** Vocalized forms allowed to appear under more than one root. */
const DUP_OK = new Set<string>([]);

describe("root bank integrity", () => {
  it("has unique ids", () => {
    expect(new Set(ROOTS.map((r) => r.r)).size).toBe(ROOTS.length);
  });
  it("has 2–4 Hebrew letters; digit suffixes only on real homographs with distinct short labels", () => {
    const letters = new Map<string, string[]>();
    for (const r of ROOTS) {
      const L = rootLetters(r);
      expect(L, r.r).toMatch(/^[א-ת]{2,4}$/);
      (letters.get(L) ?? letters.set(L, []).get(L)!).push(r.r);
    }
    for (const r of ROOTS) {
      if (/\d/.test(r.r)) {
        const twins = letters.get(rootLetters(r))!;
        expect(twins.length, r.r).toBeGreaterThan(1);
        const shorts = twins.map((id) => ROOTS.find((x) => x.r === id)!.short);
        expect(new Set(shorts).size, twins.join(" ")).toBe(twins.length);
      }
    }
  });
  it("every root has ≥2 words with all fields, a known form and nikud", () => {
    for (const r of ROOTS) {
      expect(r.words.length, r.r).toBeGreaterThanOrEqual(2);
      for (const w of r.words) {
        expect(w.h && w.t && w.g && w.b, `${r.r} ${w.h}`).toBeTruthy();
        expect(FORMS, `${r.r} ${w.h} ${w.b}`).toContain(w.b);
        expect(NIKUD.test(w.h), `${r.r} ${w.h} lacks nikud`).toBe(true);
      }
      expect(new Set(r.words.map((w) => w.h)).size, `${r.r} repeats a word`).toBe(r.words.length);
    }
  });
  it("no vocalized word appears under two roots", () => {
    const seen = new Map<string, string>();
    for (const r of ROOTS)
      for (const w of r.words) {
        if (DUP_OK.has(w.h)) continue;
        expect(seen.get(w.h), `${w.h} in ${seen.get(w.h)} and ${r.r}`).toBeUndefined();
        seen.set(w.h, r.r);
      }
  });
  it("short labels are ≤16 chars, single-sense", () => {
    for (const r of ROOTS) {
      expect(r.short.length, r.r).toBeLessThanOrEqual(16);
      expect(r.short, r.r).not.toMatch(/[/;]/);
    }
  });
});

describe("course integrity", () => {
  it("every root's unit exists in its section and its cat matches", () => {
    const ids = new Set(UNIT_IDS);
    for (const r of ROOTS) {
      expect(ids.has(r.unit), `${r.r} unit ${r.unit}`).toBe(true);
      const sec = SECTION_BY_CAT[r.cat];
      expect(sec, `${r.r} cat ${r.cat}`).toBeDefined();
      expect(sec.units, `${r.r} ${r.unit} not in section ${sec.id}`).toContain(r.unit);
    }
  });
  it("every listed unit has 5–10 roots with unique rank, short and gloss", () => {
    for (const sec of SECTIONS)
      for (const id of sec.units) {
        const rs = ROOTS.filter((r) => r.unit === id);
        expect(rs.length, id).toBeGreaterThanOrEqual(5);
        expect(rs.length, id).toBeLessThanOrEqual(10);
        expect(new Set(rs.map((r) => r.rank)).size, `${id} ranks`).toBe(rs.length);
        expect(new Set(rs.map((r) => r.short.toLowerCase())).size, `${id} shorts`).toBe(rs.length);
        const glosses = rs.flatMap((r) => r.words.map((w) => w.g.toLowerCase()));
        expect(new Set(glosses).size, `${id} repeats a gloss`).toBe(glosses.length);
      }
  });
  it("unit ids are unique across sections", () => {
    expect(new Set(UNIT_IDS).size).toBe(UNIT_IDS.length);
  });
});
