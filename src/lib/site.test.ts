import { describe, expect, it } from "vitest";
import { CANONICAL_HOST, movedUrl, shouldMove } from "./site";

describe("shouldMove", () => {
  it("never moves the canonical host or unknown hosts", () => {
    expect(shouldMove(CANONICAL_HOST, null, true)).toBe(false);
    expect(shouldMove("localhost", null, true)).toBe(false);
  });
  it("moves a legacy host only when nothing local would be lost", () => {
    expect(shouldMove("yalla-677b9.web.app", null, false)).toBe(true);
    expect(shouldMove("yalla-677b9.web.app", 1, true)).toBe(true);
    expect(shouldMove("yalla-677b9.web.app", 1, false)).toBe(false);
  });
});

describe("movedUrl", () => {
  it("keeps path, query and hash and adds the moved flag", () => {
    expect(movedUrl("/", "", "")).toBe("https://yalla-roots.web.app/?moved=1");
    expect(movedUrl("/x", "?a=1", "#h")).toBe("https://yalla-roots.web.app/x?a=1&moved=1#h");
  });
});
