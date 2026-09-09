import { describe, expect, it } from "vitest";
import { defaultProgress, mergeProgress, mergeUnit, normalize, pruneHistory } from "./storage";
import { newRootState } from "./srs";

describe("normalize", () => {
  it("migrates a v1 blob, filling new settings", () => {
    const v1 = {
      v: 1,
      xp: 420,
      streak: 3,
      lastPlay: "2026-01-02",
      roots: { כתב: { ...newRootState(), reps: 2 } },
      history: {},
      settings: { sessionLen: 20, newPerSession: 8, cats: ["time"], nikud: false },
      updatedAt: 5,
    };
    const p = normalize(v1);
    expect(p.v).toBe(3);
    expect(p.xp).toBe(420);
    expect(p.roots["כתב"].reps).toBe(2);
    expect(p.settings.nikud).toBe(false);
    expect(p.settings.cats).toEqual(["time"]);
    expect(p.settings.audio).toBe(true);
    expect(p.settings.theme).toBe("system");
    expect(p.settings.dailyGoal).toBe(50);
    expect("newPerSession" in p.settings).toBe(false);
    expect(p.units).toEqual({});
    expect(p.placement).toBeNull();
    expect(p.lastUnit).toBeNull();
  });
  it("migrates a v2 blob keeping roots, xp and streak", () => {
    const v2 = { ...defaultProgress(), v: 2, xp: 900, streak: 7, roots: { דבר: newRootState() } };
    const p = normalize(v2);
    expect(p.v).toBe(3);
    expect(p.xp).toBe(900);
    expect(p.streak).toBe(7);
    expect(p.roots["דבר"]).toBeDefined();
  });
  it("drops unit records and placement for unknown units", () => {
    const p = normalize({
      ...defaultProgress(),
      units: { "speech-1": { testBest: 95 }, "ghost-9": { testBest: 100 } },
      placement: { at: 1, startUnit: "ghost-9", score: 50 },
      lastUnit: "ghost-9",
    });
    expect(Object.keys(p.units)).toEqual(["speech-1"]);
    expect(p.placement).toBeNull();
    expect(p.lastUnit).toBeNull();
  });
  it("tolerates garbage", () => {
    expect(normalize(null).xp).toBe(0);
    expect(normalize("x").settings.sessionLen).toBe(20);
    expect(normalize({ settings: { dailyGoal: 7 } }).settings.dailyGoal).toBe(50);
  });
});

describe("mergeUnit", () => {
  it("keeps best test, best time, earliest completion, any placement", () => {
    const m = mergeUnit(
      { testBest: 80, matchBestMs: 30000, completedAt: 200 },
      { testBest: 95, matchBestMs: 25000, completedAt: 100, placed: true },
    );
    expect(m).toEqual({ testBest: 95, matchBestMs: 25000, completedAt: 100, placed: true });
    expect(mergeUnit(undefined, { testBest: 50 })).toEqual({ testBest: 50 });
  });
});

describe("mergeProgress", () => {
  it("keeps the more-practiced root from either side", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.roots["כתב"] = { ...newRootState(), ok: 5, reps: 3, ivl: 7, due: 100 };
    b.roots["כתב"] = { ...newRootState(), ok: 1, reps: 1, ivl: 1, due: 50 };
    b.roots["דבר"] = { ...newRootState(), ok: 2, reps: 2, ivl: 3, due: 60 };
    a.updatedAt = 1;
    b.updatedAt = 2;
    const m = mergeProgress(a, b);
    expect(m.roots["כתב"].reps).toBe(3);
    expect(m.roots["דבר"].reps).toBe(2);
    expect(mergeProgress(b, a).roots["כתב"].reps).toBe(3);
  });
  it("takes max xp, per-day max history, later streak, newer settings", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.xp = 300;
    b.xp = 200;
    a.history["2026-01-01"] = { ok: 5, bad: 1, xp: 50 };
    b.history["2026-01-01"] = { ok: 3, bad: 2, xp: 30, mem: 4 };
    b.history["2026-01-02"] = { ok: 1, bad: 0, xp: 10 };
    a.streak = 2;
    a.lastPlay = "2026-01-01";
    b.streak = 3;
    b.lastPlay = "2026-01-02";
    a.settings.nikud = false;
    a.updatedAt = 10;
    b.updatedAt = 5;
    const m = mergeProgress(a, b);
    expect(m.xp).toBe(300);
    expect(m.history["2026-01-01"]).toEqual({ ok: 5, bad: 2, xp: 50, mem: 4 });
    expect(m.history["2026-01-02"].xp).toBe(10);
    expect(m.streak).toBe(3);
    expect(m.settings.nikud).toBe(false);
  });
  it("merges units per id and keeps the earliest placement", () => {
    const a = defaultProgress();
    const b = defaultProgress();
    a.units["speech-1"] = { testBest: 70 };
    b.units["speech-1"] = { matchBestMs: 20000 };
    b.units["speech-2"] = { completedAt: 5 };
    a.placement = { at: 20, startUnit: "speech-2", score: 60 };
    b.placement = { at: 10, startUnit: "speech-1", score: 40 };
    const m = mergeProgress(a, b);
    expect(m.units["speech-1"]).toEqual({ testBest: 70, matchBestMs: 20000 });
    expect(m.units["speech-2"]).toEqual({ completedAt: 5 });
    expect(m.placement?.startUnit).toBe("speech-1");
  });
});

