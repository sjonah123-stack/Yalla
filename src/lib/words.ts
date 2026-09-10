import type { Progress, WordStat } from "../types";

/** A word counts as known after two right answers with more rights than wrongs. */
export const isKnownWord = (st?: WordStat): boolean => !!st && st.ok >= 2 && st.ok > st.bad;

/** The set of known vocalized words. */
export function knownWords(p: Pick<Progress, "words">): Set<string> {
  const out = new Set<string>();
  for (const [h, st] of Object.entries(p.words)) if (isKnownWord(st)) out.add(h);
  return out;
}
