extends Node
## Global constants and shared runtime helpers for DungeonScape.

enum Biome {
	STONE,
	FUNGAL,
	FLOODED,
	ASH,
	BONE,
}

const TILE_SIZE := 1.0
const CHUNK_SIZE := 16 ## tiles per chunk edge
const FLOOR_SIZE_TILES := 128 ## large explore floor
const CHUNK_LOAD_RADIUS := 2 ## Chebyshev radius to load
const CHUNK_UNLOAD_RADIUS := 3 ## hysteresis: unload farther out
const LOOT_DESPAWN_SECONDS := 180.0
const LOOT_WARN_SECONDS := 30.0

const BIOME_COLORS := {
	Biome.STONE: Color("6b6e76"),
	Biome.FUNGAL: Color("4a7a52"),
	Biome.FLOODED: Color("3d6a8a"),
	Biome.ASH: Color("7a5a48"),
	Biome.BONE: Color("c4b89a"),
}

const BIOME_NAMES := {
	Biome.STONE: "Stone Halls",
	Biome.FUNGAL: "Fungal Caves",
	Biome.FLOODED: "Flooded Cistern",
	Biome.ASH: "Ash Warrens",
	Biome.BONE: "Bone Gallery",
}

## OSRS-like skill roster (stubs until systems land).
const SKILL_NAMES := [
	"Attack", "Strength", "Defence", "Hitpoints", "Ranged", "Prayer", "Magic",
	"Mining", "Fishing", "Woodcutting", "Farming", "Hunter",
	"Cooking", "Smithing", "Crafting", "Fletching", "Herblore", "Runecraft",
	"Firemaking", "Construction",
	"Agility", "Thieving", "Slayer",
]

var current_floor: int = 1
var last_action: String = "—"
var bag: Array[String] = [] ## simple pickup bag until real inventory (M3)


func biome_name(biome: Biome) -> String:
	return BIOME_NAMES.get(biome, "Unknown")


func biome_color(biome: Biome) -> Color:
	return BIOME_COLORS.get(biome, Color.WHITE)


func set_action(text: String) -> void:
	last_action = text


func add_to_bag(item_name: String) -> void:
	bag.append(item_name)


func clear_bag() -> void:
	bag.clear()
