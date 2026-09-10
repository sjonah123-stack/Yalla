// Example sentences, keyed by the exact vocalized word from the root bank. One file per section
// group; each sentence contains the key word verbatim so a cloze can blank it.
import type { Sentence } from "../../types";
import { S_A } from "./a";
import { S_B } from "./b";
import { S_C } from "./c";

export const SENTENCES: Readonly<Record<string, Sentence>> = { ...S_A, ...S_B, ...S_C };
