import type {
  DayStats,
  Progress,
  RootState,
  SealId,
  Settings,
  UnitRecord,
  FlagReason,
  RootFlag,
  WordStat,
} from "../types";
import { SECTIONS, UNIT_IDS } from "../data/course";
import { SEAL_IDS } from "./rewards";

export const KEY = "yalla.v3";
export const KEY_V2 = "yalla.v2";
export const KEY_V1 = "yalla.v1";
export const HISTORY_DAYS = 400;

export const defaultSettings = (): Settings => ({
  sessionLen: 20,
  cats: [],
  nikud: true,
  audio: true,
  learnFirst: true,
  theme: "system",
  dailyGoal: 50,
  sounds: true,
});

export const defaultProgress = (): Progress => ({
  v: 3,
  xp: 0,
  streak: 0,
  lastPlay: null,
  roots: {},
  history: {},
  units: {},
  placement: null,
  lastUnit: null,
  settings: defaultSettings(),
  updatedAt: 0,
  gems: 0,
  seals: {},
  bestCombo: 0,
  perfectLessons: 0,
  typedOk: 0,
  sectionChests: {},
  onboardedAt: null,
  resetAt: 0,
  flags: {},
  words: {},
  tourAt: null,
});

/** Keep only word stats with numeric counts. */
function wordMap(raw: unknown): Record<string, WordStat> {
  const out: Record<string, WordStat> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [h, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const w = v as Partial<WordStat>;
    if (typeof w.ok !== "number" || typeof w.bad !== "number") continue;
    out[h] = { ok: count(w.ok), bad: count(w.bad) };
  }
  return out;
}

const FLAG_REASONS = new Set(["gloss", "nikud", "translit", "audio", "root", "other"]);
export const FLAG_NOTE_MAX = 140;

/** Keep only well-formed flags: numeric `at`, known reason, clamped note, optional cleared. */
function flagMap(raw: unknown): Record<string, RootFlag> {
  const out: Record<string, RootFlag> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const f = v as Partial<RootFlag>;
    if (typeof f.at !== "number" || !FLAG_REASONS.has(f.why as string)) continue;
    const flag: RootFlag = { at: f.at, why: f.why as FlagReason };
    if (typeof f.note === "string" && f.note.trim())
      flag.note = f.note.trim().slice(0, FLAG_NOTE_MAX);
    if (typeof f.cleared === "number") flag.cleared = f.cleared;
    out[id] = flag;
  }
  return out;
}

/** The flag whose latest event (flag or clear) is newer wins. */
export function mergeFlag(a: RootFlag | undefined, b: RootFlag | undefined): RootFlag | undefined {
  if (!a) return b;
  if (!b) return a;
  const ta = Math.max(a.at, a.cleared ?? 0);
  const tb = Math.max(b.at, b.cleared ?? 0);
  return ta >= tb ? a : b;
}

const KNOWN_UNITS = new Set<string>(UNIT_IDS);
const KNOWN_SECTIONS = new Set<string>(SECTIONS.map((s) => s.id));
const KNOWN_SEALS = new Set<string>(SEAL_IDS);

/** Non-negative integer, else 0. */
const count = (x: unknown): number => (typeof x === "number" && x >= 0 ? Math.floor(x) : 0);

/** Keep only `known` keys whose values are numbers. */
function numericMap(raw: unknown, known: ReadonlySet<string>): Record<string, number> {
  const out: Record<string, number> = {};
  if (raw && typeof raw === "object")
    for (const [k, v] of Object.entries(raw as Record<string, unknown>))
      if (known.has(k) && typeof v === "number") out[k] = v;
  return out;
}

