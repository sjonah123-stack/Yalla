import type { Word } from "../types";
import { stripNikud } from "../lib/hebrew";
import { useProgress } from "../store/progress";
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
  return (
    <div className={"words" + (compact ? " compact" : "")}>
      {words.map((w) => (
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
              {nikud ? w.h : stripNikud(w.h)}
            </span>
            <SpeakButton text={w.h} />
          </div>
        </div>
      ))}
    </div>
  );
}
