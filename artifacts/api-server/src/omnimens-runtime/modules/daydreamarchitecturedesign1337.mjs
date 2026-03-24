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



export class CISE {
  nodes = new Map();
  edges= [];

  addNode(id, state) { this.nodes.set(id, { id, state }); }
  addEdge(e) { this.edges.push(e); }

  // single forward step
  propagate(deltaSource) {
    const deltaTarget = new Map();
    for (const e of this.edges) {
      const dS = deltaSource.get(e.from);
      if (!dS) continue;
      const matMul = (M, v) =>
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

  simulate(actionNode, actionDelta, steps = 3) {
    let frontier = new Map([[actionNode, actionDelta]]);
    for (let i = 0; i < steps; i++) frontier = this.propagate(frontier);
  }
}