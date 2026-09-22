import { useEffect, useState } from "react";
import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { shukRate, useProgress } from "../store/progress";
import { useSession, type Plan } from "../store/session";
import { useUi, type ConfirmSpec } from "../store/ui";
import { currentUnit, memorizedCount, unitMemorized, unitTitle } from "../lib/course";
import { dayKey, isDue, level, levelCeil, levelFloor, seen, trickyRoots } from "../lib/srs";
import { speedBestToday } from "../lib/speed";
import { rootLetters, stripNikud } from "../lib/hebrew";
import { dailyPlan, planLabel } from "../lib/plan";
import { SECTION_BY_CAT } from "../data/course";
import { SEALS } from "../lib/rewards";
import {
  flameSize,
  freezesOwned,
  gemBalance,
  repairOffer,
  streakAtRisk,
  visibleStreak,
} from "../lib/shop";
import { fmtShekels, pending, rushMult } from "../lib/shuk";
import { bagKey, bagReady, questViews, type Prize, type QuestView } from "../lib/quests";
import { MOVE, standings, tierFor, TIERS, weekKey, weekLeft, zone } from "../lib/league";
import { dailyRootId } from "../lib/daily";
import { mistakeRoots } from "../lib/mistakes";
import { newStories } from "../lib/stories";
import { playCue } from "../lib/sound";
import { GoalRing } from "../components/GoalRing";
import { IconGear } from "../components/Icons";
import { Heb } from "../components/Heb";
import { Tour } from "../components/Tour";
import { streakNudge } from "../lib/labels";
import { CANONICAL_HOST, LEGACY_HOSTS, movedUrl } from "../lib/site";
import { useCloud } from "../store/cloud";
import { loadCloud } from "../lib/cloud-loader";

const legacyHost = typeof location !== "undefined" && LEGACY_HOSTS.has(location.hostname);

/** The at-risk nudge shows from this local hour on. */
const NUDGE_HOUR = 18;
/** The Shuk banner waits this long after a collection before it comes back. */
const SHUK_QUIET_MS = 60_000;

