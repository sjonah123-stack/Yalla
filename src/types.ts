export type Form =
  | "pa'al"
  | "nif'al"
  | "pi'el"
  | "pu'al"
  | "hif'il"
  | "huf'al"
  | "hitpa'el"
  | "noun"
  | "adj"
  | "adv"
  | "prep"
  | "phrase"
  | "interj";

export type Binyan = "pa'al" | "nif'al" | "pi'el" | "pu'al" | "hif'il" | "huf'al" | "hitpa'el";

/** "movement-3": `<sectionId>-<serial>`. The serial is a stable id, not a position. */
export type UnitId = `${string}-${number}`;

export interface Word {
  /** Vocalized form (with nikud). */
  h: string;
  /** Transliteration. */
  t: string;
  /** English gloss. */
  g: string;
  /** Binyan or part of speech. */
  b: Form;
}

export interface Root {
  /** Root letters; a trailing digit distinguishes homographs (שכר2). */
  r: string;
  /** Core meaning (may list several senses). */
  m: string;
  /** Single-sense label, ≤ 2 words: Match tiles, multiple-choice options. */
  short: string;
  /** Usefulness within its section; 1 = most useful. */
  rank: number;
  cat: string;
  unit: UnitId;
  words: readonly Word[];
  note?: string;
}

/** Per-root spaced-repetition state. */
export interface RootState {
  ease: number;
  ivl: number;
  due: number;
  reps: number;
  lapses: number;
  ok: number;
  bad: number;
}

export interface DayStats {
  ok: number;
  bad: number;
  xp: number;
  /** Roots memorized at end of day (recorded from v3 on). */
  mem?: number;
}

export type DailyGoal = 20 | 50 | 100;

export interface Settings {
  sessionLen: number;
  cats: string[];
  nikud: boolean;
  audio: boolean;
  learnFirst: boolean;
  theme: "system" | "light" | "dark";
  dailyGoal: DailyGoal;
}

/** Sticky per-unit facts that cannot be derived from root state. */
export interface UnitRecord {
  completedAt?: number;
  /** Skipped via the placement test. */
  placed?: boolean;
  /** Best test score, 0–100. */
  testBest?: number;
  testPassedAt?: number;
  /** Best Match time in ms. */
  matchBestMs?: number;
}

export interface Placement {
  at: number;
  startUnit: UnitId;
  /** 0–100 */
  score: number;
}

export interface Progress {
  v: 3;
  xp: number;
  streak: number;
  lastPlay: string | null;
  roots: Record<string, RootState>;
  history: Record<string, DayStats>;
  units: Record<string, UnitRecord>;
  placement: Placement | null;
  lastUnit: UnitId | null;
  settings: Settings;
  updatedAt: number;
}

export type Mode =
  "rootMeaning" | "meaningRoot" | "wordRoot" | "oddOne" | "typeRoot" | "hearWord" | "whichBinyan";

export interface Option {
  /** Display label: English gloss, root display string, or vocalized word. */
  label: string;
  sub?: string;
  ok: boolean;
  /** For oddOne: the word shown. */
  w?: Word;
  /** For oddOne: the root the intruder came from. */
  from?: Root;
}

export interface Question {
  mode: Mode;
  root: Root;
  title: string;
  /** For word-based modes. */
  word?: Word;
  /** Multiple-choice options (absent for typeRoot). */
  opts?: Option[];
  /** For typeRoot: the expected letters. */
  answer?: string;
  /** For oddOne: the root of the intruder. */
  odd?: Root;
  /** For whichBinyan: the correct binyan. */
  binyan?: Binyan;
}
