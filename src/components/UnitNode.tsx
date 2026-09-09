import type { Unit, UnitStatus } from "../lib/course";
import { rootLetters } from "../lib/hebrew";

export function UnitNode({
  unit,
  status,
  memorized,
  current,
  cracked,
  color,
  side,
  onClick,
  nodeRef,
}: {
  unit: Unit;
  status: UnitStatus;
  memorized: number;
  current: boolean;
  cracked: boolean;
  color: string;
  side: "l" | "r";
  onClick: () => void;
  nodeRef?: (el: HTMLButtonElement | null) => void;
}) {
  const total = unit.roots.length;
  const pct = total ? memorized / total : 0;
  const title = unit.section.units.length > 1 ? `${unit.indexInSection + 1}` : "";
  return (
    <button
      ref={nodeRef}
      type="button"
      className={`pnode ${status} ${side}${current ? " current" : ""}${cracked ? " cracked" : ""}`}
      style={{ "--c": color, "--pct": pct } as React.CSSProperties}
      onClick={onClick}
      aria-label={`${unit.section.title} ${title}, ${status}, ${memorized} of ${total} memorized`}
    >
      {current && <span className="tag">Continue</span>}
      <span className="disc">
        <span className="glyph">{rootLetters(unit.roots[0])}</span>
        {title && <span className="n tnum">{title}</span>}
      </span>
      <span className="lbl">
        <span className="tnum">
          {memorized}/{total}
        </span>
        {status === "locked" ? " locked" : status === "gold" ? " gold" : cracked ? " repair" : ""}
      </span>
    </button>
  );
}
