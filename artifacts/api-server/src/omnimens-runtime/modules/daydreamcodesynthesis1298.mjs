/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:code_synthesis #1298
 * Written: 2026-03-23T20:41:03.833Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Temporal Synaptic Weave — self-rewiring predictive memory
export function createTSW() {
  type Edge = { to; w};
  const data = new Map();
  const graph = new Map();     // dynamic synapses
  let lastKey| null = null;           // previous access
  const α = 0.3;                               // reinforcement rate
  const β = 0.97;                              // decay per tick

  function strengthen(from, to) {
    const edges = graph.get(from) || [];
    let edge = edges.find(e => e.to === to);
    if (!edge) { edge = { to, w: 0 }; edges.push(edge); graph.set(from, edges); }
    edge.w = Math.min(1, edge.w + α * (1 - edge.w)); // Hebbian style
  }

  function decay() {
    for (const edges of graph.values())
      for (let i = edges.length - 1; i >= 0; i--) {
        edges[i].w *= β;
        if (edges[i].w < 0.01) edges.splice(i, 1);   // prune weak links
      }
  }

  return {
    put(key, value) {
      data.set(key, value);
      if (lastKey) strengthen(lastKey, key);
      lastKey = key;
    },
    get(key): T | undefined {
      const val = data.get(key);
      if (lastKey) strengthen(lastKey, key);
      lastKey = key;
      return val;
    },
    predictNext(from, k = 3) {
      const edges = graph.get(from) || [];
      return edges
        .sort((a, b) => b.w - a.w)
        .slice(0, k)
        .map(e => e.to);
    },
    tick() { decay(); },              // call periodically to age the weave
    snapshot() { return { data, graph }; } // expose for inspection/analysis
  };
}