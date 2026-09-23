import { describe, expect, it } from "vitest";
import {
  BINYAN_WORDS,
  binyanLesson,
  binyanStats,
  binyanVerbs,
  canSpotBinyan,
  familyShowcase,
  pickBinyanVerbs,
  verbsInOrder,
} from "./binyan";
import { spotBinyanOptions, verbMeaningOptions } from "./quiz";
import { defaultProgress } from "./storage";
import { applyAnswer } from "./srs";
import { BINYAN_IDS, BINYANIM, isBinyan } from "../data/binyanim";
import { SENTENCES } from "../data/sentences";
import { ROOTS } from "../data/roots";
import type { Binyan } from "../types";

const byId = (id: string) => ROOTS.find((r) => r.r === id)!;
const known = { ok: 2, bad: 0 };

describe("binyan verbs and stats", () => {
  it("lists every verb of a binyan in course order, and nothing else", () => {
    for (const b of BINYAN_IDS) {
      const verbs = binyanVerbs(b, ROOTS);
      expect(verbs.length).toBeGreaterThan(0);
      for (const v of verbs) expect(v.word.b).toBe(b);
      const idx = verbs.map((v) => ROOTS.indexOf(v.root));
      expect(idx).toEqual([...idx].sort((x, y) => x - y));
    }
  });
  it("counts known verbs from word memory and verbs of met roots", () => {
    const p = defaultProgress();
    const [a, b] = binyanVerbs("pi'el", ROOTS);
    p.words[a.word.h] = known;
    p.roots[b.root.r] = applyAnswer(undefined, true, true, Date.now());
    const st = binyanStats("pi'el", ROOTS, p);
    expect(st.total).toBe(binyanVerbs("pi'el", ROOTS).length);
    expect(st.known).toBe(1);
    expect(st.fromSeen).toBe(1);
  });
});

describe("picking a lesson's verbs", () => {
  it("puts unknown verbs of met roots first, then the nearest ahead, then known ones", () => {
    const p = defaultProgress();
    const verbs = binyanVerbs("hif'il", ROOTS);
    const met = verbs.slice(20, 22);
    for (const v of met) p.roots[v.root.r] = applyAnswer(undefined, true, true, Date.now());
    const picked = pickBinyanVerbs("hif'il", ROOTS, p);
    expect(picked).toHaveLength(BINYAN_WORDS);
    expect(new Set(picked.slice(0, 2).map((v) => v.word.h))).toEqual(
      new Set(met.map((v) => v.word.h)),
    );
    // The rest come from the start of the path, not from anywhere.
    const firstAhead = new Set(verbs.slice(0, BINYAN_WORDS * 2 + 2).map((v) => v.word.h));
    for (const v of picked.slice(2)) expect(firstAhead.has(v.word.h)).toBe(true);
  });
  it("reviews known verbs, weakest first, once nothing is left to learn", () => {
    const p = defaultProgress();
    const verbs = binyanVerbs("huf'al", ROOTS);
    verbs.forEach((v, i) => (p.words[v.word.h] = { ok: 2 + i, bad: 0 }));
    const picked = pickBinyanVerbs("huf'al", ROOTS, p);
    expect(picked[0].word.h).toBe(verbs[0].word.h);
  });
  it("never asks two verbs of the same root in one lesson", () => {
    for (const b of BINYAN_IDS) {
      const picked = pickBinyanVerbs(b, ROOTS, defaultProgress());
      expect(new Set(picked.map((v) => v.root.r)).size).toBe(picked.length);
    }
  });
});

