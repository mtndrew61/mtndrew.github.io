import type { Biome, Enemy, Weapon } from "./types";

export const WEAPONS: Record<string, Weapon> = {
  "walking-stick": {
    id: "walking-stick",
    name: "Walking Stick",
    damageMult: 1,
    blurb: "Honest oak. One step, one bruise on the foe.",
  },
  "iron-blade": {
    id: "iron-blade",
    name: "Iron Blade",
    damageMult: 1.15,
    blurb: "A road-worn edge. Steps bite 15% harder.",
  },
  "rune-spear": {
    id: "rune-spear",
    name: "Rune Spear",
    damageMult: 1.3,
    blurb: "Etched for long roads. Steps bite 30% harder.",
  },
};

export const ENEMIES: Record<string, Enemy> = {
  "goblin-scout": {
    id: "goblin-scout",
    name: "Goblin Scout",
    tier: 1,
    baseHp: 4000,
    biome: "forest",
    blurb:
      "Yellow eyes in the Whisperwood. It bars the trail until your feet prove fiercer than its grin.",
  },
};

export const BIOMES: Biome[] = [
  { id: "forest", name: "Whisperwood", start: 0, end: 0.18, fill: "#2f5a3c" },
  { id: "valley", name: "Hollowmere Vale", start: 0.18, end: 0.3, fill: "#4a7a52" },
  { id: "river", name: "Silverrun Crossing", start: 0.3, end: 0.4, fill: "#3d6e7a" },
  { id: "mountain", name: "Ironspine Peaks", start: 0.4, end: 0.55, fill: "#5a6570" },
  { id: "marsh", name: "Blackfen Mire", start: 0.55, end: 0.68, fill: "#3a5240" },
  { id: "cave", name: "Deepdelve Hollows", start: 0.68, end: 0.78, fill: "#2a3038" },
  { id: "volcano", name: "Ashcrown Crater", start: 0.78, end: 0.9, fill: "#6b3a32" },
  { id: "plains", name: "Eastmarch Roads", start: 0.9, end: 1, fill: "#6a8458" },
];

/** Adaptive goal clamps (steps). */
export const GOAL_MIN = 5000;
export const GOAL_MAX = 12000;
export const DEFAULT_BASE_GOAL = 8000;

/** Surplus after clearing debt: fraction banked toward next encounter. */
export const SURPLUS_BANK_RATE = 0.25;

/** Debt cannot exceed this multiple of the day's base goal. */
export const DEBT_CAP_MULT = 1;

export const STORAGE_KEY = "step-quest-phase0-v1";
