/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_15694
 * Title: ARCHITECTURE NAME  
   CAUSEWAY – Counterfactual Abd
 * Written: 2026-03-22T20:01:58.320Z
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
export type NodeId = string;
export type Equation = (parents: Record<NodeId, number>) => number;

export interface SCM {
  nodes: NodeId[];
  parents: Record<NodeId, NodeId[]>;
  eqs: Record<NodeId, Equation>;
}

// Forward propagate values through the causal graph
export function forward(model: SCM, evidence: Record<NodeId, number>): Record<NodeId, number> {
  const value: Record<NodeId, number> = { ...evidence };
  const topo = topologicalSort(model);
  for (const node of topo) {
    if (value[node] !== undefined) continue; // evidence overrides
    const p: Record<NodeId, number> = {};
    for (const par of model.parents[node]) p[par] = value[par];
    value[node] = model.eqs[node](p);
  }
  return value;
}

// Perform an intervention do(X = v)
export function intervene(model: SCM, X: NodeId, v: number, evidence: Record<NodeId, number> = {}) {
  const newModel: SCM = {
    nodes: model.nodes,
    parents: { ...model.parents, [X]: [] }, // cut incoming edges
    eqs: { ...model.eqs, [X]: () => v }
  };
  return forward(newModel, evidence);
}

// Simple DAG topological sort
function topologicalSort(model: SCM): NodeId[] {
  const visited = new Set<NodeId>();
  const order: NodeId[] = [];
  const visit = (n: NodeId) => {
    if (visited.has(n)) return;
    visited.add(n);
    for (const p of model.parents[n] || []) visit(p);
    order.push(n);
  };
  model.nodes.forEach(visit);
  return order;
}