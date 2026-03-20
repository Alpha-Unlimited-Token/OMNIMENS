/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1
 * Written: 2026-03-20T22:02:34.427Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// OmniCausal Sandbox – minimal pure-TS prototype (no I/O, no deps)
export type Vector = number[];
export type Node = { id: string; state: Vector };
export type Edge = { from: string; to: string;
                     fn: (x: Vector) => Vector }; // structural eq.

export interface CausalGraph {
  nodes: Record<string, Node>;
  edges: Edge[];
}

/**
 * Propagate causes through the graph once.
 * No side-effects; returns a new graph instance.
 */
export function propagate(graph: CausalGraph): CausalGraph {
  const nextNodes: Record<string, Node> = {};
  // deep copy current states
  Object.values(graph.nodes).forEach(n => nextNodes[n.id] = { ...n, state: [...n.state] });

  for (const e of graph.edges) {
    const src = graph.nodes[e.from];
    const dst = nextNodes[e.to];
    const delta = e.fn(src.state);        // causal influence
    dst.state = dst.state.map((v, i) => v + delta[i]); // linear comb.
  }
  return { nodes: nextNodes, edges: graph.edges };
}

/**
 * Apply an intervention do(nodeId = value) and propagate N steps.
 */
export function counterfactual(
  graph: CausalGraph,
  nodeId: string,
  value: Vector,
  steps = 3
): CausalGraph {
  let g: CausalGraph = {
    nodes: { ...graph.nodes, [nodeId]: { id: nodeId, state: [...value] } },
    edges: graph.edges
  };
  for (let i = 0; i < steps; i++) g = propagate(g);
  return g;
}