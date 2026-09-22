import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Accent, Progress, Rush } from "../types";
import { ROOTS } from "../data/roots";
import { COURSE } from "../store/course";
import { useProgress } from "../store/progress";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { currentUnit, sectionColor } from "../lib/course";
import {
  LANDMARKS,
  PERKS,
  TIERS,
  fmtShekels,
  incomeRate,
  levelMult,
  nextLandmark,
  till,
  perkCost,
  perkLevel,
  perkValue,
  rushMult,
  shekels,
  stalls,
  storageFull,
  storageMs,
  tierOf,
  upgradeCost,
  type Perk,
  type PerkId,
  type Stall,
} from "../lib/shuk";
import {
  ACCENTS,
  ACCENT_COST,
  BAG_COST,
  FREEZE_COST,
  FREEZE_MAX,
  RUSH_TOKEN_COST,
  RUSH_TOKEN_MIN,
  RUSH_TOKEN_MULT,
  freezesOwned,
  gemBalance,
  ownsAccent,
  repairOffer,
  type BuyError,
} from "../lib/shop";
import type { Prize } from "../lib/quests";
import { buzz, playCue, type Cue } from "../lib/sound";
import { HeaderGear } from "../components/HeaderGear";
import { Heb } from "../components/Heb";

// ---------- small helpers ----------

const sounds = () => useProgress.getState().p.settings.sounds;
const cue = (c: Cue, haptic?: number | number[]) => {
  if (!sounds()) return;
  playCue(c);
  if (haptic) buzz(haptic);
};
const toast = (msg: string) => useUi.getState().showToast(msg);

/** Full shekel amount, for sums people count: ₪1,234. */
const ils = (n: number) => `₪${Math.floor(n).toLocaleString("en-US")}`;
/** Compact amount without the sign (the wallet draws its own coin). */
const compact = (n: number) => fmtShekels(n).slice(1);

/** "2h 14m", "45m", "4h". */
function fmtDur(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}

/** "23:14" or "1:02:03". */
function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

const buyError = (e: BuyError): string =>
  e === "gems"
    ? "Not enough gems"
    : e === "max"
      ? `You already hold ${FREEZE_MAX} freezes`
      : "You already own that";

function describePrize(prize: Prize): { art: string; title: string; body: string } {
  switch (prize.kind) {
    case "shekels":
      return prize.jackpot
        ? {
            art: "₪",
            title: `${ils(prize.n)} — jackpot!`,
            body: "Eight hours of market takings, straight into your balance.",
          }
        : { art: "₪", title: ils(prize.n), body: "Shekels, straight into your balance." };
    case "gems":
      return { art: "✦", title: `${prize.n} gems`, body: "Added to your gems." };
    case "freeze":
      return {
        art: "❅",
        title: "A streak freeze",
        body: "It covers one missed day on its own, so your streak keeps going.",
      };
    case "rush":
      return {
        art: `×${prize.mult}`,
        title: `A ${prize.minutes}-min ×${prize.mult} rush hour`,
        body: `Every stall earns ×${prize.mult}, starting now.`,
      };
  }
}

/** A clock that re-renders the view every `ms`; `refresh` snaps it to now (after a collect). */
function useNow(ms: number): [number, () => void] {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return [now, () => setNow(Date.now())];
}

