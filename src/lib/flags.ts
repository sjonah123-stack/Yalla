import type { Progress, Root, RootFlag, FlagReason } from "../types";
import { SECTION_BY_CAT } from "../data/course";
import { rootLetters } from "./hebrew";

export const FLAG_LABEL: Record<FlagReason, string> = {
  gloss: "Wrong meaning",
  nikud: "Nikud or spelling",
  translit: "Transliteration",
  root: "Doesn't belong here",
  other: "Something else",
};

/** A flag is live until it is cleared (a clear newer than the flag). */
export const isActiveFlag = (f?: RootFlag): boolean => !!f && (f.cleared ?? 0) < f.at;

/** Live flags, newest first. */
export function activeFlags(p: Pick<Progress, "flags">): [string, RootFlag][] {
  return Object.entries(p.flags)
    .filter(([, f]) => isActiveFlag(f))
    .sort((a, b) => b[1].at - a[1].at);
}

/** A paste-able review block, one line per flag, grouped by section. */
export function flagsToText(p: Pick<Progress, "flags">, roots: readonly Root[]): string {
  const byId = new Map(roots.map((r) => [r.r, r]));
  const groups = new Map<string, string[]>();
  for (const [id, f] of activeFlags(p)) {
    const r = byId.get(id);
    const sec = r ? (SECTION_BY_CAT[r.cat]?.title ?? r.cat) : "unknown";
    const day = new Date(f.at).toISOString().slice(0, 10);
    const line = r
      ? `${rootLetters(r)} (${r.short}) · ${r.unit} · ${f.why}${f.note ? ` · "${f.note}"` : ""} · ${day}`
      : `${id} · ${f.why}${f.note ? ` · "${f.note}"` : ""} · ${day}`;
    (groups.get(sec) ?? groups.set(sec, []).get(sec)!).push(line);
  }
  return [...groups.entries()].map(([sec, lines]) => `## ${sec}\n${lines.join("\n")}`).join("\n\n");
}
