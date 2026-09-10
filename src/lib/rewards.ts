import type { Progress, SealId, UnitId } from "../types";
import { SECTION_BY_ID } from "../data/course";
import { memorizedCount, type Course } from "./course";
import { level, seen } from "./srs";

// ---------- Gems ----------
export const GEM_BASE = 15;
export const GEM_PER_CORRECT = 3;
export const GEM_PERFECT = 20;
export const GEM_UNIT_CHEST = 50;
export const GEM_SECTION_CHEST = 50;
export const GEM_PLACEMENT = 40;
/** A speed round pays per correct answer up to this many. */
export const GEM_SPEED_CAP = 20;

// ---------- Seals ----------
export interface Seal {
  id: SealId;
  /** Hebrew letter shown on the seal. */
  letter: string;
  name: string;
  /** One line: how to earn it. */
  hint: string;
  test: (p: Progress, course: Course) => boolean;
}

const allRoots = (course: Course) => course.units.flatMap((u) => u.roots);

const sectionDone = (sectionId: string, p: Progress): boolean => {
  const units = SECTION_BY_ID[sectionId]?.units ?? [];
  return units.length > 0 && units.every((id) => !!p.units[id]?.completedAt);
};

export const SEALS: readonly Seal[] = [
  {
    id: "first-root",
    letter: "א",
    name: "First root",
    hint: "Answer a question on any root.",
    test: (p) => Object.values(p.roots).some((st) => seen(st)),
  },
  {
    id: "ten-memorized",
    letter: "ב",
    name: "Ten roots",
    hint: "Memorize ten roots.",
    test: (p, course) => memorizedCount(allRoots(course), p) >= 10,
  },
  {
    id: "first-unit",
    letter: "ג",
    name: "First unit",
    hint: "Complete any unit.",
    test: (p) => Object.values(p.units).some((rec) => !!rec.completedAt),
  },
  {
    id: "speech-done",
    letter: "ד",
    name: "Speech master",
    hint: "Complete every Speech unit.",
    test: (p) => sectionDone("speech", p),
  },
  {
    id: "combo-5",
    letter: "ה",
    name: "Combo ×5",
    hint: "Answer five in a row correctly in one session.",
    test: (p) => p.bestCombo >= 5,
  },
  {
    id: "streak-3",
    letter: "ו",
    name: "3-day streak",
    hint: "Play three days in a row.",
    test: (p) => p.streak >= 3,
  },
  {
    id: "xp-500",
    letter: "ז",
    name: "500 XP",
    hint: "Earn 500 XP.",
    test: (p) => p.xp >= 500,
  },
  {
    id: "perfect-lesson",
    letter: "ח",
    name: "Perfect lesson",
    hint: "Finish a lesson or practice with no misses.",
    test: (p) => p.perfectLessons >= 1,
  },
  {
    id: "typist",
    letter: "ט",
    name: "Typist",
    hint: "Type five roots correctly.",
    test: (p) => p.typedOk >= 5,
  },
  {
    id: "movement-done",
    letter: "י",
    name: "Movement master",
    hint: "Complete every Movement unit.",
    test: (p) => sectionDone("movement", p),
  },
  {
    id: "gems-300",
    letter: "כ",
    name: "Gem hoarder",
    hint: "Collect 300 gems.",
    test: (p) => p.gems >= 300,
  },
  {
    id: "level-5",
    letter: "ל",
    name: "Level 5",
    hint: "Reach level 5 (1600 XP).",
    test: (p) => level(p.xp) >= 5,
  },
  {
    id: "speed-20",
    letter: "מ",
    name: "Speed demon",
    hint: "Get 20 right in one speed round.",
    test: (p) => Object.values(p.history).some((h) => (h.speedBest ?? 0) >= 20),
  },
];

export const SEAL_IDS: readonly SealId[] = SEALS.map((s) => s.id);
export const SEAL_BY_ID: Record<SealId, Seal> = Object.fromEntries(
  SEALS.map((s) => [s.id, s]),
) as Record<SealId, Seal>;

// ---------- Session end ----------
export interface SessionEnd {
  kind: "lesson" | "practice" | "test" | "speed";
  ok: number;
  bad: number;
  /** Best combo this session. */
  best: number;
  /** Correct typeRoot answers this session. */
  typedOk: number;
  /** False when the learner quit early. */
  completed: boolean;
}

export interface Receipt {
  /** Total gems added. */
  gems: number;
  parts: {
    base: number;
    correct: number;
    perfect: number;
    units: number;
    sections: number;
    placement: number;
  };
  unitChests: UnitId[];
  sectionChests: string[];
  newSeals: SealId[];
}

export const isPerfect = (end: SessionEnd): boolean => end.completed && end.ok > 0 && end.bad === 0;

