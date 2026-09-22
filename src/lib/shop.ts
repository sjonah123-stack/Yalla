import type { Accent, Progress, Purchase, ShopItem } from "../types";
import { dayKey, skippedDays, streakAlive } from "./srs";

// ---------- The gem shop ----------
//
// `gems` is lifetime earned (max-merged across devices, never decremented). Spending is a
// ledger of purchases keyed by unique id, union-merged, so two devices can never un-spend or
// double-spend by merging. Balance = gems − Σ cost.

export const FREEZE_COST = 50;
export const FREEZE_MAX = 2;
export const REPAIR_COST = 120;
/** A broken streak can be repaired when at most this many days were missed. */
export const REPAIR_MAX_DAYS = 2;
export const RUSH_TOKEN_COST = 40;
export const RUSH_TOKEN_MIN = 60;
export const RUSH_TOKEN_MULT = 2;
export const BAG_COST = 60;
export const ACCENT_COST = 150;

export const ACCENTS: readonly { id: Accent; name: string; he: string }[] = [
  { id: "plum", name: "Plum", he: "שְׁזִיף" },
  { id: "jaffa", name: "Jaffa orange", he: "יָפוֹ" },
  { id: "galil", name: "Galilee green", he: "גָּלִיל" },
  { id: "negev", name: "Negev sand", he: "נֶגֶב" },
];

export const spentGems = (p: Pick<Progress, "purchases">): number =>
  Object.values(p.purchases).reduce((t, x) => t + x.cost, 0);

/** Spendable gems (clamped: a merge can at worst overspend by one concurrent purchase). */
export const gemBalance = (p: Pick<Progress, "gems" | "purchases">): number =>
  Math.max(0, p.gems - spentGems(p));

/** Streak freezes held: bought (or won) minus the ones already used on a missed day. */
export function freezesOwned(p: Pick<Progress, "purchases" | "frozenDays">): number {
  const got = Object.values(p.purchases).filter((x) => x.item === "freeze").length;
  const used = Object.values(p.frozenDays).filter((v) => v === "freeze").length;
  return Math.max(0, got - used);
}

export const ownsAccent = (p: Pick<Progress, "purchases">, a: Accent): boolean =>
  a === "plum" || Object.values(p.purchases).some((x) => x.item === `accent:${a}`);

/** A fresh purchase id; `seed` makes it deterministic (prizes that must not duplicate on merge). */
export const purchaseId = (now: number, seed?: string): string =>
  seed ?? `${now}-${Math.random().toString(36).slice(2, 8)}`;

export type BuyError = "gems" | "max" | "owned";

/** Why `item` can't be bought right now, or null when it can. */
export function cantBuy(p: Progress, item: ShopItem, cost: number): BuyError | null {
  if (item === "freeze" && freezesOwned(p) >= FREEZE_MAX) return "max";
  if (item.startsWith("accent:") && ownsAccent(p, item.slice(7) as Accent)) return "owned";
  if (gemBalance(p) < cost) return "gems";
  return null;
}

/** Record a purchase (no checks). */
export function addPurchase(
  p: Progress,
  item: ShopItem,
  cost: number,
  now: number,
  id?: string,
): Progress {
  const key = purchaseId(now, id);
  if (p.purchases[key]) return p;
  const rec: Purchase = { at: now, item, cost };
  return { ...p, purchases: { ...p.purchases, [key]: rec } };
}

// ---------- Streak freeze and repair ----------

/**
 * On a new day: cover the days missed since the last play with owned freezes, if there are
 * enough for every one of them. Returns the record unchanged when nothing needs covering or the
 * freezes can't cover the gap (the streak is broken; see `repairOffer`).
 */
export function applyFreezes(p: Progress, today: Date = new Date()): Progress {
  if (!p.lastPlay || p.streak <= 0) return p;
  const gap = skippedDays(p.lastPlay, today).filter((d) => !(d in p.frozenDays));
  if (!gap.length || gap.length > freezesOwned(p)) return p;
  const frozenDays = { ...p.frozenDays };
  for (const d of gap) frozenDays[d] = "freeze";
  return { ...p, frozenDays };
}

export interface RepairOffer {
  /** The streak that would be restored. */
  streak: number;
  days: string[];
  cost: number;
}

/** A broken streak that can still be bought back, or null. */
export function repairOffer(p: Progress, today: Date = new Date()): RepairOffer | null {
  if (!p.lastPlay || p.streak <= 1) return null;
  if (streakAlive(p.lastPlay, today, p.frozenDays)) return null;
  const days = skippedDays(p.lastPlay, today).filter((d) => !(d in p.frozenDays));
  if (!days.length || days.length > REPAIR_MAX_DAYS) return null;
  return { streak: p.streak, days, cost: REPAIR_COST };
}

/** Buy back a broken streak: the missed days are marked repaired. Null when not possible. */
export function repairStreak(
  p: Progress,
  now: number,
  today: Date = new Date(now),
): Progress | null {
  const offer = repairOffer(p, today);
  if (!offer || gemBalance(p) < offer.cost) return null;
  const frozenDays = { ...p.frozenDays };
  for (const d of offer.days) frozenDays[d] = "repair";
  return addPurchase({ ...p, frozenDays }, "repair", offer.cost, now);
}

/** The streak as it should be shown today: 0 once it has lapsed. */
export const visibleStreak = (p: Progress, today: Date = new Date()): number =>
  streakAlive(p.lastPlay, today, p.frozenDays) ? p.streak : 0;

/** Whether today still needs a correct answer to keep the streak going. */
export const streakAtRisk = (p: Progress, today: Date = new Date()): boolean =>
  p.streak > 0 && p.lastPlay !== dayKey(today) && streakAlive(p.lastPlay, today, p.frozenDays);

/** Flame size for a streak length: 0 none, 1 lit, 2 week, 3 month, 4 hundred. */
export const flameSize = (streak: number): number =>
  streak >= 100 ? 4 : streak >= 30 ? 3 : streak >= 7 ? 2 : streak > 0 ? 1 : 0;
