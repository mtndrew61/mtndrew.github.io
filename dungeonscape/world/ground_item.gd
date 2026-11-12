extends Node3D
class_name GroundItem
## Placeholder loot with despawn timer (default 180s).

signal despawned(item: GroundItem)

@export var item_name: String = "Mysterious scrap"
@export var despawn_seconds: float = 180.0

var _life: float = 0.0
var _mesh: MeshInstance3D


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
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("d4a017")
	mat.emission_enabled = true
	mat.emission = Color("d4a017")
	mat.emission_energy_multiplier = 0.6
	_mesh.set_surface_override_material(0, mat)
	add_child(_mesh)


func _process(delta: float) -> void:
	_life -= delta
	_mesh.position.y = 0.35 + sin(Time.get_ticks_msec() * 0.005) * 0.05
	if _life <= 0.0:
		despawned.emit(self)
		queue_free()


func seconds_left() -> float:
	return maxf(0.0, _life)
