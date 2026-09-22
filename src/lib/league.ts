import type { LeagueWeek, Progress } from "../types";
import { seeded } from "./rng";
import { dayKey, shiftDay, DAY } from "./srs";

// ---------- Weekly league against ghosts ----------
//
// A week runs Monday to Sunday (local). Rivals are generated from a seed of (week, tier) and
// scaled to the learner's own recent weekly XP, so the league is always a close race; one rival
// is "You, last week", pacing exactly like the learner did seven days earlier. Finished weeks
// are settled lazily and stored in `Progress.league`, which drives the tier.

export const TIERS = [
  { name: "Clay", he: "חֶרֶס" },
  { name: "Bronze", he: "נְחֹשֶׁת" },
  { name: "Silver", he: "כֶּסֶף" },
  { name: "Gold", he: "זָהָב" },
  { name: "Diamond", he: "יַהֲלוֹם" },
] as const;
export const RIVALS = 20;
/** Top this many promote; bottom this many demote. */
export const MOVE = 4;
/** Weekly XP a rival at factor 1 earns, by tier (blended with the learner's own average). */
const TIER_BASE = [150, 300, 500, 800, 1200];
/** Gems for a promotion, × the new tier. */
export const PROMO_GEMS = 20;

const NAMES = [
  "Noa",
  "Itai",
  "Maya",
  "Omer",
  "Tamar",
  "Yoni",
  "Shira",
  "Eitan",
  "Lior",
  "Avigail",
  "Ido",
  "Hila",
  "Amit",
  "Roni",
  "Gal",
  "Yael",
  "Nadav",
  "Michal",
  "Ariel",
  "Dana",
  "Uri",
  "Talia",
  "Ofir",
  "Neta",
  "Boaz",
  "Keren",
  "Asaf",
  "Liat",
  "Guy",
  "Efrat",
  "Doron",
  "Sivan",
  "Yarden",
  "Adi",
  "Tomer",
  "Inbal",
  "Ron",
  "Hadas",
  "Erez",
  "Orly",
];

