import { describe, expect, it } from "vitest";
import { SENTENCES } from "./sentences";
import { ROOTS } from "./roots";

const NIKUD = /[ְ-ׇ]/;
const WORDS = new Set(ROOTS.flatMap((r) => r.words.map((w) => w.h)));

describe("example sentences", () => {
  it("every key is a bank word, every sentence contains it verbatim, is vocalized, short, translated", () => {
    for (const [word, s] of Object.entries(SENTENCES)) {
      expect(WORDS.has(word), `${word} is not in the bank`).toBe(true);
      expect(s.he.includes(word), `${word}: sentence lacks the word`).toBe(true);
      expect(NIKUD.test(s.he), `${word}: sentence lacks nikud`).toBe(true);
      expect(s.he.split(/\s+/).length, `${word}: too long`).toBeLessThanOrEqual(12);
      expect(s.en.trim().length, `${word}: missing translation`).toBeGreaterThan(3);
      expect(/[^֐-׿\s.,!?…:;"'()\-־–]/.test(s.he), `${word}: non-Hebrew chars`).toBe(false);
    }
  });
});
