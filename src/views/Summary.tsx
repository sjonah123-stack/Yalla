import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { ROOTS } from "../data/roots";
import { rootDisplay } from "../lib/hebrew";
import { useCountUp } from "../components/useCountUp";

const byId = Object.fromEntries(ROOTS.map((r) => [r.r, r]));

export default function Summary() {
  const s = useSession((st) => st.s)!;
  const { start, clear } = useSession.getState();
  const setView = useUi((st) => st.setView);
  const total = s.ok + s.bad;
  const acc = total ? Math.round((s.ok / total) * 100) : 0;
  const xp = useCountUp(s.xp);
  const accAnim = useCountUp(acc, 1100);
  const missed = [...new Set(s.missed)].map((id) => byId[id]);
  const learned = s.learned.map((id) => byId[id]);
  const r = 50;
  const c = 2 * Math.PI * r;

  return (
    <div className="shell view summary">
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <section className="block cobalt" style={{ marginTop: 24 }}>
        <div className="eyebrow">Session complete</div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div>
            <div className="big tnum">+{xp}</div>
            <div className="eyebrow">XP earned</div>
          </div>
          <svg className="ring" viewBox="0 0 120 120" aria-label={`${acc}% accuracy`}>
            <circle
              className="bg"
              cx="60"
              cy="60"
              r={r}
              style={{ stroke: "rgba(255,255,255,.25)" }}
            />
            <circle
              className="fg"
              cx="60"
              cy="60"
              r={r}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - accAnim / 100)}
              style={{ stroke: "var(--sun)" }}
            />
            <text x="60" y="60" className="tnum">
              {accAnim}%
            </text>
          </svg>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          {s.ok} right · {s.bad} wrong · best combo ×{s.best}
        </p>
      </section>

      {learned.length > 0 && (
        <section className="block">
          <div className="eyebrow">New roots learned</div>
          <ul>
            {learned.map((r) => (
              <li key={r.r}>
                <span className="glyph lead">{rootDisplay(r)}</span>
                <span className="muted">{r.m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {missed.length > 0 && (
        <section className="block">
          <div className="eyebrow">Back tomorrow</div>
          <ul>
            {missed.map((r) => (
              <li key={r.r}>
                <span className="glyph lead">{rootDisplay(r)}</span>
                <span className="muted">{r.m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="btn-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn primary" onClick={() => start()}>
          Another session
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            clear();
            setView("home");
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
