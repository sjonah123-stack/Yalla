import { create } from "zustand";
import type {
  Accent,
  FlagReason,
  Mistake,
  Progress,
  RootState,
  Settings,
  ShopItem,
  UnitId,
} from "../types";
import { ROOTS } from "../data/roots";
import { applyAnswer, dayKey, touchStreak } from "../lib/srs";
import { GOLD_SCORE, memorizedCount, newlyCompleted } from "../lib/course";
import { applyPlacement, type PlacementAnswer } from "../lib/placement";
import {
  applySessionEnd,
  awardSeals,
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
import * as shuk from "../lib/shuk";
import {
  ACCENT_COST,
  BAG_COST,
  FREEZE_COST,
  RUSH_TOKEN_COST,
  RUSH_TOKEN_MIN,
  RUSH_TOKEN_MULT,
  addPurchase,
  applyFreezes,
  cantBuy,
  freezesOwned,
  purchaseId,
  repairStreak,
  type BuyError,
} from "../lib/shop";
import { applyPrize, bagPrize, claimQuest, openQuestBag, type Prize } from "../lib/quests";
import { settleLeague } from "../lib/league";
import type { LeagueWeek } from "../types";
import { ensureDailyRoot } from "../lib/daily";
import { addMistake } from "../lib/mistakes";

/** Shekels per hour right now. */
export const shukRate = (p: Progress, now = Date.now()): number =>
  shuk.incomeRate(shuk.stalls(ROOTS, p, now));

/** XP for finishing a story the first time, and per question right. */
export const STORY_XP = 20;
export const STORY_Q_XP = 5;
/** Shekels a first read pays (the market loves a regular). */
export const STORY_SHEKELS = 150;

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
  /** Best Family sort time for a unit; returns true on a new record (XP awarded). */
  recordFamilySort: (unit: UnitId, ms: number) => boolean;
  /** Today's best speed-round score; returns true when this run set it. Pays nothing. */
  recordSpeedBest: (score: number) => boolean;
  /** Flag a root for content review (content feedback). */
  flagRoot: (id: string, why: FlagReason, note?: string) => void;
  /** Clear a flag (kept as a tombstone so the clear survives a merge). */
  unflagRoot: (id: string) => void;
  /** Word-level exposure from a word-based question. */
  recordWord: (h: string, correct: boolean) => void;
  /** The first-run tour was dismissed. */
  markTour: () => void;
  /** Apply a finished placement; pays skipped-section chests and (first time) the placement bonus. */
  finishPlacement: (answers: readonly PlacementAnswer[]) => Receipt;
  /** Fold a finished or abandoned session into counters, gems and seals. */
  recordSessionEnd: (end: SessionEnd) => Receipt;
  /** Stamp onboardedAt once. */
  markOnboarded: () => void;
  /**
   * Daily housekeeping (app start, foreground, Home mount): streak freezes, league settling,
   * the root of the day, starting the Shuk clock. Persists only when something changed.
   */
  tick: () => { league: { week: string; result: LeagueWeek }[] };
  /** Collect the Shuk's pending income; returns the amount. */
  collectShuk: () => number;
  upgradeStall: (id: string) => boolean;
  buyPerk: (id: shuk.PerkId) => boolean;
  /** Gem shop. Returns the bag prize for a bag, true for other items, or the reason it failed. */
  buy: (item: ShopItem) => Prize | true | BuyError;
  setAccent: (a: Accent) => void;
  repairStreak: () => boolean;
  claimQuest: (id: string) => { gems: number; shekels: number } | null;
  openBag: () => Prize | null;
  recordMistake: (m: Mistake) => void;
  /** Seconds spent in listening mode. */
  recordListen: (sec: number) => void;
  /** A story read to the end with `right` of its questions correct; returns XP earned. */
  finishStory: (id: string, right: number) => { xp: number; shekels: number; first: boolean };
  reset: () => void;
  /** Forget this device's copy without touching the account (after sign-out). */
  wipeLocal: () => void;
}

const MATCH_RECORD_XP = 15;

