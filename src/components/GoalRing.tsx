import { useCountUp } from "./useCountUp";

/** Daily-goal ring: XP earned today against the goal. */
export function GoalRing({ xp, goal, size = 88 }: { xp: number; goal: number; size?: number }) {
  const pct = Math.min(1, xp / goal);
  const shown = useCountUp(Math.round(pct * 100), 900);
  const r = 41;
  const c = 2 * Math.PI * r;
  const done = xp >= goal;
  return (
    <div className={"goal" + (done ? " done" : "")} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-label={`${xp} of ${goal} XP today`}>
        <circle className="bg" cx="50" cy="50" r={r} />
        <circle
          className="fg"
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <div className="txt">
        <b className="tnum">{Math.min(xp, goal)}</b>
        <small className="tnum">/ {goal} XP</small>
      </div>
    </div>
  );
}
