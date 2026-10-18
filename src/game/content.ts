import type {
  Armor,
  EnemyTemplate,
  MapEdge,
  MapNode,
  Merc,
  SkillDef,
  Weapon,
} from "./types";

export const STORAGE_KEY = "step-quest-demo-v2";

export const PLAYER_MAX_HP = 100;
export const DEFAULT_STEPS = 8000;
export const MERC_FIGHTS = 3;
export const RESPEC_GOLD = 25;

export const NODES: MapNode[] = [
  {
    id: "gate",
    name: "Whisperwood Gate",
    kind: "path",
    biome: "forest",
    x: 120,
    y: 420,
    blurb: "The demo begins under leaning oaks.",
  },
  {
    id: "fork-ash",
    name: "Ashfork",
    kind: "fork",
    biome: "forest",
    x: 280,
    y: 360,
    blurb: "Two roads: vale meadows or the wet hollows.",
  },
  {
    id: "ambush-roots",
    name: "Rootshadow",
    kind: "ambush",
    biome: "forest",
    x: 260,
    y: 250,
    blurb: "The canopy closes. Something listens.",
  },
  {
    id: "vale",
    name: "Hollowmere Rise",
    kind: "landmark",
    biome: "valley",
    x: 420,
    y: 300,
    blurb: "Wind over pale grass.",
  },
  {
    id: "mire-edge",
    name: "Blackfen Margin",
    kind: "path",
    biome: "marsh",
    x: 400,
    y: 430,
    blurb: "Soft ground. Bring dry socks.",
  },
  {
    id: "river-ford",
    name: "Silverrun Ford",
    kind: "path",
    biome: "river",
    x: 560,
    y: 340,
    blurb: "Cold water, clear stones.",
  },
  {
    id: "town-briar",
    name: "Briarhaven",
    kind: "town",
    biome: "town",
    x: 700,
    y: 280,
    blurb: "Checkpoint town. Hire steel, rethink skills.",
  },
  {
    id: "fork-ridge",
    name: "Ridge Choice",
    kind: "fork",
    biome: "mountain",
    x: 860,
    y: 240,
    blurb: "High road or the cinder cut.",
  },
  {
    id: "ambush-pass",
    name: "Toothpass",
    kind: "ambush",
    biome: "mountain",
    x: 900,
    y: 160,
    blurb: "Loose shale. Bad place to linger.",
  },
  {
    id: "peak",
    name: "Ironspine Overlook",
    kind: "landmark",
    biome: "mountain",
    x: 1040,
    y: 200,
    blurb: "Demo’s far marker. Elites prowl here.",
  },
  {
    id: "chest-glade",
    name: "Mossvault Glade",
    kind: "landmark",
    biome: "forest",
    x: 480,
    y: 200,
    blurb: "A stone box half-swallowed by ferns.",
  },
];

export const EDGES: MapEdge[] = [
  { from: "gate", to: "fork-ash", cost: 600 },
  { from: "fork-ash", to: "ambush-roots", cost: 700 },
  { from: "fork-ash", to: "vale", cost: 800 },
  { from: "fork-ash", to: "mire-edge", cost: 750 },
  { from: "ambush-roots", to: "chest-glade", cost: 650 },
  { from: "vale", to: "chest-glade", cost: 500 },
  { from: "vale", to: "river-ford", cost: 700 },
  { from: "mire-edge", to: "river-ford", cost: 900 },
  { from: "river-ford", to: "town-briar", cost: 800 },
  { from: "chest-glade", to: "town-briar", cost: 1100 },
  { from: "town-briar", to: "fork-ridge", cost: 900 },
  { from: "fork-ridge", to: "ambush-pass", cost: 850 },
  { from: "fork-ridge", to: "peak", cost: 1200 },
  { from: "ambush-pass", to: "peak", cost: 700 },
];

