import { describe, expect, it } from "vitest";
import type { Root } from "../types";
import type { Phrase } from "../data/phrases";
import { phraseStats, rootDeck, rootPool, wordDeck } from "./cards";
import { newRootState } from "./srs";

const root = (r: string, words: string[]): Root => ({
  r,
  m: r,
  short: r,
  rank: 1,
  cat: "test",
  unit: "test-1",
  words: words.map((h) => ({ h, t: h, g: h, b: "noun" as const })),
});
const KNOWN = { ok: 2, bad: 0 };

describe("wordDeck", () => {
  const a = root("א", ["a1", "a2", "a3"]);
  const b = root("ב", ["b1", "b2", "a2"]);
  it("puts unknown words first, then each root's earlier words, then list order; dedupes", () => {
    const deck = wordDeck([a, b], { words: { a1: KNOWN } });
    expect(deck.map((c) => c.word.h)).toEqual(["b1", "a2", "b2", "a3", "a1"]);
    expect(deck.find((c) => c.word.h === "a2")!.root.r).toBe("א");
  });
  it("caps the deck", () => {
    expect(wordDeck([a, b], { words: {} }, 2).map((c) => c.word.h)).toEqual(["a1", "b1"]);
  });
  it("is empty for no roots", () => {
    expect(wordDeck([], { words: {} })).toEqual([]);
  });
});

describe("phraseStats", () => {
  const ph = (id: number, topic: Phrase["topic"]): Phrase => ({
    id: `ph-${id}`,
    h: `h${id}`,
    t: "t",
    g: "g",
    topic,
    rank: id,
    tags: [],
  });
  const list = [ph(3, "greet"), ph(1, "greet"), ph(2, "time"), ph(4, "greet")];
  it("counts known phrases per topic and finds the next one to learn", () => {
    const s = phraseStats(list, { words: { h1: KNOWN, h2: KNOWN } });
    expect(s.known).toBe(2);
    expect(s.total).toBe(4);
    expect(s.byTopic.greet).toEqual({ known: 1, total: 3 });
    expect(s.byTopic.time).toEqual({ known: 1, total: 1 });
    expect(s.next?.id).toBe("ph-3");
    const all = Object.fromEntries(list.map((x) => [x.h, KNOWN]));
    expect(phraseStats(list, { words: all }).next).toBeNull();
  });
});

describe("rootPool / rootDeck", () => {
  const r = (id: string, cat: string): Root => ({ ...root(id, [`${id}1`]), cat });
  const roots = [r("א", "food"), r("ב", "food"), r("ג", "body"), r("ד", "body")];
  const now = 10_000;
  // ב is due today, ג is memorized (3-day interval, not due), א and ד are unmet.
  const p = {
    roots: {
      ב: { ...newRootState(), reps: 1, ivl: 1, ok: 1, due: now - 1 },
      ג: { ...newRootState(), reps: 2, ivl: 3, ok: 2, due: now + 1 },
    },
  };
  const ids = (xs: Root[]) => xs.map((x) => x.r);
  const keep = <T>(xs: readonly T[]) => xs.slice();

  it("filters by status and theme, in bank order", () => {
    expect(ids(rootPool(roots, p, { scope: "all", cat: null }, now))).toEqual(["א", "ב", "ג", "ד"]);
    expect(ids(rootPool(roots, p, { scope: "unmet", cat: null }, now))).toEqual(["א", "ד"]);
    expect(ids(rootPool(roots, p, { scope: "due", cat: null }, now))).toEqual(["ב"]);
    expect(ids(rootPool(roots, p, { scope: "memorized", cat: null }, now))).toEqual(["ג"]);
    expect(ids(rootPool(roots, p, { scope: "learning", cat: null }, now))).toEqual(["ב"]);
    expect(ids(rootPool(roots, p, { scope: "all", cat: "body" }, now))).toEqual(["ג", "ד"]);
    expect(rootPool(roots, p, { scope: "due", cat: "body" }, now)).toEqual([]);
  });
  it("draws `size` roots, or the whole pool for 0", () => {
    expect(ids(rootDeck(roots, p, { scope: "all", cat: null, size: 0 }, now, keep))).toEqual([
      "א",
      "ב",
      "ג",
      "ד",
    ]);
    expect(rootDeck(roots, p, { scope: "all", cat: null, size: 20 }, now)).toHaveLength(4);
    const many = Array.from({ length: 25 }, (_, i) => r(`ר${i}`, "food"));
    const flip = <T>(xs: readonly T[]) => xs.slice().reverse();
    const deck = rootDeck(many, p, { scope: "all", cat: null, size: 20 }, now, flip);
    expect(ids(deck)).toEqual(ids(flip(many).slice(0, 20)));
  });
});
