import { describe, expect, it } from "vitest";
import {
  createInitialState,
  getTravelOptions,
  moveTo,
  nextDay,
} from "./state";

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

  it("can leave town after next day", () => {
    let state = {
      ...createInitialState(12),
      currentNodeId: "town-briar",
      checkpointNodeId: "town-briar",
      stepsRemaining: 100,
    };
    state = nextDay(state);
    const opts = getTravelOptions(state);
    expect(state.stepsRemaining).toBeGreaterThan(1000);
    expect(opts.has("river-ford") || opts.has("fork-ridge")).toBe(true);
  });
});

