export type EnemyId = "goblin-scout";

export type WeaponId = "walking-stick" | "iron-blade" | "rune-spear";

export type BiomeId =
  | "forest"
  | "mountain"
  | "river"
  | "valley"
  | "volcano"
  | "marsh"
  | "cave"
  | "plains";

export interface Weapon {
  id: WeaponId;
  name: string;
  /** Multiplier applied to steps dealt as damage. */
  damageMult: number;
  blurb: string;
}

export interface Enemy {
  id: EnemyId;
  name: string;
  tier: number;
  baseHp: number;
  biome: BiomeId;
  blurb: string;
}

export interface Biome {
  id: BiomeId;
  name: string;
  /** 0–1 start along the full route */
  start: number;
  /** 0–1 end along the full route */
  end: number;
  fill: string;
}

export interface DayLog {
  date: string;
  baseGoal: number;
  debtIn: number;
  target: number;
  steps: number;
  damageDealt: number;
  enemyHpBefore: number;
  enemyHpAfter: number;
  debtOut: number;
  bankedOut: number;
  outcome: "victory" | "ongoing" | "shortfall";
  lootGained: WeaponId | null;
}

export interface GameState {
  /** ISO date of the simulated "today" */
  today: string;
  /** Recent day step totals for adaptive goal (oldest → newest) */
  recentSteps: number[];
  debt: number;
  /** Banked surplus applied as free damage on the next resolve */
  bankedDamage: number;
  enemyId: EnemyId;
  enemyHp: number;
  enemyMaxHp: number;
  weaponId: WeaponId;
  unlockedWeapons: WeaponId[];
  /** 0–1 progress along the full campaign route when not in combat gate */
  routeProgress: number;
  /** Whether the current foe still blocks the road */
  inEncounter: boolean;
  chapterTitle: string;
  journal: string[];
  history: DayLog[];
  /** Prototype: allow scrubbing steps without HealthKit */
  simulatedSteps: number;
}
