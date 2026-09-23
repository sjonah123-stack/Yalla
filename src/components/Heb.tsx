import type { ReactNode } from "react";

/** Hebrew inline text: the `heb` styling plus `lang="he"` so screen readers switch voice. */
export function Heb({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={("heb " + className).trim()} lang="he">
      {children}
    </span>
  );
}

const HEBREW_WORD = /([֐-׿]+)/;

/**
 * English text with Hebrew words in it. Each Hebrew word is isolated, so two Hebrew words
 * separated only by punctuation ("starts with מְ: מְדַבֵּר") keep their written order instead
 * of being run together right to left by the bidi algorithm.
 */
export function Mixed({ text }: { text: string }) {
  return (
    <>
      {text.split(HEBREW_WORD).map((part, i) =>
        i % 2 ? (
          <bdi key={i} lang="he">
            {part}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}
