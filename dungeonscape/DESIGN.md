# DungeonScape — Locked Design

Single-player fantasy dungeon crawler: OSRS-skinned systems, Dungeon Crawler Carl–style deep descent, dry dark comedy.

## Pillars

- **Engine:** Godot 4
- **Tick:** 0.6s fixed (`TickClock`)
- **Movement:** 8-way tile steps (1 tile / tick, diagonals included)
- **View:** 2.5D tilted orthographic camera; right stick / MMB pan
- **Controls:** Xbox / Switch Pro + mouse & keyboard
- **Progression:** Persistent character (not hardcore); soft death like regular OSRS
- **Loot:** Ground items despawn after **180s** by default
- **World:** Large floors, **chunk streaming**, **mixed biomes per floor**, mobs match local biome
- **Scope:** 16 floors, multi-mobs, bosses, NPCs, quests
- **Art:** Placeholders now; AI concept → pixel cleanup later
- **Platforms:** Linux primary; Windows export preset from day one

## Skills (OSRS-like roster)

Attack, Strength, Defence, Hitpoints, Ranged, Prayer, Magic,  
Mining, Fishing, Woodcutting, Farming, Hunter,  
Cooking, Smithing, Crafting, Fletching, Herblore, Runecraft, Firemaking, Construction,  
Agility, Thieving, Slayer

## Milestones

| ID | Goal |
|----|------|
| M0 | Skeleton: tick, 8-way, chunks, camera, input, HUD, exports |
| M1 | Large floor + multi-biome + loot despawn polish |
| M2 | Melee combat + early mobs |
| M3 | Ranged/Magic, inventory, gear |
| M4 | Skill sheet + first skilling loops |
| M5 | Floors 1–4 loop + save/load |
| M6 | NPCs + quest framework |
| M7 | Floors 5–8 + mid bosses |
| M8 | Floors 9–12 |
| M9 | Floors 13–16 + finale bosses |
| M10 | Polish & ship demo |

## Tone

Fantasy first; comedy in copy, NPC voice, and dungeon “rules,” not slapstick UI.
