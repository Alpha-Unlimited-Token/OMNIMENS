/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_17187
 * Title: ARCHITECTURE NAME  
   CAGS – Causal-Analytic Genera
 * Written: 2026-03-22T23:54:01.485Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CAGS core micro-simulator (pure, no IO)
export type Node = { id: string; state: Record<string, number> }; // numerical attributes
export type Edge = {
  from: string;
  to: string;
  // deterministic causal rule: mutate target based on source
  update: (src: Node, dst: Node) => void;
};

export interface CausalGraph {
  nodes: Map<string, Node>;
  edges: Edge[];
}

export function stepGraph(g: CausalGraph): CausalGraph {
  // deep-clone nodes to avoid side-effects
  const nextNodes = new Map<string, Node>();
  g.nodes.forEach((n, id) =>
    nextNodes.set(id, { id, state: { ...n.state } })
  );
  // apply edges
  g.edges.forEach((e) => {
    const src = nextNodes.get(e.from)!;
    const dst = nextNodes.get(e.to)!;
    e.update(src, dst);
  });
  return { nodes: nextNodes, edges: g.edges };
}

// run k steps and return trajectory
export function simulate(
  g0: CausalGraph,
  steps: number
): CausalGraph[] {
  const history: CausalGraph[] = [g0];
  let current = g0;
  for (let i = 0; i < steps; i++) {
    current = stepGraph(current);
    history.push(current);
  }
  return history;
}