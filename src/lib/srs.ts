import type { Progress, Root, RootState } from "../types";

export const DAY = 86_400_000;

/** Local-calendar day key, YYYY-MM-DD. (Not UTC — the streak must roll over at local midnight.) */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The day key `n` days before (or after, if negative) the given date, in local time. */
export function shiftDay(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export const newRootState = (): RootState => ({
  ease: 2.5,
  ivl: 0,
  due: 0,
  reps: 0,
  lapses: 0,
  ok: 0,
  bad: 0,
});

export const seen = (st?: RootState): boolean => !!st && st.ok + st.bad > 0;

/** Mastery 0–5, derived from the current interval. */
export function mastery(st?: RootState): number {
  if (!st || st.reps === 0) return 0;
  const i = st.ivl;
  return i >= 30 ? 5 : i >= 15 ? 4 : i >= 7 ? 3 : i >= 3 ? 2 : 1;
}

export const isDue = (st: RootState | undefined, now: number): boolean =>
  !!st && st.reps > 0 && st.due <= now;

/**
 * SM-2-flavored update. Returns a new state.
 * First-attempt correct: reps++, interval 1 → 3 → ivl*ease, ease +0.05 (max 3).
 * Retry correct: partial credit, back tomorrow.
 * Miss: reset, ease -0.2 (min 1.3), due now.
 */
export function applyAnswer(
  prev: RootState | undefined,
  correct: boolean,
  firstAttempt: boolean,
  now: number,
): RootState {
  const r = { ...(prev ?? newRootState()) };
  if (correct) {
    r.ok++;
    if (r.reps === 0) {
      // First right answer, or the first after a miss: (re)learned, back tomorrow.
      r.reps = 1;
      r.ivl = 1;
      r.due = now + DAY;
    } else if (firstAttempt && r.due <= now) {
      // A first-try right answer once the root is due advances it: 1 → 3 → ivl × ease days.
      // "Memorized" (interval ≥ 3) therefore needs a right answer on a later day, never twice
      // in one sitting.
      r.reps++;
      r.ivl = r.reps === 2 ? 3 : Math.round(r.ivl * r.ease);
      r.ease = Math.min(3, r.ease + 0.05);
      r.due = now + r.ivl * DAY;
    }
    // Otherwise a same-session drill or an early review: credit only, the schedule stands.
  } else {
    r.bad++;
    r.lapses++;
    r.reps = 0;
    r.ivl = 0;
    r.ease = Math.max(1.3, r.ease - 0.2);
    r.due = now;
  }
  return r;
}

/** Streak bookkeeping for a play event on `today`. Call only on a correct answer. */
export function touchStreak(
  streak: number,
  lastPlay: string | null,
  today: Date = new Date(),
): { streak: number; lastPlay: string } {
  const t = dayKey(today);
  if (lastPlay === t) return { streak, lastPlay: t };
  const y = dayKey(shiftDay(today, -1));
  return { streak: lastPlay === y ? streak + 1 : 1, lastPlay: t };
}

/** A streak is "alive" if the user played today or yesterday. */
export function streakAlive(lastPlay: string | null, today: Date = new Date()): boolean {
  if (!lastPlay) return false;
  return lastPlay === dayKey(today) || lastPlay === dayKey(shiftDay(today, -1));
}

export const level = (xp: number): number => Math.floor(Math.sqrt(xp / 100)) + 1;

// ---------- Tricky roots: the ones that keep slipping ----------

/** Lapses before a root counts as tricky. */
export const TRICKY_LAPSES = 2;
/** Mastery at which a tricky root has proven itself again (interval ≥ 7 days). */
export const TRICKY_CLEAR = 3;

/** Missed at least twice and not yet re-proven. Unseen and placement-prescheduled roots never are. */
export const isTricky = (st?: RootState): boolean =>
  !!st && st.lapses >= TRICKY_LAPSES && mastery(st) < TRICKY_CLEAR;

/** Tricky roots, most troubled first (lapses desc, then soonest due). */
export function trickyRoots(roots: readonly Root[], p: Pick<Progress, "roots">): Root[] {
  const st = (r: Root) => p.roots[r.r];
  return roots
    .filter((r) => isTricky(st(r)))
    .sort((a, b) => st(b)!.lapses - st(a)!.lapses || st(a)!.due - st(b)!.due);
}

/**
 * A practice restricted to tricky roots. When the set fits twice in `len` every root gets a
 * first try and a later drill (two shuffled passes, no adjacent repeat); otherwise one pass
 * capped at `len`. Ignores the theme filter on purpose: what Home counts, the round drills.
 */
export function trickyQueue(
  roots: readonly Root[],
  p: Pick<Progress, "roots">,
  len: number,
): Root[] {
  const t = trickyRoots(roots, p);
  if (!t.length) return [];
  if (t.length * 2 > len) return shuffle(t).slice(0, len);
  const first = shuffle(t);
  let second = shuffle(t);
  for (let tries = 0; tries < 10 && second[0] === first[first.length - 1]; tries++)
    second = shuffle(t);
  if (second[0] === first[first.length - 1] && second.length > 1)
    [second[0], second[1]] = [second[1], second[0]];
  return [...first, ...second];
}

// ---------- Milestones crossed by a session ----------

export interface XpSnapshot {
  xp: number;
  /** XP earned today (local day). */
  todayXp: number;
}
export interface Crossings {
  /** New level reached during the span, or null. */
  level: number | null;
  /** Today's goal was met during the span. */
  goal: boolean;
}
export function crossings(before: XpSnapshot, after: XpSnapshot, goal: number): Crossings {
  const la = level(after.xp);
  return {
    level: la > level(before.xp) ? la : null,
    goal: before.todayXp < goal && after.todayXp >= goal,
  };
}
export const levelFloor = (l: number): number => 100 * (l - 1) * (l - 1);
export const levelCeil = (l: number): number => 100 * l * l;

const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function pool(roots: readonly Root[], cats: readonly string[]): Root[] {
  return cats.length ? roots.filter((r) => cats.includes(r.cat)) : roots.slice();
}

/**
 * Due-first, then up to `newPerSession` unseen roots (most frequent tier first),
 * then lowest-mastery filler. Shuffled.
 */
export function buildQueue(
  roots: readonly Root[],
  progress: Pick<Progress, "roots" | "settings">,
  len: number,
  newPerSession = 0,
  now: number = Date.now(),
): Root[] {
  const P = pool(roots, progress.settings.cats);
  const st = (r: Root) => progress.roots[r.r];
  const due = P.filter((r) => isDue(st(r), now)).sort((a, b) => st(a)!.due - st(b)!.due);
  const fresh = shuffle(P.filter((r) => !seen(st(r)))).sort((a, b) => a.rank - b.rank);
  const q: Root[] = due.slice(0, len);
  let added = 0;
  for (const r of fresh) {
    if (q.length >= len || added >= newPerSession) break;
    q.push(r);
    added++;
  }
  // Filler: seen roots, weakest first. Unseen roots only if there's nothing else,
  // so the new-per-session cap actually holds once the learner has a base.
  if (q.length < len) {
    const rest = shuffle(P.filter((r) => !q.includes(r) && seen(st(r)))).sort(
      (a, b) => mastery(st(a)) - mastery(st(b)),
    );
    for (const r of rest) {
      if (q.length >= len) break;
      q.push(r);
    }
  }
  if (q.length < len) {
    for (const r of fresh) {
      if (q.length >= len) break;
      if (!q.includes(r)) q.push(r);
    }
  }
  return shuffle(q);
}
