import { create } from "zustand";
import { loadCloud } from "../lib/cloud-loader";
import type { CloudUser } from "../lib/cloud";
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
}

function detach(set: (s: Partial<CloudStore>) => void) {
  unsubSnapshot?.();
  unsubSnapshot = null;
  setRemote(null);
  setCloudFlag(false);
  useProgress.getState().setSync("local");
  set({ status: "signed-out", user: null, pulled: false });
}

function fail(cloud: Cloud | null, e: unknown, set: (s: Partial<CloudStore>) => void) {
  const msg = cloud ? cloud.describeError(e) : "Sign-in failed.";
  set({ status: "error", error: msg });
  useUi.getState().showToast(msg);
}

async function watch(
  set: (s: Partial<CloudStore>) => void,
  get: () => CloudStore,
): Promise<void> {
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
    try {
      await cloud.signOut();
    } finally {
      detach(set);
    }
  },
}));
