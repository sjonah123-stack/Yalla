import { ROOTS } from "../data/roots";
import { buildCourse } from "../lib/course";

/** The course built from the full bank, shared by stores and views. */
export const COURSE = buildCourse(ROOTS);
