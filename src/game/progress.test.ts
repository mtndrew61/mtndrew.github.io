import { describe, expect, it } from "vitest";
import { progressSummary, rankTitle, travelerRank } from "./progress";
import { createInitialState } from "./state";

describe("progress", () => {
  it("starts at rank 1–2 from the opening skill grant", () => {
    const state = createInitialState(1);
    expect(state.skillPointsEarned).toBe(3);
    expect(travelerRank(state)).toBe(2);
    expect(rankTitle(2)).toBe("Pathwalker");
  });

  it("summarizes spent vs unspent", () => {
    const state = {
      ...createInitialState(2),
      skillPoints: 1,
      skillPointsEarned: 4,
      skills: { "melee-edge": 2, "rogue-luck": 1 },
    };
    const s = progressSummary(state);
    expect(s.spent).toBe(3);
    expect(s.unspent).toBe(1);
    expect(s.earned).toBe(4);
    expect(s.rank).toBe(2);
  });
});
