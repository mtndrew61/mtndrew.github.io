# Step Quest

Explore a legally distinct, Middle-earth–inspired wilderness. **Steps** are stamina: they pay for travel along scenic forks, and each strike or block spends a portion of today’s total.

## Locked design

- Click along scenic paths / forks (¾ illustrated map)
- Daily **hunt quest**
- Strike / Block combat; **elites** keep HP across days
- Bypass monsters; **ambush** tiles can force a fight (flee is free)
- Hybrid **melee / archer / rogue / mage** skills + town respec
- **1 mercenary** for a few fights
- Longer explore when you have more steps
- HP 0 → last town
- Web demo first, **Apple Health** via a Capacitor iOS shell

## Run the web demo

```bash
npm install
npm run dev
npm test
npm run build
```

The browser has no HealthKit. Menu → **Sync Apple Health** explains that, and **Dev +2,000 steps** / **Next day** keep the demo playable.

**UI:** full-bleed map, overlay HUD. **Progression:** skill points and Traveler Rank (no XP bar). See `ROADMAP.md`.

## Apple Health (iOS)

HealthKit only runs on a real iPhone (or the iOS Simulator with a Health permission). This Linux checkout cannot exercise it.

On a Mac, after Xcode is installed:

```bash
npm install
npm run build
npx cap add ios    # once, if the ios/ folder is not already present
npx cap sync ios
npx cap open ios
```

In Xcode, select the App target → **Signing & Capabilities** → add **HealthKit**, and pick your team. The usage strings are already in `ios/App/App/Info.plist`:

- `NSHealthShareUsageDescription` — read today’s step count
- `NSHealthUpdateUsageDescription` — required by the capability; the app does not write samples

Run on a device. The first successful sync replaces the 8,000-step simulator pool with today’s Health total. Later syncs (open, resume, about once a minute, or **Sync Apple Health**) keep steps you already spent: `remaining = today’s total − spent`. A new calendar day refills from that day’s total and reshuffles lesser foes. Elites persist.

Step Quest reads **steps only** and stores the save in local storage on the device. Nothing is uploaded.
