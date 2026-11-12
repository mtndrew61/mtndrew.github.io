extends CanvasLayer
class_name DebugHUD

@onready var label: Label = $Margin/Label

var player: Player
var world: ChunkWorld


func setup(p_player: Player, p_world: ChunkWorld) -> void:
	player = p_player
	world = p_world


func _process(_delta: float) -> void:
	if player == null or world == null:
		return
	var biome := world.biome_at_tile(player.tile)
	var fps := Engine.get_frames_per_second()
	label.text = "\n".join([
		"DungeonScape M0",
		"Floor %d | Tick %d (%.1fs) α=%.2f" % [Game.current_floor, TickClock.tick_index, TickClock.TICK_SECONDS, TickClock.tick_alpha],
		"Tile %s | Chunks %d | FPS %d" % [str(player.tile), world.loaded_chunk_count(), fps],
		"Biome: %s" % Game.biome_name(biome),
		"Action: %s" % Game.last_action,
		"Move: WASD/arrows or left stick (8-way) | Camera: right stick / MMB | Space attack | E interact | I inv",
	])
