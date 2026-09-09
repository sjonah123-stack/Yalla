import { useEffect } from "react";
import type React from "react";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { speechAvailable } from "../lib/speech";
import type { Settings as S } from "../types";

function Seg<T extends string | number | boolean>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { v: T; l: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="group">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          aria-pressed={o.v === value}
          onClick={() => onChange(o.v)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

const ON_OFF = [
  { v: true, l: "On" },
  { v: false, l: "Off" },
] as const;

export default function Settings({ onClose }: { onClose: () => void }) {
  const st = useProgress((s) => s.p.settings);
  const set = useProgress((s) => s.setSettings);
  const sync = useProgress((s) => s.sync);
  const reset = useProgress((s) => s.reset);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const row = (l: string, d: string, ctl: React.ReactNode) => (
    <div className="setting">
      <div>
        <div className="l">{l}</div>
        <div className="d">{d}</div>
      </div>
      {ctl}
    </div>
  );
  const bool = (k: keyof S, v: boolean) => set({ [k]: v } as Partial<S>);
  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="Settings">
      <div className="panel settings" onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <h2>Settings</h2>
          <button type="button" className="btn sm" onClick={onClose}>
            Done
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          {row(
            "Session length",
            "Questions per session",
            <Seg
              value={st.sessionLen}
              options={[
                { v: 10, l: "10" },
                { v: 20, l: "20" },
                { v: 30, l: "30" },
              ]}
              onChange={(v) => set({ sessionLen: v })}
            />,
          )}
          {row(
            "Daily goal",
            "XP per day to fill the ring",
            <Seg
              value={st.dailyGoal}
              options={[
                { v: 20, l: "20" },
                { v: 50, l: "50" },
                { v: 100, l: "100" },
              ]}
              onChange={(v) => set({ dailyGoal: v })}
            />,
          )}
          {row(
            "Meet new roots first",
            "Show a root's family before its first question",
            <Seg value={st.learnFirst} options={ON_OFF} onChange={(v) => bool("learnFirst", v)} />,
          )}
          {row(
            "Nikud",
            "Show vowel points on words",
            <Seg value={st.nikud} options={ON_OFF} onChange={(v) => bool("nikud", v)} />,
          )}
          {row(
            "Audio",
            speechAvailable()
              ? "Hebrew voice available on this device"
              : "No Hebrew voice on this device",
            <Seg value={st.audio} options={ON_OFF} onChange={(v) => bool("audio", v)} />,
          )}
          {row(
            "Theme",
            "",
            <Seg
              value={st.theme}
              options={[
                { v: "system", l: "Auto" },
                { v: "light", l: "Light" },
                { v: "dark", l: "Dark" },
              ]}
              onChange={(v) => set({ theme: v })}
            />,
          )}
        </div>
        <p className="small muted" style={{ marginTop: 16 }}>
          Progress is saved on this device
          {sync === "synced" ? " and synced to your Claude artifact" : ""}.
        </p>
        <button
          type="button"
          className="btn text"
          style={{ marginTop: 10, padding: "8px 0", color: "var(--coral-deep)" }}
          onClick={() => {
            if (confirm("Erase all progress on this device? This cannot be undone.")) {
              useSession.getState().clear();
              reset();
              onClose();
            }
          }}
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
