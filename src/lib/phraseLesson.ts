import type { Option, Progress, Question, Root, UnitId } from "../types";
import type { Phrase } from "../data/phrases";
import type { Course } from "./course";
import { isKnownWord } from "./words";
import { MODE_TITLE, shuffle } from "./quiz";

/**
 * Everyday phrases ride along in the first units' lessons: the first six themes (Speech through
 * Time). Each lesson there teaches PHRASES_PER_LESSON phrases, most common first, each asked
 * twice (meet it, then use it) in place of root questions, so a lesson stays 16 questions.
 */
export const PHRASE_LESSON_UNITS = 13;
export const PHRASES_PER_LESSON = 2;
/** Question slots each phrase takes in a lesson. */
export const PHRASE_SLOTS = 2;

/** Does a lesson in this unit carry phrases? */
export const unitTeachesPhrases = (course: Course, unitId: UnitId): boolean =>
  (course.byId[unitId]?.pathIndex ?? Infinity) < PHRASE_LESSON_UNITS;

/**
 * The phrases a lesson teaches: the most common ones not yet known (two rights in word memory,
 * more rights than misses). A phrase met but missed comes back before a new one, since phrases
 * are taught in rank order. Empty outside the first units.
 */
export function lessonPhrases(
  course: Course,
  unitId: UnitId,
  p: Pick<Progress, "words">,
  phrases: readonly Phrase[],
  n = PHRASES_PER_LESSON,
): Phrase[] {
  if (!unitTeachesPhrases(course, unitId)) return [];
  return phrases
    .filter((x) => !isKnownWord(p.words[x.h]))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, n);
}

/** A stand-in root for a phrase slot, so the session's slot list stays a list of roots. */
export const phraseRoot = (x: Phrase, unit: UnitId): Root => ({
  r: x.id,
  m: x.g,
  short: x.g,
  rank: x.rank,
  cat: "everyday phrases",
  unit,
  words: [{ h: x.h, t: x.t, g: x.g, b: "phrase" }],
});

/**
 * Weave phrase slots into a lesson's root slots, spread evenly: phrase i is met at one point and
 * used again a few questions later (with two phrases in 16: at 2 and 6, then 10 and 14).
 */
export function weavePhrases(
  roots: readonly Root[],
  phrases: readonly Phrase[],
  unit: UnitId,
): { slots: Root[]; phraseAt: (Phrase | undefined)[] } {
  const k = phrases.length * PHRASE_SLOTS;
  if (!k) return { slots: roots.slice(), phraseAt: roots.map(() => undefined) };
  const n = roots.length + k;
  const at = new Map<number, Phrase>();
  for (let j = 0; j < k; j++) {
    let pos = Math.min(n - 1, Math.round(((j + 0.5) * n) / k));
    while (at.has(pos)) pos = (pos + 1) % n;
    at.set(pos, phrases[Math.floor(j / PHRASE_SLOTS)]);
  }
  const stand = new Map(phrases.map((x) => [x.id, phraseRoot(x, unit)]));
  const slots: Root[] = [];
  const phraseAt: (Phrase | undefined)[] = [];
  let ri = 0;
  for (let pos = 0; pos < n; pos++) {
    const x = at.get(pos);
    if (x) {
      slots.push(stand.get(x.id)!);
      phraseAt.push(x);
    } else {
      slots.push(roots[ri++]);
      phraseAt.push(undefined);
    }
  }
  return { slots, phraseAt };
}

/** Words too common to say two glosses mean the same thing. */
const STOP = new Set(
  "a an the i i'm you your it it's is are be to of in on at for me my do does what how have and or with this that we us".split(
    " ",
  ),
);

/** A gloss's content words, lightly stemmed ("thanks" → "thank"), parentheses dropped. */
export function glossWords(g: string): Set<string> {
  return new Set(
    g
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .split(/[^a-z']+/)
      .map((w) => w.replace(/'s$/, "").replace(/^'|'$/g, ""))
      .filter((w) => w.length > 1 && !STOP.has(w))
      .map((w) => (w.length > 3 ? w.replace(/s$/, "") : w)),
  );
}

/**
 * Could these two phrases both answer the same question? Phrases in one topic often overlap
 * (shalom is "hello; goodbye", and bai is "bye"), and so do glosses sharing a word ("thank you"
 * / "thank you very much"). A wrong option must never also be right.
 */
export function mayOverlap(a: Phrase, b: Phrase): boolean {
  if (a.topic === b.topic || a.g === b.g || a.h === b.h) return true;
  const wb = glossWords(b.g);
  return [...glossWords(a.g)].some((w) => wb.has(w));
}

/** Three other phrases to tell apart: from other topics, no shared meaning, nearest in rank. */
function others(x: Phrase, all: readonly Phrase[]): Phrase[] {
  const near = (a: Phrase, b: Phrase) => Math.abs(a.rank - x.rank) - Math.abs(b.rank - x.rank);
  const pool = all.filter((y) => y.id !== x.id && !mayOverlap(x, y)).sort(near);
  const out: Phrase[] = [];
  for (const y of shuffle(pool.slice(0, 12))) {
    if (out.length >= 3) break;
    if (!out.some((o) => o.g === y.g || o.h === y.h)) out.push(y);
  }
  return out;
}

/** A phrase question: phrase → meaning, meaning → phrase, or hear → meaning. */
export function makePhraseQuestion(
  x: Phrase,
  all: readonly Phrase[],
  mode: "phraseMeaning" | "meaningPhrase" | "hearPhrase",
  unit: UnitId,
): Question {
  const pick = [x, ...others(x, all)];
  const opts: Option[] = shuffle(
    pick.map((y) =>
      mode === "meaningPhrase"
        ? { label: y.h, sub: y.t, ok: y === x }
        : { label: y.g, ok: y === x },
    ),
  );
  return { mode, root: phraseRoot(x, unit), title: MODE_TITLE[mode], phrase: x, opts };
}

/** The mode for a phrase's n-th slot in a lesson (0 = first meeting). */
export const phraseMode = (
  nth: number,
  audio: boolean,
  coin = Math.random(),
): "phraseMeaning" | "meaningPhrase" | "hearPhrase" =>
  nth === 0 ? "phraseMeaning" : audio && coin < 0.5 ? "hearPhrase" : "meaningPhrase";
