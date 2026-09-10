/** Where the app lives. One canonical origin keeps every device on one local store. */
export const CANONICAL_HOST = "yalla-roots.web.app";
/** Earlier addresses that still serve the app. */
export const LEGACY_HOSTS: ReadonlySet<string> = new Set(["yalla-677b9.web.app"]);
export const MOVED_PARAM = "moved";

/**
 * Whether a page on `hostname` should jump to the canonical origin right away. Only when nothing
 * would be lost: the device has no progress yet, or it syncs to an account. A device with local-only
 * progress stays and gets a banner instead (signing in first carries the progress over).
 */
export function shouldMove(hostname: string, onboardedAt: number | null, cloud: boolean): boolean {
  if (!LEGACY_HOSTS.has(hostname)) return false;
  return onboardedAt === null || cloud;
}

/** The canonical URL for the current location, flagged so the welcome screen can explain the move. */
export function movedUrl(pathname: string, search: string, hash: string): string {
  const q = new URLSearchParams(search);
  q.set(MOVED_PARAM, "1");
  return `https://${CANONICAL_HOST}${pathname}?${q.toString()}${hash}`;
}
