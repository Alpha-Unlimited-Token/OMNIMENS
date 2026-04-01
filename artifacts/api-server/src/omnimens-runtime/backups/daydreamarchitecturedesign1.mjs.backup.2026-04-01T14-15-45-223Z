/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1
 * Written: 2026-04-01T11:49:25.787Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */


   // P(to|from)


export class CausalGraph {
  edges= [];
  addTriple(t) {
    this.edges.push({ from: t.cause, to: t.effect, prob: t.confidence });
  }
  children(n) { return this.edges.filter(e => e.from === n); }
  // Forward propagation for P(target | do(intervention=setTrue))
  do(intervention, target) {
    const visited = new Set();
    const recurse = (n) => {
      if (n === intervention) return 1;         // forced true
      if (visited.has(n))  return 0;
      visited.add(n);
      const ch = this.children(n);
      if (ch.length === 0) return 0;
      return 1 - ch.reduce((p, e) => p * (1 - e.prob * recurse(e.to)), 1);
    };
    return recurse(target);
  }
  // Simple counterfactual: P(target changes | do(intervention))
  counterfactual(intervention, target) {
    const p_before = this.do("", target);              // no intervention
    const p_after  = this.do(intervention, target);
    return Math.abs(p_after - p_before);
  }
}