/** Tween a number from what is on screen to `target` (from 0 on mount). Instant under reduced motion. */
function useRoll(target: number, ms = 700): number {
  const [v, setV] = useState(0);
  const shown = useRef(0);
  useEffect(() => {
    const from = shown.current;
    if (from === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = target;
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const x = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      shown.current = x;
      setV(x);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** Coins thrown by a collect: fixed fan, so a burst always looks the same. */
const COINS = Array.from({ length: 12 }, (_, i) => {
  const a = ((-90 + (i - 5.5) * 14) * Math.PI) / 180;
  const d = 78 + (i % 3) * 30;
  return {
    dx: Math.round(Math.cos(a) * d),
    dy: Math.round(Math.sin(a) * d),
    delay: (i % 4) * 45,
    rot: (i % 2 ? 1 : -1) * (24 + i * 9),
  };
});

const PERK_GLYPH: Record<PerkId, string> = { storage: "▤", rush: "»", haggle: "%" };

const IconFreeze = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="ico-freeze">
    <path
      d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5M9 3.9l3 2.6 3-2.6M9 20.1l3-2.6 3 2.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------- the view ----------

type Tab = "market" | "shop";

/** The Shuk: an idle market fed by memorized roots. Market (till, stalls, perks) and Gem shop. */
export default function Shuk() {
  const p = useProgress((s) => s.p);
  const [tab, setTab] = useState<Tab>("market");
  const [now, refresh] = useNow(1000);
  const [bump, setBump] = useState(0);

  const all = stalls(ROOTS, p, now);
  const rate = incomeRate(all);
  const balance = shekels(p.shuk);
  const gems = gemBalance(p);
  const freezes = freezesOwned(p);
  const rolled = useRoll(balance);
  const t = tierOf(p.shuk.earned);
  const tier = TIERS[t];
  const next = TIERS[t + 1];
  const tierPct = next ? ((p.shuk.earned - tier.at) / (next.at - tier.at)) * 100 : 100;
  const offer = repairOffer(p);
  const rush = p.shuk.rush && rushMult(p.shuk.rush, now) > 1 ? p.shuk.rush : null;
  const empty = p.shuk.lastCollect === 0 && rate === 0;

  // The first visit with a stall already open starts the clock (that first collect pays nothing).
  const starting = p.shuk.lastCollect === 0 && rate > 0;
  useEffect(() => {
    if (!starting || useProgress.getState().p.shuk.lastCollect !== 0) return;
    useProgress.getState().collectShuk();
    toast("Your stand is open — income starts now");
  }, [starting]);

  return (
    <div className="shuk">
      <div className="view-h">
        <h2>
          Shuk <Heb className="shuk-he">שׁוּק</Heb>
        </h2>
        <div className="actions">
          <HeaderGear />
        </div>
      </div>

      <div className="shuk-tier">
        <span className="badge" aria-hidden="true">
          <Heb>{tier.he}</Heb>
        </span>
        <div className="txt">
          <div className="row between">
            <b>{tier.name}</b>
            <span className="k tnum">
              {next
                ? `${compact(p.shuk.earned)} / ${compact(next.at)} to ${next.name}`
                : "Top tier"}
            </span>
          </div>
          <div
            className="bar"
            role="progressbar"
            aria-label={next ? `Progress to ${next.name}` : "Top tier reached"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(tierPct)}
          >
            <i style={{ width: `${Math.max(3, tierPct)}%` }} />
          </div>
        </div>
      </div>

      <div className="shuk-wallet">
        <div className="w">
          <span className="sr-only">{ils(balance)} shekels</span>
          <span className="coin" aria-hidden="true">
            ₪
          </span>
          <span key={bump} className={"n tnum" + (bump ? " bump" : "")} aria-hidden="true">
            {compact(rolled)}
          </span>
          <span className="l" aria-hidden="true">
            shekels
          </span>
        </div>
        <div className="w">
          <span className="sr-only">{gems} gems</span>
          <span className="gem" aria-hidden="true">
            ✦
          </span>
          <span className="n tnum" aria-hidden="true">
            {gems.toLocaleString("en-US")}
          </span>
          <span className="l" aria-hidden="true">
            gems
          </span>
        </div>
        <div className="w">
          <span className="sr-only">
            {freezes} of {FREEZE_MAX} streak freezes held
          </span>
          <span className="ice" aria-hidden="true">
            <IconFreeze />
          </span>
          <span className="n tnum" aria-hidden="true">
            ×{freezes}
          </span>
          <span className="l" aria-hidden="true">
            freezes
          </span>
        </div>
      </div>

      <div className="shuk-tabs" role="tablist" aria-label="Shuk">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "market"}
          onClick={() => setTab("market")}
        >
          Market
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "shop"}
          onClick={() => setTab("shop")}
        >
          Gem shop
          {offer && <i className="dot" aria-label="(streak repair available)" />}
        </button>
      </div>

      {tab === "market" ? (
        <div className="shuk-pane" role="tabpanel" aria-label="Market">
          {rush && <RushBanner rush={rush} now={now} />}
          {empty ? (
            <EmptyStand />
          ) : (
            <Till
              p={p}
              rate={rate}
              now={now}
              onCollected={() => {
                refresh();
                setBump((b) => b + 1);
              }}
            />
          )}
          <Stalls p={p} all={all} balance={balance} />
          <Perks p={p} balance={balance} />
        </div>
      ) : (
        <div className="shuk-pane" role="tabpanel" aria-label="Gem shop">
          <GemShop p={p} gems={gems} freezes={freezes} now={now} rate={rate} />
        </div>
      )}
    </div>
  );
}

// ---------- market ----------

function RushBanner({ rush, now }: { rush: Rush; now: number }) {
  return (
    <div className="shuk-rush">
      <span className="x tnum" aria-hidden="true">
        ×{rush.mult}
      </span>
      <div className="txt">
        <b>Rush hour ×{rush.mult}</b>
        <span>Every stall earns ×{rush.mult}</span>
      </div>
      <span className="left tnum">{fmtClock(rush.until - now)} left</span>
    </div>
  );
}

function EmptyStand() {
  return (
    <section className="shuk-empty">
      <div className="stand" aria-hidden="true">
        <span className="awn" />
        <span className="ctr">₪</span>
      </div>
      <h3>Memorize your first root to open a stall</h3>
      <p>
        Every memorized root is stock on a market stall. Fresh stock earns shekels every hour — even
        while the app is closed.
      </p>
      <button
        type="button"
        className="btn plum block big"
        onClick={() => useUi.getState().setView("path")}
      >
        Go to the Path
      </button>
    </section>
  );
}

function Till({
  p,
  rate,
  now,
  onCollected,
}: {
  p: Progress;
  rate: number;
  now: number;
  onCollected: () => void;
}) {
  const [burst, setBurst] = useState<{ key: number; got: number } | null>(null);
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(null), 1400);
    return () => clearTimeout(t);
  }, [burst]);

  const mult = rushMult(p.shuk.rush, now);
  const cap = storageMs(p.shuk);
  const since = p.shuk.lastCollect ? Math.max(0, now - p.shuk.lastCollect) : 0;
  const frac = Math.min(1, since / cap);
  const full = rate > 0 && storageFull(p.shuk, now);
  const exact = till(ROOTS, p, now);
  const got = Math.floor(exact);
  // Agorot, so the till visibly ticks every second.
  const agorot = Math.floor((exact - got) * 100);

  const collect = () => {
    const before = tierOf(useProgress.getState().p.shuk.earned);
    const n = useProgress.getState().collectShuk();
    if (n <= 0) return;
    cue("chest", [12, 40, 12]);
    setBurst({ key: Date.now(), got: n });
    toast(`+${ils(n)}`);
    onCollected();
    const after = tierOf(useProgress.getState().p.shuk.earned);
    if (after > before) {
      const tr = TIERS[after];
      // Let the coins land before the celebration sheet slides up.
      setTimeout(() => {
        void useUi.getState().confirm({
          art: tr.he,
          title: `Your market grew into a ${tr.name}!`,
          body: `Lifetime takings passed ${ils(tr.at)}. Keep your stock fresh and it keeps growing.`,
          actions: [{ label: "Yalla!", value: "ok", kind: "primary" }],
        });
      }, 1100);
    }
  };

  return (
    <section
      className={"shuk-till" + (mult > 1 ? " rush" : "") + (full ? " full" : "")}
      aria-label="Till"
    >
      <div className="top">
        <span className="eyebrow">In the till</span>
        <span className="rate tnum">
          {ils(rate)}/h
          {mult > 1 && <b className="x">×{mult}</b>}
        </span>
      </div>
      <div className="amt tnum">
        <span className="sr-only">{ils(got)} waiting</span>
        <span className="cur" aria-hidden="true">
          ₪
        </span>
        <span aria-hidden="true">{got < 100_000 ? got.toLocaleString("en-US") : compact(got)}</span>
        {got < 100_000 && <small aria-hidden="true">.{String(agorot).padStart(2, "0")}</small>}
      </div>
      {rate > 0 ? (
        <div className="store">
          <div className="lbl">
            <span>
              {full
                ? "Storage full — income stopped"
                : frac >= 0.8
                  ? "Storage almost full"
                  : "Storage"}
            </span>
            <span className="tnum">
              {fmtDur(Math.min(since, cap))} / {fmtDur(cap)}
            </span>
          </div>
          <div
            className="bar"
            role="progressbar"
            aria-label="Storage used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(frac * 100)}
          >
            <i className={frac >= 0.8 ? "warm" : ""} style={{ width: `${frac * 100}%` }} />
          </div>
        </div>
      ) : (
        <p className="note">
          All your stock has wilted. Restock a stall below to start earning again.
        </p>
      )}
      <button
        type="button"
        className={
          "btn block big collect " + (got < 1 ? "inert" : full ? "primary urgent" : "gold")
        }
        disabled={got < 1}
        onClick={collect}
      >
        {got >= 1 ? `Collect ${ils(got)}` : "Nothing to collect yet"}
      </button>
      {mult === 1 && (
        <p className="hint">Finish a lesson for a ×2 rush hour — ×3 if it's perfect.</p>
      )}
      {burst && (
        <div key={burst.key} className="shuk-burst" aria-hidden="true">
          {COINS.map((c, i) => (
            <i
              key={i}
              style={
                {
                  "--dx": `${c.dx}px`,
                  "--dy": `${c.dy}px`,
                  "--r": `${c.rot}deg`,
                  animationDelay: `${c.delay}ms`,
                } as CSSProperties
              }
            >
              ₪
            </i>
          ))}
          <b className="float tnum">+{ils(burst.got)}</b>
        </div>
      )}
    </section>
  );
}

