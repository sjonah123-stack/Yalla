import { useEffect, useMemo, useRef, useState } from "react";
import type { Root, UnitId } from "../types";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { unitTitle } from "../lib/course";
import { formatMs } from "../lib/match";
import { familySortRoots, familySortTiles, type SortTile } from "../lib/familysort";
import { rootDisplay, stripNikud } from "../lib/hebrew";
import { buzz, playCue } from "../lib/sound";
import { useCountUp } from "../components/useCountUp";
import { Heb } from "../components/Heb";

const KEYS = "12345678";
const PENALTY = 500;

const sounds = () => useProgress.getState().p.settings.sounds;

export default function FamilySort({ unitId }: { unitId: UnitId }) {
  const u = COURSE.byId[unitId];
  const showToast = useUi((s) => s.showToast);
  const best = useProgress((s) => s.p.units[unitId]?.sortBestMs);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const { recordFamilySort } = useProgress.getState();

  const [seed, setSeed] = useState(0);
  const pair = useMemo<[Root, Root] | null>(
    () => (u ? familySortRoots(COURSE, unitId, useProgress.getState().p) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitId, seed],
  );
  const tiles = useMemo<SortTile[]>(() => (pair ? familySortTiles(pair[0], pair[1]) : []), [pair]);

  const [selTile, setSelTile] = useState<number | null>(null);
  const [selBucket, setSelBucket] = useState<number | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [wrongBucket, setWrongBucket] = useState<number | null>(null);
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
  const wordText = (h: string) => (nikud ? h : stripNikud(h));
  const leave = () => useUi.getState().leaveTool();

  const reset = () => {
    setSeed((s) => s + 1);
    setSelTile(null);
    setSelBucket(null);
    setPlaced([]);
    setWrongTile(null);
    setWrongBucket(null);
    setStartedAt(null);
    setPenalty(0);
    setNow(0);
    setFinal(null);
    setRecord(false);
  };

  const start = () => {
    if (startedAt !== null) return;
    const t0 = performance.now();
    setStartedAt(t0);
    setNow(t0);
  };

  /** Drop `tile` into bucket `bi`: place it, or flash both and take the penalty. */
  const resolve = (tile: SortTile, bi: number) => {
    if (!pair) return;
    if (tile.root.r === pair[bi].r) {
      const next = [...placed, tile.id];
      setPlaced(next);
      setSelTile(null);
      if (sounds()) playCue(next.length === tiles.length ? "done" : "tick");
      if (next.length === tiles.length) {
        const ms = Math.round(performance.now() - (startedAt ?? performance.now()) + penalty);
        setFinal(ms);
        const rec = recordFamilySort(unitId, ms);
        setRecord(rec);
        if (rec) showToast("New record! +15 XP");
      }
    } else {
      lock.current = true;
      if (sounds()) {
        playCue("bad");
        buzz([20, 30, 20]);
      }
      setWrongTile(tile.id);
      setWrongBucket(bi);
      setPenalty((p) => p + PENALTY);
      setSelTile(null);
      setTimeout(() => {
        setWrongTile(null);
        setWrongBucket(null);
        lock.current = false;
      }, 420);
    }
  };

  const tapTile = (t: SortTile) => {
    if (final !== null || placed.includes(t.id) || lock.current) return;
    start();
    if (selBucket !== null) return resolve(t, selBucket);
    setSelTile((s) => (s === t.id ? null : t.id));
  };

  const tapBucket = (bi: number) => {
    if (final !== null || lock.current) return;
    start();
    if (selTile !== null) {
      const t = tiles.find((x) => x.id === selTile);
      if (t) return resolve(t, bi);
    }
    setSelBucket((s) => (s === bi ? null : bi));
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return leave();
      if (final !== null) {
        if (e.key === "Enter" || e.key === " ") reset();
        return;
      }
      const key = e.key.toLowerCase();
      const i = KEYS.indexOf(key);
      if (i >= 0 && tiles[i]) return tapTile(tiles[i]);
      if (key === "a" || e.key === "ArrowLeft") return tapBucket(0);
      if (key === "b" || e.key === "ArrowRight") return tapBucket(1);
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const shownMs = useCountUp(final ?? 0, 700);
  if (!u) return null;

  const title = "Family sort · " + unitTitle(u);

  if (!pair)
    return (
      <div className="tool">
        <div className="rail">
          <button type="button" className="x" aria-label="Close" onClick={leave}>
            ×
          </button>
          <span className="ttl">{title}</span>
          <span className="cnt tnum" />
        </div>
        <section className="block plum">
          <div className="eyebrow">Not yet</div>
          <p className="small" style={{ marginTop: 8 }}>
            Family sort needs two roots with at least three words each. Learn a little more of this
            unit and come back.
          </p>
        </section>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={leave}>
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="tool">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">{title}</span>
        <span className="cnt tnum">
          {best !== undefined ? `best ${formatMs(best)}` : "no record yet"}
        </span>
      </div>

      {final !== null ? (
        <div className="mdone">
          <section className={"block " + (record ? "gold" : "plum")}>
            <div className="eyebrow">{record ? "New record" : "Sorted"}</div>
            <div className="mtime" style={{ textAlign: "left", margin: "6px 0 0" }}>
              {formatMs(shownMs)}
            </div>
            <p className="small" style={{ marginTop: 8, opacity: 0.85 }}>
              {penalty
                ? `${penalty / PENALTY} wrong drop${penalty > PENALTY ? "s" : ""} · +${formatMs(penalty)} penalty`
                : "No wrong drops."}
              {best !== undefined && !record ? ` · best ${formatMs(best)}` : ""}
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn primary" onClick={reset} autoFocus>
              Again
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
            <small>
              {startedAt === null ? "tap a word to start" : "sort each word into its family"}
            </small>
          </div>

          <div className="buckets">
            {pair.map((root, bi) => (
              <button
                key={root.r}
                type="button"
                className={
                  "bucket" + (selBucket === bi ? " sel" : "") + (wrongBucket === bi ? " wrong" : "")
                }
                onClick={() => tapBucket(bi)}
                data-r={root.r}
              >
                <Heb className="glyph">{rootDisplay(root)}</Heb>
                <span className="s">{root.short}</span>
                <div className="placed">
                  {placed
                    .map((id) => tiles.find((t) => t.id === id))
                    .filter((t): t is SortTile => !!t && t.root.r === root.r)
                    .map((t) => (
                      <span key={t.id} lang="he">
                        {wordText(t.word.h)}
                      </span>
                    ))}
                </div>
              </button>
            ))}
          </div>

          <div className="mgrid">
            {tiles.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={
                  "mtile word" +
                  (selTile === t.id ? " sel" : "") +
                  (wrongTile === t.id ? " wrong" : "") +
                  (placed.includes(t.id) ? " done" : "")
                }
                onClick={() => tapTile(t)}
                disabled={placed.includes(t.id)}
                data-r={t.root.r}
                data-id={t.id}
              >
                <span className="k" aria-hidden="true">
                  {KEYS[i]}
                </span>
                <Heb>{wordText(t.word.h)}</Heb>
                <span className="sub">{t.word.g}</span>
              </button>
            ))}
          </div>

          <p className="micro muted" style={{ textAlign: "center", marginTop: 12 }}>
            Wrong family: +0.5s.
          </p>
          <p className="micro muted sort-hint" style={{ textAlign: "center", marginTop: 4 }}>
            1–8 pick a word · A/B pick a family
          </p>
        </>
      )}
    </div>
  );
}
