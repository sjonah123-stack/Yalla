import { memo, useMemo } from "react";
import type { Root, Word } from "../types";
import { ROOTS } from "../data/roots";
import { BINYAN_BY_ID, isBinyan } from "../data/binyanim";
import { normLetters, rootDisplay, rootLetters, stripNikud } from "../lib/hebrew";
import { DAY, isDue, mastery } from "../lib/srs";
import { useProgress } from "../store/progress";
import { useUi } from "../store/ui";
import { MasteryArc } from "../components/MasteryArc";
import { WordList } from "../components/WordList";

import { catColor, unitTitle } from "../lib/course";
import { COURSE } from "../store/course";

export default function Bank() {
  const filter = useUi((s) => s.bankFilter);
  const setFilter = useUi((s) => s.setBankFilter);
  const open = useUi((s) => s.bankOpen);
  const setOpen = useUi((s) => s.setBankOpen);
  const roots = useProgress((s) => s.p.roots);
  const now = Date.now();

  const groups = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const fh = normLetters(f);
    const list = ROOTS.filter(
      (r) =>
        !f ||
        rootLetters(r).includes(fh) ||
        r.m.toLowerCase().includes(f) ||
        r.cat.includes(f) ||
        r.words.some(
          (w) =>
            stripNikud(w.h).includes(f) ||
            w.g.toLowerCase().includes(f) ||
            w.t.toLowerCase().includes(f),
        ),
    );
    const g = new Map<string, Root[]>();
    for (const r of list) (g.get(r.cat) ?? g.set(r.cat, []).get(r.cat)!).push(r);
    return [...g.entries()];
  }, [filter]);
  const dueCount = ROOTS.filter((r) => isDue(roots[r.r], now)).length;
  const nWords = ROOTS.reduce((a, r) => a + r.words.length, 0);

  return (
    <>
      <div className="bank-head">
        <div className="row between" style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: "var(--t-h)", fontWeight: 900 }}>Root bank</h2>
          <span className="small muted tnum">
            {ROOTS.length} roots · {nWords} words{" "}
            {dueCount > 0 && <span className="due-badge">{dueCount} due</span>}
          </span>
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
      </div>
      {groups.length === 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          Nothing matches.
        </p>
      )}
      {groups.map(([cat, rs]) => (
        <div key={cat}>
          <div className="group-h">
            <i className="sq" style={{ background: catColor(cat) }} />
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
  const dueTxt =
    st && st.reps
      ? isDue(st, now)
        ? "due now"
        : `due in ${Math.max(1, Math.ceil((st.due - now) / DAY))}d`
      : "not started";
  return (
    <div>
      <button type="button" className="rrow" aria-expanded={open} onClick={onToggle}>
        <span className="glyph">{rootDisplay(root)}</span>
        <span>
          <div className="m">{root.m}</div>
          <div className="c">
            {unitTitle(COURSE.byId[root.unit])} · {root.words.length} words · {dueTxt}
          </div>
        </span>
        <MasteryArc level={m} />
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
          className="btn quiet sm"
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
                <span className="heb" style={{ letterSpacing: 0, fontSize: 14 }}>
                  {BINYAN_BY_ID[form].he}
                </span>{" "}
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
