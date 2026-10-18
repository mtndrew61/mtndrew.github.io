import {
  ARMORS,
  DEFAULT_STEPS,
  ENEMIES,
  MERCS,
  NODES,
  PLAYER_MAX_HP,
  RESPEC_GOLD,
  SKILLS,
  STORAGE_KEY,
  WEAPONS,
} from "./content";
import { resolveFight } from "./combat";
import {
  edgeCostBetween,
  neighbors,
  nodeById,
  reachableFrom,
} from "./mapGraph";
import { mulberry32, pick, randInt } from "./rng";
import { skillRank, totalsFromSkills } from "./skills";
import type {
  Chest,
  GameState,
  HuntQuest,
  MercId,
  Spawn,
  WeaponId,
  ArmorId,
} from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function log(state: GameState, text: string): GameState {
  return {
    ...state,
    journal: [{ text, at: state.day }, ...state.journal].slice(0, 40),
  };
}

function makeHunt(): HuntQuest {
  return {
    title: "Daily Hunt — thin the wood",
    targetKills: 3,
    progress: 0,
    rewardGold: 40,
    completed: false,
    claimed: false,
  };
}

function makeChests(): Chest[] {
  return [
    {
      id: "chest-1",
      nodeId: "chest-glade",
      opened: false,
      gold: 28,
      weaponId: "thorn-bow",
      armorId: "leather-jerkin",
    },
    {
      id: "chest-2",
      nodeId: "peak",
      opened: false,
      gold: 55,
      weaponId: "rune-spear",
      armorId: "iron-mail",
    },
  ];
}

export function createInitialState(seed = Date.now() % 1_000_000): GameState {
  const base: GameState = {
    day: todayIso(),
    stepsRemaining: DEFAULT_STEPS,
    stepsGranted: DEFAULT_STEPS,
    gold: 55,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    currentNodeId: "gate",
    checkpointNodeId: "gate",
    weaponId: "walking-stick",
    armorId: "travel-cloak",
    unlockedWeapons: ["walking-stick"],
    unlockedArmor: ["travel-cloak"],
    skillPoints: 3,
    skills: {},
    merc: null,
    spawns: [],
    chests: makeChests(),
    hunt: makeHunt(),
    journal: [
      {
        text: "Whisperwood Gate. Steps are your reach — walk the forks, pick your fights.",
        at: todayIso(),
      },
    ],
    pendingAmbushSpawnId: null,
    selectedSpawnId: null,
    demoComplete: false,
    seed,
  };
  return { ...base, spawns: generateSpawns(base) };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.currentNodeId || !parsed.spawns) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGame(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}

export function generateSpawns(state: GameState): Spawn[] {
  const rng = mulberry32(state.seed + state.day.length * 17 + state.spawns.length);
  const spawns: Spawn[] = [];
  // Keep surviving elites
  for (const s of state.spawns) {
    if (s.elite && s.hp > 0) spawns.push(s);
  }

  const templates = Object.values(ENEMIES);
  for (const node of NODES) {
    if (node.kind === "town") continue;
    const alreadyElite = spawns.some((s) => s.nodeId === node.id && s.elite);
    const pool = templates.filter((t) => t.biomes.includes(node.biome));
    if (!pool.length) continue;

    const count =
      node.kind === "ambush" ? 1 : node.biome === "mountain" ? randInt(rng, 1, 2) : randInt(rng, 0, 2);

    for (let i = 0; i < count; i++) {
      if (spawns.filter((s) => s.nodeId === node.id).length >= 2) break;
      let tpl = pick(rng, pool);
      if (node.id === "peak" && !alreadyElite && i === 0) {
        tpl = ENEMIES["cave-troll"];
      }
      if (tpl.elite && alreadyElite) {
        const nonElite = pool.filter((t) => !t.elite);
        if (!nonElite.length) continue;
        tpl = pick(rng, nonElite);
      }
      const tierScale = 1 + (tpl.tier - 1) * 0.08;
      const hp = Math.round(tpl.baseHp * tierScale);
      spawns.push({
        id: `${tpl.id}-${node.id}-${randInt(rng, 1, 99999)}`,
        templateId: tpl.id,
        nodeId: node.id,
        hp,
        maxHp: hp,
        elite: !!tpl.elite,
      });
    }
  }
  return spawns;
}

