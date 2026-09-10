import { create } from "zustand";
import type { UnitId } from "../types";

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
export type BankChip = "all" | "due" | "learning" | "memorized" | "unmet" | "tricky";

export type View =
  "home" | "path" | "play" | "bank" | "patterns" | "progress" | "flashcards" | "match";

interface UiStore {
  view: View;
  setView: (v: View) => void;
  toast: string;
  toastKey: number;
  showToast: (msg: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  /** Unit sheet open over the path. */
  unitSheet: UnitId | null;
  openUnit: (id: UnitId) => void;
  closeUnit: () => void;
  /** Unit a study tool (flashcards / match) is running on. */
  toolUnit: UnitId | null;
  openTool: (v: "flashcards" | "match", id: UnitId) => void;
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
  setView: (view) => set({ view, unitSheet: null }),
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
    set({ view: "bank", bankOpen: id, bankFilter: "", bankChip: "all", unitSheet: null }),
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
