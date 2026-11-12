extends Node3D
class_name ChunkWorld
## Large floor with hysteretic chunk streaming — load near, unload farther to avoid thrash.

signal chunk_stream_changed(loaded_count: int)

@export var floor_index: int = 1

var biome_map: BiomeMap
var _chunks: Dictionary = {} ## Vector2i -> DungeonChunk
var _player_chunk: Vector2i = Vector2i(9999, 9999)


func _ready() -> void:
	rebuild_floor(floor_index)


func rebuild_floor(p_floor: int) -> void:
	floor_index = p_floor
	for key in _chunks.keys():
		_unload_chunk(key)
	_chunks.clear()
	_player_chunk = Vector2i(9999, 9999)
	biome_map = BiomeMap.new(floor_index * 1009 + 7, Game.FLOOR_SIZE_TILES)


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


func stairs_tile() -> Vector2i:
	return biome_map.stairs_tile


func update_streaming(player_tile: Vector2i) -> void:
	var center := tile_chunk(player_tile)
	var same_chunk := center == _player_chunk
	_player_chunk = center

	var load_r := Game.CHUNK_LOAD_RADIUS
	var unload_r := Game.CHUNK_UNLOAD_RADIUS

	# Load anything in load radius.
	for cz in range(center.y - load_r, center.y + load_r + 1):
		for cx in range(center.x - load_r, center.x + load_r + 1):
			var key := Vector2i(cx, cz)
			if _chunk_in_floor(key) and not _chunks.has(key):
				_load_chunk(key)

	# Unload outside unload radius (hysteresis).
	var to_remove: Array[Vector2i] = []
	for key in _chunks.keys():
		var d: int = maxi(absi(key.x - center.x), absi(key.y - center.y))
		if d > unload_r:
			to_remove.append(key)
	for key in to_remove:
		_unload_chunk(key)

	if not same_chunk or not to_remove.is_empty():
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
