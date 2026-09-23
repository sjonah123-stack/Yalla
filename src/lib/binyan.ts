import type { Binyan, Mode, Progress, Root, Word } from "../types";
import { BINYAN_IDS, isBinyan } from "../data/binyanim";
import { SENTENCES } from "../data/sentences";
import { isKnownWord } from "./words";
import { seen } from "./srs";
import { shuffle, spotBinyanOptions } from "./quiz";

// ---------- Binyan lessons: learn verbs one pattern at a time ----------

export interface BinyanVerb {
  root: Root;
  word: Word;
}

/** Every verb in a binyan, in course order (the bank's order). */
export function binyanVerbs(binyan: Binyan, roots: readonly Root[]): BinyanVerb[] {
  const out: BinyanVerb[] = [];
  for (const root of roots)
    for (const word of root.words) if (word.b === binyan) out.push({ root, word });
  return out;
}

export interface BinyanStats {
  total: number;
  /** Verbs whose word the learner knows (two right answers, more rights than wrongs). */
  known: number;
  /** Verbs from roots the learner has met on the path. */
  fromSeen: number;
}

export function binyanStats(
  binyan: Binyan,
  roots: readonly Root[],
  p: Pick<Progress, "words" | "roots">,
): BinyanStats {
  const verbs = binyanVerbs(binyan, roots);
  return {
    total: verbs.length,
    known: verbs.filter((v) => isKnownWord(p.words[v.word.h])).length,
    fromSeen: verbs.filter((v) => seen(p.roots[v.root.r])).length,
  };
}

/** Verbs per lesson; each is met, then used, so a lesson is twice this many questions. */
export const BINYAN_WORDS = 5;

/**
 * The verbs for a lesson: unknown verbs of roots the learner has already met come first (a
 * familiar root in a new mould), then unknown verbs of roots still ahead on the path (the nearest
 * few, in course order), then known verbs for review, weakest first.
 */
export function pickBinyanVerbs(
  binyan: Binyan,
  roots: readonly Root[],
  p: Pick<Progress, "words" | "roots">,
  n = BINYAN_WORDS,
): BinyanVerb[] {
  const verbs = binyanVerbs(binyan, roots);
  const unknown = verbs.filter((v) => !isKnownWord(p.words[v.word.h]));
  const met = shuffle(unknown.filter((v) => seen(p.roots[v.root.r])));
  const ahead = unknown.filter((v) => !seen(p.roots[v.root.r]));
  const next = shuffle(ahead.slice(0, Math.max(n * 2, n - met.length)));
  const review = verbs
    .filter((v) => isKnownWord(p.words[v.word.h]))
    .sort((a, b) => (p.words[a.word.h]?.ok ?? 0) - (p.words[b.word.h]?.ok ?? 0));
  const out: BinyanVerb[] = [];
  const roots_ = new Set<string>();
  // One verb per root, so a lesson never asks two words of the same family.
  for (const v of [...met, ...next, ...review]) {
    if (out.length >= n) break;
    if (roots_.has(v.root.r)) continue;
    roots_.add(v.root.r);
    out.push(v);
  }
  return out;
}

export interface BinyanSlot extends BinyanVerb {
  mode: Mode;
}

/**
 * A lesson: meet every verb (what does it mean?), then use each one — pick it out by its pattern,
 * see it in a sentence, or build it from its root. The second pass is shuffled, and never starts
 * with the verb the first pass ended on.
 */
export function binyanLesson(
  binyan: Binyan,
  roots: readonly Root[],
  p: Pick<Progress, "words" | "roots">,
  n = BINYAN_WORDS,
): BinyanSlot[] {
  const verbs = pickBinyanVerbs(binyan, roots, p, n);
  if (!verbs.length) return [];
  const meet: BinyanSlot[] = verbs.map((v) => ({ ...v, mode: "verbMeaning" }));
  const use: BinyanSlot[] = verbs.map((v, i) => ({
    ...v,
    mode:
      i === 0 && canSpotBinyan(v.root, v.word, roots)
        ? "spotBinyan"
        : SENTENCES[v.word.h]
          ? "cloze"
          : v.root.words.some((w) => w.b !== binyan)
            ? "buildWord"
            : canSpotBinyan(v.root, v.word, roots)
              ? "spotBinyan"
              : "verbMeaning",
  }));
  let second = shuffle(use);
  if (second.length > 1 && second[0].word.h === meet[meet.length - 1].word.h)
    second = [...second.slice(1), second[0]];
  return [...meet, ...second];
}

/** Enough verbs in other binyanim around to build a spot-the-pattern question. */
export const canSpotBinyan = (root: Root, word: Word, all: readonly Root[]): boolean =>
  isBinyan(word.b) && spotBinyanOptions(root, word, all).length === 4;

/**
 * A root that shows the binyan against its siblings: the most binyanim, preferring roots the
 * learner has met, and only roots that use this binyan.
 */
export function familyShowcase(
  binyan: Binyan,
  roots: readonly Root[],
  p: Pick<Progress, "roots">,
): Root | null {
  let best: Root | null = null;
  let bestScore = -1;
  for (const r of roots) {
    if (!r.words.some((w) => w.b === binyan)) continue;
    const kinds = new Set(r.words.filter((w) => isBinyan(w.b)).map((w) => w.b)).size;
    if (kinds < 2) continue;
    const score = kinds * 10 + (seen(p.roots[r.r]) ? 5 : 0);
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

/** A root's verbs in binyan order (pa'al … hitpa'el). */
export const verbsInOrder = (root: Root): Word[] =>
  root.words
    .filter((w) => isBinyan(w.b))
    .sort((a, b) => BINYAN_IDS.indexOf(a.b as Binyan) - BINYAN_IDS.indexOf(b.b as Binyan));
