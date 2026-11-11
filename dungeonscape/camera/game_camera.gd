extends Camera3D
class_name GameCamera
## 2.5D tilted orthographic camera: soft-follow player, right stick / middle-mouse pan.

@export var follow_target: Node3D
@export var tilt_degrees: float = -58.0
@export var follow_lerp: float = 8.0
@export var pan_speed: float = 10.0
@export var pan_return_lerp: float = 3.0
@export var max_pan_offset: float = 8.0

var _pan_offset: Vector3 = Vector3.ZERO


func _ready() -> void:
	projection = PROJECTION_ORTHOGONAL
	size = 12.0
	near = 0.05
	far = 200.0
	current = true
	rotation_degrees = Vector3(tilt_degrees, 0.0, 0.0)


func _process(delta: float) -> void:
	if follow_target == null:
		return
	_update_pan(delta)
	var desired := follow_target.global_position + _pan_offset
	# Keep camera pulled back along its local -Z so the tilt frames the player.
	var back := global_transform.basis.z.normalized() * 28.0
	var up := Vector3.UP * 0.0
	var cam_pos := desired + back + up
	# With a pitched camera, place it so look-at is roughly the desired point.
	cam_pos = desired + Vector3(0, 22.0, 14.0)
	global_position = global_position.lerp(cam_pos, clampf(follow_lerp * delta, 0.0, 1.0))
	look_at(desired + Vector3(0, 0.5, 0), Vector3.UP)
	# Re-assert tilt-ish framing: look_at changes rotation; blend toward pitched view.
	rotation_degrees.x = tilt_degrees


func _update_pan(delta: float) -> void:
	var stick := Vector2(
		Input.get_joy_axis(0, JOY_AXIS_RIGHT_X),
		Input.get_joy_axis(0, JOY_AXIS_RIGHT_Y)
	)
	var pan := Vector2.ZERO
	if stick.length() > 0.25:
		pan = stick
	# Keyboard pan hold: arrow keys already used for move; use IJKL? Skip — mouse drag.
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_MIDDLE):
		var motion := Input.get_last_mouse_velocity() * 0.0015
		pan += Vector2(motion.x, motion.y)

	if pan != Vector2.ZERO:
		# Pan in ground plane relative to camera yaw (currently ~0).
		_pan_offset.x += pan.x * pan_speed * delta
		_pan_offset.z += pan.y * pan_speed * delta
		var flat := Vector2(_pan_offset.x, _pan_offset.z)
		if flat.length() > max_pan_offset:
			flat = flat.normalized() * max_pan_offset
			_pan_offset.x = flat.x
			_pan_offset.z = flat.y
	else:
		_pan_offset = _pan_offset.lerp(Vector3.ZERO, clampf(pan_return_lerp * delta, 0.0, 1.0))
