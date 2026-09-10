import { describe, expect, it } from "vitest";
import { accountLine, agoLabel, streakNudge } from "./labels";
import { dayKey, shiftDay } from "./srs";

const T = 1_700_000_000_000;

describe("agoLabel", () => {
  it("buckets by seconds, minutes, hours, days", () => {
    expect(agoLabel(T - 5_000, T)).toBe("just now");
    expect(agoLabel(T - 4 * 60_000, T)).toBe("4 min ago");
    expect(agoLabel(T - 3 * 3_600_000, T)).toBe("3 h ago");
    expect(agoLabel(T - 26 * 3_600_000, T)).toBe("yesterday");
    expect(agoLabel(T - 5 * 86_400_000, T)).toBe("5 days ago");
    expect(agoLabel(T + 10_000, T)).toBe("just now");
  });
});

describe("accountLine", () => {
  it("prefers the unpulled state, then errors, then the last save time", () => {
    expect(accountLine("synced", T, false, T)).toMatch(/Waiting for a connection/);
    expect(accountLine("error", T, true, T)).toMatch(/save failed/);
    expect(accountLine("synced", T - 120_000, true, T)).toBe("Saved to your account 2 min ago");
    expect(accountLine("local", 0, true, T)).toBe("Progress follows you");
  });
});

describe("streakNudge", () => {
  const today = new Date(2026, 8, 9, 12);
  const t = dayKey(today);
  const y = dayKey(shiftDay(today, -1));
  it("reads today's play against the goal", () => {
    expect(streakNudge(3, t, 50, 50, today)).toBe("Goal done · 🔥 3-day streak");
    expect(streakNudge(3, t, 20, 50, today)).toBe("30 XP to today's goal · 🔥 3-day streak");
  });
  it("warns when yesterday's streak is at stake, invites otherwise", () => {
    expect(streakNudge(3, y, 0, 50, today)).toBe("Play today to keep your 3-day streak");
    expect(streakNudge(0, null, 0, 50, today)).toBe("Start a streak today");
    expect(streakNudge(4, dayKey(shiftDay(today, -3)), 0, 50, today)).toBe("Start a streak today");
  });
});
