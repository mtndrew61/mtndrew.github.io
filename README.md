# Step Quest (web demo)

Explore a legally distinct, Middle-earth–inspired wilderness. **Steps** are your movement budget along scenic path forks — and the damage you spend when you click a monster.

## Locked design

- Click along scenic paths / forks (¾ illustrated map)
- Daily **hunt quest** (no harsh debt)
- Instant combat resolve; **elites** keep HP across days
- Bypass monsters; **ambush** tiles can force a fight (flee is free)
- Hybrid **melee / archer / rogue / mage** skills + town respec
- **1 mercenary** for a few fights
- Longer explore when you have more steps
- Can’t afford a fight → flee (no penalty) or chip; HP 0 → last town
- Short demo, **web first** (Apple Health later)

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

**UI:** full-bleed map with overlay HUD (stats top, path chips bottom, Skills/Gear/Town/Menu on the right).

**Progression:** skill points (start + hunt claim + elite kills) spent in four trees. **Traveler Rank** labels total points earned — there is no XP bar yet. See `ROADMAP.md`.

Travel via path chips / gold rings. **Proximity combat** — pulse = in range. **Steps = stamina**: Strike / Block / Flee. Menu → **+2,000 steps** simulates Health until the iOS build.

Town services (hire, respec, claim hunt) open from the **Town** rail when you’re in Briarhaven.
