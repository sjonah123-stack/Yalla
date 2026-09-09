import type { Binyan, Mode, Option, Question, Root, Word } from "../types";
import { BINYAN_IDS, BINYAN_BY_ID, isBinyan } from "../data/binyanim";
import { rootDisplay, rootLetters } from "./hebrew";

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
}

/** Pick a question mode for a root, gated by mastery: recognition → production. */
export function modeFor(root: Root, m: number, ctx: ModeContext): Mode {
  let opts: Mode[] =
    m === 0
      ? ["rootMeaning", "rootMeaning", "meaningRoot"]
      : m <= 2
        ? ["wordRoot", "meaningRoot", "rootMeaning", "oddOne", "hearWord"]
        : ["wordRoot", "oddOne", "typeRoot", "typeRoot", "hearWord", "whichBinyan"];
  if (root.words.length < 3) opts = opts.filter((o) => o !== "oddOne");
  if (!ctx.audio) opts = opts.filter((o) => o !== "hearWord");
  if (new Set(verbForms(root).map((w) => w.b)).size < 2)
    opts = opts.filter((o) => o !== "whichBinyan");
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
  oddOne: "Which word is not from this root?",
  typeRoot: "Type the root",
  hearWord: "Listen. Which root is it?",
  whichBinyan: "Which binyan is this?",
};

export function makeQuestion(root: Root, all: readonly Root[], mode: Mode): Question {
  const sim = similarRoots(root, all, 3);
  const rootOpts = (): Option[] =>
    shuffle([root, ...sim].map((r) => ({ label: rootDisplay(r), ok: r === root })));
  const title = MODE_TITLE[mode];
  switch (mode) {
    case "rootMeaning":
      return {
        mode,
        root,
        title,
        opts: shuffle([root, ...sim].map((r) => ({ label: r.short, ok: r === root }))),
      };
    case "meaningRoot":
      return { mode, root, title, opts: rootOpts() };
    case "wordRoot":
      return { mode, root, title, word: pick(root.words), opts: rootOpts() };
    case "hearWord":
      return { mode, root, title, word: pick(root.words), opts: rootOpts() };
    case "oddOne": {
      const mine = shuffle(root.words).slice(0, 3);
      const other = sim[0];
      const ow = pick(other.words);
      const opts = shuffle<Option>([
        ...mine.map((w) => ({ label: w.h, sub: w.g, ok: false, w })),
        { label: ow.h, sub: ow.g, ok: true, w: ow, from: other },
      ]);
      return { mode, root, title, opts, odd: other };
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
  }
}

/** XP for a correct answer. Production modes pay more; combos add; retries pay half. */
export function xpFor(mode: Mode, combo: number, first: boolean): number {
  let x =
    mode === "typeRoot" || mode === "whichBinyan"
      ? 20
      : mode === "oddOne" || mode === "hearWord"
        ? 15
        : 10;
  if (combo >= 3) x += 5;
  if (combo >= 6) x += 5;
  if (!first) x = Math.round(x / 2);
  return x;
}
