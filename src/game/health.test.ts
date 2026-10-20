import { describe, expect, it } from "vitest";
import { applyHealthSteps, createInitialState } from "./state";

describe("applyHealthSteps", () => {
  it("replaces the simulator pool on the first link", () => {
    const state = {
      ...createInitialState(1),
      stepsRemaining: 7000,
      stepsGranted: 8000,
    };
    const next = applyHealthSteps(state, 4200, state.day);
    expect(next.stepSource).toBe("health");
    expect(next.stepsGranted).toBe(4200);
    expect(next.stepsRemaining).toBe(4200);
    expect(next.journal[0]?.text).toMatch(/Apple Health linked/);
  });

  it("keeps stamina already spent when Health reports a higher total", () => {
    const day = "2026-10-20";
    const linked = applyHealthSteps(
      { ...createInitialState(2), day },
      5000,
      day,
    );
    const spent = { ...linked, stepsRemaining: 3000 };
    const next = applyHealthSteps(spent, 8000, day);
    expect(next.stepsGranted).toBe(8000);
    expect(next.stepsRemaining).toBe(6000);
    expect(next.journal).toBe(linked.journal);
  });

  it("returns the same state when the total is unchanged", () => {
    const state = applyHealthSteps(createInitialState(3), 1000, createInitialState(3).day);
    expect(applyHealthSteps(state, 1000, state.day)).toBe(state);
  });

  it("resets spend on a new calendar day", () => {
    const linked = applyHealthSteps(
      { ...createInitialState(4), day: "2026-10-19", hp: 40 },
      5000,
      "2026-10-19",
    );
    const fought = { ...linked, stepsRemaining: 1000, hp: 40 };
    const next = applyHealthSteps(fought, 9000, "2026-10-20");
    expect(next.day).toBe("2026-10-20");
    expect(next.stepSource).toBe("health");
    expect(next.stepsGranted).toBe(9000);
    expect(next.stepsRemaining).toBe(9000);
    expect(next.hp).toBe(55);
    expect(next.journal[0]?.text).toMatch(/New day/);
  });
});
