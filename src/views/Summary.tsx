import { useEffect, useRef } from "react";
import { useSession, type Session } from "../store/session";
import { useUi } from "../store/ui";
import { useProgress } from "../store/progress";
import { COURSE } from "../store/course";
import { ROOTS, ROOT_BY_ID } from "../data/roots";
import { rootDisplay } from "../lib/hebrew";
import { crossings, dayKey, levelCeil } from "../lib/srs";
import { speedBestToday } from "../lib/speed";
import { planLabel } from "../lib/plan";
import { playCue } from "../lib/sound";
import { Heb } from "../components/Heb";
import { GOLD_SCORE, memorizedCount, unitTitle } from "../lib/course";
import { MODE_TITLE } from "../lib/quiz";
import {
  GEM_PER_CORRECT,
  GEM_PERFECT,
  GEM_PLACEMENT,
  GEM_SECTION_CHEST,
  GEM_UNIT_CHEST,
  SEAL_BY_ID,
  type Receipt,
} from "../lib/rewards";
import { useCountUp } from "../components/useCountUp";
import type { Question } from "../types";

/** The little fanfare when a summary appears — once per mount, never twice. */
function useDoneCue() {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (useProgress.getState().p.settings.sounds) playCue("done");
  }, []);
}

/**
 * The primary exit: when today's session has more steps, it starts the next one instead of
 * going home.
 */
function useChainExit(fallback: string) {
  const chain = useSession((st) => st.chain);
  const go = () => {
    if (chain.length > 0 && useSession.getState().nextInChain()) return;
    useSession.getState().leave();
  };
  return { chain, label: chain.length > 0 ? `Next: ${planLabel(chain[0])}` : fallback, go };
}

/** "Today's session · 2 steps to go", under the headline of a chained summary. */
function ChainNote({ chain }: { chain: readonly unknown[] }) {
  if (!chain.length) return null;
  return (
    <div className="small muted">
      Today's session · {chain.length} step{chain.length === 1 ? "" : "s"} to go
    </div>
  );
}

export default function Summary() {
  const s = useSession((st) => st.s)!;
  useDoneCue();
  if (s.plan.kind === "test") return <TestResult s={s} />;
  if (s.plan.kind === "placement") return <PlacementResult s={s} />;
  if (s.plan.kind === "speed") return <SpeedResult s={s} />;
  return <LessonSummary s={s} />;
}

function Stats({ xp, acc, best }: { xp: number; acc: number; best: number }) {
  const shownXp = useCountUp(xp);
  return (
    <div className="stats center">
      <div>
        <div className="l">XP</div>
        <div className="n coral tnum">+{shownXp}</div>
      </div>
      <div>
        <div className="l">Accuracy</div>
        <div className="n tnum">{acc}%</div>
      </div>
      <div>
        <div className="l">Combo</div>
        <div className="n tnum">×{best}</div>
      </div>
    </div>
  );
}

/** The gem chest: wobbles closed until tapped, then the lid opens and the gems float out. */
function Chest({ s, receipt }: { s: Session; receipt: Receipt }) {
  const claimChest = useSession((st) => st.claimChest);
  const open = s.chestClaimed;
  const openChest = () => {
    if (useProgress.getState().p.settings.sounds) playCue("chest");
    claimChest();
  };
  const parts: string[] = [];
  if (receipt.parts.base) parts.push(`Session +${receipt.parts.base}`);
  if (receipt.parts.perfect) parts.push(`Perfect bonus +${GEM_PERFECT}`);
  if (receipt.unitChests.length)
    parts.push(`Unit chest +${GEM_UNIT_CHEST * receipt.unitChests.length}`);
  if (receipt.sectionChests.length)
    parts.push(`Section chest +${GEM_SECTION_CHEST * receipt.sectionChests.length}`);
  // Derived, not `s.ok`: a speed round's per-correct gems are capped.
  if (receipt.parts.correct)
    parts.push(`${receipt.parts.correct / GEM_PER_CORRECT} right × ${GEM_PER_CORRECT}`);
  return (
    <div className="chestwrap">
      {open ? (
        <div className="chest3d open" aria-label={`${receipt.gems} gems`}>
          <div className="body" />
          <div className="lid" />
          <div className="gems tnum">✦ +{receipt.gems}</div>
        </div>
      ) : (
        <button
          type="button"
          className="chest3d closed"
          onClick={openChest}
          aria-label="Open the chest"
          autoFocus
        >
          <div className="body" />
          <div className="lid" />
          <div className="lock" />
        </button>
      )}
      {open ? (
        <div className="reward">{parts.join(" · ")}</div>
      ) : (
        <div className="hint">Tap the chest</div>
      )}
    </div>
  );
}

