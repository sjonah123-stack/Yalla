import { useSession, type Session } from "../store/session";
import { useUi } from "../store/ui";
import { useProgress } from "../store/progress";
import { COURSE } from "../store/course";
import { ROOTS, ROOT_BY_ID } from "../data/roots";
import { rootDisplay } from "../lib/hebrew";
import { GOLD_SCORE, memorizedCount, unitMemorized, unitTitle } from "../lib/course";
import { MODE_TITLE } from "../lib/quiz";
import { useCountUp } from "../components/useCountUp";
import type { Question, Root } from "../types";

function Ring({
  pct,
  label,
  stroke = "var(--sun)",
}: {
  pct: number;
  label: string;
  stroke?: string;
}) {
  const anim = useCountUp(pct, 1100);
  const r = 50;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 120 120" aria-label={label}>
      <circle className="bg" cx="60" cy="60" r={r} style={{ stroke: "rgba(255,255,255,.25)" }} />
      <circle
        className="fg"
        cx="60"
        cy="60"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - anim / 100)}
        style={{ stroke }}
      />
      <text x="60" y="60" className="tnum">
        {anim}%
      </text>
    </svg>
  );
}

export default function Summary() {
  const s = useSession((st) => st.s)!;
  if (s.plan.kind === "test") return <TestResult s={s} />;
  if (s.plan.kind === "placement") return <PlacementResult s={s} />;
  return <LessonSummary s={s} />;
}

function LessonSummary({ s }: { s: Session }) {
  const { start, clear } = useSession.getState();
  const setView = useUi((st) => st.setView);
  const openUnit = useUi((st) => st.openUnit);
  const p = useProgress((st) => st.p);
  const total = s.ok + s.bad;
  const acc = total ? Math.round((s.ok / total) * 100) : 0;
  const xp = useCountUp(s.xp);
  const missed = [...new Set(s.missed)].map((id) => ROOT_BY_ID[id]);
  const learned = s.learned.map((id) => ROOT_BY_ID[id]);
  const memAfter = memorizedCount(ROOTS, p);
  const gained = Math.max(0, memAfter - s.memBefore);
  // Roots at interval 1: answered right today, locked in by tomorrow's review.
  const pending = [...new Set(s.slots.map((r) => r.r))].filter((id) => {
    const st = p.roots[id];
    return st && st.reps === 1 && st.ivl === 1;
  }).length;
  const unit = s.plan.kind === "lesson" ? COURSE.byId[s.plan.unit] : null;
  const home = () => {
    clear();
    setView("path");
    if (unit) openUnit(unit.id);
  };

  return (
    <div className="shell view summary">
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <section className="block cobalt" style={{ marginTop: 24 }}>
        <div className="eyebrow">
          {unit ? `${unitTitle(unit)} · lesson complete` : "Practice complete"}
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div>
            <div className="big tnum">+{xp}</div>
            <div className="eyebrow">XP earned</div>
          </div>
          <Ring pct={acc} label={`${acc}% accuracy`} />
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          {s.ok} right · {s.bad} wrong · best combo ×{s.best}
        </p>
      </section>

      <section className="block sun">
        <div className="row between">
          <div>
            <div className="eyebrow">Memorized</div>
            <div className="big tnum" style={{ fontSize: "var(--t-h)" }}>
              {memAfter}
              <small style={{ fontSize: "var(--t-body)", fontWeight: 700, opacity: 0.7 }}>
                /{ROOTS.length}
              </small>
              {gained > 0 && <span className="delta tnum"> +{gained}</span>}
            </div>
          </div>
          {unit && (
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow">{unitTitle(unit)}</div>
              <div className="big tnum" style={{ fontSize: "var(--t-h)" }}>
                {unitMemorized(unit, p)}
                <small style={{ fontSize: "var(--t-body)", fontWeight: 700, opacity: 0.7 }}>
                  /{unit.roots.length}
                </small>
              </div>
            </div>
          )}
        </div>
        {pending > 0 && (
          <p style={{ marginTop: 10 }}>
            <b>Come back tomorrow</b> to lock in {pending} root{pending === 1 ? "" : "s"} — a second
            right answer on a new day is what makes a root memorized.
          </p>
        )}
      </section>

      {learned.length > 0 && <RootList title="New roots met" roots={learned} />}
      {missed.length > 0 && <RootList title="Back soon" roots={missed} />}
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn primary" onClick={() => start(s.plan)}>
          {unit ? "Another lesson" : "Another round"}
        </button>
        <button type="button" className="btn" onClick={home}>
          {unit ? "Back to unit" : "Path"}
        </button>
      </div>
    </div>
  );
}

