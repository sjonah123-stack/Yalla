import { BINYANIM } from "../data/binyanim";
import { ROOTS } from "../data/roots";
import { rootLetters } from "../lib/hebrew";
import { useUi } from "../store/ui";
import { SpeakButton } from "../components/SpeakButton";

export default function Patterns() {
  const openRoot = useUi((s) => s.openRoot);
  return (
    <>
      <section className="block sun">
        <div className="eyebrow">Binyanim</div>
        <h2 style={{ fontSize: "var(--t-h)", fontWeight: 900, marginTop: 4 }}>
          Seven patterns, one root.
        </h2>
        <p style={{ marginTop: 8 }}>
          A Hebrew verb is a root poured into a pattern. The root gives the meaning; the binyan
          gives the voice — simple, intensive, causative, passive, reflexive. Learn the seven moulds
          and every new verb becomes two things you already know.
        </p>
      </section>
      {BINYANIM.map((b) => {
        const roots = ROOTS.filter((r) => r.words.some((w) => w.b === b.id));
        const ex = ROOTS.find((r) => rootLetters(r) === b.example.root)?.words.find(
          (w) => w.h === b.example.word,
        );
        return (
          <section className="block" key={b.id}>
            <div className="binyan">
              <div className="skel">{b.skeleton}</div>
              <div>
                <h3>
                  {b.id}{" "}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    · {b.gloss}
                  </span>
                </h3>
                <div className="note">{b.note}</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <span className="word" style={{ fontSize: 24 }}>
                    {b.example.word}
                  </span>
                  <span className="small muted">{ex?.g ?? b.example.gloss}</span>
                  <SpeakButton text={b.example.word} />
                </div>
              </div>
            </div>
            <div className="eyebrow" style={{ marginTop: 14 }}>
              {roots.length} roots in the bank
            </div>
            <div className="roots-inline">
              {roots.map((r) => (
                <button type="button" key={r.r} onClick={() => openRoot(r.r)} title={r.m}>
                  {rootLetters(r)}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
