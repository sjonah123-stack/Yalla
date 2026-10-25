import { useEffect, useLayoutEffect, useState } from "react";
import type { Root } from "../types";
import { ROOTS } from "../data/roots";
import { SECTIONS } from "../data/course";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import {
  ROOT_DECK_SIZES,
  ROOT_SCOPES,
  rootDeck,
  rootPool,
  type RootDeckSize,
  type RootDeckSpec,
  type RootScope,
} from "../lib/cards";
import { rootDisplay } from "../lib/hebrew";
import { initSpeech } from "../lib/speech";
import { WordList } from "../components/WordList";
import { SpeakButton } from "../components/SpeakButton";
import { SwipeDeck } from "../components/SwipeDeck";

const SPEC_KEY = "yalla.rootCards";

const SCOPE_LABEL: Record<RootScope, string> = {
  all: "All",
  due: "Due",
  learning: "Learning",
  memorized: "Memorized",
  unmet: "Not met",
  tricky: "Tricky",
};

interface Saved extends RootDeckSpec {
  /** Meaning on the front instead of the root. */
  english: boolean;
}

const DEFAULTS: Saved = { scope: "all", cat: null, size: 20, english: false };

function loadSaved(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(SPEC_KEY) ?? "null") as Partial<Saved> | null;
    if (!s) return DEFAULTS;
    return {
      scope: ROOT_SCOPES.includes(s.scope as RootScope) ? (s.scope as RootScope) : "all",
      cat: SECTIONS.some((x) => x.cat === s.cat) ? (s.cat as string) : null,
      size: ROOT_DECK_SIZES.includes(s.size as RootDeckSize) ? (s.size as RootDeckSize) : 20,
      english: s.english === true,
    };
  } catch {
    return DEFAULTS;
  }
}
function save(s: Saved) {
  try {
    localStorage.setItem(SPEC_KEY, JSON.stringify(s));
  } catch {
    /* storage blocked */
  }
}

/**
 * Flashcards over the whole root bank (Home → Flashcards, or Roots tab → Flashcards): pick which
 * roots (status chip, theme, deck size, which face is up), then swipe. Practice only — Know /
 * Still learning loop the deck but never touch a root's schedule, word memory or rewards.
 */
