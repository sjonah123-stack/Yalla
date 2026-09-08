import { ROOTS } from "../data/roots";
import { HEBREW_GREETING } from "../lib/hebrew";
import { dayKey, isDue, mastery, pool, seen } from "../lib/srs";
import { themeStrength } from "../lib/stats";
import { useProgress } from "../store/progress";

export default function Home({ onStart }: { onStart: (len?: number) => void }) {
  const p = useProgress((s) => s.p);
  const toggleCat = useProgress((s) => s.toggleCat);
  const setSettings = useProgress((s) => s.setSettings);
  const sync = useProgress((s) => s.sync);
  const now = Date.now();
  const P = pool(ROOTS, p.settings.cats);
  const due = P.filter((r) => isDue(p.roots[r.r], now)).length;
  const known = P.filter((r) => seen(p.roots[r.r])).length;
  const mastered = P.filter((r) => mastery(p.roots[r.r]) >= 4).length;
  const h = p.history[dayKey()] ?? { ok: 0, bad: 0, xp: 0 };
  const themes = themeStrength(ROOTS, p).sort((a, b) => a.cat.localeCompare(b.cat));
  const filtered = p.settings.cats.length > 0;
  const line = due
    ? `${due} root${due === 1 ? "" : "s"} due for review.`
    : known
      ? "Nothing due. Learn something new."
      : "Start with the most common roots.";

  return (
    <>
      <section className="block cobalt">
        <div className="hero">
          <div>
            <div className="greet">{HEBREW_GREETING(new Date().getHours())}</div>
            <div className="sub">{line}</div>
          </div>
          <div className="due" aria-label={`${due} due`}>
            <i className="ring" aria-hidden="true" />
            <div className="n tnum">{due}</div>
            <div className="l">due</div>
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button type="button" className="btn sun big" onClick={() => onStart()}>
            Start · {p.settings.sessionLen}
          </button>
          <button type="button" className="btn" onClick={() => onStart(10)}>
            Quick 10
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>
          Today: {h.ok} right · {h.bad} wrong · +{h.xp} XP
          {sync === "synced" ? " · synced" : ""}
        </p>
      </section>

      <div className="statgrid" style={{ marginTop: 16 }}>
        <div>
          <div className="n tnum">
            {known}
            <small>/{P.length}</small>
          </div>
          <div className="l">seen</div>
        </div>
        <div>
          <div className="n tnum">{mastered}</div>
          <div className="l">mastered</div>
        </div>
        <div>
          <div className="n tnum">{p.xp}</div>
          <div className="l">XP</div>
        </div>
      </div>

      <section className="block" style={{ marginTop: 16 }}>
        <div className="row between">
          <div className="eyebrow">Themes {filtered ? "· focused" : ""}</div>
          {filtered && (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setSettings({ cats: [] })}
            >
              Clear focus
            </button>
          )}
        </div>
        <p className="small muted" style={{ margin: "4px 0 12px" }}>
          Mastery by theme. Tap themes to focus a session on them.
        </p>
        <div className="bars">
          {themes.map((t) => (
            <button
              type="button"
              className="bar"
              key={t.cat}
              aria-pressed={p.settings.cats.includes(t.cat)}
              onClick={() => toggleCat(t.cat)}
            >
              <span className="l">{t.cat}</span>
              <span className="track">
                <i style={{ width: Math.round(t.strength * 100) + "%" }} />
              </span>
              <span className="v tnum">{Math.round(t.strength * 100)}%</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
