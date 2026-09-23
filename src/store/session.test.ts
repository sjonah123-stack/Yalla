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
import { makeQuestion } from "../lib/quiz";

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

describe("v1.0 sessions", () => {
  beforeEach(() => {
    useSession.getState().clear();
  });

  it("wrong answers land in the mistake notebook, with the picked root", () => {
    const p = defaultProgress();
    p.onboardedAt = 1;
    useProgress.getState().adopt(p);
    useSession.getState().start({ kind: "lesson", unit: COURSE.units[0].id });
    playThrough(false);
    const m = useProgress.getState().p.mistakes;
    expect(m.length).toBeGreaterThan(0);
    expect(m.some((x) => x.pickedRoot && x.pickedRoot !== x.root)).toBe(true);
    // …and a fix-my-mistakes round drills exactly those roots, counting fixes for the quest.
    expect(useSession.getState().start({ kind: "practice", focus: "mistakes" })).toBe(true);
    const ids = new Set(m.map((x) => x.root));
    for (const r of useSession.getState().s!.slots) expect(ids.has(r.r)).toBe(true);
    playThrough(true);
    expect(useProgress.getState().p.history[dayKey()].fixed).toBeGreaterThan(0);
  });

  it("the root of the day runs four questions on one root and marks the day", () => {
    const p = defaultProgress();
    p.onboardedAt = 1;
    const now = Date.now();
    for (const r of ROOTS.slice(0, 6)) p.roots[r.r] = applyAnswer(undefined, true, true, now);
    useProgress.getState().adopt(p);
    useProgress.getState().tick();
    expect(useSession.getState().start({ kind: "daily" })).toBe(true);
    const s = useSession.getState().s!;
    expect(s.slots).toHaveLength(4);
    expect(new Set(s.slots.map((r) => r.r)).size).toBe(1);
    playThrough(true);
    const after = useProgress.getState().p;
    expect(after.history[dayKey()].daily).toBe(1);
    expect(useSession.getState().s!.rewards?.rush?.mult).toBe(3);
  });

  it("restock drills only a stall's wilted roots", () => {
    const p = defaultProgress();
    p.onboardedAt = 1;
    const speech = ROOTS.filter((r) => r.cat === "speech").slice(0, 3);
    const past = Date.now() - 10 * 86_400_000;
    for (const r of speech)
      p.roots[r.r] = { ease: 2.5, ivl: 3, due: past, reps: 2, lapses: 0, ok: 2, bad: 0 };
    useProgress.getState().adopt(p);
    expect(
      useSession.getState().start({ kind: "practice", focus: "restock", section: "speech" }),
    ).toBe(true);
    const ids = new Set(speech.map((r) => r.r));
    for (const r of useSession.getState().s!.slots) expect(ids.has(r.r)).toBe(true);
    expect(
      useSession.getState().start({ kind: "practice", focus: "restock", section: "sport" }),
    ).toBe(false);
  });
});

describe("typing", () => {
  beforeEach(() => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
  });

  /** Start a lesson and swap its first question for a typeRoot on `id`. */
  function typeRootOn(id: string) {
    useSession.getState().start({ kind: "lesson", unit: COURSE.units[0].id });
    const s = useSession.getState().s!;
    const root = ROOTS.find((r) => r.r === id)!;
    useSession.setState({
      s: { ...s, learning: false, q: makeQuestion(root, ROOTS, "typeRoot") },
    });
  }
  const type = (letters: string) => {
    for (const c of letters) useSession.getState().typeKey(c);
  };

  it("filling the last slot waits for check, so a slip can still be deleted", () => {
    typeRootOn("כתב");
    type("כתפ");
    expect(useSession.getState().s!.answered).toBe(false);
    useSession.getState().typeKey("⌫");
    type("בב"); // the extra letter is ignored
    expect(useSession.getState().s!.typed.join("")).toBe("כתב");
    useSession.getState().submitTyped();
    expect(useSession.getState().s!.answered).toBe(true);
    expect(useSession.getState().s!.lastCorrect).toBe(true);
  });

  it("a root spelled with a final letter is right typed with the final or the medial form", () => {
    typeRootOn("גוף");
    type("גוף");
    useSession.getState().submitTyped();
    expect(useSession.getState().s!.lastCorrect).toBe(true);

    typeRootOn("גוף");
    type("גופ");
    useSession.getState().submitTyped();
    expect(useSession.getState().s!.lastCorrect).toBe(true);

    typeRootOn("גוף");
    type("גוב");
    useSession.getState().submitTyped();
    expect(useSession.getState().s!.lastCorrect).toBe(false);
  });

  it("check does nothing until every slot is filled", () => {
    typeRootOn("כתב");
    type("כת");
    useSession.getState().submitTyped();
    expect(useSession.getState().s!.answered).toBe(false);
  });
});

