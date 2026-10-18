import { PATH_RUMORS, type PathRumor, type PathTag } from "./content";
import { edgeCostBetween, neighbors, nodeById } from "./mapGraph";
import { totalsFromSkills } from "./skills";
import type { GameState } from "./types";

export interface ForkChoice {
  toId: string;
  name: string;
  cost: number | null;
  affordable: boolean;
  rumor: PathRumor | null;
  tags: PathTag[];
  kind: string;
}

function rumorFor(from: string, to: string): PathRumor | null {
  return (
    PATH_RUMORS.find((r) => r.from === from && r.to === to) ??
    PATH_RUMORS.find((r) => r.from === to && r.to === from) ??
    null
  );
}

/** Outgoing scenic choices from the current node (especially forks). */
export function getForkChoices(state: GameState): ForkChoice[] {
  const discount = totalsFromSkills(state).moveDiscount;
  return neighbors(state.currentNodeId).map((n) => {
    const node = nodeById(n.id);
    const cost = edgeCostBetween(state.currentNodeId, n.id, discount);
    const rumor = rumorFor(state.currentNodeId, n.id);
    const tags: PathTag[] = rumor?.tags ? [...rumor.tags] : [];
    if (node.kind === "ambush" && !tags.includes("danger")) tags.push("danger");
    if (node.kind === "town" && !tags.includes("town")) tags.push("town");
    return {
      toId: n.id,
      name: node.name,
      cost,
      affordable: cost != null && cost <= state.stepsRemaining,
      rumor,
      tags,
      kind: node.kind,
    };
  });
}
