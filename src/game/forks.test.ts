import { describe, expect, it } from "vitest";
import { createInitialState, moveTo } from "./state";
import { getForkChoices } from "./forks";

describe("getForkChoices", () => {
  it("lists Ashfork roads with rumors and tags", () => {
    let state = createInitialState(42);
    state = moveTo({ ...state, stepsRemaining: 8000 }, "fork-ash");
    const choices = getForkChoices(state);
    expect(choices.length).toBeGreaterThanOrEqual(3);
    const roots = choices.find((c) => c.toId === "ambush-roots");
    expect(roots?.rumor?.title).toMatch(/Rootshadow/i);
    expect(roots?.tags).toContain("danger");
    const vale = choices.find((c) => c.toId === "vale");
    expect(vale?.tags).toContain("scenic");
  });

  it("marks unaffordable paths when steps are low", () => {
    const state = {
      ...createInitialState(43),
      currentNodeId: "fork-ash",
      stepsRemaining: 100,
    };
    const choices = getForkChoices(state);
    expect(choices.every((c) => !c.affordable)).toBe(true);
  });
});
