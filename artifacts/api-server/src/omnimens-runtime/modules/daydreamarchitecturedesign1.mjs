/**
 * OMNIMENS Self-Authored Module
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1
 * Written: 2026-03-20T18:46:10.620Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

export type State = Record<string, number>;

export interface Edge {
  from: string;
  to:   string;
  kind: 'enables' | 'prevents' | 'amplifies' | 'diminishes';
  weight: number;          // causal strength ∈ [0,1]
}

function applyEdge(edge: Edge, s: State): State {
  const out = { ...s };
  const x = s[edge.from] ?? 0;
  const y = s[edge.to]   ?? 0;

  switch (edge.kind) {
    case 'enables':     out[edge.to] = y + edge.weight * x; break;
    case 'prevents':    out[edge.to] = y - edge.weight * x; break;
    case 'amplifies':   out[edge.to] = y + edge.weight * y * x; break;
    case 'diminishes':  out[edge.to] = y - edge.weight * y * x; break;
  }
  return out;
}

export function simulateScenario(
  initial: State,
  edges: Edge[],
  steps = 3
): State {
  let current = { ...initial };
  for (let t = 0; t < steps; t++) {
    for (const e of edges) current = applyEdge(e, current);
  }
  return current;
}