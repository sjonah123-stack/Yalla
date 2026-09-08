import { describe, expect, it } from "vitest";
import {
  QWERTY,
  isHebrewLetter,
  keyToHebrew,
  normLetters,
  rootDisplay,
  rootLetters,
  stripNikud,
} from "./hebrew";
import { ROOTS } from "../data/roots";

describe("hebrew", () => {
  it("normalizes final letters", () => {
    expect(normLetters("שלום")).toBe("שלומ");
    expect(normLetters("ארץ")).toBe("ארצ");
  });
  it("strips nikud from every word in the bank", () => {
    for (const r of ROOTS)
      for (const w of r.words) expect(stripNikud(w.h)).toMatch(/^[א-ת\s"'\-]+$/);
  });
  it("strips digits from homograph ids and spaces letters for display", () => {
    expect(rootLetters({ r: "שכר2" })).toBe("שכר");
    expect(rootDisplay({ r: "כתב" })).toBe("כ ת ב");
  });
  it("maps QWERTY keys to valid Hebrew letters injectively", () => {
    const heb = Object.values(QWERTY).filter(isHebrewLetter);
    expect(new Set(heb).size).toBe(heb.length);
    expect(heb).toHaveLength(27);
    expect(keyToHebrew("t")).toBe("א");
    expect(keyToHebrew("q")).toBeNull();
    expect(keyToHebrew("ש")).toBe("ש");
  });
});