describe("pruneHistory", () => {
  it("keeps only the trailing N days", () => {
    const p = defaultProgress();
    for (let i = 0; i < 500; i++)
      p.history[
        `2020-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}x${i}`
      ] = { ok: 1, bad: 0, xp: 1 };
    expect(Object.keys(pruneHistory(p, 400).history)).toHaveLength(400);
  });
});

describe("normalize (rewards fields)", () => {
  it("fills reward defaults for a legacy blob", () => {
    const p = normalize({ v: 2, xp: 10, roots: {}, history: {}, settings: {}, updatedAt: 3 });
    expect(p.gems).toBe(0);
    expect(p.seals).toEqual({});
    expect(p.bestCombo).toBe(0);
    expect(p.perfectLessons).toBe(0);
    expect(p.typedOk).toBe(0);
    expect(p.sectionChests).toEqual({});
  });
  it("infers onboardedAt for legacy blobs: seen root → non-null, empty → null", () => {
    const seen = normalize({
      v: 2,
      roots: { כתב: { ...newRootState(), ok: 1 } },
      updatedAt: 77,
    });
    expect(seen.onboardedAt).toBe(77);
    const seenNoStamp = normalize({ v: 2, roots: { כתב: { ...newRootState(), bad: 1 } } });
    expect(seenNoStamp.onboardedAt).toBe(1);
    expect(normalize({ v: 2, lastUnit: "speech-1", updatedAt: 9 }).onboardedAt).toBe(9);
    expect(
      normalize({ v: 3, placement: { at: 1, startUnit: "speech-2", score: 50 }, updatedAt: 4 })
        .onboardedAt,
    ).toBe(4);
    expect(normalize({ v: 2, roots: { כתב: newRootState() } }).onboardedAt).toBeNull();
    expect(normalize(defaultProgress()).onboardedAt).toBeNull();
    expect(normalize({ ...defaultProgress(), onboardedAt: 123 }).onboardedAt).toBe(123);
  });
  it("drops unknown or non-numeric seals", () => {
    const p = normalize({
      ...defaultProgress(),
      seals: { "xp-500": 5, ghost: 6, "combo-5": "soon", "streak-3": null },
    });
    expect(p.seals).toEqual({ "xp-500": 5 });
  });
  it("drops unknown sections in sectionChests", () => {
    const p = normalize({
      ...defaultProgress(),
      sectionChests: { speech: 10, ghost: 11, movement: "x" },
    });
    expect(p.sectionChests).toEqual({ speech: 10 });
  });
  it("coerces negative, float and garbage counters", () => {
    const p = normalize({
      ...defaultProgress(),
      gems: -5,
      bestCombo: 3.7,
      perfectLessons: "2",
      typedOk: NaN,
    });
    expect(p.gems).toBe(0);
    expect(p.bestCombo).toBe(3);
    expect(p.perfectLessons).toBe(0);
    expect(p.typedOk).toBe(0);
    expect(normalize({ ...defaultProgress(), gems: 12.9 }).gems).toBe(12);
  });
  it("preserves chestAt on unit records", () => {
    const p = normalize({
      ...defaultProgress(),
      units: { "speech-1": { completedAt: 1, chestAt: 2 } },
    });
    expect(p.units["speech-1"]).toEqual({ completedAt: 1, chestAt: 2 });
  });
});

