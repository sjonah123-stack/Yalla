import { useEffect, useRef, useState } from "react";
import { ROOTS } from "../data/roots";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { rootDisplay, stripNikud } from "../lib/hebrew";
import { isDue, lapsesOf, mastery, seen } from "../lib/srs";
import { initSpeech, speak, speechAvailable } from "../lib/speech";
import { Heb } from "../components/Heb";
import { IconSpeaker } from "../components/Icons";
import type { Progress, Root } from "../types";

type Pace = "slow" | "normal" | "fast";
const PACES: { id: Pace; label: string; ms: number }[] = [
  { id: "slow", label: "Slow", ms: 4000 },
  { id: "normal", label: "Normal", ms: 2500 },
  { id: "fast", label: "Fast", ms: 1500 },
];
const PACE_KEY = "yalla.listenPace";
const QUEUE_LEN = 20;
/** Listening time is saved in chunks of this many seconds (and whatever is left on the way out). */
const FLUSH_SEC = 15;
/** "Again" puts the root back this many cards later. */
const AGAIN_GAP = 3;

/** Seen roots, due first (most overdue first), then the weakest; about twenty. */
function listenQueue(p: Pick<Progress, "roots">, now: number): Root[] {
  const st = (r: Root) => p.roots[r.r];
  const met = ROOTS.filter((r) => seen(st(r)));
  const due = met.filter((r) => isDue(st(r), now)).sort((a, b) => st(a)!.due - st(b)!.due);
  const dueSet = new Set(due);
  const rest = met
    .filter((r) => !dueSet.has(r))
    .sort(
      (a, b) =>
        mastery(st(a)) - mastery(st(b)) ||
        lapsesOf(st(b)) - lapsesOf(st(a)) ||
        st(b)!.bad - st(a)!.bad ||
        (a.r < b.r ? -1 : 1),
    );
  return [...due, ...rest].slice(0, QUEUE_LEN);
}

function loadPace(): Pace {
  try {
    const v = localStorage.getItem(PACE_KEY);
    if (v === "slow" || v === "normal" || v === "fast") return v;
  } catch {
    /* storage blocked */
  }
  return "normal";
}

/** The word read aloud for a root: its first (most common) word. */
const wordOf = (r: Root) => r.words[0];
const say = (r: Root | undefined) => {
  if (r && speechAvailable()) speak(wordOf(r).h);
};
const hush = () => {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* no speech */
  }
};

const IconPlay = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 001.5.86l10.2-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
  </svg>
);
const IconPause = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="5" width="4.2" height="14" rx="1.4" />
    <rect x="13.8" y="5" width="4.2" height="14" rx="1.4" />
  </svg>
);

/**
 * Hands-free review: each root's word is shown and spoken, the meaning follows after a pause,
 * then the next card. Nothing here touches the schedule; it only logs listening time.
 */
