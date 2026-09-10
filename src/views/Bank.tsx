import { memo, useMemo } from "react";
import type { Root, RootState, Word } from "../types";
import { ROOTS } from "../data/roots";
import { BINYAN_BY_ID, isBinyan } from "../data/binyanim";
import { normLetters, rootDisplay, rootLetters, stripNikud } from "../lib/hebrew";
import { DAY, isDue, isTricky, mastery, seen } from "../lib/srs";
import { useProgress } from "../store/progress";
import { useUi, type BankChip } from "../store/ui";
import { MasteryDots } from "../components/MasteryDots";
import { HeaderGear } from "../components/HeaderGear";
import { Heb } from "../components/Heb";
import { WordList } from "../components/WordList";
import { memorized, unitTitle } from "../lib/course";
import { COURSE } from "../store/course";
import { SECTION_BY_CAT } from "../data/course";

/** Does a root's state pass the selected filter chip? */
function matchesChip(chip: BankChip, st: RootState | undefined, now: number): boolean {
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
  const now = Date.now();

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
        matchesChip(chip, roots[r.r], now),
    );
    const g = new Map<string, Root[]>();
    for (const r of list) (g.get(r.cat) ?? g.set(r.cat, []).get(r.cat)!).push(r);
    return [...g.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, chip, roots]);
  const counts = useMemo(() => {
    const c = { all: ROOTS.length, due: 0, learning: 0, memorized: 0, unmet: 0, tricky: 0 };
    for (const r of ROOTS) {
      const st = roots[r.r];
      if (isDue(st, now)) c.due++;
      if (seen(st) && !memorized(st)) c.learning++;
      if (memorized(st)) c.memorized++;
      if (!seen(st)) c.unmet++;
      if (isTricky(st)) c.tricky++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roots]);
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
  onToggle,
}: {
  root: Root;
  open: boolean;
  onToggle: () => void;
}) {
  const st = useProgress((s) => s.p.roots[root.r]);
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
    <div className="rcard">
      <button type="button" className="rrow" aria-expanded={open} onClick={onToggle}>
        <span className="tile">
          <Heb className="glyph">{rootDisplay(root)}</Heb>
        </span>
        <span>
          <div className="m">{root.m}</div>
          <div className="c">
            {unitTitle(COURSE.byId[root.unit])} · {root.words.length} words · {state}
            {isTricky(st) && (
              <>
                {" · "}
                <span className="tag tricky">tricky</span>
              </>
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
  const openUnit = useUi((s) => s.openUnit);
  const setView = useUi((s) => s.setView);
  return (
    <div className="rdetail">
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="small muted">
          <b>{root.short}</b> · rank {root.rank} in {root.cat}
        </span>
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
      </div>
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
