extends SceneTree
## Headless smoke test: load main scene, advance a few ticks, verify streaming + walk.
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
	if player == null or world == null:
		push_error("Missing Player or ChunkWorld")
		quit(1)
		return
	var start_chunks: int = world.loaded_chunk_count()
	if start_chunks <= 0:
		push_error("Expected streamed chunks, got %d" % start_chunks)
		quit(1)
		return
	var tick_clock := root.get_node_or_null("TickClock")
	var start_tile: Vector2i = player.tile
	for _i in 5:
		player.pending_step = Vector2i(1, 0)
		await create_timer(TICK_SECONDS + 0.05).timeout
	if player.tile == start_tile:
		for _j in 5:
			player.pending_step = Vector2i(0, 1)
			await create_timer(TICK_SECONDS + 0.05).timeout
	if player.tile == start_tile:
		push_error("Player did not move after queued steps")
		quit(1)
		return
	var tick_index := 0
	if tick_clock:
		tick_index = tick_clock.tick_index
	print("SMOKE_OK tiles=%s->%s chunks=%d tick=%d" % [start_tile, player.tile, world.loaded_chunk_count(), tick_index])
	quit(0)
