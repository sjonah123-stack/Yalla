// Vocalized conjugation for STRONG (shlemim) triliteral roots.
//
// Scope on purpose: pa'al / pi'el / hif'il, past (8 persons) and present (4 forms), and only
// for roots whose every letter behaves regularly. Everything else returns null — a wrong
// nikud in a drill is worse than a missing one.
//
// Each form is a template on the פ.ע.ל skeleton, written in the small notation below and
// carrying the vowels of the standard paradigm. `build()` substitutes the radicals, decides
// each dagesh, swaps in final letters and normalizes to NFC (which orders the marks the way
// the root bank writes them: letter, vowel, dagesh, shin dot).
import { FINALS } from "./hebrew";

export type Binyan = "pa'al" | "pi'el" | "hif'il";
export type Tense = "past" | "present";

export interface Person {
  id: "1s" | "2ms" | "2fs" | "3ms" | "3fs" | "1p" | "2p" | "3p";
  he: string;
  en: string;
}

export interface Gender {
  id: "ms" | "fs" | "mp" | "fp";
  he: string;
  en: string;
}

/** Past-tense persons, in paradigm order. The order is stable: drills index into it. */
export const PAST_PERSONS: readonly Person[] = [
  { id: "1s", he: "אֲנִי", en: "I" },
  { id: "2ms", he: "אַתָּה", en: "you (m.)" },
  { id: "2fs", he: "אַתְּ", en: "you (f.)" },
  { id: "3ms", he: "הוּא", en: "he" },
  { id: "3fs", he: "הִיא", en: "she" },
  { id: "1p", he: "אֲנַחְנוּ", en: "we" },
  { id: "2p", he: "אַתֶּם / אַתֶּן", en: "you (pl.)" },
  { id: "3p", he: "הֵם / הֵן", en: "they" },
];

/** Present-tense forms, in paradigm order. */
export const PRESENT_FORMS: readonly Gender[] = [
  { id: "ms", he: "הוּא", en: "masculine singular" },
  { id: "fs", he: "הִיא", en: "feminine singular" },
  { id: "mp", he: "הֵם", en: "masculine plural" },
  { id: "fp", he: "הֵן", en: "feminine plural" },
];

export const BINYANIM: readonly Binyan[] = ["pa'al", "pi'el", "hif'il"];

// --- letters ---------------------------------------------------------------

/** Medial letter -> word-final letter. `FINALS` in hebrew.ts is the other direction. */
const TO_FINAL: Record<string, string> = Object.fromEntries(
  Object.entries(FINALS).map(([fin, med]) => [med, fin]),
);

// Combining marks as escapes: bare nikud in a string literal is invisible in a diff.
const PATACH = "\u05B7"; // patach
const QAMATZ = "\u05B8"; // qamatz
const TSERE = "\u05B5"; // tsere
const SEGOL = "\u05B6"; // segol
const HIRIQ = "\u05B4"; // hiriq
const SHVA = "\u05B0"; // shva
const HOLAM = "\u05B9"; // holam
const DAGESH = "\u05BC"; // dagesh
const SHIN_DOT = "\u05C1"; // shin dot
const SIN_DOT = "\u05C2"; // sin dot

const HEBREW_LETTER = /^[א-ת]$/;

/** בגדכפת: the letters that take a dagesh lene after a closed syllable or word-initially. */
const BEGADKEFAT = new Set(["ב", "ג", "ד", "כ", "פ", "ת"]);

/** Letters this engine cannot conjugate reliably anywhere in the root. */
const WEAK = new Set([
  "א", // pe/ayin/lamed-alef: quiescent, rewrites the vowels
  "ה", // lamed-he: the ה drops out
  "ו", // hollow roots
  "י", // pe-yod / lamed-yod
  "ח", // needs chataf vowels and turns hif'il into הֶחְ / הֶחֱ
  "ע", // same, plus furtive patach
]);

/** ר takes no dagesh, so it breaks pi'el's doubled middle radical and the third-radical rules. */
const NO_DAGESH = new Set(["ר"]);

/**
 * Roots whose ש is a sin (שׂ). Bare ש defaults to shin (שׁ); a caller that knows better can
 * pass the pointed letter (שׂכל) directly. Derived from the root bank: שכל is the only sin
 * root there that is otherwise strong.
 */
export const SIN_ROOTS: readonly string[] = ["שכל"];