/** Gems for the session itself (tests pay nothing; chests are separate). */
export function sessionGems(end: SessionEnd): { base: number; correct: number; perfect: number } {
  if (end.kind === "test" || end.ok + end.bad === 0) return { base: 0, correct: 0, perfect: 0 };
  // Speed: the base only if the timer ran out, per-correct capped, never a perfect bonus.
  if (end.kind === "speed")
    return {
      base: end.completed ? GEM_BASE : 0,
      correct: GEM_PER_CORRECT * Math.min(end.ok, GEM_SPEED_CAP),
      perfect: 0,
    };
  return {
    base: GEM_BASE,
    correct: GEM_PER_CORRECT * end.ok,
    perfect: isPerfect(end) ? GEM_PERFECT : 0,
  };
}

/**
 * Chests earned but not yet paid: completed units and fully completed sections.
 * Units skipped via the placement test never pay, and a section pays only once every one of its
 * units was earned by playing — testing out of a section is its own reward.
 */
export function pendingChests(
  course: Course,
  p: Progress,
): { units: UnitId[]; sections: string[] } {
  const units: UnitId[] = [];
  for (const u of course.units) {
    const rec = p.units[u.id];
    if (rec?.completedAt && !rec.chestAt && !rec.placed) units.push(u.id);
  }
  const sections: string[] = [];
  for (const s of course.sections) {
    if (p.sectionChests[s.id]) continue;
    const recs = s.units.map((id) => p.units[id]);
    if (recs.length > 0 && recs.every((r) => !!r?.completedAt && !r.placed)) sections.push(s.id);
  }
  return { units, sections };
}

/** Seals newly earned by `after` that `before` lacked. */
export function newSeals(before: Progress, after: Progress): SealId[] {
  return SEAL_IDS.filter((id) => after.seals[id] !== undefined && before.seals[id] === undefined);
}

/** Stamp any seal whose test now passes. Seals are sticky: never removed. */
export function awardSeals(
  course: Course,
  p: Progress,
  now: number,
): { p: Progress; earned: SealId[] } {
  const earned: SealId[] = [];
  let seals = p.seals;
  for (const seal of SEALS) {
    if (seals[seal.id] !== undefined) continue;
    if (!seal.test(p, course)) continue;
    if (seals === p.seals) seals = { ...seals };
    seals[seal.id] = now;
    earned.push(seal.id);
  }
  return earned.length ? { p: { ...p, seals }, earned } : { p, earned };
}

const emptyParts = (): Receipt["parts"] => ({
  base: 0,
  correct: 0,
  perfect: 0,
  units: 0,
  sections: 0,
  placement: 0,
});

/**
 * Pay out pending chests plus any `extra` parts, apply the gems, then award seals
 * (so a gem threshold crossed by this payout fires in the same call).
 */
export function settle(
  course: Course,
  p: Progress,
  now: number,
  extra: Partial<Receipt["parts"]> = {},
): { p: Progress; receipt: Receipt } {
  const pending = pendingChests(course, p);
  const parts: Receipt["parts"] = { ...emptyParts(), ...extra };
  parts.units += pending.units.length * GEM_UNIT_CHEST;
  parts.sections += pending.sections.length * GEM_SECTION_CHEST;

  let next = p;
  if (pending.units.length) {
    const units = { ...p.units };
    for (const id of pending.units) units[id] = { ...units[id], chestAt: now };
    next = { ...next, units };
  }
  if (pending.sections.length) {
    const sectionChests = { ...p.sectionChests };
    for (const id of pending.sections) sectionChests[id] = now;
    next = { ...next, sectionChests };
  }
  const gems =
    parts.base + parts.correct + parts.perfect + parts.units + parts.sections + parts.placement;
  if (gems) next = { ...next, gems: next.gems + gems };

  const awarded = awardSeals(course, next, now);
  return {
    p: awarded.p,
    receipt: {
      gems,
      parts,
      unitChests: pending.units,
      sectionChests: pending.sections,
      newSeals: awarded.earned,
    },
  };
}

/** Fold a finished (or abandoned) session into progress: counters, then gems and seals. */
export function applySessionEnd(
  course: Course,
  p: Progress,
  end: SessionEnd,
  now: number,
): { p: Progress; receipt: Receipt } {
  const perfect = isPerfect(end) && (end.kind === "lesson" || end.kind === "practice");
  const next: Progress = {
    ...p,
    bestCombo: Math.max(p.bestCombo, end.best),
    typedOk: p.typedOk + end.typedOk,
    perfectLessons: p.perfectLessons + (perfect ? 1 : 0),
  };
  return settle(course, next, now, sessionGems(end));
}
