/**
 * Browser history as a mirror of the app's layer stack, so Back / swipe-back closes the top
 * layer (confirm, settings, unit sheet, tool, session, tab) instead of leaving the app.
 * The stores are the source of truth (see src/lib/history.ts); this is the only module that
 * touches `history`. Everything is wrapped so a sandboxed iframe (the artifact) just opts out.
 */
import {
  createMirror,
  layerStack,
  reduceBack,
  type BackAction,
  type NavState,
} from "../lib/history";
import { useUi } from "./ui";
import { useSession } from "./session";
import { useProgress } from "./progress";

let installed = false;

function snapshot(): NavState {
  const u = useUi.getState();
  return {
    trail: u.trail,
    view: u.view,
    unitSheet: u.unitSheet,
    toolUnit: u.toolUnit,
    settingsOpen: u.settingsOpen,
    confirmOpen: u.confirmSpec !== null,
    session: useSession.getState().s !== null,
    onboarded: useProgress.getState().p.onboardedAt !== null,
  };
}

function apply(action: BackAction): void {
  const ui = useUi.getState();
  const ses = useSession.getState();
  switch (action) {
    case "closeConfirm":
      return ui.resolveConfirm(null);
    case "closeSettings":
      return ui.setSettingsOpen(false);
    case "closeUnit":
      return ui.closeUnit();
    case "leaveTool":
      return ui.leaveTool();
    case "quitPlay":
      if (ses.s?.done) ses.leave();
      else void ses.quit();
      return;
    case "popTab":
      return ui.popTab();
    case "none":
      return;
  }
}

export function installHistory(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  let mirror: ReturnType<typeof createMirror>;
  let token: string;
  try {
    history.scrollRestoration = "manual";
    token = Math.random().toString(36).slice(2);
    history.replaceState({ yalla: token, depth: 0 }, "", location.href);
    mirror = createMirror({
      push: (depth) => history.pushState({ yalla: token, depth }, "", location.href),
      go: (delta) => history.go(delta),
    });
  } catch {
    return; // no usable history (sandboxed iframe): the app behaves as before
  }
  let queued = false;
  let fallback: ReturnType<typeof setTimeout> | undefined;
  const sync = () => {
    queued = false;
    const wasInflight = mirror.inflight;
    try {
      mirror.sync(layerStack(snapshot()).length);
    } catch {
      return;
    }
    if (mirror.inflight && !wasInflight) {
      clearTimeout(fallback);
      fallback = setTimeout(() => {
        // The popstate for our go() never came: trust the browser's current entry.
        const d = (history.state as { depth?: number } | null)?.depth ?? 0;
        mirror.reset(d);
        schedule();
      }, 400);
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(sync);
  };
  useUi.subscribe(schedule);
  useSession.subscribe(schedule);
  useProgress.subscribe(schedule);
  window.addEventListener("popstate", (e) => {
    clearTimeout(fallback);
    const st = e.state as { yalla?: string; depth?: number } | null;
    const depth = st && st.yalla === token && typeof st.depth === "number" ? st.depth : null;
    if (mirror.onPop(depth) === "back") apply(reduceBack(snapshot()));
    schedule();
  });
  schedule();
}