export const ENEMIES: Record<string, EnemyTemplate> = {
  "goblin-scout": {
    id: "goblin-scout",
    name: "Goblin Scout",
    tier: 1,
    baseHp: 1200,
    touchDamage: 8,
    goldMin: 8,
    goldMax: 16,
    biomes: ["forest", "valley", "marsh"],
    blurb: "Quick feet, yellow grin.",
  },
  "wild-folk": {
    id: "wild-folk",
    name: "Wild Folk Raider",
    tier: 2,
    baseHp: 2200,
    touchDamage: 12,
    goldMin: 14,
    goldMax: 24,
    biomes: ["valley", "river", "forest"],
    blurb: "Painted cheeks, heavy stick.",
  },
  "fen-wisp": {
    id: "fen-wisp",
    name: "Fen Wisp",
    tier: 2,
    baseHp: 1800,
    touchDamage: 14,
    goldMin: 12,
    goldMax: 22,
    biomes: ["marsh", "river"],
    blurb: "Cold light over black water.",
  },
  "orc-raider": {
    id: "orc-raider",
    name: "Orc Raider",
    tier: 3,
    baseHp: 3500,
    touchDamage: 18,
    goldMin: 22,
    goldMax: 36,
    biomes: ["mountain"],
    blurb: "Iron-spine patrol.",
  },
  "cave-troll": {
    id: "cave-troll",
    name: "Ridge Troll",
    tier: 4,
    baseHp: 9000,
    touchDamage: 28,
    goldMin: 50,
    goldMax: 80,
    biomes: ["mountain"],
    elite: true,
    blurb: "Multi-day spite. Chip it down.",
  },
};

export const WEAPONS: Record<string, Weapon> = {
  "walking-stick": {
    id: "walking-stick",
    name: "Walking Stick",
    damageMult: 1,
    blurb: "Honest oak.",
    goldValue: 0,
  },
  "iron-blade": {
    id: "iron-blade",
    name: "Iron Blade",
    damageMult: 1.2,
    blurb: "Steps bite harder.",
    goldValue: 40,
  },
  "thorn-bow": {
    id: "thorn-bow",
    name: "Thorn Bow",
    damageMult: 1.15,
    blurb: "Archer’s friend.",
    goldValue: 35,
  },
  "ash-wand": {
    id: "ash-wand",
    name: "Ash Wand",
    damageMult: 1.15,
    blurb: "A little spite in the grain.",
    goldValue: 35,
  },
  "rune-spear": {
    id: "rune-spear",
    name: "Rune Spear",
    damageMult: 1.35,
    blurb: "End-of-demo steel.",
    goldValue: 70,
  },
};

export const ARMORS: Record<string, Armor> = {
  "travel-cloak": {
    id: "travel-cloak",
    name: "Travel Cloak",
    mitigation: 0,
    blurb: "Keeps the drizzle off.",
    goldValue: 0,
  },
  "leather-jerkin": {
    id: "leather-jerkin",
    name: "Leather Jerkin",
    mitigation: 0.15,
    blurb: "Turns glances into bruises.",
    goldValue: 30,
  },
  "iron-mail": {
    id: "iron-mail",
    name: "Iron Mail",
    mitigation: 0.28,
    blurb: "Heavy kindness.",
    goldValue: 55,
  },
  "ward-weave": {
    id: "ward-weave",
    name: "Ward Weave",
    mitigation: 0.22,
    blurb: "Soft cloth, stubborn wards.",
    goldValue: 50,
  },
};

export const MERCS: Record<string, Merc> = {
  "briar-scout": {
    id: "briar-scout",
    name: "Briar Scout",
    stepReduction: 0.18,
    hireGold: 40,
    fights: MERC_FIGHTS,
    blurb: "Cuts 18% off fight step cost for 3 fights.",
  },
  "stone-shield": {
    id: "stone-shield",
    name: "Stone Shield",
    stepReduction: 0.12,
    hireGold: 35,
    fights: MERC_FIGHTS,
    blurb: "Sturdier ally; softer step discount.",
  },
};

