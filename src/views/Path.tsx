import { useEffect, useRef, useState } from "react";
import type React from "react";
import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
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
  type UnitStatus,
} from "../lib/course";
import { rootLetters } from "../lib/hebrew";
import { SECTION_BY_CAT } from "../data/course";
import { HeaderGear } from "../components/HeaderGear";

type SectionState = "locked" | "open" | "done";

/** The path: one card per theme; the open theme shows its units in a compact row. */
export default function Path() {
  const p = useProgress((s) => s.p);
  const openUnit = useUi((s) => s.openUnit);
  const showToast = useUi((s) => s.showToast);
  const cur = currentUnit(COURSE, p);
  const cats = p.settings.cats;
  const mem = memorizedCount(ROOTS, p);
  const [open, setOpen] = useState<string>(cur.section.id);
  const curRef = useRef<HTMLElement | null>(null);
  const status = (u: Unit) => unitStatus(u, COURSE, p);

  useEffect(() => {
    const t = setTimeout(
      () => curRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
      150,
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="view-h">
        <h2>Path</h2>
        <div className="actions">
          <span className="k tnum">
            {mem} / {ROOTS.length} memorized
          </span>
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              setOpen(cur.section.id);
              curRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
            }}
          >
            Current ↓
          </button>
          <HeaderGear />
        </div>
      </div>
      <p>
        {COURSE.sections.length} themes, {COURSE.units.length} units. Finish a unit to unlock the
        next; finish a theme to open its chest.
      </p>
      {cats.length > 0 && (
        <button
          type="button"
          className="chip toggle"
          aria-pressed={true}
          onClick={() => {
            useProgress.getState().setSettings({ cats: [] });
            showToast("Practice covers every theme again.");
          }}
        >
          Focus: {cats.map((c) => SECTION_BY_CAT[c]?.title ?? c).join(", ")}
          <span className="x">×</span>
        </button>
      )}
      <div className="secs">
        {COURSE.sections.map((sec) => {
          const units = COURSE.units.filter((u) => u.section.id === sec.id);
          const rs = ROOTS.filter((r) => r.cat === sec.cat);
          const k = memorizedCount(rs, p);
          const sts = units.map(status);
          const allDone = sts.every((s) => s === "complete" || s === "gold");
          const state: SectionState = allDone
            ? "done"
            : sts.every((s) => s === "locked")
              ? "locked"
              : "open";
          const isCur = sec.id === cur.section.id;
          const expanded = open === sec.id;
          const chestPaid = !!p.sectionChests[sec.id];
          const pct = rs.length ? Math.round((k / rs.length) * 100) : 0;
          return (
            <section
              key={sec.id}
              ref={isCur ? curRef : undefined}
              className={`sec ${state}${expanded ? " expanded" : ""}${isCur ? " current" : ""}`}
              style={{ "--c": sectionColor(sec.id) } as React.CSSProperties}
            >
              <button
                type="button"
                className="sec-h"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? "" : sec.id)}
              >
                <span className="he">{sec.he}</span>
                <span className="txt">
                  <span className="t">{sec.title}</span>
                  <span className="s tnum">
                    {units.length} unit{units.length === 1 ? "" : "s"} · {k}/{rs.length} memorized
                  </span>
                  <span className="track" aria-hidden="true">
                    <i style={{ width: pct + "%" }} />
                  </span>
                </span>
                <span className={"badge " + state} aria-hidden="true">
                  {state === "done" ? (chestPaid ? "✦" : "✓") : state === "locked" ? "🔒" : "›"}
                </span>
              </button>
              {expanded && (
                <div className="units">
                  {units.map((u, i) => (
                    <UnitChip
                      key={u.id}
                      unit={u}
                      status={sts[i]}
                      memorized={unitMemorized(u, p)}
                      current={u.id === cur.id}
                      cracked={unitCracked(u, p)}
                      onClick={() => openUnit(u.id)}
                    />
                  ))}
                  <div className={"chestchip" + (allDone ? " open" : "")}>
                    <span aria-hidden="true">{allDone ? "✦" : "▣"}</span>
                    {allDone
                      ? chestPaid
                        ? "Chest claimed · +50"
                        : "Chest ready · +50"
                      : `Finish ${sec.title} for +50`}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="pend">
        <span className="glyph">שׁ</span>
        <span className="small muted">More roots coming: the bank grows in batches.</span>
      </div>
    </>
  );
}

function UnitChip({
  unit,
  status,
  memorized,
  current,
  cracked,
  onClick,
}: {
  unit: Unit;
  status: UnitStatus;
  memorized: number;
  current: boolean;
  cracked: boolean;
  onClick: () => void;
}) {
  const done = status === "complete" || status === "gold";
  const label =
    status === "locked"
      ? "locked"
      : cracked
        ? "repair"
        : status === "gold"
          ? "gold"
          : done
            ? "complete"
            : `${memorized}/${unit.roots.length}`;
  return (
    <button
      type="button"
      className={`uchip ${status}${current ? " current" : ""}${cracked ? " cracked" : ""}`}
      onClick={onClick}
      aria-label={`${unitTitle(unit)}, ${status}, ${memorized} of ${unit.roots.length} memorized`}
    >
      <span className="disc">
        <span className="glyph">{unit.roots[0] ? rootLetters(unit.roots[0]) : "?"}</span>
        {done && !cracked && (
          <span className="check" aria-hidden="true">
            ✓
          </span>
        )}
      </span>
      <span className="t">{unitTitle(unit)}</span>
      <span className="s tnum">{label}</span>
    </button>
  );
}
