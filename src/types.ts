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
  // Daily-quest counters (v1.0). All optional, max-merged per field.
  /** Lessons / reviews finished. */
  sessions?: number;
  /** Best combo that day. */
  combo?: number;
  /** Sessions finished with no misses. */
  perfect?: number;
  /** Seconds of listening mode. */
  listen?: number;
  /** Stories read to the end. */
  stories?: number;
  /** Shuk collections. */
  collects?: number;
  /** Root of the day finished (1). */
  daily?: number;
  /** Right answers in a "fix my mistakes" round. */
  fixed?: number;
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
  /** Accent palette (bought in the gem shop; "plum" is the default). */
  accent: Accent;
  /** Daily push reminder (web build, signed in). `hour` is local, 0–23. */
  reminders: { on: boolean; hour: number };
}

export type Accent = "plum" | "jaffa" | "galil" | "negev";

/** What the gem shop sells. */
export type ShopItem = "freeze" | "repair" | "rush" | "bag" | `accent:${Accent}`;

/** One gem-shop purchase (or a prize that behaves like one, cost 0). Keyed by a unique id. */
export interface Purchase {
  at: number;
  item: ShopItem;
  cost: number;
}

/** A rush hour: Shuk income × mult between from and until. */
export interface Rush {
  from: number;
  until: number;
  mult: number;
}

/** The market tycoon. Shekel balance = earned − cost of levels and perks (all derived). */
export interface ShukState {
  /** Lifetime shekels collected (only goes up). */
  earned: number;
  /** Section id → stall level (0 = unupgraded). */
  levels: Record<string, number>;
  /** Perk id → level. */
  perks: Record<string, number>;
  /** When income was last collected (0 = the Shuk was never opened). */
  lastCollect: number;
  rush: Rush | null;
}

/** A wrong answer, for the mistake notebook. */
export interface Mistake {
  at: number;
  /** The root asked about. */
  root: string;
  mode: Mode;
  /** What was picked or typed (display label). */
  picked: string;
  /** The root the picked option belongs to, when it was a root option. */
  pickedRoot?: string;
  /** The vocalized word asked about, for word questions. */
  word?: string;
}

/** A finished league week. */
export interface LeagueWeek {
  /** Tier played in (0 = Clay … 4 = Diamond). */
  tier: number;
  /** Final rank, 1-based. */
  rank: number;
  /** Tier for the following week. */
  next: number;
  /** XP earned that week. */
  xp: number;
}

export interface StoryRecord {
  /** First finished. */
  at: number;
  /** Best number of comprehension questions right. */
  best: number;
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
  | "speed-20"
  | "streak-7"
  | "streak-30"
  | "shuk-shop"
  | "shuk-mall"
  | "stories-5";

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
  | "conjugate"
  | "shuk"
  | "story"
  | "listen"
  | "notebook"
  | "league";

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
  /** Gem-shop ledger: id → purchase. Gem balance = gems − Σ cost. Union-merged. */
  purchases: Record<string, Purchase>;
  /** Streak days covered without play: day key → how ("freeze" uses an owned freeze). */
  frozenDays: Record<string, "freeze" | "repair">;
  /** The market tycoon. */
  shuk: ShukState;
  /** Daily quest claims: "YYYY-MM-DD:questId" (or ":bag") → claimedAt. */
  quests: Record<string, number>;
  /** Settled league weeks: Monday day key → result. */
  league: Record<string, LeagueWeek>;
  /** Recent wrong answers, oldest first, capped. */
  mistakes: Mistake[];
  /** Story id → reading record. */
  stories: Record<string, StoryRecord>;
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
  | "whichBinyan"
  | "guessWord";

export interface Option {
  /** Display label: English gloss, root display string, or vocalized word. */
  label: string;
  sub?: string;
  ok: boolean;
  /** Word tiles (buildWord): the word shown. */
  w?: Word;
  /** The root this option stands for (root and meaning options), for the mistake notebook. */
  rid?: string;
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
