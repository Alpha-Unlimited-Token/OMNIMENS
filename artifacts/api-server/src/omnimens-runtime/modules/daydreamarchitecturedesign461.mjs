/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #461
 * Written: 2026-03-22T10:42:42.541Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Causal mini-kernel (pure, no I/O)





// Forward propagate values through the causal graph
export function forward(model, evidence) {
  const value = { ...evidence };
  const topo = topologicalSort(model);
  for (const node of topo) {
    if (value[node] !== undefined) continue; // evidence overrides
    const p = {};
    for (const par of model.parents[node]) p[par] = value[par];
    value[node] = model.eqs[node](p);
  }
  return value;
}

// Perform an intervention do(X = v)
export function intervene(model, X, v, evidence = {}) {
  const newModel= {
    nodes: model.nodes,
    parents: { ...model.parents, [X]: [] }, // cut incoming edges
    eqs: { ...model.eqs, [X]: () => v }
  };
  return forward(newModel, evidence);
}

// Simple DAG topological sort
function topologicalSort(model) {
  const visited = new Set();
  const order= [];
  const visit = (n) => {
    if (visited.has(n)) return;
    visited.add(n);
    for (const p of model.parents[n] || []) visit(p);
    order.push(n);
  };
  model.nodes.forEach(visit);
  return order;
}