function persist(p: Progress, set: (s: Partial<ProgressStore>) => void): Progress {
  const next = pruneHistory({ ...p, updatedAt: Date.now() });
  saveLocal(next);
  pushRemote(next).then((s) => set({ sync: s }));
  return next;
}

/** Min-wins best time for a unit tool; a new record pays a little XP (no gems, no seals). */
function bestTime(
  get: () => ProgressStore,
  set: (s: Partial<ProgressStore>) => void,
  unit: UnitId,
  key: "matchBestMs" | "sortBestMs",
  ms: number,
): boolean {
  const p = get().p;
  const rec = { ...(p.units[unit] ?? {}) };
  const prev = rec[key];
  if (prev !== undefined && ms >= prev) return false;
  rec[key] = ms;
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
    if (correct)
      ({ streak, lastPlay } = touchStreak(p.streak, p.lastPlay, new Date(now), p.frozenDays));
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
  recordMatch: (unit, ms) => bestTime(get, set, unit, "matchBestMs", ms),
  recordFamilySort: (unit, ms) => bestTime(get, set, unit, "sortBestMs", ms),
  recordSpeedBest: (score) => {
    if (score <= 0) return false;
    const p = get().p;
    const day = dayKey();
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    if ((h.speedBest ?? 0) >= score) return false;
    h.speedBest = score;
    set({ p: persist({ ...p, history: { ...p.history, [day]: h } }, set) });
    return true;
  },
  flagRoot: (id, why, note) => {
    const p = get().p;
    const flag = { at: Date.now(), why, ...(note?.trim() ? { note: note.trim() } : {}) };
    set({ p: persist({ ...p, flags: { ...p.flags, [id]: flag } }, set) });
  },
  recordWord: (h, correct) => {
    const p = get().p;
    const w = p.words[h] ?? { ok: 0, bad: 0 };
    const next = correct ? { ...w, ok: w.ok + 1 } : { ...w, bad: w.bad + 1 };
    set({ p: persist({ ...p, words: { ...p.words, [h]: next } }, set) });
  },
  markTour: () => {
    const p = get().p;
    if (p.tourAt === null) set({ p: persist({ ...p, tourAt: Date.now() }, set) });
  },
  unflagRoot: (id) => {
    const p = get().p;
    const f = p.flags[id];
    if (!f) return;
    set({ p: persist({ ...p, flags: { ...p.flags, [id]: { ...f, cleared: Date.now() } } }, set) });
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
  tick: () => {
    const p0 = get().p;
    const now = Date.now();
    let p = applyFreezes(p0, new Date(now));
    const league = settleLeague(p, now);
    p = league.p;
    p = ensureDailyRoot(ROOTS, p, dayKey(new Date(now)), now);
    // The Shuk's clock starts when its first stall opens — as a grand opening, with a full
    // storage window already waiting to be collected.
    if (!p.shuk.lastCollect && shukRate(p, now) > 0)
      p = { ...p, shuk: { ...p.shuk, lastCollect: now - shuk.storageMs(p.shuk) } };
    if (p !== p0) {
      const settled = awardSeals(COURSE, p, now); // a promotion's gems can cross a gem seal
      set({ p: persist(settled.p, set) });
    }
    return { league: league.settled };
  },
  collectShuk: () => {
    const p = get().p;
    const now = Date.now();
    const { s, got } = shuk.collect(ROOTS, p, now);
    let next: Progress = { ...p, shuk: s };
    if (got > 0) {
      const day = dayKey(new Date(now));
      const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
      h.collects = (h.collects ?? 0) + 1;
      next = awardSeals(COURSE, { ...next, history: { ...p.history, [day]: h } }, now).p;
    }
    set({ p: persist(next, set) });
    return got;
  },
  upgradeStall: (id) => {
    const p = get().p;
    const s = shuk.upgradeStall(p.shuk, id);
    if (!s) return false;
    set({ p: persist({ ...p, shuk: s }, set) });
    return true;
  },
  buyPerk: (id) => {
    const p = get().p;
    const s = shuk.buyPerk(p.shuk, id);
    if (!s) return false;
    set({ p: persist({ ...p, shuk: s }, set) });
    return true;
  },
  buy: (item) => {
    const p = get().p;
    const now = Date.now();
    const cost =
      item === "freeze"
        ? FREEZE_COST
        : item === "rush"
          ? RUSH_TOKEN_COST
          : item === "bag"
            ? BAG_COST
            : item === "repair"
              ? -1
              : ACCENT_COST;
    if (cost < 0) return get().repairStreak() ? true : "gems";
    const why = cantBuy(p, item, cost);
    if (why) return why;
    const id = purchaseId(now);
    let next = addPurchase(p, item, cost, now, id);
    let out: Prize | true = true;
    if (item === "rush")
      next = { ...next, shuk: shuk.startRush(next.shuk, RUSH_TOKEN_MULT, RUSH_TOKEN_MIN, now) };
    else if (item === "bag") {
      const prize = bagPrize(id, shukRate(next, now), freezesOwned(next));
      next = applyPrize(next, prize, id, now);
      out = prize;
    } else if (item.startsWith("accent:"))
      next = { ...next, settings: { ...next.settings, accent: item.slice(7) as Accent } };
    set({ p: persist(awardSeals(COURSE, next, now).p, set) });
    return out;
  },
  setAccent: (accent) => get().setSettings({ accent }),
  repairStreak: () => {
    const now = Date.now();
    const next = repairStreak(get().p, now);
    if (!next) return false;
    set({ p: persist(next, set) });
    return true;
  },
  claimQuest: (id) => {
    const p = get().p;
    const now = Date.now();
    const r = claimQuest(p, dayKey(new Date(now)), id, shukRate(p, now), now);
    if (!r) return null;
    set({ p: persist(awardSeals(COURSE, r.p, now).p, set) });
    return { gems: r.gems, shekels: r.shekels };
  },
  openBag: () => {
    const p = get().p;
    const now = Date.now();
    const r = openQuestBag(p, dayKey(new Date(now)), shukRate(p, now), now);
    if (!r) return null;
    set({ p: persist(awardSeals(COURSE, r.p, now).p, set) });
    return r.prize;
  },
  recordMistake: (m) => {
    const p = get().p;
    set({ p: persist({ ...p, mistakes: addMistake(p.mistakes, m) }, set) });
  },
  recordListen: (sec) => {
    if (sec <= 0) return;
    const p = get().p;
    const day = dayKey();
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    h.listen = (h.listen ?? 0) + Math.round(sec);
    set({ p: persist({ ...p, history: { ...p.history, [day]: h } }, set) });
  },
  finishStory: (id, right) => {
    const p = get().p;
    const now = Date.now();
    const prev = p.stories[id];
    const first = !prev;
    const xp = first ? STORY_XP + STORY_Q_XP * right : 0;
    const shekels = first ? STORY_SHEKELS : 0;
    const day = dayKey(new Date(now));
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    h.stories = (h.stories ?? 0) + 1;
    h.xp += xp;
    const next: Progress = {
      ...p,
      xp: p.xp + xp,
      history: { ...p.history, [day]: h },
      stories: {
        ...p.stories,
        [id]: { at: prev?.at ?? now, best: Math.max(prev?.best ?? 0, right) },
      },
      shuk: shekels ? { ...p.shuk, earned: p.shuk.earned + shekels } : p.shuk,
    };
    set({ p: persist(awardSeals(COURSE, next, now).p, set) });
    return { xp, shekels, first };
  },
  reset: () => {
    set({ p: persist({ ...defaultProgress(), resetAt: Date.now() }, set) });
  },
  wipeLocal: () => {
    const p = defaultProgress();
    saveLocal(p);
    set({ p, sync: "local" });
  },
}));

/** Selector helpers. */
export const useSettings = () => useProgress((s) => s.p.settings);
export const useRootState = (id: string) => useProgress((s) => s.p.roots[id]);
export const useFlag = (id: string) => useProgress((s) => s.p.flags[id]);
