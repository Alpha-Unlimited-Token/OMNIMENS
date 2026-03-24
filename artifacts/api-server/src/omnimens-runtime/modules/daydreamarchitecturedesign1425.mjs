/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1425
 * Written: 2026-03-24T02:26:59.206Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// counterfactual-causal-reasoner.ts
export type Node = string;
export type Edge = { from: Node; to: Node; weight: number }; // + causes, – inhibits
export type SCM = { nodes: Node[]; edges: Edge[] };

const topologicalSort = (g: SCM): Node[] => {
  const visited: Record<Node, boolean> = {};
  const order: Node[] = [];
  const dfs = (n: Node) => {
    if (visited[n]) return;
    visited[n] = true;
    g.edges.filter(e => e.from === n).forEach(e => dfs(e.to));
    order.push(n);
  };
  g.nodes.forEach(dfs);
  return order.reverse();
};

const propagate = (g: SCM, state: Record<Node, number>): Record<Node, number> => {
  const out = { ...state };
  topologicalSort(g).forEach(n => {
    g.edges.filter(e => e.from === n).forEach(e => {
      out[e.to] = (out[e.to] ?? 0) + out[n] * e.weight;
    });
  });
  return out;
};

export const counterfactualEffect = (
  g: SCM,
  factual: Record<Node, number>,
  intervention: Record<Node, number>
) => {
  const factualResult = propagate(g, factual);
  const cfState = { ...factual, ...intervention }; // do(X=x)
  const counterResult = propagate(g, cfState);
  const delta: Record<Node, number> = {};
  Object.keys(factualResult).forEach(n => {
    delta[n] = (counterResult[n] ?? 0) - (factualResult[n] ?? 0);
  });
  return { factualResult, counterResult, delta };
};