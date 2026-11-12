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

## Controls (M1)

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move (8-way) | WASD / arrows | Left stick |
| Camera pan | Middle mouse drag | Right stick |
| Attack (stub → M2) | Space | A / South |
| Interact (loot / stairs) | E | B / East |
| Bag | I | Y / North |
| Menu (stub) | Esc | Start |

Stand on glowing **stairs** and press Interact to descend to the next floor. Ground loot shows a countdown and turns red under 30s; it despawns at 180s by default.

## Export

Presets for **Linux/X11** and **Windows Desktop** live in `export_presets.cfg`. Install Godot export templates, then export from the editor.

## Repo layout

This game lives under `dungeonscape/` beside the unrelated Step Quest web demo at the repo root.
