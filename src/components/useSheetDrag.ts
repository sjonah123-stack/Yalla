import { useEffect, useRef, useState, type CSSProperties } from "react";

const CLOSE_AT = 90;

/**
 * Drag-to-dismiss for bottom sheets. With the panel scrolled to the top, a downward finger drag
 * moves the sheet (and is kept away from the scroller with a non-passive touchmove); past
 * CLOSE_AT it closes on release, otherwise it springs back. Normal scrolling is untouched.
 */
export function useSheetDrag<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY: number | null = null;
    let active = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || el.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      active = false;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const d = e.touches[0].clientY - startY;
      if (!active) {
        if (d > 8 && el.scrollTop <= 0) {
          active = true;
          setDragging(true);
        } else if (d < -8 || el.scrollTop > 0) {
          startY = null; // an upward drag or a scroll: hand it back to the browser
          return;
        } else return;
      }
      e.preventDefault();
      setDy(Math.max(0, d));
    };
    const onEnd = (e: TouchEvent) => {
      if (startY === null) return;
      const d = active ? (e.changedTouches[0]?.clientY ?? startY) - startY : 0;
      startY = null;
      active = false;
      setDragging(false);
      setDy(0);
      if (d > CLOSE_AT) close.current();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);
  const style: CSSProperties | undefined =
    dragging || dy
      ? { transform: `translateY(${dy}px)`, transition: dragging ? "none" : undefined }
      : undefined;
  return { ref, style };
}
