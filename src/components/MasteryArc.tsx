/** A filled arc: mastery 0–5 as fifths of a circle. */
export function MasteryArc({ level, size = 28 }: { level: number; size?: number }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg
      className="arc"
      viewBox="0 0 28 28"
      width={size}
      height={size}
      aria-label={`mastery ${level} of 5`}
    >
      <circle className="bg" cx="14" cy="14" r={r} />
      <circle
        className="fg"
        cx="14"
        cy="14"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - level / 5)}
      />
    </svg>
  );
}
