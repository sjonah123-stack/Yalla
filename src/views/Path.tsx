import { useEffect, useRef, useState } from "react";
import type React from "react";
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
import { dayKey, isDue, level, levelCeil, levelFloor, seen, streakAlive } from "../lib/srs";
import { rootLetters } from "../lib/hebrew";
import { SEALS } from "../lib/rewards";
import { GoalRing } from "../components/GoalRing";
import { UnitNode } from "../components/UnitNode";
import { IconGear } from "../components/Icons";

export default function Path() {
  const p = useProgress((s) => s.p);
  const openUnit = useUi((s) => s.openUnit);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const start = useSession((s) => s.start);
  const now = Date.now();
  const mem = memorizedCount(ROOTS, p);
  const cur = currentUnit(COURSE, p);
  const due = ROOTS.filter((r) => isDue(p.roots[r.r], now)).length;
  const fresh = !p.placement && !ROOTS.some((r) => seen(p.roots[r.r]));
  const today = p.history[dayKey()] ?? { ok: 0, bad: 0, xp: 0 };
  const curRef = useRef<HTMLButtonElement | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const l = level(p.xp);
  const lo = levelFloor(l);
  const hi = levelCeil(l);
  const lvlPct = Math.max(2, Math.round(((p.xp - lo) / (hi - lo)) * 100));
  const alive = streakAlive(p.lastPlay);
  const sealCount = Object.keys(p.seals).length;

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
  const curGlyph = rootLetters(cur.roots[0]);

  return (
    <>
      <header className="pathhero">
        <div className="mark" aria-hidden="true">
          {curGlyph}
        </div>
        <div className="bar">
          <span className="logo">
            יאללה<span className="dot">.</span>
          </span>
          <div className="pills">
            <span className={"pill" + (alive ? "" : " dim")} title="Day streak">
              🔥 <span className="tnum">{alive ? p.streak : 0}</span>
            </span>
            <span className="pill gems" title="Gems">
              ✦ <span className="tnum">{p.gems}</span>
            </span>
            <button
              type="button"
              className="pill icon"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <IconGear />
            </button>
          </div>
        </div>
        <div className="memo">
          <div>
            <div className="eyebrow">Roots memorized</div>
            <div className="big tnum">
              {mem}
              <small> / {ROOTS.length}</small>
            </div>
            <div className="sub">
              {fresh
                ? "Every root, one unit at a time."
                : `${cur.section.he} · ${unitTitle(cur)} · ${curMem}/${cur.roots.length}`}
            </div>
          </div>
          <GoalRing xp={today.xp} goal={p.settings.dailyGoal} size={88} />
        </div>
        <div className="lvl">
          <span>Level {l}</span>
          <span className="tnum">
            {hi - p.xp} XP to level {l + 1}
          </span>
        </div>
        <div
          className="xpbar"
          role="progressbar"
          aria-valuenow={lvlPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${p.xp} XP`}
        >
          <i style={{ width: lvlPct + "%" }} />
        </div>
      </header>

      <div className="home">
        <button type="button" className="cta" onClick={() => go({ kind: "lesson", unit: cur.id })}>
          <span className="tile">
            <span className="glyph">{curGlyph}</span>
          </span>
          <span className="txt">
            <span className="eyebrow">{fresh ? "Start" : "Continue"}</span>
            <span className="t">{unitTitle(cur)}</span>
            <span className="s">
              {cur.roots.length - curMem} root{cur.roots.length - curMem === 1 ? "" : "s"} left to
              memorize
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>
        <div className="quick">
          <button type="button" onClick={() => go({ kind: "practice" })}>
            <span className="ic coral" aria-hidden="true">
              ◔
            </span>
            Practice
            <span className="s tnum">{due ? `${due} due` : "nothing due"}</span>
          </button>
          <button type="button" onClick={() => setView("progress")}>
            <span className="ic plum" aria-hidden="true">
              ◈
            </span>
            Seals
            <span className="s tnum">
              {sealCount} / {SEALS.length}
            </span>
          </button>
        </div>
        {fresh && (
          <section className="block gold placepitch">
            <div className="eyebrow">Already know some Hebrew?</div>
            <p style={{ marginTop: 6 }}>
              A 30-question placement test skips you past the roots you already own.
            </p>
            <button
              type="button"
              className="btn plum block"
              style={{ marginTop: 12 }}
              onClick={() => go({ kind: "placement" })}
            >
              Take the placement test
            </button>
          </section>
        )}
      </div>

      <div className="path">
        {COURSE.sections.map((sec) => {
          const units = COURSE.units.filter((u) => u.section.id === sec.id);
          const color = sectionColor(sec.id);
          const rs = ROOTS.filter((r) => r.cat === sec.cat);
          const k = memorizedCount(rs, p);
          const sts = units.map((u) => status(u));
          const allDone = sts.every((s) => s === "complete" || s === "gold");
          const allLocked = sts.every((s) => s === "locked");
          const hasCur = units.some((u) => u.id === cur.id);
          const collapsed = allDone && !hasCur && !expanded.has(sec.id);
          const road =
            units
              .map(
                (_, i) =>
                  `${i === 0 ? "M" : "L"} ${i % 2 === 0 ? 14 : 86} ${(((i + 0.5) / (units.length + 1)) * 100).toFixed(2)}`,
              )
              .join(" ") +
            ` L 50 ${(((units.length + 0.5) / (units.length + 1)) * 100).toFixed(2)}`;
          const chestPaid = !!p.sectionChests[sec.id];
          return (
            <section
              className={"psec" + (collapsed ? " collapsed" : "") + (allLocked ? " dim" : "")}
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
                <span className="he">{sec.he}</span>
                <span className="t">{sec.title}</span>
                <span className="k tnum">
                  {k}/{rs.length}
                </span>
              </button>
              {!collapsed && (
                <div className="pnodes">
                  <svg
                    className="road"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <path d={road} />
                  </svg>
                  {units.map((u, i) => {
                    const st = sts[i];
                    const isCur = u.id === cur.id;
                    return (
                      <UnitNode
                        key={u.id}
                        unit={u}
                        status={st}
                        memorized={unitMemorized(u, p)}
                        current={isCur}
                        cracked={unitCracked(u, p)}
                        side={i % 2 === 0 ? "l" : "r"}
                        onClick={() => openUnit(u.id)}
                        nodeRef={isCur ? (el) => (curRef.current = el) : undefined}
                      />
                    );
                  })}
                  <div className="chestrow">
                    <div className={"chest" + (allDone ? " open" : "")} aria-hidden="true">
                      {allDone ? "✦" : "▣"}
                    </div>
                    <div className="l">
                      {allDone
                        ? chestPaid
                          ? "Section chest · +50 gems claimed"
                          : "Section chest · +50 gems on your next lesson"
                        : `Section chest · finish ${sec.title}`}
                    </div>
                  </div>
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
