import { create } from "zustand";
import type { Progress, RootState, Settings, UnitId } from "../types";
import { ROOTS } from "../data/roots";
import { applyAnswer, dayKey, touchStreak } from "../lib/srs";
import { GOLD_SCORE, memorizedCount, newlyCompleted } from "../lib/course";
import { applyPlacement, type PlacementAnswer } from "../lib/placement";
import {
  applySessionEnd,
  GEM_PLACEMENT,
  settle,
  type Receipt,
  type SessionEnd,
} from "../lib/rewards";
import {
  defaultProgress,
  loadLocal,
  pruneHistory,
  pushRemote,
  saveLocal,
  type SyncStatus,
} from "../lib/storage";
import { COURSE } from "./course";

interface ProgressStore {
  p: Progress;
  sync: SyncStatus;
  /** Replace the whole record (after remote merge). */
  adopt: (p: Progress) => void;
  setSync: (s: SyncStatus) => void;
  setSettings: (patch: Partial<Settings>) => void;
  toggleCat: (cat: string) => void;
  setLastUnit: (id: UnitId) => void;
  /** Record an answer: SRS update, history, xp, streak, lazy unit completion. */
  recordAnswer: (id: string, correct: boolean, first: boolean, xp: number) => RootState;
  /** Best test score for a unit; returns true when this run turned it gold. */
  recordTest: (unit: UnitId, score: number) => boolean;
  /** Best Match time for a unit; returns true on a new record (XP awarded). */
  recordMatch: (unit: UnitId, ms: number) => boolean;
  /** Apply a finished placement; pays skipped-section chests and (first time) the placement bonus. */
  finishPlacement: (answers: readonly PlacementAnswer[]) => Receipt;
  /** Fold a finished or abandoned session into counters, gems and seals. */
  recordSessionEnd: (end: SessionEnd) => Receipt;
  /** Stamp onboardedAt once. */
  markOnboarded: () => void;
  reset: () => void;
}

const MATCH_RECORD_XP = 15;

function persist(p: Progress, set: (s: Partial<ProgressStore>) => void): Progress {
  const next = pruneHistory({ ...p, updatedAt: Date.now() });
  saveLocal(next);
  pushRemote(next).then((s) => set({ sync: s }));
  return next;
}

/** Stamp completedAt on units that just became all-memorized, and today's memorized count. */
function reconcile(p: Progress, now: number): Progress {
  const fresh = newlyCompleted(COURSE, p);
  const units = { ...p.units };
  for (const u of fresh) units[u.id] = { ...(units[u.id] ?? {}), completedAt: now };
  const day = dayKey();
  const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }), mem: memorizedCount(ROOTS, p) };
  return { ...p, units, history: { ...p.history, [day]: h } };
}

export const useProgress = create<ProgressStore>((set, get) => ({
  p: loadLocal(),
  sync: "local",
  adopt: (p) => {
    saveLocal(p);
    set({ p });
  },
  setSync: (sync) => set({ sync }),
  setSettings: (patch) =>
    set({ p: persist({ ...get().p, settings: { ...get().p.settings, ...patch } }, set) }),
  toggleCat: (cat) => {
    const cats = get().p.settings.cats.slice();
    const i = cats.indexOf(cat);
    if (i >= 0) cats.splice(i, 1);
    else cats.push(cat);
    get().setSettings({ cats });
  },
  setLastUnit: (lastUnit) => {
    if (get().p.lastUnit !== lastUnit) set({ p: persist({ ...get().p, lastUnit }, set) });
  },
  recordAnswer: (id, correct, first, xp) => {
    const p = get().p;
    const now = Date.now();
    const st = applyAnswer(p.roots[id], correct, first, now);
    const day = dayKey();
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    if (correct) h.ok++;
    else h.bad++;
    h.xp += xp;
    let streak = p.streak;
    let lastPlay = p.lastPlay;
    if (correct) ({ streak, lastPlay } = touchStreak(p.streak, p.lastPlay));
    const next = reconcile(
      {
        ...p,
        xp: p.xp + xp,
        streak,
        lastPlay,
        roots: { ...p.roots, [id]: st },
        history: { ...p.history, [day]: h },
      },
      now,
    );
    set({ p: persist(next, set) });
    return st;
  },
  recordTest: (unit, score) => {
    const p = get().p;
    const rec = { ...(p.units[unit] ?? {}) };
    const wasGold = (rec.testBest ?? 0) >= GOLD_SCORE;
    rec.testBest = Math.max(rec.testBest ?? 0, score);
    if (score >= GOLD_SCORE && !rec.testPassedAt) rec.testPassedAt = Date.now();
    set({ p: persist({ ...p, units: { ...p.units, [unit]: rec } }, set) });
    return !wasGold && score >= GOLD_SCORE;
  },
  recordMatch: (unit, ms) => {
    const p = get().p;
    const rec = { ...(p.units[unit] ?? {}) };
    const record = rec.matchBestMs === undefined || ms < rec.matchBestMs;
    if (!record) return false;
    rec.matchBestMs = ms;
    const day = dayKey();
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    h.xp += MATCH_RECORD_XP;
    set({
      p: persist(
        {
          ...p,
          xp: p.xp + MATCH_RECORD_XP,
          units: { ...p.units, [unit]: rec },
          history: { ...p.history, [day]: h },
        },
        set,
      ),
    });
    return true;
  },
  finishPlacement: (answers) => {
    const prev = get().p;
    const now = Date.now();
    const placed = reconcile(applyPlacement(COURSE, prev, answers, now), now);
    const { p, receipt } = settle(
      COURSE,
      placed,
      now,
      prev.placement === null ? { placement: GEM_PLACEMENT } : {},
    );
    set({ p: persist(p, set) });
    return receipt;
  },
  recordSessionEnd: (end) => {
    const { p, receipt } = applySessionEnd(COURSE, get().p, end, Date.now());
    set({ p: persist(p, set) });
    return receipt;
  },
  markOnboarded: () => {
    const p = get().p;
    if (p.onboardedAt === null) set({ p: persist({ ...p, onboardedAt: Date.now() }, set) });
  },
  reset: () => {
    set({ p: persist(defaultProgress(), set) });
  },
}));

/** Selector helpers. */
export const useSettings = () => useProgress((s) => s.p.settings);
export const useRootState = (id: string) => useProgress((s) => s.p.roots[id]);
