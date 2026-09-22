import { describe, expect, it } from "vitest";
import { VAPID_PUBLIC_KEY } from "./firebase-config";
import {
  describePushError,
  hourLabel,
  hourOptions,
  iosVersion,
  keyBytes,
  pushSupport,
  REMINDER_HOURS,
  reminderNote,
  sameBytes,
  uses12h,
  type PushEnv,
  type ReminderView,
} from "./reminders";

const UA = {
  iphone17:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphone16_3:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0 Mobile/15E148 Safari/604.1",
  ipadAsMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
};

const env = (over: Partial<PushEnv>): PushEnv => ({
  ua: UA.android,
  standalone: false,
  hasSW: true,
  hasPush: true,
  hasNotification: true,
  touchPoints: 0,
  ...over,
});

describe("pushSupport", () => {
  it("reads iOS versions, including iPadOS posing as a Mac", () => {
    expect(iosVersion(UA.iphone17)).toBeCloseTo(17.5);
    expect(iosVersion(UA.iphone16_3)).toBeCloseTo(16.3);
    expect(iosVersion(UA.ipadAsMac, 5)).toBeCloseTo(17.4);
    expect(iosVersion(UA.ipadAsMac, 0)).toBeNull();
    expect(iosVersion(UA.android)).toBeNull();
    expect(iosVersion("Mozilla/5.0 (iPhone)")).toBe(0);
  });

  it("sends an iPhone Safari tab to the Home Screen instead of failing", () => {
    // A Safari tab has no PushManager at all; the answer is still "install", not "unsupported".
    expect(pushSupport(env({ ua: UA.iphone17, hasPush: false, hasNotification: false }))).toBe(
      "ios-install",
    );
    expect(pushSupport(env({ ua: UA.iphoneChrome }))).toBe("ios-install");
    expect(pushSupport(env({ ua: UA.ipadAsMac, touchPoints: 5 }))).toBe("ios-install");
    expect(pushSupport(env({ ua: UA.iphone17, standalone: true }))).toBe("ok");
  });

  it("names iOS older than 16.4", () => {
    expect(pushSupport(env({ ua: UA.iphone16_3, standalone: true }))).toBe("ios-old");
    expect(pushSupport(env({ ua: UA.iphone16_3 }))).toBe("ios-old");
  });

  it("works in ordinary tabs elsewhere, and needs all three APIs", () => {
    expect(pushSupport(env({}))).toBe("ok");
    expect(pushSupport(env({ ua: UA.mac }))).toBe("ok");
    expect(pushSupport(env({ hasPush: false }))).toBe("unsupported");
    expect(pushSupport(env({ hasSW: false }))).toBe("unsupported");
    expect(pushSupport(env({ hasNotification: false }))).toBe("unsupported");
  });
});

describe("hour picker", () => {
  it("offers 6:00 through 23:00", () => {
    expect(REMINDER_HOURS[0]).toBe(6);
    expect(REMINDER_HOURS.at(-1)).toBe(23);
    expect(REMINDER_HOURS).toHaveLength(18);
  });

  it("keeps a stored hour outside the range visible", () => {
    expect(hourOptions(19)).toEqual([...REMINDER_HOURS]);
    expect(hourOptions(3)[0]).toBe(3);
    expect(hourOptions(3)).toHaveLength(19);
  });

  it("labels hours on 12- and 24-hour clocks", () => {
    expect(hourLabel(19, true)).toBe("7:00 PM");
    expect(hourLabel(12, true)).toBe("12:00 PM");
    expect(hourLabel(0, true)).toBe("12:00 AM");
    expect(hourLabel(6, true)).toBe("6:00 AM");
    expect(hourLabel(19, false)).toBe("19:00");
    expect(hourLabel(6, false)).toBe("06:00");
    expect(uses12h("h12")).toBe(true);
    expect(uses12h("h23")).toBe(false);
    expect(uses12h(undefined)).toBe(false);
  });
});

describe("reminderNote", () => {
  const view = (over: Partial<ReminderView>): ReminderView => ({
    support: "ok",
    permission: "default",
    signedIn: true,
    on: false,
    hour: 19,
    h12: true,
    remote: null,
    ...over,
  });

  it("explains why the switch can't turn on", () => {
    for (const v of [
      view({ support: "ios-install" }),
      view({ support: "ios-old" }),
      view({ support: "unsupported" }),
      view({ signedIn: false }),
      view({ permission: "denied" }),
    ])
      expect(reminderNote(v).canTurnOn).toBe(false);
    expect(reminderNote(view({ support: "ios-install" })).text).toMatch(/Home Screen/);
    expect(reminderNote(view({ signedIn: false })).text).toMatch(/Sign in/);
    expect(reminderNote(view({ permission: "denied" })).text).toMatch(/blocked/);
  });

  it("describes the reminder when it can be used", () => {
    expect(reminderNote(view({}))).toEqual({
      text: "A nudge at 7:00 PM on days you haven't played",
      canTurnOn: true,
      offerHere: false,
    });
    expect(reminderNote(view({ on: true, permission: "granted" })).text).toBe(
      "Every day at 7:00 PM, unless you've already played",
    );
    expect(reminderNote(view({ on: true, remote: { on: true, here: true } })).offerHere).toBe(
      false,
    );
  });

  it("offers to move delivery here when it goes elsewhere or stopped", () => {
    const away = reminderNote(view({ on: true, h12: false, remote: { on: true, here: false } }));
    expect(away).toMatchObject({ text: "Going to your other device at 19:00", offerHere: true });
    expect(reminderNote(view({ on: true, remote: { on: false, here: true } })).offerHere).toBe(
      true,
    );
  });
});

describe("keys and errors", () => {
  it("decodes the VAPID public key to an uncompressed P-256 point", () => {
    const k = keyBytes(VAPID_PUBLIC_KEY);
    expect(k).toHaveLength(65);
    expect(k[0]).toBe(4);
    expect(keyBytes("-_8")).toEqual(new Uint8Array([0xfb, 0xff]));
  });

  it("compares key bytes from a buffer or a view", () => {
    const k = keyBytes(VAPID_PUBLIC_KEY);
    expect(sameBytes(k.slice().buffer, k)).toBe(true);
    expect(sameBytes(k, k)).toBe(true);
    expect(sameBytes(new Uint8Array(65), k)).toBe(false);
    expect(sameBytes(new Uint8Array(3), k)).toBe(false);
  });

  it("gives every failure a sentence", () => {
    expect(describePushError({ code: "push/denied" })).toMatch(/blocked/);
    expect(describePushError({ name: "NotAllowedError" })).toMatch(/blocked/);
    expect(describePushError({ code: "push/dismissed" })).toMatch(/allow notifications/);
    expect(describePushError({ code: "push/no-sw" })).toMatch(/Reload/);
    expect(describePushError({ name: "AbortError" })).toMatch(/online/);
    expect(describePushError(null)).toMatch(/Try again/);
  });

  it("keeps the copy emoji-free", () => {
    const texts = [
      describePushError({ code: "push/denied" }),
      reminderNote({
        support: "ok",
        permission: "granted",
        signedIn: true,
        on: true,
        hour: 8,
        h12: true,
        remote: null,
      }).text,
    ];
    for (const t of texts) expect(/\p{Extended_Pictographic}/u.test(t)).toBe(false);
  });
});
