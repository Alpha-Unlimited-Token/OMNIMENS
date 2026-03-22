/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #825
 * Written: 2026-03-22T22:28:42.935Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export type Var = string;
export type Equation = (parents: Record<Var, number>) => number;

export class CausalNode {
  constructor(public name: Var, public parents: Var[], public eq: Equation) {}
  sample(state: Record<Var, number>) {
    const inp: Record<Var, number> = {};
    this.parents.forEach(p => (inp[p] = state[p]));
    state[this.name] = this.eq(inp);
  }
}

export class CausalGraph {
  nodes: CausalNode[] = [];
  add(node: CausalNode) { this.nodes.push(node); }
  roll(state: Record<Var, number>) {
    this.nodes.forEach(n => n.sample(state));
    return { ...state };
  }
}

export function blendGraphs(gs: CausalGraph[], w: number[]): CausalGraph {
  const g = new CausalGraph();
  gs[0].nodes.forEach((n, i) => {
    const eqs = gs.map(gx => gx.nodes[i].eq);
    g.add(
      new CausalNode(
        n.name,
        n.parents,
        (p) => eqs.reduce((s, f, k) => s + w[k] * f(p), 0)
      )
    );
  });
  return g;
}

export function simulate(
  graphs: CausalGraph[],
  weights: number[][],
  steps = 5
) {
  return weights.map(w => {
    const traj: Record<Var, number>[] = [];
    let state: Record<Var, number> = {};
    const g = blendGraphs(graphs, w);
    for (let t = 0; t < steps; t++) {
      state = g.roll(state);
      traj.push({ ...state });
    }
    return traj;
  });
}