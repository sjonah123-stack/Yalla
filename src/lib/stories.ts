import type { Progress } from "../types";
import { STORIES, storyRoots, type Story, type StoryTag } from "../data/stories";
import { memorized } from "./course";
import { seen } from "./srs";

export interface StoryState {
  story: Story;
  roots: string[];
  /** Roots of the story the learner has met. */
  met: number;
  /** Roots of the story memorized. */
  mem: number;
  /** Every tagged root has been met. */
  unlocked: boolean;
  read: boolean;
  best: number;
}

/** Every story with its unlock state: unlocked first (unread before read), then nearest to unlocking. */
export function storyStates(p: Pick<Progress, "roots" | "stories">): StoryState[] {
  return STORIES.map((story) => {
    const roots = storyRoots(story);
    const met = roots.filter((r) => seen(p.roots[r])).length;
    const mem = roots.filter((r) => memorized(p.roots[r])).length;
    const rec = p.stories[story.id];
    return {
      story,
      roots,
      met,
      mem,
      unlocked: met === roots.length,
      read: !!rec,
      best: rec?.best ?? 0,
    };
  }).sort(
    (a, b) =>
      Number(b.unlocked) - Number(a.unlocked) ||
      Number(a.read) - Number(b.read) ||
      b.met / b.roots.length - a.met / a.roots.length,
  );
}

/** Unlocked stories not read yet. */
export const newStories = (p: Pick<Progress, "roots" | "stories">): number =>
  storyStates(p).filter((s) => s.unlocked && !s.read).length;

// ---------- Line segmentation ----------

/** A Hebrew letter or point: a tag only counts as a whole word when neither neighbour is one. */
const WORD_CH = /[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA]/;

export interface Segment {
  text: string;
  /** Index into the line's tags when this piece is a tagged word. */
  tag?: number;
}

/**
 * Split a line around its tags. Tags are exact substrings listed in reading order; each claims
 * the first free whole-word occurrence after the previous tag (then anywhere, then as a bare
 * substring), so a repeated word gets its own span each time it is tagged.
 */
export function segmentLine(he: string, tags: readonly StoryTag[]): Segment[] {
  const taken: [number, number, number][] = [];
  const isW = (c: string | undefined) => !!c && WORD_CH.test(c);
  const free = (a: number, b: number) => taken.every(([x, y]) => b <= x || a >= y);
  const find = (w: string, from: number, whole: boolean): number => {
    for (let i = he.indexOf(w, from); i >= 0; i = he.indexOf(w, i + 1)) {
      const end = i + w.length;
      if (!free(i, end)) continue;
      if (whole && (isW(he[i - 1]) || isW(he[end]))) continue;
      return i;
    }
    return -1;
  };
  let cursor = 0;
  tags.forEach((t, k) => {
    if (!t.w) return;
    let i = find(t.w, cursor, true);
    if (i < 0) i = find(t.w, 0, true);
    if (i < 0) i = find(t.w, cursor, false);
    if (i < 0) i = find(t.w, 0, false);
    if (i < 0) return;
    taken.push([i, i + t.w.length, k]);
    cursor = i + t.w.length;
  });
  taken.sort((a, b) => a[0] - b[0]);
  const out: Segment[] = [];
  let pos = 0;
  for (const [a, b, k] of taken) {
    if (a > pos) out.push({ text: he.slice(pos, a) });
    out.push({ text: he.slice(a, b), tag: k });
    pos = b;
  }
  if (pos < he.length) out.push({ text: he.slice(pos) });
  return out;
}
