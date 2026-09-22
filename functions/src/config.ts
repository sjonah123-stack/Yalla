/**
 * Web Push identity. The public key must equal `VAPID_PUBLIC_KEY` in the web app's
 * `src/lib/firebase-config.ts` (remind.test.ts checks); browsers bind each subscription to it.
 * The private half is the Functions secret VAPID_PRIVATE_KEY and is never committed.
 */
export const VAPID_PUBLIC_KEY =
  "BJLmK3TedZzRohhGYW1YQo0xOs2F04IfF-UrgKCRditITGw3yyCzI6Nx3DFLaE4IZUzOdLcu1fn51O0ad_Q2PCY";

/** Contact for push services (RFC 8292). Replace with a monitored address when there is one. */
export const VAPID_SUBJECT = "mailto:yalla@yalla-roots.web.app";
