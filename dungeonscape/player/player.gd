extends Node3D
class_name Player
## Tick-based 8-directional tile movement. Left stick / WASD queue a step each tick.

signal tile_changed(tile: Vector2i)

const MOVE_STICK_DEADZONE := 0.45

var world: ChunkWorld
var tile: Vector2i = Vector2i.ZERO
var facing: Vector2i = Vector2i(0, 1)
var pending_step: Vector2i = Vector2i.ZERO

var _visual: MeshInstance3D
var _from_pos: Vector3 = Vector3.ZERO
var _to_pos: Vector3 = Vector3.ZERO
var _moving_visual: bool = false


func setup(p_world: ChunkWorld, start_tile: Vector2i) -> void:
	world = p_world
	tile = start_tile
	position = world.tile_to_world_center(tile)
	_from_pos = position
	_to_pos = position
	_build_visual()
	TickClock.ticked.connect(_on_tick)
	world.update_streaming(tile)
	tile_changed.emit(tile)


func _build_visual() -> void:
	_visual = MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.28
	capsule.height = 0.9
	_visual.mesh = capsule
	_visual.position = Vector3(0, 0.7, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("c45c26")
	_visual.set_surface_override_material(0, mat)
	add_child(_visual)
	# Tiny facing marker.
	var nose := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.15, 0.15, 0.25)
	nose.mesh = box
	nose.position = Vector3(0, 0.85, 0.35)
	var nose_mat := StandardMaterial3D.new()
	nose_mat.albedo_color = Color("f0e6d2")
	nose.set_surface_override_material(0, nose_mat)
	add_child(nose)


func _process(_delta: float) -> void:
	_update_pending_from_input()
	_try_attack_interact_stubs()
	if _moving_visual:
		# Ease within the tick so steps read clearly without breaking tick discipline.
		var t := TickClock.tick_alpha
		position = _from_pos.lerp(_to_pos, t)
		if t >= 0.999:
			position = _to_pos
			_moving_visual = false


func _update_pending_from_input() -> void:
	var dir := _read_move_vector()
	if dir == Vector2.ZERO:
		return
	var step := _quantize_8way(dir)
	if step != Vector2i.ZERO:
		pending_step = step


func _read_move_vector() -> Vector2:
	var v := Vector2.ZERO
	# Keyboard / actions.
	if Input.is_action_pressed("move_east"):
		v.x += 1.0
	if Input.is_action_pressed("move_west"):
		v.x -= 1.0
	if Input.is_action_pressed("move_south"):
		v.y += 1.0
	if Input.is_action_pressed("move_north"):
		v.y -= 1.0
	# Left stick (joypad axis 0/1). Godot: left X = axis 0, left Y = axis 1.
	var stick := Vector2(
		Input.get_joy_axis(0, JOY_AXIS_LEFT_X),
		Input.get_joy_axis(0, JOY_AXIS_LEFT_Y)
	)
	if stick.length() >= MOVE_STICK_DEADZONE:
		v = stick
	# Mouse: hold RMB + WASD already covered; optional click-to-step later.
	return v


func _quantize_8way(v: Vector2) -> Vector2i:
	if v.length() < 0.01:
		return Vector2i.ZERO
	var angle := atan2(v.y, v.x) # x right, y down(south) in our stick space
	# 8 sectors centered on cardinals/diagonals.
	var sector := int(round(angle / (PI / 4.0)))
	match sector:
		0:
			return Vector2i(1, 0) # E
		1:
			return Vector2i(1, 1) # SE
		2:
			return Vector2i(0, 1) # S
		3:
			return Vector2i(-1, 1) # SW
		4, -4:
			return Vector2i(-1, 0) # W
		-3:
			return Vector2i(-1, -1) # NW
		-2:
			return Vector2i(0, -1) # N
		-1:
			return Vector2i(1, -1) # NE
		_:
			return Vector2i.ZERO


func _on_tick(_tick_index: int) -> void:
	if pending_step == Vector2i.ZERO:
		return
	var next := tile + pending_step
	facing = pending_step
	_face_visual()
	if world.is_walkable(next):
		tile = next
		_from_pos = position
		_to_pos = world.tile_to_world_center(tile)
		_moving_visual = true
		world.update_streaming(tile)
		tile_changed.emit(tile)
		Game.set_action("Step %s" % _dir_name(pending_step))
	else:
		Game.set_action("Blocked")
	# Consume intent each tick (OSRS-like: held direction keeps stepping).
	# Keep pending while held — refreshed every frame in _process.


func _face_visual() -> void:
	if facing == Vector2i.ZERO:
		return
	var yaw := atan2(float(facing.x), float(facing.y))
	rotation.y = yaw


func _try_attack_interact_stubs() -> void:
	if Input.is_action_just_pressed("attack"):
		Game.set_action("Attack (stub)")
	if Input.is_action_just_pressed("interact"):
		Game.set_action("Interact (stub)")
	if Input.is_action_just_pressed("inventory"):
		Game.set_action("Inventory (stub)")
	if Input.is_action_just_pressed("menu"):
		Game.set_action("Menu (stub)")


func _dir_name(d: Vector2i) -> String:
	var names := {
		Vector2i(0, -1): "N", Vector2i(1, -1): "NE", Vector2i(1, 0): "E", Vector2i(1, 1): "SE",
		Vector2i(0, 1): "S", Vector2i(-1, 1): "SW", Vector2i(-1, 0): "W", Vector2i(-1, -1): "NW",
	}
	return names.get(d, "?")
