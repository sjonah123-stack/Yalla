import { describe, expect, it } from "vitest";
import {
  KEY_ROWS,
  QWERTY,
  isHebrewLetter,
  isTypeable,
  keyToHebrew,
  normLetters,
  rootDisplay,
  rootLetters,
  sameLetters,
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
    // Final letters stay final: "o" is ם, the key a Hebrew keyboard puts there.
    expect(keyToHebrew("o")).toBe("ם");
  });
  it("lays the on-screen keyboard out key for key like the physical Israeli one", () => {
    const physical = ["ertyuiop", "asdfghjkl;", "zxcvbnm,."].map((row) =>
      [...row].map((k) => QWERTY[k]).join(""),
    );
    expect([...KEY_ROWS]).toEqual(physical);
    // Every letter, finals included, exactly once.
    const keys = KEY_ROWS.join("");
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(27);
  });
  it("judges typed letters with final and medial forms as the same letter", () => {
    expect(sameLetters("גוף", "גוף")).toBe(true);
    expect(sameLetters("גופ", "גוף")).toBe(true);
    expect(sameLetters("שלום", "שלומ")).toBe(true);
    expect(sameLetters("גוב", "גוף")).toBe(false);
  });
  it("every root can be typed on the on-screen keyboard and is accepted either way", () => {
    const keys = new Set(KEY_ROWS.join(""));
    for (const r of ROOTS) {
      const answer = rootLetters(r);
      for (const c of answer) expect(keys.has(c), `${r.r}: ${c} has no key`).toBe(true);
      // Typed as spelled (ף) or with the medial form (פ): both right.
      expect(sameLetters(answer, answer)).toBe(true);
      expect(sameLetters(normLetters(answer), answer)).toBe(true);
    }
  });
  it("only single plain words are typeable", () => {
    expect(isTypeable("כָּתַב")).toBe(true);
    expect(isTypeable("בֵּית כְּנֶסֶת")).toBe(false);
    expect(isTypeable("חוּל־הַמּוֹעֵד")).toBe(false);
  });
});
