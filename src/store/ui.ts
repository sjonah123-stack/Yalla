import { create } from "zustand";
import type { UnitId, View } from "../types";
import { pushTrail, scrollKey, type ShellView } from "../lib/history";

export type { View } from "../types";

export type ConfirmKind = "primary" | "plum" | "danger" | "quiet" | "text";
export interface ConfirmAction {
  label: string;
  value: string;
  kind?: ConfirmKind;
}
export interface ConfirmSpec {
  title: string;
  body?: string;
  actions: ConfirmAction[];
}
export type BankChip = "all" | "due" | "learning" | "memorized" | "unmet" | "tricky" | "flagged";
export type ToolView = "flashcards" | "match" | "familysort";
export type DrillBinyan = "pa'al" | "pi'el" | "hif'il";

interface UiStore {
  view: View;
  setView: (v: View) => void;
  /** Deduplicated tab history, home first; Back walks it. */
  trail: ShellView[];
  /** Back on a tab: return to the previous one. */
  popTab: () => void;
  /** Leave a study tool back to its unit on the path (the conjugation drill → Patterns). */
  leaveTool: () => void;
  /** Binyan the conjugation drill is running on. */
  conjBinyan: DrillBinyan | null;
  openConjugate: (b: DrillBinyan) => void;
  /** Window scroll offsets per view key (see scrollKey). */
  scrollMemory: Record<string, number>;
  rememberScroll: (key: string, y: number) => void;
  forgetScroll: (key: string) => void;
  toast: string;
  toastKey: number;
  showToast: (msg: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  /** Unit sheet open over the path. */
  unitSheet: UnitId | null;
  openUnit: (id: UnitId) => void;
  closeUnit: () => void;
  /** Unit a study tool (flashcards / match / family sort) is running on. */
  toolUnit: UnitId | null;
  openTool: (v: ToolView, id: UnitId) => void;
  bankFilter: string;
  setBankFilter: (s: string) => void;
  bankOpen: string | null;
  setBankOpen: (id: string | null) => void;
  /** Jump to the bank with a root expanded. */
  openRoot: (id: string) => void;
  bankChip: BankChip;
  setBankChip: (c: BankChip) => void;
  /** The in-app confirm sheet; null when closed. */
  confirmSpec: ConfirmSpec | null;
  /** Ask; resolves with the tapped action's value, or null on Escape / backdrop. */
  confirm: (spec: ConfirmSpec) => Promise<string | null>;
  resolveConfirm: (value: string | null) => void;
}

let resolver: ((v: string | null) => void) | null = null;

export const useUi = create<UiStore>((set) => ({
  view: "home",
  // Changing tab always closes the unit sheet (it floats over the path only).
  setView: (view) => set((s) => ({ view, unitSheet: null, trail: pushTrail(s.trail, view) })),
  trail: ["home"],
  popTab: () =>
    set((s) => {
      const trail = s.trail.length > 1 ? s.trail.slice(0, -1) : s.trail;
      return { trail, view: trail[trail.length - 1], unitSheet: null };
    }),
  leaveTool: () =>
    set((s) =>
      s.view === "conjugate"
        ? { view: "patterns", trail: pushTrail(s.trail, "patterns"), toolUnit: null }
        : {
            view: "path",
            trail: pushTrail(s.trail, "path"),
            unitSheet: s.toolUnit,
            toolUnit: null,
          },
    ),
  conjBinyan: null,
  openConjugate: (conjBinyan) => set({ view: "conjugate", conjBinyan, unitSheet: null }),
  scrollMemory: {},
  rememberScroll: (key, y) =>
    set((s) => (s.scrollMemory[key] === y ? s : { scrollMemory: { ...s.scrollMemory, [key]: y } })),
  forgetScroll: (key) =>
    set((s) => {
      if (!(key in s.scrollMemory)) return s;
      const scrollMemory = { ...s.scrollMemory };
      delete scrollMemory[key];
      return { scrollMemory };
    }),
  toast: "",
  toastKey: 0,
  showToast: (toast) => set((s) => ({ toast, toastKey: s.toastKey + 1 })),
  settingsOpen: false,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  unitSheet: null,
  openUnit: (unitSheet) => set({ unitSheet }),
  closeUnit: () => set({ unitSheet: null }),
  toolUnit: null,
  openTool: (view, toolUnit) => set({ view, toolUnit, unitSheet: null }),
  bankFilter: "",
  setBankFilter: (bankFilter) => set({ bankFilter }),
  bankOpen: null,
  setBankOpen: (bankOpen) => set({ bankOpen }),
  openRoot: (id) =>
    set((s) => {
      const scrollMemory = { ...s.scrollMemory };
      delete scrollMemory[scrollKey("bank", "", "all")];
      return {
        view: "bank",
        trail: pushTrail(s.trail, "bank"),
        bankOpen: id,
        bankFilter: "",
        bankChip: "all",
        unitSheet: null,
        scrollMemory,
      };
    }),
  bankChip: "all",
  setBankChip: (bankChip) => set({ bankChip }),
  confirmSpec: null,
  confirm: (spec) => {
    resolver?.(null);
    return new Promise<string | null>((resolve) => {
      resolver = resolve;
      set({ confirmSpec: spec });
    });
  },
  resolveConfirm: (value) => {
    const r = resolver;
    resolver = null;
    set({ confirmSpec: null });
    r?.(value);
  },
}));
