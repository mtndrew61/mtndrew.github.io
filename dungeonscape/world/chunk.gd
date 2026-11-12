extends Node3D
class_name DungeonChunk
## Streamed chunk using MultiMeshes for modest-PC performance.

const TILE_MESH_HEIGHT := 0.12
const WALL_HEIGHT := 1.35

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

	var floor_xf: Array[Transform3D] = []
	var floor_colors: Array[Color] = []
	var wall_xf: Array[Transform3D] = []
	var wall_colors: Array[Color] = []
	var prop_nodes: Array[Node3D] = []

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
			var color := Game.biome_color(biome)
			var local := Vector3((lx + 0.5) * Game.TILE_SIZE, 0.0, (lz + 0.5) * Game.TILE_SIZE)
			if blocked:
				var wt := Transform3D(Basis.IDENTITY.scaled(Vector3(0.95, WALL_HEIGHT, 0.95)), local + Vector3(0, WALL_HEIGHT * 0.5, 0))
				wall_xf.append(wt)
				wall_colors.append(color.darkened(0.4))
			else:
				var ft := Transform3D(Basis.IDENTITY.scaled(Vector3(0.98, TILE_MESH_HEIGHT, 0.98)), local + Vector3(0, TILE_MESH_HEIGHT * 0.5, 0))
				floor_xf.append(ft)
				floor_colors.append(color)
				var prop := _maybe_prop(biome, local, tx, tz)
				if prop:
					prop_nodes.append(prop)
			# Stairs marker (only once on that tile).
			if Vector2i(tx, tz) == map.stairs_tile:
				prop_nodes.append(_make_stairs(local))

	if not floor_xf.is_empty():
		add_child(_make_multimesh(floor_xf, floor_colors, Vector3(1, 1, 1)))
	if not wall_xf.is_empty():
		add_child(_make_multimesh(wall_xf, wall_colors, Vector3(1, 1, 1)))
	for p in prop_nodes:
		add_child(p)


func _make_multimesh(xforms: Array[Transform3D], colors: Array[Color], _unit: Vector3) -> MultiMeshInstance3D:
	var mmi := MultiMeshInstance3D.new()
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	var box := BoxMesh.new()
	box.size = Vector3.ONE
	mm.mesh = box
	mm.instance_count = xforms.size()
	for i in xforms.size():
		mm.set_instance_transform(i, xforms[i])
		mm.set_instance_color(i, colors[i])
	mmi.multimesh = mm
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 0.88
	mmi.material_override = mat
	return mmi


func _maybe_prop(biome: Game.Biome, local: Vector3, tx: int, tz: int) -> Node3D:
	var h := (tx * 73856093) ^ (tz * 19349663) ^ biome_map.floor_seed
	h = abs(h)
	match biome:
		Game.Biome.FUNGAL:
			if h % 17 != 0:
				return null
			return _blob(local + Vector3(0, 0.25, 0), Color("3f8f4a"), 0.2, 0.4)
		Game.Biome.FLOODED:
			if h % 13 != 0:
				return null
			return _blob(local + Vector3(0, 0.06, 0), Color("5aa0c8"), 0.35, 0.08)
		Game.Biome.ASH:
			if h % 19 != 0:
				return null
			return _blob(local + Vector3(0, 0.15, 0), Color("5a4030"), 0.18, 0.25)
		Game.Biome.BONE:
			if h % 21 != 0:
				return null
			return _blob(local + Vector3(0, 0.2, 0), Color("e8dcc0"), 0.12, 0.35)
		_:
			if h % 31 != 0:
				return null
			return _blob(local + Vector3(0, 0.18, 0), Color("8a8e98"), 0.1, 0.3)


func _blob(pos: Vector3, color: Color, radius: float, height: float) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := CapsuleMesh.new()
	mesh.radius = radius
	mesh.height = maxf(height, radius * 2.0)
	mi.mesh = mesh
	mi.position = pos
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mi.set_surface_override_material(0, mat)
	return mi


func _make_stairs(local: Vector3) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.85, 0.45, 0.85)
	mi.mesh = box
	mi.position = local + Vector3(0, 0.35, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("2a2e38")
	mat.emission_enabled = true
	mat.emission = Color("6ec6ff")
	mat.emission_energy_multiplier = 0.8
	mi.set_surface_override_material(0, mat)
	mi.name = "StairsDown"
	return mi


func _clear_children() -> void:
	for c in get_children():
		c.queue_free()
