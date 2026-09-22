import type { Progress, Root, Rush, ShukState } from "../types";
import { SECTIONS, SECTION_BY_CAT } from "../data/course";
import { memorized } from "./course";
import { DAY, isDue } from "./srs";

// ---------- The Shuk: an idle market fed by memorized roots ----------
//
// Every theme section is a stall. A memorized root that is not due for review is "fresh" stock
// and earns shekels every hour, even while the app is closed (up to the storage cap). A due root
// has wilted and earns nothing until it is reviewed. Balance is derived, never stored:
// earned (lifetime, only goes up) minus the deterministic cost of every level and perk bought.

export const HOUR = 3_600_000;
export const MINUTE = 60_000;

/** Shekels per hour per fresh root at level 0. */
export const BASE_RATE = 30;
/** Each stall level adds this fraction of the base. */
export const LEVEL_STEP = 0.25;
/** Stall levels that double the stall's income. */
export const LANDMARKS = [10, 25, 50, 100] as const;
/** Cost of the first stall upgrade; each next level costs ×UPGRADE_GROWTH. */
export const UPGRADE_BASE = 40;
export const UPGRADE_GROWTH = 1.15;

/** Stall flavor, by section id. */
export const STALLS: Record<string, { name: string; he: string; goods: string }> = {
  speech: { name: "Newsstand", he: "דּוּכַן עִתּוֹנִים", goods: "papers" },
  movement: { name: "Bike repair", he: "תִּקּוּן אוֹפַנַּיִם", goods: "bikes" },
  senses: { name: "Spectacles", he: "מִשְׁקָפַיִם", goods: "lenses" },
  home: { name: "Housewares", he: "כְּלֵי בַּיִת", goods: "pots" },
  people: { name: "Photo booth", he: "צַלָּמַנִיָּה", goods: "portraits" },
  time: { name: "Watchmaker", he: "שְׁעָנוּת", goods: "clocks" },
  feelings: { name: "Flower stall", he: "פְּרָחִים", goods: "bouquets" },
  work: { name: "Hardware", he: "כְּלֵי עֲבוֹדָה", goods: "tools" },
  food: { name: "Spice stall", he: "תַּבְלִינִים", goods: "spices" },
  size: { name: "Scales & weights", he: "מֹאזְנַיִם", goods: "weights" },
  nature: { name: "Fruit & veg", he: "פֵּרוֹת וִירָקוֹת", goods: "produce" },
  law: { name: "Notary", he: "נוֹטַרְיוֹן", goods: "stamps" },
  jewish: { name: "Judaica", he: "יוּדָאִיקָה", goods: "candlesticks" },
  culture: { name: "Records", he: "תַּקְלִיטִים", goods: "records" },
  body: { name: "Pharmacy", he: "בֵּית מִרְקַחַת", goods: "remedies" },
  clothing: { name: "Tailor", he: "חַיָּט", goods: "shirts" },
  weather: { name: "Umbrellas", he: "מִטְרִיּוֹת", goods: "umbrellas" },
  tech: { name: "Phone repair", he: "מַעְבָּדַת סֶלוּלָר", goods: "chargers" },
  education: { name: "Books", he: "סְפָרִים", goods: "books" },
  military: { name: "Army surplus", he: "עֹדְפֵי צָבָא", goods: "canteens" },
  city: { name: "Falafel", he: "פָלָאפֶל", goods: "pitas" },
  commerce: { name: "Money changer", he: "חַלְפָן", goods: "coins" },
  animals: { name: "Pet shop", he: "חֲנוּת חַיּוֹת", goods: "birdseed" },
  science: { name: "Curiosities", he: "פְּלָאוֹת", goods: "gadgets" },
  sport: { name: "Sports gear", he: "צִיּוּד סְפּוֹרְט", goods: "balls" },
};

// ---------- Perks (global upgrades bought with shekels) ----------
export type PerkId = "storage" | "rush" | "haggle";
export interface Perk {
  id: PerkId;
  name: string;
  /** What each level gives, index = level. */
  levels: readonly number[];
  /** Cost to reach level i+1, index = current level. */
  costs: readonly number[];
  describe: (v: number) => string;
}
export const PERKS: readonly Perk[] = [
  {
    id: "storage",
    name: "Cold storage",
    levels: [4, 8, 12, 24],
    costs: [600, 3000, 12000],
    describe: (v) => `Earn for up to ${v}h while away`,
  },
  {
    id: "rush",
    name: "Rush hour",
    levels: [30, 45, 60],
    costs: [900, 5000],
    describe: (v) => `Rush hours last ${v} min`,
  },
  {
    id: "haggle",
    name: "Haggling",
    levels: [1, 1.5, 2, 3],
    costs: [400, 2500, 10000],
    describe: (v) => `Sales per right answer ×${v}`,
  },
];
export const PERK_BY_ID: Record<PerkId, Perk> = Object.fromEntries(
  PERKS.map((p) => [p.id, p]),
) as Record<PerkId, Perk>;

