# DungeonScape

Single-player tick-based dungeon crawler (OSRS-skinned systems, multi-biome deep floors). Built in **Godot 4.3**.

See [DESIGN.md](DESIGN.md) for the locked design and milestone plan.

## Requirements

- Godot **4.3+** (4.3 stable recommended)
- Linux (primary) or Windows

## Run

```bash
godot --path /path/to/dungeonscape
```

Or open the `dungeonscape/` folder in the Godot editor and press Play.

## M0 controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move (8-way) | WASD / arrows | Left stick |
| Camera pan | Middle mouse drag | Right stick |
| Attack (stub) | Space | A / South |
| Interact (stub) | E | B / East |
| Inventory (stub) | I | Y / North |
| Menu (stub) | Esc | Start |

## Export

Presets for **Linux/X11** and **Windows Desktop** live in `export_presets.cfg`. Install Godot export templates, then export from the editor.

## Repo layout

This game lives under `dungeonscape/` beside the unrelated Step Quest web demo at the repo root.
