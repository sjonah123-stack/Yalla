import type { Binyan, Form, Mode, Option, Question, Root, Word } from "../types";
import { BINYAN_IDS, BINYAN_BY_ID, isBinyan } from "../data/binyanim";
import { SENTENCES } from "../data/sentences";
import { normLetters, rootDisplay, rootLetters } from "./hebrew";

const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Verb forms of a root (words tagged with a binyan). */
export const verbForms = (root: Root): Word[] => root.words.filter((w) => isBinyan(w.b));

export interface ModeContext {
  /** A Hebrew voice is available. */
  audio: boolean;
  /** Timed play: no typing, no audio latency. */
  quick?: boolean;
  /** Vocalized words the learner already knows (word-based questions prefer the others). */
  known?: ReadonlySet<string>;
}

/** A word to ask about: prefer ones not yet known. */
export function pickWord(root: Root, known?: ReadonlySet<string>, from = root.words): Word {
  const fresh = known ? from.filter((w) => !known.has(w.h)) : from;
  return pick(fresh.length ? fresh : from);
}

export const clozeWords = (root: Root): Word[] => root.words.filter((w) => !!SENTENCES[w.h]);
export const canCloze = (root: Root): boolean => clozeWords(root).length > 0;

export const distinctForms = (root: Root): number => new Set(root.words.map((w) => w.b)).size;
/** A word-builder question needs at least two forms to tell apart. */
export const canBuildWord = (root: Root): boolean => distinctForms(root) >= 2;

const FORM_LABEL: Record<Exclude<Form, Binyan>, string> = {
  noun: "a thing, a person, a name",
  adj: "describes a noun",
  adv: "describes an action",
  prep: "links words together",
  phrase: "a set phrase",
  interj: "an exclamation",
};

/** How a form is shown on the word-builder prompt: binyan name in Hebrew + id + gloss, or the part of speech. */
export function formBadge(form: Form): { he?: string; id: string; gloss: string } {
  if (isBinyan(form))
    return { he: BINYAN_BY_ID[form].he, id: form, gloss: BINYAN_BY_ID[form].gloss };
  return { id: form, gloss: FORM_LABEL[form] };
}

/** Pick a question mode for a root, gated by mastery: recognition → production. */
export function modeFor(root: Root, m: number, ctx: ModeContext): Mode {
  let opts: Mode[] =
    m === 0
      ? ["rootMeaning", "rootMeaning", "meaningRoot"]
      : m <= 2
        ? ["wordRoot", "meaningRoot", "rootMeaning", "buildWord", "cloze", "hearWord"]
        : ["wordRoot", "buildWord", "cloze", "typeRoot", "typeWord", "hearWord", "whichBinyan"];
  if (!canBuildWord(root)) opts = opts.filter((o) => o !== "buildWord");
  if (!canCloze(root)) opts = opts.filter((o) => o !== "cloze");
  if (!ctx.audio || ctx.quick) opts = opts.filter((o) => o !== "hearWord" && o !== "typeWord");
  if (ctx.quick) opts = opts.filter((o) => o !== "typeRoot");
  if (new Set(verbForms(root).map((w) => w.b)).size < 2)
    opts = opts.filter((o) => o !== "whichBinyan");
  // Discovery: a known root with a family member the learner hasn't met yet.
  if (m >= 1 && !ctx.quick && ctx.known && root.words.some((w) => !ctx.known!.has(w.h)))
    opts.push("guessWord");
  return opts.length ? pick(opts) : "rootMeaning";
}

/**
 * Distractors scored by letter overlap (+1 per shared consonant, +0.5 same theme, jitter),
 * de-duplicated by letters so a homograph never stands in for its twin.
 */
