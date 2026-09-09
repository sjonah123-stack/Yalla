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
  type Firestore,
} from "firebase/firestore";
import { authDomainFor, firebaseConfig } from "./firebase-config";
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