/**
 * Root + binyan pairs the templates get wrong because the verb is not built from the plain
 * triliteral stem. `paradigm()` and `conjugate()` return null for these.
 *
 * - תכן / pi'el: the verb is תִּכְנֵן, a pi'el of the reduplicated stem תכנן, not תִּכֵּן.
 */
export const IRREGULAR: readonly string[] = ["תכן|pi'el"];

// --- templates -------------------------------------------------------------
//
// Notation, one character per slot:
//   1 2 3  the root letters
//   ~      dagesh lene on the letter before it (only if that letter is בגדכפת)
//   =      dagesh on the letter before it, always (pi'el's doubled middle radical, and the
//          suffix ת, which always follows a closed syllable)
//   A a e E i o u I :  qamatz, patach, tsere, segol, hiriq, holam male (וֹ), shuruk (וּ),
//          hiriq male (ִי), shva
//   anything else is a literal letter.

const VOWELS: Record<string, string> = {
  A: QAMATZ,
  a: PATACH,
  e: TSERE,
  E: SEGOL,
  i: HIRIQ,
  ":": SHVA,
  o: "ו" + HOLAM,
  u: "ו" + DAGESH,
  I: HIRIQ + "י",
};

type PastTemplates = Record<Person["id"], string>;
type PresentTemplates = Record<Gender["id"], string>;

/** כָּתַבְתִּי … כּוֹתֵב, דִּבַּרְתִּי … מְדַבֵּר, הִכְתַּבְתִּי … מַכְתִּיב, on פ.ע.ל. */
const TEMPLATES: Record<Binyan, { past: PastTemplates; present: PresentTemplates }> = {
  "pa'al": {
    past: {
      "1s": "1~A2a3:ת=I",
      "2ms": "1~A2a3:ת=A",
      "2fs": "1~A2a3:ת=:",
      "3ms": "1~A2a3",
      "3fs": "1~A2:3Aה",
      "1p": "1~A2a3:נu",
      "2p": "1~:2a3:ת=Eם",
      "3p": "1~A2:3u",
    },
    present: { ms: "1~o2e3", fs: "1~o2E3Eת", mp: "1~o2:3Iם", fp: "1~o2:3oת" },
  },
  "pi'el": {
    past: {
      "1s": "1~i2=a3:ת=I",
      "2ms": "1~i2=a3:ת=A",
      "2fs": "1~i2=a3:ת=:",
      "3ms": "1~i2=e3",
      "3fs": "1~i2=:3Aה",
      "1p": "1~i2=a3:נu",
      "2p": "1~i2=a3:ת=Eם",
      "3p": "1~i2=:3u",
    },
    present: { ms: "מ:1a2=e3", fs: "מ:1a2=E3Eת", mp: "מ:1a2=:3Iם", fp: "מ:1a2=:3oת" },
  },
  "hif'il": {
    past: {
      "1s": "הi1:2~a3:ת=I",
      "2ms": "הi1:2~a3:ת=A",
      "2fs": "הi1:2~a3:ת=:",
      "3ms": "הi1:2~I3",
      "3fs": "הi1:2~I3Aה",
      "1p": "הi1:2~a3:נu",
      "2p": "הi1:2~a3:ת=Eם",
      "3p": "הi1:2~I3u",
    },
    present: { ms: "מa1:2~I3", fs: "מa1:2~I3Aה", mp: "מa1:2~I3Iם", fp: "מa1:2~I3oת" },
  },
};

// --- root normalization ----------------------------------------------------

/**
 * "שכר2" -> "שכר", "מלך" -> "מלכ" (final letters back to medial). A sin/shin dot the caller
 * supplied is kept; everything else that is not a Hebrew letter is dropped.
 */
function normalizeRoot(letters: string): string {
  let out = "";
  for (const c of letters.normalize("NFC")) {
    if (c === SIN_DOT || c === SHIN_DOT) {
      if (out.endsWith("ש")) out += c;
      continue;
    }
    const medial = FINALS[c] ?? c;
    if (HEBREW_LETTER.test(medial)) out += medial;
  }
  return out;
}

/** The root letters as an array, each one letter plus an optional sin/shin dot. */
function split(root: string): string[] {
  const out: string[] = [];
  for (const c of root) {
    if ((c === SIN_DOT || c === SHIN_DOT) && out.length > 0) out[out.length - 1] += c;
    else out.push(c);
  }
  return out;
}