export function setSteps(state: GameState, steps: number): GameState {
  const v = Math.max(0, Math.floor(steps));
  return { ...state, stepsRemaining: v, stepsGranted: Math.max(state.stepsGranted, v) };
}

export function getMoveDiscount(state: GameState): number {
  return totalsFromSkills(state).moveDiscount;
}

/** All nodes within step budget (for hinting). */
export function getReachable(state: GameState) {
  return reachableFrom(
    state.currentNodeId,
    state.stepsRemaining,
    getMoveDiscount(state),
  );
}

/**
 * Only immediate neighbors you can afford — scenic path clicks step node-to-node
 * so towns / ambushes are never skipped by multi-hop travel.
 */
export function getTravelOptions(state: GameState) {
  const discount = getMoveDiscount(state);
  const options = new Map<string, { cost: number }>();
  for (const n of neighbors(state.currentNodeId)) {
    const cost = edgeCostBetween(state.currentNodeId, n.id, discount);
    if (cost != null && cost <= state.stepsRemaining) {
      options.set(n.id, { cost });
    }
  }
  return options;
}

export function moveTo(state: GameState, nodeId: string): GameState {
  if (state.pendingAmbushSpawnId) return state;
  const options = getTravelOptions(state);
  const info = options.get(nodeId);
  if (!info) return state;

  let next: GameState = {
    ...state,
    currentNodeId: nodeId,
    stepsRemaining: state.stepsRemaining - info.cost,
    selectedSpawnId: null,
    seed: state.seed + 1,
  };

  const node = nodeById(nodeId);
  if (node.kind === "town") {
    next = {
      ...next,
      checkpointNodeId: nodeId,
      hp: Math.min(next.maxHp, next.hp + 20),
    };
    next = log(next, `Checkpoint: ${node.name}. Wounds ease. You can hire and respec.`);
  } else {
    next = log(next, `Travel to ${node.name} (−${info.cost} steps).`);
  }

  // Ambush chance
  if (node.kind === "ambush") {
    const here = next.spawns.filter((s) => s.nodeId === nodeId && s.hp > 0);
    if (here.length) {
      const spawn = here[0];
      next = {
        ...next,
        pendingAmbushSpawnId: spawn.id,
        selectedSpawnId: spawn.id,
      };
      next = log(
        next,
        `Ambush! A ${ENEMIES[spawn.templateId].name} bars the footing — Strike, Block, or Flee.`,
      );
    }
  }

  // Demo completion landmark
  if (nodeId === "peak" && next.hunt.completed) {
    next = { ...next, demoComplete: true };
    next = log(next, "Overlook reached. Short demo trail complete — the wilds go on later.");
  }

  return next;
}

/** Only engage spawns at your current node (Pokémon GO–style proximity). */
export function selectSpawn(state: GameState, spawnId: string | null): GameState {
  if (spawnId == null) {
    if (state.pendingAmbushSpawnId) return state;
    return { ...state, selectedSpawnId: null };
  }
  const spawn = state.spawns.find((s) => s.id === spawnId);
  if (!spawn || spawn.hp <= 0) return state;
  if (spawn.nodeId !== state.currentNodeId) {
    return log(
      state,
      `Too far — walk to ${nodeById(spawn.nodeId).name} before you can fight that foe.`,
    );
  }
  return { ...state, selectedSpawnId: spawnId };
}

