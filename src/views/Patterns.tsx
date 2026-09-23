import { BINYANIM } from "../data/binyanim";
import { ROOTS } from "../data/roots";
import { rootLetters } from "../lib/hebrew";
import { binyanStats } from "../lib/binyan";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { SpeakButton } from "../components/SpeakButton";
import { HeaderGear } from "../components/HeaderGear";
import { startBinyanLesson } from "./Binyan";

export default function Patterns() {
  const openConjugate = useUi((s) => s.openConjugate);
  const openBinyan = useUi((s) => s.openBinyan);
  const p = useProgress((s) => s.p);
  return (
    <>
      <div className="view-h">
        <h2>Patterns</h2>
        <div className="actions">
          <HeaderGear />
        </div>
      </div>
      <p>
        A Hebrew verb is a root poured into a pattern. The root gives the meaning; the binyan gives
        the voice. Seven moulds — learn them and every new verb becomes two things you already know.
      </p>
      <div className="binyans">
        {BINYANIM.map((b) => {
          const ex = ROOTS.find((r) => rootLetters(r) === b.example.root)?.words.find(
            (w) => w.h === b.example.word,
          );
          const st = binyanStats(b.id, ROOTS, p);
          return (
            <section className="binyan" key={b.id}>
              <button
                type="button"
                className="skel"
                onClick={() => openBinyan(b.id)}
                aria-label={`${b.id}: the pattern and all its verbs`}
              >
                {b.skeleton}
              </button>
              <div>
                <h3>
                  {b.id} <span className="muted">· {b.gloss}</span>
                </h3>
                <div className="note">{b.note}</div>
                <div className="ex">
                  <span className="word">{b.example.word}</span>
                  <span className="g">{ex?.g ?? b.example.gloss}</span>
                  <SpeakButton text={b.example.word} />
                </div>
                <div className="bn-line tnum">
                  <span className="bn-meter" aria-hidden="true">
                    <i style={{ width: (st.total ? (st.known / st.total) * 100 : 0) + "%" }} />
                  </span>
                  {st.known} / {st.total} verbs known
                </div>
                <div className="bn-actions">
                  <button
                    type="button"
                    className="btn sm primary"
                    onClick={() => startBinyanLesson(b.id)}
                  >
                    Lesson
                  </button>
                  <button type="button" className="btn sm quiet" onClick={() => openBinyan(b.id)}>
                    All verbs
                  </button>
                  {(b.id === "pa'al" || b.id === "pi'el" || b.id === "hif'il") && (
                    <button
                      type="button"
                      className="btn sm plum"
                      onClick={() => openConjugate(b.id as "pa'al" | "pi'el" | "hif'il")}
                    >
                      Conjugate
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
