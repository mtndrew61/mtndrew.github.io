# Step Quest — roadmap

## Progression today (no XP ladder)

| Source | Reward |
| --- | --- |
| New game | 3 skill points |
| Daily hunt claim (in town) | +1 skill point + gold |
| Elite kill | +1 skill point |

Spend points in **Melee / Archer / Rogue / Mage** (hybrid OK, town respec).  
**Traveler Rank** = `1 + floor(pointsEarned / 3)` (Wayfarer → Trailforged).  
There is **no XP bar / character level** yet — only skill points + gear + gold.

## Apple Health

The web game stays the demo. A **Capacitor** iOS shell (`com.stepquest.walk`) reads today’s steps with `@capgo/capacitor-health` and feeds `applyHealthSteps`.

| Piece | Status |
| --- | --- |
| Read steps, request authorization | Wired (`src/health/steps.ts`) |
| Stamina = today’s total minus spent | Wired (`applyHealthSteps`) |
| New local calendar day resets spend | Wired |
| Sync on open, resume, ~60s, and the Menu button | Wired |
| Browser keeps Dev +2,000 / Next day | Wired |
| `ios/` project, HealthKit capability, device run | Needs a Mac + Apple team |

Expo was the earlier note. Capacitor wraps this Vite UI so the map does not get rewritten in React Native.

## Still open

1. **Device check** — confirm HealthKit totals match the Health app after a real walk.
2. **Balance** — strike costs vs a typical 6k–12k day.
3. **More map** — extra towns and a short campaign end.
4. **Optional XP curve** — kills/travel → skill points on a real level track.
5. **Polish** — sound, haptics, richer art. Cloud backup is not required for v1.