function RootList({ title, roots }: { title: string; roots: Root[] }) {
  return (
    <section className="block">
      <div className="eyebrow">{title}</div>
      <ul>
        {roots.map((r) => (
          <li key={r.r}>
            <span className="glyph lead">{rootDisplay(r)}</span>
            <span className="muted">{r.m}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The answer a question wanted, as a short label. */
function correctLabel(q: Pick<Question, "mode" | "root">): string {
  return q.mode === "rootMeaning" ? q.root.short : rootDisplay(q.root);
}

function TestResult({ s }: { s: Session }) {
  const { start, clear } = useSession.getState();
  const setView = useUi((st) => st.setView);
  const openUnit = useUi((st) => st.openUnit);
  const unit = s.plan.kind === "test" ? COURSE.byId[s.plan.unit] : COURSE.units[0];
  const score = s.score ?? 0;
  const gold = score >= GOLD_SCORE;
  const back = () => {
    clear();
    setView("path");
    openUnit(unit.id);
  };
  return (
    <div className="shell view summary">
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <section className={"block " + (gold ? "sun celebrate" : "cobalt")} style={{ marginTop: 24 }}>
        {gold && (
          <div className="shapes" aria-hidden="true">
            <i className="a" />
            <i className="b" />
            <i className="c" />
          </div>
        )}
        <div className="eyebrow">
          {unitTitle(unit)} · {gold ? (s.wentGold ? "Gold!" : "Gold again") : "Test"}
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div>
            <div className="big tnum">
              {s.ok}
              <small style={{ fontSize: "var(--t-lead)", fontWeight: 700, opacity: 0.7 }}>
                /{s.slots.length}
              </small>
            </div>
            <div className="eyebrow">{gold ? "unit is gold" : `${GOLD_SCORE}% turns it gold`}</div>
          </div>
          <Ring pct={score} label={`${score}% score`} stroke={gold ? "var(--ink)" : "var(--sun)"} />
        </div>
        {s.xp > 0 && (
          <p className="muted" style={{ marginTop: 12 }}>
            +{s.xp} XP{gold && s.wentGold ? " · next unit unlocked" : ""}
          </p>
        )}
      </section>
      <section className="block">
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
      </section>
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn primary" onClick={() => start(s.plan)}>
          Retake
        </button>
        <button type="button" className="btn" onClick={back}>
          Back to unit
        </button>
      </div>
    </div>
  );
}

function PlacementResult({ s }: { s: Session }) {
  const { start, clear } = useSession.getState();
  const setView = useUi((st) => st.setView);
  const placement = useProgress((st) => st.p.placement);
  const unit = placement ? COURSE.byId[placement.startUnit] : COURSE.units[0];
  const skipped = unit.pathIndex;
  const score = s.score ?? 0;
  return (
    <div className="shell view summary">
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <section className="block cobalt" style={{ marginTop: 24 }}>
        <div className="eyebrow">Placement</div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div>
            <div className="eyebrow">Start at</div>
            <div className="big" style={{ fontSize: "var(--t-h)" }}>
              {unit.section.he} · {unitTitle(unit)}
            </div>
            <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
              {skipped
                ? `${skipped} unit${skipped === 1 ? "" : "s"} marked complete. Their roots come back for review in a week — a miss reopens them.`
                : "Starting from the first unit."}
            </div>
          </div>
          <Ring pct={score} label={`${score}% correct`} />
        </div>
      </section>
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn sun"
          onClick={() => {
            if (start({ kind: "lesson", unit: unit.id })) setView("play");
          }}
        >
          Start here
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            clear();
            setView("path");
          }}
        >
          See the path
        </button>
      </div>
    </div>
  );
}
