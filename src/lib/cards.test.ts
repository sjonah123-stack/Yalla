import { describe, expect, it } from "vitest";
import type { Root } from "../types";
import { PHRASES, type Phrase } from "../data/phrases";
import { PHRASE_DECK_MAX, phraseDeck, phraseStats, wordDeck } from "./cards";

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

describe("phraseDeck and phraseStats", () => {
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
  it("orders unknown by rank, then known weakest first; topic decks filter", () => {
    const words = { h1: { ok: 5, bad: 0 }, h4: { ok: 3, bad: 1 } };
    expect(phraseDeck(list, { words }).map((x) => x.id)).toEqual(["ph-2", "ph-3", "ph-4", "ph-1"]);
    expect(phraseDeck(list, { words }, "greet").map((x) => x.id)).toEqual(["ph-3", "ph-4", "ph-1"]);
  });
  it("caps the all-topics deck but not a topic deck", () => {
    expect(phraseDeck(PHRASES, { words: {} })).toHaveLength(PHRASE_DECK_MAX);
    expect(phraseDeck(PHRASES, { words: {} })[0].rank).toBe(1);
    const greet = PHRASES.filter((x) => x.topic === "greet").length;
    expect(phraseDeck(PHRASES, { words: {} }, "greet")).toHaveLength(greet);
  });
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