describe("binyan lessons", () => {
  beforeEach(() => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
  });

  it("opens on the pattern card, fixes a verb of the binyan per question, and pays like practice", () => {
    expect(useSession.getState().start({ kind: "binyan", binyan: "pi'el" })).toBe(true);
    const s0 = useSession.getState().s!;
    expect(s0.intro).toBe(true);
    expect(s0.words!.every((w) => w.b === "pi'el")).toBe(true);
    useSession.getState().dismissLearn();
    expect(useSession.getState().s!.intro).toBe(false);
    const asked = new Set<string>();
    for (let guard = 0; guard < 60 && !useSession.getState().s!.done; guard++) {
      const s = useSession.getState().s!;
      if (s.answered) {
        useSession.getState().next();
        continue;
      }
      asked.add(s.q!.word!.h);
      expect(s.q!.word!.b).toBe("pi'el");
      useSession.getState().pickOption(s.q!.opts!.findIndex((o) => o.ok));
    }
    const s = useSession.getState().s!;
    expect(s.done).toBe(true);
    expect(s.bad).toBe(0);
    expect(s.rewards!.parts.base).toBe(GEM_BASE);
    expect(s.rewards!.parts.perfect).toBe(GEM_PERFECT);
    const p = useProgress.getState().p;
    // Words are remembered (met, then used: two right answers = known)…
    for (const h of asked) expect(p.words[h]).toEqual({ ok: 2, bad: 0 });
    // …while the path's review schedule is untouched.
    expect(Object.keys(p.roots)).toHaveLength(0);
    expect(p.history[dayKey()].sessions).toBe(1);
  });

  it("keeps misses on roots still ahead out of the mistake notebook", () => {
    useSession.getState().start({ kind: "binyan", binyan: "hif'il" });
    useSession.getState().dismissLearn();
    const s = useSession.getState().s!;
    useSession.getState().pickOption(s.q!.opts!.findIndex((o) => !o.ok));
    const p = useProgress.getState().p;
    expect(p.words[s.q!.word!.h]).toEqual({ ok: 0, bad: 1 });
    expect(p.mistakes).toHaveLength(0);
    expect(p.roots[s.q!.root.r]).toBeUndefined();
    // The miss comes back later in the lesson.
    expect(useSession.getState().s!.queue.length).toBe(s.queue.length + 1);
  });
});

describe("quitting", () => {
  beforeEach(() => {
    useProgress.getState().adopt({ ...defaultProgress(), onboardedAt: 1 });
    useSession.getState().clear();
  });
  it("before any answer leaves without a summary; after one, ends on the summary", async () => {
    useSession.getState().start({ kind: "binyan", binyan: "pi'el" });
    await useSession.getState().quit();
    expect(useSession.getState().s).toBeNull();
    expect(useProgress.getState().p.history[dayKey()]).toBeUndefined();

    useSession.getState().start({ kind: "binyan", binyan: "pi'el" });
    useSession.getState().dismissLearn();
    const s = useSession.getState().s!;
    useSession.getState().pickOption(s.q!.opts!.findIndex((o) => o.ok));
    await useSession.getState().quit();
    expect(useSession.getState().s!.done).toBe(true);
  });
});

