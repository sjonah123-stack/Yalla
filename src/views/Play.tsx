import { useEffect, useRef } from "react";
import type React from "react";
import { planRules, useSession } from "../store/session";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { KEY_ROWS, PRAISE, FINALS, keyToHebrew, rootDisplay, stripNikud } from "../lib/hebrew";
import { mastery } from "../lib/srs";
import { unitTitle } from "../lib/course";
import { COURSE } from "../store/course";
import { speak } from "../lib/speech";
import { BINYAN_BY_ID } from "../data/binyanim";
import { WordList } from "../components/WordList";
import { SpeakButton } from "../components/SpeakButton";
import { Heb } from "../components/Heb";
import Summary from "./Summary";

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export default function Play() {
  const s0 = useSession((st) => st.s);
  const { pickOption, typeKey, submitTyped, next, end, dismissLearn } = useSession.getState();
  const nikud = useProgress((st) => st.p.settings.nikud);
  const setView = useUi((st) => st.setView);

  // Tests and placements are discarded when left early, so they ask first.
  const quit = async () => {
    const st = useSession.getState().s;
    if (!st || st.done) return;
    if (st.plan.kind === "test" || st.plan.kind === "placement") {
      const v = await useUi.getState().confirm(
        st.plan.kind === "test"
          ? {
              title: "Leave the test?",
              body: "A test only counts when you finish it. Leaving throws this run away — the unit itself is untouched.",
              actions: [
                { label: "Keep going", value: "stay", kind: "plum" },
                { label: "Leave the test", value: "leave", kind: "text" },
              ],
            }
          : {
              title: "Leave the placement test?",
              body: "Nothing from a half-finished placement is saved. You can take it again from Home.",
              actions: [
                { label: "Keep going", value: "stay", kind: "plum" },
                { label: "Leave", value: "leave", kind: "text" },
              ],
            },
      );
      if (v !== "leave") return;
    }
    end();
  };

  // Physical keyboard: 1–4 pick, Enter/Space advance, Hebrew or QWERTY-positional typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const st = useSession.getState().s;
      if (!st || st.done) return;
      if (st.learning) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dismissLearn();
        }
        return;
      }
      if (st.answered) {
        if (!planRules(st.plan).feedbackEach) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          next();
        }
        return;
      }
      if (st.q?.mode === "typeRoot") {
        if (e.key === "Backspace") {
          e.preventDefault();
          typeKey("⌫");
        } else if (e.key === "Enter") submitTyped();
        else {
          const h = keyToHebrew(e.key);
          if (h) typeKey(FINALS[h] ?? h);
        }
      } else if (/^[1-4]$/.test(e.key)) pickOption(+e.key - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickOption, typeKey, submitTyped, next, dismissLearn]);

  // Test / placement: no feedback sheet — tick, then move on.
  const feedbackEach = s0 ? planRules(s0.plan).feedbackEach : true;
  const answered = !!s0?.answered;
  const qi = s0?.i ?? 0;
  useEffect(() => {
    if (!s0 || s0.done || !answered || feedbackEach) return;
    const t = setTimeout(() => next(), 450);
    return () => clearTimeout(t);
  }, [answered, qi, feedbackEach, next]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s0) return null;
  const s = s0;
  if (s.done) return <Summary />;
  const planLabel =
    s.plan.kind === "test"
      ? `Test · ${unitTitle(COURSE.byId[s.plan.unit])} · `
      : s.plan.kind === "placement"
        ? "Placement · "
        : "";
  const q = s.q!;
  const root = q.root;
  const wordText = (h: string) => (nikud ? h : stripNikud(h));
  const hot = s.combo >= 3;

  return (
    <div className="play">
      <div className="rail">
        <button
          type="button"
          className="x"
          aria-label={
            s.plan.kind === "test" || s.plan.kind === "placement" ? "Leave the test" : "End session"
          }
          onClick={() => quit()}
        >
          ×
        </button>
        <div className="ticks" aria-label={`Question ${s.i + 1}`}>
          {s.ticks.map((t, i) => (
            <i key={i} className={t === "pending" && i === s.slot ? "current" : t} />
          ))}
        </div>
        <span className={"combo tnum" + (hot ? " hot" : "")} key={hot ? s.combo : "cold"}>
          {s.combo > 1 ? `×${s.combo}` : ""}
        </span>
      </div>

      <div className={"stage" + (s.answered ? " dim" : "")} key={`${s.i}-${s.slot}`}>
        {s.answered && s.lastCorrect && s.lastXp > 0 && (
          <span className="xpfloat tnum" aria-hidden="true">
            +{s.lastXp}
          </span>
        )}
        <div className="q-in">
          <div className="title">
            {planLabel}
            {q.title}
            {q.word && q.mode !== "whichBinyan" && q.mode !== "hearWord" && (
              <>
                {" "}
                · <b>{q.word.b}</b>
              </>
            )}
          </div>
          <Prompt />
        </div>
      </div>

      <div className="answer">
        {q.mode === "typeRoot" ? <Typing /> : <Tiles />}
        {s.answered && feedbackEach && <Sheet />}
      </div>
      {s.learning && <Learn />}
    </div>
  );

  function Prompt() {
    switch (q.mode) {
      case "rootMeaning":
      case "oddOne":
        return (
          <>
            <div className="glyph hero" lang="he">
              {rootDisplay(root)}
            </div>
            {q.mode === "oddOne" && <div className="gloss">{root.m}</div>}
          </>
        );
      case "meaningRoot":
        return (
          <div className="meaning">
            {root.m}
            <small>{root.cat}</small>
          </div>
        );
      case "hearWord":
        return <HearPrompt text={q.word!.h} />;
      case "wordRoot":
      case "whichBinyan":
      case "typeRoot":
        return (
          <>
            <div className="row" style={{ justifyContent: "center" }}>
              <div className="word" lang="he">
                {wordText(q.word!.h)}
              </div>
              <SpeakButton text={q.word!.h} />
            </div>
            <div className="gloss">{q.word!.g}</div>
          </>
        );
    }
  }

  function Tiles() {
    const kind =
      q.mode === "rootMeaning"
        ? "en"
        : q.mode === "oddOne"
          ? "word"
          : q.mode === "whichBinyan"
            ? "binyan"
            : "root";
    return (
      <div className="tiles">
        {q.opts!.map((o, i) => {
          let cls = "tile";
          if (s.answered) {
            if (o.ok) cls += " correct";
            else if (s.picked === i) cls += " wrong";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={s.answered}
              onClick={() => pickOption(i)}
            >
              <span className="k" aria-hidden="true">
                {i + 1}
              </span>
              {kind === "en" && <span className="en">{o.label}</span>}
              {kind === "root" && <span className="glyph">{o.label}</span>}
              {kind === "word" && (
                <>
                  <span className="word">{wordText(o.label)}</span>
                  <span className="sub">{o.sub}</span>
                </>
              )}
              {kind === "binyan" && (
                <>
                  <span className="word">{o.label}</span>
                  <span className="sub">{o.sub}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function Typing() {
    const L = q.answer!.length;
    return (
      <>
        <div className="slots">
          {Array.from({ length: L }, (_, i) => {
            const c = s.typed[i];
            let cls = "slot";
            if (s.answered) cls += c === q.answer![i] ? " correct" : " wrong";
            else if (!c) cls += " empty";
            return (
              <div key={i} className={cls}>
                {c ?? ""}
              </div>
            );
          })}
        </div>
        {!s.answered && (
          <div className="kb">
            {KEY_ROWS.map((r) => (
              <div className="krow" key={r}>
                {r.split("").map((c) => (
                  <button key={c} type="button" onClick={() => typeKey(c)}>
                    {c}
                  </button>
                ))}
              </div>
            ))}
            <div className="krow">
              <button type="button" className="wide" onClick={() => typeKey("⌫")}>
                delete
              </button>
              <button type="button" className="wide go" onClick={() => submitTyped()}>
                check
              </button>
            </div>
            <p className="micro muted" style={{ textAlign: "center", marginTop: 6 }}>
              Tap letters, or type — Hebrew or the English keys in the same spots.
            </p>
          </div>
        )}
      </>
    );
  }

  function Sheet() {
    const good = s.lastCorrect;
    const st = useProgress.getState().p.roots[root.r];
    let head: React.ReactNode = pick(PRAISE);
    if (!good) {
      if (q.mode === "oddOne" && q.odd) {
        const ow = q.opts!.find((o) => o.ok)!.w!;
        head = (
          <span>
            <Heb>{wordText(ow.h)}</Heb> is from <Heb>{rootDisplay(q.odd)}</Heb> ({q.odd.m})
          </span>
        );
      } else if (q.mode === "whichBinyan" && q.binyan) {
        head = (
          <span>
            <Heb>{wordText(q.word!.h)}</Heb> is <Heb>{BINYAN_BY_ID[q.binyan].he}</Heb> ({q.binyan})
          </span>
        );
      } else {
        head = (
          <span>
            The root is <Heb>{rootDisplay(root)}</Heb> ({root.m})
          </span>
        );
      }
    } else if (q.mode === "hearWord") {
      head = (
        <span>
          {pick(PRAISE)} <Heb>{wordText(q.word!.h)}</Heb> — {q.word!.g}
        </span>
      );
    }
    const last = s.i + 1 >= s.queue.length;
    return (
      <div className={"sheet " + (good ? "good" : "bad")}>
        <div className="head">
          <span>{head}</span>
          <span className="xp tnum">{good ? `+${s.lastXp} XP` : "again soon"}</span>
        </div>
        <div className="meta">
          {good && (
            <>
              <Heb className="tracked">{rootDisplay(root)}</Heb> · {root.m} ·{" "}
            </>
          )}
          {root.cat} · mastery {mastery(st)}/5
        </div>
        <WordList words={root.words.slice(0, 6)} compact />
        {root.note && <div className="note">{root.note}</div>}
        <button type="button" className="btn primary block" onClick={() => next()} autoFocus>
          {last ? "Finish" : "Next"}
        </button>
      </div>
    );
  }

  function Learn() {
    return (
      <div className="learn">
        <div className="eyebrow">New root</div>
        <div className="glyph hero" lang="he">
          {rootDisplay(root)}
        </div>
        <div className="m">{root.m}</div>
        <div className="muted">
          {root.cat} · {root.words.length} words
        </div>
        <WordList words={root.words.slice(0, 5)} compact showForm />
        {root.note && (
          <p className="small" style={{ marginTop: 12, opacity: 0.85 }}>
            {root.note}
          </p>
        )}
        <div className="spacer" />
        <button
          type="button"
          className="btn primary block big"
          onClick={() => dismissLearn()}
          autoFocus
        >
          Got it — quiz me
        </button>
        <button
          type="button"
          className="btn ghost block"
          style={{ marginTop: 10 }}
          onClick={() => {
            end();
            setView("path");
          }}
        >
          Not now
        </button>
      </div>
    );
  }
}

function HearPrompt({ text }: { text: string }) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const t = setTimeout(() => speak(text), 250);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <>
      <SpeakButton text={text} big label="Play again" />
      <div className="sub">Tap to hear it again</div>
    </>
  );
}