export const perkLevel = (s: ShukState, id: PerkId): number =>
  Math.min(s.perks[id] ?? 0, PERK_BY_ID[id].levels.length - 1);
export const perkValue = (s: ShukState, id: PerkId): number =>
  PERK_BY_ID[id].levels[perkLevel(s, id)];
/** Cost of the next perk level, or null at max. */
export const perkCost = (s: ShukState, id: PerkId): number | null =>
  PERK_BY_ID[id].costs[perkLevel(s, id)] ?? null;

// ---------- Costs and balance ----------

/** Cost to go from `level` to `level + 1`. */
export const upgradeCost = (level: number): number =>
  Math.round(UPGRADE_BASE * UPGRADE_GROWTH ** level);

/** Total spent to reach `level` from 0. */
export function cumulativeCost(level: number): number {
  let t = 0;
  for (let l = 0; l < level; l++) t += upgradeCost(l);
  return t;
}

export function spent(s: ShukState): number {
  let t = 0;
  for (const lv of Object.values(s.levels)) t += cumulativeCost(lv);
  for (const perk of PERKS) {
    const lv = Math.min(s.perks[perk.id] ?? 0, perk.costs.length);
    for (let i = 0; i < lv; i++) t += perk.costs[i];
  }
  return t;
}

/** Spendable shekels (never negative: two devices can at worst double-count an upgrade). */
export const shekels = (s: ShukState): number => Math.max(0, Math.floor(s.earned - spent(s)));

// ---------- Income ----------

export const landmarks = (level: number): number => LANDMARKS.filter((l) => level >= l).length;
export const levelMult = (level: number): number =>
  (1 + LEVEL_STEP * level) * 2 ** landmarks(level);
/** The next landmark level above `level`, or null. */
export const nextLandmark = (level: number): number | null =>
  LANDMARKS.find((l) => l > level) ?? null;

export interface Stall {
  id: string;
  title: string;
  name: string;
  he: string;
  goods: string;
  level: number;
  /** Memorized roots in this section. */
  stock: number;
  /** Memorized and not due: earning. */
  fresh: number;
  /** Memorized but due for review: not earning. */
  wilted: number;
  /** Roots in the section. */
  total: number;
  open: boolean;
  /** Shekels per hour (before rush). */
  rate: number;
}

export function stalls(
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "shuk">,
  now: number,
): Stall[] {
  const by = new Map<string, { stock: number; fresh: number; total: number }>();
  for (const r of roots) {
    const sec = SECTION_BY_CAT[r.cat]?.id;
    if (!sec) continue;
    const b = by.get(sec) ?? { stock: 0, fresh: 0, total: 0 };
    b.total++;
    const st = p.roots[r.r];
    if (memorized(st)) {
      b.stock++;
      if (!isDue(st, now)) b.fresh++;
    }
    by.set(sec, b);
  }
  return SECTIONS.map((sec) => {
    const b = by.get(sec.id) ?? { stock: 0, fresh: 0, total: 0 };
    const level = p.shuk.levels[sec.id] ?? 0;
    const flavor = STALLS[sec.id] ?? { name: sec.title, he: sec.he, goods: "goods" };
    return {
      id: sec.id,
      title: sec.title,
      ...flavor,
      level,
      stock: b.stock,
      fresh: b.fresh,
      wilted: b.stock - b.fresh,
      total: b.total,
      open: b.stock > 0,
      rate: BASE_RATE * b.fresh * levelMult(level),
    };
  });
}

/** Total shekels per hour, before rush. */
export const incomeRate = (all: readonly Stall[]): number => all.reduce((t, s) => t + s.rate, 0);

export const storageMs = (s: ShukState): number => perkValue(s, "storage") * HOUR;

/** Rush multiplier in effect at `now` (1 when none). */
export const rushMult = (rush: Rush | null, now: number): number =>
  rush && rush.from <= now && now < rush.until ? rush.mult : 1;

/**
 * Shekels a set of roots earned between `from` and `to`. Each memorized root earns only while
 * it is fresh: from its last review (`due − ivl`) until it came due. So a root that wilts mid-
 * window keeps what it already earned, and a newly memorized root isn't paid backwards in time.
 * A rush hour overlapping a root's fresh stretch pays its multiplier on the overlap.
 */
