import type { UnitId, View } from "../types";

// ---------- Tabs ----------
export const SHELL_VIEWS = ["home", "path", "bank", "patterns", "progress"] as const;
export type ShellView = (typeof SHELL_VIEWS)[number];
export const isShellView = (v: View): v is ShellView =>
  (SHELL_VIEWS as readonly string[]).includes(v);

/** The deduplicated tab trail: home first; revisiting a tab truncates back to it. */
export function pushTrail(trail: readonly ShellView[], v: View): ShellView[] {
  if (!isShellView(v)) return trail.slice();
  const i = trail.indexOf(v);
  if (i >= 0) return trail.slice(0, i + 1);
  return [...trail, v];
}

// ---------- Layers ----------
export interface NavState {
  trail: readonly ShellView[];
  view: View;
  unitSheet: UnitId | null;
  toolUnit: UnitId | null;
  settingsOpen: boolean;
  confirmOpen: boolean;
  /** A session (running or on its summary) exists. */
  session: boolean;
  onboarded: boolean;
}

export type Layer =
  | { kind: "tab"; view: ShellView }
  | { kind: "unit" }
  | { kind: "settings" }
  | { kind: "tool"; view: View }
  | { kind: "play" }
  | { kind: "confirm" };

export const TOOL_VIEWS: readonly View[] = ["flashcards", "match", "familysort", "conjugate"];

/**
 * Everything the back gesture can close, bottom to top. Mirrors App.tsx's render order:
 * play beats everything, then a tool, then the shell with its unit sheet and settings;
 * a confirm sheet is always on top. The welcome screen has nothing dismissible.
 */
export function layerStack(s: NavState): Layer[] {
  const out: Layer[] = [];
  const play = s.session && s.view === "play";
  if (!s.onboarded && !play) return s.confirmOpen ? [{ kind: "confirm" }] : [];
  for (const v of s.trail.slice(1)) out.push({ kind: "tab", view: v });
  if (play) out.push({ kind: "play" });
  else if (TOOL_VIEWS.includes(s.view) && (s.toolUnit || s.view === "conjugate"))
    out.push({ kind: "tool", view: s.view });
  else if (isShellView(s.view)) {
    if (s.unitSheet) out.push({ kind: "unit" });
    if (s.settingsOpen) out.push({ kind: "settings" });
  }
  if (s.confirmOpen) out.push({ kind: "confirm" });
  return out;
}

export const topLayer = (s: NavState): Layer | null => layerStack(s).at(-1) ?? null;

export type BackAction =
  "none" | "closeConfirm" | "closeSettings" | "closeUnit" | "leaveTool" | "quitPlay" | "popTab";

/** What one back gesture does. */
export function reduceBack(s: NavState): BackAction {
  const top = topLayer(s);
  switch (top?.kind) {
    case "confirm":
      return "closeConfirm";
    case "settings":
      return "closeSettings";
    case "unit":
      return "closeUnit";
    case "tool":
      return "leaveTool";
    case "play":
      return "quitPlay";
    case "tab":
      return "popTab";
    default:
      return "none";
  }
}

/** Where a finished session lands when left; Summary's buttons and Back agree. */
export function summaryExit(plan: { kind: string; unit?: UnitId }): {
  view: "path" | "home";
  unit?: UnitId;
} {
  if (plan.kind === "speed") return { view: "home" };
  if ((plan.kind === "lesson" || plan.kind === "test") && plan.unit)
    return { view: "path", unit: plan.unit };
  return { view: "path" };
}

/** Scroll memory key: the bank's position depends on what it is showing. */
export const scrollKey = (view: View, bankFilter: string, bankChip: string): string =>
  view === "bank" ? `bank|${bankFilter.trim().toLowerCase()}|${bankChip}` : view;

// ---------- History mirror ----------
export interface HistoryPort {
  push(depth: number): void;
  go(delta: number): void;
}
export type PopResult = "consumed" | "back" | "forward" | "same";
export interface Mirror {
  readonly cur: number;
  readonly inflight: boolean;
  /** Make the history depth match the number of open layers. */
  sync(want: number): void;
  /** A popstate arrived at `depth` (null = an entry we did not write). */
  onPop(depth: number | null): PopResult;
  /** Recovery when an expected popstate never came. */
  reset(depth: number): void;
}

/**
 * Keeps one history entry per open layer. The store is the source of truth: opening pushes,
 * closing issues a single go(-k) whose popstate is consumed; any other popstate is a user
 * gesture that the caller answers by closing exactly one layer, then syncing again.
 */
export function createMirror(port: HistoryPort, initialDepth = 0): Mirror {
  let cur = initialDepth;
  let inflight = false;
  let pending: number | null = null;
  return {
    get cur() {
      return cur;
    },
    get inflight() {
      return inflight;
    },
    sync(want) {
      if (inflight) {
        pending = want;
        return;
      }
      if (want > cur) {
        while (cur < want) port.push(++cur);
      } else if (want < cur) {
        inflight = true;
        port.go(want - cur);
      }
    },
    onPop(depth) {
      const d = depth ?? 0;
      const prev = cur;
      cur = d;
      if (inflight) {
        inflight = false;
        const p = pending;
        pending = null;
        if (p !== null && p !== cur) this.sync(p);
        return "consumed";
      }
      return d < prev ? "back" : d > prev ? "forward" : "same";
    },
    reset(depth) {
      inflight = false;
      pending = null;
      cur = depth;
    },
  };
}
