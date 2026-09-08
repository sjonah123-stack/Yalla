/* Yalla — Hebrew root trainer. Plain JS, no build step. */
(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const DAY = 86400000;
  const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const FINALS = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
  const normLetters = (s) => s.replace(/[֑-ׇ]/g, "").split("").map((c) => FINALS[c] || c).join("");
  const rootLetters = (root) => root.r.replace(/\d/g, "");          // "שכר2" -> "שכר"
  const rootDisplay = (root) => rootLetters(root).split("").join(" "); // spaced letters
  const stripNikud = (s) => s.replace(/[֑-ׇ]/g, "");

  // ---------- State ----------
  const KEY = "yalla.v1";
  const DEFAULT = () => ({
    v: 1, xp: 0, streak: 0, lastPlay: null, roots: {}, history: {},
    settings: { sessionLen: 20, newPerSession: 8, cats: [], nikud: true },
    updatedAt: 0,
  });
  let S = DEFAULT();
  let db = null, syncStatus = "local";

  function loadLocal() {
    try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(DEFAULT(), JSON.parse(raw)); } catch (e) { /* no storage */ }
  }
  let saveTimer = null;
  function save(immediate) {
    S.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
    if (!db) return;
    clearTimeout(saveTimer);
    const doSave = () => db.doc("progress/main").set(S).then(() => setSync("synced")).catch(() => setSync("local"));
    if (immediate) doSave(); else saveTimer = setTimeout(doSave, 800);
  }
  function setSync(s) { syncStatus = s; const el = $("#sync"); if (el) el.textContent = s === "synced" ? "Synced" : "Saved on this device"; }

  async function connectDb() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    try {
      db = await window.claude.use("db");
      if (!db) return;
      const snap = await db.doc("progress/main").get();
      if (snap.exists) {
        const remote = snap.data();
        if ((remote.updatedAt || 0) > (S.updatedAt || 0)) { S = Object.assign(DEFAULT(), remote); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} render(); }
        else if ((S.updatedAt || 0) > (remote.updatedAt || 0)) { save(true); }
      } else { save(true); }
      setSync("synced");
    } catch (e) { db = null; }
  }

  // ---------- Root bookkeeping ----------
  const ROOT_BY_ID = Object.fromEntries(ROOTS.map((r) => [r.r, r]));
  const CATS = [...new Set(ROOTS.map((r) => r.cat))];
  function rs(id) { return S.roots[id] || (S.roots[id] = { ease: 2.5, ivl: 0, due: 0, reps: 0, lapses: 0, ok: 0, bad: 0 }); }
  function seen(id) { return !!S.roots[id] && (S.roots[id].ok + S.roots[id].bad) > 0; }
  function mastery(id) { const r = S.roots[id]; if (!r || r.reps === 0) return 0; const i = r.ivl; return i >= 30 ? 5 : i >= 15 ? 4 : i >= 7 ? 3 : i >= 3 ? 2 : 1; }
  function isDue(id) { const r = S.roots[id]; return !!r && r.reps > 0 && r.due <= Date.now(); }
  function level() { return Math.floor(Math.sqrt(S.xp / 100)) + 1; }
  function levelFloor(l) { return 100 * (l - 1) * (l - 1); }
  function levelCeil(l) { return 100 * l * l; }

  function applyAnswer(id, correct, firstAttempt) {
    const r = rs(id);
    if (correct) {
      r.ok++;
      if (firstAttempt) {
        r.reps++;
        r.ivl = r.reps === 1 ? 1 : r.reps === 2 ? 3 : Math.round(r.ivl * r.ease);
        r.ease = Math.min(3, r.ease + 0.05);
      } else { r.reps = 1; r.ivl = 1; }
      r.due = Date.now() + r.ivl * DAY;
    } else {
      r.bad++; r.lapses++; r.reps = 0; r.ivl = 0; r.ease = Math.max(1.3, r.ease - 0.2); r.due = Date.now();
    }
    const day = todayKey(); const h = S.history[day] || (S.history[day] = { ok: 0, bad: 0, xp: 0 });
    if (correct) h.ok++; else h.bad++;
  }
  function touchStreak() {
    const t = todayKey(); if (S.lastPlay === t) return;
    const y = todayKey(new Date(Date.now() - DAY));
    S.streak = S.lastPlay === y ? S.streak + 1 : 1; S.lastPlay = t;
  }

  // ---------- Question generation ----------
  function pool() { const cats = S.settings.cats; return cats.length ? ROOTS.filter((r) => cats.includes(r.cat)) : ROOTS; }
  function buildQueue(len) {
    const P = pool();
    const due = P.filter((r) => isDue(r.r)).sort((a, b) => S.roots[a.r].due - S.roots[b.r].due);
    const fresh = P.filter((r) => !seen(r.r)).sort((a, b) => a.tier - b.tier || Math.random() - 0.5);
    const q = due.slice(0, len);
    for (const r of fresh) { if (q.length >= len || q.filter((x) => !seen(x.r)).length >= S.settings.newPerSession) break; q.push(r); }
    if (q.length < len) {
      const rest = P.filter((r) => !q.includes(r)).sort((a, b) => mastery(a.r) - mastery(b.r) || Math.random() - 0.5);
      for (const r of rest) { if (q.length >= len) break; q.push(r); }
    }
    return shuffle(q);
  }
  function modeFor(root) {
    const m = mastery(root.r);
    const opts = m === 0 ? ["rootMeaning", "rootMeaning", "meaningRoot"]
      : m <= 2 ? ["wordRoot", "meaningRoot", "rootMeaning", "oddOne"]
      : ["wordRoot", "oddOne", "typeRoot", "typeRoot"];
    if (root.words.length < 3) return pick(opts.filter((o) => o !== "oddOne")) || "rootMeaning";
    return pick(opts);
  }
  function similarRoots(root, n) {
    const L = rootLetters(root);
    const scored = ROOTS.filter((r) => r !== root && rootLetters(r) !== L).map((r) => {
      const l2 = rootLetters(r); let s = 0; for (const c of L) if (l2.includes(c)) s++;
      if (r.cat === root.cat) s += 0.5; return { r, s: s + Math.random() * 0.4 };
    }).sort((a, b) => b.s - a.s);
    const out = []; const seenL = new Set([L]);
    for (const { r } of scored) { const l2 = rootLetters(r); if (seenL.has(l2)) continue; seenL.add(l2); out.push(r); if (out.length >= n) break; }
    return out;
  }
  function makeQuestion(root) {
    const mode = modeFor(root);
    const sim = similarRoots(root, 3);
    if (mode === "rootMeaning") {
      const opts = shuffle([root, ...sim].map((r) => ({ label: r.m, ok: r === root })));
      return { mode, root, title: "What does this root mean?", prompt: `<div class="root">${rootDisplay(root)}</div>`, opts, kind: "en" };
    }
    if (mode === "meaningRoot") {
      const opts = shuffle([root, ...sim].map((r) => ({ label: rootDisplay(r), ok: r === root })));
      return { mode, root, title: "Which root carries this meaning?", prompt: `<div class="meaning">${esc(root.m)}</div>`, opts, kind: "heb" };
    }
    if (mode === "wordRoot") {
      const w = pick(root.words);
      const opts = shuffle([root, ...sim].map((r) => ({ label: rootDisplay(r), ok: r === root })));
      return { mode, root, word: w, title: "Find the root", prompt: `<div class="word">${wordHtml(w)}</div><div class="gloss">${esc(w.g)}</div>`, opts, kind: "heb" };
    }
    if (mode === "oddOne") {
      const mine = shuffle(root.words).slice(0, 3);
      const other = sim[0]; const ow = pick(other.words);
      const opts = shuffle([...mine.map((w) => ({ label: wordHtml(w), sub: w.g, ok: false, w })), { label: wordHtml(ow), sub: ow.g, ok: true, w: ow, from: other }]);
      return { mode, root, title: "Which word is NOT from this root?", prompt: `<div class="root">${rootDisplay(root)}</div><div class="gloss">${esc(root.m)}</div>`, opts, kind: "hebword", odd: other };
    }
    // typeRoot
    const w = pick(root.words);
    return { mode, root, word: w, title: "Type the root", prompt: `<div class="word">${wordHtml(w)}</div><div class="gloss">${esc(w.g)}</div>`, answer: rootLetters(root) };
  }
  function wordHtml(w) { return esc(S.settings.nikud ? w.h : stripNikud(w.h)); }
  function xpFor(q, combo, first) {
    let x = q.mode === "typeRoot" ? 20 : q.mode === "oddOne" ? 15 : 10;
    if (combo >= 3) x += 5; if (combo >= 6) x += 5;
    if (!first) x = Math.round(x / 2);
    return x;
  }

  // ---------- Session ----------
  let session = null;
  function startSession(len) {
    const queue = buildQueue(len || S.settings.sessionLen);
    if (!queue.length) { toast("No roots match this filter yet."); return; }
    session = { queue, i: 0, combo: 0, best: 0, ok: 0, bad: 0, xp: 0, retried: new Set(), missed: [], learned: [], q: null, answered: false, typed: [] };
    view = "play"; nextQuestion();
  }
  function nextQuestion() {
    if (session.i >= session.queue.length) { session.done = true; render(); return; }
    const root = session.queue[session.i];
    session.q = makeQuestion(root); session.answered = false; session.typed = [];
    render();
  }
  function answer(correct, q) {
    if (session.answered) return; session.answered = true;
    const id = q.root.r; const first = !session.retried.has(id);
    const wasNew = !seen(id);
    applyAnswer(id, correct, first);
    touchStreak();
    if (correct) {
      session.combo++; session.best = Math.max(session.best, session.combo); session.ok++;
      const x = xpFor(q, session.combo, first); session.xp += x; S.xp += x; session.lastXp = x;
      (S.history[todayKey()]).xp += x;
      if (wasNew) session.learned.push(id);
    } else {
      session.combo = 0; session.bad++; session.lastXp = 0;
      if (!session.retried.has(id)) { session.retried.add(id); session.missed.push(id); const at = Math.min(session.queue.length, session.i + 4); session.queue.splice(at, 0, q.root); }
    }
    save(); render();
  }

  // ---------- Views ----------
  let view = "home";
  let bankFilter = "", bankOpen = null;
  const app = () => $("#app");

  function render() {
    renderTop();
    const nav = $("#nav"); nav.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", b.dataset.view === view ? "page" : "false"));
    if (view === "home") renderHome(); else if (view === "play") renderPlay(); else renderBank();
    window.scrollTo({ top: 0 });
  }
  function renderTop() {
    const l = level(); const lo = levelFloor(l), hi = levelCeil(l); const pct = Math.round(((S.xp - lo) / (hi - lo)) * 100);
    $("#stats").innerHTML = `<span class="stat"><i class="ic sun"></i><span class="tnum">${S.streak}</span> day${S.streak === 1 ? "" : "s"}</span><span class="stat"><i class="ic cobalt"></i>Lv <span class="tnum">${l}</span> · <span class="tnum">${S.xp}</span> XP</span>`;
    $("#xpfill").style.width = Math.max(2, pct) + "%";
  }

  function renderHome() {
    const P = pool();
    const due = P.filter((r) => isDue(r.r)).length; const known = P.filter((r) => seen(r.r)).length;
    const mastered = P.filter((r) => mastery(r.r) >= 4).length;
    const h = S.history[todayKey()] || { ok: 0, bad: 0, xp: 0 };
    const hour = new Date().getHours(); const greet = hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";
    app().innerHTML = `
      <section class="card">
        <div class="eyebrow">Today</div>
        <h2><span class="heb">${greet}</span>, Jonah. ${due ? `${due} root${due === 1 ? "" : "s"} due for review.` : known ? "Nothing due. Learn something new." : "Start with the most common roots."}</h2>
        <div class="home-grid">
          <div class="tile"><div class="n tnum">${due}</div><div class="l">due now</div></div>
          <div class="tile"><div class="n tnum">${known}<span class="muted" style="font-size:14px;font-weight:600">/${P.length}</span></div><div class="l">roots seen</div></div>
          <div class="tile"><div class="n tnum">${mastered}</div><div class="l">mastered</div></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="start">Start session · ${S.settings.sessionLen}</button>
          <button class="btn btn-secondary" id="quick">Quick 10</button>
        </div>
        <p class="small muted" style="margin:12px 0 0">Today: ${h.ok} right, ${h.bad} wrong, +${h.xp} XP. <span id="sync" class="sync">${syncStatus === "synced" ? "Synced" : "Saved on this device"}</span></p>
      </section>
      <section class="card">
        <div class="mode-label"><div class="eyebrow">Focus</div><button class="btn btn-ghost small" id="clearcats" ${S.settings.cats.length ? "" : "hidden"}>All themes</button></div>
        <div class="cats">${CATS.map((c) => { const rs_ = ROOTS.filter((r) => r.cat === c); const m = Math.round(rs_.reduce((a, r) => a + mastery(r.r), 0) / (rs_.length * 5) * 100); return `<button class="chip" data-cat="${esc(c)}" aria-pressed="${S.settings.cats.includes(c)}">${esc(c)} <span class="pct tnum">${m}%</span></button>`; }).join("")}</div>
        <p class="small muted" style="margin:12px 0 0">Pick themes to drill, or leave all off to mix everything. Roots are scheduled by spaced repetition: right answers push a root further out (1 → 3 → 7 → 15 → 30+ days); a miss brings it back tomorrow.</p>
      </section>
      <section class="card">
        <div class="eyebrow">Settings</div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn btn-secondary" id="nikud">Nikud: ${S.settings.nikud ? "on" : "off"}</button>
          <button class="btn btn-secondary" id="newper">New per session: ${S.settings.newPerSession}</button>
        </div>
      </section>`;
    $("#start").onclick = () => startSession();
    $("#quick").onclick = () => startSession(10);
    $("#clearcats").onclick = () => { S.settings.cats = []; save(); render(); };
    $("#nikud").onclick = () => { S.settings.nikud = !S.settings.nikud; save(); render(); };
    $("#newper").onclick = () => { const o = [4, 8, 12, 20]; S.settings.newPerSession = o[(o.indexOf(S.settings.newPerSession) + 1) % o.length]; save(); render(); };
    app().querySelectorAll(".chip").forEach((b) => b.onclick = () => { const c = b.dataset.cat; const i = S.settings.cats.indexOf(c); if (i >= 0) S.settings.cats.splice(i, 1); else S.settings.cats.push(c); save(); render(); });
  }

  function renderPlay() {
    if (!session) { view = "home"; return render(); }
    if (session.done) return renderSummary();
    const q = session.q; const n = session.queue.length; const pct = Math.round((session.i / n) * 100);
    const hot = session.combo >= 3;
    let body = "";
    if (q.mode === "typeRoot") {
      const L = q.answer.length; const t = session.typed;
      const slots = Array.from({ length: L }, (_, i) => { let cls = "slot"; if (session.answered) cls += t[i] === q.answer[i] ? " correct" : " wrong"; else if (t[i]) cls += " filled"; return `<div class="${cls}">${esc(t[i] || "")}</div>`; }).join("");
      const rows = ["קראטופ", "שדגכעיחל", "זסבהנמצת"];
      body = `<div class="typed">${slots}</div>` + (session.answered ? "" : `<div class="kb">${rows.map((r) => `<div class="row">${r.split("").map((c) => `<button data-k="${c}">${c}</button>`).join("")}</div>`).join("")}<div class="row"><button class="wide" data-k="⌫">delete</button><button class="wide" data-k="⏎" style="background:var(--cobalt);color:var(--cobalt-ink);border-color:var(--cobalt)">check</button></div></div><p class="small muted" style="text-align:center;margin:10px 0 0">Tap letters, or type on your keyboard (Hebrew or the English keys in the same spots).</p>`);
    } else {
      body = `<div class="options ${q.kind === "hebword" ? "" : ""}">${q.opts.map((o, i) => { let cls = "opt"; if (session.answered) { if (o.ok) cls += " correct"; else if (session.pickedIdx === i) cls += " wrong"; }
        const inner = q.kind === "en" ? `<span class="en">${esc(o.label)}</span>` : q.kind === "heb" ? `<span class="heb">${o.label}</span>` : `<span class="heb">${o.label}</span><span class="sub">${esc(o.sub)}</span>`;
        return `<button class="${cls}" data-i="${i}" ${session.answered ? "disabled" : ""}>${inner}</button>`; }).join("")}</div>`;
    }
    let fb = "";
    if (session.answered) {
      const good = session.lastCorrect; const r = q.root;
      const fam = r.words.slice(0, 6).map((w) => `<span>${wordHtml(w)} <small>${esc(w.g)}</small></span>`).join("");
      let head = good ? pick(["יופי!", "כל הכבוד!", "מצוין!", "נכון!", "סבבה!"]) : `The root is <span class="heb" style="letter-spacing:.1em">${rootDisplay(r)}</span> (${esc(r.m)})`;
      if (!good && q.mode === "oddOne" && q.odd) head = `<span class="heb">${wordHtml(q.opts.find((o) => o.ok).w)}</span> is from <span class="heb" style="letter-spacing:.1em">${rootDisplay(q.odd)}</span> (${esc(q.odd.m)})`;
      if (!good && q.mode === "typeRoot") head = `The root is <span class="heb" style="letter-spacing:.1em">${rootDisplay(r)}</span> (${esc(r.m)})`;
      fb = `<div class="feedback ${good ? "good" : "bad"}"><div class="head"><span>${head}</span><span class="xp tnum">${good ? "+" + session.lastXp + " XP" : "again soon"}</span></div><div class="small muted">${esc(r.m)} · ${esc(r.cat)} · mastery ${mastery(r.r)}/5</div><div class="family">${fam}</div>${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}<button class="btn btn-primary btn-block" id="next" style="margin-top:8px">${session.i + 1 >= n ? "Finish" : "Next"}</button></div>`;
    }
    app().innerHTML = `
      <section class="card">
        <div class="progress"><div class="bar"><div style="width:${pct}%"></div></div><span class="combo tnum ${hot ? "hot" : ""}">${session.combo > 1 ? "×" + session.combo : ""}&nbsp;${session.i + 1}/${n}</span></div>
        <div class="mode-label"><div class="eyebrow">${esc(q.title)}</div><span class="small muted">${seen(q.root.r) ? "review" : "new root"}${q.word && q.word.b ? " · " + esc(q.word.b) : ""}</span></div>
        <div class="prompt">${q.prompt}</div>
        ${body}${fb}
      </section>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-ghost" id="quit">End session</button></div>`;
    app().querySelectorAll(".opt").forEach((b) => b.onclick = () => { const i = +b.dataset.i; session.pickedIdx = i; session.lastCorrect = q.opts[i].ok; answer(q.opts[i].ok, q); });
    app().querySelectorAll(".kb button").forEach((b) => b.onclick = () => keyIn(b.dataset.k));
    const nx = $("#next"); if (nx) nx.onclick = () => { session.i++; nextQuestion(); };
    $("#quit").onclick = () => { session.done = true; render(); };
  }
  const QWERTY = { q: "/", w: "'", e: "ק", r: "ר", t: "א", y: "ט", u: "ו", i: "ן", o: "ם", p: "פ", a: "ש", s: "ד", d: "ג", f: "כ", g: "ע", h: "י", j: "ח", k: "ל", l: "ך", z: "ז", x: "ס", c: "ב", v: "ה", b: "נ", n: "מ", m: "צ", ",": "ת", ".": "ץ" };
  function keyIn(k) {
    if (!session || session.done || session.q.mode !== "typeRoot" || session.answered) return;
    const q = session.q;
    if (k === "⌫") session.typed.pop();
    else if (k === "⏎") { if (session.typed.length === q.answer.length) { session.lastCorrect = session.typed.join("") === q.answer; answer(session.lastCorrect, q); return; } }
    else if (session.typed.length < q.answer.length) { session.typed.push(FINALS[k] || k); if (session.typed.length === q.answer.length) { session.lastCorrect = session.typed.join("") === q.answer; answer(session.lastCorrect, q); return; } }
    renderPlay();
  }
  document.addEventListener("keydown", (e) => {
    if (view !== "play" || !session || session.done) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (session.answered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); const nx = $("#next"); if (nx) nx.click(); return; }
    if (session.q.mode === "typeRoot") {
      if (e.key === "Backspace") { e.preventDefault(); keyIn("⌫"); }
      else if (e.key === "Enter") keyIn("⏎");
      else if (/^[א-ת]$/.test(e.key)) keyIn(e.key);
      else if (QWERTY[e.key.toLowerCase()] && /^[א-ת]$/.test(QWERTY[e.key.toLowerCase()])) keyIn(QWERTY[e.key.toLowerCase()]);
    } else if (!session.answered && /^[1-4]$/.test(e.key)) { const b = app().querySelectorAll(".opt")[+e.key - 1]; if (b) b.click(); }
  });

  function renderSummary() {
    const s = session; const total = s.ok + s.bad; const acc = total ? Math.round((s.ok / total) * 100) : 0;
    const missed = [...new Set(s.missed)].map((id) => ROOT_BY_ID[id]);
    const learned = s.learned.map((id) => ROOT_BY_ID[id]);
    app().innerHTML = `
      <section class="card summary">
        <div class="eyebrow">Session complete</div>
        <div class="big tnum">+${s.xp} XP</div>
        <p class="muted" style="margin:6px 0 0">${s.ok} right · ${s.bad} wrong · ${acc}% · best combo ×${s.best}${s.streak ? "" : ""}</p>
        ${learned.length ? `<h3 style="margin-top:18px;font-size:15px">New roots learned</h3><ul>${learned.map((r) => `<li><span class="heb">${rootDisplay(r)}</span><span class="muted">${esc(r.m)}</span></li>`).join("")}</ul>` : ""}
        ${missed.length ? `<h3 style="margin-top:18px;font-size:15px">Back tomorrow</h3><ul>${missed.map((r) => `<li><span class="heb">${rootDisplay(r)}</span><span class="muted">${esc(r.m)}</span></li>`).join("")}</ul>` : ""}
        <div class="btn-row"><button class="btn btn-primary" id="again">Another session</button><button class="btn btn-secondary" id="home">Home</button></div>
      </section>`;
    $("#again").onclick = () => startSession();
    $("#home").onclick = () => { session = null; view = "home"; render(); };
  }

  function renderBank() {
    const f = bankFilter.trim().toLowerCase(); const fh = normLetters(f);
    const list = ROOTS.filter((r) => !f || rootLetters(r).includes(fh) || r.m.toLowerCase().includes(f) || r.cat.includes(f) || r.words.some((w) => stripNikud(w.h).includes(f) || w.g.toLowerCase().includes(f) || w.t.toLowerCase().includes(f)));
    const groups = {}; list.forEach((r) => (groups[r.cat] = groups[r.cat] || []).push(r));
    const dueCount = ROOTS.filter((r) => isDue(r.r)).length;
    app().innerHTML = `
      <section class="card">
        <div class="mode-label"><h2>Root bank</h2><span class="small muted tnum">${ROOTS.length} roots · ${ROOTS.reduce((a, r) => a + r.words.length, 0)} words${dueCount ? ` · <span class="due-badge">${dueCount} due</span>` : ""}</span></div>
        <input class="search" id="search" placeholder="Search a root, a word, or a meaning (e.g. כתב, mishpat, justice)" value="${esc(bankFilter)}" style="margin-top:12px" autocomplete="off">
      </section>
      ${Object.keys(groups).map((c) => `<div class="eyebrow" style="margin:18px 0 8px">${esc(c)} <span class="muted tnum">· ${groups[c].length}</span></div><div class="bank-list">${groups[c].map(rootRow).join("")}</div>`).join("") || `<p class="muted" style="margin-top:16px">Nothing matches.</p>`}`;
    const inp = $("#search"); inp.oninput = () => { bankFilter = inp.value; const pos = inp.selectionStart; renderBank(); const i2 = $("#search"); i2.focus(); i2.setSelectionRange(pos, pos); };
    app().querySelectorAll(".root-row").forEach((el) => el.onclick = (e) => { if (e.target.closest(".root-detail")) return; bankOpen = bankOpen === el.dataset.id ? null : el.dataset.id; renderBank(); });
  }
  function rootRow(r) {
    const m = mastery(r.r); const st = S.roots[r.r]; const open = bankOpen === r.r;
    const dueTxt = st && st.reps ? (isDue(r.r) ? "due now" : `due in ${Math.max(1, Math.ceil((st.due - Date.now()) / DAY))}d`) : "not started";
    const detail = open ? `<div class="root-detail"><div class="wordlist">${r.words.map((w) => `<div class="w"><div class="g">${esc(w.g)} <small>· ${esc(w.b)}</small><div class="t">${esc(w.t)}</div></div><div class="heb">${wordHtml(w)}</div></div>`).join("")}</div>${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}<div class="small muted" style="margin-top:8px">${st ? `${st.ok} right · ${st.bad} wrong · interval ${st.ivl}d` : "No attempts yet"}</div></div>` : "";
    return `<div class="root-row" data-id="${esc(r.r)}"><div class="r">${rootDisplay(r)}</div><div><div class="m">${esc(r.m)}</div><div class="c">${r.words.length} words · tier ${r.tier} · ${dueTxt}</div></div><div class="mastery ${m ? "" : "new"}" title="mastery ${m}/5"><div style="width:${m ? m * 20 : 100}%"></div></div>${detail}</div>`;
  }

  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1800); }

  // ---------- Boot ----------
  loadLocal();
  $("#nav").querySelectorAll("button").forEach((b) => b.onclick = () => { view = b.dataset.view; if (view === "play" && !session) { startSession(); return; } render(); });
  render();
  connectDb();
})();
