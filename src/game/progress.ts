import { spentSkillPoints } from "./skills";
import type { GameState } from "./types";

/**
 * Progression today is skill-point based — there is no XP bar yet.
 *
 * Earn skill points from: starting grant, daily hunt claim, elite kills.
 * Spend them in Melee / Archer / Rogue / Mage trees (hybrid OK).
 * Traveler Rank is a readable label for total points ever earned.
 */
export function travelerRank(state: GameState): number {
  const earned = state.skillPointsEarned ?? spentSkillPoints(state) + state.skillPoints;
  return Math.max(1, 1 + Math.floor(earned / 3));
}

export function rankTitle(rank: number): string {
  if (rank <= 1) return "Wayfarer";
  if (rank === 2) return "Pathwalker";
  if (rank === 3) return "Roadwarden";
  if (rank === 4) return "Wildstrider";
  return "Trailforged";
}

export function progressSummary(state: GameState): {
  rank: number;
  title: string;
  unspent: number;
  spent: number;
  earned: number;
} {
  const spent = spentSkillPoints(state);
  const unspent = state.skillPoints;
  const earned = state.skillPointsEarned ?? spent + unspent;
  const rank = travelerRank({ ...state, skillPointsEarned: earned });
  return {
    rank,
    title: rankTitle(rank),
    unspent,
    spent,
    earned,
  };
}
