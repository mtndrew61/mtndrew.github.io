import { ENEMIES, STORAGE_KEY, WEAPONS } from "./content";
import {
  advanceDate,
  computeBaseGoal,
  dailyTarget,
  progressAfterVictory,
  pushRecentSteps,
  resolveDay,
} from "./economy";
import type { GameState, WeaponId } from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialState(): GameState {
  const enemy = ENEMIES["goblin-scout"];
  const seedRecent = [7200, 8100, 6400, 9000, 7800, 8500, 7600];
  return {
    today: todayIso(),
    recentSteps: seedRecent,
    debt: 0,
    bankedDamage: 0,
    enemyId: enemy.id,
    enemyHp: enemy.baseHp,
    enemyMaxHp: enemy.baseHp,
    weaponId: "walking-stick",
    unlockedWeapons: ["walking-stick"],
    routeProgress: 0.04,
    inEncounter: true,
    chapterTitle: "Chapter I — Leaves on the Road",
    journal: [
      "The Whisperwood path narrows. Something small and wicked waits between the roots.",
    ],
    history: [],
    simulatedSteps: 0,
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.today || !parsed?.enemyId) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getBaseGoal(state: GameState): number {
  return computeBaseGoal(state.recentSteps);
}

export function getTodayTarget(state: GameState): number {
  return dailyTarget(getBaseGoal(state), state.debt);
}

export function setSimulatedSteps(
  state: GameState,
  steps: number,
): GameState {
  return { ...state, simulatedSteps: Math.max(0, Math.floor(steps)) };
}

function grantLoot(state: GameState): {
  state: GameState;
  loot: WeaponId | null;
} {
  const order: WeaponId[] = ["iron-blade", "rune-spear"];
  const next = order.find((id) => !state.unlockedWeapons.includes(id));
  if (!next) return { state, loot: null };
  const unlockedWeapons = [...state.unlockedWeapons, next];
  return {
    state: {
      ...state,
      unlockedWeapons,
      weaponId: next,
      journal: [
        ...state.journal,
        `Loot: ${WEAPONS[next].name}. ${WEAPONS[next].blurb}`,
      ],
    },
    loot: next,
  };
}

export function resolveToday(state: GameState): GameState {
  if (!state.inEncounter) {
    // Free travel day: steps still advance the pin a little and update history.
    const baseGoal = getBaseGoal(state);
    const result = resolveDay({
      date: state.today,
      baseGoal,
      debtIn: state.debt,
      steps: state.simulatedSteps,
      bankedIn: state.bankedDamage,
      enemyHp: 0,
      weaponId: state.weaponId,
    });
    return {
      ...state,
      today: advanceDate(state.today),
      recentSteps: pushRecentSteps(state.recentSteps, state.simulatedSteps),
      debt: result.debtOut,
      bankedDamage: result.bankedOut,
      routeProgress: Math.min(1, state.routeProgress + 0.03),
      simulatedSteps: 0,
      history: [...state.history, result.log],
      journal: [
        ...state.journal,
        "Open road. The wilds watch, but nothing bars the way today.",
      ],
    };
  }

  const baseGoal = getBaseGoal(state);
  const result = resolveDay({
    date: state.today,
    baseGoal,
    debtIn: state.debt,
    steps: state.simulatedSteps,
    bankedIn: state.bankedDamage,
    enemyHp: state.enemyHp,
    weaponId: state.weaponId,
  });

  let next: GameState = {
    ...state,
    today: advanceDate(state.today),
    recentSteps: pushRecentSteps(state.recentSteps, state.simulatedSteps),
    debt: result.debtOut,
    bankedDamage: result.bankedOut,
    enemyHp: result.enemyHpAfter,
    simulatedSteps: 0,
    history: [...state.history, { ...result.log }],
  };

  if (result.defeated) {
    const looted = grantLoot(next);
    next = looted.state;
    next.history[next.history.length - 1] = {
      ...next.history[next.history.length - 1],
      lootGained: looted.loot,
      outcome: "victory",
    };
    next.inEncounter = false;
    next.routeProgress = progressAfterVictory(next.routeProgress);
    next.journal = [
      ...next.journal,
      "The Goblin Scout flees into the roots. The Whisperwood path opens again.",
    ];
  } else if (result.log.outcome === "shortfall") {
    next.journal = [
      ...next.journal,
      `Shortfall. Debt on the morrow: ${result.debtOut.toLocaleString()} steps.`,
    ];
  } else {
    next.journal = [
      ...next.journal,
      `The scout reels but stands. ${result.enemyHpAfter.toLocaleString()} spite remains.`,
    ];
  }

  return next;
}

/** Prototype helper: spawn another scout further down the road. */
export function startNextScout(state: GameState): GameState {
  if (state.inEncounter) return state;
  const enemy = ENEMIES["goblin-scout"];
  return {
    ...state,
    inEncounter: true,
    enemyId: enemy.id,
    enemyHp: enemy.baseHp,
    enemyMaxHp: enemy.baseHp,
    journal: [
      ...state.journal,
      "Another scout. The wood is not done with you yet.",
    ],
  };
}

export function equipWeapon(state: GameState, weaponId: WeaponId): GameState {
  if (!state.unlockedWeapons.includes(weaponId)) return state;
  return { ...state, weaponId };
}

export function resetGame(): GameState {
  clearSavedState();
  return createInitialState();
}
