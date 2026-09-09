import type React from "react";
import { ROOTS } from "../data/roots";
import { dayKey, level, levelCeil, levelFloor } from "../lib/srs";
import {
  accuracyTrend,
  heatmap,
  masteryDistribution,
  memorizedTrend,
  themeStrength,
  totals,
  upcomingReviews,
} from "../lib/stats";
import { SEALS } from "../lib/rewards";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { COURSE } from "../store/course";
import { memorizedCount, sectionColor } from "../lib/course";

const MASTERY_COLORS = [
  "var(--bad)",
  "var(--coral)",
  "var(--gold)",
  "var(--plum-light)",
  "var(--plum)",
  "var(--ink)",
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
  const mem = memorizedCount(ROOTS, p);
  const memTrend = memorizedTrend(p.history, 30);
  const acc = t.ok + t.bad ? Math.round((t.ok / (t.ok + t.bad)) * 100) : 0;
  const met = dist.slice(1).reduce((a, n) => a + n, 0);
  const sealCount = SEALS.filter((s) => p.seals[s.id]).length;

  return (
    <div className="progress">
      <h2>Progress</h2>
      <div className="stats">
        <div>
          <div className="n tnum">{p.streak}</div>
          <div className="l">day streak</div>
        </div>
        <div>
          <div className="n tnum">{p.xp}</div>
          <div className="l">total XP</div>
        </div>
        <div>
          <div className="n tnum">{acc}%</div>
          <div className="l">accuracy</div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h">
          <div className="eyebrow">Seals</div>
          <span className="k tnum">
            {sealCount} of {SEALS.length}
          </span>
        </div>
        <div className="seals">
          {SEALS.map((s) => {
            const on = !!p.seals[s.id];
            return (
              <div key={s.id} title={s.hint}>
                <span className={"seal" + (on ? "" : " off")} aria-label={on ? "earned" : "locked"}>
                  {s.letter}
                </span>
                <span className="n">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sec">
        <div className="eyebrow">Mastery across roots you've met</div>
        <div className="dist" aria-label="Mastery distribution">
          {dist.slice(1).map((n, i) => (
            <i
              key={i}
              style={{ width: (met ? n / met : 0) * 100 + "%", background: MASTERY_COLORS[i] }}
              title={`Level ${i + 1}: ${n}`}
            />
          ))}
        </div>
        <div className="legend">
          {dist.slice(1).map((n, i) => (
            <span key={i}>
              <i style={{ background: MASTERY_COLORS[i] }} />L{i + 1}{" "}
              <span className="tnum">{n}</span>
            </span>
          ))}
          <span>
            <i style={{ background: "var(--stone)" }} />
            not met <span className="tnum">{dist[0]}</span>
          </span>
        </div>
      </div>

      <div className="sec">
        <div className="sec-h">
          <div className="eyebrow">The journey</div>
          <span className="k tnum">
            {mem} / {ROOTS.length}
          </span>
        </div>
        <div className="journey">
          {COURSE.sections.map((sec) => {
            const rs = ROOTS.filter((r) => r.cat === sec.cat);
            const k = memorizedCount(rs, p);
            return (
              <div
                className="jrow"
                key={sec.id}
                style={{ "--c": sectionColor(sec.id) } as React.CSSProperties}
              >
                <span className="l">{sec.title}</span>
                <span className="track">
                  <i style={{ width: Math.round((k / rs.length) * 100) + "%" }} />
                </span>
                <span className="v tnum">
                  {k}/{rs.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="block" style={{ marginTop: 24 }}>
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

      <section className="block plum">
        <div className="row between">
          <div className="eyebrow">Memorized · last 30 days</div>
          <span className="small tnum" style={{ opacity: 0.85 }}>
            {mem} / {ROOTS.length}
          </span>
        </div>
        <MemChart points={memTrend} total={ROOTS.length} />
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
                setView("path");
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
    </div>
  );
}

function MemChart({
  points,
  total,
}: {
  points: { day: string; mem: number | null }[];
  total: number;
}) {
  const W = 300;
  const H = 90;
  const padY = 8;
  const vals = points.map((p) => p.mem).filter((m): m is number => m !== null);
  if (!vals.length)
    return (
      <p className="small" style={{ marginTop: 8, opacity: 0.85 }}>
        Tracking starts today — every day you play adds a point.
      </p>
    );
  const max = Math.max(1, ...vals);
  const top = Math.min(total, Math.ceil(max * 1.15));
  const pts = points
    .map((p, i) => ({
      x: (i / (points.length - 1)) * W,
      y: p.mem === null ? null : padY + (1 - p.mem / top) * (H - padY * 2),
    }))
    .filter((p): p is { x: number; y: number } => p.y !== null);
  const d = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = pts.length
    ? `${pts[0].x.toFixed(1)},${H - padY} ${d} ${pts[pts.length - 1].x.toFixed(1)},${H - padY}`
    : "";
  return (
    <svg
      className="chart onink"
      viewBox={`0 0 ${W} ${H}`}
      style={{ marginTop: 8 }}
      aria-label="Memorized roots over time"
    >
      <polygon points={area} fill="rgba(255,255,255,.14)" />
      <polyline
        points={d}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill="var(--gold)" />
      )}
      <text x="0" y={H - 1}>
        30d ago
      </text>
      <text x={W} y={H - 1} textAnchor="end">
        today · {vals[vals.length - 1]}
      </text>
      <text x={W} y={padY + 4} textAnchor="end">
        {top}
      </text>
    </svg>
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
          stroke="var(--plum)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {pts.map(
        (pt) =>
          pt.y !== null && <circle key={pt.p.day} cx={pt.x} cy={pt.y} r="3.5" fill="var(--gold)" />,
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
              rx="3"
              fill={i === 0 ? "var(--coral)" : "var(--plum)"}
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
