import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { rootLetters, stripNikud } from "./hebrew";
import {
  BINYANIM,
  IRREGULAR,
  PAST_PERSONS,
  PRESENT_FORMS,
  SIN_ROOTS,
  conjugate,
  isStrongRoot,
  paradigm,
  type Binyan,
  type Gender,
  type Person,
} from "./conjugate";

const nfc = (s: string): string => s.normalize("NFC");
const past = (letters: string, binyan: Binyan, id: Person["id"]): string | null =>
  conjugate(letters, binyan, "past", id);
const present = (letters: string, binyan: Binyan, id: Gender["id"]): string | null =>
  conjugate(letters, binyan, "present", id);

describe("form tables", () => {
  it("lists the past persons in paradigm order", () => {
    expect(PAST_PERSONS.map((p) => p.id)).toEqual([
      "1s",
      "2ms",
      "2fs",
      "3ms",
      "3fs",
      "1p",
      "2p",
      "3p",
    ]);
  });

  it("lists the present forms in paradigm order", () => {
    expect(PRESENT_FORMS.map((f) => f.id)).toEqual(["ms", "fs", "mp", "fp"]);
  });

  it("labels every slot in both languages", () => {
    for (const slot of [...PAST_PERSONS, ...PRESENT_FORMS]) {
      expect(slot.he.length).toBeGreaterThan(0);
      expect(slot.en.length).toBeGreaterThan(0);
    }
  });
});

describe("isStrongRoot", () => {
  it("accepts roots whose every letter behaves", () => {
    for (const r of ["כתב", "למד", "שכן", "משך", "שטף", "פגש", "לבש", "בשל", "כבד", "שמן"]) {
      expect(isStrongRoot(r), r).toBe(true);
    }
  });

  it("rejects weak and guttural roots", () => {
    const cases: [string, string][] = [
      ["אמר", "initial alef"],
      ["קרא", "final alef"],
      ["שתה", "final he"],
      ["קום", "hollow"],
      ["ישב", "initial yod"],
      ["נפל", "initial nun assimilates in hif'il"],
      ["שמר", "resh third"],
      ["דבר", "resh third"],
      ["ברך", "resh second, no dagesh"],
      ["חשב", "het"],
      ["שמע", "ayin"],
      ["סבב", "geminate"],
      ["גנן", "geminate"],
    ];
    for (const [r, why] of cases) expect(isStrongRoot(r), `${r} — ${why}`).toBe(false);
  });

  it("rejects anything that is not three Hebrew letters", () => {
    for (const r of ["", "כת", "כתבל", "cat", "כt ב"]) expect(isStrongRoot(r), r).toBe(false);
  });

  it("normalizes homograph digits and final letters", () => {
    expect(isStrongRoot("כתב2")).toBe(true);
    expect(isStrongRoot("מלך")).toBe(true); // written with a final kaf
    expect(isStrongRoot("שכן")).toBe(true); // written with a final nun
  });

  it("accepts a root the caller pointed as sin", () => {
    expect(isStrongRoot("שׂכל")).toBe(true);
  });
});

describe("pa'al", () => {
  it("conjugates כתב right through the paradigm", () => {
    const p = paradigm("כתב", "pa'al");
    expect(p).not.toBeNull();
    expect(p?.past).toEqual({
      "1s": nfc("כָּתַבְתִּי"),
      "2ms": nfc("כָּתַבְתָּ"),
      "2fs": nfc("כָּתַבְתְּ"),
      "3ms": nfc("כָּתַב"),
      "3fs": nfc("כָּתְבָה"),
      "1p": nfc("כָּתַבְנוּ"),
      "2p": nfc("כְּתַבְתֶּם"),
      "3p": nfc("כָּתְבוּ"),
    });
    expect(p?.present).toEqual({
      ms: nfc("כּוֹתֵב"),
      fs: nfc("כּוֹתֶבֶת"),
      mp: nfc("כּוֹתְבִים"),
      fp: nfc("כּוֹתְבוֹת"),
    });
  });
});

