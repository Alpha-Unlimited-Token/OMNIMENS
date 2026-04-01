/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:architecture_design #1
 */

export function propagate(graph) {
  const nextNodes = {};
  Object.values(graph.nodes).forEach(n => { nextNodes[n.id] = { ...n, state: [...n.state] }; });
  for (const e of graph.edges) {
    const src = graph.nodes[e.from];
    const dst = nextNodes[e.to];
    const delta = e.fn(src.state);
    dst.state = dst.state.map((v, i) => v + delta[i]);
  }
  return { nodes: nextNodes, edges: graph.edges };
}

export function counterfactual(graph, nodeId, value, steps = 3) {
  const nodes = {};
  Object.entries(graph.nodes).forEach(([k, v]) => { nodes[k] = { ...v, state: [...v.state] }; });
  nodes[nodeId] = { ...nodes[nodeId], state: Array.isArray(value) ? value : [value] };
  let g = { nodes, edges: graph.edges };
  for (let i = 0; i < steps; i++) g = propagate(g);
  return g;
}
