import { beforeEach, describe, expect, it } from "vitest";
import { useProgress } from "./progress";
import { useSession } from "./session";
import { COURSE } from "./course";
import { defaultProgress } from "../lib/storage";
import { GEM_BASE, GEM_PER_CORRECT, GEM_PERFECT, GEM_SPEED_CAP } from "../lib/rewards";
import { SPEED_LEN } from "../lib/speed";
import { dayKey } from "../lib/srs";
import { applyAnswer, isTricky } from "../lib/srs";
import { ROOTS } from "../data/roots";

/** Drive a whole session through the store the way the Play view does. */
function playThrough(alwaysRight: boolean): void {
  const S = useSession;
  for (let guard = 0; guard < 200; guard++) {
    const s = S.getState().s!;
    if (s.done) return;
    if (s.learning) {
      S.getState().dismissLearn();
      continue;
    }
    if (s.answered) {
      S.getState().next();
      continue;
    }
    const q = s.q!;
    if (q.mode === "typeRoot") {
      const letters = alwaysRight ? q.answer! : "אבג";
      for (const c of letters) S.getState().typeKey(c);
      if (!S.getState().s!.answered) S.getState().submitTyped();
    } else {
      const i = q.opts!.findIndex((o) => (alwaysRight ? o.ok : !o.ok));
      S.getState().pickOption(i);
    }
  }
  throw new Error("session did not finish");
}

describe("session → rewards wiring", () => {
  beforeEach(() => {
    useProgress.getState().adopt(defaultProgress());
    useSession.getState().clear();
  });

  it("a perfect first lesson pays base + per-correct + perfect gems and the first seals", () => {
    const unit = COURSE.units[0];
    expect(useSession.getState().start({ kind: "lesson", unit: unit.id })).toBe(true);
    playThrough(true);
    const s = useSession.getState().s!;
    expect(s.done).toBe(true);
    expect(s.bad).toBe(0);
    const r = s.rewards!;
    expect(r.parts.base).toBe(GEM_BASE);
    expect(r.parts.correct).toBe(GEM_PER_CORRECT * s.ok);
    expect(r.parts.perfect).toBe(GEM_PERFECT);
    expect(r.gems).toBe(GEM_BASE + GEM_PER_CORRECT * s.ok + GEM_PERFECT);
    expect(r.newSeals).toContain("first-root");
    expect(r.newSeals).toContain("perfect-lesson");
    const p = useProgress.getState().p;
    expect(p.gems).toBe(r.gems);
    expect(p.perfectLessons).toBe(1);
    expect(p.bestCombo).toBe(s.best);
    expect(p.seals["first-root"]).toBeTypeOf("number");
    // Chest claim is UI-only and idempotent.
    expect(s.chestClaimed).toBe(false);
    useSession.getState().claimChest();
    expect(useSession.getState().s!.chestClaimed).toBe(true);
    expect(useProgress.getState().p.gems).toBe(r.gems);
  });

  it("a lesson with misses is not perfect; quitting early still pays the base", () => {
    const unit = COURSE.units[0];
    useSession.getState().start({ kind: "lesson", unit: unit.id });
    playThrough(false);
    const s = useSession.getState().s!;
    expect(s.rewards!.parts.perfect).toBe(0);
    expect(useProgress.getState().p.perfectLessons).toBe(0);

    useSession.getState().clear();
    useSession.getState().start({ kind: "lesson", unit: unit.id });
    const before = useProgress.getState().p.gems;
    // Answer one question, then quit: base + that one correct, never the perfect bonus.
    const s0 = useSession.getState().s!;
    if (s0.learning) useSession.getState().dismissLearn();
    const q0 = useSession.getState().s!.q!;
    useSession.getState().pickOption(q0.opts!.findIndex((o) => o.ok));
    useSession.getState().end();
    const q = useSession.getState().s!;
    expect(q.done).toBe(true);
    expect(q.rewards!.parts.base).toBe(GEM_BASE);
    expect(q.rewards!.parts.correct).toBe(GEM_PER_CORRECT);
    expect(q.rewards!.parts.perfect).toBe(0);
    expect(useProgress.getState().p.gems).toBe(before + q.rewards!.gems);
  });

  it("placement pays its gems once and marks the device onboarded", () => {
    useProgress.getState().markOnboarded();
    expect(useProgress.getState().p.onboardedAt).toBeTypeOf("number");
    useSession.getState().start({ kind: "placement" });
    playThrough(true);
    const r = useSession.getState().s!.rewards!;
    expect(r.parts.placement).toBeGreaterThan(0);
    expect(useProgress.getState().p.placement).not.toBeNull();
    // A second placement run pays nothing extra.
    useSession.getState().clear();
    useSession.getState().start({ kind: "placement" });
    playThrough(true);
    expect(useSession.getState().s!.rewards!.parts.placement).toBe(0);
  });
});

