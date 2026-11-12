extends Node3D
class_name LootManager
## Spawns ground loot, tracks tiles, handles pickup + 180s despawn.

signal loot_changed

var world: ChunkWorld
var _by_tile: Dictionary = {} ## Vector2i -> GroundItem


func setup(p_world: ChunkWorld) -> void:
	world = p_world


func clear_all() -> void:
	for item in _by_tile.values():
		if is_instance_valid(item):
			item.queue_free()
	_by_tile.clear()
	loot_changed.emit()


func spawn_item(tile: Vector2i, item_name: String, despawn_seconds: float = Game.LOOT_DESPAWN_SECONDS) -> GroundItem:
	if not world.is_walkable(tile):
		return null
	if _by_tile.has(tile):
		return _by_tile[tile]
	var item := GroundItem.new()
	item.item_name = item_name
	item.tile = tile
	item.despawn_seconds = despawn_seconds
	add_child(item)
	item.global_position = world.tile_to_world_center(tile)
	item.despawned.connect(_on_despawned)
	item.picked_up.connect(_on_picked_up)
	_by_tile[tile] = item
	loot_changed.emit()
	return item


func item_at(tile: Vector2i) -> GroundItem:
	return _by_tile.get(tile)


func nearest_item(tile: Vector2i, max_chebyshev: int = 1) -> GroundItem:
	var best: GroundItem = null
	var best_d := 999
	for t in _by_tile.keys():
		var d: int = maxi(absi(t.x - tile.x), absi(t.y - tile.y))
		if d <= max_chebyshev and d < best_d:
			best_d = d
			best = _by_tile[t]
	return best


func try_pickup(tile: Vector2i) -> bool:
	var item := nearest_item(tile, 0)
	if item == null:
		item = nearest_item(tile, 1)
	if item == null:
		return false
	item.pickup()
	return true


func spawn_scatter_around(origin: Vector2i, count: int = 8) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = Game.current_floor * 1337 + origin.x * 31 + origin.y
	var names := [
		"Bent coin", "Mouldy ration", "Rusty nail", "Dungeon pamphlet",
		"Slightly cursed sock", "Glowcap", "Ash flake", "Bone button",
	]
	var placed := 0
	var attempts := 0
	while placed < count and attempts < count * 20:
		attempts += 1
		var t := origin + Vector2i(rng.randi_range(-18, 18), rng.randi_range(-18, 18))
		if not world.is_walkable(t) or _by_tile.has(t):
			continue
		if t == world.stairs_tile():
			continue
		var biome := world.biome_at_tile(t)
		var drop_name: String = names[rng.randi_range(0, names.size() - 1)]
		match biome:
			Game.Biome.FUNGAL:
				drop_name = "Glowcap"
			Game.Biome.FLOODED:
				drop_name = "Soggy coin"
			Game.Biome.ASH:
				drop_name = "Ash flake"
			Game.Biome.BONE:
				drop_name = "Bone button"
			_:
				pass
		spawn_item(t, drop_name)
		placed += 1


func ground_count() -> int:
	return _by_tile.size()


func _on_despawned(item: GroundItem) -> void:
	if _by_tile.get(item.tile) == item:
		_by_tile.erase(item.tile)
	Game.set_action("%s crumbled to dungeon dust." % item.item_name)
	loot_changed.emit()


func _on_picked_up(item: GroundItem) -> void:
	if _by_tile.get(item.tile) == item:
		_by_tile.erase(item.tile)
	Game.add_to_bag(item.item_name)
	Game.set_action("Picked up %s." % item.item_name)
	loot_changed.emit()