export function accrued(
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "shuk">,
  from: number,
  to: number,
): number {
  if (to <= from) return 0;
  const rush = p.shuk.rush;
  let total = 0;
  for (const r of roots) {
    const st = p.roots[r.r];
    if (!st || !memorized(st)) continue;
    const sec = SECTION_BY_CAT[r.cat]?.id;
    if (!sec) continue;
    const a = Math.max(from, st.due - st.ivl * DAY);
    const b = Math.min(to, st.due);
    if (b <= a) continue;
    let ms = b - a;
    if (rush) {
      const o = Math.min(b, rush.until) - Math.max(a, rush.from);
      if (o > 0) ms += o * (rush.mult - 1);
    }
    total += (BASE_RATE * levelMult(p.shuk.levels[sec] ?? 0) * ms) / HOUR;
  }
  return total;
}

/** The till, unrounded: income since the last collection, capped at the storage window. */
export function till(
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "shuk">,
  now: number,
): number {
  const s = p.shuk;
  if (!s.lastCollect || now <= s.lastCollect) return 0;
  return accrued(roots, p, Math.max(s.lastCollect, now - storageMs(s)), now);
}

/** Whole shekels waiting to be collected. */
export const pending = (
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "shuk">,
  now: number,
): number => Math.floor(till(roots, p, now));

/** Whether storage is full (income has stopped until collected). */
export const storageFull = (s: ShukState, now: number): boolean =>
  !!s.lastCollect && now - s.lastCollect >= storageMs(s);

/** Collect the till. Opening the Shuk for the first time just starts the clock. */
export function collect(
  roots: readonly Root[],
  p: Pick<Progress, "roots" | "shuk">,
  now: number,
): { s: ShukState; got: number } {
  const got = pending(roots, p, now);
  return { s: { ...p.shuk, earned: p.shuk.earned + got, lastCollect: now }, got };
}

/** Buy one stall level; null when unaffordable. */
export function upgradeStall(s: ShukState, id: string): ShukState | null {
  const lv = s.levels[id] ?? 0;
  if (shekels(s) < upgradeCost(lv)) return null;
  return { ...s, levels: { ...s.levels, [id]: lv + 1 } };
}

/** Buy the next perk level; null when unaffordable or maxed. */
export function buyPerk(s: ShukState, id: PerkId): ShukState | null {
  const cost = perkCost(s, id);
  if (cost === null || shekels(s) < cost) return null;
  return { ...s, perks: { ...s.perks, [id]: perkLevel(s, id) + 1 } };
}

// ---------- Rush hour and sales ----------

/** Start (or extend to the better of) a rush hour. */
export function startRush(s: ShukState, mult: number, minutes: number, now: number): ShukState {
  const until = now + minutes * MINUTE;
  const cur = s.rush && s.rush.until > now ? s.rush : null;
  // A stronger rush already running wins; the same strength extends; a stronger one replaces.
  if (cur && cur.mult > mult) return s;
  if (cur && cur.mult === mult)
    return { ...s, rush: { from: cur.from, until: Math.max(cur.until, until), mult } };
  return { ...s, rush: { from: now, until, mult } };
}

/** Minimum sale per right answer once any stall is open. */
export const MIN_SALE = 2;

/** Shekels a session's right answers sell for: about a minute of income each, × haggling. */
export function sales(s: ShukState, rate: number, ok: number): number {
  if (ok <= 0 || rate <= 0) return 0;
  const each = Math.max(MIN_SALE, rate / 60) * perkValue(s, "haggle");
  return Math.round(each * ok);
}

// ---------- Market tiers (by lifetime earnings) ----------
export const TIERS = [
  { name: "Stand", he: "דּוּכָן", at: 0 },
  { name: "Stall", he: "בַּסְטָה", at: 1_000 },
  { name: "Shop", he: "חֲנוּת", at: 10_000 },
  { name: "Market", he: "שׁוּק", at: 100_000 },
  { name: "Mall", he: "קַנְיוֹן", at: 1_000_000 },
] as const;

/** Tier index 0–4 for lifetime earnings. */
export const tierOf = (earned: number): number => {
  let t = 0;
  TIERS.forEach((tier, i) => {
    if (earned >= tier.at) t = i;
  });
  return t;
};

/** Compact shekel amount: 950, 12.4k, 3.1M. */
export function fmtShekels(n: number): string {
  const v = Math.floor(n);
  if (v < 10_000) return `₪${v.toLocaleString("en-US")}`;
  if (v < 1_000_000) return `₪${(v / 1000).toFixed(v < 100_000 ? 1 : 0)}k`;
  return `₪${(v / 1_000_000).toFixed(1)}M`;
}
