import { create } from "zustand";
import { loadCloud } from "../lib/cloud-loader";
import type { CloudUser } from "../lib/cloud";
import { describePushError, type PushRemote } from "../lib/reminders";
import type { Progress } from "../types";
import {
  applyIncoming,
  cloudFlag,
  getLastUid,
  lastPushedUpdatedAt,
  pushPending,
  pushRemote,
  reconcileSignIn,
  replacePending,
  setCloudFlag,
  setLastUid,
  setRemote,
} from "../lib/storage";
import { useProgress } from "./progress";
import { useSession } from "./session";
import { useUi } from "./ui";

export type CloudStatus = "off" | "loading" | "signed-out" | "signing-in" | "signed-in" | "error";

interface CloudStore {
  /** "off" = no cloud in this build (artifact) or not loaded yet. */
  status: CloudStatus;
  user: CloudUser | null;
  error: string | null;
  /** Whether the account record has been loaded since sign-in. False = offline at sign-in. */
  pulled: boolean;
  /** Load the SDK if this device had a cloud session, and start watching auth. */
  boot: () => Promise<void>;
  /**
   * Load the SDK and start watching auth ahead of a likely Sign in tap (welcome screen,
   * settings sheet), so the tap itself opens Google's window without first waiting on the
   * network — Safari otherwise blocks it as a pop-up.
   */
  warm: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Retry a pull that failed at sign-in or a push that failed since; runs on reconnect. */
  resync: () => void;
  /** The account's daily-reminder doc as seen from this device; null until read. */
  push: PushRemote | null;
  /** A reminder change is in flight (permission prompt, subscribe, write). */
  reminderBusy: boolean;
  /** Re-read the reminder doc (Settings open, sign-in). Also moves its time zone along. */
  refreshPush: () => void;
  /**
   * Turn the daily reminder on, delivered to this device ("Send here" too). Call straight from
   * the tap: the notification prompt must open inside the user gesture.
   */
  enableReminder: (hour: number) => Promise<void>;
  disableReminder: () => Promise<void>;
  setReminderHour: (hour: number) => Promise<void>;
}

type Cloud = Awaited<ReturnType<NonNullable<typeof loadCloud>>>;
let mod: Cloud | null = null;
let unsubSnapshot: (() => void) | null = null;
let watching = false;

async function sdk(): Promise<Cloud | null> {
  if (!loadCloud) return null;
  if (!mod) mod = await loadCloud();
  return mod;
}

/** Sign-in landed: reconcile the device record with the cloud one and start syncing. */
async function attach(cloud: Cloud, user: CloudUser, set: (s: Partial<CloudStore>) => void) {
  const backend = cloud.firestoreBackend(user.uid);
  const progress = useProgress.getState();
  let remote: Progress | null;
  try {
    remote = await backend.load();
  } catch {
    // Offline: the account record is unknown, so nothing may be uploaded over it. Stay signed in
    // but local-only; resync() re-runs this once a connection is back.
    setCloudFlag(true);
    if (progress.p.onboardedAt === null) progress.adopt({ ...progress.p, onboardedAt: Date.now() });
    set({ status: "signed-in", user, error: null, pulled: false });
    return;
  }
  const { p, mode } = reconcileSignIn(progress.p, remote, getLastUid(), user.uid);
  if (mode === "replace" || mode === "fresh") useSession.getState().clear();
  setRemote(backend);
  // Signing in is onboarding: never leave a signed-in person on the welcome screen.
  const adopted = p.onboardedAt === null ? { ...p, onboardedAt: Date.now() } : p;
  progress.adopt(adopted);
  setLastUid(user.uid);
  setCloudFlag(true);
  if (mode !== "replace" || adopted !== p)
    pushRemote(adopted, true).then((s) => progress.setSync(s));
  else progress.setSync("synced");
  if (useUi.getState().view !== "play") useUi.getState().setView("home");
  unsubSnapshot?.();
  unsubSnapshot =
    backend.subscribe?.((incoming, hasPendingWrites) => {
      const local = useProgress.getState().p;
      const merged = applyIncoming(local, incoming, lastPushedUpdatedAt(), hasPendingWrites);
      if (!merged) return;
      useProgress.getState().adopt(merged);
      if (pushPending()) replacePending(merged);
    }) ?? null;
  set({ status: "signed-in", user, error: null, pulled: true });
  if (useProgress.getState().p.settings.reminders.on) useCloud.getState().refreshPush();
}

function detach(set: (s: Partial<CloudStore>) => void) {
  unsubSnapshot?.();
  unsubSnapshot = null;
  setRemote(null);
  setCloudFlag(false);
  useProgress.getState().setSync("local");
  set({ status: "signed-out", user: null, pulled: false, push: null });
}

const reminders = () => useProgress.getState().p.settings.reminders;
const setReminders = (r: { on: boolean; hour: number }) =>
  useProgress.getState().setSettings({ reminders: r });

