import { useEffect, useLayoutEffect, useState } from "react";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import {
  MOVE,
  PROMO_GEMS,
  standings,
  tierFor,
  TIERS,
  weekKey,
  weekLeft,
  type Standing,
} from "../lib/league";
import { stripNikud } from "../lib/hebrew";
import { Heb } from "../components/Heb";
import { fmtLeft } from "./Home";

/** A tier's badge letter: the first letter of its Hebrew name. */
const tierLetter = (i: number): string => stripNikud(TIERS[i].he)[0];

/** "Sep 8" for a Monday day key. */
function weekLabel(wk: string): string {
  const [y, m, d] = wk.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Row({ s, rank }: { s: Standing; rank: number }) {
  return (
    <li
      className={"lg-row" + (s.me ? " me" : "") + (s.ghost ? " ghost" : "")}
      aria-current={s.me ? "true" : undefined}
    >
      <span className="rk tnum">{rank}</span>
      <span className="nm">
        {s.me ? "You" : s.name}
        {s.ghost && <span className="tag">ghost</span>}
      </span>
      <span className="xp tnum">{s.xp} XP</span>
    </li>
  );
}

/** The weekly league: the tier ladder, this week's table with its zones, and past weeks. */
export default function League() {
  const p = useProgress((s) => s.p);
  const leave = useUi((s) => s.leaveTool);
  const [now, setNow] = useState(() => Date.now());

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => {
      clearInterval(t);
      document.removeEventListener("keydown", k);
    };
  }, [leave]);

  const wk = weekKey(new Date(now));
  const tier = tierFor(p, wk);
  const table = standings(p, wk, now);
  const size = table.length;
  const top = tier < TIERS.length - 1 ? MOVE : 0;
  const bottom = tier > 0 ? MOVE : 0;
  const up = table.slice(0, top);
  const mid = table.slice(top, size - bottom);
  const down = table.slice(size - bottom);
  const rank = table.findIndex((s) => s.me) + 1;
  const past = Object.entries(p.league).sort(([a], [b]) => (a < b ? 1 : -1));

  return (
    <div className="tool lg">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">League</span>
        <span className="cnt tnum">{fmtLeft(weekLeft(now))} left</span>
      </div>

      <header className="lg-head">
        <span className={"lg-badge big t" + tier} aria-hidden="true">
          {tierLetter(tier)}
        </span>
        <div>
          <div className="eyebrow">
            This week · #{rank} of {size}
          </div>
          <h2>{TIERS[tier].name} league</h2>
          <Heb className="he">{TIERS[tier].he}</Heb>
        </div>
      </header>

      <ol className="lg-ladder" aria-label="League tiers">
        {TIERS.map((t, i) => (
          <li
            key={t.name}
            className={i === tier ? "cur" : i < tier ? "past" : ""}
            aria-current={i === tier ? "step" : undefined}
          >
            <span className={"lg-badge t" + i} aria-hidden="true">
              {tierLetter(i)}
            </span>
            <span className="n">{t.name}</span>
          </li>
        ))}
      </ol>

      <p className="lg-note">
        Rivals are paced to your own recent weeks. Top {MOVE} move up, bottom {MOVE} move down.
        Promotion pays gems.
      </p>

      <div className="lg-table">
        {up.length > 0 && (
          <section className="lg-zone up" aria-label="Promotion zone">
            <div className="lbl">
              <span>↑ Promotion zone</span>
              <span className="tnum">
                {TIERS[tier + 1].name} · +{PROMO_GEMS * (tier + 1)} ✦
              </span>
            </div>
            <ol>
              {up.map((s, i) => (
                <Row key={s.name} s={s} rank={i + 1} />
              ))}
            </ol>
          </section>
        )}
        <section className="lg-zone mid" aria-label="Safe">
          <ol start={top + 1}>
            {mid.map((s, i) => (
              <Row key={s.name} s={s} rank={top + i + 1} />
            ))}
          </ol>
        </section>
        {down.length > 0 && (
          <section className="lg-zone down" aria-label="Demotion zone">
            <div className="lbl">
              <span>↓ Demotion zone</span>
              <span>{TIERS[tier - 1].name}</span>
            </div>
            <ol start={size - bottom + 1}>
              {down.map((s, i) => (
                <Row key={s.name} s={s} rank={size - bottom + i + 1} />
              ))}
            </ol>
          </section>
        )}
      </div>

      <section className="lg-past">
        <div className="eyebrow">Past weeks</div>
        {past.length === 0 ? (
          <p className="small muted" style={{ marginTop: 8 }}>
            Your first week. Finished weeks show up here every Monday.
          </p>
        ) : (
          <ul>
            {past.map(([w, r]) => {
              const move = r.next > r.tier ? "up" : r.next < r.tier ? "down" : "stay";
              return (
                <li key={w} className={"lg-week " + move}>
                  <span className="wk">{weekLabel(w)}</span>
                  <span className={"lg-badge sm t" + r.tier} aria-hidden="true">
                    {tierLetter(r.tier)}
                  </span>
                  <span className="tn">
                    {TIERS[r.tier].name}
                    <span className="xp tnum">{r.xp} XP</span>
                  </span>
                  <span className="rk tnum">#{r.rank}</span>
                  <span
                    className="mv"
                    aria-label={
                      move === "up"
                        ? `Promoted to ${TIERS[r.next].name}`
                        : move === "down"
                          ? `Dropped to ${TIERS[r.next].name}`
                          : "Stayed"
                    }
                  >
                    {move === "up" ? "↑" : move === "down" ? "↓" : "="}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
