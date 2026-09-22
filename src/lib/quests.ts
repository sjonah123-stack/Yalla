import type { DayStats, Progress } from "../types";
import { seeded, seededShuffle } from "./rng";
import { addPurchase, freezesOwned, FREEZE_MAX } from "./shop";
import { startRush } from "./shuk";

// ---------- Daily quests ----------
//
// Three quests a day, chosen by a seeded shuffle of the day key so every device shows the same
// three. Progress is read from that day's DayStats counters (max-merged), claims are stamped in
// `Progress.quests` under "day:questId", and claiming all three unlocks the day's lucky bag.

export interface QuestDef {
  id: string;
  text: string;
  target: number;
  stat: (h: DayStats) => number;
}

export const QUEST_POOL: readonly QuestDef[] = [
  { id: "right-25", text: "Get 25 answers right", target: 25, stat: (h) => h.ok },
  { id: "right-50", text: "Get 50 answers right", target: 50, stat: (h) => h.ok },
  { id: "xp-80", text: "Earn 80 XP", target: 80, stat: (h) => h.xp },
  { id: "session-1", text: "Finish a lesson or review", target: 1, stat: (h) => h.sessions ?? 0 },
  {
    id: "session-2",
    text: "Finish two lessons or reviews",
    target: 2,
    stat: (h) => h.sessions ?? 0,
  },
  { id: "combo-8", text: "Hit an 8× combo", target: 8, stat: (h) => h.combo ?? 0 },
  {
    id: "perfect",
    text: "Finish a session with no misses",
    target: 1,
    stat: (h) => h.perfect ?? 0,
  },
  {
    id: "speed-15",
    text: "Get 15 right in a speed round",
    target: 15,
    stat: (h) => h.speedBest ?? 0,
  },
  { id: "listen-3", text: "Listen for 3 minutes", target: 180, stat: (h) => h.listen ?? 0 },
  { id: "collect", text: "Collect from your Shuk", target: 1, stat: (h) => h.collects ?? 0 },
  { id: "daily", text: "Do the root of the day", target: 1, stat: (h) => h.daily ?? 0 },
  { id: "story", text: "Read a story", target: 1, stat: (h) => h.stories ?? 0 },
];
const BY_ID = Object.fromEntries(QUEST_POOL.map((q) => [q.id, q]));
/** Quests that can always be done on day one (one is always in the set). */
const EASY = ["session-1", "collect", "daily", "right-25"];

export const QUEST_GEMS = 10;
/** A quest's shekel reward: half an hour of income, at least 100. */
export const questShekels = (rate: number): number => Math.max(100, Math.round(rate / 2));

/** The day's three quests. */
export function dailyQuests(day: string): QuestDef[] {
  const rnd = seeded(`quests:${day}`);
  const easy = BY_ID[EASY[Math.floor(rnd() * EASY.length)]];
  const rest = seededShuffle(
    QUEST_POOL.filter(
      (q) => q !== easy && !(q.id.startsWith("right-") && easy.id.startsWith("right-")),
    ),
    rnd,
  );
  // No two quests of the same family (right-25 + right-50, session-1 + session-2).
  const fam = (id: string) => id.split("-")[0];
  const out = [easy];
  for (const q of rest) {
    if (out.length >= 3) break;
    if (out.some((o) => fam(o.id) === fam(q.id))) continue;
    out.push(q);
  }
  return out;
}

export const questKey = (day: string, id: string): string => `${day}:${id}`;
export const bagKey = (day: string): string => `${day}:bag`;

const EMPTY: DayStats = { ok: 0, bad: 0, xp: 0 };

export interface QuestView {
  def: QuestDef;
  value: number;
  done: boolean;
  claimed: boolean;
}

export function questViews(p: Pick<Progress, "history" | "quests">, day: string): QuestView[] {
  const h = p.history[day] ?? EMPTY;
  return dailyQuests(day).map((def) => {
    const value = Math.min(def.target, def.stat(h));
    return { def, value, done: value >= def.target, claimed: !!p.quests[questKey(day, def.id)] };
  });
}

/** Claim a finished quest: gems + shekels. Null when not done or already claimed. */
export function claimQuest(
  p: Progress,
  day: string,
  id: string,
  rate: number,
  now: number,
): { p: Progress; gems: number; shekels: number } | null {
  const v = questViews(p, day).find((q) => q.def.id === id);
  if (!v || !v.done || v.claimed) return null;
  const shekels = questShekels(rate);
  return {
    p: {
      ...p,
      gems: p.gems + QUEST_GEMS,
      shuk: { ...p.shuk, earned: p.shuk.earned + shekels },
      quests: { ...p.quests, [questKey(day, id)]: now },
    },
    gems: QUEST_GEMS,
    shekels,
  };
}

/** All three claimed and the bag not yet opened. */
export const bagReady = (p: Pick<Progress, "history" | "quests">, day: string): boolean =>
  !p.quests[bagKey(day)] && questViews(p, day).every((q) => q.claimed);

// ---------- Lucky bags ----------

export type Prize =
  | { kind: "shekels"; n: number; jackpot?: boolean }
  | { kind: "gems"; n: number }
  | { kind: "freeze" }
  | { kind: "rush"; minutes: number; mult: number };

/**
 * The prize in a bag, from a seeded roll on the bag's id: the same bag opens the same way on
 * every device. `rate` scales shekel prizes to the current market.
 */
export function bagPrize(id: string, rate: number, freezes: number): Prize {
  const rnd = seeded(`bag:${id}`);
  const roll = rnd();
  const hours = (h: number) => Math.max(300, Math.round(rate * h));
  if (roll < 0.08) return { kind: "shekels", n: hours(8), jackpot: true };
  if (roll < 0.4) return { kind: "shekels", n: hours(1 + rnd() * 2) };
  if (roll < 0.7) return { kind: "gems", n: 20 + Math.floor(rnd() * 5) * 10 };
  if (roll < 0.85) return freezes < FREEZE_MAX ? { kind: "freeze" } : { kind: "gems", n: 40 };
  return { kind: "rush", minutes: 60, mult: 3 };
}

/** Apply a prize. `id` is the bag's id, reused so a won freeze can't duplicate on merge. */
export function applyPrize(p: Progress, prize: Prize, id: string, now: number): Progress {
  switch (prize.kind) {
    case "shekels":
      return { ...p, shuk: { ...p.shuk, earned: p.shuk.earned + prize.n } };
    case "gems":
      return { ...p, gems: p.gems + prize.n };
    case "freeze":
      return addPurchase(p, "freeze", 0, now, `${id}:freeze`);
    case "rush":
      return { ...p, shuk: startRush(p.shuk, prize.mult, prize.minutes, now) };
  }
}

/** Open the day's quest bag. Null when it isn't ready. */
export function openQuestBag(
  p: Progress,
  day: string,
  rate: number,
  now: number,
): { p: Progress; prize: Prize } | null {
  if (!bagReady(p, day)) return null;
  const id = bagKey(day);
  const prize = bagPrize(id, rate, freezesOwned(p));
  return { p: { ...applyPrize(p, prize, id, now), quests: { ...p.quests, [id]: now } }, prize };
}