describe("mergeUnit chestAt", () => {
  it("keeps the earliest chest payout", () => {
    expect(mergeUnit({ chestAt: 30 }, { chestAt: 20 })).toEqual({ chestAt: 20 });
    expect(mergeUnit({ chestAt: 30 }, {})).toEqual({ chestAt: 30 });
    expect(mergeUnit({}, {})).toEqual({});
  });
});

describe("mergeProgress (rewards fields)", () => {
  it("takes max gems (not the sum) and max counters", () => {
    const a = { ...defaultProgress(), gems: 120, bestCombo: 4, perfectLessons: 1, typedOk: 9 };
    const b = { ...defaultProgress(), gems: 80, bestCombo: 7, perfectLessons: 3, typedOk: 2 };
    const m = mergeProgress(a, b);
    expect(m.gems).toBe(120);
    expect(m.bestCombo).toBe(7);
    expect(m.perfectLessons).toBe(3);
    expect(m.typedOk).toBe(9);
  });
  it("unions seals and sectionChests keeping the earliest timestamp", () => {
    const a = {
      ...defaultProgress(),
      seals: { "xp-500": 50, "first-root": 5 },
      sectionChests: { speech: 100, movement: 300 },
    };
    const b = {
      ...defaultProgress(),
      seals: { "xp-500": 40, "combo-5": 60 },
      sectionChests: { speech: 200, time: 150 },
    };
    const m = mergeProgress(a, b);
    expect(m.seals).toEqual({ "xp-500": 40, "first-root": 5, "combo-5": 60 });
    expect(m.sectionChests).toEqual({ speech: 100, movement: 300, time: 150 });
  });
  it("keeps the earliest onboardedAt; null only when both are null", () => {
    const a = { ...defaultProgress(), onboardedAt: 20 };
    const b = { ...defaultProgress(), onboardedAt: 10 };
    expect(mergeProgress(a, b).onboardedAt).toBe(10);
    expect(mergeProgress(a, defaultProgress()).onboardedAt).toBe(20);
    expect(mergeProgress(defaultProgress(), b).onboardedAt).toBe(10);
    expect(mergeProgress(defaultProgress(), defaultProgress()).onboardedAt).toBeNull();
  });
});

// ---------- Cloud sync ----------
import { vi } from "vitest";
import {
  applyIncoming,
  decodeDoc,
  encodeDoc,
  lastPushedUpdatedAt,
  PUSH_DELAY,
  pushRemote,
  reconcileSignIn,
  remoteConnected,
  replacePending,
  setRemote,
  type RemoteBackend,
} from "./storage";

const withXp = (xp: number, updatedAt = xp) => ({ ...defaultProgress(), xp, updatedAt });

describe("mergeProgress (reset epochs)", () => {
  it("lets the newer resetAt win wholesale", () => {
    const old = { ...withXp(500), roots: { כתב: newRootState() } };
    const wiped = { ...defaultProgress(), resetAt: 1000, updatedAt: 1 };
    expect(mergeProgress(old, wiped)).toEqual(wiped);
    expect(mergeProgress(wiped, old)).toEqual(wiped);
  });
  it("merges field-wise when epochs are equal and keeps the epoch", () => {
    const a = { ...withXp(10), resetAt: 7 };
    const b = { ...withXp(20), resetAt: 7 };
    const m = mergeProgress(a, b);
    expect(m.xp).toBe(20);
    expect(m.resetAt).toBe(7);
  });
  it("normalize coerces resetAt", () => {
    expect(normalize({ v: 3 }).resetAt).toBe(0);
    expect(normalize({ v: 3, resetAt: -5 }).resetAt).toBe(0);
    expect(normalize({ v: 3, resetAt: 12.7 }).resetAt).toBe(12);
  });
});

