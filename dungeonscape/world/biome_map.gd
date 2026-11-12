extends RefCounted
class_name BiomeMap
## Deterministic multi-biome floor: carved rooms/corridors, mixed biomes, biome-flavored clutter.

const BIOME_COUNT := 5

var floor_seed: int = 1
var size_tiles: int = 128
var stairs_tile: Vector2i = Vector2i.ZERO

var _blocked: PackedByteArray = PackedByteArray()
var _biome: PackedByteArray = PackedByteArray()
var _sites: Array[Vector2] = []


func _init(p_seed: int = 1, p_size: int = 128) -> void:
	floor_seed = p_seed
	size_tiles = p_size
	_blocked.resize(size_tiles * size_tiles)
	_biome.resize(size_tiles * size_tiles)
	_sites = _make_sites()
	_paint_biomes()
	_carve_layout()
	_place_stairs()


func in_bounds(tx: int, tz: int) -> bool:
	return tx >= 0 and tz >= 0 and tx < size_tiles and tz < size_tiles


func is_blocked(tx: int, tz: int) -> bool:
	if not in_bounds(tx, tz):
		return true
	return _blocked[_idx(tx, tz)] != 0


func biome_at(tx: int, tz: int) -> Game.Biome:
	if not in_bounds(tx, tz):
		return Game.Biome.STONE
	return _biome[_idx(tx, tz)] as Game.Biome


func find_walkable_near(origin: Vector2i, max_r: int = 32) -> Vector2i:
	if not is_blocked(origin.x, origin.y):
		return origin
	for r in range(1, max_r + 1):
		for z in range(-r, r + 1):
			for x in range(-r, r + 1):
				var t := origin + Vector2i(x, z)
				if in_bounds(t.x, t.y) and not is_blocked(t.x, t.y):
					return t
	return origin


func _idx(tx: int, tz: int) -> int:
	return tz * size_tiles + tx


func _make_sites() -> Array[Vector2]:
	var out: Array[Vector2] = []
	var rng := RandomNumberGenerator.new()
	rng.seed = floor_seed * 7919
	for i in BIOME_COUNT:
		out.append(Vector2(
			rng.randf_range(size_tiles * 0.15, size_tiles * 0.85),
			rng.randf_range(size_tiles * 0.15, size_tiles * 0.85)
		))
	return out


func _paint_biomes() -> void:
	for tz in size_tiles:
		for tx in size_tiles:
			var best_i := 0
			var best_d := INF
			for i in _sites.size():
				var s: Vector2 = _sites[i]
				var d := Vector2(tx, tz).distance_squared_to(s)
				d *= 0.85 + 0.3 * _noise01(tx + i * 17, tz - i * 9)
				if d < best_d:
					best_d = d
					best_i = i
			_biome[_idx(tx, tz)] = best_i