export default function Listen() {
  const leave = useUi((s) => s.leaveTool);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const [queue, setQueue] = useState<Root[]>(() =>
    listenQueue(useProgress.getState().p, Date.now()),
  );
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [pace, setPaceState] = useState<Pace>(loadPace);
  const [voice, setVoice] = useState(speechAvailable);
  const [tally, setTally] = useState({ known: 0, again: 0 });
  const acc = useRef(0);
  const listened = useRef(0);
  const done = idx >= queue.length;
  const root = queue[idx];
  const ms = PACES.find((x) => x.id === pace)!.ms;
  const text = (h: string) => (nikud ? h : stripNikud(h));

  useEffect(() => {
    window.scrollTo(0, 0);
    initSpeech().then(setVoice);
  }, []);

  // The loop: word → (pace) → meaning → (pace) → next word. Only while playing.
  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => {
      if (!reveal) {
        setReveal(true);
        return;
      }
      setReveal(false);
      setIdx(idx + 1);
      say(queue[idx + 1]);
    }, ms);
    return () => clearTimeout(t);
  }, [playing, done, reveal, idx, queue, ms]);

  // Listening time, counted only while playing and visible; saved every FLUSH_SEC.
  useEffect(() => {
    if (!playing || done) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      acc.current += 1;
      listened.current += 1;
      if (acc.current >= FLUSH_SEC) {
        useProgress.getState().recordListen(acc.current);
        acc.current = 0;
      }
    }, 1000);
    return () => clearInterval(id);
  }, [playing, done]);

  // Leaving: save what's left and stop talking.
  useEffect(() => {
    const a = acc;
    return () => {
      if (a.current > 0) useProgress.getState().recordListen(a.current);
      a.current = 0;
      hush();
    };
  }, []);

  // A locked or hidden screen stops the speech on iPhone, so pause with it.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const play = () => {
    setStarted(true);
    setPlaying(true);
    // Speak from the tap itself: iOS only lets speech start inside a user gesture.
    if (!reveal) say(root);
  };
  const pause = () => {
    setPlaying(false);
    hush();
  };
  const toggle = () => (playing ? pause() : play());
  const known = () => {
    if (done) return;
    setTally((t) => ({ ...t, known: t.known + 1 }));
    setReveal(false);
    setIdx(idx + 1);
    if (playing) say(queue[idx + 1]);
  };
  const again = () => {
    if (done) return;
    const q = queue.slice();
    const [r] = q.splice(idx, 1);
    q.splice(Math.min(q.length, idx + AGAIN_GAP), 0, r);
    setTally((t) => ({ ...t, again: t.again + 1 }));
    setQueue(q);
    setReveal(false);
    if (playing) say(q[idx]);
  };
  const setPace = (v: Pace) => {
    setPaceState(v);
    try {
      localStorage.setItem(PACE_KEY, v);
    } catch {
      /* storage blocked */
    }
  };
  const restart = () => {
    setQueue(listenQueue(useProgress.getState().p, Date.now()));
    setIdx(0);
    setReveal(false);
    setTally({ known: 0, again: 0 });
    setPlaying(false);
    setStarted(false);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return leave();
      if ((e.target as HTMLElement | null)?.closest?.("button")) return;
      if (e.key === " ") {
        e.preventDefault();
        if (!done) toggle();
      } else if (e.key === "ArrowRight") known();
      else if (e.key === "ArrowLeft") again();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const rail = (
    <div className="rail">
      <button type="button" className="x" aria-label="Close" onClick={leave}>
        ×
      </button>
      <span className="ttl">Listen</span>
      {queue.length > 0 && (
        <span className="cnt tnum">
          {Math.min(idx + 1, queue.length)} / {queue.length}
        </span>
      )}
    </div>
  );

  if (!queue.length)
    return (
      <div className="tool page listen">
        {rail}
        <section className="block plum listen-empty">
          <Heb className="le-he">הַקְשָׁבָה</Heb>
          <div className="le-t">Nothing to listen to yet</div>
          <p>
            Hands-free review plays the roots you've met. Meet a few on the path first, then come
            back and let them play.
          </p>
        </section>
        <button type="button" className="btn block big" style={{ marginTop: 18 }} onClick={leave}>
          Back
        </button>
      </div>
    );

  const w = root ? wordOf(root) : null;
  const mins = Math.round(listened.current / 60);

  return (
    <div className={"tool page listen" + (playing ? " playing" : "")}>
      {rail}
      <div className="lbar" aria-hidden="true">
        <i style={{ width: (Math.min(idx, queue.length) / queue.length) * 100 + "%" }} />
      </div>

      {done ? (
        <div className="ldone">
          <section className="block gold">
            <div className="eyebrow">Round done</div>
            <div className="ld-n tnum">{queue.length} roots</div>
            <p className="small">
              {tally.known} known · {tally.again} again
              {mins > 0 ? ` · ${mins} min listening` : ""}
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <button type="button" className="btn primary" onClick={restart} autoFocus>
              Another round
            </button>
            <button type="button" className="btn" onClick={leave}>
              Done
            </button>
          </div>
        </div>
      ) : (
        root &&
        w && (
          <div className="lmain">
            <div className="lcard" key={`${idx}-${root.r}`}>
              <div className="glyph hero" lang="he">
                {rootDisplay(root)}
              </div>
              <div className="lc-word">
                <Heb className="word">{text(w.h)}</Heb>
                {voice && (
                  <button
                    type="button"
                    className="spk"
                    aria-label="Hear it again"
                    onClick={() => speak(w.h)}
                  >
                    <IconSpeaker />
                  </button>
                )}
              </div>
              <button
                type="button"
                className={"lc-meaning" + (reveal ? " on" : "")}
                onClick={() => setReveal(true)}
                disabled={reveal}
                aria-live="polite"
              >
                {reveal ? (
                  <>
                    <span className="lc-short">{root.short}</span>
                    <span className="lc-gloss">
                      <i>{w.t}</i> · {w.g}
                    </span>
                  </>
                ) : (
                  <span className="lc-wait">{playing ? "listen…" : "Tap to show the meaning"}</span>
                )}
              </button>
            </div>

            <div className="lctl">
              <button type="button" className="btn again" onClick={again}>
                Again
              </button>
              <button
                type="button"
                className={"lplay" + (playing ? " on" : "")}
                onClick={toggle}
                aria-label={playing ? "Pause" : started ? "Resume" : "Start listening"}
                autoFocus
              >
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button type="button" className="btn known" onClick={known}>
                Known
              </button>
            </div>
            {!started && <p className="lstart">Tap play to start. The cards run on their own.</p>}
          </div>
        )
      )}

      <div className="lfoot">
        <div className="lpace" role="group" aria-label="Pace">
          <span className="eyebrow">Pace</span>
          {PACES.map((x) => (
            <button
              key={x.id}
              type="button"
              className="chip toggle"
              aria-pressed={pace === x.id}
              onClick={() => setPace(x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>
        {voice ? (
          <p className="lhint">Keep the screen on: iPhone stops speech when locked.</p>
        ) : (
          <p className="lhint warn">
            No Hebrew voice on this device, so the cards run silently. Read along instead.
          </p>
        )}
      </div>
    </div>
  );
}
