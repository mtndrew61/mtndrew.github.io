extends Node
## Fixed OSRS-style game tick (0.6s). Movement, combat, and skilling resolve on ticks.

signal ticked(tick_index: int)

const TICK_SECONDS := 0.6

var tick_index: int = 0
var paused: bool = false
var tick_alpha: float = 0.0 ## 0..1 progress within the current tick (for HUD / lerp)

var _accum: float = 0.0


func _process(delta: float) -> void:
	if paused:
		return
	_accum += delta
	while _accum >= TICK_SECONDS:
		_accum -= TICK_SECONDS
		tick_index += 1
		ticked.emit(tick_index)
	tick_alpha = clampf(_accum / TICK_SECONDS, 0.0, 1.0)


func seconds_until_tick() -> float:
	return maxf(0.0, TICK_SECONDS - _accum)
