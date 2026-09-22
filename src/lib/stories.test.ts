import { describe, expect, it } from "vitest";
import { STORIES, storyRoots } from "../data/stories";
import { defaultProgress } from "./storage";
import { newRootState } from "./srs";
import { newStories, segmentLine, storyStates } from "./stories";

describe("story unlocks", () => {
  it("a fresh learner has nothing unlocked", () => {
    expect(storyStates(defaultProgress()).every((s) => !s.unlocked)).toBe(true);
    expect(newStories(defaultProgress())).toBe(0);
  });
  it("meeting every tagged root unlocks a story and floats it to the top", () => {
    if (!STORIES.length) return;
    const s = STORIES[0];
    const roots = Object.fromEntries(storyRoots(s).map((r) => [r, { ...newRootState(), ok: 1 }]));
    const p = { ...defaultProgress(), roots };
    const states = storyStates(p);
    expect(states[0].story.id).toBe(s.id);
    expect(states[0].unlocked).toBe(true);
    expect(newStories(p)).toBeGreaterThanOrEqual(1);
    const read = { ...p, stories: { [s.id]: { at: 1, best: 2 } } };
    expect(storyStates(read).find((x) => x.story.id === s.id)!.read).toBe(true);
  });
});

describe("segmentLine", () => {
  it("every tag of every story lands on its own span, and the pieces rebuild the line", () => {
    for (const s of STORIES)
      for (const l of s.lines) {
        const segs = segmentLine(l.he, l.tags);
        expect(segs.map((x) => x.text).join(""), `${s.id}: ${l.he}`).toBe(l.he);
        const hit = segs.filter((x) => x.tag !== undefined).map((x) => x.tag);
        expect(new Set(hit).size, `${s.id}: ${l.he}`).toBe(l.tags.length);
      }
  });
  it("prefers whole words and gives a repeated word a span each time", () => {
    // The first סֵפֶר sits inside וְסֵפֶר; whole words win, in reading order.
    const segs = segmentLine("וְסֵפֶר סֵפֶר וְעוֹד סֵפֶר", [
      { w: "סֵפֶר", r: "ספר" },
      { w: "סֵפֶר", r: "ספר" },
    ]);
    const tagged = segs.filter((x) => x.tag !== undefined);
    expect(tagged.map((x) => x.text)).toEqual(["סֵפֶר", "סֵפֶר"]);
    expect(segs[0].text).toBe("וְסֵפֶר ");
    expect(segs.at(-1)!.tag).toBe(1);
  });
});
