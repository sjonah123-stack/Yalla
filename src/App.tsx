import { useEffect, useState } from "react";
import { useUi, type View } from "./store/ui";
import { useProgress } from "./store/progress";
import { useSession } from "./store/session";
import { initSpeech } from "./lib/speech";
import { connectRemote } from "./lib/storage";
import Path from "./views/Path";
import Play from "./views/Play";
import Bank from "./views/Bank";
import Progress from "./views/Progress";
import Patterns from "./views/Patterns";
import Settings from "./views/Settings";
import UnitSheet from "./views/Unit";
import Flashcards from "./views/Flashcards";
import Match from "./views/Match";
import Welcome from "./views/Welcome";

const NAV: { v: View; label: string; glyph: string }[] = [
  { v: "path", label: "Path", glyph: "◉" },
  { v: "bank", label: "Roots", glyph: "ש" },
  { v: "patterns", label: "Patterns", glyph: "ב" },
  { v: "progress", label: "Progress", glyph: "◈" },
];

export default function App() {
  const view = useUi((s) => s.view);
  const setView = useUi((s) => s.setView);
  const settingsOpen = useUi((s) => s.settingsOpen);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const unitSheet = useUi((s) => s.unitSheet);
  const toolUnit = useUi((s) => s.toolUnit);
  const theme = useProgress((s) => s.p.settings.theme);
  const onboardedAt = useProgress((s) => s.p.onboardedAt);
  const session = useSession((s) => s.s);
  const [, setAudioReady] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    initSpeech().then((ok) => setAudioReady(ok));
    const { p, adopt, setSync } = useProgress.getState();
    connectRemote(p).then((merged) => {
      if (merged) {
        adopt(merged);
        setSync("synced");
      }
    });
  }, []);

  if (view === "play" && session) return <Play />;
  if (onboardedAt === null) return <Welcome />;
  if (view === "flashcards" && toolUnit) return <Flashcards unitId={toolUnit} />;
  if (view === "match" && toolUnit) return <Match unitId={toolUnit} />;
  // A tool/play view with nothing to show (e.g. after a reload) falls back to the path.
  const shown: View = ["path", "bank", "patterns", "progress"].includes(view) ? view : "path";

  return (
    <>
      <div className="shell">
        <main key={shown} className={"view" + (shown === "path" ? "" : " pad")}>
          {shown === "path" && <Path />}
          {shown === "bank" && <Bank />}
          {shown === "progress" && <Progress />}
          {shown === "patterns" && <Patterns />}
        </main>
      </div>
      <nav className="nav" aria-label="Sections">
        <div className="nav-inner">
          {NAV.map(({ v, label, glyph }) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-current={shown === v ? "page" : undefined}
            >
              <span className="ico" aria-hidden="true">
                {glyph}
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
      <Toast />
      {unitSheet && <UnitSheet unitId={unitSheet} />}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </>
  );
}

function Toast() {
  const toast = useUi((s) => s.toast);
  const key = useUi((s) => s.toastKey);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!key) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, [key]);
  return (
    <div className={"toast" + (show ? " show" : "")} role="status">
      {toast}
    </div>
  );
}
