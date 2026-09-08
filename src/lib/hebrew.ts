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

/** Israeli keyboard rows for the on-screen keyboard. */
export const KEY_ROWS = ["קראטופ", "שדגכעיחל", "זסבהנמצת"] as const;

/** Map a physical key to a Hebrew letter, or null. */
export function keyToHebrew(key: string): string | null {
  if (isHebrewLetter(key)) return key;
  const k = QWERTY[key.toLowerCase()];
  return k && isHebrewLetter(k) ? k : null;
}

export const HEBREW_GREETING = (hour: number): string =>
  hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";

export const PRAISE = ["יופי!", "כל הכבוד!", "מצוין!", "נכון!", "סבבה!", "אחלה!"] as const;
