import type { DayStats, Progress, Root } from "../types";
import { DAY, dayKey, isDue, mastery, shiftDay } from "./srs";

export interface HeatCell {
  day: string;
  xp: number;
  ok: number;
  bad: number;
  /** 0 = future/empty, 1–4 intensity */
  level: number;
}

/** Trailing `weeks` of activity as columns of 7 (Sun..Sat), ending on today's week. */
export function heatmap(
  history: Record<string, DayStats>,
  weeks: number,
  today = new Date(),
): HeatCell[][] {
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // Saturday of this week
  const start = shiftDay(end, -(weeks * 7 - 1));
  const max = Math.max(1, ...Object.values(history).map((h) => h.xp));
  const cols: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = shiftDay(start, w * 7 + d);
      const key = dayKey(date);
      const h = history[key];
      const xp = h?.xp ?? 0;
      const level = !h || xp === 0 ? 0 : Math.min(4, 1 + Math.floor((xp / max) * 3.999));
      col.push({ day: key, xp, ok: h?.ok ?? 0, bad: h?.bad ?? 0, level });
    }
    cols.push(col);
  }
  return cols;
}

export interface TrendPoint {
  day: string;
  /** 0–1, or null if no answers that day */
  acc: number | null;
  total: number;
}

export function accuracyTrend(
  history: Record<string, DayStats>,
  days: number,
  today = new Date(),
): TrendPoint[] {
  const out: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(shiftDay(today, -i));
    const h = history[key];
    const total = (h?.ok ?? 0) + (h?.bad ?? 0);
    out.push({ day: key, acc: total ? h!.ok / total : null, total });
  }
  return out;
}

/** Count of roots at each mastery level 0–5. */
export function masteryDistribution(roots: readonly Root[], p: Progress): number[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  for (const r of roots) buckets[mastery(p.roots[r.r])]++;
  return buckets;
}

export interface ThemeStrength {
  cat: string;
  n: number;
  seen: number;
  /** average mastery 0–1 */
  strength: number;
}

export function themeStrength(roots: readonly Root[], p: Progress): ThemeStrength[] {
  const by = new Map<string, Root[]>();
  for (const r of roots) (by.get(r.cat) ?? by.set(r.cat, []).get(r.cat)!).push(r);
  return [...by.entries()]
    .map(([cat, rs]) => ({
      cat,
      n: rs.length,
      seen: rs.filter((r) => p.roots[r.r] && p.roots[r.r].ok + p.roots[r.r].bad > 0).length,
      strength: rs.reduce((a, r) => a + mastery(p.roots[r.r]), 0) / (rs.length * 5),
    }))
    .sort((a, b) => a.strength - b.strength);
}

/** Reviews falling due on each of the next `days` days (index 0 = today, includes overdue). */
export function upcomingReviews(
  roots: readonly Root[],
  p: Progress,
  days: number,
  now = Date.now(),
): number[] {
  const out = new Array(days).fill(0);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  for (const r of roots) {
    const st = p.roots[r.r];
    if (!st || st.reps === 0) continue;
    if (isDue(st, now)) {
      out[0]++;
      continue;
    }
    const i = Math.floor((st.due - startOfToday.getTime()) / DAY);
    if (i >= 0 && i < days) out[i]++;
  }
  return out;
}

export function totals(history: Record<string, DayStats>): {
  ok: number;
  bad: number;
  xp: number;
  days: number;
} {
  let ok = 0,
    bad = 0,
    xp = 0,
    days = 0;
  for (const h of Object.values(history)) {
    ok += h.ok;
    bad += h.bad;
    xp += h.xp;
    if (h.ok + h.bad > 0) days++;
  }
  return { ok, bad, xp, days };
}
