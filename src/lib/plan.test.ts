import { describe, expect, it } from "vitest";
import { dailyPlan, planLabel } from "./plan";
import { ROOTS } from "../data/roots";
import { buildCourse } from "./course";
import { defaultProgress } from "./storage";
import { applyAnswer, DAY } from "./srs";

const course = buildCourse(ROOTS);
const now = Date.now();

describe("dailyPlan", () => {
  it("is just the next lesson for a new learner", () => {
    expect(dailyPlan(ROOTS, course, defaultProgress(), now)).toEqual([
      { kind: "lesson", unit: course.units[0].id },
    ]);
  });
  it("adds a review when roots are due and a tricky round when roots keep slipping", () => {
    const p = defaultProgress();
    p.roots[ROOTS[0].r] = applyAnswer(undefined, true, true, now - 2 * DAY);
    let t = applyAnswer(undefined, true, true, now);
    t = applyAnswer(t, false, true, now);
    t = applyAnswer(t, false, true, now);
    p.roots[ROOTS[1].r] = t;
    expect(dailyPlan(ROOTS, course, p, now).map((x) => planLabel(x))).toEqual([
      "Review",
      "Tricky roots",
      "Lesson",
    ]);
  });
});
