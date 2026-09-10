import { useEffect, useMemo, useRef, useState } from "react";
import type { UnitId } from "../types";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { unitTitle } from "../lib/course";
import { formatMs, matchRoots, matchTiles, type MatchTile } from "../lib/match";
import { rootDisplay } from "../lib/hebrew";
import { buzz, playCue } from "../lib/sound";
import { useCountUp } from "../components/useCountUp";
import { Heb } from "../components/Heb";

const KEYS = "1234567890qwerty";
const PENALTY = 500;

const sounds = () => useProgress.getState().p.settings.sounds;

export default function Match({ unitId }: { unitId: UnitId }) {
  const u = COURSE.byId[unitId];
  const showToast = useUi((s) => s.showToast);
  const best = useProgress((s) => s.p.units[unitId]?.matchBestMs);
  const { recordMatch } = useProgress.getState();

  const [seed, setSeed] = useState(0);
  const tiles = useMemo<MatchTile[]>(
    () => (u ? matchTiles(matchRoots(COURSE, unitId, useProgress.getState().p)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitId, seed],
  );
  const [sel, setSel] = useState<number | null>(null);
  const [cleared, setCleared] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<Set<number>>(() => new Set());
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [penalty, setPenalty] = useState(0);
  const [now, setNow] = useState(0);
  const [final, setFinal] = useState<number | null>(null);
  const [record, setRecord] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    if (startedAt === null || final !== null) return;
    const id = setInterval(() => setNow(performance.now()), 50);
    return () => clearInterval(id);
  }, [startedAt, final]);

  const elapsed = final ?? (startedAt === null ? 0 : now - startedAt + penalty);

  const reset = () => {
    setSeed((s) => s + 1);
    setSel(null);
    setCleared(new Set());
    setWrong(new Set());
    setStartedAt(null);
    setPenalty(0);
    setNow(0);
    setFinal(null);
    setRecord(false);
  };

  const tap = (t: MatchTile) => {
    if (final !== null || cleared.has(t.id) || lock.current) return;
    if (startedAt === null) {
      const t0 = performance.now();
      setStartedAt(t0);
      setNow(t0);
    }
    if (sel === null) return setSel(t.id);
    if (sel === t.id) return setSel(null);
    const a = tiles.find((x) => x.id === sel)!;
    if (a.root === t.root && a.kind !== t.kind) {
      const next = new Set(cleared);
      next.add(a.id);
      next.add(t.id);
      setCleared(next);
      setSel(null);
      if (sounds()) playCue(next.size === tiles.length ? "done" : "tick");
      if (next.size === tiles.length) {
        const ms = Math.round(performance.now() - (startedAt ?? performance.now()) + penalty);
        setFinal(ms);
        const rec = recordMatch(unitId, ms);
        setRecord(rec);
        if (rec) showToast("New record! +15 XP");
      }
    } else {
      lock.current = true;
      if (sounds()) {
        playCue("bad");
        buzz([20, 30, 20]);
      }
      setWrong(new Set([a.id, t.id]));
      setPenalty((p) => p + PENALTY);
      setSel(null);
      setTimeout(() => {
        setWrong(new Set());
        lock.current = false;
      }, 420);
    }
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return leave();
      const i = KEYS.indexOf(e.key.toLowerCase());
      if (i >= 0 && tiles[i]) tap(tiles[i]);
      if (final !== null && (e.key === "Enter" || e.key === " ")) reset();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const shownMs = useCountUp(final ?? 0, 700);
  if (!u) return null;
  const leave = () => useUi.getState().leaveTool();

  return (
    <div className="tool">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Match · {unitTitle(u)}</span>
        <span className="cnt tnum">
          {best !== undefined ? `best ${formatMs(best)}` : "no record yet"}
        </span>
      </div>

      {final !== null ? (
        <div className="mdone">
          <section className={"block " + (record ? "gold" : "plum")}>
            <div className="eyebrow">{record ? "New record" : "Cleared"}</div>
            <div className="mtime" style={{ textAlign: "left", margin: "6px 0 0" }}>
              {formatMs(shownMs)}
            </div>
            <p className="small" style={{ marginTop: 8, opacity: 0.85 }}>
              {penalty
                ? `${penalty / PENALTY} wrong pair${penalty > PENALTY ? "s" : ""} · +${formatMs(penalty)} penalty`
                : "No wrong pairs."}
              {best !== undefined && !record ? ` · best ${formatMs(best)}` : ""}
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn primary" onClick={reset} autoFocus>
              Play again
            </button>
            <button type="button" className="btn" onClick={leave}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mtime tnum" aria-live="off">
            {formatMs(elapsed)}
            <small>{startedAt === null ? "tap a tile to start" : "match roots to meanings"}</small>
          </div>
          <div className="mgrid">
            {tiles.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={
                  "mtile" +
                  (sel === t.id ? " sel" : "") +
                  (wrong.has(t.id) ? " wrong" : "") +
                  (cleared.has(t.id) ? " done" : "")
                }
                onClick={() => tap(t)}
                disabled={cleared.has(t.id)}
                data-r={t.root.r}
                data-kind={t.kind}
              >
                <span className="k" aria-hidden="true">
                  {KEYS[i]}
                </span>
                {t.kind === "root" ? (
                  <Heb className="glyph">{rootDisplay(t.root)}</Heb>
                ) : (
                  <span>{t.root.short}</span>
                )}
              </button>
            ))}
          </div>
          <p className="micro muted" style={{ textAlign: "center", marginTop: 12 }}>
            Wrong pair: +0.5s.
          </p>
          <p className="micro muted mhint" style={{ textAlign: "center", marginTop: 4 }}>
            Keys 1–0 and q–y pick tiles.
          </p>
        </>
      )}
    </div>
  );
}