function Stalls({ p, all, balance }: { p: Progress; all: Stall[]; balance: number }) {
  const [showAll, setShowAll] = useState(false);
  const [pop, setPop] = useState<{ id: string; key: number } | null>(null);
  const curSection = useMemo(() => currentUnit(COURSE, p).section.id, [p]);
  const open = all.filter((s) => s.open);
  // The section you're studying is the next stall to open: put it first.
  const shut = all
    .filter((s) => !s.open)
    .sort((a, b) => Number(b.id === curSection) - Number(a.id === curSection));
  const nextId = shut.some((s) => s.id === curSection) ? curSection : shut[0]?.id;
  const shown = showAll ? shut : shut.slice(0, 4);

  const upgrade = (s: Stall) => {
    if (!useProgress.getState().upgradeStall(s.id)) {
      toast("Not enough shekels");
      return;
    }
    const lv = s.level + 1;
    setPop({ id: s.id, key: Date.now() });
    if ((LANDMARKS as readonly number[]).includes(lv)) {
      cue("chest", [12, 40, 12]);
      toast(`Landmark! ${s.name} income ×2`);
    } else cue("tick", 8);
  };

  const restock = (id: string) => {
    if (useSession.getState().start({ kind: "practice", focus: "restock", section: id }))
      useUi.getState().setView("play");
    else toast("Nothing to restock right now.");
  };

  return (
    <>
      {open.length > 0 && (
        <section className="shuk-sec">
          <div className="shuk-h">
            <span className="eyebrow">Your stalls</span>
            <span className="k tnum">{open.length} open</span>
          </div>
          <p className="shuk-note">
            Memorized roots are stock. Fresh stock earns; a root that's due for review wilts until
            you restock it.
          </p>
          <div className="shuk-stalls">
            {open.map((s) => (
              <StallCard
                key={s.id}
                s={s}
                balance={balance}
                popKey={pop?.id === s.id ? pop.key : 0}
                onUpgrade={upgrade}
                onRestock={restock}
              />
            ))}
          </div>
        </section>
      )}
      {shut.length > 0 && (
        <section className="shuk-sec">
          <div className="shuk-h">
            <span className="eyebrow">Shuttered</span>
            <span className="k tnum">{shut.length} to open</span>
          </div>
          <div className="shuk-shut">
            {shown.map((s) => (
              <div key={s.id} className={"shut" + (s.id === nextId ? " next" : "")}>
                {s.id === nextId && <span className="tag">Up next</span>}
                <Heb className="he">{s.he}</Heb>
                <span className="t">{s.name}</span>
                <span className="s">Memorize a {s.title} root to open</span>
              </div>
            ))}
          </div>
          {shut.length > 4 && (
            <button
              type="button"
              className="btn text block shuk-more"
              aria-expanded={showAll}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show fewer" : `Show all ${shut.length} shuttered stalls`}
            </button>
          )}
        </section>
      )}
    </>
  );
}

