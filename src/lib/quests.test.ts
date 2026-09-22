import { describe, expect, it } from "vitest";
import { defaultProgress } from "./storage";
import type { Progress } from "../types";
import {
  QUEST_GEMS,
  bagKey,
  bagPrize,
  bagReady,
  claimQuest,
  dailyQuests,
  openQuestBag,
  questShekels,
  questViews,
} from "./quests";
import { freezesOwned } from "./shop";

const day = "2026-09-22";
const busy = (): Progress => ({
  ...defaultProgress(),
  history: {
    [day]: {
      ok: 60,
      bad: 0,
      xp: 200,
      sessions: 3,
      combo: 12,
      perfect: 1,
      speedBest: 20,
      listen: 300,
      collects: 1,
      daily: 1,
      stories: 1,
    },
  },
});

describe("daily quests", () => {
  it("are three distinct quests, stable per day, with one easy quest and no family repeats", () => {
    for (let i = 1; i <= 60; i++) {
      const k = `2026-10-${String((i % 28) + 1).padStart(2, "0")}`;
      const q = dailyQuests(k);
      expect(q).toHaveLength(3);
      expect(new Set(q.map((x) => x.id.split("-")[0])).size).toBe(3);
      expect(dailyQuests(k).map((x) => x.id)).toEqual(q.map((x) => x.id));
    }
    const all = new Set(
      Array.from(
        { length: 28 },
        (_, i) => dailyQuests(`2026-11-${String(i + 1).padStart(2, "0")}`)[1].id,
      ),
    );
    expect(all.size).toBeGreaterThan(3);
  });
  it("progress comes from the day's counters; claiming pays once", () => {
    const p = busy();
    const views = questViews(p, day);
    expect(views.every((v) => v.done && !v.claimed)).toBe(true);
    const id = views[0].def.id;
    const r = claimQuest(p, day, id, 400, 5)!;
    expect(r.gems).toBe(QUEST_GEMS);
    expect(r.shekels).toBe(questShekels(400));
    expect(r.p.gems).toBe(QUEST_GEMS);
    expect(r.p.shuk.earned).toBe(200);
    expect(claimQuest(r.p, day, id, 400, 6)).toBeNull();
  });
  it("an unfinished quest can't be claimed", () => {
    const p = defaultProgress();
    expect(claimQuest(p, day, dailyQuests(day)[0].id, 100, 1)).toBeNull();
  });
});

describe("lucky bag", () => {
  it("is ready only after all three claims, opens once", () => {
    let p = busy();
    expect(bagReady(p, day)).toBe(false);
    for (const q of dailyQuests(day)) p = claimQuest(p, day, q.id, 100, 1)!.p;
    expect(bagReady(p, day)).toBe(true);
    const o = openQuestBag(p, day, 100, 2)!;
    expect(o.p.quests[bagKey(day)]).toBe(2);
    expect(openQuestBag(o.p, day, 100, 3)).toBeNull();
  });
  it("prizes are deterministic by id and cover every kind", () => {
    expect(bagPrize("x", 100, 0)).toEqual(bagPrize("x", 100, 0));
    const kinds = new Set(Array.from({ length: 200 }, (_, i) => bagPrize(`b${i}`, 100, 0).kind));
    expect(kinds).toEqual(new Set(["shekels", "gems", "freeze", "rush"]));
  });
  it("a freeze prize becomes gems when two are held", () => {
    const ids = Array.from({ length: 200 }, (_, i) => `b${i}`).filter(
      (id) => bagPrize(id, 100, 0).kind === "freeze",
    );
    expect(bagPrize(ids[0], 100, 2)).toEqual({ kind: "gems", n: 40 });
  });
  it("a won freeze is keyed by the bag id, so a merge can't duplicate it", () => {
    let p = busy();
    for (const q of dailyQuests(day)) p = claimQuest(p, day, q.id, 100, 1)!.p;
    const o = openQuestBag(p, day, 100, 2)!;
    if (o.prize.kind === "freeze") expect(freezesOwned(o.p)).toBe(1);
    expect(Object.keys(o.p.purchases).every((k) => k.startsWith(bagKey(day)))).toBe(true);
  });
});
