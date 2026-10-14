import { ARMORS, ENEMIES, MERCS, WEAPONS } from "./content";
import { mulberry32 } from "./rng";
import { totalsFromSkills } from "./skills";
import type { GameState, Spawn } from "./types";

export interface FightPreview {
  spawn: Spawn;
  enemyName: string;
  stepsToKill: number;
  canAfford: boolean;
  expectedPlayerDamageIfChip: number;
  goldHint: string;
  elite: boolean;
}

export interface FightResult {
  kind: "kill" | "chip" | "flee";
  stepsSpent: number;
  damageDealt: number;
  playerDamageTaken: number;
  goldGained: number;
  hpAfter: number;
  spawnHpAfter: number;
  crit: boolean;
  journal: string;
}

export function getSpawn(state: GameState, spawnId: string): Spawn | undefined {
  return state.spawns.find((s) => s.id === spawnId);
}

export function previewFight(state: GameState, spawn: Spawn): FightPreview {
  const tpl = ENEMIES[spawn.templateId];
  const stepsToKill = Math.max(1, Math.ceil(spawn.hp / damagePerStep(state)));
  const canAfford = state.stepsRemaining >= stepsToKill;
  const touch = incomingTouch(state, tpl.touchDamage);
  return {
    spawn,
    enemyName: tpl.name,
    stepsToKill,
    canAfford,
    expectedPlayerDamageIfChip: touch,
    goldHint: `${tpl.goldMin}–${tpl.goldMax}`,
    elite: spawn.elite,
  };
}

export function damagePerStep(state: GameState): number {
  const weapon = WEAPONS[state.weaponId];
  const skills = totalsFromSkills(state);
  let merc = 0;
  if (state.merc) {
    merc = MERCS[state.merc.id]?.stepReduction ?? 0;
  }
  // Merc reduces effective HP cost → equivalent to more damage/step
  const mercMult = 1 / Math.max(0.5, 1 - merc);
  return Math.max(0.5, weapon.damageMult * (1 + skills.damageMult) * mercMult);
}

function incomingTouch(state: GameState, base: number): number {
  const armor = ARMORS[state.armorId];
  const skills = totalsFromSkills(state);
  const mit = Math.min(0.75, armor.mitigation + skills.mitigation);
  return Math.max(1, Math.round(base * (1 - mit)));
}

export function resolveFight(
  state: GameState,
  spawn: Spawn,
  mode: "fight" | "chip" | "flee",
): FightResult {
  if (mode === "flee") {
    return {
      kind: "flee",
      stepsSpent: 0,
      damageDealt: 0,
      playerDamageTaken: 0,
      goldGained: 0,
      hpAfter: state.hp,
      spawnHpAfter: spawn.hp,
      crit: false,
      journal: `You slip away from the ${ENEMIES[spawn.templateId].name}. No shame in open roads.`,
    };
  }

  const tpl = ENEMIES[spawn.templateId];
  const dps = damagePerStep(state);
  const skills = totalsFromSkills(state);
  const rng = mulberry32(state.seed + spawn.hp + state.stepsRemaining);
  const crit = rng() < skills.critChance;
  const burst = skills.burstFlat + (crit ? skills.burstFlat * 0.5 : 0);

  const stepsToKill = Math.max(1, Math.ceil(Math.max(0, spawn.hp - burst) / dps));
  const spend =
    mode === "fight"
      ? Math.min(state.stepsRemaining, stepsToKill)
      : Math.min(state.stepsRemaining, stepsToKill);

  // Always spend what we can; "fight" vs "chip" same spend rule when short
  let damageDealt = Math.floor(spend * dps + burst);
  if (crit) damageDealt = Math.floor(damageDealt * 1.25);

  const spawnHpAfter = Math.max(0, spawn.hp - damageDealt);
  const killed = spawnHpAfter === 0;

  let playerDamageTaken = 0;
  if (!killed) {
    playerDamageTaken = incomingTouch(state, tpl.touchDamage);
  } else if (spend < stepsToKill) {
    // shouldn't happen if killed
    playerDamageTaken = 0;
  }

  // If you fully fund the kill, no touch damage
  if (killed && state.stepsRemaining >= stepsToKill) {
    playerDamageTaken = 0;
  }

  let goldGained = 0;
  if (killed) {
    const base = Math.floor(
      tpl.goldMin + rng() * (tpl.goldMax - tpl.goldMin + 1),
    );
    goldGained = Math.round(base * (1 + skills.goldFind));
  }

  const hpAfter = Math.max(0, state.hp - playerDamageTaken);
  const journal = killed
    ? `Fell the ${tpl.name}${crit ? " (crit!)" : ""} for ${goldGained} gold.`
    : `Chipped the ${tpl.name} for ${damageDealt} spite. ${spawnHpAfter} remains. Took ${playerDamageTaken} bruises.`;

  return {
    kind: killed ? "kill" : "chip",
    stepsSpent: spend,
    damageDealt,
    playerDamageTaken,
    goldGained,
    hpAfter,
    spawnHpAfter,
    crit,
    journal,
  };
}