export function applyFight(
  state: GameState,
  spawnId: string,
  mode: "strike" | "block" | "flee",
): GameState {
  const spawn = state.spawns.find((s) => s.id === spawnId);
  if (!spawn || spawn.hp <= 0) {
    return {
      ...state,
      pendingAmbushSpawnId: null,
      selectedSpawnId: null,
    };
  }

  const result = resolveFight(state, spawn, mode);
  let next: GameState = {
    ...state,
    stepsRemaining: Math.max(0, state.stepsRemaining - result.stepsSpent),
    hp: result.hpAfter,
    gold: state.gold + result.goldGained,
    seed: state.seed + 3,
    pendingAmbushSpawnId:
      state.pendingAmbushSpawnId === spawnId && mode === "flee"
        ? null
        : state.pendingAmbushSpawnId === spawnId && result.kind !== "flee"
          ? result.kind === "kill"
            ? null
            : state.pendingAmbushSpawnId
          : state.pendingAmbushSpawnId,
    // Stay in battle while the foe lives (strike/block loop)
    selectedSpawnId: result.kind === "kill" || mode === "flee" ? null : spawnId,
  };

  if (mode === "flee") {
    next = {
      ...next,
      pendingAmbushSpawnId: null,
      selectedSpawnId: null,
    };
    return log(next, result.journal);
  }

  // Update spawn list
  if (result.kind === "kill") {
    next = {
      ...next,
      spawns: next.spawns.filter((s) => s.id !== spawnId),
      pendingAmbushSpawnId:
        next.pendingAmbushSpawnId === spawnId ? null : next.pendingAmbushSpawnId,
    };
    if (next.merc) {
      const fightsLeft = next.merc.fightsLeft - 1;
      next = {
        ...next,
        merc: fightsLeft > 0 ? { ...next.merc, fightsLeft } : null,
      };
      if (fightsLeft <= 0) {
        next = log(next, "Your mercenary’s contract ends.");
      }
    }
    if (!next.hunt.completed) {
      const progress = next.hunt.progress + 1;
      const completed = progress >= next.hunt.targetKills;
      next = {
        ...next,
        hunt: { ...next.hunt, progress, completed },
      };
      if (completed) {
        next = log(
          next,
          `Hunt complete! Claim ${next.hunt.rewardGold} gold in Briarhaven (or any town panel).`,
        );
      }
    }
    // Random skill point on elite kill
    if (spawn.elite) {
      next = { ...next, skillPoints: next.skillPoints + 1 };
      next = log(next, "Elite fallen — +1 skill point.");
    }
  } else {
    next = {
      ...next,
      spawns: next.spawns.map((s) =>
        s.id === spawnId ? { ...s, hp: result.spawnHpAfter } : s,
      ),
    };
  }

  next = log(next, result.journal);

  // Death → checkpoint
  if (next.hp <= 0) {
    next = {
      ...next,
      hp: Math.round(next.maxHp * 0.6),
      currentNodeId: next.checkpointNodeId,
      pendingAmbushSpawnId: null,
      selectedSpawnId: null,
      stepsRemaining: Math.max(next.stepsRemaining, 500),
    };
    next = log(
      next,
      `You fall. Wake at ${nodeById(next.checkpointNodeId).name} — checkpoint grace.`,
    );
  }

  return next;
}

export function openChest(state: GameState, chestId: string): GameState {
  const chest = state.chests.find((c) => c.id === chestId);
  if (!chest || chest.opened) return state;
  if (state.currentNodeId !== chest.nodeId) return state;

  let next: GameState = {
    ...state,
    gold: state.gold + chest.gold,
    chests: state.chests.map((c) =>
      c.id === chestId ? { ...c, opened: true } : c,
    ),
  };

  if (chest.weaponId && !next.unlockedWeapons.includes(chest.weaponId)) {
    next = {
      ...next,
      unlockedWeapons: [...next.unlockedWeapons, chest.weaponId],
      weaponId: chest.weaponId,
    };
  }
  if (chest.armorId && !next.unlockedArmor.includes(chest.armorId)) {
    next = {
      ...next,
      unlockedArmor: [...next.unlockedArmor, chest.armorId],
      armorId: chest.armorId,
    };
  }

  const w = chest.weaponId ? WEAPONS[chest.weaponId].name : null;
  const a = chest.armorId ? ARMORS[chest.armorId].name : null;
  return log(
    next,
    `Chest: +${chest.gold} gold${w ? `, ${w}` : ""}${a ? `, ${a}` : ""}.`,
  );
}

