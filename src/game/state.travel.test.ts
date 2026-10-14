import { describe, expect, it } from "vitest";
import { createInitialState, getTravelOptions, moveTo } from "./state";

describe("adjacent travel", () => {
  it("only offers neighbor nodes", () => {
    const state = createInitialState(10);
    const opts = getTravelOptions(state);
    expect([...opts.keys()]).toEqual(["fork-ash"]);
  });

  it("stops at Briarhaven instead of skipping to the ridge", () => {
    let state = {
      ...createInitialState(11),
      currentNodeId: "river-ford",
      stepsRemaining: 5000,
    };
    const opts = getTravelOptions(state);
    expect(opts.has("town-briar")).toBe(true);
    expect(opts.has("fork-ridge")).toBe(false);
    state = moveTo(state, "town-briar");
    expect(state.currentNodeId).toBe("town-briar");
    expect(state.checkpointNodeId).toBe("town-briar");
  });
});
