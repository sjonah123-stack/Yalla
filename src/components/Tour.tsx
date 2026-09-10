import { useEffect, useState } from "react";
import { useProgress } from "../store/progress";
import { useSheetDrag } from "./useSheetDrag";

const STEPS = [
  {
    t: "Your path",
    b: "Yalla teaches Hebrew through its roots. The Continue card always holds your next lesson; the Path tab shows every theme.",
  },
  {
    t: "Make it stick",
    b: "Practice reviews what's due. Roots you keep missing show up as Tricky. Each unit has flashcards, match, sort and a test.",
  },
  {
    t: "Tell us what's wrong",
    b: "See a bad meaning or nikud? Flag the root from any answer sheet or the Roots list, and it gets fixed.",
  },
] as const;

const done = () => useProgress.getState().markTour();

/**
 * The first-run tour: three cards over Home, shown once after onboarding. Escape, Skip and the
 * last step all mark it done; a backdrop tap deliberately does nothing.
 */
export function Tour() {
  const [i, setI] = useState(0);
  const drag = useSheetDrag<HTMLDivElement>(done);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      done();
    };
    document.addEventListener("keydown", k, { capture: true });
    return () => document.removeEventListener("keydown", k, { capture: true });
  }, []);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  return (
    <div className="modal tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="panel tour" ref={drag.ref} style={drag.style}>
        <h2 id="tour-title">{step.t}</h2>
        <p>{step.b}</p>
        <div className="dots" aria-hidden="true">
          {STEPS.map((s, n) => (
            <i key={s.t} className={n === i ? "on" : undefined} />
          ))}
        </div>
        <button
          type="button"
          className={"btn block big " + (last ? "primary" : "plum")}
          autoFocus
          onClick={() => (last ? done() : setI(i + 1))}
        >
          {last ? "Let's go" : "Next"}
        </button>
        {!last && (
          <button type="button" className="btn text" onClick={done}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
