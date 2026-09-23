import type { Root } from "../types";

/** Final-form letters mapped to their medial forms. */
export const FINALS: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

const NIKUD = /[֑-ׇ]/g;

export const stripNikud = (s: string): string => s.replace(NIKUD, "");

/** Strip nikud and normalize final letters, for loose matching. */
export const normLetters = (s: string): string =>
  stripNikud(s)
    .split("")
    .map((c) => FINALS[c] ?? c)
    .join("");

/** "שכר2" -> "שכר" */
export const rootLetters = (root: Pick<Root, "r">): string => root.r.replace(/\d/g, "");

/** Spaced letters so the consonantal skeleton reads as a root. */
export const rootDisplay = (root: Pick<Root, "r">): string => rootLetters(root).split("").join(" ");

export const isHebrewLetter = (c: string): boolean => /^[א-ת]$/.test(c);

/** English keys -> the Hebrew letter in the same position on an Israeli keyboard. */
export const QWERTY: Record<string, string> = {
  q: "/",
  w: "'",
  e: "ק",
  r: "ר",
  t: "א",
  y: "ט",
  u: "ו",
  i: "ן",
  o: "ם",
  p: "פ",
  a: "ש",
  s: "ד",
  d: "ג",
  f: "כ",
  g: "ע",
  h: "י",
  j: "ח",
  k: "ל",
  l: "ך",
  ";": "ף",
  z: "ז",
  x: "ס",
  c: "ב",
  v: "ה",
  b: "נ",
  n: "מ",
  m: "צ",
  ",": "ת",
  ".": "ץ",
};

/**
 * The on-screen keyboard: the standard Israeli layout (SI-1452) read left to right, final
 * letters included, exactly as a phone's Hebrew keyboard shows it (the QWERTY rows, minus the
 * two punctuation keys at the start of the top row).
 */
export const KEY_ROWS = ["קראטוןםפ", "שדגכעיחלךף", "זסבהנמצתץ"] as const;

/** Map a physical key to a Hebrew letter, or null. Final letters stay final. */
export function keyToHebrew(key: string): string | null {
  if (isHebrewLetter(key)) return key;
  const k = QWERTY[key.toLowerCase()];
  return k && isHebrewLetter(k) ? k : null;
}

/** Typed letters match the answer, final and medial forms counting as the same letter. */
export const sameLetters = (typed: string, answer: string): boolean =>
  normLetters(typed) === normLetters(answer);

/** A single word of plain letters (no space, geresh or maqaf) — something a learner can type. */
export const isTypeable = (h: string): boolean =>
  !/[\s־׳״"'-]/.test(h) && /^[א-ת]+$/.test(stripNikud(h));

export const HEBREW_GREETING = (hour: number): string =>
  hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";

export const PRAISE = ["יופי!", "כל הכבוד!", "מצוין!", "נכון!", "סבבה!", "אחלה!"] as const;
