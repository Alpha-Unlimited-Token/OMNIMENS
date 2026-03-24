/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1337
 * Written: 2026-03-23T22:21:13.478Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CISE-mini: core causal propagation (no external deps, 32 lines)
export type Vec = number[];
export interface Node { id: string; state: Vec; }
export interface Edge {
  from: string; to: string;
  J: number[][];                // influence matrix
}
export class CISE {
  nodes: Map<string, Node> = new Map();
  edges: Edge[] = [];

  addNode(id: string, state: Vec) { this.nodes.set(id, { id, state }); }
  addEdge(e: Edge) { this.edges.push(e); }

  // single forward step
  propagate(deltaSource: Map<string, Vec>): Map<string, Vec> {
    const deltaTarget = new Map<string, Vec>();
    for (const e of this.edges) {
      const dS = deltaSource.get(e.from);
      if (!dS) continue;
      const matMul = (M: number[][], v: Vec): Vec =>
        M.map(row => row.reduce((s, x, i) => s + x * v[i], 0));
      const dT = matMul(e.J, dS);
      const prev = deltaTarget.get(e.to) || Array(dT.length).fill(0);
      deltaTarget.set(e.to, prev.map((x, i) => x + dT[i]));
    }
    // update node states
    for (const [id, d] of deltaTarget) {
      const n = this.nodes.get(id);
      if (n) n.state = n.state.map((x, i) => x + d[i]);
    }
    return deltaTarget;
  }

  simulate(actionNode: string, actionDelta: Vec, steps = 3): void {
    let frontier = new Map<string, Vec>([[actionNode, actionDelta]]);
    for (let i = 0; i < steps; i++) frontier = this.propagate(frontier);
  }
}