/** A clock that re-renders every `ms` (live Shuk income, week countdown). */
function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** "2d 5h", "5h 12m", "40m". */
export function fmtLeft(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

/** The streak flame; `size` 0–4 from `flameSize` scales it and adds a glow from a month on. */
function Flame({ size }: { size: number }) {
  return (
    <svg className={"hm-flame f" + size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="o"
        d="M12 1.5c1.2 3.5 6 6.1 6 12a6 6 0 0 1-12 0c0-3.1 1.6-5.1 3.2-6.5.1 2 1 3.3 2.2 3.8-.8-3.2-.4-6.6.6-9.3z"
      />
      <path
        className="i"
        d="M12 11c.8 2 3 3 3 5.3a3 3 0 0 1-6 0c0-1.5.9-2.4 1.8-3.1.2.8.6 1.3 1.2 1.5-.4-1.3-.4-2.5 0-3.7z"
      />
    </svg>
  );
}

/** The lucky-bag reveal, in plain words. */
function prizeSpec(prize: Prize): ConfirmSpec {
  const ok = [{ label: "Nice!", value: "ok", kind: "primary" as const }];
  switch (prize.kind) {
    case "shekels":
      return prize.jackpot
        ? {
            art: "₪",
            title: `Jackpot! ${fmtShekels(prize.n)}`,
            body: "Eight hours of market takings in one bag. They're already in your Shuk.",
            actions: ok,
          }
        : {
            art: "₪",
            title: `${fmtShekels(prize.n)} for your Shuk`,
            body: "Shekels, straight into your market. Spend them on stall upgrades.",
            actions: ok,
          };
    case "gems":
      return {
        art: "✦",
        title: `${prize.n} gems`,
        body: "Added to your balance. Spend them in the gem shop.",
        actions: ok,
      };
    case "freeze":
      return {
        art: "✻",
        title: "A streak freeze",
        body: "If you miss a day, it's used automatically and your streak survives.",
        actions: ok,
      };
    case "rush":
      return {
        art: `×${prize.mult}`,
        title: "Rush hour!",
        body: `For the next ${prize.minutes} minutes your Shuk earns ${prize.mult === 3 ? "triple" : `×${prize.mult}`}.`,
        actions: ok,
      };
  }
}

/** A quest's progress as text: listening counts minutes, everything else counts up. */
const questCount = (q: QuestView): string =>
  q.def.id.startsWith("listen")
    ? `${Math.floor(q.value / 60)} / ${Math.round(q.def.target / 60)} min`
    : `${q.value} / ${q.def.target}`;

/** The dashboard: today's numbers, the next lesson, and the quick actions. */
export default function Home() {
  const p = useProgress((s) => s.p);
  const setView = useUi((s) => s.setView);
  const showToast = useUi((s) => s.showToast);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const openUnit = useUi((s) => s.openUnit);
  const openPage = useUi((s) => s.openPage);
  const start = useSession((s) => s.start);
  const startChain = useSession((s) => s.startChain);
  const now = useNow(5000);
  const [popped, setPopped] = useState<{ id: string; text: string; key: number } | null>(null);
  const day = dayKey(new Date(now));
  const mem = memorizedCount(ROOTS, p);
  const cur = currentUnit(COURSE, p);
  const due = ROOTS.filter((r) => isDue(p.roots[r.r], now)).length;
  const anySeen = ROOTS.some((r) => seen(p.roots[r.r]));
  const fresh = !p.placement && !anySeen;
  const today = p.history[day] ?? { ok: 0, bad: 0, xp: 0 };
  const l = level(p.xp);
  const lo = levelFloor(l);
  const hi = levelCeil(l);
  const lvlPct = Math.max(2, Math.round(((p.xp - lo) / (hi - lo)) * 100));
  const sealCount = Object.keys(p.seals).length;
  const cloudStatus = useCloud((s) => s.status);
  const signIn = useCloud((s) => s.signIn);
  const curMem = unitMemorized(cur, p);
  const curGlyph = cur.roots[0] ? rootLetters(cur.roots[0]) : "?";
  const tricky = trickyRoots(ROOTS, p);
  const speedBest = speedBestToday(p.history, day);
  const cats = p.settings.cats;
  const plan = dailyPlan(ROOTS, COURSE, p, now);
  const tourDue = p.onboardedAt !== null && p.tourAt === null;

  // v1.0: streak, shop, Shuk, quests, root of the day, league, notebook.
  const nowDate = new Date(now);
  const streak = visibleStreak(p, nowDate);
  const flame = flameSize(streak);
  const freezes = freezesOwned(p);
  const gems = gemBalance(p);
  const atRisk = streakAtRisk(p, nowDate) && nowDate.getHours() >= NUDGE_HOUR;
  const repair = repairOffer(p, nowDate);
  const rate = shukRate(p, now);
  const waiting = pending(ROOTS, p, now);
  const rush = rushMult(p.shuk.rush, now);
  const showShuk = waiting >= 1 && now - p.shuk.lastCollect >= SHUK_QUIET_MS;
  const quests = questViews(p, day);
  const claimedAll = quests.every((q) => q.claimed);
  const bagOpened = !!p.quests[bagKey(day)];
  const canOpenBag = bagReady(p, day);
  const dailyId = dailyRootId(p, day);
  const dailyRoot = dailyId ? ROOTS.find((r) => r.r === dailyId) : undefined;
  const dailyDone = (p.history[day]?.daily ?? 0) > 0;
  const wk = weekKey(nowDate);
  const table = standings(p, wk, now);
  const rank = table.findIndex((s) => s.me) + 1;
  const tier = tierFor(p, wk);
  const z = zone(rank, table.length, tier);
  const myXp = table[rank - 1]?.xp ?? 0;
  const toPromo = tier < TIERS.length - 1 && rank > MOVE ? table[MOVE - 1].xp - myXp + 1 : 0;
  const stories = newStories(p);
  const fixCount = mistakeRoots(ROOTS, p, now).length;
  const toMidnight =
    new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1).getTime() - now;

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

  const sounds = p.settings.sounds;
  const collect = () => {
    const got = useProgress.getState().collectShuk();
    if (got > 0) {
      if (sounds) playCue("coin");
      showToast(`+${fmtShekels(got)} collected`);
    }
  };
  const doRepair = () => {
    if (useProgress.getState().repairStreak()) {
      if (sounds) playCue("done");
      showToast(`Streak repaired — ${repair?.streak ?? p.streak} days and counting`);
    } else showToast("Not enough gems yet.");
  };
  const claim = (id: string) => {
    const r = useProgress.getState().claimQuest(id);
    if (!r) return;
    if (sounds) playCue("good");
    const text = `+${r.gems} gems · +${fmtShekels(r.shekels)}`;
    showToast(text);
    setPopped({ id, text, key: Date.now() });
  };
  const openTheBag = async () => {
    const prize = useProgress.getState().openBag();
    if (!prize) return;
    if (sounds) playCue("chest");
    await useUi.getState().confirm(prizeSpec(prize));
  };

  useEffect(() => {
    if (!popped) return;
    const t = setTimeout(() => setPopped(null), 1100);
    return () => clearTimeout(t);
  }, [popped]);

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
              className={"pill hm-streak" + (streak ? "" : " dim") + (atRisk ? " risk" : "")}
              title="Day streak"
              aria-label={
                `Day streak: ${streak}` +
                (freezes ? `, ${freezes} streak freeze${freezes === 1 ? "" : "s"}` : "")
              }
            >
              <Flame size={flame} /> <span className="tnum">{streak}</span>
              {freezes > 0 && (
                <span className="frz tnum" title="Streak freezes">
                  ✻{freezes}
                </span>
              )}
            </span>
            <span className="pill gems" title="Gems" aria-label={`Gems: ${gems}`}>
              ✦ <span className="tnum">{gems}</span>
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
        {repair && (
          <section className="hm-repair" aria-label="Streak repair">
            <Flame size={0} />
            <div className="txt">
              <b>Your {repair.streak}-day streak broke</b>
              <span>
                {gems >= repair.cost
                  ? `Repair it for ${repair.cost} gems before it's gone.`
                  : `Repairing costs ${repair.cost} gems — you have ${gems}.`}
              </span>
            </div>
            <button
              type="button"
              className="btn sm plum"
              disabled={gems < repair.cost}
              onClick={doRepair}
            >
              Repair ✦{repair.cost}
            </button>
          </section>
        )}
        {atRisk && !repair && (
          <div className="hm-risk" role="status">
            <Flame size={1} />
            <div className="txt">
              <b>Your streak ends at midnight</b>
              <span>
                One right answer keeps your {streak}-day streak ·{" "}
                <span className="tnum">{fmtLeft(toMidnight)}</span> left
              </span>
            </div>
          </div>
        )}
        {showShuk && (
          <div className="hm-shuk">
            <button type="button" className="open" onClick={() => setView("shuk")}>
              <span className="coin" aria-hidden="true">
                ₪
              </span>
              <span className="txt">
                <b className="tnum">{fmtShekels(waiting)} waiting in your Shuk</b>
                <span>
                  {rush > 1 ? (
                    <span className="hm-rush">Rush hour ×{rush}</span>
                  ) : (
                    <span className="tnum">{fmtShekels(rate)} an hour · tap to visit</span>
                  )}
                </span>
              </span>
            </button>
            <button type="button" className="btn sm plum" onClick={collect}>
              Collect
            </button>
          </div>
        )}
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

        {dailyRoot && (
          <button
            type="button"
            className={"hm-daily" + (dailyDone ? " done" : "")}
            disabled={dailyDone}
            onClick={() => go({ kind: "daily" })}
          >
            <span className="tile">
              <span className="glyph" lang="he">
                {rootLetters(dailyRoot)}
              </span>
            </span>
            <span className="txt">
              <span className="eyebrow">Root of the day</span>
              <span className="t">{dailyRoot.short}</span>
              <span className="s">
                {dailyDone
                  ? "Done for today · a new root tomorrow"
                  : "4 quick questions · discover a new word"}
              </span>
            </span>
            <span className="go">{dailyDone ? "✓" : "Start"}</span>
          </button>
        )}

        <section className="block hm-quests" aria-labelledby="hm-quests-h">
          <div className="row between">
            <div className="eyebrow" id="hm-quests-h">
              Daily quests
            </div>
            <span className="small muted">Resets at midnight</span>
          </div>
          <ul>
            {quests.map((q) => {
              const pct = Math.round((q.value / q.def.target) * 100);
              const pop = popped?.id === q.def.id;
              return (
                <li
                  key={q.def.id}
                  className={
                    "q" + (q.claimed ? " claimed" : q.done ? " ready" : "") + (pop ? " pop" : "")
                  }
                >
                  <div className="qt">
                    <span className="txt">{q.def.text}</span>
                    {q.claimed ? (
                      <span className="chk" aria-label="Claimed">
                        ✓
                      </span>
                    ) : q.done ? (
                      <button
                        type="button"
                        className="btn sm primary"
                        onClick={() => claim(q.def.id)}
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="n tnum">{questCount(q)}</span>
                    )}
                    {pop && (
                      <span className="float" key={popped.key} aria-hidden="true">
                        {popped.text}
                      </span>
                    )}
                  </div>
                  <div
                    className="qbar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={q.def.text}
                  >
                    <i style={{ width: Math.max(pct, q.value > 0 ? 4 : 0) + "%" }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={"bag" + (canOpenBag ? " ready" : "") + (bagOpened ? " opened" : "")}>
            <span className="bagic" aria-hidden="true">
              <BagIcon />
            </span>
            <span className="txt">
              <b>Lucky bag</b>
              <span>
                {bagOpened
                  ? "Opened · a new bag tomorrow"
                  : claimedAll
                    ? "Shekels, gems, a freeze or a rush hour"
                    : "Claim all three quests to open it"}
              </span>
            </span>
            {!bagOpened && (
              <button
                type="button"
                className={"btn sm " + (canOpenBag ? "gold" : "inert")}
                disabled={!canOpenBag}
                onClick={openTheBag}
              >
                Open the bag
              </button>
            )}
          </div>
        </section>

        {!fresh && (
          <button type="button" className="hm-league" onClick={() => openPage("league")}>
            <span className={"lg-badge t" + tier} aria-hidden="true">
              {stripNikud(TIERS[tier].he)[0]}
            </span>
            <span className="txt">
              <span className="eyebrow">
                {TIERS[tier].name} league · <Heb>{TIERS[tier].he}</Heb>
              </span>
              <span className="t tnum">
                #{rank} <small>of {table.length}</small>
              </span>
              <span className={"s zone-" + z}>
                {z === "up"
                  ? "Promotion zone · keep it up"
                  : z === "down"
                    ? `Danger zone · bottom ${MOVE} drop`
                    : toPromo > 0
                      ? `${toPromo} XP to the top ${MOVE}`
                      : tier === TIERS.length - 1
                        ? "Top league · hold your place"
                        : `Top ${MOVE} promote`}
              </span>
            </span>
            <span className="left tnum">
              {fmtLeft(weekLeft(now))}
              <small>left</small>
            </span>
          </button>
        )}

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
        {!fresh && (
          <div className="quick hm-more">
            <button type="button" onClick={() => openPage("story")}>
              <span className="ic plum" aria-hidden="true">
                ¶
              </span>
              Stories
              <span className="s tnum">{stories ? `${stories} new` : "read along"}</span>
              {stories > 0 && (
                <span className="hm-badge tnum" aria-label={`${stories} new`}>
                  {stories}
                </span>
              )}
            </button>
            <button type="button" onClick={() => openPage("listen")}>
              <span className="ic gold" aria-hidden="true">
                ♪
              </span>
              Listen
              <span className="s">hands-free</span>
            </button>
            <button type="button" onClick={() => openPage("notebook")}>
              <span className="ic coral" aria-hidden="true">
                ✎
              </span>
              Mistakes
              <span className="s tnum">{fixCount ? `${fixCount} to fix` : "all clear"}</span>
              {fixCount > 0 && (
                <span className="hm-badge tnum" aria-label={`${fixCount} to fix`}>
                  {fixCount}
                </span>
              )}
            </button>
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

/** A drawstring pouch. */
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 2.5h7l-2 3.5h-3z" />
      <path d="M10 6.8C6.2 8.6 4 12.2 4 15.6 4 19.2 7.2 21.5 12 21.5s8-2.3 8-5.9c0-3.4-2.2-7-6-8.8z" />
      <path
        className="knot"
        d="M9.5 6.4h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
