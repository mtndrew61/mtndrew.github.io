extends Node3D
## M1 entry: carved multi-biome floor, hysteretic streaming, loot pickup/despawn, stairs.

@onready var world: ChunkWorld = $ChunkWorld
@onready var player: Player = $Player
@onready var camera: GameCamera = $GameCamera
@onready var hud: DebugHUD = $DebugHUD
@onready var loot: LootManager = $LootManager


func _ready() -> void:
	add_to_group("dungeon_main")
	_start_floor(1)


func _start_floor(floor_num: int) -> void:
	Game.current_floor = floor_num
	world.rebuild_floor(floor_num)
	loot.setup(world)
	loot.clear_all()
	var start := world.biome_map.find_walkable_near(
		Vector2i(Game.FLOOR_SIZE_TILES / 2, Game.FLOOR_SIZE_TILES / 2)
	)
	player.setup(world, start, loot)
	camera.follow_target = player
	hud.setup(player, world, loot)
	loot.spawn_scatter_around(start, 10)
	# Guaranteed pickup near spawn for tutorial feel.
	var near := world.biome_map.find_walkable_near(start + Vector2i(2, 0))
	if near != start:
		loot.spawn_item(near, "Welcome brochure", 120.0)
	Game.set_action("Floor %d. Mixed biomes, sticky loot timers, stairs somewhere unpleasant." % floor_num)


func request_descend() -> void:
	# Light multi-floor stub for M1 — rebuild next floor seed, keep bag.
	var next_floor := mini(Game.current_floor + 1, 16)
	if next_floor == Game.current_floor:
		Game.set_action("That's the bottom of this build's courage.")
		return
	Game.set_action("You take the stairs. The air gets worse on purpose.")
	_start_floor(next_floor)
