import type { Progress, Root, Word } from "../types";
import type { Phrase, PhraseTopic } from "../data/phrases";
import { isKnownWord } from "./words";
import { matchesChip, type BankChip } from "./bank";
import { shuffle } from "./quiz";

/** Which roots the all-roots deck draws from: the Roots tab's chips, minus Flagged. */
export type RootScope = Exclude<BankChip, "flagged">;
export const ROOT_SCOPES: readonly RootScope[] = [
  "all",
  "due",
  "learning",
  "memorized",
  "unmet",
  "tricky",
];
/** Deck sizes on offer; 0 = every root in the pool. */
export const ROOT_DECK_SIZES = [20, 50, 0] as const;
export type RootDeckSize = (typeof ROOT_DECK_SIZES)[number];

export interface RootDeckSpec {
  scope: RootScope;
  /** A section's `cat`, or null for every theme. */
  cat: string | null;
  size: RootDeckSize;
}

/** The roots a deck spec can draw from, in bank order. */
export function rootPool(
  roots: readonly Root[],
  p: Pick<Progress, "roots">,
  spec: Pick<RootDeckSpec, "scope" | "cat">,
  now: number,
): Root[] {
  return roots.filter(
    (r) =>
      (spec.cat === null || r.cat === spec.cat) &&
      matchesChip(spec.scope, p.roots[r.r], now, undefined),
  );
}

/** A random draw of `size` roots from the pool (all of it for 0), shuffled. */
export function rootDeck(
  roots: readonly Root[],
  p: Pick<Progress, "roots">,
  spec: RootDeckSpec,
  now: number,
  mix: <T>(xs: readonly T[]) => T[] = shuffle,
): Root[] {
  const all = mix(rootPool(roots, p, spec, now));
  return spec.size ? all.slice(0, spec.size) : all;
}

/** Most cards a word deck holds by default. */
export const WORD_DECK_MAX = 30;

export interface WordCard {
  word: Word;
  root: Root;
}

type Words = Pick<Progress, "words">;
const known = (p: Words, h: string) => isKnownWord(p.words[h]);

/**
 * Word cards for a list of roots: words you don't know yet first, then each root's most useful
 * words before its rarer ones (the bank lists a root's words most useful first), then list order.
 * A word shared by two listed roots appears once; capped at `cap`.
 */
export function wordDeck(roots: readonly Root[], p: Words, cap = WORD_DECK_MAX): WordCard[] {
  const seen = new Set<string>();
  const all: { card: WordCard; idx: number; order: number; k: number }[] = [];
  roots.forEach((root, order) =>
    root.words.forEach((word, idx) => {
      if (seen.has(word.h)) return;
      seen.add(word.h);
      all.push({ card: { word, root }, idx, order, k: known(p, word.h) ? 1 : 0 });
    }),
  );
  all.sort((a, b) => a.k - b.k || a.idx - b.idx || a.order - b.order);
  return all.slice(0, cap).map((x) => x.card);
}

export interface PhraseStats {
  known: number;
  total: number;
  byTopic: Partial<Record<PhraseTopic, { known: number; total: number }>>;
  /** The most common phrase not known yet (null when all are known). */
  next: Phrase | null;
}

export function phraseStats(phrases: readonly Phrase[], p: Words): PhraseStats {
  const byTopic: PhraseStats["byTopic"] = {};
  let k = 0;
  let next: Phrase | null = null;
  for (const x of phrases) {
    const t = (byTopic[x.topic] ??= { known: 0, total: 0 });
    t.total++;
    if (known(p, x.h)) {
      t.known++;
      k++;
    } else if (!next || x.rank < next.rank) next = x;
  }
  return { known: k, total: phrases.length, byTopic, next };
}
