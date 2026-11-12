extends Node3D
## M0 entry: chunked multi-biome floor, tick move, 2.5D camera, sample loot despawn.

@onready var world: ChunkWorld = $ChunkWorld
@onready var player: Player = $Player
@onready var camera: GameCamera = $GameCamera
@onready var hud: DebugHUD = $DebugHUD
@onready var items: Node3D = $Items


func _ready() -> void:
	Game.current_floor = 1
	var start := Vector2i(Game.FLOOR_SIZE_TILES / 2, Game.FLOOR_SIZE_TILES / 2)
	# Nudge to walkable tile if needed.
	start = _find_walkable_near(start)
	player.setup(world, start)
	camera.follow_target = player
	hud.setup(player, world)
	_spawn_sample_loot_near(start)
	Game.set_action("Welcome to the Aethermoor. Try not to die creatively.")


func _find_walkable_near(origin: Vector2i) -> Vector2i:
	if world.is_walkable(origin):
		return origin
	for r in range(1, 24):
		for z in range(-r, r + 1):
			for x in range(-r, r + 1):
				var t := origin + Vector2i(x, z)
				if world.is_walkable(t):
					return t
	return origin


func _spawn_sample_loot_near(origin: Vector2i) -> void:
	var offsets := [Vector2i(2, 0), Vector2i(-3, 2), Vector2i(1, -4)]
	for off in offsets:
		var t: Vector2i = origin + off
		if not world.is_walkable(t):
			continue
		var item := GroundItem.new()
		item.item_name = "Shiny nonsense"
		item.despawn_seconds = Game.LOOT_DESPAWN_SECONDS
		items.add_child(item)
		item.position = world.tile_to_world_center(t) + Vector3(0, 0, 0)
		item.despawned.connect(_on_loot_despawned)


func _on_loot_despawned(item: GroundItem) -> void:
	Game.set_action("%s crumbled to dungeon dust." % item.item_name)
