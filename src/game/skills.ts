import { SKILLS } from "./content";
import type { GameState, SkillTree } from "./types";

export function skillRank(state: GameState, skillId: string): number {
  return state.skills[skillId] ?? 0;
}

export function totalsFromSkills(state: GameState): {
  damageMult: number;
  mitigation: number;
  moveDiscount: number;
  goldFind: number;
  critChance: number;
  burstFlat: number;
} {
  let damageMult = 0;
  let mitigation = 0;
  let moveDiscount = 0;
  let goldFind = 0;
  let critChance = 0;
  let burstFlat = 0;

  for (const def of SKILLS) {
    const rank = skillRank(state, def.id);
    if (!rank) continue;
    switch (def.effect.kind) {
      case "damageMult":
        damageMult += def.effect.perRank * rank;
        break;
      case "mitigation":
        mitigation += def.effect.perRank * rank;
        break;
      case "moveDiscount":
        moveDiscount += def.effect.perRank * rank;
        break;
      case "goldFind":
        goldFind += def.effect.perRank * rank;
        break;
      case "critChance":
        critChance += def.effect.perRank * rank;
        break;
      case "burstFlat":
        burstFlat += def.effect.perRank * rank;
        break;
    }
  }

  return {
    damageMult,
    mitigation,
    moveDiscount,
    goldFind,
    critChance,
    burstFlat,
  };
}

export function skillsByTree(tree: SkillTree) {
  return SKILLS.filter((s) => s.tree === tree);
}

export function spentSkillPoints(state: GameState): number {
  return Object.values(state.skills).reduce((a, b) => a + b, 0);
}
