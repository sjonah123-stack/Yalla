import type { Unit, UnitStatus } from "../lib/course";
import { unitTitle } from "../lib/course";
import { rootLetters } from "../lib/hebrew";

export function UnitNode({
  unit,
  status,
  memorized,
  current,
  cracked,
  side,
  onClick,
  nodeRef,
}: {
  unit: Unit;
  status: UnitStatus;
  memorized: number;
  current: boolean;
  cracked: boolean;
  side: "l" | "r";
  onClick: () => void;
  nodeRef?: (el: HTMLButtonElement | null) => void;
}) {
  const total = unit.roots.length;
  const done = status === "complete" || status === "gold";
  const label =
    status === "locked"
      ? "locked"
      : cracked
        ? `${memorized}/${total} · repair`
        : done
          ? `${memorized}/${total} · ${status === "gold" ? "gold" : "complete"}`
          : `${memorized}/${total} memorized`;
  return (
    <button
      ref={nodeRef}
      type="button"
      className={`pnode ${status} ${side}${current ? " current" : ""}${cracked ? " cracked" : ""}`}
      onClick={onClick}
      aria-label={`${unitTitle(unit)}, ${status}, ${memorized} of ${total} memorized`}
    >
      <span className="disc">
        <span className="ring" aria-hidden="true" />
        <span className="glyph">{rootLetters(unit.roots[0])}</span>
        {done && !cracked && (
          <span className="check" aria-hidden="true">
            ✓
          </span>
        )}
      </span>
      <span className="lbl">
        <span className="t">{unitTitle(unit)}</span>
        <span className="s tnum">{label}</span>
      </span>
    </button>
  );
}
