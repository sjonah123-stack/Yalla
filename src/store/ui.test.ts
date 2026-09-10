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

describe("tab trail, tools and scroll memory", () => {
  it("setView maintains a deduplicated trail and popTab walks it", () => {
    const u = useUi.getState();
    u.setView("home");
    u.setView("path");
    u.setView("bank");
    expect(useUi.getState().trail).toEqual(["home", "path", "bank"]);
    useUi.getState().openUnit("speech-1");
    useUi.getState().popTab();
    expect(useUi.getState().view).toBe("path");
    expect(useUi.getState().unitSheet).toBeNull();
    useUi.getState().popTab();
    useUi.getState().popTab();
    expect(useUi.getState().trail).toEqual(["home"]);
    expect(useUi.getState().view).toBe("home");
  });
  it("leaveTool returns to the path with the tool's unit sheet open and clears toolUnit", () => {
    useUi.getState().openTool("match", "speech-1");
    useUi.getState().leaveTool();
    const s = useUi.getState();
    expect(s.view).toBe("path");
    expect(s.unitSheet).toBe("speech-1");
    expect(s.toolUnit).toBeNull();
  });
  it("remembers and forgets scroll offsets; openRoot forgets the bank key", () => {
    useUi.getState().rememberScroll("path", 320);
    expect(useUi.getState().scrollMemory.path).toBe(320);
    useUi.getState().rememberScroll("bank|all", 50);
    useUi.getState().openRoot("כתב");
    expect(useUi.getState().scrollMemory["bank||all"]).toBeUndefined();
    useUi.getState().forgetScroll("path");
    expect(useUi.getState().scrollMemory.path).toBeUndefined();
  });
});
