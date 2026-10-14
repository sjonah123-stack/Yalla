import { Fragment, useEffect, useState } from "react";
import type { Root, Sentence } from "../types";
import { ROOTS } from "../data/roots";
import { PHRASES, TOPIC_BY_ID } from "../data/phrases";
import { SENTENCES } from "../data/sentences";
import { useProgress } from "../store/progress";
import { useUi, type CardDeck } from "../store/ui";
import { bankRoots } from "../lib/bank";
import { phraseDeck, wordDeck } from "../lib/cards";
import { rootLetters, stripNikud } from "../lib/hebrew";
import { shuffle } from "../lib/quiz";
import { isKnownWord } from "../lib/words";
import { initSpeech } from "../lib/speech";
import { Heb } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";
import { SwipeDeck } from "../components/SwipeDeck";

/** One card, word or phrase. `h` is the word-memory key. */
interface Card {
  h: string;
  t: string;
  g: string;
  /** The word's form (binyan / part of speech) or the phrase's topic. */
  sub: string;
  note?: string;
  fem?: { h: string; to?: boolean };
  ex?: Sentence;
  roots: Root[];
}

const BY_ID = new Map(ROOTS.map((r) => [r.r, r]));
const FACE_KEY = "yalla.cardsFace";

function loadEnglishFirst(): boolean {
  try {
    return localStorage.getItem(FACE_KEY) === "en";
  } catch {
    return false;
  }
}
function saveEnglishFirst(en: boolean) {
  try {
    localStorage.setItem(FACE_KEY, en ? "en" : "he");
  } catch {
    /* storage blocked */
  }
}

/** Build a deck from the current progress (and, for the bank, the Roots tab's search + chip). */
function buildDeck(deck: CardDeck): Card[] {
  const p = useProgress.getState().p;
  if (deck.kind === "bank") {
    const { bankFilter, bankChip } = useUi.getState();
    const roots = bankRoots(ROOTS, bankFilter, bankChip, p, Date.now());
    const deck = wordDeck(roots, p);
    // Shuffled, but new words still come before the ones already known.
    const isNew = (h: string) => !isKnownWord(p.words[h]);
    const order = [
      ...shuffle(deck.filter((c) => isNew(c.word.h))),
      ...shuffle(deck.filter((c) => !isNew(c.word.h))),
    ];
    return order.map(({ word, root }) => ({
      h: word.h,
      t: word.t,
      g: word.g,
      sub: word.b,
      ex: SENTENCES[word.h],
      roots: [root],
    }));
  }
  return phraseDeck(PHRASES, p, deck.topic).map((x) => ({
    h: x.h,
    t: x.t,
    g: x.g,
    sub: TOPIC_BY_ID[x.topic].title,
    note: x.note,
    fem: x.fem,
    roots: [...new Set(x.tags.map((t) => t.r))].flatMap((r) => BY_ID.get(r) ?? []),
  }));
}

/**
 * Word and phrase flashcards. Know / Again count as a right / wrong answer for that word in
 * word memory (the ✓ in the Roots list); nothing here touches a root's review schedule.
 */
export default function Cards({ deck }: { deck: CardDeck }) {
  const leave = useUi((s) => s.leaveTool);
  const openPage = useUi((s) => s.openPage);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const recordWord = useProgress((s) => s.recordWord);
  const cardsBack = useUi((s) => s.cardsBack);
  const [run, setRun] = useState(0);
  const [cards, setCards] = useState(() => buildDeck(deck));
  const [english, setEnglish] = useState(loadEnglishFirst);
  const text = (h: string) => (nikud ? h : stripNikud(h));
  const phrases = deck.kind === "phrases";
  const title = phrases
    ? deck.topic
      ? TOPIC_BY_ID[deck.topic].title
      : "Everyday phrases"
    : "Word cards";

  useEffect(() => {
    window.scrollTo(0, 0);
    void initSpeech();
  }, []);

  const again = () => {
    setCards(buildDeck(deck));
    setRun((r) => r + 1);
  };
  const flipFace = () => {
    setEnglish((e) => {
      saveEnglishFirst(!e);
      return !e;
    });
  };

  if (!cards.length)
    return (
      <div className="tool">
        <div className="rail">
          <button type="button" className="x" aria-label="Close" onClick={leave}>
            ×
          </button>
          <span className="ttl">{title}</span>
        </div>
        <div className="fcdone">
          <section className="block">
            <div className="eyebrow">No cards</div>
            <p style={{ marginTop: 8 }}>
              Nothing is listed right now. Change the search or the filter in the Roots tab and
              try again.
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn primary" onClick={leave}>
              Back
            </button>
          </div>
        </div>
      </div>
    );

  const hebrewSide = (c: Card) => (
    <div className="cd-he">
      <Heb className="cd-say">{text(c.h)}</Heb>
      <SpeakButton text={c.h} />
    </div>
  );
  const englishSide = (c: Card) => <div className="cd-en">{c.g}</div>;

  return (
    <div className="tool cards">
      <SwipeDeck
        key={run}
        items={cards}
        keyOf={(c) => c.h}
        title={title}
        onClose={leave}
        shuffled={false}
        railExtra={
          <button
            type="button"
            className="cd-face"
            onClick={flipFace}
            aria-label={english ? "Show Hebrew first" : "Show English first"}
          >
            {english ? "EN → עב" : "עב → EN"}
          </button>
        }
        hint={english ? "Say it in Hebrew, then flip" : "Tap to flip · → know · ← again"}
        onSwipe={(c, dir) => recordWord(c.h, dir === "know")}
        front={(c) => (english ? englishSide(c) : hebrewSide(c))}
        back={(c) => (
          <div className="cd-back">
            {english ? hebrewSide(c) : <div className="cd-g">{c.g}</div>}
            {english && <div className="cd-g">{c.g}</div>}
            <div className="cd-t">
              {c.t} <span className="cd-sub">· {c.sub}</span>
            </div>
            {c.fem && (
              <div className="cd-fem">
                <span>{c.fem.to ? "To a woman:" : "A woman says:"}</span>{" "}
                <Heb>{text(c.fem.h)}</Heb>
              </div>
            )}
            {c.note && <div className="cd-note">{c.note}</div>}
            {c.ex && (
              <div className="cd-ex">
                <Heb>
                  {c.ex.he.split(c.h).map((part, i) => (
                    <Fragment key={i}>
                      {i > 0 && <b>{text(c.h)}</b>}
                      {text(part)}
                    </Fragment>
                  ))}
                </Heb>
                <span className="en">{c.ex.en}</span>
              </div>
            )}
            {c.roots.length > 0 && (
              <div className="cd-roots">
                {c.roots.map((r) => (
                  <span key={r.r} className="cd-root">
                    <span className="cd-gl" lang="he">
                      {rootLetters(r)}
                    </span>
                    {r.short}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        done={({ total, rounds }) => (
          <div className="fcdone">
            <section className="block gold">
              <div className="eyebrow">All {total} known</div>
              <h2 style={{ fontSize: 28, marginTop: 6 }}>
                {rounds > 1 ? `Cleared in ${rounds} rounds.` : "First pass, no misses."}
              </h2>
              <p style={{ marginTop: 8 }}>
                Each Know counts toward word memory. Two Knows, more rights than misses, and the
                word gets its check.
              </p>
            </section>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button type="button" className="btn primary" onClick={again}>
                Another round
              </button>
              {phrases && !cardsBack && (
                <button type="button" className="btn" onClick={() => openPage("phrases")}>
                  All phrases
                </button>
              )}
              <button type="button" className="btn" onClick={leave}>
                Back
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
