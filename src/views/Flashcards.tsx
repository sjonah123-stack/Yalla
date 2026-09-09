import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { Root, UnitId } from "../types";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { unitTitle } from "../lib/course";
import { rootDisplay } from "../lib/hebrew";
import { seen } from "../lib/srs";
import { shuffle } from "../lib/quiz";
import { WordList } from "../components/WordList";
import { SpeakButton } from "../components/SpeakButton";

const SWIPE = 80;

export default function Flashcards({ unitId }: { unitId: UnitId }) {
  const u = COURSE.byId[unitId];
  const setView = useUi((s) => s.setView);
  const openUnit = useUi((s) => s.openUnit);
  const openTool = useUi((s) => s.openTool);
  const start = useSession((s) => s.start);
  const { recordAnswer } = useProgress.getState();

  const [deck, setDeck] = useState<Root[]>(() => shuffle(u?.roots ?? []));
  const [i, setI] = useState(0);
  const [round, setRound] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Root[]>([]);
  const [again, setAgain] = useState<Root[]>([]);
  const [out, setOut] = useState<"l" | "r" | null>(null);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);
  const busy = useRef(false);

  const card = deck[i];
  const done = !card;

  const swipe = (dir: "l" | "r") => {
    if (!card || busy.current) return;
    busy.current = true;
    setOut(dir);
    setTimeout(() => {
      if (dir === "r") {
        setKnown((k) => [...k, card]);
        const st = useProgress.getState().p.roots[card.r];
        // A "know" on a root never quizzed is soft evidence: back tomorrow, unit shows started.
        if (!seen(st)) recordAnswer(card.r, true, false, 0);
      } else setAgain((a) => [...a, card]);
      setOut(null);
      setFlipped(false);
      setDrag(0);
      if (i + 1 >= deck.length) {
        const rest = dir === "l" ? [...again, card] : again;
        if (rest.length) {
          setDeck(shuffle(rest));
          setAgain([]);
          setRound((r) => r + 1);
          setI(0);
        } else setI(i + 1);
      } else setI(i + 1);
      busy.current = false;
    }, 230);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return leave();
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") swipe("r");
      else if (e.key === "ArrowLeft") swipe("l");
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  if (!u) return null;
  const leave = () => {
    setView("path");
    openUnit(u.id);
  };

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const onUp = () => {
    if (startX.current === null) return;
    const d = drag;
    startX.current = null;
    if (Math.abs(d) > SWIPE) swipe(d > 0 ? "r" : "l");
    else {
      if (Math.abs(d) < 6) setFlipped((f) => !f);
      setDrag(0);
    }
  };

  const total = u.roots.length;
  return (
    <div className="tool">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Flashcards · {unitTitle(u)}</span>
        <span className="cnt tnum">
          {done ? total : Math.min(i + 1, deck.length)}/{deck.length}
          {round > 1 ? ` · round ${round}` : ""}
        </span>
      </div>

      {done ? (
        <div className="fcdone">
          <section className="block gold">
            <div className="eyebrow">All {total} known</div>
            <h2 style={{ fontSize: 28, marginTop: 6 }}>
              {round > 1 ? `Cleared in ${round} rounds.` : "First pass, no misses."}
            </h2>
            <p style={{ marginTop: 8 }}>
              Flashcards get them familiar. A lesson makes them stick — come back tomorrow for the
              second pass.
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                if (start({ kind: "lesson", unit: u.id })) setView("play");
              }}
            >
              Lesson
            </button>
            <button type="button" className="btn" onClick={() => openTool("match", u.id)}>
              Match
            </button>
            <button type="button" className="btn" onClick={leave}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="fcwrap"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <div
              key={`${round}-${i}`}
              className={"fc" + (flipped ? " flipped" : "") + (out ? ` out-${out}` : "")}
              style={
                drag && !out
                  ? {
                      transform: `translateX(${drag}px) rotate(${drag / 18}deg)${flipped ? " rotateY(180deg)" : ""}`,
                      transition: "none",
                    }
                  : undefined
              }
              role="button"
              aria-label={flipped ? "Card back" : "Card front, tap to flip"}
            >
              <div className="face front">
                <span className="glyph">{rootDisplay(card)}</span>
                <span className="hint">Tap to flip · swipe → know · ← again</span>
              </div>
              <div className="face back">
                <div className="row between">
                  <span className="glyph">{rootDisplay(card)}</span>
                  <SpeakButton text={card.words[0].h} />
                </div>
                <div className="m">{card.m}</div>
                <div className="small" style={{ opacity: 0.8 }}>
                  {card.cat} · {card.words.length} words
                </div>
                <div style={{ marginTop: 8 }}>
                  <WordList words={card.words.slice(0, 4)} compact showForm={false} />
                </div>
              </div>
            </div>
          </div>
          <div className="fcpiles">
            <button type="button" className="again" onClick={() => swipe("l")}>
              <span>Still learning</span>
              <span className="n tnum">{again.length}</span>
            </button>
            <button type="button" className="know" onClick={() => swipe("r")}>
              <span>Know it</span>
              <span className="n tnum">{known.length}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
