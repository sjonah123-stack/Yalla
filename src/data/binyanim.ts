import type { Binyan } from "../types";

export interface BinyanInfo {
  id: Binyan;
  /** Hebrew name, vocalized. */
  he: string;
  /** Pattern skeleton on the root פ.ע.ל. */
  skeleton: string;
  /** One-line semantic gloss. */
  gloss: string;
  /** Voice / valence note. */
  note: string;
  /** Example root & word from the bank, for the Patterns view. */
  example: { root: string; word: string; gloss: string };
}

export const BINYANIM: readonly BinyanInfo[] = [
  {
    id: "pa'al",
    he: "פָּעַל",
    skeleton: "פָּעַל",
    gloss: "simple action",
    note: "The basic, unmarked verb. Most common; active voice.",
    example: { root: "כתב", word: "כָּתַב", gloss: "he wrote" },
  },
  {
    id: "nif'al",
    he: "נִפְעַל",
    skeleton: "נִפְעַל",
    gloss: "passive or reflexive of pa'al",
    note: "Marked by the נ prefix. 'Was done' or 'did to oneself'.",
    example: { root: "כתב", word: "נִכְתַּב", gloss: "was written" },
  },
  {
    id: "pi'el",
    he: "פִּעֵל",
    skeleton: "פִּעֵל",
    gloss: "intensive or causative action",
    note: "Doubled middle letter (dagesh). Often transitive; many modern loan-verbs land here.",
    example: { root: "דבר", word: "דִּבֵּר", gloss: "he spoke" },
  },
  {
    id: "pu'al",
    he: "פֻּעַל",
    skeleton: "פֻּעַל",
    gloss: "passive of pi'el",
    note: "Same doubled middle letter, with the u-vowel. 'Was intensively done'.",
    example: { root: "ספר", word: "סֻפַּר", gloss: "was told" },
  },
  {
    id: "hif'il",
    he: "הִפְעִיל",
    skeleton: "הִפְעִיל",
    gloss: "causative",
    note: "The ה prefix and i-vowel. 'Made someone do' — or an entry into a state.",
    example: { root: "כנס", word: "הִכְנִיס", gloss: "he brought in" },
  },
  {
    id: "huf'al",
    he: "הֻפְעַל",
    skeleton: "הֻפְעַל",
    gloss: "passive of hif'il",
    note: "The ה prefix with the u-vowel. 'Was made to'.",
    example: { root: "כנס", word: "הֻכְנַס", gloss: "was brought in" },
  },
  {
    id: "hitpa'el",
    he: "הִתְפַּעֵל",
    skeleton: "הִתְפַּעֵל",
    gloss: "reflexive or reciprocal",
    note: "The הת prefix. Doing to oneself, or to each other; also 'becoming'.",
    example: { root: "לבש", word: "הִתְלַבֵּשׁ", gloss: "he got dressed" },
  },
];

export const BINYAN_IDS: readonly Binyan[] = BINYANIM.map((b) => b.id);
export const BINYAN_BY_ID: Record<Binyan, BinyanInfo> = Object.fromEntries(
  BINYANIM.map((b) => [b.id, b]),
) as Record<Binyan, BinyanInfo>;

export const isBinyan = (b: string): b is Binyan => (BINYAN_IDS as readonly string[]).includes(b);
