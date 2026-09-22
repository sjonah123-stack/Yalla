import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VAPID_PUBLIC_KEY } from "./config";
import {
  compose,
  daysBetween,
  dueNow,
  isGone,
  liveStreak,
  localTime,
  pushHostOk,
  readPlayState,
  reminderMessage,
  runTime,
  safeTz,
  shiftDay,
  ttlToMidnight,
  validSub,
  type PlayState,
} from "./remind";

const sub = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  keys: { p256dh: "BPk", auth: "xyz" },
};
const doc = (over: Record<string, unknown> = {}) => ({
  on: true,
  hour: 19,
  tz: "Asia/Jerusalem",
  sub,
  updatedAt: 1,
  ...over,
});
const play = (over: Partial<PlayState> = {}): PlayState => ({
  lastPlay: "2026-09-21",
  streak: 12,
  frozenDays: {},
  freezes: 0,
  ...over,
});
const record = (p: Record<string, unknown>) => JSON.stringify({ v: 3, xp: 0, ...p });

describe("time zones", () => {
  it("reads the local wall clock in the doc's zone", () => {
    // 16:00 UTC on 22 Sep 2026 = 19:00 in Jerusalem (IDT, +3), 12:00 in New York (EDT, -4).
    const t = new Date("2026-09-22T16:00:00Z");
    expect(localTime(t, "Asia/Jerusalem")).toEqual({ day: "2026-09-22", hour: 19, minute: 0 });
    expect(localTime(t, "America/New_York")).toEqual({ day: "2026-09-22", hour: 12, minute: 0 });
    expect(localTime(t, "Asia/Kolkata")).toEqual({ day: "2026-09-22", hour: 21, minute: 30 });
  });

  it("rolls the day key at local midnight, not UTC midnight", () => {
    expect(localTime(new Date("2026-09-22T22:30:00Z"), "Asia/Jerusalem").day).toBe("2026-09-23");
    expect(localTime(new Date("2026-09-22T02:00:00Z"), "America/Los_Angeles").day).toBe(
      "2026-09-21",
    );
    expect(localTime(new Date("2026-09-22T00:00:00Z"), "UTC").hour).toBe(0);
  });

  it("falls back to UTC for a missing or unknown zone", () => {
    expect(safeTz("Asia/Jerusalem")).toBe("Asia/Jerusalem");
    expect(safeTz("Mars/Olympus")).toBe("UTC");
    expect(safeTz(undefined)).toBe("UTC");
    expect(safeTz("")).toBe("UTC");
  });

  it("does calendar arithmetic on day keys", () => {
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-09-18", "2026-09-22")).toEqual([
      "2026-09-19",
      "2026-09-20",
      "2026-09-21",
    ]);
    expect(daysBetween("2026-09-21", "2026-09-22")).toEqual([]);
    expect(daysBetween("2020-01-01", "2026-09-22", 5)).toHaveLength(5);
  });
});