describe("cloud document", () => {
  it("round-trips through encodeDoc/decodeDoc", () => {
    const p = {
      ...withXp(42),
      roots: { שכר2: newRootState() },
      history: { "2026-09-09": { ok: 1, bad: 0, xp: 5 } },
    };
    const d = encodeDoc(p);
    expect(d).toMatchObject({ v: 3, updatedAt: 42, resetAt: 0 });
    expect(decodeDoc(d)).toEqual(p);
  });
  it("rejects malformed documents", () => {
    expect(decodeDoc(null)).toBeNull();
    expect(decodeDoc({ v: 3 })).toBeNull();
    expect(decodeDoc({ json: "{not json" })).toBeNull();
  });
});

describe("reconcileSignIn", () => {
  const local = withXp(10);
  const cloud = withXp(20);
  it("merges on a device that never synced", () => {
    const r = reconcileSignIn(local, cloud, null, "u1");
    expect(r.mode).toBe("merge");
    expect(r.p.xp).toBe(20);
  });
  it("merges when the same account returns", () => {
    expect(reconcileSignIn(local, cloud, "u1", "u1").mode).toBe("merge");
  });
  it("replaces local with cloud for a different account", () => {
    const r = reconcileSignIn({ ...local, xp: 999 }, cloud, "u1", "u2");
    expect(r.mode).toBe("replace");
    expect(r.p).toEqual(cloud);
  });
  it("uploads local when the cloud is empty for this device's account", () => {
    expect(reconcileSignIn(local, null, null, "u1")).toEqual({ p: local, mode: "upload" });
    expect(reconcileSignIn(local, null, "u1", "u1").mode).toBe("upload");
  });
  it("starts fresh when the cloud is empty and the device belonged to someone else", () => {
    const r = reconcileSignIn(local, null, "u1", "u2");
    expect(r.mode).toBe("fresh");
    expect(r.p.xp).toBe(0);
    expect(r.p.onboardedAt).toBeNull();
  });
});

describe("applyIncoming", () => {
  const local = withXp(10);
  it("ignores echoes of our own writes", () => {
    expect(applyIncoming(local, withXp(20), 0, true)).toBeNull();
    expect(applyIncoming(local, withXp(20), 20, false)).toBeNull();
  });
  it("merges a genuinely remote change", () => {
    expect(applyIncoming(local, withXp(20), 5, false)?.xp).toBe(20);
  });
  it("returns null when the merge changes nothing", () => {
    expect(applyIncoming(withXp(30), withXp(20), 5, false)).toBeNull();
  });
});

describe("remote backend seam", () => {
  const fake = () => {
    const saved: unknown[] = [];
    const backend: RemoteBackend & { saved: unknown[]; fail: boolean } = {
      saved,
      fail: false,
      load: async () => null,
      save: async (p) => {
        if (backend.fail) throw new Error("boom");
        saved.push(p);
      },
    };
    return backend;
  };
  it("resolves local when nothing is attached", async () => {
    setRemote(null);
    expect(remoteConnected()).toBe(false);
    await expect(pushRemote(withXp(1))).resolves.toBe("local");
  });
  it("coalesces rapid pushes into the last record after the delay", async () => {
    vi.useFakeTimers();
    const b = fake();
    setRemote(b);
    pushRemote(withXp(1));
    pushRemote(withXp(2));
    const last = pushRemote(withXp(3));
    expect(b.saved).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(PUSH_DELAY);
    await expect(last).resolves.toBe("synced");
    expect(b.saved).toEqual([withXp(3)]);
    expect(lastPushedUpdatedAt()).toBe(3);
    vi.useRealTimers();
    setRemote(null);
  });
  it("pushes immediately on request and reports errors", async () => {
    const b = fake();
    setRemote(b);
    await expect(pushRemote(withXp(4), true)).resolves.toBe("synced");
    b.fail = true;
    await expect(pushRemote(withXp(5), true)).resolves.toBe("error");
    setRemote(null);
  });
  it("swaps a queued payload and cancels on detach", async () => {
    vi.useFakeTimers();
    const b = fake();
    setRemote(b);
    pushRemote(withXp(6));
    replacePending(withXp(7));
    await vi.advanceTimersByTimeAsync(PUSH_DELAY);
    expect(b.saved).toEqual([withXp(7)]);
    pushRemote(withXp(8));
    setRemote(null);
    await vi.advanceTimersByTimeAsync(PUSH_DELAY);
    expect(b.saved).toHaveLength(1);
    vi.useRealTimers();
  });
});
