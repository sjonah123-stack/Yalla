import { memo, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { FlagReason, Root, RootFlag, RootState, Word } from "../types";
import { ROOTS } from "../data/roots";
import { BINYAN_BY_ID, isBinyan } from "../data/binyanim";
import { normLetters, rootDisplay, rootLetters, stripNikud } from "../lib/hebrew";
import { DAY, isDue, isTricky, mastery, seen } from "../lib/srs";
import { FLAG_LABEL, isActiveFlag } from "../lib/flags";
import { useFlag, useProgress } from "../store/progress";
import { useUi, type BankChip } from "../store/ui";
import { MasteryDots } from "../components/MasteryDots";
import { HeaderGear } from "../components/HeaderGear";
import { Heb } from "../components/Heb";
import { WordList } from "../components/WordList";
import { memorized, unitTitle } from "../lib/course";
import { COURSE } from "../store/course";
import { SECTION_BY_CAT } from "../data/course";

/** Does a root's state pass the selected filter chip? */
function matchesChip(
  chip: BankChip,
  st: RootState | undefined,
  now: number,
  flag: RootFlag | undefined,
): boolean {
  switch (chip) {
    case "due":
      return isDue(st, now);
    case "learning":
      return seen(st) && !memorized(st);
    case "memorized":
      return memorized(st);
    case "unmet":
      return !seen(st);
    case "tricky":
      return isTricky(st);
    case "flagged":
      return isActiveFlag(flag);
    default:
      return true;
  }
}

export default function Bank() {
  const filter = useUi((s) => s.bankFilter);
  const setFilter = useUi((s) => s.setBankFilter);
  const open = useUi((s) => s.bankOpen);
  const setOpen = useUi((s) => s.setBankOpen);
  const chip = useUi((s) => s.bankChip);
  const setChip = useUi((s) => s.setBankChip);
  const roots = useProgress((s) => s.p.roots);
  const flags = useProgress((s) => s.p.flags);
  const now = Date.now();
  const openRef = useRef<HTMLDivElement | null>(null);

  // Landing here from "open this root" (or coming back to it): bring the row into view.
  useEffect(() => {
    if (!useUi.getState().bankOpen) return;
    const t = setTimeout(() => openRef.current?.scrollIntoView({ block: "center" }), 0);
    return () => clearTimeout(t);
  }, []);

  const groups = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const fh = normLetters(f);
    const list = ROOTS.filter(
      (r) =>
        (!f ||
          rootLetters(r).includes(fh) ||
          r.m.toLowerCase().includes(f) ||
          r.cat.includes(f) ||
          r.words.some(
            (w) =>
              stripNikud(w.h).includes(f) ||
              w.g.toLowerCase().includes(f) ||
              w.t.toLowerCase().includes(f),
          )) &&
        matchesChip(chip, roots[r.r], now, flags[r.r]),
    );
    const g = new Map<string, Root[]>();
    for (const r of list) (g.get(r.cat) ?? g.set(r.cat, []).get(r.cat)!).push(r);
    return [...g.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, chip, roots, flags]);
  const counts = useMemo(() => {
    const c = {
      all: ROOTS.length,
      due: 0,
      learning: 0,
      memorized: 0,
      unmet: 0,
      tricky: 0,
      flagged: 0,
    };
    for (const r of ROOTS) {
      const st = roots[r.r];
      if (isDue(st, now)) c.due++;
      if (seen(st) && !memorized(st)) c.learning++;
      if (memorized(st)) c.memorized++;
      if (!seen(st)) c.unmet++;
      if (isTricky(st)) c.tricky++;
      if (isActiveFlag(flags[r.r])) c.flagged++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roots, flags]);
  const dueCount = counts.due;
  const learned = ROOTS.length - counts.unmet;

  const chips: { key: BankChip; label: string; n: number }[] = [
    { key: "all", label: "All", n: counts.all },
    { key: "due", label: "Due", n: counts.due },
    { key: "learning", label: "Learning", n: counts.learning },
    { key: "memorized", label: "Memorized", n: counts.memorized },
    { key: "unmet", label: "Not met", n: counts.unmet },
    ...(counts.tricky > 0
      ? [{ key: "tricky" as BankChip, label: "Tricky", n: counts.tricky }]
      : []),
    ...(counts.flagged > 0
      ? [{ key: "flagged" as BankChip, label: "Flagged", n: counts.flagged }]
      : []),
  ];

  return (
    <>
      <div className="view-h">
        <h2>Roots</h2>
        <div className="actions">
          <span className="k tnum">
            {learned} learned · {ROOTS.length}
            {dueCount > 0 && (
              <>
                {" "}
                <button type="button" className="due-badge" onClick={() => setChip("due")}>
                  {dueCount} due
                </button>
              </>
            )}
          </span>
          <HeaderGear />
        </div>
      </div>
      <input
        className="search"
        type="search"
        placeholder="Search כתב, mishpat, justice…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoComplete="off"
        aria-label="Search roots"
      />
      <div className="chips scroll">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            className="chip toggle"
            aria-pressed={chip === c.key}
            onClick={() => setChip(c.key)}
          >
            {c.label} <span className="tnum">{c.n}</span>
          </button>
        ))}
      </div>
      {groups.length === 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          Nothing matches.{" "}
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              setFilter("");
              setChip("all");
            }}
          >
            Clear
          </button>
        </p>
      )}
      {groups.map(([cat, rs]) => (
        <div key={cat}>
          <div className="group-h">
            <span className="he">{SECTION_BY_CAT[cat]?.he ?? ""}</span>
            <span className="eyebrow">
              {cat} <span className="tnum">· {rs.length}</span>
            </span>
          </div>
          <div className="rows">
            {rs.map((r) => (
              <RootRow
                key={r.r}
                root={r}
                open={open === r.r}
                cardRef={open === r.r ? openRef : undefined}
                onToggle={() => setOpen(open === r.r ? null : r.r)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const RootRow = memo(function RootRow({
  root,
  open,
  cardRef,
  onToggle,
}: {
  root: Root;
  open: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  onToggle: () => void;
}) {
  const st = useProgress((s) => s.p.roots[root.r]);
  const flagged = isActiveFlag(useFlag(root.r));
  const m = mastery(st);
  const now = Date.now();
  const state = !seen(st)
    ? "not met"
    : m >= 3
      ? "memorized"
      : isDue(st, now)
        ? "due now"
        : `learning · ${Math.max(1, Math.ceil((st!.due - now) / DAY))}d`;
  return (
    <div className="rcard" ref={cardRef}>
      <button type="button" className="rrow" aria-expanded={open} onClick={onToggle}>
        <span className="tile">
          <Heb className="glyph">{rootDisplay(root)}</Heb>
        </span>
        <span>
          <div className="m">{root.m}</div>
          <div className="c">
            {unitTitle(COURSE.byId[root.unit])} · {root.words.length} words · {state}
            {isTricky(st) && (
              <span style={{ whiteSpace: "nowrap" }}>
                {" · "}
                <span className="tag tricky">tricky</span>
              </span>
            )}
            {flagged && (
              <span style={{ whiteSpace: "nowrap" }}>
                {" · "}
                <span className="tag flagged">flagged</span>
              </span>
            )}
          </div>
        </span>
        <MasteryDots level={m} />
      </button>
      {open && <RootDetail root={root} />}
    </div>
  );
});

function groupByForm(words: readonly Word[]): [string, Word[]][] {
  const g = new Map<string, Word[]>();
  for (const w of words) (g.get(w.b) ?? g.set(w.b, []).get(w.b)!).push(w);
  // Verbs first in binyan order, then nouns/adjectives/etc.
  return [...g.entries()].sort(([a], [b]) => (isBinyan(a) ? 0 : 1) - (isBinyan(b) ? 0 : 1));
}

function RootDetail({ root }: { root: Root }) {
  const st = useProgress((s) => s.p.roots[root.r]);
  const flagged = isActiveFlag(useFlag(root.r));
  const flagRoot = useProgress((s) => s.flagRoot);
  const unflagRoot = useProgress((s) => s.unflagRoot);
  const openUnit = useUi((s) => s.openUnit);
  const setView = useUi((s) => s.setView);
  const confirm = useUi((s) => s.confirm);
  // The reason just picked: while set, the note field is offered under the buttons.
  const [noteFor, setNoteFor] = useState<FlagReason | null>(null);

  const onFlag = async () => {
    if (flagged) {
      unflagRoot(root.r);
      setNoteFor(null);
      return;
    }
    const v = await confirm({
      title: "What's wrong?",
      body: `${rootDisplay(root)} · ${root.short}`,
      actions: [
        ...Object.entries(FLAG_LABEL).map(([value, label]) => ({ label, value })),
        { label: "Cancel", value: "cancel", kind: "text" as const },
      ],
    });
    if (!v || !(v in FLAG_LABEL)) return;
    const why = v as FlagReason;
    flagRoot(root.r, why);
    setNoteFor(why);
  };

  return (
    <div className="rdetail">
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="small muted">
          <b>{root.short}</b> · rank {root.rank} in {root.cat}
        </span>
        <span className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              setView("path");
              openUnit(root.unit);
            }}
          >
            Go to {unitTitle(COURSE.byId[root.unit])} →
          </button>
          <button type="button" className="btn sm" onClick={onFlag}>
            {flagged ? "Unflag" : "Flag"}
          </button>
        </span>
      </div>
      {noteFor && (
        <input
          className="flag-note"
          type="text"
          autoFocus
          maxLength={140}
          placeholder="Add a note (optional)"
          aria-label="Note for this flag"
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          onBlur={(e) => {
            const note = e.currentTarget.value.trim();
            if (note) flagRoot(root.r, noteFor, note);
            setNoteFor(null);
          }}
        />
      )}
      {groupByForm(root.words).map(([form, ws]) => (
        <div key={form}>
          <div className="bh">
            {isBinyan(form) ? (
              <>
                <Heb>
                  <span style={{ letterSpacing: 0, fontSize: 14 }}>{BINYAN_BY_ID[form].he}</span>
                </Heb>{" "}
                · {form}
              </>
            ) : (
              form
            )}
          </div>
          <WordList words={ws} compact showForm={false} />
        </div>
      ))}
      {root.note && (
        <div className="note small muted" style={{ marginTop: 10 }}>
          {root.note}
        </div>
      )}
      <div className="micro muted" style={{ marginTop: 10 }}>
        {st
          ? `${st.ok} right · ${st.bad} wrong · interval ${st.ivl}d · ease ${st.ease.toFixed(2)}`
          : "No attempts yet"}
      </div>
    </div>
  );
}