describe("pi'el", () => {
  it("conjugates למד right through the paradigm", () => {
    const p = paradigm("למד", "pi'el");
    expect(p?.past).toEqual({
      "1s": nfc("לִמַּדְתִּי"),
      "2ms": nfc("לִמַּדְתָּ"),
      "2fs": nfc("לִמַּדְתְּ"),
      "3ms": nfc("לִמֵּד"),
      "3fs": nfc("לִמְּדָה"),
      "1p": nfc("לִמַּדְנוּ"),
      "2p": nfc("לִמַּדְתֶּם"),
      "3p": nfc("לִמְּדוּ"),
    });
    expect(p?.present).toEqual({
      ms: nfc("מְלַמֵּד"),
      fs: nfc("מְלַמֶּדֶת"),
      mp: nfc("מְלַמְּדִים"),
      fp: nfc("מְלַמְּדוֹת"),
    });
  });

  it("doubles the middle radical even when it is not begadkefat", () => {
    expect(past("בשל", "pi'el", "3ms")).toBe(nfc("בִּשֵּׁל")); // the bank's בִּשֵּׁל
    expect(past("שכן", "pi'el", "3ms")).toBe(nfc("שִׁכֵּן")); // the bank's שִׁכֵּן
  });
});

describe("hif'il", () => {
  it("conjugates כתב right through the paradigm", () => {
    const p = paradigm("כתב", "hif'il");
    expect(p?.past).toEqual({
      "1s": nfc("הִכְתַּבְתִּי"),
      "2ms": nfc("הִכְתַּבְתָּ"),
      "2fs": nfc("הִכְתַּבְתְּ"),
      "3ms": nfc("הִכְתִּיב"),
      "3fs": nfc("הִכְתִּיבָה"),
      "1p": nfc("הִכְתַּבְנוּ"),
      "2p": nfc("הִכְתַּבְתֶּם"),
      "3p": nfc("הִכְתִּיבוּ"),
    });
    expect(p?.present).toEqual({
      ms: nfc("מַכְתִּיב"),
      fs: nfc("מַכְתִּיבָה"),
      mp: nfc("מַכְתִּיבִים"),
      fp: nfc("מַכְתִּיבוֹת"),
    });
  });

  it("matches the bank on other roots", () => {
    expect(past("לבש", "hif'il", "3ms")).toBe(nfc("הִלְבִּישׁ"));
    expect(past("כבד", "hif'il", "3ms")).toBe(nfc("הִכְבִּיד"));
    expect(past("בשל", "hif'il", "3ms")).toBe(nfc("הִבְשִׁיל"));
    expect(past("שמן", "hif'il", "3ms")).toBe(nfc("הִשְׁמִין"));
  });
});

describe("dagesh", () => {
  const DAGESH = "ּ";
  const MARK = /[֑-ׇ]/;
  /** True when `letter` appears in `word` carrying a dagesh (looking only at its own marks). */
  const has = (word: string | null, letter: string): boolean => {
    const chars = [...nfc(word ?? "")];
    return chars.some((c, i) => {
      if (c !== letter) return false;
      for (let j = i + 1; j < chars.length && MARK.test(chars[j]); j++) {
        if (chars[j] === DAGESH) return true;
      }
      return false;
    });
  };

  it("puts a dagesh lene in a word-initial begadkefat letter", () => {
    expect(has(past("כתב", "pa'al", "3ms"), "כ")).toBe(true); // כָּתַב
    expect(has(past("כתב", "pa'al", "2p"), "כ")).toBe(true); // כְּתַבְתֶּם
    expect(has(past("למד", "pi'el", "3ms"), "ל")).toBe(false); // לִמֵּד, ל is not begadkefat
    expect(has(past("שטף", "pa'al", "3ms"), "ש")).toBe(false); // שָׁטַף
  });

  it("leaves the first radical bare where the paradigm has a vowel before it", () => {
    expect(has(present("כבד", "pi'el", "ms"), "כ")).toBe(false); // מְכַבֵּד
    expect(has(past("כתב", "hif'il", "3ms"), "כ")).toBe(false); // הִכְתִּיב
  });

  it("puts a dagesh in hif'il's second radical only when it is begadkefat", () => {
    expect(has(past("כתב", "hif'il", "3ms"), "ת")).toBe(true); // הִכְתִּיב
    expect(has(past("שמן", "hif'il", "3ms"), "מ")).toBe(false); // הִשְׁמִין
  });

  it("never doubles pa'al's middle radical", () => {
    expect(past("שטף", "pa'al", "3ms")).toBe(nfc("שָׁטַף"));
    expect(past("לבש", "pa'al", "3ms")).toBe(nfc("לָבַשׁ"));
  });
});

