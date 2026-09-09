import { useEffect, useState } from "react";
import type React from "react";
import { useUi, type View } from "./store/ui";
import { useProgress } from "./store/progress";
import { useSession } from "./store/session";
import { initSpeech } from "./lib/speech";
import { connectRemote } from "./lib/storage";
import { level, levelCeil, levelFloor, streakAlive } from "./lib/srs";
import {
  IconBank,
  IconGear,
  IconHome,
  IconPatterns,
  IconPlay,
  IconProgress,
} from "./components/Icons";
import Path from "./views/Path";
import Play from "./views/Play";
import Bank from "./views/Bank";
import Progress from "./views/Progress";
import Patterns from "./views/Patterns";
import Settings from "./views/Settings";
import UnitSheet from "./views/Unit";
import Flashcards from "./views/Flashcards";
import Match from "./views/Match";

const NAV: { v: View; label: string; Icon: () => React.JSX.Element }[] = [
  { v: "path", label: "Path", Icon: IconHome },
  { v: "play", label: "Practice", Icon: IconPlay },
  { v: "bank", label: "Roots", Icon: IconBank },
  { v: "patterns", label: "Patterns", Icon: IconPatterns },
  { v: "progress", label: "Progress", Icon: IconProgress },
];

export default function App() {
  const view = useUi((s) => s.view);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const settingsOpen = useUi((s) => s.settingsOpen);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const unitSheet = useUi((s) => s.unitSheet);
  const toolUnit = useUi((s) => s.toolUnit);
  const theme = useProgress((s) => s.p.settings.theme);
  const session = useSession((s) => s.s);
  const start = useSession((s) => s.start);
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

  const go = (v: View) => {
    if (v === "play") {
      if (!session || session.done) {
        if (!start({ kind: "practice" }))
          return showToast("Nothing to practice yet — start the path.");
      }
    }
    setView(v);
  };

  if (view === "play" && session) return <Play />;
  if (view === "flashcards" && toolUnit) return <Flashcards unitId={toolUnit} />;
  if (view === "match" && toolUnit) return <Match unitId={toolUnit} />;
  // A tool/play view with nothing to show (e.g. after a reload) falls back to the path.
  const shown: View = ["path", "bank", "patterns", "progress"].includes(view) ? view : "path";

  return (
    <>
      <div className="shell">
        <TopBar onSettings={() => setSettingsOpen(true)} />
        <main key={shown} className="view">
          {shown === "path" && <Path />}
          {shown === "bank" && <Bank />}
          {shown === "progress" && <Progress />}
          {shown === "patterns" && <Patterns />}
        </main>
      </div>
      <nav className="nav" aria-label="Sections">
        <div className="nav-inner">
          {NAV.map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => go(v)}
              aria-current={shown === v ? "page" : undefined}
            >
              <Icon />
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

function TopBar({ onSettings }: { onSettings: () => void }) {
  const xp = useProgress((s) => s.p.xp);
  const streak = useProgress((s) => s.p.streak);
  const lastPlay = useProgress((s) => s.p.lastPlay);
  const l = level(xp);
  const lo = levelFloor(l);
  const hi = levelCeil(l);
  const pct = Math.max(2, Math.round(((xp - lo) / (hi - lo)) * 100));
  const alive = streakAlive(lastPlay);
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="logo">
            יאללה<span className="dot">.</span>
          </span>
          <span className="tag">Roots</span>
        </div>
        <div className="pills">
          <span className={"pill" + (alive ? "" : " dim")} title="Day streak">
            <i className="shape sun" />
            <span className="tnum">{alive ? streak : 0}</span>
          </span>
          <span className="pill" title="Level">
            <i className="shape disc" />
            Lv <span className="tnum">{l}</span>
          </span>
          <button type="button" className="pill icon" aria-label="Settings" onClick={onSettings}>
            <IconGear />
          </button>
        </div>
      </header>
      <div
        className="xpbar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${xp} XP`}
      >
        <i style={{ width: pct + "%" }} />
      </div>
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
