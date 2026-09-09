/** Mastery 0–5 as five dots. */
export function MasteryDots({ level }: { level: number }) {
  return (
    <span className="dots" aria-label={`mastery ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={i < level ? "on" : undefined} />
      ))}
    </span>
  );
}
