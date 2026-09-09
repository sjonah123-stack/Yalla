import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";

/** First run: the welcome screen. Either path marks the device onboarded before it navigates. */
export default function Welcome() {
  const markOnboarded = useProgress((s) => s.markOnboarded);
  const start = useSession((s) => s.start);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);

  const place = () => {
    markOnboarded();
    if (start({ kind: "placement" })) setView("play");
    else setView("path");
  };
  const begin = () => {
    markOnboarded();
    if (start({ kind: "lesson", unit: COURSE.units[0].id })) setView("play");
    else {
      showToast("Nothing to study yet.");
      setView("path");
    }
  };

  return (
    <div className="dark-screen">
      <div className="wordmark">
        יאללה<span className="dot">.</span>
      </div>
      <div className="tagline">
        Learn Hebrew from its roots. {ROOTS.length} shorashim, one elegant journey to aliyah.
      </div>
      <div className="feats">
        <div>
          <span>ש</span>Every root unlocks a family of words
        </div>
        <div>
          <span className="gold">✦</span>Earn gems, open chests, collect seals
        </div>
        <div>
          <span className="coral">◔</span>Spaced repetition keeps it in memory
        </div>
      </div>
      <div className="spacer" />
      <button type="button" className="btn primary block big" onClick={place}>
        I know some Hebrew — place me
      </button>
      <button type="button" className="btn ghost block" onClick={begin}>
        Start from the first root
      </button>
    </div>
  );
}
