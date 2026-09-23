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
  /** How to recognise the pattern at a glance. */
  spot: string;
  /** One root through the tenses: past (he), present (m. sg.), future (he), infinitive. */
  forms: { root: string; past: string; present: string; future: string; inf?: string };
  /** What the pattern tends to mean, each with a real verb. */
  uses: readonly { what: string; he: string; en: string }[];
}

export const BINYANIM: readonly BinyanInfo[] = [
  {
    id: "pa'al",
    he: "פָּעַל",
    skeleton: "פָּעַל",
    gloss: "simple action",
    note: "The basic, unmarked verb. Most common; active voice.",
    example: { root: "כתב", word: "כָּתַב", gloss: "he wrote" },
    spot: "No prefix and no doubled letter: a–a in the past (כָּתַב), o–e in the present (כּוֹתֵב).",
    forms: { root: "כתב", past: "כָּתַב", present: "כּוֹתֵב", future: "יִכְתֹּב", inf: "לִכְתֹּב" },
    uses: [
      { what: "Plain, everyday actions", he: "אָכַל", en: "he ate" },
      { what: "Going and moving", he: "הָלַךְ", en: "he went" },
      { what: "Some states and changes", he: "גָּדַל", en: "he grew" },
    ],
  },
  {
    id: "nif'al",
    he: "נִפְעַל",
    skeleton: "נִפְעַל",
    gloss: "passive or reflexive of pa'al",
    note: "Marked by the נ prefix. 'Was done' or 'did to oneself'.",
    example: { root: "כתב", word: "נִכְתַּב", gloss: "was written" },
    spot: "A נִ in front of the root: נִכְתַּב. The present keeps it, with an a-vowel: נִכְתָּב.",
    forms: {
      root: "כתב",
      past: "נִכְתַּב",
      present: "נִכְתָּב",
      future: "יִכָּתֵב",
      inf: "לְהִכָּתֵב",
    },
    uses: [
      { what: "The passive of pa'al", he: "נִכְתַּב", en: "it was written" },
      { what: "Things that happen to you", he: "נִבְהַל", en: "he got scared" },
      { what: "A few plain actions", he: "נִכְנַס", en: "he went in" },
    ],
  },
  {
    id: "pi'el",
    he: "פִּעֵל",
    skeleton: "פִּעֵל",
    gloss: "intensive or causative action",
    note: "Doubled middle letter (dagesh). Often transitive; many modern loan-verbs land here.",
    example: { root: "דבר", word: "דִּבֵּר", gloss: "he spoke" },
    spot: "i–e vowels and a dot (dagesh) in the middle letter: דִּבֵּר. The present starts with מְ: מְדַבֵּר.",
    forms: {
      root: "דבר",
      past: "דִּבֵּר",
      present: "מְדַבֵּר",
      future: "יְדַבֵּר",
      inf: "לְדַבֵּר",
    },
    uses: [
      { what: "Busy, everyday activities", he: "סִפֵּר", en: "he told" },
      { what: "Stronger than pa'al: שָׁבַר broke", he: "שִׁבֵּר", en: "he smashed" },
      { what: "Verbs made from nouns: צֶלֶם image", he: "צִלֵּם", en: "he photographed" },
    ],
  },
  {
    id: "pu'al",
    he: "פֻּעַל",
    skeleton: "פֻּעַל",
    gloss: "passive of pi'el",
    note: "Same doubled middle letter, with the u-vowel. 'Was intensively done'.",
    example: { root: "ספר", word: "סֻפַּר", gloss: "was told" },
    spot: "u–a vowels with the doubled middle letter: סֻפַּר. The present starts with מְ: מְסֻדָּר.",
    forms: { root: "ספר", past: "סֻפַּר", present: "מְסֻפָּר", future: "יְסֻפַּר" },
    uses: [
      { what: "The passive of pi'el", he: "סֻפַּר", en: "it was told" },
      { what: "Mostly met as adjectives", he: "מְסֻדָּר", en: "organized, tidy" },
    ],
  },
  {
    id: "hif'il",
    he: "הִפְעִיל",
    skeleton: "הִפְעִיל",
    gloss: "causative",
    note: "The ה prefix and i-vowel. 'Made someone do' — or an entry into a state.",
    example: { root: "כנס", word: "הִכְנִיס", gloss: "he brought in" },
    spot: "A הִ in front and an ee (י) before the last letter: הִכְנִיס. The present starts with מַ: מַכְנִיס.",
    forms: {
      root: "כנס",
      past: "הִכְנִיס",
      present: "מַכְנִיס",
      future: "יַכְנִיס",
      inf: "לְהַכְנִיס",
    },
    uses: [
      { what: "Making someone do it: נִכְנַס went in", he: "הִכְנִיס", en: "he brought in" },
      { what: "Getting into a state", he: "הִצְלִיחַ", en: "he succeeded" },
      { what: "Telling and showing", he: "הִסְבִּיר", en: "he explained" },
    ],
  },
  {
    id: "huf'al",
    he: "הֻפְעַל",
    skeleton: "הֻפְעַל",
    gloss: "passive of hif'il",
    note: "The ה prefix with the u-vowel. 'Was made to'.",
    example: { root: "כנס", word: "הֻכְנַס", gloss: "was brought in" },
    spot: "A הֻ in front with a u-vowel: הֻכְנַס. The present starts with מֻ: מֻכְנָס.",
    forms: { root: "כנס", past: "הֻכְנַס", present: "מֻכְנָס", future: "יֻכְנַס" },
    uses: [
      { what: "The passive of hif'il: הִזְמִין invited", he: "הֻזְמַן", en: "he was invited" },
      { what: "Present forms as adjectives", he: "מֻכָּר", en: "familiar, known" },
    ],
  },
  {
    id: "hitpa'el",
    he: "הִתְפַּעֵל",
    skeleton: "הִתְפַּעֵל",
    gloss: "reflexive or reciprocal",
    note: "The הת prefix. Doing to oneself, or to each other; also 'becoming'.",
    example: { root: "לבש", word: "הִתְלַבֵּשׁ", gloss: "he got dressed" },
    spot: "A הִתְ in front and i–a–e vowels: הִתְלַבֵּשׁ; present מִתְ. Before ס שׁ צ ז the ת swaps in: הִסְתַּכֵּל.",
    forms: {
      root: "לבש",
      past: "הִתְלַבֵּשׁ",
      present: "מִתְלַבֵּשׁ",
      future: "יִתְלַבֵּשׁ",
      inf: "לְהִתְלַבֵּשׁ",
    },
    uses: [
      { what: "Doing it to yourself", he: "הִתְלַבֵּשׁ", en: "he got dressed" },
      { what: "Doing it to each other", he: "הִתְכַּתֵּב", en: "he corresponded" },
      { what: "Becoming", he: "הִתְבַּגֵּר", en: "he grew up" },
    ],
  },
];

export const BINYAN_IDS: readonly Binyan[] = BINYANIM.map((b) => b.id);
export const BINYAN_BY_ID: Record<Binyan, BinyanInfo> = Object.fromEntries(
  BINYANIM.map((b) => [b.id, b]),
) as Record<Binyan, BinyanInfo>;

export const isBinyan = (b: string): b is Binyan => (BINYAN_IDS as readonly string[]).includes(b);
