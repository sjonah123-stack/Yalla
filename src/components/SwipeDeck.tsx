import { useEffect, useRef, useState } from "react";
import type React from "react";
import { shuffle } from "../lib/quiz";

const SWIPE = 80;

export type SwipeDir = "know" | "again";

/**
 * The flashcard mechanics shared by the unit flashcards and the word / phrase decks: tap or
 * Space to flip, swipe right (→) for know, left (←) for again. The again pile loops as new
 * rounds until every card is known, then `done` renders. Owns the tool rail.
 */
export function SwipeDeck<T>({
  items,
  keyOf,
  title,
  railExtra,
  onClose,
  front,
  back,
  hint = "Tap to flip · swipe → know · ← again",
  onSwipe,
  done,
  shuffled = true,
}: {
  items: readonly T[];
  keyOf: (t: T) => string;
  title: string;
  /** Extra controls in the rail, after the counter. */
  railExtra?: React.ReactNode;
  onClose: () => void;
  front: (t: T) => React.ReactNode;
  back: (t: T) => React.ReactNode;
  hint?: string;
  onSwipe?: (t: T, dir: SwipeDir) => void;
  done: (s: { total: number; rounds: number }) => React.ReactNode;
  /** Shuffle the first round (later rounds always shuffle). */
  shuffled?: boolean;
}) {
  const [deck, setDeck] = useState<T[]>(() => (shuffled ? shuffle(items) : items.slice()));
  const [i, setI] = useState(0);
  const [round, setRound] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState<T[]>([]);
  const [out, setOut] = useState<"l" | "r" | null>(null);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);
  const busy = useRef(false);

  const card = deck[i];
  const finished = !card;

  const swipe = (dir: "l" | "r") => {
    if (!card || busy.current) return;
    busy.current = true;
    setOut(dir);
    setTimeout(() => {
      if (dir === "r") setKnown((k) => k + 1);
      else setAgain((a) => [...a, card]);
      onSwipe?.(card, dir === "r" ? "know" : "again");
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
      if (e.key === "Escape") return onClose();
      if (finished) return;
      const on = (e.target as Element | null)?.closest?.("button, input");
      // Space / Enter on a focused button presses that button; arrows still swipe.
      if (on && (e.key === " " || e.key === "Enter" || on.tagName === "INPUT")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") swipe("r");
      else if (e.key === "ArrowLeft") swipe("l");
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const onDown = (e: React.PointerEvent) => {
    // A tap on a control inside the card (the speaker) is not a flip or a swipe.
    if ((e.target as Element).closest("button")) return;
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

  return (
    <>
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="ttl">{title}</span>
        <span className="cnt tnum">
          {finished ? items.length : Math.min(i + 1, deck.length)}/
          {finished ? items.length : deck.length}
          {round > 1 ? ` · round ${round}` : ""}
        </span>
        {railExtra}
      </div>

      {finished ? (
        done({ total: items.length, rounds: round })
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
              key={`${round}-${i}-${keyOf(card)}`}
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
              tabIndex={0}
              aria-label={flipped ? "Card back" : "Card front, tap to flip"}
            >
              <div className="face front" aria-hidden={flipped}>
                {front(card)}
                <span className="hint">{hint}</span>
              </div>
              <div className="face back" aria-hidden={!flipped}>
                {back(card)}
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
              <span className="n tnum">{known}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
