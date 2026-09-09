// Yalla root bank, one file per section, concatenated in course order.
// Each root: r (letters; digit suffix distinguishes homographs), m (core meaning), short (one-sense label),
// rank (usefulness within section), cat (theme), unit (course unit id), words[] {h, t, g, b}, optional note.
import type { Root } from "../../types";
import { SPEECH } from "./speech";
import { MOVEMENT } from "./movement";
import { SENSES } from "./senses";
import { HOME } from "./home";
import { PEOPLE } from "./people";
import { TIME } from "./time";
import { FEELINGS } from "./feelings";
import { WORK } from "./work";
import { FOOD } from "./food";
import { SIZE } from "./size";
import { NATURE } from "./nature";
import { LAW } from "./law";
import { JEWISH } from "./jewish";
import { CULTURE } from "./culture";
import { BODY } from "./body";
import { CLOTHING } from "./clothing";
import { WEATHER } from "./weather";
import { TECH } from "./tech";
import { EDUCATION } from "./education";
import { MILITARY } from "./military";

export const ROOTS: readonly Root[] = [
  ...SPEECH,
  ...MOVEMENT,
  ...SENSES,
  ...HOME,
  ...PEOPLE,
  ...TIME,
  ...FEELINGS,
  ...WORK,
  ...FOOD,
  ...SIZE,
  ...NATURE,
  ...LAW,
  ...JEWISH,
  ...CULTURE,
  ...BODY,
  ...CLOTHING,
  ...WEATHER,
  ...TECH,
  ...EDUCATION,
  ...MILITARY,
];

export const ROOT_BY_ID: Record<string, Root> = Object.fromEntries(ROOTS.map((r) => [r.r, r]));
