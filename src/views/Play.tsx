import { Fragment, useEffect, useRef, useState } from "react";
import type React from "react";
import { planRules, useSession, type Plan } from "../store/session";
import { useFlag, useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { KEY_ROWS, PRAISE, keyToHebrew, rootDisplay, sameLetters, stripNikud } from "../lib/hebrew";
import { mastery } from "../lib/srs";
import { unitTitle } from "../lib/course";
import { COURSE } from "../store/course";
import { speak } from "../lib/speech";
import { buzz, playCue } from "../lib/sound";
import { FEVER, FEVER_MULT, feverLevel, formBadge } from "../lib/quiz";
import { FLAG_LABEL, isActiveFlag } from "../lib/flags";
import { SPEED_MISS_MS, SPEED_MS } from "../lib/speed";
import { BINYAN_BY_ID } from "../data/binyanim";
import { SECTION_BY_ID } from "../data/course";
import { SENTENCES } from "../data/sentences";
import { verbsInOrder } from "../lib/binyan";
import { WordList } from "../components/WordList";
import { SpeakButton } from "../components/SpeakButton";
import { Heb, Mixed } from "../components/Heb";
import Summary from "./Summary";
import type { FlagReason, Sentence } from "../types";

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/** A small tag over the question for the focused session kinds. */
function planTag(plan: Plan): string | null {
  if (plan.kind === "daily") return "Root of the day";
  if (plan.kind === "binyan") return `${plan.binyan} lesson`;
  if (plan.kind !== "practice") return null;
  if (plan.focus === "tricky") return "Tricky roots";
  if (plan.focus === "mistakes") return "Fix my mistakes";
  if (plan.focus === "restock") {
    const sec = SECTION_BY_ID[plan.section];
    return sec ? `Restock · ${sec.title} stall` : "Restock the Shuk";
  }
  return null;
}

/** This answer lit (or stoked) the combo fever. */
const crossedFever = (combo: number): boolean => feverLevel(combo) > feverLevel(combo - 1);

export default function Play() {
  const s0 = useSession((st) => st.s);
  const { pickOption, typeKey, submitTyped, next, end, dismissLearn } = useSession.getState();
  const nikud = useProgress((st) => st.p.settings.nikud);
  const setView = useUi((st) => st.setView);

  // Physical keyboard: 1–4 pick, Enter/Space advance, Hebrew or QWERTY-positional typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const st = useSession.getState().s;
      if (!st || st.done) return;
      if (st.learning || st.intro) {
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
      if (st.q?.mode === "typeRoot" || st.q?.mode === "typeWord") {
        if (e.key === "Backspace") {
          e.preventDefault();
          typeKey("⌫");
        } else if (e.key === "Enter") submitTyped();
        else {
          const h = keyToHebrew(e.key);
          if (h) typeKey(h);
        }
      } else if (/^[1-4]$/.test(e.key)) pickOption(+e.key - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickOption, typeKey, submitTyped, next, dismissLearn]);

  // Speed round: a 60-second clock that scores the run when it hits zero.
  const isSpeed = s0?.plan.kind === "speed";
  const sessionDone = !!s0?.done;
  const startedAt = s0?.startedAt ?? 0;
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!isSpeed || sessionDone) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (startedAt + SPEED_MS - Date.now() <= 0) {
        clearInterval(id);
        useSession.getState().timeUp();
      }
    }, 100);
    return () => clearInterval(id);
  }, [isSpeed, sessionDone, startedAt]);

  // Test / placement / speed: no feedback sheet — tick, then move on.
  const feedbackEach = s0 ? planRules(s0.plan).feedbackEach : true;
  const answered = !!s0?.answered;
  const qi = s0?.i ?? 0;
  useEffect(() => {
    if (!s0 || s0.done || !answered || feedbackEach) return;
    // A miss in a speed round holds still long enough to read the right answer.
    const t = setTimeout(() => next(), isSpeed && !s0.lastCorrect ? SPEED_MISS_MS : 450);
    return () => clearTimeout(t);
  }, [answered, qi, feedbackEach, isSpeed, next]); // eslint-disable-line react-hooks/exhaustive-deps

  // One blip (and a buzz) per answer, right / wrong; a rising arpeggio when fever catches.
  const slotIdx = s0?.slot ?? 0;
  useEffect(() => {
    if (!answered) return;
    if (!useProgress.getState().p.settings.sounds) return;
    const st = useSession.getState().s;
    const ok = !!st?.lastCorrect;
    const fever = ok && !!st && st.plan.kind !== "placement" && crossedFever(st.combo);
    playCue(fever ? "fever" : ok ? "good" : "bad");
    buzz(fever ? [12, 40, 12, 40, 24] : ok ? 12 : [20, 30, 20]);
  }, [qi, slotIdx, answered]);

  if (!s0) return null;
  const s = s0;
  if (s.done) return <Summary />;
  const planLabel =
    s.plan.kind === "test"
      ? `Test · ${unitTitle(COURSE.byId[s.plan.unit])} · `
      : s.plan.kind === "placement"
        ? "Placement · "
        : s.plan.kind === "speed"
          ? `Speed · ${s.ok} right · `
          : "";
  const left = Math.max(0, s.startedAt + SPEED_MS - Math.max(now, s.startedAt));
  const clock = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`;
  const q = s.q!;
  const root = q.root;
  const wordText = (h: string) => (nikud ? h : stripNikud(h));
  // Placement pays no XP, so it has no fever.
  const feverOn = s.plan.kind !== "placement";
  const fever = feverOn ? feverLevel(s.combo) : 0;
  const feverPop = feverOn && s.answered && s.lastCorrect && crossedFever(s.combo);
  const tag = planTag(s.plan);

  /** Report (or un-report) the current root's content. */
  const toggleFlag = async (flagged: boolean) => {
    const ui = useUi.getState();
    if (flagged) {
      useProgress.getState().unflagRoot(root.r);
      ui.showToast("Flag cleared");
      return;
    }
    const v = await ui.confirm({
      title: "What's wrong?",
      body: `${rootDisplay(root)} · ${root.short}`,
      actions: [
        ...Object.entries(FLAG_LABEL).map(([value, label]) => ({ label, value })),
        { label: "Cancel", value: "cancel", kind: "text" as const },
      ],
    });
    if (!v || !(v in FLAG_LABEL)) return;
    useProgress.getState().flagRoot(root.r, v as FlagReason);
    ui.showToast("Flagged for review");
  };

  return (
    <div className={"play" + (fever ? ` fever-${fever}` : "")}>
      <div className="rail">
        <button
          type="button"
          className="x"
          aria-label={
            s.plan.kind === "test" || s.plan.kind === "placement"
              ? "Leave the test"
              : isSpeed
                ? "End round"
                : "End session"
          }
          onClick={() => useSession.getState().quit()}
        >
          ×
        </button>
        {isSpeed ? (
          <>
            <div
              className="ticks speed"
              role="timer"
              aria-label={`${Math.ceil(left / 1000)} seconds left`}
            >
              <i
                className={"left" + (left < 10000 ? " low" : "")}
                style={{ width: (left / SPEED_MS) * 100 + "%" }}
              />
            </div>
            <span className="clock tnum">{clock}</span>
          </>
        ) : (
          <div className="ticks" aria-label={`Question ${s.i + 1}`}>
            {s.ticks.map((t, i) => (
              <i key={i} className={t === "pending" && i === s.slot ? "current" : t} />
            ))}
          </div>
        )}
        {feverOn && <FeverMeter combo={s.combo} />}
      </div>

      {feverPop && (
        <div className={"feverpop lv" + fever} key={`fp-${s.i}-${s.slot}`} aria-hidden="true">
          {fever === 2 ? "×2 · on fire!" : "Fever ×1.5!"}
        </div>
      )}

      <div className={"stage" + (s.answered ? " dim" : "")} key={`${s.i}-${s.slot}`}>
        {s.answered && s.lastCorrect && s.lastXp > 0 && (
          <span className="xpfloat tnum" aria-hidden="true">
            +{s.lastXp}
          </span>
        )}
        <div className="q-in">
          {tag && <div className="plan-tag">{tag}</div>}
          <div className="title">
            {planLabel}
            {q.title}
            {q.word &&
              (q.mode === "wordRoot" || q.mode === "typeRoot" || q.mode === "guessWord") && (
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
        {q.mode === "typeRoot" || q.mode === "typeWord" ? <Typing /> : <Tiles />}
        {s.answered && feedbackEach && <Sheet />}
      </div>
      {s.learning && <Learn />}
      {s.intro && s.plan.kind === "binyan" && <BinyanIntro />}
    </div>
  );

  function Prompt() {
    switch (q.mode) {
      case "rootMeaning":
        return (
          <>
            <div className="glyph hero" lang="he">
              {rootDisplay(root)}
            </div>
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
      case "typeWord":
        return (
          <>
            <HearPrompt text={q.word!.h} />
            <div className="gloss">{q.word!.g}</div>
          </>
        );
      case "cloze": {
        const parts = q.sentence!.he.split(q.word!.h);
        return (
          <>
            <div className="cloze" lang="he" dir="rtl">
              {parts.map((part, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="blank">…</span>}
                  {wordText(part)}
                </Fragment>
              ))}
            </div>
            <div className="gloss">{q.sentence!.en}</div>
          </>
        );
      }
      case "buildWord": {
        const badge = formBadge(q.form!);
        return (
          <>
            <div className="glyph hero" lang="he">
              {rootDisplay(root)}
            </div>
            <div className="gloss">{root.m}</div>
            <div className="form-badge">
              {badge.he && <Heb>{badge.he}</Heb>}
              <span className="id">{badge.id}</span>
              <span className="g">{badge.gloss}</span>
            </div>
          </>
        );
      }
      case "guessWord":
        return (
          <>
            <div className="guess-root">
              <span className="glyph" lang="he">
                {rootDisplay(root)}
              </span>
              <span className="s">{root.short}</span>
            </div>
            <div className="row" style={{ justifyContent: "center" }}>
              <div className="word" lang="he">
                {wordText(q.word!.h)}
              </div>
              <SpeakButton text={q.word!.h} />
            </div>
            <div className="sub">You know the root. What does this one mean?</div>
          </>
        );
      case "verbMeaning": {
        const b = BINYAN_BY_ID[q.binyan!];
        return (
          <>
            <div className="bn-clues">
              <span className="guess-root">
                <span className="glyph" lang="he">
                  {rootDisplay(root)}
                </span>
                <span className="s">{root.short}</span>
              </span>
              <span className="form-badge">
                <Heb>{b.he}</Heb>
                <span className="id">{b.id}</span>
              </span>
            </div>
            <div className="row" style={{ justifyContent: "center" }}>
              <div className="word" lang="he">
                {wordText(q.word!.h)}
              </div>
              <SpeakButton text={q.word!.h} />
            </div>
            <div className="sub">The root says what; the {b.id} pattern says how.</div>
          </>
        );
      }
      case "spotBinyan": {
        const b = BINYAN_BY_ID[q.binyan!];
        return (
          <>
            <div className="bn-ask">
              Which one is <b>{b.id}</b>?
            </div>
            <div className="form-badge">
              <Heb>{b.he}</Heb>
              <span className="g">{b.gloss}</span>
            </div>
          </>
        );
      }
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
      q.mode === "rootMeaning" || q.mode === "guessWord" || q.mode === "verbMeaning"
        ? "en"
        : q.mode === "buildWord" || q.mode === "cloze"
          ? "word"
          : q.mode === "whichBinyan"
            ? "binyan"
            : q.mode === "spotBinyan"
              ? "pattern"
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
              {/* The pattern is in the vowels: always vocalized, and no gloss to give it away. */}
              {kind === "pattern" && (
                <span className="word" lang="he">
                  {o.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function Typing() {
    const answer = q.answer!;
    const L = answer.length;
    const full = s.typed.length === L;
    return (
      <>
        <div className="slots">
          {Array.from({ length: L }, (_, i) => {
            const c = s.typed[i];
            let cls = "slot";
            if (s.answered) cls += c && sameLetters(c, answer[i]) ? " correct" : " wrong";
            else if (!c) cls += " empty";
            return (
              <div key={i} className={cls}>
                {c ?? ""}
              </div>
            );
          })}
        </div>
        {!s.answered && (
          // The phone's Hebrew keyboard, key for key: laid out left to right like the real one.
          <div className="kb" role="group" aria-label="Hebrew keyboard" dir="ltr">
            {KEY_ROWS.map((r, ri) => (
              <div className={`krow r${ri + 1}`} key={r}>
                {[...r].map((c) => (
                  <button key={c} type="button" lang="he" onClick={() => typeKey(c)}>
                    {c}
                  </button>
                ))}
                {ri === 0 && (
                  <button
                    type="button"
                    className="del"
                    aria-label="Delete"
                    onClick={() => typeKey("⌫")}
                  >
                    <IconBackspace />
                  </button>
                )}
              </div>
            ))}
            <div className="krow r4">
              <button
                type="button"
                className={"go" + (full ? " ready" : "")}
                disabled={!full}
                onClick={() => submitTyped()}
              >
                check
              </button>
            </div>
            <p className="micro muted">
              Tap the letters, or type on a keyboard: Hebrew, or the English keys in the same spots.
            </p>
          </div>
        )}
      </>
    );
  }

  function Sheet() {
    const good = s.lastCorrect;
    const st = useProgress.getState().p.roots[root.r];
    const flagged = isActiveFlag(useFlag(root.r));
    // One praise per answer, not a new one on every re-render (flagging re-renders the sheet).
    const [praise] = useState(() => pick(PRAISE));
    const nextRef = useFocusNoScroll<HTMLButtonElement>();
    let head: React.ReactNode = praise;
    if (!good) {
      if (q.mode === "whichBinyan" && q.binyan) {
        head = (
          <span>
            <Heb>{wordText(q.word!.h)}</Heb> is <Heb>{BINYAN_BY_ID[q.binyan].he}</Heb> ({q.binyan})
          </span>
        );
      } else if (q.mode === "buildWord" && q.form) {
        const badge = formBadge(q.form);
        head = (
          <span>
            <Heb>{badge.he ?? badge.gloss}</Heb> of <Heb>{rootDisplay(root)}</Heb> is{" "}
            <Heb>{wordText(q.word!.h)}</Heb> ({q.word!.g})
          </span>
        );
      } else if (q.mode === "typeWord" && q.word) {
        head = (
          <span>
            The word is <Heb>{wordText(q.word.h)}</Heb> ({q.word.g})
          </span>
        );
      } else if ((q.mode === "guessWord" || q.mode === "verbMeaning") && q.word) {
        head = (
          <span>
            <Heb>{wordText(q.word.h)}</Heb> means “{q.word.g}”
          </span>
        );
      } else if (q.mode === "spotBinyan" && q.word && q.binyan) {
        head = (
          <span>
            <Heb>{q.word.h}</Heb> is the {q.binyan}
          </span>
        );
      } else {
        head = (
          <span>
            The root is <Heb>{rootDisplay(root)}</Heb> ({root.m})
          </span>
        );
      }
    } else if (q.mode === "guessWord") {
      head = <span>{praise} New word</span>;
    } else if (q.mode === "hearWord") {
      head = (
        <span>
          {praise} <Heb>{wordText(q.word!.h)}</Heb> — {q.word!.g}
        </span>
      );
    }
    const last = s.i + 1 >= s.queue.length;
    // Framed like a card: the verdict pinned on top, Next pinned below, the details scroll
    // between them — the sheet never opens scrolled past its own verdict.
    return (
      <div className={"sheet " + (good ? "good" : "bad")} role="region" aria-label="Answer">
        <div className="head">
          <span>{head}</span>
          <span className="xp tnum">{good ? `+${s.lastXp} XP` : "again soon"}</span>
        </div>
        <div className="sheet-body">
          {s.plan.kind === "binyan" ? (
            <BinyanDetails />
          ) : (
            <>
              <div className="meta">
                {good && (
                  <>
                    <Heb className="tracked">{rootDisplay(root)}</Heb> · {root.m} ·{" "}
                  </>
                )}
                {root.cat} · mastery {mastery(st)}/5
              </div>
              {q.mode === "cloze" && q.sentence && q.word && (
                <Example sentence={q.sentence} word={q.word.h} />
              )}
              {q.mode === "guessWord" && q.word && <NewWord />}
              <WordList
                words={
                  q.mode === "guessWord" && q.word
                    ? root.words.filter((w) => w.h !== q.word!.h).slice(0, 4)
                    : root.words.slice(0, 6)
                }
                compact
              />
            </>
          )}
          {root.note && <div className="note">{root.note}</div>}
          <button type="button" className="btn text flag" onClick={() => toggleFlag(flagged)}>
            {flagged ? "Flagged ✓ · tap to clear" : "Something wrong with this root?"}
          </button>
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn primary block" onClick={() => next()} ref={nextRef}>
            {last ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  /** guessWord: the discovered family member, spelled out. */
  function NewWord() {
    const w = q.word!;
    return (
      <div className="newword">
        <div className="nw-top">
          <span className="word" lang="he">
            {wordText(w.h)}
          </span>
          <SpeakButton text={w.h} />
        </div>
        <div className="nw-g">{w.g}</div>
        <div className="nw-t">
          <i>{w.t}</i> · {w.b} · from <Heb>{rootDisplay(root)}</Heb>
        </div>
      </div>
    );
  }

  /** A sentence using the word (the cloze's, filled back in), the word picked out. */
  function Example({ sentence, word }: { sentence: Sentence; word: string }) {
    const parts = sentence.he.split(word);
    return (
      <div className="example">
        <span lang="he" dir="rtl">
          {parts.map((part, i) => (
            <Fragment key={i}>
              {i > 0 && <b>{wordText(word)}</b>}
              {wordText(part)}
            </Fragment>
          ))}
        </span>
        <span className="en">{sentence.en}</span>
      </div>
    );
  }

  /**
   * Binyan lessons: the verb in a sentence, then its siblings — the same root in the other
   * binyanim (or, after "spot the pattern", the four verbs that were on the tiles), this one lit.
   */
  function BinyanDetails() {
    const w = q.word!;
    const b = BINYAN_BY_ID[w.b as keyof typeof BINYAN_BY_ID];
    const sentence = q.sentence ?? SENTENCES[w.h];
    const siblings = verbsInOrder(root);
    const tiles = q.mode === "spotBinyan" ? q.opts!.flatMap((o) => (o.w ? [o.w] : [])) : null;
    return (
      <>
        <div className="meta">
          <Heb className="tracked">{rootDisplay(root)}</Heb> · {root.m}
          {b && (
            <>
              {" "}
              · <Heb>{b.he}</Heb> {b.id}
            </>
          )}
        </div>
        {tiles ? (
          <>
            <div className="bn-sub">The four verbs</div>
            <WordList words={tiles} compact hilite={w.h} />
          </>
        ) : (
          <>
            {sentence && <Example sentence={sentence} word={w.h} />}
            <div className="bn-sub">
              {siblings.length > 1 ? "Same root, other binyanim" : "The family"}
            </div>
            <WordList
              words={siblings.length > 1 ? siblings : root.words.slice(0, 6)}
              compact
              hilite={w.h}
            />
          </>
        )}
      </>
    );
  }

  /** Binyan lessons open on the pattern: how to spot it, its tenses, what it tends to mean. */
  function BinyanIntro() {
    const goRef = useFocusNoScroll<HTMLButtonElement>();
    if (s.plan.kind !== "binyan") return null;
    const b = BINYAN_BY_ID[s.plan.binyan];
    const verbs = new Set(s.words?.map((w) => w.h)).size;
    const tenses: [string, string | undefined][] = [
      ["past", b.forms.past],
      ["present", b.forms.present],
      ["future", b.forms.future],
      ["to …", b.forms.inf],
    ];
    return (
      <div className="learn bn-intro">
        <div className="eyebrow">Binyan lesson</div>
        <div className="glyph hero" lang="he">
          {b.skeleton}
        </div>
        <div className="m">{b.id}</div>
        <div className="muted">{b.gloss}</div>
        <div className="bn-spot">
          <Mixed text={b.spot} />
        </div>
        <div className="bn-tenses" aria-label={`${b.id} of ${b.forms.root}`}>
          {tenses
            .filter(([, he]) => !!he)
            .map(([label, he]) => (
              <div key={label}>
                <span className="word" lang="he">
                  {he}
                </span>
                <span className="l">{label}</span>
              </div>
            ))}
        </div>
        <ul className="bn-uses">
          {b.uses.map((u) => (
            <li key={u.he}>
              <span className="word" lang="he">
                {u.he}
              </span>
              <span>
                <b>{u.en}</b> · <Mixed text={u.what} />
              </span>
            </li>
          ))}
        </ul>
        <div className="muted small">{verbs} verbs: meet each one, then use it.</div>
        <div className="spacer" />
        <button
          type="button"
          className="btn primary block big"
          onClick={() => dismissLearn()}
          ref={goRef}
        >
          Start
        </button>
        <button
          type="button"
          className="btn ghost block"
          style={{ marginTop: 10 }}
          onClick={() => {
            useSession.getState().clear();
            setView("binyan");
          }}
        >
          Not now
        </button>
      </div>
    );
  }

  function Learn() {
    const goRef = useFocusNoScroll<HTMLButtonElement>();
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
          ref={goRef}
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

/**
 * Focus an element once it mounts without scrolling it into view. `autoFocus` scrolls its
 * nearest scroller, which opened the answer sheet and the learn card scrolled to their buttons,
 * past the verdict and the root.
 */
function useFocusNoScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return ref;
}

/** The keyboard's delete key: the platform's backspace glyph. */
const IconBackspace = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 5h10a2 2 0 012 2v10a2 2 0 01-2 2H9l-6-7 6-7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 9.5l5 5M17 9.5l-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

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

/**
 * Combo fever: a bar filling toward the next threshold (5, then 10). At the first the chip reads
 * ×1.5 FEVER, at the second ×2, and every right answer is multiplied.
 */
function FeverMeter({ combo }: { combo: number }) {
  const lv = feverLevel(combo);
  const [lo, hi] = lv === 0 ? [0, FEVER[0]] : [FEVER[0], FEVER[1]];
  const fill = lv === 2 ? 1 : Math.min(1, (combo - lo) / (hi - lo));
  const label = lv === 0 ? (combo > 1 ? `×${combo}` : "") : `×${FEVER_MULT[lv]} fever`;
  const text =
    lv === 0
      ? `Combo ${combo}: ${FEVER[0] - combo} more right for fever`
      : lv === 1
        ? `Fever, XP ×1.5: ${FEVER[1] - combo} more right for ×2`
        : `Fever, XP ×2`;
  return (
    <div
      className={"fever lv" + lv}
      role="meter"
      aria-label="Combo fever"
      aria-valuemin={0}
      aria-valuemax={FEVER[1]}
      aria-valuenow={Math.min(combo, FEVER[1])}
      aria-valuetext={text}
    >
      <span className="fv-l tnum" key={lv}>
        {label}
      </span>
      <span className="fv-bar">
        <i style={{ width: fill * 100 + "%" }} />
      </span>
    </div>
  );
}
