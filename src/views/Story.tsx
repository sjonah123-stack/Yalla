import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { STORIES, type Story as StoryData, type StoryTag } from "../data/stories";
import { ROOT_BY_ID } from "../data/roots";
import { segmentLine, storyStates, type StoryState } from "../lib/stories";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { PRAISE, rootDisplay, stripNikud } from "../lib/hebrew";
import { mastery, seen } from "../lib/srs";
import { memorized } from "../lib/course";
import { buzz, playCue } from "../lib/sound";
import { Heb } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";

const smooth = (): ScrollBehavior =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

// ---------- Page ----------

/** Mini stories: the library, or the reader when a story is open. */
export default function Story() {
  const storyId = useUi((s) => s.storyId);
  const story = storyId ? STORIES.find((s) => s.id === storyId) : undefined;
  return story ? <Reader key={story.id} story={story} /> : <Library />;
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="3" />
    <path
      d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

function Library() {
  const p = useProgress((s) => s.p);
  const leave = useUi((s) => s.leaveTool);
  const states = useMemo(() => storyStates(p), [p]);
  const open = states.filter((s) => s.unlocked).length;
  const fresh = states.filter((s) => s.unlocked && !s.read).length;

  useEffect(() => {
    window.scrollTo(0, 0);
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [leave]);

  return (
    <div className="tool page stories">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Stories</span>
        <span className="cnt tnum">
          {open} / {states.length} open
        </span>
      </div>
      <header className="lib-h">
        <Heb className="lib-he">סִפּוּרִים</Heb>
        <h1>Mini stories</h1>
        <p>
          Short tales built from roots you've met. Tap any highlighted word for its root. A story
          opens once you've met every root in it.
        </p>
        {fresh > 0 && (
          <span className="sbadge new">
            {fresh} new stor{fresh === 1 ? "y" : "ies"} to read
          </span>
        )}
      </header>
      <ul className="storylist">
        {states.map((st) => (
          <li key={st.story.id}>
            <StoryCard st={st} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryCard({ st }: { st: StoryState }) {
  const { story, roots, met, unlocked, read, best } = st;
  const openStory = () => {
    if (unlocked) {
      useUi.getState().openPage("story", story.id);
      return;
    }
    const missing = roots
      .filter((r) => !seen(useProgress.getState().p.roots[r]))
      .map((r) => ROOT_BY_ID[r]?.short)
      .filter(Boolean);
    const more = missing.length - 3;
    useUi
      .getState()
      .showToast(`Still to meet: ${missing.slice(0, 3).join(", ")}${more > 0 ? ` +${more}` : ""}`);
  };
  const state = !unlocked ? "locked" : read ? "read" : "new";
  return (
    <button
      type="button"
      className={"storycard " + state}
      onClick={openStory}
      aria-label={
        unlocked
          ? `${story.title}${read ? `, read, best ${best} of ${story.qs.length}` : ", new"}`
          : `${story.title}, locked: ${met} of ${roots.length} roots met`
      }
    >
      <span className="sc-main">
        <span className="sc-t">{story.title}</span>
        <Heb className="sc-he">{story.he}</Heb>
        {unlocked ? (
          <span className="sc-meta">
            {story.lines.length} lines · {roots.length} roots · {story.qs.length} questions
          </span>
        ) : (
          <span className="sc-meta">
            <span className="sc-bar" aria-hidden="true">
              <i style={{ width: (met / roots.length) * 100 + "%" }} />
            </span>
            <span className="tnum">
              {met} of {roots.length} roots met
            </span>
          </span>
        )}
      </span>
      <span className="sc-side" aria-hidden="true">
        {state === "locked" && (
          <span className="sc-lock">
            <LockIcon />
          </span>
        )}
        {state === "new" && <span className="sbadge new">New</span>}
        {state === "read" && (
          <span className="sbadge best tnum">
            Best {best}/{story.qs.length}
          </span>
        )}
      </span>
    </button>
  );
}

// ---------- Reader ----------

type Phase = "read" | "quiz" | "done";
interface Picked {
  line: number;
  tag: number;
  /** The tapped word's centre, as a % of the line's width: where the card's notch points. */
  x: number;
}

function Reader({ story }: { story: StoryData }) {
  const leave = useUi((s) => s.leaveTool);
  const nikud = useProgress((s) => s.p.settings.nikud);
  const sounds = useProgress((s) => s.p.settings.sounds);
  const [prevBest] = useState(() => useProgress.getState().p.stories[story.id]?.best ?? null);
  const [shown, setShown] = useState(1);
  const [english, setEnglish] = useState(false);
  const [word, setWord] = useState<Picked | null>(null);
  const [phase, setPhase] = useState<Phase>("read");
  const [peek, setPeek] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState<{ xp: number; shekels: number; first: boolean } | null>(
    null,
  );
  const [praise] = useState(() => PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  const finished = useRef(false);
  const lastLine = useRef<HTMLLIElement | null>(null);
  const segments = useMemo(() => story.lines.map((l) => segmentLine(l.he, l.tags)), [story]);
  const text = (h: string) => (nikud ? h : stripNikud(h));
  const total = story.qs.length;
  const allShown = shown >= story.lines.length;
  const toLibrary = () => useUi.setState({ storyId: null });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const nextLine = () => {
    if (allShown) return;
    setShown((n) => n + 1);
    setWord(null);
    if (sounds) playCue("page");
    // Bring the new line into view once it has rendered.
    requestAnimationFrame(() =>
      lastLine.current?.scrollIntoView({ behavior: smooth(), block: "center" }),
    );
  };
  const startQuiz = () => {
    setWord(null);
    setPhase("quiz");
  };
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === story.qs[qi].a;
    if (ok) setRight((r) => r + 1);
    if (sounds) {
      playCue(ok ? "good" : "bad");
      buzz(ok ? 12 : [20, 30, 20]);
    }
  };
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const r = useProgress.getState().finishStory(story.id, right);
    setResult(r);
    setPhase("done");
    if (sounds) {
      playCue("done");
      if (r.shekels) setTimeout(() => playCue("coin"), 500);
    }
  };
  const nextQuestion = () => {
    if (qi + 1 >= total) return finish();
    setQi(qi + 1);
    setPicked(null);
  };

  // Keys: Escape closes the word card, then the page; Enter / space advance; 1–4 answer.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        if (word) setWord(null);
        else leave();
        return;
      }
      const onButton = (e.target as HTMLElement | null)?.closest?.("button");
      if (phase === "read" && e.key === "Enter" && !onButton) {
        e.preventDefault();
        if (allShown) startQuiz();
        else nextLine();
      } else if (phase === "quiz") {
        if (picked === null && /^[1-4]$/.test(e.key) && +e.key <= story.qs[qi].opts.length)
          pick(+e.key - 1);
        else if (picked !== null && (e.key === "Enter" || e.key === " ") && !onButton) {
          e.preventDefault();
          nextQuestion();
        }
      }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });

  const lines = (compact: boolean) => (
    <ol className={"lines" + (compact ? " compact" : "")}>
      {story.lines.slice(0, compact ? story.lines.length : shown).map((l, i) => {
        const cur = !compact && i === shown - 1;
        return (
          <li key={i} className={"line" + (cur ? " cur" : "")} ref={cur ? lastLine : undefined}>
            <div className="ln-row">
              <p className="ln-he" lang="he" dir="rtl">
                {segments[i].map((seg, j) =>
                  seg.tag === undefined ? (
                    <Fragment key={j}>{text(seg.text)}</Fragment>
                  ) : (
                    <button
                      key={j}
                      type="button"
                      className={"stag" + (word?.line === i && word.tag === seg.tag ? " on" : "")}
                      aria-expanded={word?.line === i && word.tag === seg.tag}
                      onClick={(e) => {
                        const li = e.currentTarget.closest("li")!.getBoundingClientRect();
                        const b = e.currentTarget.getBoundingClientRect();
                        const x = ((b.left + b.width / 2 - li.left) / li.width) * 100;
                        const tag = seg.tag!;
                        setWord((w) =>
                          w?.line === i && w.tag === tag
                            ? null
                            : { line: i, tag, x: Math.min(92, Math.max(8, x)) },
                        );
                      }}
                    >
                      {text(seg.text)}
                    </button>
                  ),
                )}
              </p>
              <SpeakButton text={l.he} label="Hear this line" />
            </div>
            {english && <p className="ln-en">{l.en}</p>}
            {word?.line === i && l.tags[word.tag] && (
              <WordCard
                tag={l.tags[word.tag]}
                x={word.x}
                text={text}
                onClose={() => setWord(null)}
              />
            )}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className={"tool page reader " + phase}>
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Story</span>
        <button type="button" className="btn sm quiet libbtn" onClick={toLibrary}>
          All stories
        </button>
      </div>

      <header className="rd-h">
        <Heb className="rd-he">{text(story.he)}</Heb>
        <h1 className="rd-t">{story.title}</h1>
        {phase !== "done" && (
          <div className="rd-tools">
            <button
              type="button"
              className="chip toggle"
              aria-pressed={english}
              onClick={() => setEnglish((v) => !v)}
            >
              English
            </button>
            {phase === "quiz" && (
              <button
                type="button"
                className="chip toggle"
                aria-pressed={peek}
                onClick={() => setPeek((v) => !v)}
              >
                Show the story
              </button>
            )}
            {phase === "read" && <span className="hint">Tap a highlighted word</span>}
          </div>
        )}
      </header>

      {phase === "read" && (
        <>
          <section className="page-card">{lines(false)}</section>
          <div className="rd-foot">
            <div className="rd-dots" aria-label={`Line ${shown} of ${story.lines.length}`}>
              {story.lines.map((_, i) => (
                <i key={i} className={i < shown ? "on" : ""} />
              ))}
            </div>
            {allShown ? (
              <button type="button" className="btn primary block big" onClick={startQuiz}>
                Answer {total} question{total === 1 ? "" : "s"}
              </button>
            ) : (
              <button type="button" className="btn plum block big" onClick={nextLine}>
                Next line
              </button>
            )}
          </div>
        </>
      )}

      {phase === "quiz" && (
        <>
          {peek && <section className="page-card peek">{lines(true)}</section>}
          <Question
            n={qi}
            total={total}
            q={story.qs[qi]}
            picked={picked}
            onPick={pick}
            onNext={nextQuestion}
          />
        </>
      )}

      {phase === "done" && result && (
        <Finish
          story={story}
          right={right}
          result={result}
          prevBest={prevBest}
          praise={praise}
          onLibrary={toLibrary}
          onDone={leave}
        />
      )}
    </div>
  );
}

/** The popover under a line: the tapped word's root, its meaning and how well you know it. */
function WordCard({
  tag,
  x,
  text,
  onClose,
}: {
  tag: StoryTag;
  x: number;
  text: (h: string) => string;
  onClose: () => void;
}) {
  const root = ROOT_BY_ID[tag.r];
  const st = useProgress((s) => s.p.roots[tag.r]);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: smooth(), block: "nearest" });
  }, [tag]);
  if (!root) return null;
  const exact = root.words.find((w) => w.h === tag.w);
  const m = mastery(st);
  const [cls, status] = memorized(st)
    ? ["mem", "Memorized"]
    : seen(st)
      ? ["learning", `Learning · mastery ${m}/5`]
      : ["unmet", "Not met yet"];
  return (
    <div
      className="wordcard"
      ref={ref}
      role="group"
      aria-label={`Root of ${tag.w}`}
      style={{ "--nx": `${x}%` } as React.CSSProperties}
    >
      <div className="wc-top">
        <Heb className="wc-w">{text(tag.w)}</Heb>
        <SpeakButton text={tag.w} />
        {exact && (
          <span className="wc-g">
            {exact.g} · <i>{exact.t}</i>
          </span>
        )}
        <button type="button" className="wc-x" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="wc-root">
        <span className="glyph" lang="he">
          {rootDisplay(root)}
        </span>
        <span className="wc-txt">
          <b>{root.short}</b>
          <span>{root.m}</span>
        </span>
      </div>
      <span className={"wc-status " + cls}>{status}</span>
    </div>
  );
}

function Question({
  n,
  total,
  q,
  picked,
  onPick,
  onNext,
}: {
  n: number;
  total: number;
  q: StoryData["qs"][number];
  picked: number | null;
  onPick: (i: number) => void;
  onNext: () => void;
}) {
  const answered = picked !== null;
  const ok = picked === q.a;
  return (
    <section className="storyq" key={n}>
      <div className="sq-card">
        <div className="eyebrow tnum">
          Question {n + 1} of {total}
        </div>
        <p className="sq-q">{q.q}</p>
      </div>
      <div className="sq-opts">
        {q.opts.map((o, i) => {
          let cls = "sq-opt";
          if (answered) {
            if (i === q.a) cls += " correct";
            else if (i === picked) cls += " wrong";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => onPick(i)}
            >
              <span className="k" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="o">{o}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={"sq-fb " + (ok ? "good" : "bad")} role="status">
          <span className="sq-fb-t">
            {ok ? (
              "Right!"
            ) : (
              <>
                Not quite. The answer: <b>{q.opts[q.a]}</b>
              </>
            )}
          </span>
          <button type="button" className="btn primary block" onClick={onNext} autoFocus>
            {n + 1 >= total ? "See how you did" : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}

function Finish({
  story,
  right,
  result,
  prevBest,
  praise,
  onLibrary,
  onDone,
}: {
  story: StoryData;
  right: number;
  result: { xp: number; shekels: number; first: boolean };
  prevBest: number | null;
  praise: string;
  onLibrary: () => void;
  onDone: () => void;
}) {
  const total = story.qs.length;
  const best = Math.max(prevBest ?? 0, right);
  const newBest = prevBest !== null && right > prevBest;
  const roots = useMemo(
    () =>
      [...new Set(story.lines.flatMap((l) => l.tags.map((t) => t.r)))].map((r) => ROOT_BY_ID[r]),
    [story],
  );
  return (
    <div className="story-done">
      <section className="block plum sd-card">
        <div className="eyebrow">Story complete</div>
        <Heb className="sd-praise">{right === total ? "מְצֻיָּן!" : praise}</Heb>
        <div className="sd-score tnum">
          {right}
          <span>/{total}</span>
        </div>
        <div className="sd-l">questions right</div>
        {result.first ? (
          <div className="sd-pills">
            <span className="sd-pill xp tnum">+{result.xp} XP</span>
            {result.shekels > 0 && <span className="sd-pill shek tnum">+₪{result.shekels}</span>}
          </div>
        ) : (
          <div className="sd-pills">
            <span className="sd-pill best tnum">
              {newBest ? "New best" : "Best"} {best}/{total}
            </span>
          </div>
        )}
        {!result.first && (
          <p className="sd-note">
            XP and shekels are paid on the first read. Re-reads still count.
          </p>
        )}
      </section>
      <div className="sd-roots">
        <div className="eyebrow">Roots in this story</div>
        <div className="chips">
          {roots.map(
            (r) =>
              r && (
                <span className="chip" key={r.r}>
                  <Heb>{rootDisplay(r)}</Heb> · {r.short}
                </span>
              ),
          )}
        </div>
      </div>
      <div className="btn-row sd-btns">
        <button type="button" className="btn" onClick={onLibrary}>
          Back to stories
        </button>
        <button type="button" className="btn primary" onClick={onDone} autoFocus>
          Done
        </button>
      </div>
    </div>
  );
}
