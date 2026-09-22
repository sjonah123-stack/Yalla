// Mini stories: graded reading passages built from bank roots. One file per section group.
import type { Story } from "./types";
import { STORIES_A } from "./a";
import { STORIES_B } from "./b";
import { STORIES_C } from "./c";

export type { Story, StoryLine, StoryQuestion, StoryTag } from "./types";
export const STORIES: readonly Story[] = [...STORIES_A, ...STORIES_B, ...STORIES_C];

/** Root ids a story uses (from its tags), de-duplicated in order of appearance. */
export const storyRoots = (s: Story): string[] => [
  ...new Set(s.lines.flatMap((l) => l.tags.map((t) => t.r))),
];
