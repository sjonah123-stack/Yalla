import { useEffect, useLayoutEffect, useState } from "react";
import { ROOTS } from "../data/roots";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { confusions, mistakeRoots } from "../lib/mistakes";
import { rootLetters } from "../lib/hebrew";
import { MODE_TITLE } from "../lib/quiz";
import { agoLabel } from "../lib/labels";
import { Heb } from "../components/Heb";
import type { Root } from "../types";

const BY_ID = new Map(ROOTS.map((r) => [r.r, r]));
/** How many recent misses the list shows. */
const RECENT = 30;
const HEBREW = /[\u0590-\u05FF]/;

/** A picked answer: Hebrew (a root or a word) or an English meaning. */
const Picked = ({ text }: { text: string }) =>
  HEBREW.test(text) ? <Heb>{text}</Heb> : <b>{text}</b>;

function Side({ root, onOpen }: { root: Root; onOpen: (id: string) => void }) {
  const w = root.words[0];
  return (
    <button type="button" className="side" onClick={() => onOpen(root.r)}>
      <span className="glyph" lang="he">
        {rootLetters(root)}
      </span>
      <span className="short">{root.short}</span>
      {w && (
        <span className="w">
          <Heb className="word">{w.h}</Heb>
          <span className="g">{w.g}</span>
        </span>
      )}
    </button>
  );
}

/** The mistake notebook: fix round, mixed-up pairs, and the recent misses. */
export default function Notebook() {
  const p = useProgress((s) => s.p);
  const leave = useUi((s) => s.leaveTool);
  const openRoot = useUi((s) => s.openRoot);
  const [now] = useState(() => Date.now());

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [leave]);

  const toFix = mistakeRoots(ROOTS, p, now);
  const fixIds = new Set(toFix.map((m) => m.root.r));
  const mixes = confusions(ROOTS, p);
  const recent = p.mistakes.slice(-RECENT).reverse();

  const fix = () => {
    if (useSession.getState().start({ kind: "practice", focus: "mistakes" }))
      useUi.getState().setView("play");
    else useUi.getState().showToast("Nothing to fix right now.");
  };

  return (
    <div className="tool nb">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Notebook</span>
        <span className="cnt tnum">{toFix.length} to fix</span>
      </div>

      <h2>Mistake notebook</h2>
      <p className="nb-lede">
        Misses from the last three weeks wait here until you've proven the root again.
      </p>

      {toFix.length > 0 ? (
        <section className="nb-fix">
          <button type="button" className="btn primary block big" onClick={fix}>
            Fix my mistakes
          </button>
          <p className="small muted tnum">
            {toFix.length} root{toFix.length === 1 ? "" : "s"} · most-missed first
          </p>
          <div className="nb-chips">
            {toFix.slice(0, 10).map((m) => (
              <button
                key={m.root.r}
                type="button"
                className="nb-chip"
                onClick={() => openRoot(m.root.r)}
                aria-label={`${rootLetters(m.root)}, ${m.root.short}, missed ${m.count} times`}
              >
                <span className="glyph" lang="he">
                  {rootLetters(m.root)}
                </span>
                {m.count > 1 && <span className="k tnum">×{m.count}</span>}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="block gold nb-empty">
          <div className="eyebrow">Clean slate</div>
          <p>
            Nothing to fix. Every miss lands here, and leaves once you've answered that root right
            again. Keep going.
          </p>
          <button type="button" className="btn inert block" disabled>
            Fix my mistakes
          </button>
        </section>
      )}

      {mixes.length > 0 && (
        <section className="nb-sec">
          <div className="eyebrow">Mix-ups</div>
          <div className="nb-mixes">
            {mixes.map((c) => (
              <div className="nb-mix" key={c.a.r + c.b.r}>
                <Side root={c.a} onOpen={openRoot} />
                <span className="vs" aria-hidden="true">
                  ≠
                </span>
                <Side root={c.b} onOpen={openRoot} />
                <div className="cnt tnum">confused {c.count}×</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="nb-sec">
          <div className="eyebrow">Recent</div>
          <ul className="nb-list">
            {recent.map((m, i) => {
              const root = BY_ID.get(m.root);
              if (!root) return null;
              const fixed = !fixIds.has(root.r);
              return (
                <li key={m.at + ":" + i}>
                  <button type="button" className="nb-row" onClick={() => openRoot(root.r)}>
                    <span className="glyph" lang="he">
                      {rootLetters(root)}
                    </span>
                    <span className="txt">
                      <span className="pk">
                        <span aria-hidden="true">✗ </span>
                        <span className="sr-only">You picked </span>
                        <Picked text={m.picked} />
                      </span>
                      <span className="rt">
                        <span aria-hidden="true">✓ </span>
                        <span className="sr-only">Right answer: </span>
                        {root.short}
                      </span>
                      <span className="meta">
                        {MODE_TITLE[m.mode] ?? m.mode} · {agoLabel(m.at, now)}
                      </span>
                    </span>
                    {fixed && <span className="fixed">fixed</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