describe("tricky practice", () => {
  it("only holds tricky roots and still pays practice gems", () => {
    const p = defaultProgress();
    const now = Date.now();
    for (const r of ROOTS.slice(0, 4)) {
      let s = applyAnswer(undefined, true, true, now);
      s = applyAnswer(s, false, true, now);
      s = applyAnswer(s, false, true, now);
      p.roots[r.r] = s;
    }
    p.onboardedAt = now;
    useProgress.getState().adopt(p);
    expect(useSession.getState().start({ kind: "practice", focus: "tricky" })).toBe(true);
    const s = useSession.getState().s!;
    expect(s.slots.length).toBe(8);
    for (const r of s.slots) expect(isTricky(p.roots[r.r])).toBe(true);
    playThrough(true);
    expect(useSession.getState().s!.rewards?.parts.base).toBe(GEM_BASE);
  });
  it("cannot start when nothing is tricky", () => {
    useProgress.getState().adopt(defaultProgress());
    expect(useSession.getState().start({ kind: "practice", focus: "tricky" })).toBe(false);
  });
});

describe("speed round", () => {
  const seed = (n: number) => {
    const p = defaultProgress();
    const now = Date.now();
    for (const r of ROOTS.slice(0, n)) p.roots[r.r] = applyAnswer(undefined, true, true, now);
    p.onboardedAt = now;
    useProgress.getState().adopt(p);
  };
  const answerRight = (n: number) => {
    const S = useSession;
    for (let k = 0; k < n; k++) {
      const s = S.getState().s!;
      if (s.answered) S.getState().next();
      const q = S.getState().s!.q!;
      S.getState().pickOption(q.opts!.findIndex((o) => o.ok));
    }
  };
  it("builds a long queue with quick modes, scores on timeUp, pays capped gems, sets the best", () => {
    seed(6);
    useSession.getState().clear();
    expect(useSession.getState().start({ kind: "speed" })).toBe(true);
    const s0 = useSession.getState().s!;
    expect(s0.slots).toHaveLength(SPEED_LEN);
    expect(s0.modes).toHaveLength(SPEED_LEN);
    expect(s0.modes!.every((m) => m !== "typeRoot" && m !== "hearWord")).toBe(true);
    answerRight(25);
    useSession.getState().timeUp();
    const s = useSession.getState().s!;
    expect(s.done).toBe(true);
    expect(s.score).toBe(25);
    expect(s.newBest).toBe(true);
    expect(s.rewards!.parts).toMatchObject({
      base: GEM_BASE,
      correct: GEM_PER_CORRECT * GEM_SPEED_CAP,
      perfect: 0,
    });
    expect(useProgress.getState().p.history[dayKey()].speedBest).toBe(25);
    expect(s.rewards!.newSeals).toContain("speed-20");
    // A worse second round keeps the best.
    useSession.getState().clear();
    useSession.getState().start({ kind: "speed" });
    answerRight(5);
    useSession.getState().timeUp();
    expect(useSession.getState().s!.newBest).toBe(false);
    expect(useProgress.getState().p.history[dayKey()].speedBest).toBe(25);
  });
  it("needs a minimum pool, and an early × pays per answer but no base", () => {
    seed(2);
    useSession.getState().clear();
    expect(useSession.getState().start({ kind: "speed" })).toBe(false);
    seed(5);
    useSession.getState().start({ kind: "speed" });
    answerRight(3);
    useSession.getState().end();
    const s = useSession.getState().s!;
    expect(s.done).toBe(true);
    expect(s.rewards!.parts.base).toBe(0);
    expect(s.rewards!.parts.correct).toBe(9);
  });
});

describe("chain (daily plan)", () => {
  it("runs plans back to back and the summary continues to the next", () => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
    const first = COURSE.units[0].id;
    expect(
      useSession.getState().startChain([
        { kind: "lesson", unit: first },
        { kind: "lesson", unit: first },
      ]),
    ).toBe(true);
    expect(useSession.getState().chain).toHaveLength(1);
    playThrough(true);
    expect(useSession.getState().s!.done).toBe(true);
    expect(useSession.getState().nextInChain()).toBe(true);
    expect(useSession.getState().chain).toHaveLength(0);
    expect(useSession.getState().s!.done).toBe(false);
    playThrough(true);
    expect(useSession.getState().nextInChain()).toBe(false);
  });
  it("skips chain steps that cannot start", () => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
    expect(
      useSession
        .getState()
        .startChain([{ kind: "speed" }, { kind: "lesson", unit: COURSE.units[0].id }]),
    ).toBe(true);
    expect(useSession.getState().s!.plan.kind).toBe("lesson");
  });
  it("records word exposure for word-based answers", () => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
    useSession.getState().start({ kind: "lesson", unit: COURSE.units[0].id });
    playThrough(true);
    const words = useProgress.getState().p.words;
    expect(Object.keys(words).length).toBeGreaterThanOrEqual(0);
    for (const w of Object.values(words)) expect(w.ok + w.bad).toBeGreaterThan(0);
  });
});