export default function RootCards({ scope }: { scope?: RootScope }) {
  const leave = useUi((s) => s.leaveTool);
  const roots = useProgress((s) => s.p.roots);
  const [spec, setSpec] = useState<Saved>(() => {
    const s = loadSaved();
    return scope ? { ...s, scope, cat: scope === "all" ? s.cat : null } : s;
  });
  const [deck, setDeck] = useState<Root[] | null>(null);
  const [run, setRun] = useState(0);
  const now = Date.now();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, [deck]);
  useEffect(() => {
    void initSpeech();
  }, []);
  useEffect(() => {
    if (deck) return; // SwipeDeck owns Escape while a deck runs.
    const k = (e: KeyboardEvent) => e.key === "Escape" && leave();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [deck, leave]);

  const update = (patch: Partial<Saved>) =>
    setSpec((s) => {
      const next = { ...s, ...patch };
      save(next);
      return next;
    });
  const deal = () => {
    setDeck(rootDeck(ROOTS, { roots }, spec, now));
    setRun((r) => r + 1);
  };

  if (deck)
    return (
      <div className="tool">
        <RootDeck
          key={run}
          deck={deck}
          english={spec.english}
          onFlip={() => update({ english: !spec.english })}
          onClose={() => setDeck(null)}
          onAgain={deal}
          onLeave={leave}
        />
      </div>
    );

  const pool = rootPool(ROOTS, { roots }, spec, now);
  const n = spec.size ? Math.min(spec.size, pool.length) : pool.length;
  const scopeCount = (s: RootScope) =>
    rootPool(ROOTS, { roots }, { scope: s, cat: spec.cat }, now).length;
  const catCount = (cat: string | null) =>
    rootPool(ROOTS, { roots }, { scope: spec.scope, cat }, now).length;
  const scopes = ROOT_SCOPES.filter((s) => s !== "tricky" || s === spec.scope || scopeCount(s) > 0);

  return (
    <div className="tool page rc">
      <div className="rail">
        <button type="button" className="x" aria-label="Close" onClick={leave}>
          ×
        </button>
        <span className="ttl">Root flashcards</span>
        <span className="cnt tnum">{ROOTS.length} roots</span>
      </div>

      <div className="ph-h">
        <h1>Every root, one card each</h1>
        <p>
          The root on the front; its meaning and word family on the back. Practice only: your
          review schedule stays as it is.
        </p>
      </div>

      <div className="group-h rc-h">
        <span className="eyebrow">Which roots</span>
      </div>
      <div className="chips scroll">
        {scopes.map((s) => (
          <button
            key={s}
            type="button"
            className="chip toggle"
            aria-pressed={spec.scope === s}
            onClick={() => update({ scope: s })}
          >
            {SCOPE_LABEL[s]} <span className="tnum">{scopeCount(s)}</span>
          </button>
        ))}
      </div>

      <div className="group-h rc-h">
        <span className="eyebrow">Theme</span>
      </div>
      <div className="chips scroll">
        <button
          type="button"
          className="chip toggle"
          aria-pressed={spec.cat === null}
          onClick={() => update({ cat: null })}
        >
          All themes <span className="tnum">{catCount(null)}</span>
        </button>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className="chip toggle"
            aria-pressed={spec.cat === sec.cat}
            onClick={() => update({ cat: sec.cat })}
          >
            {sec.title} <span className="tnum">{catCount(sec.cat)}</span>
          </button>
        ))}
      </div>

      <div className="group-h rc-h">
        <span className="eyebrow">Deck</span>
      </div>
      <div className="chips">
        {ROOT_DECK_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className="chip toggle"
            aria-pressed={spec.size === size}
            onClick={() => update({ size })}
          >
            {size ? `${size} cards` : "Every one"}
          </button>
        ))}
      </div>

      <div className="group-h rc-h">
        <span className="eyebrow">Front of the card</span>
      </div>
      <div className="chips">
        <button
          type="button"
          className="chip toggle"
          aria-pressed={!spec.english}
          onClick={() => update({ english: false })}
        >
          Root → meaning
        </button>
        <button
          type="button"
          className="chip toggle"
          aria-pressed={spec.english}
          onClick={() => update({ english: true })}
        >
          Meaning → root
        </button>
      </div>

      <div className="rc-go">
        <button type="button" className="btn primary block" disabled={!n} onClick={deal}>
          {n ? `Start · ${n} card${n === 1 ? "" : "s"}` : "No roots match"}
        </button>
        {spec.size > 0 && pool.length > spec.size && (
          <p className="small muted">
            A random {spec.size} of {pool.length}; every new deck is a fresh draw.
          </p>
        )}
      </div>
    </div>
  );
}

function RootDeck({
  deck,
  english,
  onFlip,
  onClose,
  onAgain,
  onLeave,
}: {
  deck: Root[];
  english: boolean;
  onFlip: () => void;
  onClose: () => void;
  onAgain: () => void;
  onLeave: () => void;
}) {
  const glyph = (r: Root) => (
    <span className="glyph" lang="he">
      {rootDisplay(r)}
    </span>
  );
  return (
    <SwipeDeck
      items={deck}
      keyOf={(r) => r.r}
      title="Root flashcards"
      onClose={onClose}
      shuffled={false}
      railExtra={
        <button
          type="button"
          className="cd-face"
          onClick={onFlip}
          aria-label={english ? "Show the root first" : "Show the meaning first"}
        >
          {english ? "EN → שׁ" : "שׁ → EN"}
        </button>
      }
      hint={english ? "Name the root, then flip" : "Tap to flip · → know · ← again"}
      front={(r) => (english ? <div className="cd-en">{r.m}</div> : glyph(r))}
      back={(r) => (
        <>
          <div className="row between">
            {glyph(r)}
            <SpeakButton text={r.words[0].h} />
          </div>
          <div className="m">{r.m}</div>
          <div className="small" style={{ opacity: 0.8 }}>
            {r.cat} · {r.words.length} words
          </div>
          <div style={{ marginTop: 8 }}>
            <WordList words={r.words.slice(0, 4)} compact showForm={false} />
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
              Flashcards get them familiar. Lessons and reviews are what lock them in.
            </p>
          </section>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn primary" onClick={onAgain}>
              New deck
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Change deck
            </button>
            <button type="button" className="btn" onClick={onLeave}>
              Done
            </button>
          </div>
        </div>
      )}
    />
  );
}
