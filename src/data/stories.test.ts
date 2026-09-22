import { describe, expect, it } from "vitest";
import { STORIES, storyRoots } from "./stories";
import { ROOTS } from "./roots";

const NIKUD = /[ְ-ׇ]/;
const ROOT_IDS = new Set(ROOTS.map((r) => r.r));

describe("mini stories", () => {
  it("have unique ids and titles", () => {
    const ids = STORIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of STORIES) {
      expect(s.id).toMatch(/^st-[abc]\d{2}$/);
      expect(s.title.trim().length, s.id).toBeGreaterThan(2);
      expect(NIKUD.test(s.he), `${s.id}: title lacks nikud`).toBe(true);
    }
  });

  it("lines are vocalized, short, translated, and every tag is a bank root found verbatim", () => {
    for (const s of STORIES) {
      expect(s.lines.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.lines.length, s.id).toBeLessThanOrEqual(6);
      for (const l of s.lines) {
        const at = `${s.id}: ${l.he}`;
        expect(NIKUD.test(l.he), `${at} lacks nikud`).toBe(true);
        expect(l.he.split(/\s+/).length, `${at} too long`).toBeLessThanOrEqual(14);
        expect(l.en.trim().length, `${at} missing translation`).toBeGreaterThan(3);
        expect(/[^֐-׿\s.,!?…:;"'()\-־–]/.test(l.he), `${at} non-Hebrew chars`).toBe(false);
        for (const t of l.tags) {
          expect(ROOT_IDS.has(t.r), `${at}: unknown root ${t.r}`).toBe(true);
          expect(l.he.includes(t.w), `${at}: tag ${t.w} not in line`).toBe(true);
          expect(NIKUD.test(t.w), `${at}: tag ${t.w} lacks nikud`).toBe(true);
        }
      }
      expect(storyRoots(s).length, `${s.id}: too few roots`).toBeGreaterThanOrEqual(4);
    }
  });

  it("questions are well-formed", () => {
    for (const s of STORIES) {
      expect(s.qs.length, s.id).toBeGreaterThanOrEqual(2);
      for (const q of s.qs) {
        expect(q.opts.length, `${s.id}: ${q.q}`).toBeGreaterThanOrEqual(3);
        expect(new Set(q.opts).size, `${s.id}: duplicate options`).toBe(q.opts.length);
        expect(q.a >= 0 && q.a < q.opts.length, `${s.id}: answer index`).toBe(true);
      }
    }
  });
});
