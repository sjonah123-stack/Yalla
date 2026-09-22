/** A word in a story line that belongs to a bank root: `w` is the exact surface form in `he`. */
export interface StoryTag {
  w: string;
  /** Root id (`Root.r`). */
  r: string;
}

export interface StoryLine {
  /** One vocalized sentence. */
  he: string;
  en: string;
  tags: readonly StoryTag[];
}

/** A comprehension question in English; `a` is the index of the right option. */
export interface StoryQuestion {
  q: string;
  opts: readonly string[];
  a: number;
}

/** A short graded reading passage. Ids are stable forever (`st-a01`): progress refers to them. */
export interface Story {
  id: string;
  title: string;
  /** Hebrew title (vocalized). */
  he: string;
  lines: readonly StoryLine[];
  qs: readonly StoryQuestion[];
}
