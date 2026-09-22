/**
 * Firebase-backed cloud sync: Google sign-in + one Firestore document per user.
 * This is the only module that imports the Firebase SDK; it is loaded lazily via cloud-loader.ts
 * and never bundled into the artifact build. Keep it thin — the decisions live in storage.ts.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getRedirectResult,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import { authDomainFor, firebaseConfig, VAPID_PUBLIC_KEY } from "./firebase-config";
import { keyBytes, sameBytes, type PushErrorCode, type PushRemote } from "./reminders";
import { decodeDoc, encodeDoc, type RemoteBackend } from "./storage";
import type { Progress } from "../types";

export interface CloudUser {
  uid: string;
  name: string | null;
  email: string | null;
  photo: string | null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let fs: Firestore | null = null;
let firstParty = false;

function init(): { auth: Auth; fs: Firestore } {
  if (!app) {
    const authDomain = authDomainFor(location.hostname);
    firstParty = authDomain === location.hostname;
    app = initializeApp({ ...firebaseConfig, authDomain });
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
    fs = initializeFirestore(app, { localCache: persistentLocalCache() });
  }
  return { auth: auth!, fs: fs! };
}

const toUser = (u: User): CloudUser => ({
  uid: u.uid,
  name: u.displayName,
  email: u.email,
  photo: u.photoURL,
});

/** Progress document for one user. */
export function firestoreBackend(uid: string): RemoteBackend {
  const { fs } = init();
  const ref = doc(fs, "users", uid);
  return {
    async load() {
      const snap = await getDoc(ref);
      return snap.exists() ? decodeDoc(snap.data()) : null;
    },
    save: (p: Progress) => setDoc(ref, encodeDoc(p)),
    subscribe(cb) {
      return onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const p = decodeDoc(snap.data());
        if (p) cb(p, snap.metadata.hasPendingWrites);
      });
    },
  };
}

/**
 * Start listening to auth state. Resolves any pending redirect sign-in first (reporting a
 * failure through `onRedirectError` instead of dropping it), then reports the current user
 * (null when signed out) on every change. Calling this early also warms the popup/redirect
 * resolver, so a later Sign in tap can open its window inside the click's user activation —
 * Safari blocks a popup that opens only after a network round-trip.
 */
export async function watchAuth(
  cb: (user: CloudUser | null) => void,
  onRedirectError?: (e: unknown) => void,
): Promise<() => void> {
  const { auth } = init();
  try {
    await getRedirectResult(auth);
  } catch (e) {
    onRedirectError?.(e);
  }
  return onAuthStateChanged(auth, (u) => cb(u ? toUser(u) : null));
}

// Only fall back to a redirect when the popup could not open at all; a popup the user closed
// (or one that showed a Google error) must not bounce the whole page to accounts.google.com.
const POPUP_FALLBACK = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
]);

const standalone = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches;
const touchDevice = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;

/**
 * Google sign-in. A redirect is the reliable flow on phones and in installed PWAs, but it only
 * completes when the auth domain is this page's own origin (Safari/WebKit and Chrome partition
 * the third-party storage a cross-origin redirect needs). So: first-party host → redirect on
 * touch devices and installed apps, popup on desktops; any other host → popup only.
 */
export async function signIn(): Promise<void> {
  const { auth } = init();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (firstParty && (standalone() || touchDevice())) return signInWithRedirect(auth, provider);
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const code = (e as { code?: string }).code ?? "";
    if (firstParty && POPUP_FALLBACK.has(code)) return signInWithRedirect(auth, provider);
    throw e;
  }
}

export async function signOut(): Promise<void> {
  const { auth } = init();
  await fbSignOut(auth);
}

/** Human-readable reason for a failed sign-in. */
export function describeError(e: unknown): string {
  const code = (e as { code?: string }).code ?? "";
  if (code === "auth/operation-not-allowed")
    return "Google sign-in isn't enabled for this app yet.";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request")
    return "Sign-in cancelled.";
  if (code === "auth/popup-blocked")
    return "The sign-in window was blocked — allow pop-ups for this site and tap Sign in again.";
  if (code === "auth/network-request-failed") return "No connection — try again online.";
  if (code === "auth/unauthorized-domain") return "This site isn't authorised for sign-in.";
  if (code === "permission-denied") return "Cloud save was refused — check the Firestore rules.";
  if (code === "unavailable")
    return "Cloud is unreachable right now — progress stays on this device.";
  if (code) return `Sign-in failed (${code.replace("auth/", "")}).`;
  const msg = (e as { message?: string }).message;
  return msg ? `Sync failed: ${msg.slice(0, 80)}` : "Sign-in failed.";
}

// ---------- Daily reminder (Web Push) ----------
// One doc per account, `push/{uid}` = { sub, hour, tz, on, updatedAt } (+ lastSent, written by the
// `remind` function). Reminders go to the device that last turned them on; the scheduled
// function in functions/src sends them. Pure decisions live in reminders.ts.

