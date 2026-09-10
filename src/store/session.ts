import { create } from "zustand";
import type { Mode, Question, Root, UnitId } from "../types";
import { ROOTS } from "../data/roots";
import { buildQueue, dayKey, mastery, seen, trickyQueue } from "../lib/srs";
import { makeQuestion, modeFor, xpFor } from "../lib/quiz";
import { buildLesson, buildTest, testScore } from "../lib/lesson";
import { placementSample } from "../lib/placement";
import { memorizedCount } from "../lib/course";
import type { Receipt } from "../lib/rewards";
import { speechAvailable } from "../lib/speech";
import { buildSpeedQueue, SPEED_LEN, SPEED_MIN_ROOTS } from "../lib/speed";
import { summaryExit } from "../lib/history";
import { useProgress } from "./progress";
import { useUi } from "./ui";
import { COURSE } from "./course";

export type Tick = "pending" | "good" | "bad" | "recovered";

export type Plan =
  | { kind: "lesson"; unit: UnitId }
  | { kind: "practice"; focus?: "tricky" }
  | { kind: "test"; unit: UnitId }
  | { kind: "placement" }
  | { kind: "speed" };

/** Behaviour flags derived from the plan. */
export const planRules = (plan: Plan) => ({
  /** Show the feedback sheet after each question (else tick and move on, results at the end). */
  feedbackEach: plan.kind === "lesson" || plan.kind === "practice",
  /** Misses are re-queued a few questions later. */
  requeue: plan.kind === "lesson" || plan.kind === "practice",
  learnFirst: plan.kind === "lesson",
  writesSrs: plan.kind !== "placement",
  xp: plan.kind !== "placement",
});

export interface Result {
  slot: number;
  ok: boolean;
  /** What the learner picked/typed, for the results list. */
  picked: string;
}

export interface Session {
  plan: Plan;
  /** The fixed set of slots for this session; one rail tick each. A root may fill two slots. */
  slots: Root[];
  /** For test/placement: the mode fixed per slot. */
  modes?: Mode[];
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
  /** Correct typeRoot answers this session. */
  typedOk: number;
  retried: Set<number>;
  /** Roots whose SRS already advanced this session (further slots are drills). */
  advanced: Set<string>;
  learned: string[];
  missed: string[];
  results: Result[];
  /** Memorized count when the session started, for the summary strip. */
  memBefore: number;
  /** XP totals when the session started, for level-up / daily-goal milestones. */
  xpBefore: number;
  todayXpBefore: number;
  /** Wall-clock start, for the speed round timer. */
  startedAt: number;
  /** Speed round: this run set today's best. */
  newBest?: boolean;
  done: boolean;
  /** Set when the session finished: test score, or placement handled. */
  score?: number;
  wentGold?: boolean;
  /** Gems, chests and seals paid out when the session finished. */
  rewards?: Receipt;
  /** The learner has opened the chest on the summary screen. */
  chestClaimed: boolean;
}

interface SessionStore {
  s: Session | null;
  start: (plan: Plan) => boolean;
  dismissLearn: () => void;
  pickOption: (i: number) => void;
  typeKey: (k: string) => void;
  submitTyped: () => void;
  next: () => void;
  end: () => void;
  /** Speed round: the timer ran out — score it as a completed round. */
  timeUp: () => void;
  /**
   * Leave a running session from the × button or the back gesture. Tests and placements ask
   * first (they are discarded when left); everything else ends and shows its summary.
   */
  quit: () => Promise<void>;
  /** Leave a finished session (the summary) to where it belongs on the path or Home. */
  leave: () => void;
  claimChest: () => void;
  clear: () => void;
}

const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function question(s: Session, root: Root, slot: number): Question {
  const prog = useProgress.getState().p;
  let mode: Mode;
  if (s.modes) mode = s.modes[slot];
  else if (s.plan.kind === "placement") mode = pick<Mode>(["rootMeaning", "meaningRoot"]);
  else
    mode = modeFor(root, mastery(prog.roots[root.r]), {
      audio: speechAvailable() && prog.settings.audio,
    });
  return makeQuestion(root, ROOTS, mode);
}