/** Coerce any stored blob (v1, v2 or v3, possibly partial) into a well-formed Progress. */
export function normalize(raw: unknown): Progress {
  const d = defaultProgress();
  if (!raw || typeof raw !== "object") return d;
  const r = raw as Partial<Progress> & {
    settings?: Partial<Settings> & { newPerSession?: number };
  };
  const settings = { ...d.settings, ...(r.settings ?? {}) } as Settings & {
    newPerSession?: number;
  };
  delete settings.newPerSession;
  if (![20, 50, 100].includes(settings.dailyGoal)) settings.dailyGoal = 50;
  if (typeof settings.sounds !== "boolean") settings.sounds = true;
  const units: Record<string, UnitRecord> = {};
  if (r.units && typeof r.units === "object")
    for (const [id, rec] of Object.entries(r.units))
      if (KNOWN_UNITS.has(id) && rec && typeof rec === "object") units[id] = { ...rec };
  const placement =
    r.placement && typeof r.placement === "object" && KNOWN_UNITS.has(r.placement.startUnit)
      ? { ...r.placement }
      : null;
  const roots = r.roots && typeof r.roots === "object" ? { ...r.roots } : {};
  let onboardedAt: number | null;
  if (typeof r.onboardedAt === "number") onboardedAt = r.onboardedAt;
  else {
    // Legacy blob: anyone who has played (or placed) has implicitly been onboarded.
    const played =
      !!placement ||
      !!r.lastUnit ||
      Object.values(roots).some((st) => st && typeof st === "object" && st.ok + st.bad > 0);
    onboardedAt = played ? (typeof r.updatedAt === "number" && r.updatedAt) || 1 : null;
  }
  return {
    v: 3,
    xp: typeof r.xp === "number" ? r.xp : 0,
    streak: typeof r.streak === "number" ? r.streak : 0,
    lastPlay: typeof r.lastPlay === "string" ? r.lastPlay : null,
    roots,
    history: r.history && typeof r.history === "object" ? { ...r.history } : {},
    units,
    placement,
    lastUnit: typeof r.lastUnit === "string" && KNOWN_UNITS.has(r.lastUnit) ? r.lastUnit : null,
    settings,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
    gems: count(r.gems),
    seals: numericMap(r.seals, KNOWN_SEALS) as Partial<Record<SealId, number>>,
    bestCombo: count(r.bestCombo),
    perfectLessons: count(r.perfectLessons),
    typedOk: count(r.typedOk),
    sectionChests: numericMap(r.sectionChests, KNOWN_SECTIONS),
    onboardedAt,
    resetAt: count(r.resetAt),
    flags: flagMap(r.flags),
    words: wordMap(r.words),
    tourAt: typeof r.tourAt === "number" ? r.tourAt : null,
  };
}

function betterRoot(a: RootState | undefined, b: RootState | undefined): RootState | undefined {
  if (!a) return b;
  if (!b) return a;
  // More total exposure wins; then the further-scheduled one.
  const ea = a.ok + a.bad;
  const eb = b.ok + b.bad;
  if (ea !== eb) return ea > eb ? a : b;
  if (a.reps !== b.reps) return a.reps > b.reps ? a : b;
  return a.due >= b.due ? a : b;
}

const maxDay = (a: DayStats | undefined, b: DayStats | undefined): DayStats => {
  const out: DayStats = {
    ok: Math.max(a?.ok ?? 0, b?.ok ?? 0),
    bad: Math.max(a?.bad ?? 0, b?.bad ?? 0),
    xp: Math.max(a?.xp ?? 0, b?.xp ?? 0),
  };
  const mem = Math.max(a?.mem ?? -1, b?.mem ?? -1);
  if (mem >= 0) out.mem = mem;
  const sb = Math.max(a?.speedBest ?? -1, b?.speedBest ?? -1);
  if (sb >= 0) out.speedBest = sb;
  return out;
};

const minDef = (a?: number, b?: number): number | undefined =>
  a === undefined ? b : b === undefined ? a : Math.min(a, b);
const maxDef = (a?: number, b?: number): number | undefined =>
  a === undefined ? b : b === undefined ? a : Math.max(a, b);