export function similarRoots(root: Root, all: readonly Root[], n: number): Root[] {
  const L = rootLetters(root);
  const scored = all
    .filter((r) => r !== root && rootLetters(r) !== L)
    .map((r) => {
      const l2 = rootLetters(r);
      let s = 0;
      for (const c of L) if (l2.includes(c)) s++;
      if (r.cat === root.cat) s += 0.5;
      return { r, s: s + Math.random() * 0.4 };
    })
    .sort((a, b) => b.s - a.s);
  const out: Root[] = [];
  const seenL = new Set([L]);
  for (const { r } of scored) {
    const l2 = rootLetters(r);
    if (seenL.has(l2)) continue;
    seenL.add(l2);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

export const MODE_TITLE: Record<Mode, string> = {
  rootMeaning: "What does this root mean?",
  meaningRoot: "Which root carries this meaning?",
  wordRoot: "Find the root",
  buildWord: "Build the word",
  typeRoot: "Type the root",
  typeWord: "Listen. Type the word",
  cloze: "Fill the blank",
  hearWord: "Listen. Which root is it?",
  whichBinyan: "Which binyan is this?",
  guessWord: "New word! Guess its meaning",
};

/** Word tiles: the asked word plus the root's other forms first, then look-alike roots' words. */
function wordTiles(root: Root, all: readonly Root[], w: Word, sameForm: boolean): Option[] {
  const own = shuffle(root.words.filter((x) => x.h !== w.h && (!sameForm || x.b !== w.b))).slice(
    0,
    3,
  );
  const fill: Word[] = [];
  const seenH = new Set([w.h, ...own.map((x) => x.h)]);
  for (const r of similarRoots(root, all, 8)) {
    if (own.length + fill.length >= 3) break;
    const same = r.words.filter((x) => x.b === w.b && !seenH.has(x.h));
    const any = r.words.filter((x) => !seenH.has(x.h));
    const x = same[0] ?? any[0];
    if (!x) continue;
    seenH.add(x.h);
    fill.push(x);
  }
  return shuffle<Option>([
    { label: w.h, sub: w.g, ok: true, w },
    ...[...own, ...fill].map((x) => ({ label: x.h, sub: x.g, ok: false, w: x })),
  ]);
}

export function makeQuestion(
  root: Root,
  all: readonly Root[],
  mode: Mode,
  known?: ReadonlySet<string>,
): Question {
  const sim = similarRoots(root, all, 3);
  const rootOpts = (): Option[] =>
    shuffle([root, ...sim].map((r) => ({ label: rootDisplay(r), ok: r === root, rid: r.r })));
  const title = MODE_TITLE[mode];
  switch (mode) {
    case "rootMeaning":
      return {
        mode,
        root,
        title,
        opts: shuffle([root, ...sim].map((r) => ({ label: r.short, ok: r === root, rid: r.r }))),
      };
    case "meaningRoot":
      return { mode, root, title, opts: rootOpts() };
    case "wordRoot":
      return { mode, root, title, word: pickWord(root, known), opts: rootOpts() };
    case "hearWord":
      return { mode, root, title, word: pickWord(root, known), opts: rootOpts() };
    case "buildWord": {
      // The root + a form; the answer is the family member in that form. Distractors are the
      // root's own words in other forms first (pattern recognition), then look-alike roots.
      const w = pickWord(root, known);
      return { mode, root, title, word: w, form: w.b, opts: wordTiles(root, all, w, true) };
    }
    case "cloze": {
      const w = pickWord(root, known, clozeWords(root));
      return {
        mode,
        root,
        title,
        word: w,
        sentence: SENTENCES[w.h],
        opts: wordTiles(root, all, w, false),
      };
    }
    case "typeWord": {
      const w = pickWord(root, known);
      return { mode, root, title, word: w, answer: normLetters(w.h) };
    }
    case "whichBinyan": {
      const verbs = verbForms(root);
      const w = pick(verbs);
      const correct = w.b as Binyan;
      // Prefer binyanim this root actually uses as distractors, then fill from the rest.
      const used = [...new Set(verbs.map((v) => v.b as Binyan))].filter((b) => b !== correct);
      const rest = shuffle(BINYAN_IDS.filter((b) => b !== correct && !used.includes(b)));
      const distractors = [...shuffle(used), ...rest].slice(0, 3);
      const opts = shuffle<Option>(
        [correct, ...distractors].map((b) => ({
          label: BINYAN_BY_ID[b].he,
          sub: b,
          ok: b === correct,
        })),
      );
      return { mode, root, title, word: w, opts, binyan: correct };
    }
    case "typeRoot":
      return { mode, root, title, word: pick(root.words), answer: rootLetters(root) };
    case "guessWord": {
      // An unmet family member of a known root: the root's meaning plus the pattern give it away.
      // Distractors are same-form words of look-alike roots, so the root is the clue.
      const w = pickWord(root, known);
      const labels = new Set([w.g, ...root.words.map((x) => x.g)]);
      const opts: Option[] = [{ label: w.g, ok: true, rid: root.r }];
      for (const r of similarRoots(root, all, 12)) {
        if (opts.length >= 4) break;
        const x =
          r.words.find((y) => y.b === w.b && !labels.has(y.g)) ??
          r.words.find((y) => !labels.has(y.g));
        if (!x) continue;
        labels.add(x.g);
        opts.push({ label: x.g, ok: false, rid: r.r });
      }
      return { mode, root, title, word: w, opts: shuffle(opts) };
    }
  }
}

/** Combo thresholds for fever: ×1.5 from the first, ×2 from the second. */
export const FEVER = [5, 10] as const;
/** 0 = no fever, 1 = fever (×1.5), 2 = super fever (×2). */
export const feverLevel = (combo: number): number =>
  combo >= FEVER[1] ? 2 : combo >= FEVER[0] ? 1 : 0;
export const FEVER_MULT = [1, 1.5, 2] as const;

/** XP for a correct answer. Production modes pay more; combo fever multiplies; retries pay half. */
export function xpFor(mode: Mode, combo: number, first: boolean): number {
  let x =
    mode === "typeRoot" || mode === "typeWord" || mode === "whichBinyan" || mode === "buildWord"
      ? 20
      : mode === "hearWord" || mode === "cloze"
        ? 15
        : 10;
  x = Math.round(x * FEVER_MULT[feverLevel(combo)]);
  if (!first) x = Math.round(x / 2);
  return x;
}
