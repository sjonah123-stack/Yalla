import { create } from "zustand";

export type View = "home" | "play" | "bank" | "progress" | "patterns";

interface UiStore {
  view: View;
  setView: (v: View) => void;
  toast: string;
  toastKey: number;
  showToast: (msg: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  bankFilter: string;
  setBankFilter: (s: string) => void;
  bankOpen: string | null;
  setBankOpen: (id: string | null) => void;
  /** Jump to the bank with a root expanded. */
  openRoot: (id: string) => void;
}

export const useUi = create<UiStore>((set) => ({
  view: "home",
  setView: (view) => set({ view }),
  toast: "",
  toastKey: 0,
  showToast: (toast) => set((s) => ({ toast, toastKey: s.toastKey + 1 })),
  settingsOpen: false,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  bankFilter: "",
  setBankFilter: (bankFilter) => set({ bankFilter }),
  bankOpen: null,
  setBankOpen: (bankOpen) => set({ bankOpen }),
  openRoot: (id) => set({ view: "bank", bankOpen: id, bankFilter: "" }),
}));
