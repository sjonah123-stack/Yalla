import type { UnitId } from "../types";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { unitTitle } from "../lib/course";
import { rootDisplay } from "../lib/hebrew";
import { seen } from "../lib/srs";
import { WordList } from "../components/WordList";
import { SpeakButton } from "../components/SpeakButton";
import { SwipeDeck } from "../components/SwipeDeck";

/** A unit's roots as swipe cards: root on the front, meaning and word family on the back. */
export default function Flashcards({ unitId }: { unitId: UnitId }) {
  const u = COURSE.byId[unitId];
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const openTool = useUi((s) => s.openTool);
  const start = useSession((s) => s.start);

  if (!u) return null;
  const leave = () => useUi.getState().leaveTool();

  return (
    <div className="tool">
      <SwipeDeck
        items={u.roots}
        keyOf={(r) => r.r}
        title={`Flashcards · ${unitTitle(u)}`}
        onClose={leave}
        onSwipe={(card, dir) => {
          if (dir !== "know") return;
          const { p, recordAnswer } = useProgress.getState();
          // A "know" on a root never quizzed is soft evidence: back tomorrow, unit shows started.
          if (!seen(p.roots[card.r])) recordAnswer(card.r, true, false, 0);
        }}
        front={(card) => (
          <span className="glyph" lang="he">
            {rootDisplay(card)}
          </span>
        )}
        back={(card) => (
          <>
            <div className="row between">
              <span className="glyph" lang="he">
                {rootDisplay(card)}
              </span>
              <SpeakButton text={card.words[0].h} />
            </div>
            <div className="m">{card.m}</div>
            <div className="small" style={{ opacity: 0.8 }}>
              {card.cat} · {card.words.length} words
            </div>
            <div style={{ marginTop: 8 }}>
              <WordList words={card.words.slice(0, 4)} compact showForm={false} />
            </div>
          </>
        )}
        done={({ total, rounds }) => (
          <div className="fcdone">
            <section className="block gold">
              <div className="eyebrow">All {total} known</div>
              <h2 style={{ fontSize: 28, marginTop: 6 }}>
                {rounds > 1 ? `Cleared in ${rounds} rounds.` : "First pass, no misses."}
              </h2>
              <p style={{ marginTop: 8 }}>
                Flashcards get them familiar. A lesson makes them stick — come back tomorrow for
                the second pass.
              </p>
            </section>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (start({ kind: "lesson", unit: u.id })) setView("play");
                  else showToast("Nothing to study here right now.");
                }}
              >
                Lesson
              </button>
              <button type="button" className="btn" onClick={() => openTool("match", u.id)}>
                Match
              </button>
              <button type="button" className="btn" onClick={leave}>
                Back
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
