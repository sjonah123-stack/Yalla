import { describe, expect, it } from "vitest";
import { ROOTS } from "../data/roots";
import { defaultProgress } from "./storage";
import { newRootState } from "./srs";
import { dailyModes, dailyRootId, ensureDailyRoot, pickDailyRoot } from "./daily";
import { makeQuestion } from "./quiz";

const day = "2026-09-22";
const seenAll = () => ({
  ...defaultProgress(),
  roots: Object.fromEntries(
    ROOTS.slice(0, 30).map((r) => [r.r, { ...newRootState(), ok: 1, reps: 1, ivl: 1 }]),
  ),
});

describe("root of the day", () => {
  it("needs a seen root", () => {
    expect(pickDailyRoot(ROOTS, defaultProgress(), day)).toBeNull();
    expect(ensureDailyRoot(ROOTS, defaultProgress(), day, 1).quests).toEqual({});
  });
  it("is stored once and stays put when mastery changes", () => {
    const p = ensureDailyRoot(ROOTS, seenAll(), day, 5);
    const id = dailyRootId(p, day)!;
    expect(id).toBeTruthy();
    const moved = { ...p, roots: { ...p.roots, [id]: { ...p.roots[id], ivl: 30, reps: 5 } } };
    expect(ensureDailyRoot(ROOTS, moved, day, 6)).toBe(moved);
    expect(dailyRootId(moved, day)).toBe(id);
  });
  it("the earliest stamp wins after a merge of two choices", () => {
    const quests = { [`${day}:root:B`]: 9, [`${day}:root:A`]: 4 };
    expect(dailyRootId({ quests }, day)).toBe("A");
  });
  it("modes include discovery when a family member is unknown, and every mode builds", () => {
    const root = ROOTS.find((r) => r.words.length >= 3)!;
    const modes = dailyModes(root, defaultProgress(), new Set());
    expect(modes[1]).toBe("guessWord");
    for (const m of modes) expect(makeQuestion(root, ROOTS, m).root).toBe(root);
    const q = makeQuestion(root, ROOTS, "guessWord", new Set());
    expect(q.opts!.filter((o) => o.ok)).toHaveLength(1);
    expect(new Set(q.opts!.map((o) => o.label)).size).toBe(q.opts!.length);
  });
});
