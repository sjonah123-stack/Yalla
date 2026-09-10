import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession, type Plan } from "../store/session";
import { useUi } from "../store/ui";
import { currentUnit, memorizedCount, unitMemorized, unitTitle } from "../lib/course";
import {
  dayKey,
  isDue,
  level,
  levelCeil,
  levelFloor,
  seen,
  streakAlive,
  trickyRoots,
} from "../lib/srs";
import { speedBestToday } from "../lib/speed";
import { rootLetters } from "../lib/hebrew";
import { dailyPlan, planLabel } from "../lib/plan";
import { SECTION_BY_CAT } from "../data/course";
import { SEALS } from "../lib/rewards";
import { GoalRing } from "../components/GoalRing";
import { IconGear } from "../components/Icons";
import { Tour } from "../components/Tour";
import { streakNudge } from "../lib/labels";
import { CANONICAL_HOST, LEGACY_HOSTS, movedUrl } from "../lib/site";
import { useCloud } from "../store/cloud";
import { loadCloud } from "../lib/cloud-loader";

const legacyHost = typeof location !== "undefined" && LEGACY_HOSTS.has(location.hostname);

/** The dashboard: today's numbers, the next lesson, and the quick actions. */
export default function Home() {
  const p = useProgress((s) => s.p);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const openUnit = useUi((s) => s.openUnit);
  const start = useSession((s) => s.start);
  const startChain = useSession((s) => s.startChain);
  const now = Date.now();
  const mem = memorizedCount(ROOTS, p);
  const cur = currentUnit(COURSE, p);
  const due = ROOTS.filter((r) => isDue(p.roots[r.r], now)).length;
  const anySeen = ROOTS.some((r) => seen(p.roots[r.r]));
  const fresh = !p.placement && !anySeen;
  const today = p.history[dayKey()] ?? { ok: 0, bad: 0, xp: 0 };
  const l = level(p.xp);
  const lo = levelFloor(l);
  const hi = levelCeil(l);
  const lvlPct = Math.max(2, Math.round(((p.xp - lo) / (hi - lo)) * 100));
  const alive = streakAlive(p.lastPlay);
  const sealCount = Object.keys(p.seals).length;
  const cloudStatus = useCloud((s) => s.status);
  const signIn = useCloud((s) => s.signIn);
  const curMem = unitMemorized(cur, p);
  const curGlyph = cur.roots[0] ? rootLetters(cur.roots[0]) : "?";
  const tricky = trickyRoots(ROOTS, p);
  const speedBest = speedBestToday(p.history, dayKey());
  const cats = p.settings.cats;
  const plan = dailyPlan(ROOTS, COURSE, p, now);
  const tourDue = p.onboardedAt !== null && p.tourAt === null;

  const go = (plan: Plan) => {
    if (start(plan)) setView("play");
    else
      showToast(
        plan.kind === "practice"
          ? plan.focus === "tricky"
            ? "No tricky roots right now — nice."
            : "Nothing due yet — keep going on the path."
          : plan.kind === "speed"
            ? "Learn a few more roots first — speed rounds review what you've seen."
            : "Nothing to study here.",
      );
  };

  const clearFocus = () => {
    useProgress.getState().setSettings({ cats: [] });
    showToast("Practice covers every theme again.");
  };

  return (
    <>
      <header className="pathhero">
        <div className="mark" aria-hidden="true">
          {curGlyph}
        </div>
        <div className="bar">
          <span className="logo">
            יאללה<span className="dot">.</span>
          </span>
          <div className="pills">
            <span
              className={"pill" + (alive ? "" : " dim")}
              title="Day streak"
              aria-label={`Day streak: ${alive ? p.streak : 0}`}
            >
              🔥 <span className="tnum">{alive ? p.streak : 0}</span>
            </span>
            <span className="pill gems" title="Gems" aria-label={`Gems: ${p.gems}`}>
              ✦ <span className="tnum">{p.gems}</span>
            </span>
            <button
              type="button"
              className="pill icon"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <IconGear />
            </button>
          </div>
        </div>
        <div className="memo">
          <div>
            <div className="eyebrow">Roots memorized</div>
            <div className="big tnum">
              {mem}
              <small> / {ROOTS.length}</small>
            </div>
            <div className="sub">
              {fresh
                ? "Every root, one unit at a time."
                : `${cur.section.he} · ${unitTitle(cur)} · ${curMem}/${cur.roots.length}`}
            </div>
          </div>
          <GoalRing xp={today.xp} goal={p.settings.dailyGoal} size={88} />
        </div>
        <div className="lvl">
          <span>Level {l}</span>
          <span className="tnum">
            {hi - p.xp} XP to level {l + 1}
          </span>
        </div>
        <div
          className="xpbar"
          role="progressbar"
          aria-valuenow={lvlPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${p.xp} XP`}
        >
          <i style={{ width: lvlPct + "%" }} />
        </div>
      </header>

      <div className="home">
        <button type="button" className="cta" onClick={() => go({ kind: "lesson", unit: cur.id })}>
          <span className="tile">
            <span className="glyph">{curGlyph}</span>
          </span>
          <span className="txt">
            <span className="eyebrow">{fresh ? "Start" : "Continue"}</span>
            <span className="t">{unitTitle(cur)}</span>
            <span className="s">
              {cur.section.title} · {cur.roots.length - curMem} root
              {cur.roots.length - curMem === 1 ? "" : "s"} left
            </span>
          </span>
          <span className="chev" aria-hidden="true">
            ›
          </span>
        </button>
        {plan.length > 1 && (
          <button
            type="button"
            className="btn plum block big plan"
            onClick={() => {
              if (startChain(plan)) setView("play");
              else showToast("Nothing to study right now.");
            }}
          >
            Today's session · {plan.map(planLabel).join(" → ")}
          </button>
        )}
        <div className="quick">
          <button type="button" onClick={() => go({ kind: "practice" })}>
            <span className="ic coral" aria-hidden="true">
              ◔
            </span>
            Practice
            <span className="s tnum">
              {due ? `${due} due` : anySeen ? "review weakest" : "after your first lesson"}
            </span>
          </button>
          <button type="button" onClick={() => openUnit(cur.id)}>
            <span className="ic gold" aria-hidden="true">
              ▣
            </span>
            This unit
            <span className="s">flashcards · match · sort · test</span>
          </button>
          <button type="button" onClick={() => setView("progress")}>
            <span className="ic plum" aria-hidden="true">
              ◈
            </span>
            Seals
            <span className="s tnum">
              {sealCount} / {SEALS.length}
            </span>
          </button>
        </div>
        {(tricky.length > 0 || anySeen) && (
          <div className="extras">
            {tricky.length > 0 && (
              <button
                type="button"
                className="extra"
                onClick={() => go({ kind: "practice", focus: "tricky" })}
              >
                <span className="ic coral" aria-hidden="true">
                  !
                </span>
                Tricky roots
                <span className="s tnum">{tricky.length} to drill</span>
              </button>
            )}
            {anySeen && (
              <button type="button" className="extra" onClick={() => go({ kind: "speed" })}>
                <span className="ic gold" aria-hidden="true">
                  ⚡
                </span>
                Speed round
                <span className="s">
                  {speedBest > 0 ? (
                    <>
                      best today <span className="tnum">{speedBest}</span>
                    </>
                  ) : (
                    "60 seconds"
                  )}
                </span>
              </button>
            )}
          </div>
        )}
        {fresh && (
          <section className="block gold placepitch">
            <div className="eyebrow">Already know some Hebrew?</div>
            <p style={{ marginTop: 6 }}>
              A placement test skips you past the roots you already own.
            </p>
            <button
              type="button"
              className="btn plum block"
              style={{ marginTop: 12 }}
              onClick={() => go({ kind: "placement" })}
            >
              Take the placement test
            </button>
          </section>
        )}
        {cats.length > 0 && (
          <button
            type="button"
            className="chip toggle"
            aria-pressed={true}
            style={{ marginTop: 12 }}
            onClick={clearFocus}
          >
            Focus: {cats.map((c) => SECTION_BY_CAT[c]?.title ?? c).join(", ")}
            <span className="x">×</span>
          </button>
        )}
        <section className="block" style={{ marginTop: 12 }}>
          <div className="row between">
            <div className="eyebrow">Today</div>
            <span className="small muted tnum">
              {today.ok} right · {today.bad} wrong · +{today.xp} XP
            </span>
          </div>
          <p className="small" style={{ marginTop: 6 }}>
            {streakNudge(p.streak, p.lastPlay, today.xp, p.settings.dailyGoal)}
          </p>
        </section>
        {loadCloud && legacyHost && (
          <section className="block gold" style={{ marginTop: 12 }}>
            <div className="eyebrow">Yalla has moved</div>
            <p style={{ marginTop: 6 }}>
              The new address is <b>{CANONICAL_HOST}</b>.{" "}
              {cloudStatus === "signed-in"
                ? "Your progress is in your account — open the new address and sign in there."
                : "Sign in here first so your progress follows you, then open the new address."}
            </p>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              {cloudStatus !== "signed-in" && (
                <button type="button" className="btn plum" onClick={() => signIn()}>
                  Sign in
                </button>
              )}
              <button
                type="button"
                className={"btn " + (cloudStatus === "signed-in" ? "plum" : "ghost")}
                onClick={() =>
                  location.assign(movedUrl(location.pathname, location.search, location.hash))
                }
              >
                Open {CANONICAL_HOST}
              </button>
            </div>
          </section>
        )}
      </div>
      {tourDue && <Tour />}
    </>
  );
}
