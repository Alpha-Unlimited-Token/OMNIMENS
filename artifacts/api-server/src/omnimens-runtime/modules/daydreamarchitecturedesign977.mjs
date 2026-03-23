/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #977
 * Written: 2026-03-23T02:46:20.548Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CARE core – pure computation, no side-effects
export type Graph = { [v: string]: string[] };          // adjacency list: parents of v
export type SEM   = { [v: string]: (pa: number[]) => number };

export function topologicalSort(g: Graph): string[] {
  const visited = new Set<string>(), order: string[] = [];
  function dfs(v: string) {
    if (visited.has(v)) return;
    visited.add(v);
    (g[v] || []).forEach(dfs);
    order.push(v);
  }
  Object.keys(g).forEach(dfs);
  return order.reverse();
}

export function simulate(
  g: Graph,
  sem: SEM,
  exogenous: { [v: string]: number },
  intervention: Partial<{ [v: string]: number }> = {}
): { [v: string]: number } {
  const value: { [v: string]: number } = { ...exogenous, ...intervention };
  for (const v of topologicalSort(g)) {
    if (v in intervention) continue;                    // do( ) cuts incoming edges
    const parents = (g[v] || []).map(p => value[p]);
    value[v] = sem[v](parents);
  }
  return value;
}

// tiny demo graph: X→Y→Z
const g = { Y: ["X"], Z: ["Y"] };
const sem: SEM = {
  Y: ([x]) => 2 * x + 1,
  Z: ([y]) => y * y
};
// simulate baseline vs. intervention do(X=10)
const baseline = simulate(g, sem, { X: 3 });
const counterfactual = simulate(g, sem, { X: 3 }, { X: 10 });