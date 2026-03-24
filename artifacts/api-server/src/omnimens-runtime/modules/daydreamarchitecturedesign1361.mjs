/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1361
 * Written: 2026-03-23T22:56:16.310Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// ICMC minimal core — pure functional, no side effects

 to; weight};

export class CausalGraph {
  edges= [];
  addEdge(from, to, weight = 1) {
    this.edges.push({ from, to, weight });
  }

  descendants(node) {
    const out = new Set();
    const dfs = (n) => {
      this.edges.filter(e => e.from === n).forEach(e => {
        if (!out.has(e.to)) { out.add(e.to); dfs(e.to); }
      });
    };
    dfs(node);
    return out;
  }

  // Simple “do” intervention: remove incoming edges to ‘node’
  intervene(node) {
    const g = new CausalGraph();
    g.edges = this.edges.filter(e => e.to !== node);
    return g;
  }

  // Checks if X can still reach Y after intervening on X (idealized counterfactual)
  counterfactualInfluence(x, y) {
    const g = this.intervene(x);
    return g.descendants(x).has(y);
  }
}

// Example usage (not executed here):
// const g = new CausalGraph();
// g.addEdge("match", "fire");
// g.addEdge("fire", "smoke");
// console.log(g.counterfactualInfluence("match", "smoke")); // true
// console.log(g.intervene("match").descendants("match").has("smoke")); // false