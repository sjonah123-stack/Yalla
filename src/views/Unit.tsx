import { useEffect } from "react";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession, type Plan } from "../store/session";
import { useUi } from "../store/ui";
import { GOLD_SCORE, unitCracked, unitMemorized, unitStatus, unitTitle } from "../lib/course";
import { formatMs } from "../lib/match";
import { rootDisplay } from "../lib/hebrew";
import { mastery } from "../lib/srs";
import { MasteryDots } from "../components/MasteryDots";
import { Heb } from "../components/Heb";
import type { UnitId } from "../types";

const STATUS_TEXT = {
  locked: "Locked — finish the unit before it, or test out.",
  available: "Not started. Sixteen questions, new roots introduced first.",
  started: "In progress. Two right answers on separate days locks a root in.",
  learned: "Every root answered right once. Come back tomorrow to lock them in.",
  complete: "Complete — every root memorized. Practice keeps them sharp.",
  gold: "Gold — passed the unit test.",
} as const;

export default function UnitSheet({ unitId }: { unitId: UnitId }) {
  const u = COURSE.byId[unitId];
  const p = useProgress((s) => s.p);
  const closeUnit = useUi((s) => s.closeUnit);
  const openTool = useUi((s) => s.openTool);
  const openRoot = useUi((s) => s.openRoot);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const start = useSession((s) => s.start);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && closeUnit();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [closeUnit]);

  if (!u) return null;
  const status = unitStatus(u, COURSE, p);
  const cracked = unitCracked(u, p);
  const rec = p.units[u.id];
  const mem = unitMemorized(u, p);
  const locked = status === "locked";
  const finished = status === "complete" || status === "gold";
  const go = (plan: Plan) => {
    closeUnit();
    if (start(plan)) setView("play");
    else showToast("Nothing to study here yet.");
  };

  return (
    <div
      className="modal sheetwrap"
      onClick={closeUnit}
      role="dialog"
      aria-modal="true"
      aria-label={unitTitle(u)}
    >
      <div className="panel usheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">
              <Heb>{u.section.he}</Heb> · {u.section.title}
            </div>
            <h2>{unitTitle(u)}</h2>
          </div>
          <div
            className="actions"
            style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
          >
            <span className={`upill ${status}${cracked ? " cracked" : ""}`}>
              {cracked ? "needs repair" : status}
            </span>
            <button type="button" className="btn sm" onClick={closeUnit}>
              Done
            </button>
          </div>
        </div>
        <p className="status">
          {cracked
            ? "Some of these roots have slipped. A lesson will bring them back."
            : STATUS_TEXT[status]}
        </p>
        <div className="row between" style={{ marginTop: 10 }}>
          <span className="tnum">
            <b>{mem}</b> / {u.roots.length} memorized
          </span>
          <span className="small muted tnum">
            {[
              rec?.testBest !== undefined ? `Test ${rec.testBest}%` : "",
              rec?.matchBestMs !== undefined ? `Match ${formatMs(rec.matchBestMs)}` : "",
              rec?.sortBestMs !== undefined ? `Sort ${formatMs(rec.sortBestMs)}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        <div className="uroots">
          {u.roots.map((r) => {
            const m = mastery(p.roots[r.r]);
            return (
              <button
                type="button"
                key={r.r}
                className={"uroot" + (locked ? " dim" : "")}
                onClick={() => openRoot(r.r)}
              >
                <Heb className="glyph">{rootDisplay(r)}</Heb>
                <span className="s">{r.short}</span>
                <MasteryDots level={m} />
              </button>
            );
          })}
        </div>
        <div className="uactions">
          {locked ? (
            <button
              type="button"
              className="btn plum block big"
              onClick={() => go({ kind: "test", unit: u.id })}
            >
              Test out · score {GOLD_SCORE}%+ to unlock
            </button>
          ) : (
            <>
              <button
                type="button"
                className={"btn block big " + (finished ? "plum" : "primary")}
                onClick={() => go({ kind: "lesson", unit: u.id })}
              >
                {status === "available"
                  ? "Start lesson"
                  : finished
                    ? "Practice this unit"
                    : "Continue lesson"}
              </button>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn quiet"
                  onClick={() => openTool("flashcards", u.id)}
                >
                  Flashcards
                </button>
                <button type="button" className="btn quiet" onClick={() => openTool("match", u.id)}>
                  Match{rec?.matchBestMs !== undefined ? ` · ${formatMs(rec.matchBestMs)}` : ""}
                </button>
                <button
                  type="button"
                  className="btn quiet"
                  onClick={() => openTool("familysort", u.id)}
                >
                  Sort{rec?.sortBestMs !== undefined ? ` · ${formatMs(rec.sortBestMs)}` : ""}
                </button>
                <button
                  type="button"
                  className={"btn " + (status === "gold" ? "quiet" : "gold")}
                  onClick={() => go({ kind: "test", unit: u.id })}
                >
                  {status === "gold"
                    ? `Test · ${rec?.testBest}%`
                    : rec?.testBest !== undefined
                      ? `Test · ${rec.testBest}%`
                      : "Test"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
