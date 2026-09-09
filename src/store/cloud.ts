import { create } from "zustand";
import { loadCloud } from "../lib/cloud-loader";
import type { CloudUser } from "../lib/cloud";
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
  /** Load the SDK if this device had a cloud session, and start watching auth. */
  boot: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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
  let remote = null;
  try {
    remote = await backend.load();
  } catch {
    /* offline first launch: treat as no cloud record */
  }
  const { p, mode } = reconcileSignIn(progress.p, remote, getLastUid(), user.uid);
  if (mode === "replace" || mode === "fresh") useSession.getState().clear();
  setRemote(backend);
  progress.adopt(p);
  setLastUid(user.uid);
  setCloudFlag(true);
  if (mode !== "replace") pushRemote(p, true).then((s) => progress.setSync(s));
  else progress.setSync("synced");
  unsubSnapshot?.();
  unsubSnapshot =
    backend.subscribe?.((incoming, hasPendingWrites) => {
      const local = useProgress.getState().p;
      const merged = applyIncoming(local, incoming, lastPushedUpdatedAt(), hasPendingWrites);
      if (!merged) return;
      useProgress.getState().adopt(merged);
      if (pushPending()) replacePending(merged);
    }) ?? null;
  set({ status: "signed-in", user, error: null });
}

function detach(set: (s: Partial<CloudStore>) => void) {
  unsubSnapshot?.();
  unsubSnapshot = null;
  setRemote(null);
  setCloudFlag(false);
  useProgress.getState().setSync("local");
  set({ status: "signed-out", user: null });
}

async function watch(set: (s: Partial<CloudStore>) => void): Promise<void> {
  const cloud = await sdk();
  if (!cloud || watching) return;
  watching = true;
  await cloud.watchAuth((user) => {
    if (user) attach(cloud, user, set).catch((e) => set({ status: "error", error: String(e) }));
    else detach(set);
  });
}

export const useCloud = create<CloudStore>((set, get) => ({
  status: "off",
  user: null,
  error: null,
  boot: async () => {
    if (!loadCloud) return;
    if (!cloudFlag()) return set({ status: "signed-out" });
    set({ status: "loading" });
    try {
      await watch(set);
    } catch (e) {
      set({ status: "error", error: String(e) });
    }
  },
  signIn: async () => {
    if (!loadCloud) return;
    set({ status: "signing-in", error: null });
    try {
      const cloud = await sdk();
      if (!cloud) return;
      // The flag must be set before a redirect leaves the page, so boot() preloads on return.
      setCloudFlag(true);
      await watch(set);
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