describe("dueNow", () => {
  const at = (iso: string) => new Date(iso);
  it("is due on the run that opens the local reminder hour", () => {
    const d = dueNow(doc(), at("2026-09-22T16:00:00Z"));
    expect(d).toMatchObject({ due: true, day: "2026-09-22", tz: "Asia/Jerusalem" });
  });

  it("fires on exactly one quarter-hour run per day", () => {
    const runs = Array.from({ length: 96 }, (_, i) => new Date(Date.UTC(2026, 8, 22, 0, i * 15)));
    const due = runs.filter((t) => dueNow(doc(), t).due);
    expect(due.map((t) => t.toISOString())).toEqual(["2026-09-22T16:00:00.000Z"]);
    // Half-hour zones line up with the quarter-hour schedule too.
    const india = runs.filter((t) => dueNow(doc({ tz: "Asia/Kolkata", hour: 8 }), t).due);
    expect(india.map((t) => t.toISOString())).toEqual(["2026-09-22T02:30:00.000Z"]);
  });

  it("accepts a run that starts late inside the window, not after it", () => {
    expect(dueNow(doc(), at("2026-09-22T16:14:59Z")).due).toBe(true);
    expect(dueNow(doc(), at("2026-09-22T16:15:00Z"))).toEqual({ due: false, reason: "not-time" });
    expect(dueNow(doc(), at("2026-09-22T15:59:59Z"))).toEqual({ due: false, reason: "not-time" });
  });

  it("sends at most once per local day", () => {
    const t = at("2026-09-22T16:00:00Z");
    expect(dueNow(doc({ lastSent: "2026-09-22" }), t)).toEqual({
      due: false,
      reason: "sent-today",
    });
    expect(dueNow(doc({ lastSent: "2026-09-21" }), t).due).toBe(true);
  });

  it("skips docs that are off or carry no usable subscription", () => {
    const t = at("2026-09-22T16:00:00Z");
    expect(dueNow(doc({ on: false }), t)).toEqual({ due: false, reason: "off" });
    expect(dueNow(doc({ sub: null }), t)).toEqual({ due: false, reason: "bad-sub" });
    expect(dueNow(doc({ sub: { endpoint: "http://x", keys: sub.keys } }), t).due).toBe(false);
    expect(dueNow(doc({ hour: "19" }), t).due).toBe(false);
  });

  it("only sends to the browsers' push services", () => {
    expect(pushHostOk("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(pushHostOk("https://web.push.apple.com/QGx")).toBe(true);
    expect(pushHostOk("https://updates.push.services.mozilla.com/wpush/v2/x")).toBe(true);
    expect(pushHostOk("https://wns2-bl2p.notify.windows.com/w/?token=x")).toBe(true);
    expect(pushHostOk("https://evil.example.com/fcm.googleapis.com")).toBe(false);
    expect(pushHostOk("https://fcm.googleapis.com.evil.example/x")).toBe(false);
    expect(pushHostOk("http://fcm.googleapis.com/x")).toBe(false);
    expect(pushHostOk("not a url")).toBe(false);
  });

  it("validates subscriptions", () => {
    expect(validSub(sub)).toBe(true);
    expect(validSub({ ...sub, endpoint: "https://example.com/x" })).toBe(false);
    expect(validSub({ endpoint: sub.endpoint })).toBe(false);
    expect(validSub("x")).toBe(false);
  });
});

describe("the learner's record", () => {
  it("reads streak fields and counts the freezes still held", () => {
    const json = record({
      lastPlay: "2026-09-20",
      streak: 5,
      frozenDays: { "2026-09-10": "freeze", "2026-09-11": "repair" },
      purchases: {
        a: { at: 1, item: "freeze", cost: 200 },
        b: { at: 2, item: "freeze", cost: 200 },
        c: { at: 3, item: "rush", cost: 90 },
      },
    });
    expect(readPlayState(json)).toEqual({
      lastPlay: "2026-09-20",
      streak: 5,
      frozenDays: { "2026-09-10": "freeze", "2026-09-11": "repair" },
      freezes: 1,
    });
  });

  it("tolerates junk", () => {
    expect(readPlayState(undefined)).toBeNull();
    expect(readPlayState("{not json")).toBeNull();
    expect(readPlayState("42")).toBeNull();
    expect(readPlayState(record({ lastPlay: "yesterday", streak: -3 }))).toMatchObject({
      lastPlay: null,
      streak: 0,
      freezes: 0,
    });
  });

  it("keeps a streak alive through yesterday, frozen days, or freezes still held", () => {
    const today = "2026-09-22";
    expect(liveStreak(play(), today)).toBe(12);
    expect(liveStreak(play({ lastPlay: "2026-09-20" }), today)).toBe(0);
    expect(
      liveStreak(play({ lastPlay: "2026-09-20", frozenDays: { "2026-09-21": "freeze" } }), today),
    ).toBe(12);
    expect(liveStreak(play({ lastPlay: "2026-09-19", freezes: 2 }), today)).toBe(12);
    expect(liveStreak(play({ lastPlay: "2026-09-19", freezes: 1 }), today)).toBe(0);
    expect(liveStreak(play({ lastPlay: null }), today)).toBe(0);
    expect(liveStreak(play({ streak: 0 }), today)).toBe(0);
  });
});

describe("compose", () => {
  const today = "2026-09-22";
  it("stays quiet when the learner already played today", () => {
    expect(compose(play({ lastPlay: today }), today)).toBeNull();
    // A device a zone ahead may already have written tomorrow's key.
    expect(compose(play({ lastPlay: "2026-09-23" }), today)).toBeNull();
  });

  it("leads with the streak when there is one to keep", () => {
    expect(compose(play(), today)).toMatchObject({
      title: "Yalla! Keep your 12-day streak",
      body: "A few roots before midnight keeps it alive.",
      url: "/",
    });
    expect(compose(play({ streak: 1 }), today)?.title).toBe("Yalla! Make it a 2-day streak");
  });

  it("falls back to the Shuk nudge with no live streak or no record", () => {
    const shuk = reminderMessage(0);
    expect(shuk.title).toBe("Yalla!");
    expect(compose(play({ lastPlay: "2026-09-01" }), today)).toEqual(shuk);
    expect(compose(null, today)).toEqual(shuk);
  });

  it("uses no emoji", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    for (const n of [0, 1, 2, 30]) {
      const m = reminderMessage(n);
      expect(emoji.test(m.title + m.body)).toBe(false);
    }
  });
});

describe("delivery details", () => {
  it("expires the push at local midnight", () => {
    expect(ttlToMidnight({ day: "d", hour: 19, minute: 0 })).toBe(5 * 3600);
    expect(ttlToMidnight({ day: "d", hour: 23, minute: 59 })).toBe(60);
  });

  it("uses the scheduled time when Cloud Scheduler sends one", () => {
    const fb = new Date(0);
    expect(runTime("2026-09-22T16:00:00Z", fb).toISOString()).toBe("2026-09-22T16:00:00.000Z");
    expect(runTime(undefined, fb)).toBe(fb);
    expect(runTime("soon", fb)).toBe(fb);
  });

  it("treats 404 and 410 as a dead subscription", () => {
    expect(isGone({ statusCode: 410 })).toBe(true);
    expect(isGone({ statusCode: 404 })).toBe(true);
    expect(isGone({ statusCode: 429 })).toBe(false);
    expect(isGone(null)).toBe(false);
  });

  it("uses the same VAPID public key as the web app", () => {
    const web = readFileSync(join(__dirname, "../../src/lib/firebase-config.ts"), "utf8");
    const m = web.match(/VAPID_PUBLIC_KEY\s*=\s*"([^"]+)"/);
    expect(m?.[1]).toBe(VAPID_PUBLIC_KEY);
    // An uncompressed P-256 point: 65 bytes, base64url without padding.
    expect(Buffer.from(VAPID_PUBLIC_KEY, "base64url")).toHaveLength(65);
  });
});