describe("word-final letters", () => {
  it("swaps in the final form of כ מ נ פ צ", () => {
    expect(past("משך", "pa'al", "3ms")).toBe(nfc("מָשַׁךְ"));
    expect(past("רשם", "pa'al", "3ms")).toBe(nfc("רָשַׁם"));
    expect(past("שכן", "pa'al", "3ms")).toBe(nfc("שָׁכַן"));
    expect(past("שטף", "pa'al", "3ms")).toBe(nfc("שָׁטַף"));
    expect(past("קפץ", "pa'al", "3ms")).toBe(nfc("קָפַץ"));
  });

  it("keeps the medial form when a suffix follows", () => {
    expect(past("משך", "pa'al", "1s")).toBe(nfc("מָשַׁכְתִּי"));
    expect(past("משך", "pa'al", "3fs")).toBe(nfc("מָשְׁכָה"));
    expect(past("קפץ", "pa'al", "3p")).toBe(nfc("קָפְצוּ"));
  });

  it("gives a word-final kaf its silent shva, in every binyan and tense", () => {
    expect(past("משך", "hif'il", "3ms")).toBe(nfc("הִמְשִׁיךְ"));
    expect(present("משך", "pa'al", "ms")).toBe(nfc("מוֹשֵׁךְ"));
    expect(present("משך", "hif'il", "ms")).toBe(nfc("מַמְשִׁיךְ"));
  });
});

describe("shin and sin", () => {
  it("defaults a bare ש to shin", () => {
    expect(present("גלש", "pa'al", "ms")).toBe(nfc("גּוֹלֵשׁ"));
  });

  it("uses sin for the known sin roots", () => {
    expect(SIN_ROOTS).toContain("שכל");
    expect(past("שכל", "hif'il", "3ms")).toBe(nfc("הִשְׂכִּיל"));
    expect(present("שכל", "hif'il", "ms")).toBe(nfc("מַשְׂכִּיל"));
  });

  it("honours a sin the caller pointed itself", () => {
    expect(past("שׂכל", "hif'il", "3ms")).toBe(nfc("הִשְׂכִּיל"));
  });
});

describe("refusals", () => {
  it("returns null for a root it cannot do", () => {
    for (const r of ["אמר", "קרא", "ישב", "נפל", "שמר", "חשב", "סבב", "כת"]) {
      expect(paradigm(r, "pa'al"), r).toBeNull();
      expect(past(r, "pa'al", "3ms"), r).toBeNull();
      expect(present(r, "pi'el", "ms"), r).toBeNull();
    }
  });

  it("returns null for a known irregular root + binyan, and only that pair", () => {
    expect(IRREGULAR).toContain("תכן|pi'el");
    expect(paradigm("תכן", "pi'el")).toBeNull();
    expect(past("תכן", "pi'el", "3ms")).toBeNull();
    expect(paradigm("תכן", "pa'al")).not.toBeNull();
    expect(paradigm("תכן", "hif'il")).not.toBeNull();
  });
});

