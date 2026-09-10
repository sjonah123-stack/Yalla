import { useUi } from "../store/ui";
import { IconGear } from "./Icons";

/** The settings gear for view headers (Home has its own in the hero). */
export function HeaderGear() {
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  return (
    <button
      type="button"
      className="pill icon"
      aria-label="Settings"
      onClick={() => setSettingsOpen(true)}
    >
      <IconGear />
    </button>
  );
}
