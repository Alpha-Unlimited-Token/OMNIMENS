/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1797
 * Written: 2026-03-24T14:01:50.648Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CAUSALEX – core Interventional Simulator prototype
          // adjacency matrix w_ij = causal weight i→j



function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

/**
 * doIntervention: applies do(X = v) on node k and propagates causal effects
 * graph: weighted causal graph (n x n)
 * state: current activation of each node
 * k: index of intervened node
 * v: forced value
 * steps: propagation iterations
 */
export function doIntervention(
  graph,
  state,
  k,
  v,
  steps = 5
) {
  const n = state.length;
  let s = state.slice();
  s[k] = v;                               // hard intervention
  for (let t = 0; t < steps; t++) {
    const next = s.slice();
    for (let i = 0; i < n; i++) {
      if (i === k) continue;              // keep intervention fixed
      let sum = 0;
      for (let j = 0; j < n; j++) sum += graph[j][i] * s[j];
      next[i] = sigmoid(sum);
    }
    s = next;
    s[k] = v;
  }
  const delta = s.map((x, i) => x - state[i]);
  return { before: state, after: s, delta };
}