extends CanvasLayer
class_name DebugHUD

@onready var label: Label = $Margin/Label

var player: Player
var world: ChunkWorld
var loot: LootManager


func setup(p_player: Player, p_world: ChunkWorld, p_loot: LootManager = null) -> void:
	player = p_player
	world = p_world
	loot = p_loot


func _process(_delta: float) -> void:
	if player == null or world == null:
		return
	var biome := world.biome_at_tile(player.tile)
	var fps := Engine.get_frames_per_second()
	var stairs := world.stairs_tile()
	var loot_line := "Loot on ground: 0"
	if loot:
		var near := loot.nearest_item(player.tile, 1)
		if near:
			loot_line = "Nearby: %s (%.0fs) | Ground %d | Bag %d" % [
				near.item_name, near.seconds_left(), loot.ground_count(), Game.bag.size()
			]
		else:
			loot_line = "Ground loot: %d | Bag: %d" % [loot.ground_count(), Game.bag.size()]
	label.text = "\n".join([
		"DungeonScape M1",
		"Floor %d | Tick %d (%.1fs)" % [Game.current_floor, TickClock.tick_index, TickClock.TICK_SECONDS],
		"Tile %s | Chunks %d | FPS %d" % [str(player.tile), world.loaded_chunk_count(), fps],
		"Biome: %s | Stairs @ %s" % [Game.biome_name(biome), str(stairs)],
		loot_line,
		"Action: %s" % Game.last_action,
		"Move 8-way | E/B interact (loot/stairs) | I bag | Right stick pan",
	])
