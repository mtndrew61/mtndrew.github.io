export type BiomeId =
  | "forest"
  | "valley"
  | "river"
  | "mountain"
  | "marsh"
  | "town";

export type NodeKind = "path" | "fork" | "town" | "ambush" | "landmark";

export type EnemyTier = 1 | 2 | 3 | 4;

export type SkillTree = "melee" | "archer" | "rogue" | "mage";

export type WeaponId =
  | "walking-stick"
  | "iron-blade"
  | "thorn-bow"
  | "ash-wand"
  | "rune-spear";

export type ArmorId =
  | "travel-cloak"
  | "leather-jerkin"
  | "iron-mail"
  | "ward-weave";

export type MercId = "briar-scout" | "stone-shield";

export interface MapNode {
  id: string;
  name: string;
  kind: NodeKind;
  biome: BiomeId;
  /** 3/4 map coordinates in viewBox space */
  x: number;
  y: number;
  /** Optional flavor */
  blurb?: string;
}

export interface MapEdge {
  from: string;
  to: string;
  /** Step cost to traverse */
  cost: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  tier: EnemyTier;
  baseHp: number;
  /** Damage to player if fight is not a clean one-shot */
  touchDamage: number;
  goldMin: number;
  goldMax: number;
  biomes: BiomeId[];
  elite?: boolean;
  blurb: string;
}

export interface Spawn {
  id: string;
  templateId: string;
  nodeId: string;
  hp: number;
  maxHp: number;
  elite: boolean;
}

export interface Weapon {
  id: WeaponId;
  name: string;
  damageMult: number;
  blurb: string;
  goldValue: number;
}

export interface Armor {
  id: ArmorId;
  name: string;
  /** Reduces incoming touch damage */
  mitigation: number;
  blurb: string;
  goldValue: number;
}

export interface Merc {
  id: MercId;
  name: string;
  /** Flat fraction of fight step cost removed */
  stepReduction: number;
  hireGold: number;
  fights: number;
  blurb: string;
}

export interface SkillDef {
  id: string;
  tree: SkillTree;
  name: string;
  maxRank: number;
  /** Short effect text */
  blurb: string;
  /** Per-rank effects interpreted in combat/move */
  effect: SkillEffect;
}

export type SkillEffect =
  | { kind: "damageMult"; perRank: number }
  | { kind: "mitigation"; perRank: number }
  | { kind: "moveDiscount"; perRank: number }
  | { kind: "goldFind"; perRank: number }
  | { kind: "critChance"; perRank: number }
  | { kind: "burstFlat"; perRank: number };

export interface HuntQuest {
  title: string;
  targetKills: number;
  progress: number;
  rewardGold: number;
  completed: boolean;
  claimed: boolean;
}

export interface Chest {
  id: string;
  nodeId: string;
  opened: boolean;
  gold: number;
  weaponId?: WeaponId;
  armorId?: ArmorId;
}

export interface ActiveMerc {
  id: MercId;
  fightsLeft: number;
}

export interface DayLogLine {
  text: string;
  at: string;
}

export interface GameState {
  day: string;
  stepsRemaining: number;
  stepsGranted: number;
  gold: number;
  hp: number;
  maxHp: number;
  currentNodeId: string;
  checkpointNodeId: string;
  weaponId: WeaponId;
  armorId: ArmorId;
  unlockedWeapons: WeaponId[];
  unlockedArmor: ArmorId[];
  skillPoints: number;
  /** Total skill points ever earned (for Traveler Rank). */
  skillPointsEarned: number;
  skills: Record<string, number>;
  merc: ActiveMerc | null;
  spawns: Spawn[];
  chests: Chest[];
  hunt: HuntQuest;
  journal: DayLogLine[];
  /** Forced encounter spawn id (ambush) */
  pendingAmbushSpawnId: string | null;
  /** Selected spawn for combat UI */
  selectedSpawnId: string | null;
  demoComplete: boolean;
  seed: number;
}
