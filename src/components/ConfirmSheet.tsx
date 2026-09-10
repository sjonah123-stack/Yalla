import { useEffect } from "react";
import { useUi } from "../store/ui";

/** The in-app confirm sheet, driven by `useUi().confirm(spec)`. Escape and the backdrop cancel. */
export function ConfirmSheet() {
  const spec = useUi((s) => s.confirmSpec);
  const resolve = useUi((s) => s.resolveConfirm);
  useEffect(() => {
    if (!spec) return;
    // Capture phase, so the sheet swallows Escape before Settings / the unit sheet / Play see it.
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        resolve(null);
      } else if (!["Tab", "Enter", " "].includes(e.key)) e.stopPropagation();
    };
    document.addEventListener("keydown", k, { capture: true });
    return () => document.removeEventListener("keydown", k, { capture: true });
  }, [spec, resolve]);
  if (!spec) return null;
  return (
    <div
      className="modal confirm"
      onClick={() => resolve(null)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="panel confirm" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-title">{spec.title}</h2>
        {spec.body && <p>{spec.body}</p>}
        <div className="actions">
          {spec.actions.map((a, i) => (
            <button
              key={a.value}
              type="button"
              className={"btn block big " + (a.kind ?? "quiet")}
              autoFocus={i === 0}
              onClick={() => resolve(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