func _carve_layout() -> void:
	# Start solid, carve rooms + corridors, then biome-flavored openness/props.
	_blocked.fill(1)
	var rng := RandomNumberGenerator.new()
	rng.seed = floor_seed * 104729 + 13

	var rooms: Array[Rect2i] = []
	var room_count := 18 + (floor_seed % 7)
	for _i in room_count:
		var w := rng.randi_range(5, 14)
		var h := rng.randi_range(5, 12)
		var x := rng.randi_range(2, size_tiles - w - 3)
		var z := rng.randi_range(2, size_tiles - h - 3)
		var room := Rect2i(x, z, w, h)
		var overlaps := false
		for other in rooms:
			if room.grow(1).intersects(other):
				overlaps = true
				break
		if overlaps:
			continue
		rooms.append(room)
		_carve_rect(room)

	# Guarantee a hub near center.
	var mid := size_tiles / 2
	var hub := Rect2i(mid - 6, mid - 6, 12, 12)
	rooms.append(hub)
	_carve_rect(hub)

	# Connect rooms in order with L corridors.
	for i in range(1, rooms.size()):
		var a := _rect_center(rooms[i - 1])
		var b := _rect_center(rooms[i])
		_carve_corridor(a, b, rng)

	# Border always solid.
	for t in size_tiles:
		_blocked[_idx(t, 0)] = 1
		_blocked[_idx(t, size_tiles - 1)] = 1
		_blocked[_idx(0, t)] = 1
		_blocked[_idx(size_tiles - 1, t)] = 1

	# Biome flavor: open flooded basins, denser fungal pillars, ash rubble.
	for tz in range(1, size_tiles - 1):
		for tx in range(1, size_tiles - 1):
			var biome := biome_at(tx, tz)
			var i := _idx(tx, tz)
			var n := _hash2(tx, tz)
			match biome:
				Game.Biome.FLOODED:
					if _blocked[i] != 0 and (n % 5) == 0:
						_blocked[i] = 0
				Game.Biome.FUNGAL:
					if _blocked[i] == 0 and (n % 23) == 0:
						_blocked[i] = 1
				Game.Biome.ASH:
					if _blocked[i] == 0 and (n % 29) == 0:
						_blocked[i] = 1
				Game.Biome.BONE:
					if _blocked[i] == 0 and (n % 41) == 0:
						_blocked[i] = 1
				_:
					pass

	# Re-open hub so spawn never traps the player.
	_carve_rect(hub)


func _carve_rect(room: Rect2i) -> void:
	for z in range(room.position.y, room.position.y + room.size.y):
		for x in range(room.position.x, room.position.x + room.size.x):
			if in_bounds(x, z):
				_blocked[_idx(x, z)] = 0


func _rect_center(room: Rect2i) -> Vector2i:
	return Vector2i(
		room.position.x + room.size.x / 2,
		room.position.y + room.size.y / 2
	)


func _carve_corridor(a: Vector2i, b: Vector2i, rng: RandomNumberGenerator) -> void:
	var x := a.x
	var z := a.y
	# Randomly pick horizontal-first or vertical-first.
	if rng.randf() < 0.5:
		while x != b.x:
			x += 1 if b.x > x else -1
			_carve_cell_wide(x, z)
		while z != b.y:
			z += 1 if b.y > z else -1
			_carve_cell_wide(x, z)
	else:
		while z != b.y:
			z += 1 if b.y > z else -1
			_carve_cell_wide(x, z)
		while x != b.x:
			x += 1 if b.x > x else -1
			_carve_cell_wide(x, z)


func _carve_cell_wide(tx: int, tz: int) -> void:
	for oz in range(-1, 2):
		for ox in range(-1, 2):
			var x := tx + ox
			var z := tz + oz
			if in_bounds(x, z) and x > 0 and z > 0 and x < size_tiles - 1 and z < size_tiles - 1:
				_blocked[_idx(x, z)] = 0


func _place_stairs() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = floor_seed * 9973 + 5
	# Prefer a walkable tile away from center hub.
	var best := Vector2i(size_tiles / 2 + 20, size_tiles / 2)
	for _try in 80:
		var cand := Vector2i(rng.randi_range(8, size_tiles - 9), rng.randi_range(8, size_tiles - 9))
		if is_blocked(cand.x, cand.y):
			continue
		var mid := Vector2(size_tiles * 0.5, size_tiles * 0.5)
		if Vector2(cand).distance_to(mid) < 18.0:
			continue
		best = cand
		break
	stairs_tile = find_walkable_near(best)


func _noise01(x: int, z: int) -> float:
	return float(_hash2(x, z) % 1000) / 1000.0


func _hash2(x: int, z: int) -> int:
	var h := floor_seed
	h = (h ^ (x * 374761393)) & 0x7fffffff
	h = (h ^ (z * 668265263)) & 0x7fffffff
	h = (h ^ (h >> 13)) * 1274126177
	return h & 0x7fffffff
