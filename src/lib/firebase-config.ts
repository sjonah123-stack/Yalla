/**
 * Public Firebase web config for project yalla-677b9 (safe to commit: access is governed by
 * Firestore rules and Auth, not by this object).
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCb7BVxx-DblNJTX9C_HovG0Ch-q9rKJ4Q",
  authDomain: "yalla-677b9.firebaseapp.com",
  projectId: "yalla-677b9",
  storageBucket: "yalla-677b9.firebasestorage.app",
  messagingSenderId: "964636313927",
  appId: "1:964636313927:web:e4961723165b50f26fa462",
};

/**
 * Hosting origins whose own `/__/auth/handler` is an authorized redirect URI on the project's
 * OAuth client (Google Cloud → APIs & Services → Credentials → "Web client (auto created by
 * Google Service)"). On these hosts sign-in runs first-party, which is the only way redirect
 * sign-in survives Safari's third-party-storage blocking (installed PWAs, iPhones). Add a host
 * here ONLY after its handler URL is registered — otherwise Google answers redirect_uri_mismatch.
 */
export const FIRST_PARTY_AUTH_HOSTS: readonly string[] = [
  "yalla-677b9.firebaseapp.com",
  "yalla-roots.web.app",
  "yalla-677b9.web.app",
];

/**
 * Web Push application server key (VAPID, public half) for the daily reminder. Browsers bind each
 * subscription to it, so it must match `functions/src/config.ts` (functions test checks) and the
 * private key in the Functions secret VAPID_PRIVATE_KEY. Rotating it orphans every subscription.
 */
export const VAPID_PUBLIC_KEY =
  "BJLmK3TedZzRohhGYW1YQo0xOs2F04IfF-UrgKCRditITGw3yyCzI6Nx3DFLaE4IZUzOdLcu1fn51O0ad_Q2PCY";

/** The auth domain to use when the app is served from `hostname`. */
export const authDomainFor = (hostname: string): string =>
  FIRST_PARTY_AUTH_HOSTS.includes(hostname) ? hostname : firebaseConfig.authDomain;
