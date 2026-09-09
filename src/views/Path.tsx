import { useEffect, useRef, useState } from "react";
import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession, type Plan } from "../store/session";
import { useUi } from "../store/ui";
import {
  currentUnit,
  memorizedCount,
  sectionColor,
  unitCracked,
  unitMemorized,
  unitStatus,
  unitTitle,
  type Unit,
} from "../lib/course";
import { dayKey, isDue, seen } from "../lib/srs";
import { GoalRing } from "../components/GoalRing";
import { UnitNode } from "../components/UnitNode";

export default function Path() {
  const p = useProgress((s) => s.p);
  const openUnit = useUi((s) => s.openUnit);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const start = useSession((s) => s.start);
  const now = Date.now();
  const mem = memorizedCount(ROOTS, p);
  const cur = currentUnit(COURSE, p);
  const due = ROOTS.filter((r) => isDue(p.roots[r.r], now)).length;
  const fresh = !p.placement && !ROOTS.some((r) => seen(p.roots[r.r]));
  const today = p.history[dayKey()] ?? { ok: 0, bad: 0, xp: 0 };
  const curRef = useRef<HTMLButtonElement | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      curRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const go = (plan: Plan) => {
    if (start(plan)) setView("play");
    else
      showToast(
        plan.kind === "practice"
          ? "Nothing due yet — keep going on the path."
          : "Nothing to study here.",
      );
  };
  const status = (u: Unit) => unitStatus(u, COURSE, p);
  const curMem = unitMemorized(cur, p);

  return (
    <>
      <section className="block cobalt pathhead">
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">Memorized</div>
            <div className="big tnum">
              {mem}
              <small>/{ROOTS.length}</small>
            </div>
            <div className="sub">
              {fresh
                ? "Every root, one unit at a time."
                : `${cur.section.he} · ${unitTitle(cur)} · ${curMem}/${cur.roots.length}`}
            </div>
          </div>
          <GoalRing xp={today.xp} goal={p.settings.dailyGoal} />
        </div>
        <div className="memrule" aria-hidden="true">
          {COURSE.sections.map((s) => {
            const rs = ROOTS.filter((r) => r.cat === s.cat);
            const k = memorizedCount(rs, p);
            return (
              <i
                key={s.id}
                style={
                  {
                    flex: rs.length,
                    "--c": sectionColor(s.id),
                    "--pct": k / rs.length,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
        <div className="btn-row" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn sun big"
            onClick={() => go({ kind: "lesson", unit: cur.id })}
          >
            {fresh ? "Start" : "Continue"}
          </button>
          <button type="button" className="btn" onClick={() => go({ kind: "practice" })}>
            Practice{due ? ` · ${due} due` : ""}
          </button>
        </div>
      </section>

      {fresh && (
        <section className="block sun" style={{ marginTop: 16 }}>
          <div className="eyebrow">New here?</div>
          <p style={{ marginTop: 6 }}>
            Already know some Hebrew? A 30-question placement test skips you past the roots you
            already own.
          </p>
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button type="button" className="btn primary" onClick={() => go({ kind: "placement" })}>
              Take the placement test
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => go({ kind: "lesson", unit: cur.id })}
            >
              Start from the beginning
            </button>
          </div>
        </section>
      )}

      <div className="path">
        {COURSE.sections.map((sec) => {
          const units = COURSE.units.filter((u) => u.section.id === sec.id);
          const color = sectionColor(sec.id);
          const rs = ROOTS.filter((r) => r.cat === sec.cat);
          const k = memorizedCount(rs, p);
          const allDone = units.every((u) => ["complete", "gold"].includes(status(u)));
          const hasCur = units.some((u) => u.id === cur.id);
          const collapsed = allDone && !hasCur && !expanded.has(sec.id);
          return (
            <section
              className={"psec" + (collapsed ? " collapsed" : "")}
              key={sec.id}
              style={{ "--c": color } as React.CSSProperties}
            >
              <button
                type="button"
                className="psec-h"
                onClick={() =>
                  setExpanded((e) => {
                    const n = new Set(e);
                    if (n.has(sec.id)) n.delete(sec.id);
                    else n.add(sec.id);
                    return n;
                  })
                }
                aria-expanded={!collapsed}
              >
                <i className="sq" />
                <span className="he">{sec.he}</span>
                <span className="t">{sec.title}</span>
                <span className="k tnum">
                  {k}/{rs.length}
                </span>
              </button>
              {!collapsed && (
                <div className="pnodes">
                  {units.map((u, i) => {
                    const st = status(u);
                    const isCur = u.id === cur.id;
                    return (
                      <UnitNode
                        key={u.id}
                        unit={u}
                        status={st}
                        memorized={unitMemorized(u, p)}
                        current={isCur}
                        cracked={unitCracked(u, p)}
                        color={color}
                        side={i % 2 === 0 ? "l" : "r"}
                        onClick={() => openUnit(u.id)}
                        nodeRef={isCur ? (el) => (curRef.current = el) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        <div className="pend">
          <span className="glyph">שׁ</span>
          <span className="small muted">More roots coming: the bank grows in batches.</span>
        </div>
      </div>
    </>
  );
}
