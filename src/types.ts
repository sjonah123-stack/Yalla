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
  /** Core meaning. */
  m: string;
  tier: 1 | 2 | 3;
  cat: string;
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
}

export interface Settings {
  sessionLen: number;
  newPerSession: number;
  cats: string[];
  nikud: boolean;
  audio: boolean;
  learnFirst: boolean;
  theme: "system" | "light" | "dark";
}

export interface Progress {
  v: 2;
  xp: number;
  streak: number;
  lastPlay: string | null;
  roots: Record<string, RootState>;
  history: Record<string, DayStats>;
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
