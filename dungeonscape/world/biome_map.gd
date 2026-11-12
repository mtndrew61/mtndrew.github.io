extends RefCounted
class_name BiomeMap
## Deterministic multi-biome painting for a floor. Chunks query this; floors are mixed, not mono-biome.

var floor_seed: int = 1
var size_tiles: int = Game.FLOOR_SIZE_TILES


func _init(p_seed: int = 1, p_size: int = 128) -> void:
	floor_seed = p_seed
	size_tiles = p_size


func in_bounds(tx: int, tz: int) -> bool:
	return tx >= 0 and tz >= 0 and tx < size_tiles and tz < size_tiles


func is_blocked(tx: int, tz: int) -> bool:
	if not in_bounds(tx, tz):
		return true
	# Border walls.
	if tx == 0 or tz == 0 or tx == size_tiles - 1 or tz == size_tiles - 1:
		return true
	# Sparse pillar noise — walkable majority for explorability.
	var n := _hash2(tx, tz)
	return (n % 37) == 0 and (tx + tz) % 5 != 0


func biome_at(tx: int, tz: int) -> Game.Biome:
	# Soft Voronoi-ish patches so a single floor mixes several biomes.
	var best_i := 0
	var best_d := INF
	var sites := _sites()
	for i in sites.size():
		var s: Vector2 = sites[i]
		var d := Vector2(tx, tz).distance_squared_to(s)
		# Nudge distances so borders feel organic.
		d *= 0.85 + 0.3 * _noise01(tx + i * 17, tz - i * 9)
		if d < best_d:
			best_d = d
			best_i = i
	return best_i as Game.Biome


func _sites() -> Array[Vector2]:
	var out: Array[Vector2] = []
	var rng := RandomNumberGenerator.new()
	rng.seed = floor_seed * 7919
	var count := 5 # matches Game.Biome members
	for i in count:
		out.append(Vector2(
			rng.randf_range(size_tiles * 0.12, size_tiles * 0.88),
			rng.randf_range(size_tiles * 0.12, size_tiles * 0.88)
		))
	return out


func _noise01(x: int, z: int) -> float:
	return float(_hash2(x, z) % 1000) / 1000.0


func _hash2(x: int, z: int) -> int:
	var h := floor_seed
	h = (h ^ (x * 374761393)) & 0x7fffffff
	h = (h ^ (z * 668265263)) & 0x7fffffff
	h = (h ^ (h >> 13)) * 1274126177
	return h & 0x7fffffff