export const SKILLS: SkillDef[] = [
  {
    id: "melee-edge",
    tree: "melee",
    name: "Edge Work",
    maxRank: 3,
    blurb: "+8% damage / rank",
    effect: { kind: "damageMult", perRank: 0.08 },
  },
  {
    id: "melee-guard",
    tree: "melee",
    name: "Guard",
    maxRank: 3,
    blurb: "+6% mitigation / rank",
    effect: { kind: "mitigation", perRank: 0.06 },
  },
  {
    id: "archer-mark",
    tree: "archer",
    name: "Mark",
    maxRank: 3,
    blurb: "+7% damage / rank",
    effect: { kind: "damageMult", perRank: 0.07 },
  },
  {
    id: "archer-burst",
    tree: "archer",
    name: "Volley",
    maxRank: 3,
    blurb: "+120 flat burst / rank",
    effect: { kind: "burstFlat", perRank: 120 },
  },
  {
    id: "rogue-stride",
    tree: "rogue",
    name: "Soft Stride",
    maxRank: 3,
    blurb: "−8% path costs / rank",
    effect: { kind: "moveDiscount", perRank: 0.08 },
  },
  {
    id: "rogue-luck",
    tree: "rogue",
    name: "Cutpurse Luck",
    maxRank: 3,
    blurb: "+10% gold find / rank",
    effect: { kind: "goldFind", perRank: 0.1 },
  },
  {
    id: "mage-spark",
    tree: "mage",
    name: "Spark",
    maxRank: 3,
    blurb: "+150 flat burst / rank",
    effect: { kind: "burstFlat", perRank: 150 },
  },
  {
    id: "mage-ward",
    tree: "mage",
    name: "Ward",
    maxRank: 3,
    blurb: "+5% mitigation / rank",
    effect: { kind: "mitigation", perRank: 0.05 },
  },
  {
    id: "mage-crit",
    tree: "mage",
    name: "Spite Crit",
    maxRank: 3,
    blurb: "+6% crit chance / rank",
    effect: { kind: "critChance", perRank: 0.06 },
  },
];

export const BIOME_FILL: Record<string, string> = {
  forest: "#3d6b4f",
  valley: "#6a8458",
  river: "#3d6e7a",
  mountain: "#5a6570",
  marsh: "#3a5240",
  town: "#8a6a3a",
};

export type PathTag = "danger" | "loot" | "town" | "scenic" | "elite";

/** Rumors shown at forks / when inspecting an outgoing path. */
export interface PathRumor {
  from: string;
  to: string;
  title: string;
  rumor: string;
  tags: PathTag[];
}

export const PATH_RUMORS: PathRumor[] = [
  {
    from: "fork-ash",
    to: "ambush-roots",
    title: "Rootshadow cut",
    rumor: "Quiet trail under black oaks. Scouts say something waits in the roots.",
    tags: ["danger", "loot"],
  },
  {
    from: "fork-ash",
    to: "vale",
    title: "Hollowmere meadows",
    rumor: "Open grass and clean wind. Safer footing, fewer purses.",
    tags: ["scenic"],
  },
  {
    from: "fork-ash",
    to: "mire-edge",
    title: "Blackfen margin",
    rumor: "Soft ground and fen-lights. Harder walking, stranger gold.",
    tags: ["danger"],
  },
  {
    from: "fork-ridge",
    to: "ambush-pass",
    title: "Toothpass shale",
    rumor: "Short climb, bad company. Ambush likely — flee if you’re thin on steps.",
    tags: ["danger", "elite"],
  },
  {
    from: "fork-ridge",
    to: "peak",
    title: "High overlook road",
    rumor: "Longer, windier, ends at the demo’s far marker. Elites remember bruises.",
    tags: ["scenic", "elite"],
  },
  {
    from: "river-ford",
    to: "town-briar",
    title: "Road to Briarhaven",
    rumor: "Warm hearths, hired steel, skill trainers. Checkpoint waits.",
    tags: ["town"],
  },
  {
    from: "chest-glade",
    to: "town-briar",
    title: "Fern road to town",
    rumor: "Longer haul after the glade — but Briarhaven’s gates open the same.",
    tags: ["town", "scenic"],
  },
];

export const BIOME_ATMO: Record<
  string,
  { sky: [string, string]; ground: [string, string]; label: string }
> = {
  forest: {
    sky: ["#9ebba0", "#5f8a68"],
    ground: ["#6f9174", "#2a4533"],
    label: "Whisperwood canopy",
  },
  valley: {
    sky: ["#c5d6b0", "#7a9a6a"],
    ground: ["#8aa86e", "#4a6a48"],
    label: "Hollowmere light",
  },
  river: {
    sky: ["#a8c4c8", "#5a8a92"],
    ground: ["#6a9aa0", "#2f555c"],
    label: "Silverrun mist",
  },
  marsh: {
    sky: ["#8a9a88", "#4a5a48"],
    ground: ["#4a5c4c", "#243028"],
    label: "Blackfen gloom",
  },
  mountain: {
    sky: ["#b0b8c0", "#6a7480"],
    ground: ["#7a8490", "#3a4048"],
    label: "Ironspine wind",
  },
  town: {
    sky: ["#d4c4a0", "#9a7a48"],
    ground: ["#a88858", "#5a4030"],
    label: "Briarhaven hearth-glow",
  },
};
