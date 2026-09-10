import { describe, expect, it } from "vitest";
import { useUi } from "./ui";

describe("confirm sheet", () => {
  it("resolves with the tapped value and clears the spec", async () => {
    const p = useUi.getState().confirm({ title: "?", actions: [{ label: "Yes", value: "yes" }] });
    expect(useUi.getState().confirmSpec?.title).toBe("?");
    useUi.getState().resolveConfirm("yes");
    expect(await p).toBe("yes");
    expect(useUi.getState().confirmSpec).toBeNull();
  });
  it("cancel resolves null", async () => {
    const p = useUi.getState().confirm({ title: "?", actions: [] });
    useUi.getState().resolveConfirm(null);
    expect(await p).toBeNull();
  });
  it("a second confirm settles the first with null", async () => {
    const a = useUi.getState().confirm({ title: "a", actions: [] });
    const b = useUi.getState().confirm({ title: "b", actions: [] });
    expect(await a).toBeNull();
    useUi.getState().resolveConfirm("ok");
    expect(await b).toBe("ok");
  });
  it("changing tab closes the unit sheet", () => {
    useUi.getState().openUnit("speech-1");
    useUi.getState().setView("bank");
    expect(useUi.getState().unitSheet).toBeNull();
  });
});
