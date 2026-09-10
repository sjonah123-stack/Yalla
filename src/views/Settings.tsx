import { useEffect, useState } from "react";
import type React from "react";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useCloud } from "../store/cloud";
import { useUi } from "../store/ui";
import { loadCloud } from "../lib/cloud-loader";
import { speechAvailable } from "../lib/speech";
import { lastSyncedAt } from "../lib/storage";
import { accountLine } from "../lib/labels";
import { activeFlags, flagsToText } from "../lib/flags";
import { ROOTS } from "../data/roots";
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
  const p = useProgress((s) => s.p);
  const st = p.settings;
  const set = useProgress((s) => s.setSettings);
  const sync = useProgress((s) => s.sync);
  const reset = useProgress((s) => s.reset);
  const unflagRoot = useProgress((s) => s.unflagRoot);
  const showToast = useUi((s) => s.showToast);
  const cloud = useCloud();
  const flags = activeFlags(p);
  const nFlags = flags.length;
  const [copyText, setCopyText] = useState("");
  useEffect(() => useCloud.getState().warm(), []);
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
            "Practice length",
            "Questions per practice round · lessons are 16, tests 20",
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
        {loadCloud &&
          row(
            "Account",
            cloud.status === "signed-in"
              ? `${cloud.user?.name ?? cloud.user?.email ?? "Signed in"} · ${accountLine(sync, lastSyncedAt(), cloud.pulled, Date.now())}`
              : cloud.status === "error"
                ? (cloud.error ?? "Sign-in failed")
                : "Sign in to keep progress across devices",
            cloud.status === "signed-in" ? (
              <button
                type="button"
                className="btn sm"
                onClick={async () => {
                  const v = await useUi.getState().confirm({
                    title: "Sign out?",
                    body: "Your progress stays safe in your account. Keep a copy on this device, or clear it?",
                    actions: [
                      { label: "Keep a copy here", value: "keep", kind: "plum" },
                      { label: "Remove from this device", value: "wipe", kind: "danger" },
                      { label: "Cancel", value: "cancel", kind: "text" },
                    ],
                  });
                  if (v !== "keep" && v !== "wipe") return;
                  await cloud.signOut();
                  if (v === "wipe") {
                    useSession.getState().clear();
                    useProgress.getState().wipeLocal();
                    onClose();
                  }
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                className="btn sm plum"
                onClick={() => cloud.signIn()}
                disabled={cloud.status === "signing-in" || cloud.status === "loading"}
              >
                {cloud.status === "signing-in" || cloud.status === "loading"
                  ? "Signing in…"
                  : "Sign in with Google"}
              </button>
            ),
          )}
        {row(
          "Flagged roots",
          nFlags ? `${nFlags} waiting for review` : "Flag a root from a lesson or the Roots list",
          <button
            type="button"
            className="btn sm"
            disabled={nFlags === 0}
            onClick={async () => {
              const text = flagsToText(p, ROOTS);
              if (typeof navigator !== "undefined" && navigator.share) {
                try {
                  await navigator.share({ title: "Yalla flags", text });
                  return;
                } catch (e) {
                  // A cancelled share sheet is not an error; anything else falls back below.
                  if ((e as { name?: string }).name === "AbortError") return;
                }
              }
              if (navigator.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(text);
                  showToast(`Copied ${nFlags} flag${nFlags === 1 ? "" : "s"}`);
                  return;
                } catch {
                  // Fall through to the visible box.
                }
              }
              setCopyText(text);
            }}
          >
            Copy
          </button>,
        )}
        {copyText && (
          <textarea
            className="copybox"
            readOnly
            value={copyText}
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        {nFlags > 0 && (
          <button
            type="button"
            className="btn text"
            style={{ padding: "8px 0" }}
            onClick={async () => {
              const v = await useUi.getState().confirm({
                title: "Clear all flags?",
                body: `${nFlags} flagged root${nFlags === 1 ? "" : "s"} will be marked reviewed. Copy them first if you still need the list.`,
                actions: [
                  { label: "Clear", value: "clear", kind: "danger" },
                  { label: "Keep", value: "keep", kind: "text" },
                ],
              });
              if (v !== "clear") return;
              for (const [id] of activeFlags(useProgress.getState().p)) unflagRoot(id);
              setCopyText("");
              showToast("Flags cleared.");
            }}
          >
            Clear all flags
          </button>
        )}
        <p className="small muted" style={{ marginTop: 16 }}>
          Progress is saved on this device
          {sync === "synced"
            ? loadCloud
              ? " and in your account"
              : " and synced to your Claude artifact"
            : sync === "error"
              ? " — the last cloud save failed, it will retry on your next answer"
              : ""}
          .
        </p>
        <button
          type="button"
          className="btn text"
          style={{ marginTop: 10, padding: "8px 0", color: "var(--coral-deep)" }}
          onClick={async () => {
            const v = await useUi.getState().confirm({
              title: "Reset progress?",
              body:
                cloud.status === "signed-in"
                  ? "This erases every root, streak, gem and seal on this device and in your account. It cannot be undone."
                  : "This erases every root, streak, gem and seal on this device. It cannot be undone.",
              actions: [
                { label: "Erase everything", value: "reset", kind: "danger" },
                { label: "Keep my progress", value: "cancel", kind: "text" },
              ],
            });
            if (v !== "reset") return;
            useSession.getState().clear();
            reset();
            onClose();
          }}
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
