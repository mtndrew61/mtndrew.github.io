import {
  DEBT_CAP_MULT,
  DEFAULT_BASE_GOAL,
  GOAL_MAX,
  GOAL_MIN,
  SURPLUS_BANK_RATE,
  WEAPONS,
} from "./content";
import type { DayLog, GameState, WeaponId } from "./types";

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Adaptive base goal from recent daily step totals. */
export function computeBaseGoal(recentSteps: number[]): number {
  if (recentSteps.length === 0) return DEFAULT_BASE_GOAL;
  const avg =
    recentSteps.reduce((sum, s) => sum + s, 0) / recentSteps.length;
  return Math.round(clamp(avg, GOAL_MIN, GOAL_MAX) / 100) * 100;
}

export function debtCap(baseGoal: number): number {
  return Math.round(baseGoal * DEBT_CAP_MULT);
}

export function applyDebtCap(debt: number, baseGoal: number): number {
  return clamp(Math.max(0, Math.ceil(debt)), 0, debtCap(baseGoal));
}

export function dailyTarget(baseGoal: number, debt: number): number {
  return baseGoal + applyDebtCap(debt, baseGoal);
}

export function weaponMult(weaponId: WeaponId): number {
  return WEAPONS[weaponId]?.damageMult ?? 1;
}

/**
 * Damage from today's steps plus any banked surplus from prior days.
 * Banked damage is applied first (already "earned"), then today's steps.
 */
export function computeDamage(
  steps: number,
  bankedDamage: number,
  weaponId: WeaponId,
): { fromBank: number; fromSteps: number; total: number } {
  const mult = weaponMult(weaponId);
  const fromBank = Math.floor(Math.max(0, bankedDamage) * mult);
  const fromSteps = Math.floor(Math.max(0, steps) * mult);
  return { fromBank, fromSteps, total: fromBank + fromSteps };
}

export interface ResolveInput {
  date: string;
  baseGoal: number;
  debtIn: number;
  steps: number;
  bankedIn: number;
  enemyHp: number;
  weaponId: WeaponId;
}

export interface ResolveResult {
  log: DayLog;
  debtOut: number;
  bankedOut: number;
  enemyHpAfter: number;
  defeated: boolean;
}

/**
 * Resolve one day against the current encounter.
 *
 * Rules (locked defaults):
 * - Target = baseGoal + debt (debt capped at 1× baseGoal)
 * - Damage = (banked + steps) × weaponMult, applied to enemy HP
 * - If steps < target: debtOut = min(cap, ceil(missed × 0.5)); bank cleared
 * - If steps ≥ target: debt cleared; surplus after meeting target first
 *   reduces any conceptual shortfall (none), then 25% of surplus banks
 * - Surplus is computed against the step target (not enemy HP)
 */
export function resolveDay(input: ResolveInput): ResolveResult {
  const debtIn = applyDebtCap(input.debtIn, input.baseGoal);
  const target = dailyTarget(input.baseGoal, debtIn);
  const steps = Math.max(0, Math.floor(input.steps));
  const { total: damageDealt } = computeDamage(
    steps,
    input.bankedIn,
    input.weaponId,
  );

  const enemyHpBefore = Math.max(0, Math.floor(input.enemyHp));
  const enemyHpAfter = Math.max(0, enemyHpBefore - damageDealt);
  const defeated = enemyHpAfter === 0 && enemyHpBefore > 0;

  const missed = Math.max(0, target - steps);
  let debtOut = 0;
  let bankedOut = 0;

  if (missed > 0) {
    debtOut = applyDebtCap(Math.ceil(missed * 0.5), input.baseGoal);
    bankedOut = 0;
  } else {
    debtOut = 0;
    const surplus = steps - target;
    // Surplus reduces debt first (already 0 when met), then 25% banks.
    bankedOut = Math.floor(surplus * SURPLUS_BANK_RATE);
  }

  let outcome: DayLog["outcome"];
  if (defeated) outcome = "victory";
  else if (missed > 0) outcome = "shortfall";
  else outcome = "ongoing";

  const log: DayLog = {
    date: input.date,
    baseGoal: input.baseGoal,
    debtIn,
    target,
    steps,
    damageDealt,
    enemyHpBefore,
    enemyHpAfter,
    debtOut,
    bankedOut,
    outcome,
    lootGained: null,
  };

  return { log, debtOut, bankedOut, enemyHpAfter, defeated };
}

export function advanceDate(isoDate: string, days = 1): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function pushRecentSteps(
  recent: number[],
  steps: number,
  max = 7,
): number[] {
  return [...recent, steps].slice(-max);
}

/** Route progress nudge when a foe is defeated (prototype chapter 1). */
export function progressAfterVictory(current: number): number {
  return clamp(current + 0.08, 0, 1);
}

export function summarizeState(state: GameState): string {
  return [
    `day ${state.today}`,
    `steps ${state.simulatedSteps}`,
    `debt ${state.debt}`,
    `hp ${state.enemyHp}/${state.enemyMaxHp}`,
    `weapon ${state.weaponId}`,
  ].join(" · ");
}
