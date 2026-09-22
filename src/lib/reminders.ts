/**
 * Pure helpers for the daily push reminder: can this browser get one, what the Settings row
 * says, the hour picker, and the key/error plumbing the cloud module needs. The Web Push and
 * Firestore calls live in cloud.ts (web build only); the sender is functions/src/index.ts.
 */

export type PushSupport = "ok" | "ios-install" | "ios-old" | "unsupported";

export interface PushEnv {
  ua: string;
  /** Running as an installed app (`navigator.standalone` or display-mode: standalone). */
  standalone: boolean;
  hasSW: boolean;
  hasPush: boolean;
  hasNotification: boolean;
  /** `navigator.maxTouchPoints`: iPadOS reports a Mac user agent. */
  touchPoints?: number;
}

/**
 * iOS / iPadOS version as a number (16.4), 0 when it is iOS but the version can't be read, or
 * null when it isn't iOS. Every iOS browser is WebKit, so they all share Safari's push rules.
 */
export function iosVersion(ua: string, touchPoints = 0): number | null {
  const mobile = /iPhone|iPad|iPod/.test(ua);
  const ipadAsMac = !mobile && /Macintosh/.test(ua) && touchPoints > 1;
  if (!mobile && !ipadAsMac) return null;
  const m = mobile ? ua.match(/OS (\d+)[_.](\d+)/) : ua.match(/Version\/(\d+)\.(\d+)/);
  return m ? Number(m[1]) + Number(m[2]) / 10 : 0;
}

/**
 * Whether this browser can take a daily reminder. On iPhone and iPad Web Push only works inside
 * the Home Screen app (iOS 16.4+), so a Safari tab gets "ios-install" rather than a dead switch.
 */
export function pushSupport(env: PushEnv): PushSupport {
  const ios = iosVersion(env.ua, env.touchPoints ?? 0);
  if (ios !== null) {
    if (ios > 0 && ios < 16.4) return "ios-old";
    if (!env.standalone) return "ios-install";
  }
  return env.hasSW && env.hasPush && env.hasNotification ? "ok" : "unsupported";
}

/** The hours offered in the picker: 6:00 through 23:00. */
export const REMINDER_HOURS: readonly number[] = Array.from({ length: 18 }, (_, i) => i + 6);

/** Picker hours, including a stored hour outside the usual range so it still shows. */
export function hourOptions(current: number): number[] {
  return REMINDER_HOURS.includes(current)
    ? [...REMINDER_HOURS]
    : [...REMINDER_HOURS, current].sort((a, b) => a - b);
}

/** Whether a locale's `hourCycle` is a 12-hour clock. */
export const uses12h = (hourCycle: string | undefined): boolean =>
  hourCycle === "h11" || hourCycle === "h12";

/** "7:00 PM" or "19:00". */
export function hourLabel(hour: number, h12: boolean): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (!h12) return `${String(h).padStart(2, "0")}:00`;
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
}

/** What the account's reminder doc says, as seen from this device. */
export interface PushRemote {
  /** The doc is switched on (the server turns it off when a subscription dies). */
  on: boolean;
  /** Reminders are delivered to this device's subscription. */
  here: boolean;
}

export interface ReminderView {
  support: PushSupport;
  permission: NotificationPermission | "unsupported";
  signedIn: boolean;
  /** `settings.reminders.on` (synced across the account's devices). */
  on: boolean;
  hour: number;
  h12: boolean;
  /** Null until the doc has been read this session. */
  remote: PushRemote | null;
}

export interface ReminderNote {
  text: string;
  /** The On switch may be tapped. (Off always may.) */
  canTurnOn: boolean;
  /** Offer to move delivery to this device (it's going elsewhere, or it stopped). */
  offerHere: boolean;
}

/** The Settings row's description and what it allows. */
export function reminderNote(v: ReminderView): ReminderNote {
  const at = hourLabel(v.hour, v.h12);
  const no = (text: string): ReminderNote => ({ text, canTurnOn: false, offerHere: false });
  if (v.support === "ios-install")
    return no(
      "Add Yalla to your Home Screen first (Share, then Add to Home Screen) and turn this on from there.",
    );
  if (v.support === "ios-old") return no("Reminders need iOS 16.4 or later.");
  if (v.support === "unsupported") return no("This browser can't show reminders.");
  if (!v.signedIn) return no("Sign in above and Yalla will nudge you once a day.");
  if (v.permission === "denied")
    return no("Notifications are blocked for Yalla. Allow them in your browser or phone settings.");
  if (!v.on)
    return {
      text: `A nudge at ${at} on days you haven't played`,
      canTurnOn: true,
      offerHere: false,
    };
  if (v.remote && !v.remote.on)
    return {
      text: "Paused, so no device is getting them. Send them here?",
      canTurnOn: true,
      offerHere: true,
    };
  if (v.remote && !v.remote.here)
    return { text: `Going to your other device at ${at}`, canTurnOn: true, offerHere: true };
  return {
    text: `Every day at ${at}, unless you've already played`,
    canTurnOn: true,
    offerHere: false,
  };
}

/** A base64url VAPID key as the bytes `pushManager.subscribe` wants. */
export function keyBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Same bytes? (An existing subscription made with another key must be replaced.) */
export function sameBytes(a: ArrayBuffer | ArrayBufferView, b: Uint8Array): boolean {
  const x =
    a instanceof ArrayBuffer
      ? new Uint8Array(a)
      : new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  if (x.length !== b.length) return false;
  for (let i = 0; i < x.length; i++) if (x[i] !== b[i]) return false;
  return true;
}

/** Error codes thrown by the cloud module's push calls. */
export type PushErrorCode =
  "push/denied" | "push/dismissed" | "push/unsupported" | "push/no-sw" | "push/signed-out";

/** Human-readable reason a reminder change failed. */
export function describePushError(e: unknown): string {
  const code = (e as { code?: string } | null)?.code ?? "";
  const name = (e as { name?: string } | null)?.name ?? "";
  if (code === "push/denied" || name === "NotAllowedError")
    return "Notifications are blocked for Yalla. Allow them in your browser or phone settings.";
  if (code === "push/dismissed") return "Reminders stay off until you allow notifications.";
  if (code === "push/unsupported") return "This browser can't show reminders.";
  if (code === "push/no-sw") return "The app is still installing. Reload and try again.";
  if (code === "push/signed-out") return "Sign in to turn on reminders.";
  if (code === "permission-denied") return "Cloud save was refused. Try signing in again.";
  if (code === "unavailable" || name === "AbortError" || name === "NetworkError")
    return "Couldn't reach the reminder service. Try again online.";
  return "Couldn't change the reminder. Try again.";
}