describe("conjugate and paradigm agree", () => {
  it("produces the same string either way, for every slot", () => {
    for (const binyan of BINYANIM) {
      const p = paradigm("כתב", binyan);
      expect(p, binyan).not.toBeNull();
      for (const person of PAST_PERSONS) {
        expect(past("כתב", binyan, person.id)).toBe(p?.past[person.id]);
      }
      for (const form of PRESENT_FORMS) {
        expect(present("כתב", binyan, form.id)).toBe(p?.present[form.id]);
      }
    }
  });

  it("gives every slot a distinct, fully vocalized form", () => {
    for (const binyan of BINYANIM) {
      const p = paradigm("כתב", binyan);
      const all = Object.values(p?.past ?? {}).concat(Object.values(p?.present ?? {}));
      expect(all).toHaveLength(12);
      for (const w of all) {
        expect(w.length).toBeGreaterThan(stripNikud(w).length); // carries nikud
      }
      expect(new Set(Object.values(p?.past ?? {})).size).toBe(8);
    }
  });
});

// --- the bank is the real test ---------------------------------------------

const BINYAN_WORDS = new Set<string>(BINYANIM);
const strongRoots = ROOTS.filter((r) => isStrongRoot(rootLetters(r)));

describe("against the root bank", () => {
  it("finds enough strong roots to build a drill on", () => {
    console.log(`strong roots: ${strongRoots.length} of ${ROOTS.length}`);
    expect(strongRoots.length).toBeGreaterThanOrEqual(80);
  });

  it("matches every vocalized verb the bank glosses as a past tense", () => {
    const mismatches: { root: string; binyan: string; slot: string; bank: string; got: string }[] =
      [];
    let compared = 0;
    for (const root of strongRoots) {
      const letters = rootLetters(root);
      for (const w of root.words) {
        if (!BINYAN_WORDS.has(w.b)) continue;
        // "he wrote" / "it burned" = 3ms past; "she calved" = 3fs past.
        const slot: Person["id"] | null = /^(he|it) /.test(w.g)
          ? "3ms"
          : /^she /.test(w.g)
            ? "3fs"
            : null;
        if (!slot) continue;
        const got = conjugate(letters, w.b as Binyan, "past", slot);
        if (got === null) continue; // a declared irregular
        compared++;
        if (got !== nfc(w.h)) {
          mismatches.push({ root: root.r, binyan: w.b, slot, bank: nfc(w.h), got });
        }
      }
    }
    const rate = compared === 0 ? 0 : mismatches.length / compared;
    console.log(`past forms compared: ${compared}, mismatches: ${mismatches.length}`);
    if (mismatches.length > 0) console.table(mismatches);
    expect(compared).toBeGreaterThanOrEqual(100);
    expect(rate).toBeLessThan(0.15);
  });

  it("agrees with the bank on which ש is a sin", () => {
    const wrong: string[] = [];
    for (const root of strongRoots) {
      const letters = rootLetters(root);
      if (!letters.includes("ש")) continue;
      const mine = past(letters, "pa'al", "3ms") ?? "";
      const bankSin = root.words.some((w) => nfc(w.h).includes("שׂ"));
      if (bankSin !== mine.includes("שׂ")) wrong.push(`${root.r}: bank sin=${bankSin}`);
    }
    expect(wrong).toEqual([]);
  });

  it("reproduces the participles the bank happens to carry as nouns and adjectives", () => {
    const hits: string[] = [];
    for (const root of strongRoots) {
      const letters = rootLetters(root);
      const forms = new Map<string, string>();
      for (const binyan of BINYANIM) {
        const p = paradigm(letters, binyan);
        if (!p) continue;
        for (const f of PRESENT_FORMS) forms.set(p.present[f.id], `${binyan}/${f.id}`);
      }
      for (const w of root.words) {
        const label = forms.get(nfc(w.h));
        if (label) hits.push(`${root.r} ${label} ${w.h}`);
      }
    }
    console.log(`present forms confirmed by a bank word: ${hits.length}`);
    expect(hits.length).toBeGreaterThanOrEqual(10);
  });

  it("refuses everything it is not sure about", () => {
    for (const root of ROOTS) {
      const letters = rootLetters(root);
      if (isStrongRoot(letters)) continue;
      for (const binyan of BINYANIM) expect(paradigm(letters, binyan), root.r).toBeNull();
    }
  });
});
