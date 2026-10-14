import { describe, expect, it } from "vitest";
import { PHRASES, PHRASE_TOPICS } from "./phrases";
import { ROOTS } from "./roots";

const NIKUD = /[ְ-ׇ]/;
const HEBREW = /[א-ת]/;
/** Hebrew letters, points, spaces and punctuation only. */
const HEB_ONLY = /^[֐-׿\s.,!?…:;"'()\-־–]+$/;
const ROOT_IDS = new Set(ROOTS.map((r) => r.r));
const TOPICS = new Set(PHRASE_TOPICS.map((t) => t.id));

/** Every word with Hebrew letters carries at least one point. */
const pointed = (s: string) => s.split(/\s+/).filter((w) => HEBREW.test(w)).every((w) => NIKUD.test(w));

describe("everyday phrases", () => {
  it("have stable, unique ids, unique Hebrew and unique ranks", () => {
    PHRASES.forEach((p, i) => expect(p.id).toBe(`ph-${String(i + 1).padStart(3, "0")}`));
    expect(new Set(PHRASES.map((p) => p.h)).size).toBe(PHRASES.length);
    expect(new Set(PHRASES.map((p) => p.rank)).size).toBe(PHRASES.length);
  });

  it("are pointed Hebrew, short, transliterated and glossed", () => {
    for (const p of PHRASES) {
      expect(HEB_ONLY.test(p.h), `${p.id}: non-Hebrew characters in ${p.h}`).toBe(true);
      expect(pointed(p.h), `${p.id}: a word lacks nikud in ${p.h}`).toBe(true);
      expect(p.h.trim().split(/\s+/).length, `${p.id} too long`).toBeLessThanOrEqual(8);
      expect(p.t.trim().length, p.id).toBeGreaterThan(1);
      expect(/[֐-׿]/.test(p.t), `${p.id}: Hebrew in transliteration`).toBe(false);
      expect(p.g.trim().length, p.id).toBeGreaterThan(1);
      expect(TOPICS.has(p.topic), `${p.id}: unknown topic ${p.topic}`).toBe(true);
    }
  });

  it("keep notes in English and feminine forms in pointed Hebrew", () => {
    for (const p of PHRASES) {
      if (p.note) expect(/[֐-׿]/.test(p.note), `${p.id}: Hebrew in note`).toBe(false);
      if (p.fem) {
        expect(HEB_ONLY.test(p.fem.h), `${p.id}: fem ${p.fem.h}`).toBe(true);
        expect(pointed(p.fem.h), `${p.id}: fem lacks nikud`).toBe(true);
        expect(p.fem.h, p.id).not.toBe(p.h);
      }
    }
  });

  it("tag bank roots with words found verbatim in the phrase", () => {
    for (const p of PHRASES)
      for (const t of p.tags) {
        expect(ROOT_IDS.has(t.r), `${p.id}: unknown root ${t.r}`).toBe(true);
        expect(p.h.includes(t.w), `${p.id}: tag ${t.w} not in ${p.h}`).toBe(true);
        expect(NIKUD.test(t.w), `${p.id}: tag ${t.w} lacks nikud`).toBe(true);
      }
  });

  it("cover every topic with at least five phrases", () => {
    for (const t of PHRASE_TOPICS)
      expect(PHRASES.filter((p) => p.topic === t.id).length, t.id).toBeGreaterThanOrEqual(5);
  });
});
