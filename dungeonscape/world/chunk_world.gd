extends Node3D
class_name ChunkWorld
## Large floor with chunk streaming — only nearby chunks are instantiated.

signal chunk_stream_changed(loaded_count: int)

@export var floor_index: int = 1

var biome_map: BiomeMap
var _chunks: Dictionary = {} ## Vector2i -> DungeonChunk
var _player_chunk: Vector2i = Vector2i(9999, 9999)


func _ready() -> void:
	biome_map = BiomeMap.new(floor_index * 1009 + 7, Game.FLOOR_SIZE_TILES)
	# Spawn near center of floor.
	var mid := Game.FLOOR_SIZE_TILES / 2
	_ensure_spawn_walkable(mid, mid)


func world_to_tile(world_pos: Vector3) -> Vector2i:
	return Vector2i(
		int(floor(world_pos.x / Game.TILE_SIZE)),
		int(floor(world_pos.z / Game.TILE_SIZE))
	)


func tile_to_world_center(tile: Vector2i) -> Vector3:
	return Vector3(
		(tile.x + 0.5) * Game.TILE_SIZE,
		0.0,
		(tile.y + 0.5) * Game.TILE_SIZE
	)


func tile_chunk(tile: Vector2i) -> Vector2i:
	return Vector2i(
		int(floor(float(tile.x) / float(Game.CHUNK_SIZE))),
		int(floor(float(tile.y) / float(Game.CHUNK_SIZE)))
	)


func is_walkable(tile: Vector2i) -> bool:
	return biome_map.in_bounds(tile.x, tile.y) and not biome_map.is_blocked(tile.x, tile.y)


func biome_at_tile(tile: Vector2i) -> Game.Biome:
	return biome_map.biome_at(tile.x, tile.y)


func update_streaming(player_tile: Vector2i) -> void:
	var center := tile_chunk(player_tile)
	if center == _player_chunk and not _chunks.is_empty():
		return
	_player_chunk = center
	var needed: Dictionary = {}
	for cz in range(center.y - Game.CHUNK_LOAD_RADIUS, center.y + Game.CHUNK_LOAD_RADIUS + 1):
		for cx in range(center.x - Game.CHUNK_LOAD_RADIUS, center.x + Game.CHUNK_LOAD_RADIUS + 1):
			var key := Vector2i(cx, cz)
			if _chunk_in_floor(key):
				needed[key] = true
				if not _chunks.has(key):
					_load_chunk(key)
	var to_remove: Array[Vector2i] = []
	for key in _chunks.keys():
		if not needed.has(key):
			to_remove.append(key)
	for key in to_remove:
		_unload_chunk(key)
	chunk_stream_changed.emit(_chunks.size())


func loaded_chunk_count() -> int:
	return _chunks.size()


func _chunk_in_floor(coord: Vector2i) -> bool:
	var max_c := int(ceil(float(Game.FLOOR_SIZE_TILES) / float(Game.CHUNK_SIZE))) - 1
	return coord.x >= 0 and coord.y >= 0 and coord.x <= max_c and coord.y <= max_c


func _load_chunk(coord: Vector2i) -> void:
	var chunk := DungeonChunk.new()
	add_child(chunk)
	chunk.build(coord, biome_map)
	_chunks[coord] = chunk


func _unload_chunk(coord: Vector2i) -> void:
	var chunk: DungeonChunk = _chunks.get(coord)
	if chunk:
		chunk.queue_free()
	_chunks.erase(coord)


func _ensure_spawn_walkable(tx: int, tz: int) -> void:
	# BiomeMap pillars are sparse; center is almost always fine. Nudge if not.
	if is_walkable(Vector2i(tx, tz)):
		return
	for r in range(1, 12):
		for oz in range(-r, r + 1):
			for ox in range(-r, r + 1):
				if is_walkable(Vector2i(tx + ox, tz + oz)):
					return
