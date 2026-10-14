# Step Quest (Phase 0)

Walk a legally distinct, Middle-earth–inspired wilderness. Real-world steps (simulated in Phase 0) advance your route and damage foes. Miss a daily mark and half the shortfall becomes tomorrow’s debt.

## Locked defaults

- Solo campaign, whimsical-with-teeth tone
- Adaptive daily base goal from 7-day average (clamped 5k–12k)
- Surplus clears debt, then **25%** banks into the next fight
- Debt capped at **1×** base goal
- Multi-day bosses planned for later chapters (trolls/wraiths)
- Illustrated 2D map; Expo/HealthKit planned for Phase 2

## Phase 0 scope

- Static biome route map + traveler pin
- One **Goblin Scout** encounter (4,000 HP)
- Fake step slider (stand-in for Apple Health)
- Debt / surplus / weapon multiplier resolve math
- Walking Stick → Iron Blade loot on first victory

## Develop

```bash
npm install
npm run dev
npm test
npm run build
```

Open the local Vite URL. Use the slider to set steps, then **End day & resolve**.
