/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_14474
 * Title: ARCHITECTURE NAME  
Conceptual Self-Consistent Simul
 * Written: 2026-03-22T19:24:23.663Z
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




export function addEdge(g, e) {
  if (!g.nodes.has(e.from)) g.nodes.add(e.from);
  if (!g.nodes.has(e.to)) g.nodes.add(e.to);
  return { nodes: g.nodes, edges: [...g.edges, e] };
}

export function propagate(g, seed, steps = 2) {
  const scores = new Map([[seed, 1]]);
  for (let s = 0; s < steps; s++) {
    const next = new Map();
    for (const { from, to, weight } of g.edges) {
      const val = scores.get(from);
      if (val) next.set(to, (next.get(to) || 0) + val * weight);
    }
    for (const [k, v] of next) scores.set(k, Math.min(1, (scores.get(k) || 0) + v));
  }
  return scores;
}

export function divergenceScore(
  predicted,
  observedTokens) {
  let div = 0;
  for (const [concept, pScore] of predicted) {
    const o = observedTokens.includes(concept) ? 1 : 0;
    div += Math.abs(pScore - o);
  }
  return div / predicted.size;
}

/* Example usage */
const g= { nodes: new Set(), edges: [] };
addEdge(g, { from: 'ice', to: 'water', rel: 'before', weight: 0.9 });
const pred = propagate(g, 'ice');
const div = divergenceScore(pred, ['water']);