/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:architecture_design #61
 */

export class CausalMultiverse {
  constructor(spec) { this.spec = spec; }

  topological() {
    const order = [];
    const visited = new Set();
    const visit = (n) => {
      if (visited.has(n)) return;
      (this.spec.parents[n] || []).forEach(visit);
      visited.add(n); order.push(n);
    };
    Object.keys(this.spec.parents).forEach(visit);
    return order;
  }

  sample(ctx = {}) {
    const world = { ...ctx };
    const topo = this.topological();
    for (const v of topo) {
      if (world[v] !== undefined) continue;
      const p = {};
      (this.spec.parents[v] || []).forEach(k => { p[k] = world[k]; });
      world[v] = this.spec.fns[v](p, Math.random());
    }
    return world;
  }

  counterfactual(queryVar, baseCtx, xStar, N = 1000) {
    let baseSum = 0, altSum = 0;
    for (let i = 0; i < N; i++) {
      const w0 = this.sample(baseCtx);
      const w1 = this.sample({ ...w0, [queryVar]: xStar });
      baseSum += w0[queryVar];
      altSum += w1[queryVar];
    }
    return { ATE: (altSum - baseSum) / N };
  }
}
