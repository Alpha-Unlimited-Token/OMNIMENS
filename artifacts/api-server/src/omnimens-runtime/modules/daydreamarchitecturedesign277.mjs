/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #277
 * Written: 2026-03-22T05:13:28.089Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/* CS2 core – pure, side-effect-free */
export type Relation = 'causes' | 'is_a' | 'part_of' | 'before';
export interface Edge { from: string; to: string; rel: Relation; weight: number; }
export interface Graph { nodes: Set<string>; edges: Edge[]; }

export function addEdge(g: Graph, e: Edge): Graph {
  if (!g.nodes.has(e.from)) g.nodes.add(e.from);
  if (!g.nodes.has(e.to)) g.nodes.add(e.to);
  return { nodes: g.nodes, edges: [...g.edges, e] };
}

export function propagate(g: Graph, seed: string, steps = 2): Map<string, number> {
  const scores = new Map<string, number>([[seed, 1]]);
  for (let s = 0; s < steps; s++) {
    const next = new Map<string, number>();
    for (const { from, to, weight } of g.edges) {
      const val = scores.get(from);
      if (val) next.set(to, (next.get(to) || 0) + val * weight);
    }
    for (const [k, v] of next) scores.set(k, Math.min(1, (scores.get(k) || 0) + v));
  }
  return scores;
}

export function divergenceScore(
  predicted: Map<string, number>,
  observedTokens: string[]
): number {
  let div = 0;
  for (const [concept, pScore] of predicted) {
    const o = observedTokens.includes(concept) ? 1 : 0;
    div += Math.abs(pScore - o);
  }
  return div / predicted.size;
}

/* Example usage */
const g: Graph = { nodes: new Set(), edges: [] };
addEdge(g, { from: 'ice', to: 'water', rel: 'before', weight: 0.9 });
const pred = propagate(g, 'ice');
const div = divergenceScore(pred, ['water']);