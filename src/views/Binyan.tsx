import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Binyan } from "../types";
import { BINYAN_BY_ID } from "../data/binyanim";
import { ROOTS } from "../data/roots";
import { SENTENCES } from "../data/sentences";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import {
  binyanStats,
  binyanVerbs,
  familyShowcase,
  verbsInOrder,
  type BinyanVerb,
} from "../lib/binyan";
import { isKnownWord } from "../lib/words";
import { seen } from "../lib/srs";
import { rootDisplay, rootLetters, stripNikud } from "../lib/hebrew";
import { Heb, Mixed } from "../components/Heb";
import { SpeakButton } from "../components/SpeakButton";
import { WordList } from "../components/WordList";

/** Rows shown for the roots still ahead before "show all". */
const AHEAD = 12;

/** Start a lesson on one binyan; its summary comes back to the binyan's page. */
export function startBinyanLesson(binyan: Binyan): void {
  const ui = useUi.getState();
  ui.setBinyan(binyan);
  if (useSession.getState().start({ kind: "binyan", binyan })) ui.setView("play");
  else ui.showToast("No verbs to learn here yet.");
}

/**
 * A binyan's page: how to spot it, its tenses, what it tends to mean, one root across every
 * binyan, and all its verbs — the ones from roots you've met first, each in a sentence.
 */
export default function BinyanPage({ binyan }: { binyan: Binyan }) {
  const p = useProgress((s) => s.p);
  const leave = useUi((s) => s.leaveTool);
  const openRoot = useUi((s) => s.openRoot);
  const [showAll, setShowAll] = useState(false);
  const b = BINYAN_BY_ID[binyan];

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, [binyan]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [leave]);

  const verbs = useMemo(() => binyanVerbs(binyan, ROOTS), [binyan]);
  const stats = binyanStats(binyan, ROOTS, p);
  const family = familyShowcase(binyan, ROOTS, p);
  const met = verbs.filter((v) => seen(p.roots[v.root.r]));
  const ahead = verbs.filter((v) => !seen(p.roots[v.root.r]));
  const pct = stats.total ? Math.round((stats.known / stats.total) * 100) : 0;
  const tenses: [string, string | undefined][] = [
    ["past", b.forms.past],
    ["present", b.forms.present],
    ["future", b.forms.future],
    ["to …", b.forms.inf],
  ];

  return (
    <div className="tool page bn-page">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Patterns</span>
        <span className="cnt tnum">
          {stats.known} / {stats.total} known
        </span>
      </div>

      <section className="block plum bn-hero">
        <div className="bn-top">
          <div className="bn-skel" lang="he">
            {b.skeleton}
          </div>
          <div>
            <div className="eyebrow">Binyan</div>
            <h2>{b.id}</h2>
            <div className="muted">{b.gloss}</div>
          </div>
        </div>
        <p className="bn-note">{b.note}</p>
        <div
          className="bn-meter"
          role="meter"
          aria-label={`${b.id} verbs known`}
          aria-valuemin={0}
          aria-valuemax={stats.total}
          aria-valuenow={stats.known}
        >
          <i style={{ width: pct + "%" }} />
        </div>
        <div className="small tnum">
          {stats.known} of {stats.total} verbs known · {stats.fromSeen} from roots you've met
        </div>
        <button
          type="button"
          className="btn primary block big"
          onClick={() => startBinyanLesson(binyan)}
        >
          Start a {b.id} lesson
        </button>
      </section>

      <section className="block bn-how">
        <div className="eyebrow">How to spot it</div>
        <p>
          <Mixed text={b.spot} />
        </p>
        <div className="bn-tenses" aria-label={`${b.forms.root} in ${b.id}`}>
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
      </section>

      <section className="block bn-what">
        <div className="eyebrow">What it does</div>
        <ul className="bn-uses">
          {b.uses.map((u) => (
            <li key={u.he}>
              <span className="word" lang="he">
                {u.he}
              </span>
              <SpeakButton text={u.he} />
              <span className="t">
                <b>{u.en}</b>
                <span>
                  <Mixed text={u.what} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {family && (
        <section className="block bn-family">
          <div className="eyebrow">One root, every binyan</div>
          <button type="button" className="bn-fam-root" onClick={() => openRoot(family.r)}>
            <span className="glyph" lang="he">
              {rootDisplay(family)}
            </span>
            <span>{family.m}</span>
          </button>
          <WordList
            words={verbsInOrder(family)}
            compact
            hilite={family.words.find((w) => w.b === binyan)?.h}
          />
        </section>
      )}

      <section className="bn-verbs">
        <h3>
          From roots you've met <span className="tnum">· {met.length}</span>
        </h3>
        {met.length ? (
          <VerbRows verbs={met} examples />
        ) : (
          <p className="small muted">
            None yet: the lesson starts with verbs from roots ahead on your path.
          </p>
        )}
        {ahead.length > 0 && (
          <>
            <h3>
              Still ahead <span className="tnum">· {ahead.length}</span>
            </h3>
            <VerbRows verbs={showAll ? ahead : ahead.slice(0, AHEAD)} />
            {!showAll && ahead.length > AHEAD && (
              <button type="button" className="btn text block" onClick={() => setShowAll(true)}>
                Show all {ahead.length}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );

  /** A verb per row: gloss and root on the left, the word on the right; its sentence below. */
  function VerbRows({ verbs, examples = false }: { verbs: BinyanVerb[]; examples?: boolean }) {
    const text = (h: string) => (p.settings.nikud ? h : stripNikud(h));
    return (
      <div className="words bn-rows">
        {verbs.map(({ root, word }) => {
          const ex = examples ? SENTENCES[word.h] : undefined;
          return (
            <div className="w" key={word.h}>
              <div className="g">
                <b>{word.g}</b>
                <div>
                  <span className="t">{word.t}</span> ·{" "}
                  <button
                    type="button"
                    className="bn-root"
                    onClick={() => openRoot(root.r)}
                    aria-label={`Root ${rootLetters(root)}, ${root.short}`}
                  >
                    <Heb>{rootLetters(root)}</Heb>
                  </button>
                </div>
              </div>
              <div className="h">
                <span className="word" lang="he">
                  {text(word.h)}
                </span>
                {isKnownWord(p.words[word.h]) && (
                  <span className="known" aria-label="known">
                    ✓
                  </span>
                )}
                <SpeakButton text={word.h} />
              </div>
              {ex && (
                <div className="example">
                  <span lang="he" dir="rtl">
                    {ex.he.split(word.h).map((part, i) => (
                      <span key={i}>
                        {i > 0 && <b>{text(word.h)}</b>}
                        {text(part)}
                      </span>
                    ))}
                  </span>
                  <span className="en">{ex.en}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}
