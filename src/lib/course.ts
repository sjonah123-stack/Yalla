import type { Progress, Root, RootState, UnitId } from "../types";
import { SECTIONS, SECTION_BY_CAT, type SectionDef } from "../data/course";
import { mastery, seen } from "./srs";

// ---------- Root predicates ----------
/** Answered first-try correct at least once. */
export const learned = (st?: RootState): boolean => !!st && st.reps >= 1;
/** Interval ≥ 3 days: two first-try corrects on separate sessions, no lapse since. */
export const memorized = (st?: RootState): boolean => mastery(st) >= 2;

// ---------- Course structure ----------
export interface Unit {
  id: UnitId;
  section: SectionDef;
  /** Rank ascending. */
  roots: Root[];
  /** Position in the whole path (derived, never persisted). */
  pathIndex: number;
  indexInSection: number;
}

export interface Course {
  sections: readonly SectionDef[];
  /** Path order. */
  units: Unit[];
  byId: Record<string, Unit>;
  /** root id → unit id */
  unitOf: Record<string, UnitId>;
}

export function buildCourse(
  roots: readonly Root[],
  sections: readonly SectionDef[] = SECTIONS,
): Course {
  const byUnit = new Map<string, Root[]>();
  for (const r of roots) (byUnit.get(r.unit) ?? byUnit.set(r.unit, []).get(r.unit)!).push(r);
  const units: Unit[] = [];
  for (const section of sections) {
    section.units.forEach((id, indexInSection) => {
      const rs = (byUnit.get(id) ?? [])
        .slice()
        .sort((a, b) => a.rank - b.rank || a.r.localeCompare(b.r));
      units.push({ id, section, roots: rs, pathIndex: units.length, indexInSection });
    });
  }
  const byId = Object.fromEntries(units.map((u) => [u.id, u]));
  const unitOf = Object.fromEntries(roots.map((r) => [r.r, r.unit]));
  return { sections, units, byId, unitOf };
}

export const unitTitle = (u: Unit): string =>
  u.section.units.length > 1 ? `${u.section.title} ${u.indexInSection + 1}` : u.section.title;

const COLORS = ["var(--plum)", "var(--coral)", "var(--gold)", "var(--good)"];
export const sectionColor = (sectionId: string): string =>
  COLORS[
    Math.max(
      0,
      SECTIONS.findIndex((s) => s.id === sectionId),
    ) % COLORS.length
  ];
export const catColor = (cat: string): string => sectionColor(SECTION_BY_CAT[cat]?.id ?? "");

// ---------- Unit status ----------
export type UnitStatus = "locked" | "available" | "started" | "learned" | "complete" | "gold";
export const GOLD_SCORE = 90;

export const unitMemorized = (u: Unit, p: Progress): number =>
  u.roots.filter((r) => memorized(p.roots[r.r])).length;

/** Complete/gold-with-record, but fewer than 70% of its roots are memorized right now. */
export function unitCracked(u: Unit, p: Progress): boolean {
  const rec = p.units[u.id];
  if (!rec?.completedAt && !(rec?.testBest !== undefined && rec.testBest >= GOLD_SCORE))
    return false;
  return u.roots.length > 0 && unitMemorized(u, p) / u.roots.length < 0.7;
}

function finished(u: Unit, p: Progress): boolean {
  const rec = p.units[u.id];
  if (rec?.testBest !== undefined && rec.testBest >= GOLD_SCORE) return true;
  if (rec?.completedAt) return true;
  return u.roots.length > 0 && u.roots.every((r) => memorized(p.roots[r.r]));
}

export function unitUnlocked(u: Unit, course: Course, p: Progress): boolean {
  if (u.pathIndex === 0) return true;
  if (finished(u, p)) return true;
  if (u.roots.some((r) => seen(p.roots[r.r]))) return true;
  if (p.placement && course.byId[p.placement.startUnit]?.pathIndex >= u.pathIndex) return true;
  const prev = course.units[u.pathIndex - 1];
  return !!prev && finished(prev, p);
}

export function unitStatus(u: Unit, course: Course, p: Progress): UnitStatus {
  const rec = p.units[u.id];
  if (rec?.testBest !== undefined && rec.testBest >= GOLD_SCORE) return "gold";
  if (finished(u, p)) return "complete";
  if (!unitUnlocked(u, course, p)) return "locked";
  if (u.roots.length && u.roots.every((r) => learned(p.roots[r.r]))) return "learned";
  if (u.roots.some((r) => seen(p.roots[r.r]))) return "started";
  return "available";
}

const open = (s: UnitStatus) => s === "available" || s === "started" || s === "learned";

/** Where "Continue" goes: the last-played unit if still open, else the first open unit on the path. */
export function currentUnit(course: Course, p: Progress): Unit {
  const last = p.lastUnit ? course.byId[p.lastUnit] : undefined;
  if (last && open(unitStatus(last, course, p))) return last;
  const first = course.units.find((u) => open(unitStatus(u, course, p)));
  return first ?? course.units[course.units.length - 1];
}

/** The next unit that can be "tested out of": the first locked unit on the path. */
export function nextLockedUnit(course: Course, p: Progress): Unit | undefined {
  return course.units.find((u) => unitStatus(u, course, p) === "locked");
}

export const memorizedCount = (roots: readonly Root[], p: Progress): number =>
  roots.filter((r) => memorized(p.roots[r.r])).length;

export type SectionState = "locked" | "open" | "done";
export interface SectionSummary {
  section: SectionDef;
  units: Unit[];
  roots: Root[];
  memorized: number;
  /** 0–100 */
  pct: number;
  state: SectionState;
  isCurrent: boolean;
  chestPaid: boolean;
}

/** One theme's standing on the path (drives both the theme card and the index chip). */
export function sectionSummary(sec: SectionDef, course: Course, p: Progress): SectionSummary {
  const units = course.units.filter((u) => u.section.id === sec.id);
  const roots = units.flatMap((u) => u.roots);
  const k = memorizedCount(roots, p);
  const sts = units.map((u) => unitStatus(u, course, p));
  const state: SectionState = sts.every((s) => s === "complete" || s === "gold")
    ? "done"
    : sts.every((s) => s === "locked")
      ? "locked"
      : "open";
  return {
    section: sec,
    units,
    roots,
    memorized: k,
    pct: roots.length ? Math.round((k / roots.length) * 100) : 0,
    state,
    isCurrent: currentUnit(course, p).section.id === sec.id,
    chestPaid: !!p.sectionChests[sec.id],
  };
}

/** Units whose roots are all memorized but have no completedAt yet (to be stamped lazily). */
export function newlyCompleted(course: Course, p: Progress): Unit[] {
  return course.units.filter(
    (u) =>
      !p.units[u.id]?.completedAt &&
      u.roots.length > 0 &&
      u.roots.every((r) => memorized(p.roots[r.r])),
  );
}
