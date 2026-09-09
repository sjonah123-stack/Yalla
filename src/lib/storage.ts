import type { DayStats, Progress, RootState, Settings, UnitRecord } from "../types";
import { UNIT_IDS } from "../data/course";

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
});

const KNOWN_UNITS = new Set<string>(UNIT_IDS);

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
  const units: Record<string, UnitRecord> = {};
  if (r.units && typeof r.units === "object")
    for (const [id, rec] of Object.entries(r.units))
      if (KNOWN_UNITS.has(id) && rec && typeof rec === "object") units[id] = { ...rec };
  const placement =
    r.placement && typeof r.placement === "object" && KNOWN_UNITS.has(r.placement.startUnit)
      ? { ...r.placement }
      : null;
  return {
    v: 3,
    xp: typeof r.xp === "number" ? r.xp : 0,
    streak: typeof r.streak === "number" ? r.streak : 0,
    lastPlay: typeof r.lastPlay === "string" ? r.lastPlay : null,
    roots: r.roots && typeof r.roots === "object" ? { ...r.roots } : {},
    history: r.history && typeof r.history === "object" ? { ...r.history } : {},
    units,
    placement,
    lastUnit: typeof r.lastUnit === "string" && KNOWN_UNITS.has(r.lastUnit) ? r.lastUnit : null,
    settings,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
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
  return out;
}

/**
 * Merge two progress records field by field so neither device's work is discarded.
 * Roots merge per id; history per day; units per id; settings from the newer record.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
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

// ---------- Claude artifact DB (optional, cross-device) ----------

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

export type SyncStatus = "local" | "synced" | "error";

let db: ClaudeDb | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

/** Connect to the artifact DB if present; returns the merged record to adopt, or null. */
export async function connectRemote(local: Progress): Promise<Progress | null> {
  if (typeof window === "undefined" || typeof window.claude?.use !== "function") return null;
  try {
    db = (await window.claude.use("db")) ?? null;
    if (!db) return null;
    const snap = await db.doc("progress/main").get();
    if (!snap.exists) {
      await db.doc("progress/main").set(local);
      return local;
    }
    const merged = mergeProgress(local, normalize(snap.data()));
    await db.doc("progress/main").set(merged);
    return merged;
  } catch {
    db = null;
    return null;
  }
}

export const remoteConnected = (): boolean => !!db;

/** Debounced push to the remote. Resolves with the resulting status. */
export function pushRemote(p: Progress, immediate = false): Promise<SyncStatus> {
  if (!db) return Promise.resolve("local");
  if (timer) clearTimeout(timer);
  return new Promise((resolve) => {
    const go = () =>
      db!
        .doc("progress/main")
        .set(p)
        .then(() => resolve("synced"))
        .catch(() => resolve("error"));
    if (immediate) go();
    else timer = setTimeout(go, 800);
  });
}
