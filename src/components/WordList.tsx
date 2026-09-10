import { Fragment } from "react";
import type { Word } from "../types";
import { stripNikud } from "../lib/hebrew";
import { SENTENCES } from "../data/sentences";
import { useProgress } from "../store/progress";
import { isKnownWord } from "../lib/words";
import { SpeakButton } from "./SpeakButton";

/** One word per row: gloss + transliteration + form on the left, vocalized Hebrew on the right. */
export function WordList({
  words,
  compact = false,
  showForm = true,
}: {
  words: readonly Word[];
  compact?: boolean;
  showForm?: boolean;
}) {
  const nikud = useProgress((s) => s.p.settings.nikud);
  const stats = useProgress((s) => s.p.words);
  const text = (h: string) => (nikud ? h : stripNikud(h));
  return (
    <div className={"words" + (compact ? " compact" : "")}>
      {words.map((w) => {
        const ex = compact ? undefined : SENTENCES[w.h];
        return (
          <div className="w" key={w.h}>
            <div className="g">
              <b>{w.g}</b>
              <div>
                <span className="t">{w.t}</span>
                {showForm && <span className="b"> · {w.b}</span>}
              </div>
            </div>
            <div className="h">
              <span className="word" lang="he">
                {text(w.h)}
              </span>
              {!compact && isKnownWord(stats[w.h]) && (
                <span className="known" aria-label="known">
                  ✓
                </span>
              )}
              <SpeakButton text={w.h} />
            </div>
            {ex && (
              <div className="example">
                <span lang="he" dir="rtl">
                  {ex.he.split(w.h).map((part, i) => (
                    <Fragment key={i}>
                      {i > 0 && <b>{text(w.h)}</b>}
                      {text(part)}
                    </Fragment>
                  ))}
                </span>
                <span className="en">{ex.en}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