export function mergeUnit(a: UnitRecord | undefined, b: UnitRecord | undefined): UnitRecord {
  const out: UnitRecord = {};
  const completedAt = minDef(a?.completedAt, b?.completedAt);
  if (completedAt !== undefined) out.completedAt = completedAt;
  if (a?.placed || b?.placed) out.placed = true;
  const testBest = maxDef(a?.testBest, b?.testBest);
  if (testBest !== undefined) out.testBest = testBest;
  const testPassedAt = minDef(a?.testPassedAt, b?.testPassedAt);
  if (testPassedAt !== undefined) out.testPassedAt = testPassedAt;
  const matchBestMs = minDef(a?.matchBestMs, b?.matchBestMs);
  if (matchBestMs !== undefined) out.matchBestMs = matchBestMs;
  const sortBestMs = minDef(a?.sortBestMs, b?.sortBestMs);
  if (sortBestMs !== undefined) out.sortBestMs = sortBestMs;
  const chestAt = minDef(a?.chestAt, b?.chestAt);
  if (chestAt !== undefined) out.chestAt = chestAt;
  return out;
}

/** Union of two id → timestamp maps, keeping the earliest where both have one. */
function unionEarliest(
  a: Record<string, number | undefined>,
  b: Record<string, number | undefined>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const v = minDef(a[k], b[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Merge two progress records field by field so neither device's work is discarded.
 * Roots merge per id; history per day; units per id; settings from the newer record.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  // A reset is an epoch: the record with the newer resetAt replaces the other wholesale.
  if (a.resetAt !== b.resetAt) return { ...(a.resetAt > b.resetAt ? a : b) };
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const roots: Record<string, RootState> = {};
  for (const id of new Set([...Object.keys(a.roots), ...Object.keys(b.roots)])) {
    const best = betterRoot(a.roots[id], b.roots[id]);
    if (best) roots[id] = { ...best };
  }
  const history: Record<string, DayStats> = {};
  for (const day of new Set([...Object.keys(a.history), ...Object.keys(b.history)])) {
    history[day] = maxDay(a.history[day], b.history[day]);
  }
  const units: Record<string, UnitRecord> = {};
  for (const id of new Set([...Object.keys(a.units), ...Object.keys(b.units)])) {
    units[id] = mergeUnit(a.units[id], b.units[id]);
  }
  const placement =
    a.placement && b.placement
      ? a.placement.at <= b.placement.at
        ? a.placement
        : b.placement
      : (a.placement ?? b.placement);
  const laterPlay = (a.lastPlay ?? "") >= (b.lastPlay ?? "") ? a : b;
  const flags: Record<string, RootFlag> = {};
  for (const id of new Set([...Object.keys(a.flags), ...Object.keys(b.flags)])) {
    const f = mergeFlag(a.flags[id], b.flags[id]);
    if (f) flags[id] = { ...f };
  }
  const words: Record<string, WordStat> = {};
  for (const h of new Set([...Object.keys(a.words), ...Object.keys(b.words)])) {
    const x = a.words[h];
    const y = b.words[h];
    words[h] = { ok: Math.max(x?.ok ?? 0, y?.ok ?? 0), bad: Math.max(x?.bad ?? 0, y?.bad ?? 0) };
  }
  return {
    v: 3,
    xp: Math.max(a.xp, b.xp),
    streak: laterPlay.streak,
    lastPlay: laterPlay.lastPlay,
    roots,
    history,
    units,
    placement: placement ? { ...placement } : null,
    lastUnit: newer.lastUnit,
    settings: { ...newer.settings },
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    gems: Math.max(a.gems, b.gems),
    seals: unionEarliest(a.seals, b.seals) as Partial<Record<SealId, number>>,
    bestCombo: Math.max(a.bestCombo, b.bestCombo),
    perfectLessons: Math.max(a.perfectLessons, b.perfectLessons),
    typedOk: Math.max(a.typedOk, b.typedOk),
    sectionChests: unionEarliest(a.sectionChests, b.sectionChests),
    onboardedAt:
      a.onboardedAt === null
        ? b.onboardedAt
        : b.onboardedAt === null
          ? a.onboardedAt
          : Math.min(a.onboardedAt, b.onboardedAt),
    resetAt: a.resetAt,
    flags,
    words,
    tourAt: minDef(a.tourAt ?? undefined, b.tourAt ?? undefined) ?? null,
  };
}

/** Keep only the trailing `days` of history so the blob stops growing forever. */
export function pruneHistory(p: Progress, days = HISTORY_DAYS): Progress {
  const keys = Object.keys(p.history).sort();
  if (keys.length <= days) return p;
  const keep = new Set(keys.slice(-days));
  const history: Record<string, DayStats> = {};
  for (const k of keep) history[k] = p.history[k];
  return { ...p, history };
}

export function loadLocal(): Progress {
  try {
    for (const key of [KEY, KEY_V2, KEY_V1]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const p = normalize(JSON.parse(raw));
      if (key !== KEY) localStorage.setItem(KEY, JSON.stringify(p));
      return p;
    }
  } catch {
    /* no storage */
  }
  return defaultProgress();
}

export function saveLocal(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ---------- Remote sync ----------
//
// Two backends share one seam: the Claude artifact DB (single-file build) and Firestore
// (web build, see cloud.ts). Local storage stays the source of truth; the remote is merged
// on connect and written through a trailing debounce on every local change.

export type SyncStatus = "local" | "synced" | "error";

export interface RemoteBackend {
  /** Read the remote record; null when none exists yet. */
  load(): Promise<Progress | null>;
  /** Overwrite the remote record. */
  save(p: Progress): Promise<void>;
  /** Live updates from other devices; returns an unsubscribe. */
  subscribe?(cb: (incoming: Progress, hasPendingWrites: boolean) => void): () => void;
}

export const PUSH_DELAY = 800;

let remote: RemoteBackend | null = null;
let pending: { p: Progress; timer: ReturnType<typeof setTimeout> } | null = null;
let lastPushedAt = 0;
let syncedAt = 0;

/** Attach (or, with null, detach) the remote. Detaching drops any queued push. */
export function setRemote(r: RemoteBackend | null): void {
  if (pending) clearTimeout(pending.timer);
  pending = null;
  remote = r;
  if (!r) lastPushedAt = syncedAt = 0;
}

export const remoteConnected = (): boolean => !!remote;
/** `updatedAt` of the last record handed to the remote (0 = nothing pushed yet). */
export const lastPushedUpdatedAt = (): number => lastPushedAt;
export const pushPending = (): boolean => !!pending;
/** Wall-clock time of the last push the remote accepted (0 = none since attach). */
export const lastSyncedAt = (): number => syncedAt;
/** Swap the payload of a queued push (after an incoming merge) without resetting its timer. */
export function replacePending(p: Progress): void {
  if (pending) pending.p = p;
}

/** Debounced push to the remote. Resolves with the resulting status. */
export function pushRemote(p: Progress, immediate = false): Promise<SyncStatus> {
  const r = remote;
  if (!r) return Promise.resolve("local");
  if (pending) clearTimeout(pending.timer);
  return new Promise((resolve) => {
    const go = () => {
      const payload = pending?.p ?? p;
      pending = null;
      lastPushedAt = payload.updatedAt;
      r.save(payload)
        .then(() => {
          syncedAt = Date.now();
          resolve("synced");
        })
        .catch(() => resolve("error"));
    };
    if (immediate) {
      pending = null;
      go();
    } else pending = { p, timer: setTimeout(go, PUSH_DELAY) };
  });
}

/**
 * Decide what a live update from the remote means for the local record.
 * Returns the record to adopt, or null when nothing should change.
 */
export function applyIncoming(
  local: Progress,
  incoming: Progress,
  lastPushed: number,
  hasPendingWrites: boolean,
): Progress | null {
  if (hasPendingWrites) return null; // latency-compensated echo of our own write
  if (incoming.updatedAt === lastPushed) return null; // server ack of our own write
  const merged = mergeProgress(local, incoming);
  return JSON.stringify(merged) === JSON.stringify(local) ? null : merged;
}

// ----- Cloud document shape and sign-in reconciliation (Firestore) -----

export interface CloudDoc {
  v: 3;
  updatedAt: number;
  resetAt: number;
  /** The whole Progress as JSON: no undefined fields, no per-field indexing, Hebrew keys are fine. */
  json: string;
}

export const encodeDoc = (p: Progress): CloudDoc => ({
  v: 3,
  updatedAt: p.updatedAt,
  resetAt: p.resetAt,
  json: JSON.stringify(p),
});

export function decodeDoc(data: unknown): Progress | null {
  if (!data || typeof data !== "object") return null;
  const json = (data as { json?: unknown }).json;
  if (typeof json !== "string") return null;
  try {
    return normalize(JSON.parse(json));
  } catch {
    return null;
  }
}

export type ReconcileMode = "merge" | "replace" | "upload" | "fresh";

/**
 * What to adopt when `uid` signs in on a device whose last synced account was `lastUid`.
 * A device that never synced (or synced this same account) merges; a device last used by someone
 * else takes the cloud record as-is and never uploads the other person's progress.
 */
export function reconcileSignIn(
  local: Progress,
  cloud: Progress | null,
  lastUid: string | null,
  uid: string,
): { p: Progress; mode: ReconcileMode } {
  const sameDevice = lastUid === null || lastUid === uid;
  if (!cloud)
    return sameDevice ? { p: local, mode: "upload" } : { p: defaultProgress(), mode: "fresh" };
  if (sameDevice) return { p: mergeProgress(local, cloud), mode: "merge" };
  return { p: cloud, mode: "replace" };
}

export const KEY_UID = "yalla.uid";
export const KEY_CLOUD = "yalla.cloud";

export function getLastUid(): string | null {
  try {
    return localStorage.getItem(KEY_UID);
  } catch {
    return null;
  }
}
export function setLastUid(uid: string): void {
  try {
    localStorage.setItem(KEY_UID, uid);
  } catch {
    /* ignore */
  }
}
/** Whether a cloud session was active on this device (drives SDK preload at startup). */
export function cloudFlag(): boolean {
  try {
    return localStorage.getItem(KEY_CLOUD) === "1";
  } catch {
    return false;
  }
}
export function setCloudFlag(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY_CLOUD, "1");
    else localStorage.removeItem(KEY_CLOUD);
  } catch {
    /* ignore */
  }
}

// ----- Claude artifact DB (single-file build) -----

interface ClaudeDoc {
  get(): Promise<{ exists: boolean; data(): unknown }>;
  set(data: unknown): Promise<void>;
}
interface ClaudeDb {
  doc(path: string): ClaudeDoc;
}
declare global {
  interface Window {
    claude?: { use?: (name: string) => Promise<ClaudeDb | null> };
  }
}

const claudeBackend = (db: ClaudeDb): RemoteBackend => ({
  async load() {
    const snap = await db.doc("progress/main").get();
    return snap.exists ? normalize(snap.data()) : null;
  },
  save: (p) => db.doc("progress/main").set(p),
});

/** Connect to the artifact DB if present; returns the merged record to adopt, or null. */
export async function connectRemote(local: Progress): Promise<Progress | null> {
  if (typeof window === "undefined" || typeof window.claude?.use !== "function") return null;
  try {
    const db = (await window.claude.use("db")) ?? null;
    if (!db) return null;
    const backend = claudeBackend(db);
    const cloud = await backend.load();
    const merged = cloud ? mergeProgress(local, cloud) : local;
    await backend.save(merged);
    setRemote(backend);
    lastPushedAt = merged.updatedAt;
    return merged;
  } catch {
    setRemote(null);
    return null;
  }
}
