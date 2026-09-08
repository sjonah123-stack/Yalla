import { ROOTS } from "../data/roots";
import { dayKey, level, levelCeil, levelFloor } from "../lib/srs";
import {
  accuracyTrend,
  heatmap,
  masteryDistribution,
  themeStrength,
  totals,
  upcomingReviews,
} from "../lib/stats";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";

const MASTERY_COLORS = [
  "var(--stone)",
  "var(--bad)",
  "var(--terracotta)",
  "var(--sun)",
  "var(--good)",
  "var(--cobalt)",
];

export default function Progress() {
  const p = useProgress((s) => s.p);
  const toggleCat = useProgress((s) => s.toggleCat);
  const setView = useUi((s) => s.setView);
  const t = totals(p.history);
  const today = dayKey();
  const heat = heatmap(p.history, 20);
  const trend = accuracyTrend(p.history, 30);
  const dist = masteryDistribution(ROOTS, p);
  const themes = themeStrength(ROOTS, p);
  const upcoming = upcomingReviews(ROOTS, p, 14);
  const l = level(p.xp);
  const acc = t.ok + t.bad ? Math.round((t.ok / (t.ok + t.bad)) * 100) : 0;

  return (
    <>
      <div className="statgrid">
        <div>
          <div className="n tnum">{p.streak}</div>
          <div className="l">day streak</div>
        </div>
        <div>
          <div className="n tnum">{t.days}</div>
          <div className="l">days played</div>
        </div>
        <div>
          <div className="n tnum">{acc}%</div>
          <div className="l">accuracy</div>
        </div>
      </div>

      <section className="block" style={{ marginTop: 16 }}>
        <div className="row between">
          <div className="eyebrow">Level {l}</div>
          <span className="small muted tnum">
            {p.xp - levelFloor(l)} / {levelCeil(l) - levelFloor(l)} XP to level {l + 1}
          </span>
        </div>
        <div className="xpbar" style={{ margin: "10px 0 0" }}>
          <i
            style={{
              width:
                Math.max(
                  2,
                  Math.round(((p.xp - levelFloor(l)) / (levelCeil(l) - levelFloor(l))) * 100),
                ) + "%",
            }}
          />
        </div>
      </section>

      <section className="block">
        <div className="eyebrow">Activity · last 20 weeks</div>
        <div className="heat" style={{ marginTop: 12 }} aria-label="Daily activity heatmap">
          {heat.flat().map((c) => (
            <i
              key={c.day}
              className={`l${c.level}` + (c.day === today ? " today" : "")}
              title={`${c.day}: ${c.ok} right, ${c.bad} wrong, +${c.xp} XP`}
            />
          ))}
        </div>
      </section>

      <section className="block">
        <div className="eyebrow">Accuracy · last 30 days</div>
        <Trend points={trend} />
      </section>

      <section className="block">
        <div className="eyebrow">Mastery across {ROOTS.length} roots</div>
        <div className="dist" style={{ marginTop: 12 }} aria-label="Mastery distribution">
          {dist.map((n, i) => (
            <i
              key={i}
              style={{ width: (n / ROOTS.length) * 100 + "%", background: MASTERY_COLORS[i] }}
              title={`Level ${i}: ${n}`}
            />
          ))}
        </div>
        <div className="legend">
          {dist.map((n, i) => (
            <span key={i}>
              <i style={{ background: MASTERY_COLORS[i] }} />
              {i === 0 ? "new" : `L${i}`} <span className="tnum">{n}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="eyebrow">Upcoming reviews · 14 days</div>
        <Upcoming data={upcoming} />
      </section>

      <section className="block">
        <div className="eyebrow">Weakest themes first</div>
        <p className="small muted" style={{ margin: "4px 0 12px" }}>
          Tap a theme to focus, then start a session.
        </p>
        <div className="bars">
          {themes.map((th) => (
            <button
              type="button"
              className="bar"
              key={th.cat}
              aria-pressed={p.settings.cats.includes(th.cat)}
              onClick={() => {
                toggleCat(th.cat);
                setView("home");
              }}
            >
              <span className="l">{th.cat}</span>
              <span className="track">
                <i style={{ width: Math.round(th.strength * 100) + "%" }} />
              </span>
              <span className="v tnum">
                {th.seen}/{th.n}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Trend({ points }: { points: { day: string; acc: number | null; total: number }[] }) {
  const W = 300;
  const H = 90;
  const padY = 8;
  const pts = points.map((p, i) => ({
    x: (i / (points.length - 1)) * W,
    y: p.acc === null ? null : padY + (1 - p.acc) * (H - padY * 2),
    p,
  }));
  const segs: string[] = [];
  let cur: string[] = [];
  for (const pt of pts) {
    if (pt.y === null) {
      if (cur.length) segs.push(cur.join(" "));
      cur = [];
    } else cur.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
  }
  if (cur.length) segs.push(cur.join(" "));
  const any = pts.some((p) => p.y !== null);
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      style={{ marginTop: 8 }}
      aria-label="Accuracy trend"
    >
      {[0.5, 1].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={padY + (1 - g) * (H - padY * 2)}
          y2={padY + (1 - g) * (H - padY * 2)}
          stroke="var(--stone)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}
      {segs.map((d, i) => (
        <polyline
          key={i}
          points={d}
          fill="none"
          stroke="var(--cobalt)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {pts.map(
        (pt) =>
          pt.y !== null && (
            <circle
              key={pt.p.day}
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill="var(--sun)"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
          ),
      )}
      {!any && (
        <text x={W / 2} y={H / 2} textAnchor="middle">
          No answers yet
        </text>
      )}
      <text x="0" y={H - 1}>
        30d ago
      </text>
      <text x={W} y={H - 1} textAnchor="end">
        today
      </text>
    </svg>
  );
}

function Upcoming({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const W = 300;
  const H = 80;
  const bw = W / data.length;
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      style={{ marginTop: 8 }}
      aria-label="Upcoming reviews"
    >
      {data.map((n, i) => {
        const h = (n / max) * (H - 24);
        return (
          <g key={i}>
            <rect
              x={i * bw + 2}
              y={H - 14 - h}
              width={bw - 4}
              height={h}
              fill={i === 0 ? "var(--sun)" : "var(--cobalt)"}
              stroke="var(--ink)"
              strokeWidth={n ? 1.5 : 0}
            />
            {n > 0 && (
              <text x={i * bw + bw / 2} y={H - 18 - h} textAnchor="middle">
                {n}
              </text>
            )}
            <text x={i * bw + bw / 2} y={H - 2} textAnchor="middle">
              {i === 0 ? "now" : i === 1 ? "+1" : i % 3 === 0 ? `+${i}` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
