import { speak, speechAvailable } from "../lib/speech";
import { useProgress } from "../store/progress";
import { IconSpeaker } from "./Icons";

export function SpeakButton({
  text,
  big = false,
  label,
}: {
  text: string;
  big?: boolean;
  label?: string;
}) {
  const audio = useProgress((s) => s.p.settings.audio);
  if (!audio || !speechAvailable()) return null;
  return (
    <button
      type="button"
      className={"spk" + (big ? " big" : "")}
      aria-label={label ?? "Hear it"}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
    >
      <IconSpeaker />
    </button>
  );
}