describe("a binyan lesson", () => {
  it("meets every verb, then uses each once, all in that binyan", () => {
    for (const b of BINYAN_IDS) {
      const lesson = binyanLesson(b, ROOTS, defaultProgress());
      const n = lesson.length / 2;
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
      const meet = lesson.slice(0, n);
      const use = lesson.slice(n);
      for (const x of meet) expect(x.mode).toBe("verbMeaning");
      expect(new Set(use.map((x) => x.word.h))).toEqual(new Set(meet.map((x) => x.word.h)));
      for (const x of lesson) expect(x.word.b).toBe(b);
      // The second pass never opens on the verb the first pass just ended with.
      if (n > 1) expect(use[0].word.h).not.toBe(meet[n - 1].word.h);
      for (const x of use) {
        if (x.mode === "cloze") expect(SENTENCES[x.word.h]).toBeDefined();
        if (x.mode === "spotBinyan") expect(canSpotBinyan(x.root, x.word, ROOTS)).toBe(true);
      }
    }
  });
});

describe("verb meaning options", () => {
  it("offers the verb's gloss once among four, siblings from its own root first", () => {
    const r = byId("כתב");
    const w = r.words.find((x) => x.b === "hif'il")!;
    for (let i = 0; i < 20; i++) {
      const opts = verbMeaningOptions(r, w, ROOTS);
      expect(opts).toHaveLength(4);
      expect(opts.filter((o) => o.ok).map((o) => o.label)).toEqual([w.g]);
      expect(new Set(opts.map((o) => o.label)).size).toBe(4);
      // כתב has other verbs: they fill the tiles before any other root's do.
      const siblings = r.words.filter((x) => isBinyan(x.b) && x.b !== "hif'il");
      const shown = opts.filter((o) => siblings.some((x) => x.g === o.label));
      expect(shown).toHaveLength(Math.min(3, siblings.length));
    }
  });
});

describe("spot the binyan", () => {
  it("has exactly one tile in the asked binyan: the verb itself", () => {
    for (const b of BINYAN_IDS) {
      for (const { root, word } of binyanVerbs(b, ROOTS).slice(0, 25)) {
        const opts = spotBinyanOptions(root, word, ROOTS);
        expect(opts).toHaveLength(4);
        expect(opts.filter((o) => o.ok).map((o) => o.label)).toEqual([word.h]);
        expect(opts.filter((o) => o.w?.b === b)).toHaveLength(1);
        expect(new Set(opts.map((o) => o.label)).size).toBe(4);
        for (const o of opts) expect(isBinyan(o.w!.b)).toBe(true);
      }
    }
  });
});

describe("the binyan page's showcase", () => {
  it("picks a root that uses the binyan among at least two, preferring met roots", () => {
    const p = defaultProgress();
    for (const b of BINYAN_IDS) {
      const r = familyShowcase(b, ROOTS, p);
      if (!r) continue;
      expect(r.words.some((w) => w.b === b)).toBe(true);
      expect(new Set(verbsInOrder(r).map((w) => w.b)).size).toBeGreaterThanOrEqual(2);
    }
    // Among roots with as many binyanim, a met one wins.
    const best = Math.max(...binyanVerbs("hif'il", ROOTS).map((v) => kinds(v.root)));
    const tied = binyanVerbs("hif'il", ROOTS).filter((v) => kinds(v.root) === best);
    const target = tied[tied.length - 1].root;
    p.roots[target.r] = applyAnswer(undefined, true, true, Date.now());
    expect(familyShowcase("hif'il", ROOTS, p)).toBe(target);
  });
  it("orders a root's verbs pa'al → hitpa'el", () => {
    const order = verbsInOrder(byId("כתב")).map((w) => BINYAN_IDS.indexOf(w.b as Binyan));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

describe("binyan teaching content", () => {
  it("gives every binyan a way to spot it, its tenses and what it does", () => {
    for (const b of BINYANIM) {
      expect(b.spot.length).toBeGreaterThan(20);
      expect(b.forms.past && b.forms.present && b.forms.future).toBeTruthy();
      expect(b.uses.length).toBeGreaterThanOrEqual(2);
      for (const u of [b.forms.past, b.forms.present, b.forms.future, ...b.uses.map((x) => x.he)])
        expect(u).toMatch(/[ְ-ׇ]/);
    }
  });
});

const kinds = (r: ReturnType<typeof byId>) =>
  new Set(r.words.filter((w) => isBinyan(w.b)).map((w) => w.b)).size;