/** Monday of the week containing `d`, as a day key. */
export function weekKey(d: Date = new Date()): string {
  const back = (d.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  return dayKey(shiftDay(d, -back));
}

/** The 7 day keys of the week starting on Monday `wk`. */
export function weekDays(wk: string): string[] {
  const [y, m, dd] = wk.split("-").map(Number);
  const mon = new Date(y, m - 1, dd, 12);
  return Array.from({ length: 7 }, (_, i) => dayKey(shiftDay(mon, i)));
}

export const weekXp = (p: Pick<Progress, "history">, wk: string): number =>
  weekDays(wk).reduce((t, d) => t + (p.history[d]?.xp ?? 0), 0);

/** The week before `wk`. */
export const prevWeek = (wk: string): string => {
  const [y, m, d] = wk.split("-").map(Number);
  return dayKey(shiftDay(new Date(y, m - 1, d, 12), -7));
};

/** Tier the learner plays in during week `wk` (from the latest settled week before it). */
export function tierFor(p: Pick<Progress, "league">, wk: string): number {
  const before = Object.keys(p.league)
    .filter((w) => w < wk)
    .sort();
  const last = before[before.length - 1];
  return last ? p.league[last].next : 0;
}

export interface Rival {
  name: string;
  /** XP at the end of the week. */
  total: number;
  /** Cumulative share of `total` by the end of each day (Mon…Sun), ending at 1. */
  pace: number[];
  ghost?: boolean;
}

/** Average weekly XP over the three weeks before `wk` that had any XP. */
function recentAverage(p: Pick<Progress, "history">, wk: string): number | null {
  const xs: number[] = [];
  let w = wk;
  for (let i = 0; i < 6 && xs.length < 3; i++) {
    w = prevWeek(w);
    const x = weekXp(p, w);
    if (x > 0) xs.push(x);
  }
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function rivals(p: Pick<Progress, "history" | "league">, wk: string): Rival[] {
  const tier = tierFor(p, wk);
  const rnd = seeded(`league:${wk}:${tier}`);
  const avg = recentAverage(p, wk);
  const base = avg === null ? TIER_BASE[tier] : 0.5 * TIER_BASE[tier] + 0.5 * avg;
  const used = new Set<number>();
  const out: Rival[] = [];
  for (let i = 0; i < RIVALS; i++) {
    let n = Math.floor(rnd() * NAMES.length);
    while (used.has(n)) n = (n + 1) % NAMES.length;
    used.add(n);
    // Factors spread 0.25 … 1.9, denser in the middle: a close race around the learner.
    const f = 0.25 + 1.65 * ((rnd() + rnd()) / 2);
    const daily = Array.from({ length: 7 }, () => (rnd() < 0.2 ? 0 : 0.4 + rnd()));
    const sum = daily.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    const pace = daily.map((x) => (acc += x / sum));
    pace[6] = 1;
    out.push({ name: NAMES[n], total: Math.round(base * f), pace });
  }
  // The ghost: last week's you, day by day.
  const last = weekDays(prevWeek(wk)).map((d) => p.history[d]?.xp ?? 0);
  const total = last.reduce((a, b) => a + b, 0);
  let acc = 0;
  out.push({
    name: "You, last week",
    total,
    pace: last.map((x) => (total ? (acc += x) / total : 1)),
    ghost: true,
  });
  return out;
}

/** A rival's XP at time `now` within week `wk` (linear within the current day). */
export function rivalXp(r: Rival, wk: string, now: number): number {
  const days = weekDays(wk);
  const [y, m, d] = wk.split("-").map(Number);
  const start = new Date(y, m - 1, d).getTime();
  const t = (now - start) / DAY;
  if (t <= 0) return 0;
  if (t >= 7 || dayKey(new Date(now)) > days[6]) return r.total;
  const i = Math.floor(t);
  const prev = i > 0 ? r.pace[i - 1] : 0;
  const frac = prev + (r.pace[i] - prev) * (t - i);
  return Math.round(r.total * frac);
}

export interface Standing {
  name: string;
  xp: number;
  me?: boolean;
  ghost?: boolean;
}

/** The table for week `wk` at `now`, best first. Ties go to the learner. */
export function standings(
  p: Pick<Progress, "history" | "league">,
  wk: string,
  now: number,
): Standing[] {
  const table: Standing[] = rivals(p, wk).map((r) => ({
    name: r.name,
    xp: rivalXp(r, wk, now),
    ghost: r.ghost,
  }));
  table.push({ name: "You", xp: weekXp(p, wk), me: true });
  return table.sort((a, b) => b.xp - a.xp || (a.me ? -1 : b.me ? 1 : 0));
}

export const zone = (rank: number, size: number, tier: number): "up" | "down" | "stay" =>
  rank <= MOVE && tier < TIERS.length - 1 ? "up" : rank > size - MOVE && tier > 0 ? "down" : "stay";

/**
 * Settle every finished week since the last settled one (up to 8 back), in order. Weeks with
 * no XP at all before the learner's first league week are skipped. Promotions pay gems.
 */
export function settleLeague(
  p: Progress,
  now: number,
): { p: Progress; settled: { week: string; result: LeagueWeek }[] } {
  const cur = weekKey(new Date(now));
  const weeks: string[] = [];
  let w = prevWeek(cur);
  for (let i = 0; i < 8; i++) {
    if (p.league[w]) break;
    weeks.push(w);
    w = prevWeek(w);
  }
  weeks.reverse();
  const hasAny = Object.keys(p.league).length > 0;
  let next = p;
  const settled: { week: string; result: LeagueWeek }[] = [];
  for (const wk of weeks) {
    const xp = weekXp(next, wk);
    if (!hasAny && !settled.length && xp === 0) continue;
    const tier = tierFor(next, wk);
    const end = new Date(weekDays(wk)[6] + "T23:59:59").getTime();
    const table = standings(next, wk, end);
    const rank = table.findIndex((s) => s.me) + 1;
    const z = zone(rank, table.length, tier);
    const result: LeagueWeek = {
      tier,
      rank,
      next: z === "up" ? tier + 1 : z === "down" ? tier - 1 : tier,
      xp,
    };
    next = { ...next, league: { ...next.league, [wk]: result } };
    if (z === "up") next = { ...next, gems: next.gems + PROMO_GEMS * result.next };
    settled.push({ week: wk, result });
  }
  return { p: next, settled };
}

/** Time left in the week, ms. */
export function weekLeft(now: number): number {
  const wk = weekKey(new Date(now));
  const [y, m, d] = wk.split("-").map(Number);
  return new Date(y, m - 1, d + 7).getTime() - now;
}
