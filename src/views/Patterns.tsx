import { BINYANIM } from "../data/binyanim";
import { ROOTS } from "../data/roots";
import { rootLetters } from "../lib/hebrew";
import { useUi } from "../store/ui";
import { SpeakButton } from "../components/SpeakButton";
import { HeaderGear } from "../components/HeaderGear";
import { Heb } from "../components/Heb";

export default function Patterns() {
  const openRoot = useUi((s) => s.openRoot);
  const openConjugate = useUi((s) => s.openConjugate);
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
          const roots = ROOTS.filter((r) => r.words.some((w) => w.b === b.id));
          const ex = ROOTS.find((r) => rootLetters(r) === b.example.root)?.words.find(
            (w) => w.h === b.example.word,
          );
          return (
            <section className="binyan" key={b.id}>
              <div className="skel">{b.skeleton}</div>
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
                {(b.id === "pa'al" || b.id === "pi'el" || b.id === "hif'il") && (
                  <button
                    type="button"
                    className="btn sm plum"
                    style={{ marginTop: 10 }}
                    onClick={() => openConjugate(b.id as "pa'al" | "pi'el" | "hif'il")}
                  >
                    Drill {b.id}
                  </button>
                )}
                <div className="roots-inline">
                  {roots.map((r) => (
                    <button type="button" key={r.r} onClick={() => openRoot(r.r)} title={r.m}>
                      <Heb>{rootLetters(r)}</Heb>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