const bare = (letter: string): string => letter[0];

const sinSet = new Set(SIN_ROOTS.map(normalizeRoot));
const irregularSet = new Set(
  IRREGULAR.map((k) => {
    const [root, binyan] = k.split("|");
    return `${normalizeRoot(root)}|${binyan}`;
  }),
);

/**
 * True when every letter is strong for this engine: exactly three Hebrew letters, no
 * א ה ו י ח ע anywhere, no initial נ (it assimilates in hif'il), no ר in the second or third
 * position, and not a geminate root (2nd = 3rd letter, which is a weak class of its own).
 */
export function isStrongRoot(letters: string): boolean {
  const root = split(normalizeRoot(letters));
  if (root.length !== 3) return false;
  if (root.some((l) => WEAK.has(bare(l)))) return false;
  if (bare(root[0]) === "נ") return false;
  if (NO_DAGESH.has(bare(root[1])) || NO_DAGESH.has(bare(root[2]))) return false;
  if (bare(root[1]) === bare(root[2])) return false;
  return true;
}

// --- building --------------------------------------------------------------

/** ש with no dot gets a shin dot, unless the root is a known sin root. */
function point(letter: string, root: string): string {
  if (letter !== "ש") return letter;
  return letter + (sinSet.has(root) ? SIN_DOT : SHIN_DOT);
}

/** Word-final כ מ נ פ צ take their final form; a final kaf also takes a silent shva (מָשַׁךְ). */
function finalize(word: string): string {
  const chars = [...word];
  for (let i = chars.length - 1; i >= 0; i--) {
    if (!HEBREW_LETTER.test(chars[i])) continue;
    const fin = TO_FINAL[chars[i]];
    if (fin) chars[i] = fin === "ך" ? fin + SHVA : fin;
    break;
  }
  return chars.join("");
}

function build(root: string, template: string): string {
  const radicals = split(root);
  let out = "";
  for (let i = 0; i < template.length; i++) {
    const c = template[i];
    const vowel = VOWELS[c];
    if (vowel !== undefined) {
      out += vowel;
      continue;
    }
    let letter: string;
    if (c === "1" || c === "2" || c === "3") letter = point(radicals[Number(c) - 1], root);
    else letter = c;
    const next = template[i + 1];
    if (next === "=") {
      out += letter + DAGESH;
      i++;
    } else if (next === "~") {
      out += BEGADKEFAT.has(bare(letter)) ? letter + DAGESH : letter;
      i++;
    } else {
      out += letter;
    }
  }
  return finalize(out).normalize("NFC");
}

// --- API -------------------------------------------------------------------

/** Null when the root is not strong, or when this root + binyan is a known irregular. */
function templatesFor(letters: string, binyan: Binyan): { root: string } | null {
  const root = normalizeRoot(letters);
  if (!isStrongRoot(root)) return null;
  if (irregularSet.has(`${root}|${binyan}`)) return null;
  return { root };
}

export function conjugate(
  letters: string,
  binyan: Binyan,
  tense: "past",
  person: Person["id"],
): string | null;
export function conjugate(
  letters: string,
  binyan: Binyan,
  tense: "present",
  form: Gender["id"],
): string | null;
export function conjugate(
  letters: string,
  binyan: Binyan,
  tense: Tense,
  slot: Person["id"] | Gender["id"],
): string | null {
  const ok = templatesFor(letters, binyan);
  if (!ok) return null;
  const forms = TEMPLATES[binyan];
  const template =
    tense === "past" ? forms.past[slot as Person["id"]] : forms.present[slot as Gender["id"]];
  if (template === undefined) return null;
  return build(ok.root, template);
}

/** Every form this engine knows for one root and binyan, or null if it will not touch it. */
export function paradigm(
  letters: string,
  binyan: Binyan,
): { past: Record<Person["id"], string>; present: Record<Gender["id"], string> } | null {
  const ok = templatesFor(letters, binyan);
  if (!ok) return null;
  const forms = TEMPLATES[binyan];
  const past = {} as Record<Person["id"], string>;
  for (const p of PAST_PERSONS) past[p.id] = build(ok.root, forms.past[p.id]);
  const present = {} as Record<Gender["id"], string>;
  for (const f of PRESENT_FORMS) present[f.id] = build(ok.root, forms.present[f.id]);
  return { past, present };
}
