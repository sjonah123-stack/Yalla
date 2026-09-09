/**
 * Lazy entry to the Firebase-backed cloud module. Folded to `null` in the artifact build, so the
 * SDK never lands in the single-file bundle; in the web build it is a separate chunk loaded only
 * for signed-in users or on tapping Sign in.
 */
export const loadCloud: null | (() => Promise<typeof import("./cloud")>) = __ARTIFACT__
  ? null
  : () => import("./cloud");
