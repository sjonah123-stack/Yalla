import type { Progress, Root } from "../types";
import type { Course } from "./course";
import { currentUnit } from "./course";
import { isDue, seen, trickyRoots } from "./srs";
import type { Plan } from "../store/session";

/**
 * Today's session as a chain: due reviews, then tricky roots, then the next lesson. Only the
 * parts with something to do are included; a lesson is always last.
 */
export function dailyPlan(
  roots: readonly Root[],
  course: Course,
  p: Progress,
  now = Date.now(),
): Plan[] {
  const out: Plan[] = [];
  const due = roots.filter((r) => isDue(p.roots[r.r], now)).length;
  if (due > 0 && roots.some((r) => seen(p.roots[r.r]))) out.push({ kind: "practice" });
  if (trickyRoots(roots, p).length > 0) out.push({ kind: "practice", focus: "tricky" });
  out.push({ kind: "lesson", unit: currentUnit(course, p).id });
  return out;
}

/** Label for a chain step, for the summary's Continue button. */
export function planLabel(plan: Plan): string {
  switch (plan.kind) {
    case "practice":
      return plan.focus === "tricky" ? "Tricky roots" : "Review";
    case "lesson":
      return "Lesson";
    case "test":
      return "Test";
    case "placement":
      return "Placement";
    case "speed":
      return "Speed round";
  }
}
