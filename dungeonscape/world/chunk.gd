extends Node3D
class_name DungeonChunk
## One streamed chunk of tiles. Built on demand; freed when far from the player.

const TILE_MESH_HEIGHT := 0.15
const WALL_HEIGHT := 1.2

var chunk_coord: Vector2i = Vector2i.ZERO
var biome_map: BiomeMap


func build(coord: Vector2i, map: BiomeMap) -> void:
	chunk_coord = coord
	biome_map = map
	name = "Chunk_%d_%d" % [coord.x, coord.y]
	position = Vector3(
		coord.x * Game.CHUNK_SIZE * Game.TILE_SIZE,
		0.0,
		coord.y * Game.CHUNK_SIZE * Game.TILE_SIZE
	)
	_clear_children()
	var origin_tx := coord.x * Game.CHUNK_SIZE
	var origin_tz := coord.y * Game.CHUNK_SIZE
	for lz in Game.CHUNK_SIZE:
		for lx in Game.CHUNK_SIZE:
			var tx := origin_tx + lx
			var tz := origin_tz + lz
			if not map.in_bounds(tx, tz):
				continue
			var blocked := map.is_blocked(tx, tz)
			var biome := map.biome_at(tx, tz)
			_add_tile(lx, lz, biome, blocked)


func _add_tile(lx: int, lz: int, biome: Game.Biome, blocked: bool) -> void:
	var mesh_instance := MeshInstance3D.new()
	var box := BoxMesh.new()
	if blocked:
		box.size = Vector3(Game.TILE_SIZE * 0.95, WALL_HEIGHT, Game.TILE_SIZE * 0.95)
		mesh_instance.position = Vector3(
			(lx + 0.5) * Game.TILE_SIZE,
			WALL_HEIGHT * 0.5,
			(lz + 0.5) * Game.TILE_SIZE
		)
	else:
		box.size = Vector3(Game.TILE_SIZE * 0.98, TILE_MESH_HEIGHT, Game.TILE_SIZE * 0.98)
		mesh_instance.position = Vector3(
			(lx + 0.5) * Game.TILE_SIZE,
			TILE_MESH_HEIGHT * 0.5,
			(lz + 0.5) * Game.TILE_SIZE
		)
	mesh_instance.mesh = box
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Game.biome_color(biome).darkened(0.35 if blocked else 0.0)
	mat.roughness = 0.85
	mesh_instance.set_surface_override_material(0, mat)
	add_child(mesh_instance)


func _clear_children() -> void:
	for c in get_children():
		c.queue_free()
