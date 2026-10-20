import { describe, expect, it } from "vitest";
import { sumStepSamples, todayStepWindow } from "./steps";

describe("sumStepSamples", () => {
  it("sums bucket values", () => {
    expect(sumStepSamples([{ value: 1200 }, { value: 800.4 }])).toBe(2000);
  });

  it("treats missing samples as zero", () => {
    expect(sumStepSamples(undefined)).toBe(0);
    expect(sumStepSamples([])).toBe(0);
  });
});

describe("todayStepWindow", () => {
  it("starts at local midnight", () => {
    const now = new Date(2026, 9, 20, 15, 30, 0);
    const window = todayStepWindow(now);
    expect(window.day).toBe("2026-10-20");
    expect(new Date(window.startDate).getHours()).toBe(0);
    expect(window.endDate).toBe(now.toISOString());
  });
});