function NewSeals({ receipt }: { receipt?: Receipt }) {
  if (!receipt?.newSeals.length) return null;
  return (
    <>
      {receipt.newSeals.map((id) => {
        const seal = SEAL_BY_ID[id];
        return (
          <div className="sealcard" key={id}>
            <span className="seal">{seal.letter}</span>
            <div>
              <div className="eyebrow">New seal</div>
              <div className="t">{seal.name}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function LessonSummary({ s }: { s: Session }) {
  const { start } = useSession.getState();
  const showToast = useUi((st) => st.showToast);
  const p = useProgress((st) => st.p);
  const total = s.ok + s.bad;
  const acc = total ? Math.round((s.ok / total) * 100) : 0;
  const missed = [...new Set(s.missed)].map((id) => ROOT_BY_ID[id]);
  const memAfter = memorizedCount(ROOTS, p);
  const gained = Math.max(0, memAfter - s.memBefore);
  // Roots at interval 1: answered right today, locked in by tomorrow's review.
  const pending = [...new Set(s.slots.map((r) => r.r))].filter((id) => {
    const st = p.roots[id];
    return st && st.reps === 1 && st.ivl === 1;
  }).length;
  const unit = s.plan.kind === "lesson" ? COURSE.byId[s.plan.unit] : null;
  const receipt = s.rewards;
  const unitDone = !!receipt?.unitChests.length;
  const perfect = !!receipt?.parts.perfect;
  const headline = unitDone
    ? "Unit complete! כל הכבוד"
    : perfect
      ? "Flawless. מצוין!"
      : acc >= 70
        ? "Strong session. יופי!"
        : "Every miss is a root coming back.";
  const hasChest = !!receipt && receipt.gems > 0;
  const claimed = !hasChest || s.chestClaimed;
  const exit = useChainExit("Continue");

  return (
    <div className="shell view summary">
      <div className="eyebrow sum-eyebrow">
        {unit
          ? `${unitTitle(unit)} · lesson complete`
          : s.plan.kind === "practice" && s.plan.focus === "tricky"
            ? "Tricky roots · round complete"
            : "Practice complete"}
      </div>
      <div className="headline">{headline}</div>
      <ChainNote chain={exit.chain} />
      <Stats xp={s.xp} acc={acc} best={s.best} />
      {hasChest && <Chest s={s} receipt={receipt} />}
      {claimed && <NewSeals receipt={receipt} />}
      {claimed && <Milestones s={s} />}

      {(gained > 0 || pending > 0) && (
        <p className="note">
          {gained > 0 && (
            <>
              <b>
                +{gained} memorized · {memAfter} / {ROOTS.length}
              </b>
              {pending > 0 && <br />}
            </>
          )}
          {pending > 0 && (
            <>
              Come back tomorrow to lock in {pending} root{pending === 1 ? "" : "s"} — a second
              right answer on a new day is what makes a root memorized.
            </>
          )}
        </p>
      )}

      {missed.length > 0 && (
        <div className="sec">
          <div className="eyebrow">Back soon</div>
          <div className="chips">
            {missed.map((r) => (
              <span className="chip" key={r.r}>
                <Heb>{rootDisplay(r)}</Heb> · {r.short}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={"btn block big " + (claimed ? "plum" : "inert")}
        onClick={exit.go}
        disabled={!claimed}
      >
        {exit.label}
      </button>
      <button
        type="button"
        className="btn text block"
        style={{ marginTop: 8 }}
        onClick={() => {
          if (!start(s.plan)) showToast("Nothing to study here right now.");
        }}
      >
        {unit ? "Another lesson" : "Another round"}
      </button>
    </div>
  );
}

/** The answer a question wanted, as a short label. */
function correctLabel(q: Pick<Question, "mode" | "root" | "word">): string {
  // Results don't keep the word, so the word-based modes fall back to the root.
  if (q.mode === "buildWord" || q.mode === "typeWord" || q.mode === "cloze")
    return q.word?.h ?? rootDisplay(q.root);
  return q.mode === "rootMeaning" ? q.root.short : rootDisplay(q.root);
}

/** A finished 60-second round. */
function SpeedResult({ s }: { s: Session }) {
  const { start } = useSession.getState();
  const showToast = useUi((st) => st.showToast);
  const p = useProgress((st) => st.p);
  const score = s.score ?? s.ok;
  const bestToday = speedBestToday(p.history, dayKey());
  const missed = [...new Set(s.missed)].map((id) => ROOT_BY_ID[id]);
  const receipt = s.rewards;
  const hasChest = !!receipt && receipt.gems > 0;
  const claimed = !hasChest || s.chestClaimed;
  const exit = useChainExit("Home");
  return (
    <div className="shell view summary">
      <div className="eyebrow sum-eyebrow">Speed round · 60 seconds</div>
      <div className="headline">{s.newBest ? "New best today!" : `${score} right`}</div>
      <ChainNote chain={exit.chain} />
      <div className="speedbig tnum">{score}</div>
      <div className="stats center">
        <div>
          <div className="l">Score</div>
          <div className="n tnum">{score}</div>
        </div>
        <div>
          <div className="l">Best today</div>
          <div className="n tnum">{bestToday}</div>
        </div>
        <div>
          <div className="l">XP</div>
          <div className="n coral tnum">+{s.xp}</div>
        </div>
      </div>
      {hasChest && <Chest s={s} receipt={receipt} />}
      {claimed && <NewSeals receipt={receipt} />}
      {claimed && <Milestones s={s} />}

      {missed.length > 0 && (
        <div className="sec">
          <div className="eyebrow">Back soon</div>
          <div className="chips">
            {missed.map((r) => (
              <span className="chip" key={r.r}>
                <Heb>{rootDisplay(r)}</Heb> · {r.short}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={"btn block big " + (claimed ? "plum" : "inert")}
        onClick={() => {
          if (!start({ kind: "speed" })) showToast("Nothing to study here right now.");
        }}
        disabled={!claimed}
      >
        Again
      </button>
      <button type="button" className="btn text block" style={{ marginTop: 8 }} onClick={exit.go}>
        {exit.label}
      </button>
    </div>
  );
}

/** Level-up and daily-goal cards for milestones this session crossed. */
function Milestones({ s }: { s: Session }) {
  const p = useProgress((st) => st.p);
  const c = crossings(
    { xp: s.xpBefore, todayXp: s.todayXpBefore },
    { xp: p.xp, todayXp: p.history[dayKey()]?.xp ?? 0 },
    p.settings.dailyGoal,
  );
  if (c.level === null && !c.goal) return null;
  return (
    <>
      {c.level !== null && (
        <div className="sealcard milestone">
          <span className="seal tnum">{c.level}</span>
          <div>
            <div className="eyebrow">Level up</div>
            <div className="t">
              Level {c.level} · {levelCeil(c.level) - p.xp} XP to the next
            </div>
          </div>
        </div>
      )}
      {c.goal && (
        <div className="sealcard milestone">
          <span className="seal">✓</span>
          <div>
            <div className="eyebrow">Daily goal</div>
            <div className="t">Goal done · {p.settings.dailyGoal} XP today</div>
          </div>
        </div>
      )}
    </>
  );
}

function TestResult({ s }: { s: Session }) {
  const { start } = useSession.getState();
  const showToast = useUi((st) => st.showToast);
  const unit = s.plan.kind === "test" ? COURSE.byId[s.plan.unit] : COURSE.units[0];
  const score = s.score ?? 0;
  const gold = score >= GOLD_SCORE;
  const exit = useChainExit("Back to unit");
  return (
    <div className="shell view summary">
      <div className="eyebrow sum-eyebrow">
        {unitTitle(unit)} · {gold ? (s.wentGold ? "Gold!" : "Gold again") : "Test"}
      </div>
      <div className="headline">
        {gold
          ? s.wentGold
            ? "Unit is gold. כל הכבוד"
            : "Still gold. יופי!"
          : `${GOLD_SCORE}% turns it gold.`}
      </div>
      <ChainNote chain={exit.chain} />
      <div className="stats center">
        <div>
          <div className="l">Score</div>
          <div className={"n tnum" + (gold ? " coral" : "")}>{score}%</div>
        </div>
        <div>
          <div className="l">Right</div>
          <div className="n tnum">
            {s.ok}
            <span style={{ fontSize: 16, opacity: 0.6 }}>/{s.slots.length}</span>
          </div>
        </div>
        <div>
          <div className="l">XP</div>
          <div className="n tnum">+{s.xp}</div>
        </div>
      </div>
      {gold && s.wentGold && <p className="note">Next unit unlocked.</p>}
      <NewSeals receipt={s.rewards} />
      <Milestones s={s} />
      <div className="sec">
        <div className="eyebrow">Question by question</div>
        <ul className="results">
          {s.results.map((r, i) => {
            const root = s.slots[r.slot];
            const mode = s.modes?.[r.slot] ?? "rootMeaning";
            return (
              <li key={i} className={r.ok ? "ok" : "bad"}>
                <span className="glyph lead">{rootDisplay(root)}</span>
                <span className="what">
                  <span className="small muted">{MODE_TITLE[mode]}</span>
                  <br />
                  {r.ok ? (
                    <b>{correctLabel({ mode, root })}</b>
                  ) : (
                    <>
                      <bdi>
                        <s>{r.picked}</s>
                      </bdi>{" "}
                      →{" "}
                      <bdi>
                        <b>{correctLabel({ mode, root })}</b>
                      </bdi>
                    </>
                  )}
                </span>
                <span className="mark">{r.ok ? "✓" : "✗"}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <button type="button" className="btn block big plum" onClick={exit.go}>
        {exit.label}
      </button>
      <button
        type="button"
        className="btn text block"
        style={{ marginTop: 8 }}
        onClick={() => {
          if (!start(s.plan)) showToast("Nothing to study here right now.");
        }}
      >
        Retake
      </button>
    </div>
  );
}

function PlacementResult({ s }: { s: Session }) {
  const { start } = useSession.getState();
  const setView = useUi((st) => st.setView);
  const placement = useProgress((st) => st.p.placement);
  const unit = placement ? COURSE.byId[placement.startUnit] : COURSE.units[0];
  const skipped = unit.pathIndex;
  const score = s.score ?? 0;
  const firstSeal = s.rewards?.newSeals[0];
  return (
    <div className="dark-screen">
      <div className="eyebrow">Placement · {score}% correct</div>
      <div className="big-he">{unit.section.he}</div>
      <div className="big-t">Start at {unitTitle(unit)}</div>
      <p>
        {skipped
          ? `${skipped} unit${skipped === 1 ? "" : "s"} marked complete. Their roots return for review in a week — a miss reopens them.`
          : "Starting from the first unit — a solid foundation."}
      </p>
      <div className="tiles2">
        <div>
          <div className="eyebrow">Gems</div>
          <div className="v gold tnum">✦ {s.rewards?.parts.placement ?? GEM_PLACEMENT}</div>
        </div>
        <div>
          <div className="eyebrow">{firstSeal ? "New seal" : "Seals"}</div>
          <div className="v">{firstSeal ? SEAL_BY_ID[firstSeal].letter : "—"}</div>
        </div>
      </div>
      <div className="spacer" />
      <button
        type="button"
        className="btn primary block big"
        onClick={() => {
          if (start({ kind: "lesson", unit: unit.id })) setView("play");
          else useSession.getState().leave();
        }}
      >
        Begin the journey
      </button>
      <button
        type="button"
        className="btn ghost block"
        onClick={() => useSession.getState().leave()}
      >
        See the path
      </button>
    </div>
  );
}
