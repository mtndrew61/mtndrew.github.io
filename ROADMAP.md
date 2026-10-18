# Step Quest — remaining work before Apple Health

## Progression today (no XP ladder)

| Source | Reward |
| --- | --- |
| New game | 3 skill points |
| Daily hunt claim (in town) | +1 skill point + gold |
| Elite kill | +1 skill point |

Spend points in **Melee / Archer / Rogue / Mage** (hybrid OK, town respec).  
**Traveler Rank** = `1 + floor(pointsEarned / 3)` (Wayfarer → Trailforged).  
There is **no XP bar / character level** yet — only skill points + gear + gold.

## What’s left before Health sync

### Must-have
1. **Native shell** — Expo or Capacitor iOS app (HealthKit is not available in Safari/web).
2. **HealthKit permissions** — read Steps (and optionally distance) for “today”.
3. **Replace step simulator** — Menu +2k / slider → live `stepsRemaining` / `stepsGranted` from Health.
4. **Day boundary** — midnight (or Health day) refreshes stamina pool + daily hunt; don’t double-count.
5. **Background refresh** — pull steps when app opens / resumes.
6. **Privacy copy** — clear Settings screen: what we read, local-first storage.

### Should-have
7. **XP → skill points** (optional) — kills/travel grant XP; every N XP → +1 skill point (true level curve).
8. **More content** — 2–3 more towns, biome encounters, short campaign end.
9. **Balance pass** — stamina costs vs typical daily step counts (6k–12k).
10. **Persist cloud backup** (optional) — iCloud/Game Center later; local is fine for v1.

### Nice-to-have (post-Health)
11. Richer illustrated map art / spine animations  
12. Sound / haptics on Strike & Block  
13. Watch complications / Live Activities  

## Suggested build order
`polish web demo` → `Expo scaffold` → `HealthKit read today` → `wire stamina` → `TestFlight`