function fail(cloud: Cloud | null, e: unknown, set: (s: Partial<CloudStore>) => void) {
  const msg = cloud ? cloud.describeError(e) : "Sign-in failed.";
  set({ status: "error", error: msg });
  useUi.getState().showToast(msg);
}

async function watch(set: (s: Partial<CloudStore>) => void, get: () => CloudStore): Promise<void> {
  const cloud = await sdk();
  if (!cloud || watching) return;
  watching = true;
  await cloud.watchAuth(
    (user) => {
      if (user) attach(cloud, user, set).catch((e) => fail(cloud, e, set));
      // The listener reports "nobody" once as soon as it starts. While a sign-in is in flight
      // that must not clear the cloud flag — a redirect leaves the page right after this, and
      // boot() only collects the result on return if the flag survived.
      else if (get().status !== "signing-in") detach(set);
    },
    (e) => fail(cloud, e, set),
  );
}

let listening = false;
function listen(resync: () => void) {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("online", resync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resync();
  });
}

export const useCloud = create<CloudStore>((set, get) => ({
  status: "off",
  user: null,
  error: null,
  pulled: false,
  push: null,
  reminderBusy: false,
  resync: () => {
    const { status, user, pulled } = get();
    if (status !== "signed-in" || !user || !mod) return;
    if (pulled && useProgress.getState().sync !== "error") return;
    if (!pulled) attach(mod, user, set).catch((e) => fail(mod, e, set));
    else pushRemote(useProgress.getState().p, true).then((s) => useProgress.getState().setSync(s));
  },
  boot: async () => {
    if (!loadCloud) return;
    listen(() => get().resync());
    if (!cloudFlag()) return set({ status: "signed-out" });
    set({ status: "loading" });
    try {
      await watch(set, get);
    } catch (e) {
      set({ status: "error", error: String(e) });
    }
  },
  warm: () => {
    if (!loadCloud || watching) return;
    watch(set, get).catch(() => {
      /* the tap will retry and report */
    });
  },
  signIn: async () => {
    if (!loadCloud) return;
    set({ status: "signing-in", error: null });
    try {
      const cloud = await sdk();
      if (!cloud) return;
      // The flag must be set before a redirect leaves the page, so boot() preloads on return.
      setCloudFlag(true);
      await watch(set, get);
      await cloud.signIn();
    } catch (e) {
      const cloud = mod;
      const msg = cloud ? cloud.describeError(e) : "Sign-in failed.";
      setCloudFlag(false);
      set({ status: get().user ? "signed-in" : "signed-out", error: msg });
      useUi.getState().showToast(msg);
    }
  },
  signOut: async () => {
    const cloud = mod;
    if (!cloud) return;
    const uid = get().user?.uid;
    try {
      // Stop reminders reaching a device nobody is signed in on. Best effort, and never holds
      // up sign-out for long (offline, or no service worker in dev).
      if (uid && reminders().on)
        await Promise.race([
          cloud.disablePush(uid, true).catch(() => undefined),
          new Promise((r) => setTimeout(r, 3000)),
        ]);
      await cloud.signOut();
    } finally {
      detach(set);
    }
  },
  refreshPush: () => {
    const { user, status } = get();
    const cloud = mod;
    if (!cloud || !user || status !== "signed-in") return;
    cloud.pushState(user.uid).then(
      (push) => get().user?.uid === user.uid && set({ push }),
      () => undefined,
    );
  },
  enableReminder: async (hour) => {
    const { user, status } = get();
    const cloud = mod;
    if (!cloud || !user || status !== "signed-in") {
      useUi.getState().showToast(describePushError({ code: "push/signed-out" }));
      return;
    }
    // Called before anything is awaited, so the permission prompt stays inside the tap.
    const job = cloud.enablePush(user.uid, hour);
    set({ reminderBusy: true });
    try {
      await job;
      setReminders({ on: true, hour });
      set({ push: { on: true, here: true } });
    } catch (e) {
      useUi.getState().showToast(describePushError(e));
    } finally {
      set({ reminderBusy: false });
    }
  },
  disableReminder: async () => {
    const was = reminders();
    setReminders({ ...was, on: false });
    const { user, status, push } = get();
    const cloud = mod;
    if (!cloud || !user || status !== "signed-in") return;
    set({ reminderBusy: true, push: push && { ...push, on: false } });
    try {
      await cloud.disablePush(user.uid);
    } catch (e) {
      // The doc is still on, so reminders would keep coming: show that rather than a false Off.
      setReminders(was);
      set({ push });
      useUi.getState().showToast(describePushError(e));
    } finally {
      set({ reminderBusy: false });
    }
  },
  setReminderHour: async (hour) => {
    const was = reminders();
    setReminders({ ...was, hour });
    const { user, status } = get();
    const cloud = mod;
    if (!was.on || !cloud || !user || status !== "signed-in") return;
    set({ reminderBusy: true });
    try {
      await cloud.setPushHour(user.uid, hour);
    } catch (e) {
      setReminders(was);
      useUi.getState().showToast(describePushError(e));
    } finally {
      set({ reminderBusy: false });
    }
  },
}));
