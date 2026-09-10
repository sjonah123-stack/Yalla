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

/** An example sentence for one vocalized word; `he` contains the word verbatim. */
export interface Sentence {
  he: string;
  en: string;
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
  /** Best speed-round score that day. */
  speedBest?: number;
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
  /** Answer blips and chest jingle (and vibration where the platform allows). */
  sounds: boolean;
}

/** Per-word exposure, keyed by the vocalized word. */
export interface WordStat {
  ok: number;
  bad: number;
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
  /** Best Family sort time in ms. */
  sortBestMs?: number;
  /** When the unit's completion chest was paid out (gems). */
  chestAt?: number;
}

export interface Placement {
  at: number;
  startUnit: UnitId;
  /** 0–100 */
  score: number;
}

export type SealId =
  | "first-root"
  | "ten-memorized"
  | "first-unit"
  | "speech-done"
  | "combo-5"
  | "streak-3"
  | "xp-500"
  | "perfect-lesson"
  | "typist"
  | "movement-done"
  | "gems-300"
  | "level-5"
  | "speed-20";

/** Why a learner flagged a root for review. */
export type FlagReason = "gloss" | "nikud" | "translit" | "audio" | "root" | "other";
export interface RootFlag {
  at: number;
  why: FlagReason;
  note?: string;
  /** Set when the flag was cleared; a tombstone so the clear survives a merge. */
  cleared?: number;
}

/** App views. Shell views have a tab; the rest are full-screen layers. */
export type View =
  | "home"
  | "path"
  | "play"
  | "bank"
  | "patterns"
  | "progress"
  | "flashcards"
  | "match"
  | "familysort"
  | "conjugate";

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
  /** Soft currency, only ever goes up. */
  gems: number;
  /** Seal id → earnedAt (ms). Sticky once earned. */
  seals: Partial<Record<SealId, number>>;
  /** Best in-session combo ever. */
  bestCombo: number;
  /** Completed lessons/practices with zero misses. */
  perfectLessons: number;
  /** Correct typeRoot answers, lifetime. */
  typedOk: number;
  /** Section id → when its chest was paid out. */
  sectionChests: Record<string, number>;
  /** When onboarding was completed (inferred for legacy records). */
  onboardedAt: number | null;
  /** Reset epoch (ms). A record with a newer resetAt replaces an older one wholesale on merge; 0 = never. */
  resetAt: number;
  /** Root id → review flag (content feedback). Cleared flags stay as tombstones. */
  flags: Record<string, RootFlag>;
  /** Vocalized word → how it fared in word-based questions. */
  words: Record<string, WordStat>;
  /** When the first-run tour was dismissed (null = not yet). */
  tourAt: number | null;
}

export type Mode =
  | "rootMeaning"
  | "meaningRoot"
  | "wordRoot"
  | "buildWord"
  | "typeRoot"
  | "typeWord"
  | "cloze"
  | "hearWord"
  | "whichBinyan";

export interface Option {
  /** Display label: English gloss, root display string, or vocalized word. */
  label: string;
  sub?: string;
  ok: boolean;
  /** Word tiles (buildWord): the word shown. */
  w?: Word;
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
  /** For whichBinyan: the correct binyan. */
  binyan?: Binyan;
  /** For buildWord: the form asked for. */
  form?: Form;
  /** For cloze: the example sentence the word was blanked from. */
  sentence?: Sentence;
}