export function hireMerc(state: GameState, mercId: MercId): GameState {
  const node = nodeById(state.currentNodeId);
  if (node.kind !== "town") return state;
  const merc = MERCS[mercId];
  if (!merc || state.gold < merc.hireGold) return state;
  return log(
    {
      ...state,
      gold: state.gold - merc.hireGold,
      merc: { id: mercId, fightsLeft: merc.fights },
    },
    `Hired ${merc.name} for ${merc.fights} fights (−${merc.hireGold}g).`,
  );
}

export function claimHunt(state: GameState): GameState {
  const node = nodeById(state.currentNodeId);
  if (node.kind !== "town") return state;
  if (!state.hunt.completed || state.hunt.claimed) return state;
  return log(
    {
      ...state,
      gold: state.gold + state.hunt.rewardGold,
      hunt: { ...state.hunt, claimed: true },
      skillPoints: state.skillPoints + 1,
    },
    `Hunt reward claimed: +${state.hunt.rewardGold}g and +1 skill point.`,
  );
}

export function buySkill(state: GameState, skillId: string): GameState {
  const def = SKILLS.find((s) => s.id === skillId);
  if (!def || state.skillPoints <= 0) return state;
  const rank = skillRank(state, skillId);
  if (rank >= def.maxRank) return state;
  return {
    ...state,
    skillPoints: state.skillPoints - 1,
    skills: { ...state.skills, [skillId]: rank + 1 },
  };
}

export function respecSkills(state: GameState): GameState {
  const node = nodeById(state.currentNodeId);
  if (node.kind !== "town") return state;
  if (state.gold < RESPEC_GOLD) return state;
  const spent = Object.values(state.skills).reduce((a, b) => a + b, 0);
  if (spent === 0) return state;
  return log(
    {
      ...state,
      gold: state.gold - RESPEC_GOLD,
      skillPoints: state.skillPoints + spent,
      skills: {},
    },
    `Respec at the trainer (−${RESPEC_GOLD}g). ${spent} points returned.`,
  );
}

export function equipWeapon(state: GameState, id: WeaponId): GameState {
  if (!state.unlockedWeapons.includes(id)) return state;
  return { ...state, weaponId: id };
}

export function equipArmor(state: GameState, id: ArmorId): GameState {
  if (!state.unlockedArmor.includes(id)) return state;
  return { ...state, armorId: id };
}

export function nextDay(state: GameState): GameState {
  const d = new Date(`${state.day}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const day = d.toISOString().slice(0, 10);
  let next: GameState = {
    ...state,
    day,
    stepsRemaining: DEFAULT_STEPS,
    stepsGranted: DEFAULT_STEPS,
    hp: Math.min(state.maxHp, state.hp + 15),
    hunt: state.hunt.claimed ? makeHunt() : state.hunt,
    pendingAmbushSpawnId: null,
    selectedSpawnId: null,
    seed: state.seed + 99,
  };
  // Persist elites, refresh trash
  const elites = state.spawns.filter((s) => s.elite && s.hp > 0);
  next = { ...next, spawns: elites };
  next = { ...next, spawns: generateSpawns(next) };
  return log(next, "A new day. Steps refilled. The map reshuffles lesser foes; elites remember.");
}

/** Debug / simulator: grant steps without advancing day */
export function grantSteps(state: GameState, amount: number): GameState {
  return {
    ...state,
    stepsRemaining: state.stepsRemaining + Math.max(0, amount),
    stepsGranted: state.stepsGranted + Math.max(0, amount),
  };
}

export function adjacentCost(
  state: GameState,
  toId: string,
): number | null {
  return edgeCostBetween(state.currentNodeId, toId, getMoveDiscount(state));
}
