import { create } from "zustand";
import type { Progress, RootState, Settings } from "../types";
import { applyAnswer, dayKey, touchStreak } from "../lib/srs";
import {
  defaultProgress,
  loadLocal,
  pruneHistory,
  pushRemote,
  saveLocal,
  type SyncStatus,
} from "../lib/storage";

interface ProgressStore {
  p: Progress;
  sync: SyncStatus;
  /** Replace the whole record (after remote merge). */
  adopt: (p: Progress) => void;
  setSync: (s: SyncStatus) => void;
  setSettings: (patch: Partial<Settings>) => void;
  toggleCat: (cat: string) => void;
  /** Record an answer: SRS update, history, xp, streak. Returns the new root state. */
  recordAnswer: (id: string, correct: boolean, first: boolean, xp: number) => RootState;
  reset: () => void;
}

function persist(p: Progress, set: (s: Partial<ProgressStore>) => void): Progress {
  const next = pruneHistory({ ...p, updatedAt: Date.now() });
  saveLocal(next);
  pushRemote(next).then((s) => set({ sync: s }));
  return next;
}

export const useProgress = create<ProgressStore>((set, get) => ({
  p: loadLocal(),
  sync: "local",
  adopt: (p) => {
    saveLocal(p);
    set({ p });
  },
  setSync: (sync) => set({ sync }),
  setSettings: (patch) =>
    set({ p: persist({ ...get().p, settings: { ...get().p.settings, ...patch } }, set) }),
  toggleCat: (cat) => {
    const cats = get().p.settings.cats.slice();
    const i = cats.indexOf(cat);
    if (i >= 0) cats.splice(i, 1);
    else cats.push(cat);
    get().setSettings({ cats });
  },
  recordAnswer: (id, correct, first, xp) => {
    const p = get().p;
    const now = Date.now();
    const st = applyAnswer(p.roots[id], correct, first, now);
    const day = dayKey();
    const h = { ...(p.history[day] ?? { ok: 0, bad: 0, xp: 0 }) };
    if (correct) h.ok++;
    else h.bad++;
    h.xp += xp;
    let streak = p.streak;
    let lastPlay = p.lastPlay;
    if (correct) ({ streak, lastPlay } = touchStreak(p.streak, p.lastPlay));
    set({
      p: persist(
        {
          ...p,
          xp: p.xp + xp,
          streak,
          lastPlay,
          roots: { ...p.roots, [id]: st },
          history: { ...p.history, [day]: h },
        },
        set,
      ),
    });
    return st;
  },
  reset: () => {
    set({ p: persist(defaultProgress(), set) });
  },
}));

/** Selector helpers. */
export const useSettings = () => useProgress((s) => s.p.settings);
export const useRootState = (id: string) => useProgress((s) => s.p.roots[id]);