function StallCard({
  s,
  balance,
  popKey,
  onUpgrade,
  onRestock,
}: {
  s: Stall;
  balance: number;
  popKey: number;
  onUpgrade: (s: Stall) => void;
  onRestock: (id: string) => void;
}) {
  const cost = upgradeCost(s.level);
  const can = balance >= cost;
  const nl = nextLandmark(s.level);
  const prevL = [0, ...LANDMARKS].filter((l) => l <= s.level).pop() ?? 0;
  const lmPct = nl ? ((s.level - prevL) / (nl - prevL)) * 100 : 100;
  const gain = s.rate * (levelMult(s.level + 1) / levelMult(s.level) - 1);
  return (
    <article
      className="shuk-stall"
      style={{ "--c": sectionColor(s.id) } as CSSProperties}
      aria-label={`${s.name}, level ${s.level}`}
    >
      <div className="awning" aria-hidden="true" />
      <div className="head">
        <div className="name">
          <span className="t">{s.name}</span>
          <Heb className="he">{s.he}</Heb>
        </div>
        <span key={popKey} className={"lv tnum" + (popKey ? " pop" : "")}>
          <small>Lv</small>
          {s.level}
        </span>
      </div>
      <div className="sub">
        <span>{s.title}</span>
        <b className="tnum">{ils(s.rate)}/h</b>
      </div>
      <div className="dots" aria-hidden="true">
        {Array.from({ length: s.total }, (_, i) => (
          <i key={i} className={i < s.fresh ? "f" : i < s.stock ? "w" : ""} />
        ))}
      </div>
      <div className="stock tnum">
        {s.stock} of {s.total} roots in stock
        {s.wilted > 0 && <span className="wl"> · {s.wilted} wilted</span>}
      </div>
      <div className="mark">
        <span className="tnum">
          {nl ? (
            <>
              Lv {s.level} → <b>×2</b> at Lv {nl}
            </>
          ) : (
            "Every landmark reached"
          )}
        </span>
        <span className="track" aria-hidden="true">
          <i style={{ width: `${Math.max(4, lmPct)}%` }} />
        </span>
      </div>
      <div className="acts">
        {s.wilted > 0 && (
          <button type="button" className="btn sm primary restock" onClick={() => onRestock(s.id)}>
            {s.wilted} wilted — Restock
          </button>
        )}
        <button
          type="button"
          className={"btn sm up " + (can ? "gold" : "inert")}
          disabled={!can}
          onClick={() => onUpgrade(s)}
          aria-label={`Upgrade ${s.name} for ${ils(cost)}`}
        >
          <span>Upgrade</span>
          <span className="cost tnum">{ils(cost)}</span>
          {gain >= 1 && <span className="gain tnum">+{ils(gain)}/h</span>}
        </button>
      </div>
    </article>
  );
}

