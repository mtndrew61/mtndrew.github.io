import { describe, expect, it } from "vitest";
import { damagePerStep, previewFight, resolveFight } from "./combat";
import { createInitialState } from "./state";
import type { Spawn } from "./types";

function scoutSpawn(hp = 1200): Spawn {
  return {
    id: "t1",
    templateId: "goblin-scout",
    nodeId: "gate",
    hp,
    maxHp: hp,
    elite: false,
  };
}

describe("combat", () => {
  it("previews steps to kill", () => {
    const state = createInitialState(1);
    const prev = previewFight(state, scoutSpawn());
    expect(prev.stepsToKill).toBeGreaterThan(0);
    expect(prev.canAfford).toBe(true);
  });

  it("kills when enough steps", () => {
    const state = { ...createInitialState(2), stepsRemaining: 5000 };
    const r = resolveFight(state, scoutSpawn(), "fight");
    expect(r.kind).toBe("kill");
    expect(r.goldGained).toBeGreaterThan(0);
    expect(r.playerDamageTaken).toBe(0);
  });

  it("chips when short and allows flee with no loss", () => {
    const state = { ...createInitialState(3), stepsRemaining: 200 };
    const spawn = scoutSpawn(5000);
    const chip = resolveFight(state, spawn, "chip");
    expect(chip.kind).toBe("chip");
    expect(chip.spawnHpAfter).toBeLessThan(spawn.hp);

    const flee = resolveFight(state, spawn, "flee");
    expect(flee.kind).toBe("flee");
    expect(flee.goldGained).toBe(0);
    expect(flee.playerDamageTaken).toBe(0);
  });

  it("weapon increases damage per step", () => {
    const base = createInitialState(4);
    const armed = { ...base, weaponId: "iron-blade" as const };
    expect(damagePerStep(armed)).toBeGreaterThan(damagePerStep(base));
  });
});
