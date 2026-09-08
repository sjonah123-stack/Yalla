import type { DayStats, Progress, RootState, Settings } from "../types";

export const KEY = "yalla.v2";
export const KEY_V1 = "yalla.v1";
export const HISTORY_DAYS = 400;

export const defaultSettings = (): Settings => ({
  sessionLen: 20,
  newPerSession: 8,
  cats: [],
  nikud: true,
  audio: true,
  learnFirst: true,
  theme: "system",
});

export const defaultProgress = (): Progress => ({
  v: 2,
  xp: 0,
  streak: 0,
  lastPlay: null,
  roots: {},
  history: {},
  settings: defaultSettings(),
  updatedAt: 0,
});

/** Coerce any stored blob (v1 or v2, possibly partial) into a well-formed Progress. */
export function normalize(raw: unknown): Progress {
  const d = defaultProgress();
  if (!raw || typeof raw !== "object") return d;
  const r = raw as Partial<Progress> & { settings?: Partial<Settings> };
  return {
    v: 2,
    xp: typeof r.xp === "number" ? r.xp : 0,
    streak: typeof r.streak === "number" ? r.streak : 0,
    lastPlay: typeof r.lastPlay === "string" ? r.lastPlay : null,
    roots: r.roots && typeof r.roots === "object" ? { ...r.roots } : {},
    history: r.history && typeof r.history === "object" ? { ...r.history } : {},
    settings: { ...d.settings, ...(r.settings ?? {}) },
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

const maxDay = (a: DayStats | undefined, b: DayStats | undefined): DayStats => ({
  ok: Math.max(a?.ok ?? 0, b?.ok ?? 0),
  bad: Math.max(a?.bad ?? 0, b?.bad ?? 0),
  xp: Math.max(a?.xp ?? 0, b?.xp ?? 0),
});

/**
 * Merge two progress records field by field so neither device's work is discarded.
 * Roots merge per id; history per day; settings from the newer record.
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
  const laterPlay = (a.lastPlay ?? "") >= (b.lastPlay ?? "") ? a : b;
  return {
    v: 2,
    xp: Math.max(a.xp, b.xp),
    streak: laterPlay.streak,
    lastPlay: laterPlay.lastPlay,
    roots,
    history,
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
    const v2 = localStorage.getItem(KEY);
    if (v2) return normalize(JSON.parse(v2));
    const v1 = localStorage.getItem(KEY_V1);
    if (v1) {
      const p = normalize(JSON.parse(v1));
      localStorage.setItem(KEY, JSON.stringify(p));
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
