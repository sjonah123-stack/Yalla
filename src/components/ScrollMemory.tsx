import { useEffect, useLayoutEffect, useRef } from "react";
import type { View } from "../types";
import { scrollKey } from "../lib/history";
import { useUi } from "../store/ui";

/**
 * Remembers the window scroll offset per view (the bank per filter + chip) and restores it
 * before paint when a tab comes back. Rendered inside the shell only, after the view's
 * content, so its layout effect runs once the new view's DOM exists.
 */
export function ScrollMemory({ view }: { view: View }) {
  const bankFilter = useUi((s) => s.bankFilter);
  const bankChip = useUi((s) => s.bankChip);
  const keyRef = useRef("");
  keyRef.current = scrollKey(view, bankFilter, bankChip);
  useLayoutEffect(() => {
    const y = useUi.getState().scrollMemory[keyRef.current] ?? 0;
    window.scrollTo({ top: y });
  }, [view]);
  useEffect(() => {
    // Scroll events are already coalesced per frame; no rAF throttle (rAF never fires while
    // the document is hidden and a pending handle would then swallow every later event).
    const onScroll = () => useUi.getState().rememberScroll(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