function load(s: Session): Session {
  if (s.i >= s.queue.length) return finish(s);
  const slot = s.queue[s.i];
  const root = s.slots[slot];
  const prog = useProgress.getState().p;
  const rules = planRules(s.plan);
  const learning =
    rules.learnFirst &&
    prog.settings.learnFirst &&
    !seen(prog.roots[root.r]) &&
    !s.retried.has(slot) &&
    !s.advanced.has(root.r) &&
    !s.slots.slice(0, slot).includes(root);
  return {
    ...s,
    slot,
    q: question(s, root, slot),
    learning,
    answered: false,
    picked: null,
    typed: [],
    lastXp: 0,
  };
}

/**
 * Close the session and apply end-of-session effects (test score, placement, rewards).
 * `completed` is false when the learner quit early: counters and base gems still land,
 * but the run can never count as perfect.
 */
function finish(s: Session, completed = true): Session {
  if (s.done) return s;
  const prog = useProgress.getState();
  const out: Session = { ...s, done: true, q: null };
  const ok = s.results.filter((r) => r.ok).length;
  if (s.plan.kind === "test") {
    out.score = testScore(ok, s.slots.length);
    out.wentGold = prog.recordTest(s.plan.unit, out.score);
    out.rewards = prog.recordSessionEnd({
      kind: "test",
      ok,
      bad: s.results.length - ok,
      best: s.best,
      typedOk: s.typedOk,
      completed: true,
    });
  } else if (s.plan.kind === "placement") {
    out.rewards = prog.finishPlacement(s.results.map((r) => ({ root: s.slots[r.slot], ok: r.ok })));
    out.score = testScore(ok, s.slots.length);
  } else if (s.plan.kind === "speed") {
    // Best first, so the speed seal sees today's new score when rewards settle.
    out.score = s.ok;
    out.newBest = prog.recordSpeedBest(s.ok);
    out.rewards = prog.recordSessionEnd({
      kind: "speed",
      ok: s.ok,
      bad: s.bad,
      best: s.best,
      typedOk: s.typedOk,
      completed,
    });
  } else {
    out.rewards = prog.recordSessionEnd({
      kind: s.plan.kind,
      ok: s.ok,
      bad: s.bad,
      best: s.best,
      typedOk: s.typedOk,
      completed,
    });
  }
  return out;
}

function buildSlots(plan: Plan): { slots: Root[]; modes?: Mode[] } {
  const prog = useProgress.getState().p;
  switch (plan.kind) {
    case "lesson":
      return { slots: buildLesson(COURSE, plan.unit, prog) };
    case "practice": {
      if (plan.focus === "tricky")
        return { slots: trickyQueue(ROOTS, prog, prog.settings.sessionLen) };
      const seenRoots = ROOTS.filter((r) => seen(prog.roots[r.r]));
      return { slots: buildQueue(seenRoots, prog, prog.settings.sessionLen, 0) };
    }
    case "test": {
      const t = buildTest(COURSE, plan.unit);
      return { slots: t.map((x) => x.root), modes: t.map((x) => x.mode) };
    }
    case "speed": {
      if (ROOTS.filter((r) => seen(prog.roots[r.r])).length < SPEED_MIN_ROOTS) return { slots: [] };
      const slots = buildSpeedQueue(ROOTS, prog, SPEED_LEN);
      const modes = slots.map((r) =>
        modeFor(r, mastery(prog.roots[r.r]), { audio: false, quick: true }),
      );
      return { slots, modes };
    }
    case "placement": {
      const sample = placementSample(COURSE);
      const order = sample.slice();
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { slots: order };
    }
  }
}

