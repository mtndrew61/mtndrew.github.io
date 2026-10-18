import { describe, expect, it } from "vitest";
import { createInitialState, selectSpawn } from "./state";
import type { Spawn } from "./types";

describe("proximity combat", () => {
  it("blocks selecting a spawn on another node", () => {
    const far: Spawn = {
      id: "far-1",
      templateId: "goblin-scout",
      nodeId: "peak",
      hp: 1000,
      maxHp: 1000,
      elite: false,
    };
    const state = {
      ...createInitialState(7),
      currentNodeId: "gate",
      spawns: [far],
      selectedSpawnId: null as string | null,
    };
    const next = selectSpawn(state, "far-1");
    expect(next.selectedSpawnId).toBeNull();
    expect(next.journal[0].text).toMatch(/Too far/i);
  });

  it("allows selecting a spawn at the current node", () => {
    const near: Spawn = {
      id: "near-1",
      templateId: "goblin-scout",
      nodeId: "gate",
      hp: 1000,
      maxHp: 1000,
      elite: false,
    };
    const state = {
      ...createInitialState(8),
      currentNodeId: "gate",
      spawns: [near],
      selectedSpawnId: null as string | null,
    };
    const next = selectSpawn(state, "near-1");
    expect(next.selectedSpawnId).toBe("near-1");
  });
});
