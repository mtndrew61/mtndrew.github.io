import { EDGES, NODES } from "./content";
import type { MapNode } from "./types";

export function nodeById(id: string): MapNode {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown node ${id}`);
  return n;
}

export function neighbors(nodeId: string): { id: string; cost: number }[] {
  const out: { id: string; cost: number }[] = [];
  for (const e of EDGES) {
    if (e.from === nodeId) out.push({ id: e.to, cost: e.cost });
    if (e.to === nodeId) out.push({ id: e.from, cost: e.cost });
  }
  return out;
}

export interface Reachable {
  nodeId: string;
  cost: number;
  via: string | null;
}

/** Dijkstra: all nodes reachable with cost ≤ budget (after move discount). */
export function reachableFrom(
  startId: string,
  budget: number,
  moveDiscount: number,
): Map<string, Reachable> {
  const discount = Math.min(0.5, Math.max(0, moveDiscount));
  const dist = new Map<string, number>();
  const via = new Map<string, string | null>();
  const pq: { id: string; d: number }[] = [{ id: startId, d: 0 }];
  dist.set(startId, 0);
  via.set(startId, null);

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const cur = pq.shift()!;
    if (cur.d !== dist.get(cur.id)) continue;
    for (const n of neighbors(cur.id)) {
      const edgeCost = Math.max(100, Math.round(n.cost * (1 - discount)));
      const nd = cur.d + edgeCost;
      if (nd > budget) continue;
      if (nd < (dist.get(n.id) ?? Infinity)) {
        dist.set(n.id, nd);
        via.set(n.id, cur.id);
        pq.push({ id: n.id, d: nd });
      }
    }
  }

  const result = new Map<string, Reachable>();
  for (const [nodeId, cost] of dist) {
    if (nodeId === startId) continue;
    result.set(nodeId, { nodeId, cost, via: via.get(nodeId) ?? null });
  }
  return result;
}

export function edgeCostBetween(
  a: string,
  b: string,
  moveDiscount: number,
): number | null {
  const n = neighbors(a).find((x) => x.id === b);
  if (!n) return null;
  const discount = Math.min(0.5, Math.max(0, moveDiscount));
  return Math.max(100, Math.round(n.cost * (1 - discount)));
}
