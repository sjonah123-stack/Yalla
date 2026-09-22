/**
 * Pure decisions for the daily reminder: whether a `push/{uid}` doc is due right now, what the
 * learner's streak looks like, and which message to send. No Firebase, no network — the
 * scheduled handler in index.ts is a thin loop around these. Tested in remind.test.ts.
 */

/** The scheduler fires every 15 minutes; a reminder goes out on the run in [hour:00, hour:15). */
export const WINDOW_MIN = 15;

/** Collapse key: a newer reminder replaces an undelivered older one at the push service. */
export const TOPIC = "yalla-daily";

export interface LocalTime {
  /** Local calendar day, YYYY-MM-DD (the app's `dayKey` format). */
  day: string;
  hour: number;
  minute: number;
}

/** An IANA zone the runtime understands, or "UTC". */
export function safeTz(tz: unknown): string {
  if (typeof tz !== "string" || !tz || tz.length > 64) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

const formats = new Map<string, Intl.DateTimeFormat>();

/** Wall-clock day, hour and minute at `now` in `tz`. */
export function localTime(now: Date, tz: string): LocalTime {
  let f = formats.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formats.set(tz, f);
  }
  const part: Record<string, string> = {};
  for (const p of f.formatToParts(now)) part[p.type] = p.value;
  return {
    day: `${part.year}-${part.month}-${part.day}`,
    hour: Number(part.hour) % 24,
    minute: Number(part.minute),
  };
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The day key `n` days after `day` (calendar arithmetic, no time zone involved). */
export function shiftDay(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Day keys strictly between `from` and `to`, oldest first (capped; a long gap is just long). */
export function daysBetween(from: string, to: string, max = 400): string[] {
  const out: string[] = [];
  for (let d = shiftDay(from, 1); d < to && out.length < max; d = shiftDay(d, 1)) out.push(d);
  return out;
}

/** What the reminder needs from the learner's Progress record. */
export interface PlayState {
  lastPlay: string | null;
  streak: number;
  /** Days already covered by a freeze or repair. */
  frozenDays: Record<string, unknown>;
  /** Streak freezes held (bought − used), which the app spends on the next open. */
  freezes: number;
}

/** Pull the streak fields out of `users/{uid}.json`; null when it isn't a readable record. */
export function readPlayState(json: unknown): PlayState | null {
  if (typeof json !== "string") return null;
  let r: unknown;
  try {
    r = JSON.parse(json);
  } catch {
    return null;
  }
  if (!r || typeof r !== "object") return null;
  const p = r as Record<string, unknown>;
  const frozenDays =
    p.frozenDays && typeof p.frozenDays === "object"
      ? (p.frozenDays as Record<string, unknown>)
      : {};
  const purchases =
    p.purchases && typeof p.purchases === "object"
      ? Object.values(p.purchases as Record<string, unknown>)
      : [];
  const bought = purchases.filter(
    (x) => !!x && typeof x === "object" && (x as { item?: unknown }).item === "freeze",
  ).length;
  const used = Object.values(frozenDays).filter((v) => v === "freeze").length;
  return {
    lastPlay: typeof p.lastPlay === "string" && DAY_RE.test(p.lastPlay) ? p.lastPlay : null,
    streak: typeof p.streak === "number" && p.streak > 0 ? Math.floor(p.streak) : 0,
    frozenDays,
    freezes: Math.max(0, bought - used),
  };
}

/**
 * The streak still alive on `today` (before today's play), or 0. Mirrors the app: skipped days
 * must each be frozen/repaired, or be few enough that the freezes held will cover them on open.
 */
export function liveStreak(s: PlayState, today: string): number {
  if (!s.lastPlay || s.streak <= 0) return 0;
  if (s.lastPlay >= today) return s.streak;
  const gap = daysBetween(s.lastPlay, today).filter((d) => !(d in s.frozenDays));
  return gap.length <= s.freezes ? s.streak : 0;
}

export interface Message {
  title: string;
  body: string;
  /** Where a tap on the notification lands. */
  url: string;
  /** Notification tag: a new reminder replaces yesterday's if it is still showing. */
  tag: string;
}

/** The notification copy. No emoji — the app doesn't use them. */
export function reminderMessage(streak: number): Message {
  const base = { url: "/", tag: "yalla-daily" };
  if (streak >= 2)
    return {
      ...base,
      title: `Yalla! Keep your ${streak}-day streak`,
      body: "A few roots before midnight keeps it alive.",
    };
  if (streak === 1)
    return {
      ...base,
      title: "Yalla! Make it a 2-day streak",
      body: "A few roots before midnight keeps the run going.",
    };
  return {
    ...base,
    title: "Yalla!",
    body: "Your Shuk misses you — five minutes of roots restocks it.",
  };
}

/** A push subscription as `PushSubscription.toJSON()` stores it. */
export interface SubJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * The browsers' push services. Anything else is refused, so a signed-in user can't point their
 * doc at an arbitrary URL and have this function POST to it every day.
 */
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/, // Chrome, Edge on Android, Samsung Internet, Brave, Opera
  /^android\.googleapis\.com$/, // older Chrome
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /^web\.push\.apple\.com$/, // Safari, iOS Home Screen apps
  /^[a-z0-9-]+\.notify\.windows\.com$/, // Edge on Windows
];

export function pushHostOk(endpoint: string): boolean {
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  return u.protocol === "https:" && PUSH_HOSTS.some((re) => re.test(u.hostname));
}

export function validSub(sub: unknown): sub is SubJSON {
  if (!sub || typeof sub !== "object") return false;
  const s = sub as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return (
    typeof s.endpoint === "string" &&
    pushHostOk(s.endpoint) &&
    !!s.keys &&
    typeof s.keys.p256dh === "string" &&
    typeof s.keys.auth === "string"
  );
}

export type Due =
  | { due: true; day: string; tz: string; local: LocalTime; sub: SubJSON }
  | { due: false; reason: "off" | "bad-sub" | "not-time" | "sent-today" };

/**
 * Is this `push/{uid}` doc due on the run at `now`? Checks the switch, the subscription, the
 * local hour window and the once-a-day guard — everything but the learner's record.
 */
export function dueNow(doc: Record<string, unknown>, now: Date): Due {
  if (doc.on !== true) return { due: false, reason: "off" };
  if (!validSub(doc.sub)) return { due: false, reason: "bad-sub" };
  const hour = typeof doc.hour === "number" ? Math.floor(doc.hour) : NaN;
  const tz = safeTz(doc.tz);
  const local = localTime(now, tz);
  if (local.hour !== hour || local.minute >= WINDOW_MIN) return { due: false, reason: "not-time" };
  if (doc.lastSent === local.day) return { due: false, reason: "sent-today" };
  return { due: true, day: local.day, tz, local, sub: doc.sub };
}

/** The message for a due reminder, or null when the learner has already played today. */
export function compose(play: PlayState | null, today: string): Message | null {
  if (play?.lastPlay && play.lastPlay >= today) return null;
  return reminderMessage(play ? liveStreak(play, today) : 0);
}

/** Push TTL in seconds: never deliver a "before midnight" nudge after local midnight. */
export function ttlToMidnight(local: LocalTime): number {
  return Math.max(60, (24 * 60 - (local.hour * 60 + local.minute)) * 60);
}

/** When the run was scheduled for (Cloud Scheduler's header), falling back to `fallback`. */
export function runTime(scheduleTime: unknown, fallback: Date): Date {
  if (typeof scheduleTime !== "string") return fallback;
  const t = Date.parse(scheduleTime);
  return Number.isFinite(t) ? new Date(t) : fallback;
}

/** 404/410 from the push service: the subscription is gone for good. */
export function isGone(e: unknown): boolean {
  const code = (e as { statusCode?: unknown } | null)?.statusCode;
  return code === 404 || code === 410;
}
