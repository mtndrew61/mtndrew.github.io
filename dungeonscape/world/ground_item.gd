extends Node3D
class_name GroundItem
## Placeholder loot with despawn timer (default 180s). Warns when near expiry.

signal despawned(item: GroundItem)
signal picked_up(item: GroundItem)

@export var item_name: String = "Mysterious scrap"
@export var despawn_seconds: float = 180.0

var tile: Vector2i = Vector2i.ZERO

var _life: float = 0.0
var _mesh: MeshInstance3D
var _mat: StandardMaterial3D
var _label: Label3D


func _ready() -> void:
	if despawn_seconds <= 0.0:
		despawn_seconds = Game.LOOT_DESPAWN_SECONDS
	_life = despawn_seconds
	_mesh = MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.18
	sphere.height = 0.36
	_mesh.mesh = sphere
	_mesh.position = Vector3(0, 0.35, 0)
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color("d4a017")
	_mat.emission_enabled = true
	_mat.emission = Color("d4a017")
	_mat.emission_energy_multiplier = 0.6
	_mesh.set_surface_override_material(0, _mat)
	add_child(_mesh)

	_label = Label3D.new()
	_label.text = item_name
	_label.font_size = 28
	_label.pixel_size = 0.012
	_label.position = Vector3(0, 0.85, 0)
	_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_label.modulate = Color(0.95, 0.92, 0.85)
	_label.outline_modulate = Color(0, 0, 0, 0.8)
	_label.outline_size = 6
	add_child(_label)


func _process(delta: float) -> void:
	_life -= delta
	_mesh.position.y = 0.35 + sin(Time.get_ticks_msec() * 0.005) * 0.05
	var urgent := _life <= 30.0
	_mat.albedo_color = Color("d44a2a") if urgent else Color("d4a017")
	_mat.emission = _mat.albedo_color
	_label.text = "%s (%ds)" % [item_name, int(ceil(_life))]
	if _life <= 0.0:
		despawned.emit(self)
		queue_free()


func seconds_left() -> float:
	return maxf(0.0, _life)


func pickup() -> void:
	picked_up.emit(self)
	queue_free()
