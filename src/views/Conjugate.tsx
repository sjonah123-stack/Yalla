import { useEffect, useMemo, useState } from "react";
import { ROOTS } from "../data/roots";
import { BINYAN_BY_ID } from "../data/binyanim";
import { useProgress } from "../store/progress";
import { useUi, type DrillBinyan } from "../store/ui";
import { rootDisplay, rootLetters } from "../lib/hebrew";
import { seen } from "../lib/srs";
import { playCue, buzz } from "../lib/sound";
import { shuffle } from "../lib/quiz";
import {
  PAST_PERSONS,
  PRESENT_FORMS,
  isStrongRoot,
  paradigm,
  type Gender,
  type Person,
} from "../lib/conjugate";
import { Heb } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";
import type { Root } from "../types";

const ROUND = 10;

interface Q {
  root: Root;
  tense: "past" | "present";
  who: Person | Gender;
  answer: string;
  opts: string[];
}

function buildRound(binyan: DrillBinyan, pool: Root[]): Q[] {
  const out: Q[] = [];
  const roots = shuffle(pool);
  for (let i = 0; out.length < ROUND && roots.length; i++) {
    const root = roots[i % roots.length];
    const par = paradigm(rootLetters(root), binyan);
    if (!par) continue;
    const tense = Math.random() < 0.6 ? "past" : "present";
    const forms = tense === "past" ? par.past : par.present;
    const keys = Object.keys(forms) as (keyof typeof forms)[];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const answer = forms[key];
    const others = shuffle(
      [...Object.values(par.past), ...Object.values(par.present)].filter((f) => f !== answer),
    );
    const who =
      tense === "past"
        ? PAST_PERSONS.find((p) => p.id === key)!
        : PRESENT_FORMS.find((g) => g.id === key)!;
    out.push({ root, tense, who, answer, opts: shuffle([answer, ...others.slice(0, 3)]) });
  }
  return out;
}

/** Conjugation drill: pick the generated form of a strong root for a person / gender. */
export default function Conjugate({ binyan }: { binyan: DrillBinyan }) {
  const leave = useUi((s) => s.leaveTool);
  const sounds = useProgress((s) => s.p.settings.sounds);
  const p = useProgress((s) => s.p);
  const pool = useMemo(() => {
    const strong = ROOTS.filter(
      (r) =>
        isStrongRoot(rootLetters(r)) &&
        r.words.some((w) => w.b === binyan) &&
        paradigm(rootLetters(r), binyan) !== null,
    );
    const known = strong.filter((r) => seen(p.roots[r.r]));
    return known.length >= 4 ? known : strong;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binyan]);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const round = useMemo(() => buildRound(binyan, pool), [binyan, pool, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [ok, setOk] = useState(0);
  const info = BINYAN_BY_ID[binyan];
  const q = round[i];
  const done = i >= round.length;

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
      const n = Number(e.key);
      if (q && !picked && n >= 1 && n <= 4) pick(q.opts[n - 1]);
      if ((e.key === "Enter" || e.key === " ") && picked) next();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const pick = (f: string) => {
    if (!q || picked) return;
    setPicked(f);
    const right = f === q.answer;
    if (right) setOk((x) => x + 1);
    if (sounds) {
      playCue(right ? "good" : "bad");
      buzz(right ? 12 : [20, 30, 20]);
    }
  };
  const next = () => {
    setPicked(null);
    setI((x) => x + 1);
  };
  const again = () => {
    setSeed((s) => s + 1);
    setI(0);
    setOk(0);
    setPicked(null);
  };

  if (!round.length)
    return (
      <div className="tool">
        <div className="rail">
          <button type="button" className="x" aria-label="Close" onClick={leave}>
            ×
          </button>
          <span className="ttl">Conjugate · {binyan}</span>
        </div>
        <section className="block plum" style={{ marginTop: 20 }}>
          No regular roots to drill in this binyan yet.
        </section>
        <button type="button" className="btn block" style={{ marginTop: 12 }} onClick={leave}>
          Back
        </button>
      </div>
    );

  return (
    <div className="tool conj">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">
          Conjugate · <Heb>{info.he}</Heb>
        </span>
        <span className="cnt tnum">
          {Math.min(i + 1, round.length)} / {round.length}
        </span>
      </div>
      {done ? (
        <div className="mdone">
          <section className="block gold">
            <div className="eyebrow">{ok === round.length ? "Flawless" : "Round done"}</div>
            <div className="mtime" style={{ textAlign: "left", margin: "6px 0 0" }}>
              {ok} / {round.length}
            </div>
            <p className="small" style={{ marginTop: 8, opacity: 0.85 }}>
              {info.gloss} · forms are built by rule from the root, so every regular root follows
              this same pattern.
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn primary" onClick={again} autoFocus>
              Again
            </button>
            <button type="button" className="btn" onClick={leave}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="conj-q">
            <div className="eyebrow">
              {q.tense} · {q.who.en}
            </div>
            <div className="glyph hero" lang="he">
              {rootDisplay(q.root)}
            </div>
            <div className="gloss">{q.root.short}</div>
            <div className="conj-who">
              <Heb>{q.who.he}</Heb>
            </div>
          </div>
          <div className="mgrid conj-opts">
            {q.opts.map((f, n) => (
              <button
                key={f}
                type="button"
                className={
                  "mtile word" +
                  (picked ? (f === q.answer ? " done" : f === picked ? " wrong" : "") : "")
                }
                onClick={() => pick(f)}
                disabled={!!picked}
              >
                <span className="k" aria-hidden="true">
                  {n + 1}
                </span>
                <Heb>{f}</Heb>
              </button>
            ))}
          </div>
          {picked && (
            <div className="conj-after">
              <div className="row" style={{ justifyContent: "center", gap: 8 }}>
                <Heb className="big">{q.answer}</Heb>
                <SpeakButton text={q.answer} />
              </div>
              <button type="button" className="btn primary block" onClick={next} autoFocus>
                {i + 1 >= round.length ? "Finish" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
