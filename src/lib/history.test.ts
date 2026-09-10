import { describe, expect, it } from "vitest";
import {
  createMirror,
  layerStack,
  pushTrail,
  reduceBack,
  scrollKey,
  summaryExit,
  type NavState,
} from "./history";

const base: NavState = {
  trail: ["home"],
  view: "home",
  unitSheet: null,
  toolUnit: null,
  settingsOpen: false,
  confirmOpen: false,
  session: false,
  onboarded: true,
};
const st = (o: Partial<NavState>): NavState => ({ ...base, ...o });
const kinds = (s: NavState) => layerStack(s).map((l) => l.kind);

describe("pushTrail", () => {
  it("appends new tabs, truncates to revisited ones, ignores non-shell views", () => {
    expect(pushTrail(["home"], "path")).toEqual(["home", "path"]);
    expect(pushTrail(["home", "path", "bank"], "path")).toEqual(["home", "path"]);
    expect(pushTrail(["home", "path"], "home")).toEqual(["home"]);
    expect(pushTrail(["home", "path"], "play")).toEqual(["home", "path"]);
    expect(pushTrail(["home", "path"], "match")).toEqual(["home", "path"]);
  });
});

describe("layerStack", () => {
  it("is empty on Home with nothing open, and on Welcome", () => {
    expect(kinds(base)).toEqual([]);
    expect(kinds(st({ onboarded: false, unitSheet: "speech-1", settingsOpen: true }))).toEqual([]);
    expect(kinds(st({ onboarded: false, confirmOpen: true }))).toEqual(["confirm"]);
    expect(kinds(st({ onboarded: false, session: true, view: "play" }))).toEqual(["play"]);
  });
  it("stacks tabs, then one of unit/settings, tool, or play, then confirm", () => {
    expect(kinds(st({ trail: ["home", "path"], view: "path", unitSheet: "speech-1" }))).toEqual([
      "tab",
      "unit",
    ]);
    expect(
      kinds(
        st({ trail: ["home", "path"], view: "path", unitSheet: "speech-1", settingsOpen: true }),
      ),
    ).toEqual(["tab", "unit", "settings"]);
    expect(
      kinds(
        st({ trail: ["home", "path"], view: "match", toolUnit: "speech-1", unitSheet: "speech-1" }),
      ),
    ).toEqual(["tab", "tool"]);
    expect(kinds(st({ trail: ["home", "path"], view: "play", session: true }))).toEqual([
      "tab",
      "play",
    ]);
    expect(kinds(st({ view: "path", trail: ["home", "path"], session: true }))).toEqual(["tab"]);
    expect(kinds(st({ view: "play", session: true, confirmOpen: true }))).toEqual([
      "play",
      "confirm",
    ]);
  });
});

describe("reduceBack", () => {
  it("maps the top layer to its action", () => {
    expect(reduceBack(base)).toBe("none");
    expect(reduceBack(st({ trail: ["home", "bank"], view: "bank" }))).toBe("popTab");
    expect(reduceBack(st({ view: "path", trail: ["home", "path"], unitSheet: "speech-1" }))).toBe(
      "closeUnit",
    );
    expect(reduceBack(st({ settingsOpen: true }))).toBe("closeSettings");
    expect(reduceBack(st({ view: "flashcards", toolUnit: "speech-1" }))).toBe("leaveTool");
    expect(reduceBack(st({ view: "play", session: true }))).toBe("quitPlay");
    expect(reduceBack(st({ view: "play", session: true, confirmOpen: true }))).toBe("closeConfirm");
  });
});

describe("summaryExit / scrollKey", () => {
  it("routes by plan kind", () => {
    expect(summaryExit({ kind: "lesson", unit: "speech-1" })).toEqual({
      view: "path",
      unit: "speech-1",
    });
    expect(summaryExit({ kind: "test", unit: "speech-2" })).toEqual({
      view: "path",
      unit: "speech-2",
    });
    expect(summaryExit({ kind: "practice" })).toEqual({ view: "path" });
    expect(summaryExit({ kind: "placement" })).toEqual({ view: "path" });
    expect(summaryExit({ kind: "speed" })).toEqual({ view: "home" });
    expect(scrollKey("bank", " Ab ", "due")).toBe("bank|ab|due");
    expect(scrollKey("path", "x", "due")).toBe("path");
  });
});

describe("createMirror", () => {
  const rec = () => {
    const log: string[] = [];
    const port = {
      push: (d: number) => log.push(`push${d}`),
      go: (d: number) => log.push(`go${d}`),
    };
    return { log, m: createMirror(port) };
  };
  it("pushes one entry per opened layer and goes back once for closes", () => {
    const { log, m } = rec();
    m.sync(2);
    expect(log).toEqual(["push1", "push2"]);
    expect(m.cur).toBe(2);
    m.sync(0);
    expect(log).toEqual(["push1", "push2", "go-2"]);
    expect(m.inflight).toBe(true);
    expect(m.onPop(0)).toBe("consumed");
    expect(m.cur).toBe(0);
  });
  it("defers a sync while a go is in flight and honours it after the pop", () => {
    const { log, m } = rec();
    m.sync(2);
    m.sync(1);
    m.sync(2); // opened again before the pop landed
    expect(log).toEqual(["push1", "push2", "go-1"]);
    expect(m.onPop(1)).toBe("consumed");
    expect(log).toEqual(["push1", "push2", "go-1", "push2"]);
  });
  it("reports user back and forward pops and treats foreign entries as depth 0", () => {
    const { m } = rec();
    m.sync(2);
    expect(m.onPop(1)).toBe("back");
    expect(m.onPop(2)).toBe("forward");
    expect(m.onPop(2)).toBe("same");
    expect(m.onPop(null)).toBe("back");
    expect(m.cur).toBe(0);
  });
  it("reset clears an inflight go", () => {
    const { m } = rec();
    m.sync(1);
    m.sync(0);
    expect(m.inflight).toBe(true);
    m.reset(0);
    expect(m.inflight).toBe(false);
    expect(m.cur).toBe(0);
  });
});
