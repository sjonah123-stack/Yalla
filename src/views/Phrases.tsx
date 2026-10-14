import { useEffect, useLayoutEffect } from "react";
import { ROOTS } from "../data/roots";
import { PHRASES, PHRASE_TOPICS, type Phrase } from "../data/phrases";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { PHRASE_DECK_MAX, phraseDeck, phraseStats } from "../lib/cards";
import { isKnownWord } from "../lib/words";
import { rootLetters, stripNikud } from "../lib/hebrew";
import { initSpeech } from "../lib/speech";
import { Heb } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";

const BY_ID = new Map(ROOTS.map((r) => [r.r, r]));

/** Everyday phrases by topic, most common first, with a swipe deck for the selected topic. */
export default function Phrases() {
  const leave = useUi((s) => s.leaveTool);
  const openCards = useUi((s) => s.openCards);
  const openRoot = useUi((s) => s.openRoot);
  const topic = useUi((s) => s.phraseTopic);
  const setTopic = useUi((s) => s.setPhraseTopic);
  const words = useProgress((s) => s.p.words);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const text = (h: string) => (nikud ? h : stripNikud(h));

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    void initSpeech();
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [leave]);

  const stats = phraseStats(PHRASES, { words });
  const deck = phraseDeck(PHRASES, { words }, topic ?? undefined);
  const scope = topic ? stats.byTopic[topic]! : stats;
  const toLearn = scope.total - scope.known;
  const shown = PHRASE_TOPICS.filter((t) => !topic || t.id === topic);

  return (
    <div className="tool page ph">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Everyday phrases</span>
        <span className="cnt tnum">
          {stats.known} / {stats.total} known
        </span>
      </div>

      <div className="ph-h">
        <h1>What people say most</h1>
        <p>
          The phrases you hear every day, most common first. Swipe through them; two Knows and a
          phrase gets its check.
        </p>
      </div>

      <button
        type="button"
        className="btn primary block big ph-go"
        onClick={() => openCards(topic ? { kind: "phrases", topic } : { kind: "phrases" })}
      >
        {toLearn > 0
          ? `Flashcards · ${Math.min(toLearn, topic ? toLearn : PHRASE_DECK_MAX)} to learn`
          : `Review · ${deck.length} weakest first`}
      </button>

      <div className="chips scroll ph-chips">
        <button
          type="button"
          className="chip toggle"
          aria-pressed={topic === null}
          onClick={() => setTopic(null)}
        >
          All{" "}
          <span className="tnum">
            {stats.known}/{stats.total}
          </span>
        </button>
        {PHRASE_TOPICS.map((t) => {
          const s = stats.byTopic[t.id]!;
          return (
            <button
              key={t.id}
              type="button"
              className="chip toggle"
              aria-pressed={topic === t.id}
              onClick={() => setTopic(t.id)}
            >
              {t.title}{" "}
              <span className="tnum">
                {s.known}/{s.total}
              </span>
            </button>
          );
        })}
      </div>

      {shown.map((t) => (
        <section key={t.id} className="ph-sec">
          <div className="group-h">
            <Heb className="he">{t.he}</Heb>
            <span className="eyebrow">{t.title}</span>
          </div>
          <div className="words ph-list">
            {PHRASES.filter((x) => x.topic === t.id)
              .sort((a, b) => a.rank - b.rank)
              .map((x) => (
                <PhraseRow
                  key={x.id}
                  x={x}
                  known={isKnownWord(words[x.h])}
                  text={text}
                  onRoot={openRoot}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PhraseRow({
  x,
  known,
  text,
  onRoot,
}: {
  x: Phrase;
  known: boolean;
  text: (h: string) => string;
  onRoot: (id: string) => void;
}) {
  const roots = [...new Set(x.tags.map((t) => t.r))].flatMap((r) => BY_ID.get(r) ?? []);
  return (
    <div className="w">
      <div className="g">
        <b>{x.g}</b>
        <div>
          <span className="t">{x.t}</span>
        </div>
      </div>
      <div className="h">
        <span className="word" lang="he">
          {text(x.h)}
        </span>
        {known && (
          <span className="known" aria-label="known">
            ✓
          </span>
        )}
        <SpeakButton text={x.h} />
      </div>
      {(x.note || x.fem || roots.length > 0) && (
        <div className="ph-more">
          {x.fem && (
            <div className="ph-fem">
              {x.fem.to ? "To a woman: " : "A woman says: "}
              <Heb>{text(x.fem.h)}</Heb>
            </div>
          )}
          {x.note && <div className="ph-note">{x.note}</div>}
          {roots.length > 0 && (
            <div className="ph-roots">
              {roots.map((r) => (
                <button
                  key={r.r}
                  type="button"
                  className="ph-root"
                  onClick={() => onRoot(r.r)}
                  aria-label={`Root ${rootLetters(r)}, ${r.short}`}
                >
                  <span className="glyph" lang="he">
                    {rootLetters(r)}
                  </span>
                  <span>{r.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
