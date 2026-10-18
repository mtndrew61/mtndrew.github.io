import { describe, expect, it } from "vitest";
import {
  blockStaminaCost,
  previewFight,
  resolveFight,
  strikeDamage,
  strikeStaminaCost,
} from "./combat";
import { createInitialState } from "./state";
import type { Spawn } from "./types";

function scout(hp = 1200): Spawn {
  return {
    id: "t1",
    templateId: "goblin-scout",
    nodeId: "gate",
    hp,
    maxHp: hp,
    elite: false,
  };
}

describe("turn combat", () => {
  it("strike damage scales with weapon", () => {
    const base = createInitialState(1);
    const armed = { ...base, weaponId: "iron-blade" as const };
    expect(strikeDamage(armed)).toBeGreaterThan(strikeDamage(base));
  });

  it("strike spends stamina and leaves fight ongoing if foe lives", () => {
    const state = { ...createInitialState(2), stepsRemaining: 8000 };
    const cost = strikeStaminaCost(state);
    const r = resolveFight(state, scout(5000), "strike");
    expect(r.kind).toBe("ongoing");
    expect(r.stepsSpent).toBe(cost);
    expect(r.damageDealt).toBeGreaterThan(0);
    expect(r.playerDamageTaken).toBeGreaterThan(0);
    expect(r.spawnHpAfter).toBeLessThan(5000);
  });

  it("enough strikes can kill without chip-all dump", () => {
    const state = { ...createInitialState(3), stepsRemaining: 8000 };
    const dmg = strikeDamage(state);
    const r = resolveFight(state, scout(dmg), "strike");
    expect(r.kind).toBe("kill");
    expect(r.playerDamageTaken).toBe(0);
    expect(r.goldGained).toBeGreaterThan(0);
  });

  it("block spends less stamina and reduces incoming", () => {
    const state = { ...createInitialState(4), stepsRemaining: 8000 };
    const open = resolveFight(state, scout(5000), "strike");
    const blocked = resolveFight(state, scout(5000), "block");
    expect(blocked.stepsSpent).toBe(blockStaminaCost(state));
    expect(blocked.stepsSpent).toBeLessThan(strikeStaminaCost(state));
    expect(blocked.damageDealt).toBe(0);
    expect(blocked.playerDamageTaken).toBeLessThan(open.playerDamageTaken);
    expect(blocked.blocked).toBe(true);
  });

  it("preview exposes strike economy", () => {
    const state = createInitialState(5);
    const prev = previewFight(state, scout());
    expect(prev.strikeCost).toBeGreaterThan(0);
    expect(prev.blockCost).toBeGreaterThan(0);
    expect(prev.strikeDamage).toBeGreaterThan(0);
    expect(prev.strikesToKill).toBeGreaterThan(0);
    expect(prev.canStrike).toBe(true);
  });

  it("flee spends nothing", () => {
    const r = resolveFight(createInitialState(6), scout(), "flee");
    expect(r.kind).toBe("flee");
    expect(r.stepsSpent).toBe(0);
    expect(r.playerDamageTaken).toBe(0);
  });
});
