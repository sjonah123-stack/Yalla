import { create } from "zustand";
import type { UnitId } from "../types";

export type View = "path" | "play" | "bank" | "patterns" | "progress" | "flashcards" | "match";

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
}

export const useUi = create<UiStore>((set) => ({
  view: "path",
  setView: (view) => set({ view }),
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
  openRoot: (id) => set({ view: "bank", bankOpen: id, bankFilter: "", unitSheet: null }),
}));
