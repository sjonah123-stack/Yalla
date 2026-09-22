import { describe, expect, it } from "vitest";
import { defaultProgress } from "./storage";
import type { Progress } from "../types";
import {
  PROMO_GEMS,
  RIVALS,
  prevWeek,
  rivalXp,
  rivals,
  settleLeague,
  standings,
  tierFor,
  weekDays,
  weekKey,
  weekXp,
  zone,
} from "./league";

// Mon 2026-09-21 … Sun 2026-09-27
const wk = "2026-09-21";
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe("weeks", () => {
  it("start on Monday, local", () => {
    expect(weekKey(new Date(2026, 8, 21, 0, 1))).toBe(wk);
    expect(weekKey(new Date(2026, 8, 27, 23, 59))).toBe(wk);
    expect(weekKey(new Date(2026, 8, 28, 0, 1))).toBe("2026-09-28");
    expect(weekDays(wk)).toHaveLength(7);
    expect(weekDays(wk)[6]).toBe("2026-09-27");
    expect(prevWeek(wk)).toBe("2026-09-14");
    expect(prevWeek("2026-11-02")).toBe("2026-10-26"); // across DST
  });
});

describe("rivals", () => {
  it("are deterministic, 20 plus the ghost, and pace up to their total", () => {
    const p = defaultProgress();
    const r = rivals(p, wk);
    expect(r).toHaveLength(RIVALS + 1);
    expect(rivals(p, wk)).toEqual(r);
    expect(new Set(r.map((x) => x.name)).size).toBe(r.length);
    const x = r[0];
    expect(rivalXp(x, wk, at(2026, 9, 20))).toBe(0);
    expect(rivalXp(x, wk, at(2026, 9, 24))).toBeLessThanOrEqual(x.total);
    expect(rivalXp(x, wk, at(2026, 9, 29))).toBe(x.total);
  });
  it("the ghost replays last week's XP day by day", () => {
    const p: Progress = {
      ...defaultProgress(),
      history: {
        "2026-09-14": { ok: 1, bad: 0, xp: 100 },
        "2026-09-16": { ok: 1, bad: 0, xp: 50 },
      },
    };
    const g = rivals(p, wk).find((x) => x.ghost)!;
    expect(g.total).toBe(150);
    expect(rivalXp(g, wk, at(2026, 9, 22, 0))).toBe(100);
    expect(rivalXp(g, wk, at(2026, 9, 28))).toBe(150);
  });
  it("scale with the learner's recent weeks", () => {
    const lazy = rivals(defaultProgress(), wk).reduce((t, r) => t + r.total, 0);
    const hist: Progress["history"] = {};
    for (const w of ["2026-09-14", "2026-09-07", "2026-08-31"])
      hist[w] = { ok: 0, bad: 0, xp: 3000 };
    const keen = rivals({ ...defaultProgress(), history: hist }, wk)
      .filter((r) => !r.ghost)
      .reduce((t, r) => t + r.total, 0);
    expect(keen).toBeGreaterThan(lazy * 3);
  });
});

describe("standings and settling", () => {
  it("ranks the learner among rivals; ties go to the learner", () => {
    const p: Progress = {
      ...defaultProgress(),
      history: { "2026-09-22": { ok: 1, bad: 0, xp: 99999 } },
    };
    const t = standings(p, wk, at(2026, 9, 23));
    expect(t[0].me).toBe(true);
    expect(weekXp(p, wk)).toBe(99999);
  });
  it("zones: top 4 up, bottom 4 down, clamped at the ends", () => {
    expect(zone(1, 22, 0)).toBe("up");
    expect(zone(4, 22, 2)).toBe("up");
    expect(zone(5, 22, 2)).toBe("stay");
    expect(zone(19, 22, 2)).toBe("down");
    expect(zone(19, 22, 0)).toBe("stay");
    expect(zone(1, 22, 4)).toBe("stay");
  });
  it("settles finished weeks once, promotes a big week and pays gems", () => {
    const p: Progress = {
      ...defaultProgress(),
      history: { "2026-09-15": { ok: 1, bad: 0, xp: 50000 } },
    };
    const { p: q, settled } = settleLeague(p, at(2026, 9, 23));
    expect(settled.map((s) => s.week)).toEqual(["2026-09-14"]);
    expect(q.league["2026-09-14"]).toMatchObject({ tier: 0, rank: 1, next: 1, xp: 50000 });
    expect(q.gems).toBe(PROMO_GEMS);
    expect(tierFor(q, wk)).toBe(1);
    expect(settleLeague(q, at(2026, 9, 24)).settled).toEqual([]);
  });
  it("skips empty weeks before the first league week, then counts idle weeks", () => {
    const empty = settleLeague(defaultProgress(), at(2026, 9, 23));
    expect(empty.settled).toEqual([]);
    const p: Progress = {
      ...defaultProgress(),
      league: { "2026-08-31": { tier: 2, rank: 3, next: 3, xp: 900 } },
    };
    const { p: q } = settleLeague(p, at(2026, 9, 23));
    expect(q.league["2026-09-07"]).toMatchObject({ tier: 3, next: 2 });
    expect(q.league["2026-09-14"]).toMatchObject({ tier: 2, next: 1 });
  });
});
