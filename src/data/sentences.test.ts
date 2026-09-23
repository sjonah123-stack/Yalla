import { describe, expect, it } from "vitest";
import { SENTENCES } from "./sentences";
import { ROOTS } from "./roots";
import { isBinyan } from "./binyanim";

const NIKUD = /[ְ-ׇ]/;
const WORDS = new Set(ROOTS.flatMap((r) => r.words.map((w) => w.h)));
const WORD = new Map(ROOTS.flatMap((r) => r.words.map((w) => [w.h, w] as const)));

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

// ---------- Grammar guards ----------
// The key is the bank's form, blanked in the cloze: a 3ms-past verb ("he …") or a masculine
// singular adjective must sit in a masculine-singular slot. These checks catch the mechanical
// ways a sentence can break that (and the pointing a glued prefix can break); the rest was
// audited by hand, sentence by sentence.

const bare = (s: string) => s.replace(/[֑-ׇ]/g, "");
const tokens = (he: string) => he.split(/[\s.,!?…:;"()]+/).filter(Boolean);
/** Words that can stand between a subject and its verb or predicate. */
const ADVERBS = new Set("לא כבר גם תמיד עדיין אף פעם רק מאוד שוב בדיוק אז באמת כמעט".split(" "));
/** Pronouns a 3ms past verb can't follow, and those a m.sg. adjective can't. */
const NOT_3MS = new Set("אני אתה את היא אנחנו אתם אתן הם הן".split(" "));
const NOT_MS = new Set("את היא אנחנו אתם אתן הם הן".split(" "));
const isMsKey = (h: string) => {
  const w = WORD.get(h)!;
  return { verb: isBinyan(w.b) && /^(he|it) /.test(w.g), adj: w.b === "adj" };
};
/** The word before the key, stepping back over adverbs. */
function before(he: string, key: string): string | null {
  const t = tokens(he);
  let j = t.findIndex((x) => x.includes(key)) - 1;
  while (j >= 0 && ADVERBS.has(bare(t[j]))) j--;
  return j >= 0 ? t[j] : null;
}

/**
 * Plural-looking words before a masculine-singular key that are right: a singular head.
 * אֱלֹהִים takes the singular; מִסְפַּר הַתַּלְמִידִים and זוּג יוֹנִים are construct chains.
 */
const SINGULAR_HEAD = new Set(["גָּאַל", "פָּחַת", "קִנֵּן"]);

describe("example sentences agree with their key", () => {
  it("a masculine-singular key never follows a pronoun of another person, gender or number", () => {
    for (const [key, s] of Object.entries(SENTENCES)) {
      const { verb, adj } = isMsKey(key);
      const prev = before(s.he, key);
      if (!prev) continue;
      if (verb) expect(NOT_3MS.has(bare(prev)), `${key} after ${prev}: ${s.he}`).toBe(false);
      if (adj) expect(NOT_MS.has(bare(prev)), `${key} after ${prev}: ${s.he}`).toBe(false);
    }
  });
  it("a masculine-singular key doesn't follow a plural noun (unless its head is singular)", () => {
    for (const [key, s] of Object.entries(SENTENCES)) {
      const { verb, adj } = isMsKey(key);
      if ((!verb && !adj) || SINGULAR_HEAD.has(key)) continue;
      const prev = before(s.he, key);
      // Pointed plural endings: -ִים, -וֹת (not צֶוֶת, whose ות is no suffix).
      if (prev) expect(/(ִים|וֹת)$/.test(prev), `${key} after ${prev}: ${s.he}`).toBe(false);
    }
  });
  it("the English opens with the Hebrew's subject pronoun", () => {
    const EN: Record<string, RegExp> = {
      הוא: /^(He|It)\b/,
      היא: /^(She|It)\b/,
      הם: /^They\b/,
      הן: /^They\b/,
      אני: /^I\b/,
      אנחנו: /^We\b/,
      אתה: /^You\b/,
      את: /^You\b/,
      אתם: /^You\b/,
      אתן: /^You\b/,
    };
    for (const [key, s] of Object.entries(SENTENCES)) {
      const re = EN[bare(tokens(s.he)[0])];
      if (re) expect(re.test(s.en.trim()), `${key}: ${s.he} / ${s.en}`).toBe(true);
    }
  });
});

// ---------- Pointing around a glued prefix ----------
const clusters = (s: string) =>
  [...s.matchAll(/([א-ת])([֑-ׇ]*)/g)].map((m) => ({ l: m[1], n: m[2] }));
const DAGESH = "ּ";
const SHVA = "ְ";
const GUTTURAL = /[אהחער]/;
const BGDKFT = /[בגדכפת]/;

describe("a prefix glued to the key", () => {
  it("leaves the key's pointing right (article dagesh, soft בגדכפת after a vowel)", () => {
    for (const [key, s] of Object.entries(SENTENCES)) {
      for (let i = s.he.indexOf(key); i >= 0; i = s.he.indexOf(key, i + 1)) {
        let j = i;
        while (j > 0 && /[א-ת֑-ׇ]/.test(s.he[j - 1])) j--;
        if (j === i) continue;
        const pre = clusters(s.he.slice(j, i)).at(-1)!;
        const first = clusters(key)[0];
        const hasDagesh = first.n.includes(DAGESH);
        const where = `${s.he.slice(j, i)}+${key}: ${s.he}`;
        // The article (הַ, or merged into בַּ / כַּ / לַ) doubles a non-guttural first letter.
        const article =
          (/[הבכל]/.test(pre.l) && /[ַָ]/.test(pre.n)) || (pre.l === "ה" && pre.n.includes("ֶ"));
        if (article && !GUTTURAL.test(first.l) && !first.n.includes(SHVA))
          expect(hasDagesh, `article without dagesh: ${where}`).toBe(true);
        // מִ / שֶׁ double it too.
        if ((pre.l === "מ" && pre.n.includes("ִ")) || (pre.l === "ש" && pre.n.includes("ֶ")))
          if (!GUTTURAL.test(first.l) && !first.n.includes(SHVA))
            expect(hasDagesh, `מִ/שֶׁ without dagesh: ${where}`).toBe(true);
        // After בְּ כְּ לְ וְ (or בִּ לִ, or וּ) a בגדכפת letter is soft: no dagesh.
        const vowelPrefix =
          (/[בכלו]/.test(pre.l) && /[ְִ]/.test(pre.n)) || (pre.l === "ו" && pre.n.includes(DAGESH));
        if (vowelPrefix && !article && BGDKFT.test(first.l))
          expect(hasDagesh, `hard letter after a vowel: ${where}`).toBe(false);
      }
    }
  });
});
