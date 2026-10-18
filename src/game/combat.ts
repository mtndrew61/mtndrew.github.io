import { ARMORS, ENEMIES, MERCS, WEAPONS } from "./content";
import { mulberry32 } from "./rng";
import { totalsFromSkills } from "./skills";
import type { GameState, Spawn } from "./types";

/** Stamina (steps) spent per strike — weapon weight nudges cost. */
export const BASE_STRIKE_COST = 480;
/** Stamina spent to raise a shield for the enemy’s swing. */
export const BASE_BLOCK_COST = 220;
/** Baseline spite before gear / skills. */
export const BASE_STRIKE_DAMAGE = 260;
/** Block multiplies remaining incoming after armor (lower = stronger block). */
export const BLOCK_FACTOR = 0.32;

export type BattleAction = "strike" | "block" | "flee";

export interface FightPreview {
  spawn: Spawn;
  enemyName: string;
  elite: boolean;
  goldHint: string;
  strikeCost: number;
  blockCost: number;
  strikeDamage: number;
  strikesToKill: number;
  canStrike: boolean;
  canBlock: boolean;
  openHit: number;
  blockedHit: number;
  mercName: string | null;
  mercNote: string | null;
}

export interface FightResult {
  kind: "kill" | "ongoing" | "flee";
  action: BattleAction;
  stepsSpent: number;
  damageDealt: number;
  playerDamageTaken: number;
  goldGained: number;
  hpAfter: number;
  spawnHpAfter: number;
  crit: boolean;
  blocked: boolean;
  journal: string;
}

export function getSpawn(state: GameState, spawnId: string): Spawn | undefined {
  return state.spawns.find((s) => s.id === spawnId);
}

export function strikeStaminaCost(state: GameState): number {
  const weapon = WEAPONS[state.weaponId];
  // Heavier / stronger blades cost a bit more stamina
  let cost = Math.round(BASE_STRIKE_COST * (0.85 + weapon.damageMult * 0.2));
  if (state.merc) {
    const red = MERCS[state.merc.id]?.stepReduction ?? 0;
    cost = Math.round(cost * (1 - red));
  }
  return Math.max(200, cost);
}

export function blockStaminaCost(state: GameState): number {
  let cost = BASE_BLOCK_COST;
  if (state.merc) {
    const red = (MERCS[state.merc.id]?.stepReduction ?? 0) * 0.5;
    cost = Math.round(cost * (1 - red));
  }
  return Math.max(100, cost);
}

/** Damage dealt by one Strike from gear + skills (+ crit rolled separately). */
export function strikeDamage(state: GameState, crit = false): number {
  const weapon = WEAPONS[state.weaponId];
  const skills = totalsFromSkills(state);
  let dmg = BASE_STRIKE_DAMAGE * weapon.damageMult * (1 + skills.damageMult);
  dmg += skills.burstFlat * 0.35;
  if (state.merc) {
    dmg *= 1 + (MERCS[state.merc.id]?.stepReduction ?? 0) * 0.5;
  }
  if (crit) dmg *= 1.35;
  return Math.max(1, Math.round(dmg));
}

function mitigation(state: GameState): number {
  const armor = ARMORS[state.armorId];
  const skills = totalsFromSkills(state);
  return Math.min(0.75, armor.mitigation + skills.mitigation);
}

export function openHitDamage(state: GameState, touchDamage: number): number {
  return Math.max(1, Math.round(touchDamage * (1 - mitigation(state))));
}

export function blockedHitDamage(state: GameState, touchDamage: number): number {
  return Math.max(
    1,
    Math.round(touchDamage * (1 - mitigation(state)) * BLOCK_FACTOR),
  );
}

