import { describe, expect, it } from "vitest";
import type { Root } from "../types";
import { PHRASES } from "../data/phrases";
import { buildCourse } from "./course";
import { ROOTS } from "../data/roots";
import { SECTIONS } from "../data/course";
import {
  PHRASE_LESSON_UNITS,
  lessonPhrases,
  glossWords,
  makePhraseQuestion,
  mayOverlap,
  phraseMode,
  phraseRoot,
  unitTeachesPhrases,
  weavePhrases,
} from "./phraseLesson";

const COURSE = buildCourse(ROOTS, SECTIONS);
const KNOWN = { ok: 2, bad: 0 };

describe("which lessons carry phrases", () => {
  it("only units in the first six themes", () => {
    expect(COURSE.units[0].id).toBe("speech-1");
    expect(unitTeachesPhrases(COURSE, "speech-1")).toBe(true);
    expect(unitTeachesPhrases(COURSE, COURSE.units[PHRASE_LESSON_UNITS - 1].id)).toBe(true);
    expect(unitTeachesPhrases(COURSE, COURSE.units[PHRASE_LESSON_UNITS].id)).toBe(false);
    // The first six themes are exactly the phrase units.
    const six = new Set(SECTIONS.slice(0, 6).map((s) => s.id));
    for (const u of COURSE.units)
      expect(unitTeachesPhrases(COURSE, u.id), u.id).toBe(six.has(u.section.id));
  });
  it("teaches the most common phrases not yet known, a missed one before a new one", () => {
    const first = lessonPhrases(COURSE, "speech-1", { words: {} }, PHRASES);
    expect(first.map((x) => x.rank)).toEqual([1, 2]);
    const words = { [PHRASES[0].h]: KNOWN, [PHRASES[1].h]: { ok: 1, bad: 1 } };
    expect(lessonPhrases(COURSE, "speech-1", { words }, PHRASES).map((x) => x.rank)).toEqual([
      2, 3,
    ]);
    expect(
      lessonPhrases(COURSE, COURSE.units[PHRASE_LESSON_UNITS].id, { words: {} }, PHRASES),
    ).toEqual([]);
    const all = Object.fromEntries(PHRASES.map((x) => [x.h, KNOWN]));
    expect(lessonPhrases(COURSE, "speech-1", { words: all }, PHRASES)).toEqual([]);
  });
});

describe("weavePhrases", () => {
  const roots = COURSE.byId["speech-1"].roots.slice(0, 6);
  const twelve: Root[] = [...roots, ...roots];
  it("spreads two phrases over 16 slots, each met then used four slots later", () => {
    const { slots, phraseAt } = weavePhrases(twelve, PHRASES.slice(0, 2), "speech-1");
    expect(slots).toHaveLength(16);
    const at = phraseAt.flatMap((x, i) => (x ? [[i, x.id] as const] : []));
    expect(at).toEqual([
      [2, "ph-001"],
      [6, "ph-001"],
      [10, "ph-002"],
      [14, "ph-002"],
    ]);
    // Root slots keep their order; phrase slots hold a stand-in root with the phrase's id.
    expect(slots.filter((_, i) => !phraseAt[i])).toEqual(twelve);
    expect(slots[2].r).toBe("ph-001");
    expect(slots[2]).toBe(slots[6]);
  });
  it("leaves a lesson without phrases alone", () => {
    const { slots, phraseAt } = weavePhrases(twelve, [], "speech-1");
    expect(slots).toEqual(twelve);
    expect(phraseAt.every((x) => x === undefined)).toBe(true);
  });
});

describe("phrase questions", () => {
  const x = PHRASES[6]; // מָה נִשְׁמָע?
  it("offer four distinct meanings, one right, never the phrase's own twin", () => {
    for (let i = 0; i < 20; i++) {
      const q = makePhraseQuestion(x, PHRASES, "phraseMeaning", "speech-1");
      expect(q.phrase).toBe(x);
      expect(q.opts).toHaveLength(4);
      expect(q.opts!.filter((o) => o.ok)).toEqual([{ label: x.g, ok: true }]);
      expect(new Set(q.opts!.map((o) => o.label)).size).toBe(4);
      expect(q.root.r).toBe(x.id);
    }
  });
  it("never offers a wrong option that could also be right, for any phrase", () => {
    expect(
      mayOverlap(
        PHRASES[0],
        PHRASES.find((p) => p.g === "bye")!,
      ),
    ).toBe(true);
    const toda = PHRASES.find((p) => p.g === "thank you")!;
    const todaRaba = PHRASES.find((p) => p.g === "thank you very much")!;
    expect(mayOverlap(toda, todaRaba)).toBe(true);
    expect([...glossWords("thanks, just looking")]).toContain("thank");
    for (const p of PHRASES)
      for (const mode of ["phraseMeaning", "meaningPhrase"] as const) {
        const q = makePhraseQuestion(p, PHRASES, mode, "speech-1");
        expect(q.opts, p.id).toHaveLength(4);
        for (const o of q.opts!.filter((o) => !o.ok)) {
          const y = PHRASES.find((z) => (mode === "meaningPhrase" ? z.h : z.g) === o.label)!;
          expect(mayOverlap(p, y), `${p.id} ${p.g} vs ${y.g}`).toBe(false);
        }
      }
  });
  it("meaning → phrase offers phrases with their transliteration", () => {
    const q = makePhraseQuestion(x, PHRASES, "meaningPhrase", "speech-1");
    const right = q.opts!.find((o) => o.ok)!;
    expect(right).toEqual({ label: x.h, sub: x.t, ok: true });
    expect(new Set(q.opts!.map((o) => o.label)).size).toBe(4);
  });
  it("meets a phrase by reading it, then uses it by meaning or by ear", () => {
    expect(phraseMode(0, true)).toBe("phraseMeaning");
    expect(phraseMode(1, false, 0.1)).toBe("meaningPhrase");
    expect(phraseMode(1, true, 0.1)).toBe("hearPhrase");
    expect(phraseMode(1, true, 0.9)).toBe("meaningPhrase");
  });
  it("stand-in roots never collide with bank roots", () => {
    const ids = new Set(ROOTS.map((r) => r.r));
    for (const p of PHRASES) expect(ids.has(phraseRoot(p, "speech-1").r)).toBe(false);
  });
});
