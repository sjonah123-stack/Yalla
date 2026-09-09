import type { UnitId } from "../types";

/**
 * The course: section order and unit order. Unit *membership* lives on each root (`root.unit`).
 * Rules: unit ids are never renamed or reused; growing a section appends serials to `units`.
 */
export interface SectionDef {
  id: string;
  /** The `cat` value roots in this section carry. */
  cat: string;
  title: string;
  /** Hebrew title. */
  he: string;
  units: readonly UnitId[];
}

export const SECTIONS: readonly SectionDef[] = [
  { id: "speech", cat: "speech", title: "Speech", he: "דיבור", units: ["speech-1", "speech-2"] },
  {
    id: "movement",
    cat: "movement",
    title: "Movement",
    he: "תנועה",
    units: ["movement-1", "movement-2", "movement-3"],
  },
  {
    id: "senses",
    cat: "senses & mind",
    title: "Senses & mind",
    he: "חושים ומחשבה",
    units: ["senses-1", "senses-2"],
  },
  {
    id: "home",
    cat: "home & daily life",
    title: "Home & daily life",
    he: "בית ויום־יום",
    units: ["home-1", "home-2"],
  },
  { id: "people", cat: "people", title: "People", he: "אנשים", units: ["people-1"] },
  { id: "time", cat: "time", title: "Time", he: "זמן", units: ["time-1"] },
  { id: "feelings", cat: "feelings", title: "Feelings", he: "רגשות", units: ["feelings-1"] },
  {
    id: "work",
    cat: "work & money",
    title: "Work & money",
    he: "עבודה וכסף",
    units: ["work-1", "work-2"],
  },
  { id: "food", cat: "food & body", title: "Food & body", he: "אוכל וגוף", units: ["food-1"] },
  {
    id: "size",
    cat: "size & change",
    title: "Size & change",
    he: "גודל ושינוי",
    units: ["size-1", "size-2", "size-3"],
  },
  { id: "nature", cat: "nature", title: "Nature", he: "טבע", units: ["nature-1", "nature-2"] },
  {
    id: "law",
    cat: "law & state",
    title: "Law & state",
    he: "חוק ומדינה",
    units: ["law-1", "law-2"],
  },
  {
    id: "jewish",
    cat: "Jewish life",
    title: "Jewish life",
    he: "חיים יהודיים",
    units: ["jewish-1"],
  },
  { id: "culture", cat: "culture", title: "Culture", he: "תרבות", units: ["culture-1"] },
  // Batch 2 (v0.5): appended so every earlier unit keeps its place on the path.
  {
    id: "body",
    cat: "body & health",
    title: "Body & health",
    he: "גוף ובריאות",
    units: ["body-1", "body-2", "body-3"],
  },
  {
    id: "clothing",
    cat: "clothing & objects",
    title: "Clothing & objects",
    he: "בגדים וחפצים",
    units: ["clothing-1", "clothing-2"],
  },
  {
    id: "weather",
    cat: "weather & seasons",
    title: "Weather & seasons",
    he: "מזג אוויר ועונות",
    units: ["weather-1", "weather-2"],
  },
  {
    id: "tech",
    cat: "technology & media",
    title: "Technology & media",
    he: "טכנולוגיה ותקשורת",
    units: ["tech-1", "tech-2", "tech-3"],
  },
  {
    id: "education",
    cat: "education",
    title: "Education",
    he: "חינוך ולימוד",
    units: ["education-1", "education-2", "education-3"],
  },
  {
    id: "military",
    cat: "military & security",
    title: "Military & security",
    he: "צבא וביטחון",
    units: ["military-1", "military-2", "military-3"],
  },
];

/** Unit ids that once existed. Progress records for them are dropped on load. */
export const RETIRED_UNITS: ReadonlySet<UnitId> = new Set<UnitId>();

export const SECTION_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
);
export const SECTION_BY_CAT: Record<string, SectionDef> = Object.fromEntries(
  SECTIONS.map((s) => [s.cat, s]),
);
/** Every unit id in path order. */
export const UNIT_IDS: readonly UnitId[] = SECTIONS.flatMap((s) => s.units);
