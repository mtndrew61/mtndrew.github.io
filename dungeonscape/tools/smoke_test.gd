extends SceneTree
## Headless smoke test for M1: streaming, move, loot pickup, stairs present.
## Run: godot --headless --path . -s res://tools/smoke_test.gd

const TICK_SECONDS := 0.6


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var err := change_scene_to_file("res://main.tscn")
	if err != OK:
		push_error("Failed to load main.tscn: %s" % err)
		quit(1)
		return
	await process_frame
	await process_frame
	var main := current_scene
	if main == null:
		push_error("No current scene")
		quit(1)
		return
	var player := main.get_node("Player")
	var world := main.get_node("ChunkWorld")
	var loot := main.get_node("LootManager")
	var game := root.get_node_or_null("Game")
	if player == null or world == null or loot == null or game == null:
		push_error("Missing Player, ChunkWorld, LootManager, or Game")
		quit(1)
		return
	if world.loaded_chunk_count() <= 0:
		push_error("Expected streamed chunks")
		quit(1)
		return
	var stairs: Vector2i = world.stairs_tile()
	if world.biome_map.is_blocked(stairs.x, stairs.y):
		push_error("Stairs on blocked tile %s" % str(stairs))
		quit(1)
		return

	var start_tile: Vector2i = player.tile
	var start_bag: int = game.bag.size()
	for _i in 8:
		player.pending_step = Vector2i(1, 0)
		await create_timer(TICK_SECONDS + 0.05).timeout
	if player.tile == start_tile:
		for _j in 8:
			player.pending_step = Vector2i(0, 1)
			await create_timer(TICK_SECONDS + 0.05).timeout
	if player.tile == start_tile:
		push_error("Player did not move")
		quit(1)
		return

	loot.spawn_item(player.tile, "Smoke test scrap", 60.0)
	player._interact_queued = true
	await create_timer(TICK_SECONDS + 0.05).timeout
	if game.bag.size() <= start_bag:
		push_error("Expected loot pickup into bag")
		quit(1)
		return

	var floor_before: int = game.current_floor
	main.request_descend()
	await process_frame
	await process_frame
	if game.current_floor != floor_before + 1:
		push_error("Descend did not advance floor")
		quit(1)
		return

	print("SMOKE_OK tiles=%s->%s chunks=%d bag=%d floor=%d stairs=%s" % [
		start_tile, player.tile, world.loaded_chunk_count(), game.bag.size(), game.current_floor, stairs
	])
	quit(0)
