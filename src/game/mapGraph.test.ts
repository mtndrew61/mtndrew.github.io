import { describe, expect, it } from "vitest";
import { reachableFrom } from "./mapGraph";

describe("reachableFrom", () => {
  it("reaches ashfork from gate with enough steps", () => {
    const r = reachableFrom("gate", 8000, 0);
    expect(r.has("fork-ash")).toBe(true);
    expect(r.get("fork-ash")!.cost).toBe(600);
  });

  it("cannot reach distant peak with tiny budget", () => {
    const r = reachableFrom("gate", 500, 0);
    expect(r.has("peak")).toBe(false);
    expect(r.size).toBe(0);
  });

  it("move discount lowers costs", () => {
    const full = reachableFrom("gate", 700, 0);
    const discounted = reachableFrom("gate", 700, 0.24);
    expect(full.has("fork-ash")).toBe(true);
    expect(discounted.get("fork-ash")!.cost).toBeLessThan(
      full.get("fork-ash")!.cost,
    );
  });
});