const pushError = (code: PushErrorCode) => Object.assign(new Error(code), { code });

const localTz = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** Wait for a Firestore write's server ack, but not forever: offline writes stay queued. */
async function settle(write: Promise<void>, ms = 6000): Promise<void> {
  write.catch(() => undefined);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([write, new Promise<void>((r) => (timer = setTimeout(r, ms)))]);
  } finally {
    clearTimeout(timer);
  }
}

/** An update to a doc that may not exist yet (never turned on anywhere) is a no-op. */
const ignoreMissing = (e: unknown) => {
  if ((e as { code?: string }).code !== "not-found") throw e;
};

/** This device's existing subscription for Yalla's key, if any. Never waits on an install. */
async function currentSub(): Promise<PushSubscription | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = (await reg?.pushManager?.getSubscription()) ?? null;
  const key = sub?.options?.applicationServerKey;
  return sub && (!key || sameBytes(key, keyBytes(VAPID_PUBLIC_KEY))) ? sub : null;
}

/** Subscribe this device (reusing a live subscription made with the same key). */
async function subscribeDevice(): Promise<PushSubscription> {
  if (!("serviceWorker" in navigator) || typeof PushManager === "undefined")
    throw pushError("push/unsupported");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, no) => (timer = setTimeout(() => no(pushError("push/no-sw")), 8000))),
  ]).finally(() => clearTimeout(timer));
  const key = keyBytes(VAPID_PUBLIC_KEY);
  const have = await reg.pushManager.getSubscription();
  if (have) {
    const k = have.options?.applicationServerKey;
    if (!k || sameBytes(k, key)) return have;
    await have.unsubscribe().catch(() => false);
  }
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
}

/** The subscription as stored: plain JSON, no undefined values (Firestore rejects them). */
function subJson(sub: PushSubscription) {
  const j = sub.toJSON();
  return {
    endpoint: sub.endpoint,
    expirationTime: j.expirationTime ?? null,
    keys: { p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "" },
  };
}

/**
 * Turn the daily reminder on and deliver it to this device. Asks for notification permission
 * first, synchronously inside the caller's tap: Safari only shows the prompt for a user gesture,
 * so nothing may be awaited before this is called.
 */
export async function enablePush(uid: string, hour: number): Promise<void> {
  const asked: Promise<NotificationPermission> =
    typeof Notification === "undefined"
      ? Promise.reject(pushError("push/unsupported"))
      : Notification.requestPermission();
  const permission = await asked;
  if (permission === "denied") throw pushError("push/denied");
  if (permission !== "granted") throw pushError("push/dismissed");
  const sub = await subscribeDevice();
  const { fs } = init();
  await settle(
    setDoc(
      doc(fs, "push", uid),
      { sub: subJson(sub), hour, tz: localTz(), on: true, updatedAt: Date.now() },
      // Replace these fields whole but keep the function's `lastSent`, so re-enabling after
      // today's reminder went out doesn't send a second one.
      { mergeFields: ["sub", "hour", "tz", "on", "updatedAt"] },
    ),
  );
}

/**
 * New reminder hour, wherever the reminders are delivered. The hour is wall-clock time in the
 * receiving device's zone, so `tz` is left to that device (enablePush / pushState).
 */
export async function setPushHour(uid: string, hour: number): Promise<void> {
  const { fs } = init();
  await settle(
    updateDoc(doc(fs, "push", uid), { hour, updatedAt: Date.now() }).catch(ignoreMissing),
  );
}

/**
 * Switch the reminder off for the account. With `onlyIfHere` (signing out), only when this
 * device is the one receiving them — another device's reminders are left alone.
 */
export async function disablePush(uid: string, onlyIfHere = false): Promise<void> {
  const { fs } = init();
  const ref = doc(fs, "push", uid);
  if (onlyIfHere) {
    const [snap, sub] = await Promise.all([getDoc(ref), currentSub().catch(() => null)]);
    if (!snap.exists() || !sub || snap.get("sub.endpoint") !== sub.endpoint) return;
  }
  await settle(updateDoc(ref, { on: false, updatedAt: Date.now() }).catch(ignoreMissing));
}

/**
 * Read the account's reminder doc as seen from this device. When this device receives the
 * reminders and has moved time zone, the doc follows it (the hour stays local wall-clock time).
 */
export async function pushState(uid: string): Promise<PushRemote> {
  const { fs } = init();
  const ref = doc(fs, "push", uid);
  const [snap, sub] = await Promise.all([getDoc(ref), currentSub().catch(() => null)]);
  if (!snap.exists()) return { on: false, here: false };
  const on = snap.get("on") === true;
  const here = !!sub && snap.get("sub.endpoint") === sub.endpoint;
  const tz = localTz();
  if (on && here && snap.get("tz") !== tz)
    void settle(updateDoc(ref, { tz, updatedAt: Date.now() })).catch(() => undefined);
  return { on, here };
}