function Perks({ p, balance }: { p: Progress; balance: number }) {
  const buy = (perk: Perk) => {
    if (!useProgress.getState().buyPerk(perk.id)) {
      toast("Not enough shekels");
      return;
    }
    cue("good", 10);
    toast(`${perk.name} upgraded`);
  };
  return (
    <section className="shuk-sec">
      <div className="shuk-h">
        <span className="eyebrow">Perks</span>
        <span className="k">for the whole market</span>
      </div>
      <div className="shuk-list">
        {PERKS.map((perk) => {
          const lv = perkLevel(p.shuk, perk.id);
          const cost = perkCost(p.shuk, perk.id);
          const can = cost !== null && balance >= cost;
          const nextV = perk.levels[lv + 1];
          return (
            <div key={perk.id} className="shuk-item">
              <span className={"ic " + perk.id} aria-hidden="true">
                {PERK_GLYPH[perk.id]}
              </span>
              <div className="txt">
                <div className="t">
                  {perk.name}
                  <span className="pips" aria-label={`level ${lv + 1} of ${perk.levels.length}`}>
                    {perk.levels.map((_, i) => (
                      <i key={i} className={i <= lv ? "on" : ""} />
                    ))}
                  </span>
                </div>
                <div className="s">{perk.describe(perkValue(p.shuk, perk.id))}</div>
                {nextV !== undefined && <div className="m">Next: {perk.describe(nextV)}</div>}
              </div>
              {cost === null ? (
                <span className="maxed">Maxed</span>
              ) : (
                <button
                  type="button"
                  className={"btn sm price " + (can ? "gold" : "inert")}
                  disabled={!can}
                  onClick={() => buy(perk)}
                  aria-label={`Buy ${perk.name} for ${ils(cost)}`}
                >
                  {ils(cost)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- gem shop ----------

function ShopRow({
  icon,
  tone,
  title,
  desc,
  meta,
  cost,
  gems,
  blocked,
  hot,
  onBuy,
}: {
  icon: ReactNode;
  tone: string;
  title: string;
  desc: string;
  meta?: string;
  cost: number;
  gems: number;
  /** Why it can't be bought right now (shown on the button, which is disabled). */
  blocked?: string;
  hot?: boolean;
  onBuy: () => void;
}) {
  const short = gems < cost;
  return (
    <div className={"shuk-item" + (hot ? " hot" : "")}>
      <span className={"ic " + tone} aria-hidden="true">
        {icon}
      </span>
      <div className="txt">
        <div className="t">{title}</div>
        <div className="s">{desc}</div>
        {meta && <div className="m">{meta}</div>}
      </div>
      <button
        type="button"
        className={"btn sm price " + (blocked || short ? "inert" : "plum")}
        disabled={!!blocked}
        onClick={onBuy}
        aria-label={blocked ? `${title}: ${blocked}` : `Buy ${title} for ${cost} gems`}
      >
        {blocked ?? (
          <>
            <span aria-hidden="true">✦</span>
            <span className="tnum">{cost}</span>
          </>
        )}
      </button>
    </div>
  );
}

function GemShop({
  p,
  gems,
  freezes,
  now,
  rate,
}: {
  p: Progress;
  gems: number;
  freezes: number;
  now: number;
  rate: number;
}) {
  const offer = repairOffer(p);
  const rushNow = rushMult(p.shuk.rush, now);
  const store = () => useProgress.getState();
  const short = (cost: number) => {
    if (gemBalance(store().p) >= cost) return false;
    toast(`Not enough gems — ${cost - gemBalance(store().p)} more to go`);
    return true;
  };

  const repair = () => {
    if (!offer || short(offer.cost)) return;
    if (!store().repairStreak()) return toast("That streak can't be repaired any more");
    cue("chest", [12, 40, 12]);
    toast(`${offer.streak}-day streak restored`);
  };
  const buyFreeze = () => {
    if (short(FREEZE_COST)) return;
    const r = store().buy("freeze");
    if (typeof r === "string") return toast(buyError(r));
    cue("good", 10);
    toast(`Streak freeze ready — ${freezesOwned(store().p)}/${FREEZE_MAX} held`);
  };
  const buyRush = () => {
    if (short(RUSH_TOKEN_COST)) return;
    const r = store().buy("rush");
    if (typeof r === "string") return toast(buyError(r));
    cue("good", 10);
    toast(`Rush hour ×${RUSH_TOKEN_MULT} — ${RUSH_TOKEN_MIN} min`);
  };
  const buyBag = async () => {
    if (short(BAG_COST)) return;
    const r = store().buy("bag");
    if (typeof r === "string") return toast(buyError(r));
    if (r === true) return;
    cue("chest", [12, 40, 12]);
    const d = describePrize(r);
    await useUi.getState().confirm({
      art: d.art,
      title: d.title,
      body: d.body,
      actions: [{ label: "Nice!", value: "ok", kind: "primary" }],
    });
  };
  const pickAccent = async (a: { id: Accent; name: string }) => {
    if (p.settings.accent === a.id) return;
    if (ownsAccent(p, a.id)) {
      store().setAccent(a.id);
      toast(`${a.name} on`);
      return;
    }
    if (short(ACCENT_COST)) return;
    const ok = await useUi.getState().confirm({
      title: `Buy ${a.name}?`,
      body: `✦${ACCENT_COST}. It recolours the whole app, and it's yours to switch back to any time.`,
      actions: [
        { label: `Buy for ✦${ACCENT_COST}`, value: "buy", kind: "primary" },
        { label: "Not now", value: "no", kind: "quiet" },
      ],
    });
    if (ok !== "buy") return;
    const r = store().buy(`accent:${a.id}`);
    if (typeof r === "string") return toast(buyError(r));
    cue("chest", [12, 40, 12]);
    toast(`${a.name} on`);
  };

  return (
    <>
      <section className="shuk-sec first">
        <div className="shuk-h">
          <span className="eyebrow">Streak</span>
          <span className="k">
            <span aria-hidden="true">✦</span> {gems.toLocaleString("en-US")} to spend
          </span>
        </div>
        <div className="shuk-list">
          {offer && (
            <ShopRow
              hot
              icon="↺"
              tone="coral"
              title={`Restore your ${offer.streak}-day streak`}
              desc={`You missed ${offer.days.length === 1 ? "a day" : `${offer.days.length} days`}. Buy it back before it's gone for good.`}
              cost={offer.cost}
              gems={gems}
              onBuy={repair}
            />
          )}
          <ShopRow
            icon={<IconFreeze />}
            tone="plum"
            title="Streak freeze"
            desc="Covers a missed day on its own, so the streak survives."
            meta={`Held ${freezes}/${FREEZE_MAX}`}
            cost={FREEZE_COST}
            gems={gems}
            blocked={freezes >= FREEZE_MAX ? "Full" : undefined}
            onBuy={buyFreeze}
          />
        </div>
      </section>

      <section className="shuk-sec">
        <div className="shuk-h">
          <span className="eyebrow">Market</span>
          <span className="k">boosts for the Shuk</span>
        </div>
        <div className="shuk-list">
          <ShopRow
            icon="»"
            tone="coral"
            title="Rush token"
            desc={`A ${RUSH_TOKEN_MIN}-minute rush hour: every stall earns ×${RUSH_TOKEN_MULT}.`}
            meta={
              rushNow > RUSH_TOKEN_MULT
                ? `A ×${rushNow} rush is already running`
                : rushNow === RUSH_TOKEN_MULT
                  ? "Extends the rush that's running"
                  : undefined
            }
            cost={RUSH_TOKEN_COST}
            gems={gems}
            blocked={
              rate <= 0 ? "No stalls" : rushNow > RUSH_TOKEN_MULT ? `×${rushNow} on` : undefined
            }
            onBuy={buyRush}
          />
          <ShopRow
            icon="?"
            tone="gold"
            title="Lucky bag"
            desc="A surprise: shekels (maybe a jackpot), gems, a streak freeze or a ×3 rush hour."
            cost={BAG_COST}
            gems={gems}
            onBuy={buyBag}
          />
        </div>
      </section>

      <section className="shuk-sec">
        <div className="shuk-h">
          <span className="eyebrow">Accents</span>
          <span className="k">recolour the app</span>
        </div>
        <div className="shuk-accents">
          {ACCENTS.map((a) => {
            const owned = ownsAccent(p, a.id);
            const on = p.settings.accent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                className={"acc" + (on ? " on" : "") + (owned ? " owned" : "")}
                style={{ "--sw": `var(--sw-${a.id})` } as CSSProperties}
                aria-pressed={on}
                onClick={() => pickAccent(a)}
              >
                <span className="sw" aria-hidden="true" />
                <span className="t">{a.name}</span>
                <Heb className="he">{a.he}</Heb>
                <span className="st">
                  {on ? (
                    "Wearing"
                  ) : owned ? (
                    "Equip"
                  ) : (
                    <>
                      <span aria-hidden="true">✦</span> {ACCENT_COST}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
