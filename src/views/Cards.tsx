import { Fragment, useEffect, useState } from "react";
import type { Root, Sentence } from "../types";
import { ROOT_BY_ID } from "../data/roots";
import { SENTENCES } from "../data/sentences";
import { useProgress } from "../store/progress";
import { useUi, type CardDeck } from "../store/ui";
import { wordDeck } from "../lib/cards";
import { rootLetters, stripNikud } from "../lib/hebrew";
import { shuffle } from "../lib/quiz";
import { isKnownWord } from "../lib/words";
import { initSpeech } from "../lib/speech";
import { Heb } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";
import { SwipeDeck } from "../components/SwipeDeck";

/** One word card. `h` is the word-memory key. */
interface Card {
  h: string;
  t: string;
  g: string;
  /** Binyan or part of speech. */
  sub: string;
  ex?: Sentence;
}

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

/** Every word of the root, shuffled, the ones not known yet first. */
function buildDeck(root: Root): Card[] {
  const p = useProgress.getState().p;
  const cards = wordDeck([root], p, root.words.length);
  const isNew = (h: string) => !isKnownWord(p.words[h]);
  return [
    ...shuffle(cards.filter((c) => isNew(c.word.h))),
    ...shuffle(cards.filter((c) => !isNew(c.word.h))),
  ].map(({ word }) => ({ h: word.h, t: word.t, g: word.g, sub: word.b, ex: SENTENCES[word.h] }));
}

/**
 * A root's words as flashcards (Roots tab → a root → Flashcards). Know / Again count as a right /
 * wrong answer for that word in word memory (the ✓ in the Roots list); nothing here touches the
 * root's review schedule.
 */
export default function Cards({ deck }: { deck: Extract<CardDeck, { kind: "root" }> }) {
  const root = ROOT_BY_ID[deck.root];
  const leave = useUi((s) => s.leaveTool);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const recordWord = useProgress((s) => s.recordWord);
  const [run, setRun] = useState(0);
  const [cards, setCards] = useState(() => (root ? buildDeck(root) : []));
  const [english, setEnglish] = useState(loadEnglishFirst);
  const text = (h: string) => (nikud ? h : stripNikud(h));

  useEffect(() => {
    window.scrollTo(0, 0);
    void initSpeech();
  }, []);

  if (!root || !cards.length) return null;

  const again = () => {
    setCards(buildDeck(root));
    setRun((r) => r + 1);
  };
  const flipFace = () => {
    setEnglish((e) => {
      saveEnglishFirst(!e);
      return !e;
    });
  };

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
        title={`${rootLetters(root)} · ${root.short}`}
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
            <div className="cd-roots">
              <span className="cd-root">
                <span className="cd-gl" lang="he">
                  {rootLetters(root)}
                </span>
                {root.short}
              </span>
            </div>
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
                word gets its check in the Roots list.
              </p>
            </section>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button type="button" className="btn primary" onClick={again}>
                Another round
              </button>
              <button type="button" className="btn" onClick={leave}>
                Back to {rootLetters(root)}
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