export function previewFight(state: GameState, spawn: Spawn): FightPreview {
  const tpl = ENEMIES[spawn.templateId];
  const strikeCost = strikeStaminaCost(state);
  const blockCost = blockStaminaCost(state);
  const dmg = strikeDamage(state, false);
  const merc = state.merc ? MERCS[state.merc.id] : null;
  return {
    spawn,
    enemyName: tpl.name,
    elite: spawn.elite,
    goldHint: `${tpl.goldMin}–${tpl.goldMax}`,
    strikeCost,
    blockCost,
    strikeDamage: dmg,
    strikesToKill: Math.max(1, Math.ceil(spawn.hp / dmg)),
    canStrike: state.stepsRemaining >= strikeCost,
    canBlock: state.stepsRemaining >= blockCost,
    openHit: openHitDamage(state, tpl.touchDamage),
    blockedHit: blockedHitDamage(state, tpl.touchDamage),
    mercName: merc?.name ?? null,
    mercNote: merc
      ? `Ally eases stamina (−${Math.round(merc.stepReduction * 100)}%)`
      : null,
  };
}

export function resolveFight(
  state: GameState,
  spawn: Spawn,
  action: BattleAction,
): FightResult {
  const tpl = ENEMIES[spawn.templateId];
  const skills = totalsFromSkills(state);
  const rng = mulberry32(state.seed + spawn.hp + state.stepsRemaining + action.length);

  if (action === "flee") {
    return {
      kind: "flee",
      action,
      stepsSpent: 0,
      damageDealt: 0,
      playerDamageTaken: 0,
      goldGained: 0,
      hpAfter: state.hp,
      spawnHpAfter: spawn.hp,
      crit: false,
      blocked: false,
      journal: `You break off from the ${tpl.name}.`,
    };
  }

  if (action === "block") {
    const cost = blockStaminaCost(state);
    if (state.stepsRemaining < cost) {
      return {
        kind: "ongoing",
        action,
        stepsSpent: 0,
        damageDealt: 0,
        playerDamageTaken: 0,
        goldGained: 0,
        hpAfter: state.hp,
        spawnHpAfter: spawn.hp,
        crit: false,
        blocked: false,
        journal: "Not enough stamina to raise a shield.",
      };
    }
    const taken = blockedHitDamage(state, tpl.touchDamage);
    return {
      kind: "ongoing",
      action,
      stepsSpent: cost,
      damageDealt: 0,
      playerDamageTaken: taken,
      goldGained: 0,
      hpAfter: Math.max(0, state.hp - taken),
      spawnHpAfter: spawn.hp,
      crit: false,
      blocked: true,
      journal: `Shield up (−${cost} stam). ${tpl.name} connects for ${taken} (blocked).`,
    };
  }

  // Strike
  const cost = strikeStaminaCost(state);
  if (state.stepsRemaining < cost) {
    return {
      kind: "ongoing",
      action,
      stepsSpent: 0,
      damageDealt: 0,
      playerDamageTaken: 0,
      goldGained: 0,
      hpAfter: state.hp,
      spawnHpAfter: spawn.hp,
      crit: false,
      blocked: false,
      journal: "Not enough stamina to strike.",
    };
  }

  const crit = rng() < skills.critChance;
  const damageDealt = strikeDamage(state, crit);
  const spawnHpAfter = Math.max(0, spawn.hp - damageDealt);
  const killed = spawnHpAfter === 0;

  let playerDamageTaken = 0;
  if (!killed) {
    playerDamageTaken = openHitDamage(state, tpl.touchDamage);
  }

  let goldGained = 0;
  if (killed) {
    const base = Math.floor(
      tpl.goldMin + rng() * (tpl.goldMax - tpl.goldMin + 1),
    );
    goldGained = Math.round(base * (1 + skills.goldFind));
  }

  const journal = killed
    ? `Final blow${crit ? " (crit!)" : ""} — ${tpl.name} down. +${goldGained}g.`
    : `Strike${crit ? " (crit!)" : ""} for ${damageDealt} (−${cost} stam). ${tpl.name} hits back for ${playerDamageTaken}.`;

  return {
    kind: killed ? "kill" : "ongoing",
    action,
    stepsSpent: cost,
    damageDealt,
    playerDamageTaken,
    goldGained,
    hpAfter: Math.max(0, state.hp - playerDamageTaken),
    spawnHpAfter,
    crit,
    blocked: false,
    journal,
  };
}
