import { describe, expect, it } from "vitest";
import {
  applyDebtCap,
  computeBaseGoal,
  computeDamage,
  dailyTarget,
  resolveDay,
} from "./economy";
import { DEFAULT_BASE_GOAL, GOAL_MAX, GOAL_MIN } from "./content";

describe("computeBaseGoal", () => {
  it("defaults when empty", () => {
    expect(computeBaseGoal([])).toBe(DEFAULT_BASE_GOAL);
  });

  it("averages and clamps", () => {
    expect(computeBaseGoal([1000, 1000, 1000])).toBe(GOAL_MIN);
    expect(computeBaseGoal([20000, 20000])).toBe(GOAL_MAX);
    expect(computeBaseGoal([8000, 8200, 7800])).toBe(8000);
  });
});

describe("debt and target", () => {
  it("caps debt at 1× base goal", () => {
    expect(applyDebtCap(20000, 8000)).toBe(8000);
    expect(dailyTarget(8000, 1500)).toBe(9500);
  });
});

describe("computeDamage", () => {
  it("applies weapon multiplier to bank and steps", () => {
    const d = computeDamage(1000, 100, "iron-blade");
    // Math.floor avoids float drift (100 * 1.15 → 114.999…)
    expect(d.fromSteps).toBe(1150);
    expect(d.fromBank).toBe(114);
    expect(d.total).toBe(1264);
  });
});

describe("resolveDay", () => {
  it("clears debt and banks 25% surplus on success", () => {
    const r = resolveDay({
      date: "2026-10-14",
      baseGoal: 8000,
      debtIn: 0,
      steps: 10000,
      bankedIn: 0,
      enemyHp: 4000,
      weaponId: "walking-stick",
    });
    expect(r.defeated).toBe(true);
    expect(r.debtOut).toBe(0);
    expect(r.bankedOut).toBe(500); // 25% of 2000 surplus
    expect(r.log.outcome).toBe("victory");
  });

  it("shortfall debt is half of missed amount", () => {
    const r = resolveDay({
      date: "2026-10-14",
      baseGoal: 8000,
      debtIn: 0,
      steps: 5000,
      bankedIn: 0,
      enemyHp: 20000,
      weaponId: "walking-stick",
    });
    expect(r.debtOut).toBe(1500);
    expect(r.bankedOut).toBe(0);
    expect(r.enemyHpAfter).toBe(15000);
    expect(r.log.outcome).toBe("shortfall");
  });

  it("applies incoming debt to target and clears on meet", () => {
    const r = resolveDay({
      date: "2026-10-15",
      baseGoal: 8000,
      debtIn: 1500,
      steps: 9500,
      bankedIn: 0,
      enemyHp: 15000,
      weaponId: "walking-stick",
    });
    expect(r.log.target).toBe(9500);
    expect(r.debtOut).toBe(0);
    expect(r.log.outcome).toBe("ongoing");
  });

  it("uses banked damage before steps", () => {
    const r = resolveDay({
      date: "2026-10-16",
      baseGoal: 8000,
      debtIn: 0,
      steps: 3000,
      bankedIn: 2000,
      enemyHp: 4000,
      weaponId: "walking-stick",
    });
    expect(r.log.damageDealt).toBe(5000);
    expect(r.defeated).toBe(true);
    // Still shortfall vs goal → debt, bank wiped
    expect(r.debtOut).toBe(2500);
    expect(r.bankedOut).toBe(0);
  });
});
