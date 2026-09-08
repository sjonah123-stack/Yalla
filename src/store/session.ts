import { create } from "zustand";
import type { Mode, Question, Root } from "../types";
import { ROOTS } from "../data/roots";
import { buildQueue, mastery, seen } from "../lib/srs";
import { makeQuestion, modeFor, xpFor } from "../lib/quiz";
import { speechAvailable } from "../lib/speech";
import { useProgress } from "./progress";

export type Tick = "pending" | "good" | "bad" | "recovered";

export interface Session {
  /** The fixed set of roots for this session; one rail tick each. */
  slots: Root[];
  ticks: Tick[];
  /** Working queue (slot indices); missed roots get re-inserted. */
  queue: number[];
  /** Index into queue. */
  i: number;
  q: Question | null;
  /** Slot index of the current question. */
  slot: number;
  /** Show the "meet this root" card before the first question on unseen roots. */
  learning: boolean;
  answered: boolean;
  lastCorrect: boolean;
  lastXp: number;
  picked: number | null;
  typed: string[];
  combo: number;
  best: number;
  ok: number;
  bad: number;
  xp: number;
  retried: Set<number>;
  learned: string[];
  missed: string[];
  done: boolean;
}

interface SessionStore {
  s: Session | null;
  start: (len?: number) => boolean;
  dismissLearn: () => void;
  pickOption: (i: number) => void;
  typeKey: (k: string) => void;
  submitTyped: () => void;
  next: () => void;
  end: () => void;
  clear: () => void;
}

function question(root: Root): Question {
  const st = useProgress.getState().p.roots[root.r];
  const mode: Mode = modeFor(root, mastery(st), {
    audio: speechAvailable() && useProgress.getState().p.settings.audio,
  });
  return makeQuestion(root, ROOTS, mode);
}

function load(s: Session): Session {
  if (s.i >= s.queue.length) return { ...s, done: true, q: null };
  const slot = s.queue[s.i];
  const root = s.slots[slot];
  const prog = useProgress.getState().p;
  const learning = prog.settings.learnFirst && !seen(prog.roots[root.r]) && !s.retried.has(slot);
  return {
    ...s,
    slot,
    q: question(root),
    learning,
    answered: false,
    picked: null,
    typed: [],
    lastXp: 0,
  };
}

export const useSession = create<SessionStore>((set, get) => ({
  s: null,
  start: (len) => {
    const prog = useProgress.getState().p;
    const slots = buildQueue(ROOTS, prog, len ?? prog.settings.sessionLen);
    if (!slots.length) return false;
    const s: Session = {
      slots,
      ticks: slots.map(() => "pending"),
      queue: slots.map((_, i) => i),
      i: 0,
      q: null,
      slot: 0,
      learning: false,
      answered: false,
      lastCorrect: false,
      lastXp: 0,
      picked: null,
      typed: [],
      combo: 0,
      best: 0,
      ok: 0,
      bad: 0,
      xp: 0,
      retried: new Set(),
      learned: [],
      missed: [],
      done: false,
    };
    set({ s: load(s) });
    return true;
  },
  dismissLearn: () => {
    const s = get().s;
    if (s) set({ s: { ...s, learning: false } });
  },
  pickOption: (i) => {
    const s = get().s;
    if (!s || !s.q?.opts || s.answered) return;
    answer(s, s.q.opts[i].ok, i, set);
  },
  typeKey: (k) => {
    const s = get().s;
    if (!s || s.q?.mode !== "typeRoot" || s.answered) return;
    const L = s.q.answer!.length;
    if (k === "⌫") return set({ s: { ...s, typed: s.typed.slice(0, -1) } });
    if (s.typed.length >= L) return;
    const typed = [...s.typed, k];
    if (typed.length === L) answer({ ...s, typed }, typed.join("") === s.q.answer, null, set);
    else set({ s: { ...s, typed } });
  },
  submitTyped: () => {
    const s = get().s;
    if (!s || s.q?.mode !== "typeRoot" || s.answered) return;
    if (s.typed.length === s.q.answer!.length)
      answer(s, s.typed.join("") === s.q.answer, null, set);
  },
  next: () => {
    const s = get().s;
    if (!s || !s.answered) return;
    set({ s: load({ ...s, i: s.i + 1 }) });
  },
  end: () => {
    const s = get().s;
    if (s) set({ s: { ...s, done: true, q: null } });
  },
  clear: () => set({ s: null }),
}));

function answer(
  s: Session,
  correct: boolean,
  picked: number | null,
  set: (p: Partial<SessionStore>) => void,
) {
  const q = s.q!;
  const id = q.root.r;
  const first = !s.retried.has(s.slot);
  const prog = useProgress.getState();
  const wasNew = !seen(prog.p.roots[id]);
  const combo = correct ? s.combo + 1 : 0;
  const xp = correct ? xpFor(q.mode, combo, first) : 0;
  prog.recordAnswer(id, correct, first, xp);

  const ticks = s.ticks.slice();
  const queue = s.queue.slice();
  const retried = new Set(s.retried);
  const missed = s.missed.slice();
  const learned = s.learned.slice();
  if (correct) {
    ticks[s.slot] = first ? "good" : "recovered";
    if (wasNew) learned.push(id);
  } else {
    ticks[s.slot] = "bad";
    if (first) {
      retried.add(s.slot);
      missed.push(id);
      queue.splice(Math.min(queue.length, s.i + 4), 0, s.slot);
    }
  }
  set({
    s: {
      ...s,
      answered: true,
      lastCorrect: correct,
      lastXp: xp,
      picked,
      combo,
      best: Math.max(s.best, combo),
      ok: s.ok + (correct ? 1 : 0),
      bad: s.bad + (correct ? 0 : 1),
      xp: s.xp + xp,
      ticks,
      queue,
      retried,
      missed,
      learned,
    },
  });
}