export const useSession = create<SessionStore>((set, get) => ({
  s: null,
  start: (plan) => {
    const { slots, modes } = buildSlots(plan);
    if (!slots.length) return false;
    const prog = useProgress.getState();
    if (plan.kind === "lesson") prog.setLastUnit(plan.unit);
    const s: Session = {
      plan,
      slots,
      modes,
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
      typedOk: 0,
      retried: new Set(),
      advanced: new Set(),
      learned: [],
      missed: [],
      results: [],
      memBefore: memorizedCount(ROOTS, prog.p),
      xpBefore: prog.p.xp,
      todayXpBefore: prog.p.history[dayKey()]?.xp ?? 0,
      startedAt: Date.now(),
      done: false,
      chestClaimed: false,
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
    answer(s, s.q.opts[i].ok, i, s.q.opts[i].label, set);
  },
  typeKey: (k) => {
    const s = get().s;
    if (!s || s.q?.mode !== "typeRoot" || s.answered) return;
    const L = s.q.answer!.length;
    if (k === "⌫") return set({ s: { ...s, typed: s.typed.slice(0, -1) } });
    if (s.typed.length >= L) return;
    const typed = [...s.typed, k];
    if (typed.length === L)
      answer({ ...s, typed }, typed.join("") === s.q.answer, null, typed.join(""), set);
    else set({ s: { ...s, typed } });
  },
  submitTyped: () => {
    const s = get().s;
    if (!s || s.q?.mode !== "typeRoot" || s.answered) return;
    if (s.typed.length === s.q.answer!.length)
      answer(s, s.typed.join("") === s.q.answer, null, s.typed.join(""), set);
  },
  next: () => {
    const s = get().s;
    if (!s || !s.answered || s.done) return;
    set({ s: load({ ...s, i: s.i + 1 }) });
  },
  end: () => {
    const s = get().s;
    if (!s || s.done) return;
    // Ending a test or placement early discards it rather than scoring a partial run.
    if (s.plan.kind === "test" || s.plan.kind === "placement") set({ s: null });
    else set({ s: finish(s, false) });
  },
  timeUp: () => {
    const s = get().s;
    if (!s || s.done || s.plan.kind !== "speed") return;
    set({ s: finish(s, true) });
  },
  quit: async () => {
    const s = get().s;
    if (!s || s.done) return;
    if (s.plan.kind === "test" || s.plan.kind === "placement") {
      const v = await useUi.getState().confirm(
        s.plan.kind === "test"
          ? {
              title: "Leave the test?",
              body: "A test only counts when you finish it. Leaving throws this run away — the unit itself is untouched.",
              actions: [
                { label: "Keep going", value: "stay", kind: "plum" },
                { label: "Leave the test", value: "leave", kind: "text" },
              ],
            }
          : {
              title: "Leave the placement test?",
              body: "Nothing from a half-finished placement is saved. You can take it again from Home.",
              actions: [
                { label: "Keep going", value: "stay", kind: "plum" },
                { label: "Leave", value: "leave", kind: "text" },
              ],
            },
      );
      if (v !== "leave") return;
    }
    get().end();
  },
  leave: () => {
    const s = get().s;
    const exit = summaryExit(s ? s.plan : { kind: "practice" });
    set({ s: null });
    const ui = useUi.getState();
    ui.setView(exit.view);
    if (exit.unit) ui.openUnit(exit.unit);
  },
  claimChest: () => {
    const s = get().s;
    if (s && s.done && !s.chestClaimed) set({ s: { ...s, chestClaimed: true } });
  },
  clear: () => set({ s: null }),
}));

function answer(
  s: Session,
  correct: boolean,
  picked: number | null,
  pickedLabel: string,
  set: (p: Partial<SessionStore>) => void,
) {
  const q = s.q!;
  const id = q.root.r;
  const rules = planRules(s.plan);
  const first = !s.retried.has(s.slot);
  // A root's SRS advances at most once per session; later slots are drills.
  const srsFirst = first && !s.advanced.has(id);
  const prog = useProgress.getState();
  const wasNew = !seen(prog.p.roots[id]);
  const combo = correct ? s.combo + 1 : 0;
  const xp = correct && rules.xp ? xpFor(q.mode, combo, srsFirst) : 0;
  if (rules.writesSrs) prog.recordAnswer(id, correct, srsFirst, xp);

  const ticks = s.ticks.slice();
  const queue = s.queue.slice();
  const retried = new Set(s.retried);
  const advanced = new Set(s.advanced);
  const missed = s.missed.slice();
  const learned = s.learned.slice();
  const results = [...s.results, { slot: s.slot, ok: correct, picked: pickedLabel }];
  if (correct) {
    ticks[s.slot] = first ? "good" : "recovered";
    advanced.add(id);
    if (wasNew && !learned.includes(id)) learned.push(id);
  } else {
    ticks[s.slot] = "bad";
    if (!missed.includes(id)) missed.push(id);
    if (first && rules.requeue) {
      retried.add(s.slot);
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
      typedOk: s.typedOk + (correct && q.mode === "typeRoot" ? 1 : 0),
      ticks,
      queue,
      retried,
      advanced,
      missed,
      learned,
      results,
    },
  });
}
