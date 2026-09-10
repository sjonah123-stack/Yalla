import type { SyncStatus } from "./storage";
import { dayKey, shiftDay } from "./srs";

/** "just now", "4 min ago", "3 h ago", "yesterday", "5 days ago". */
export function agoLabel(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** The Account row's second line for a signed-in person: what the cloud actually holds. */
export function accountLine(
  sync: SyncStatus,
  syncedAt: number,
  pulled: boolean,
  now: number,
): string {
  if (!pulled) return "Waiting for a connection to load your account";
  if (sync === "error") return "Last cloud save failed — it retries when you're back online";
  if (syncedAt > 0) return `Saved to your account ${agoLabel(syncedAt, now)}`;
  return "Progress follows you";
}

/** One line under "Today": where the streak and the daily goal stand right now. */
export function streakNudge(
  streak: number,
  lastPlay: string | null,
  todayXp: number,
  goal: number,
  today: Date = new Date(),
): string {
  const t = dayKey(today);
  const y = dayKey(shiftDay(today, -1));
  const days = (n: number) => `${n}-day streak`;
  if (lastPlay === t) {
    if (todayXp >= goal) return `Goal done · 🔥 ${days(streak)}`;
    return `${goal - todayXp} XP to today's goal · 🔥 ${days(streak)}`;
  }
  if (lastPlay === y && streak > 0) return `Play today to keep your ${days(streak)}`;
  return "Start a streak today";
}
