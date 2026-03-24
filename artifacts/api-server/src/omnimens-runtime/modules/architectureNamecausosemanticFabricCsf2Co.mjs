/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_16878
 * Title: ARCHITECTURE NAME
Causo-Semantic Fabric (CSF)

2. CO
 * Written: 2026-03-22T22:30:55.250Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// ---------- Causo-Semantic Fabric core skeleton ----------







export class CausalGraph {
  edges = new Map();

  // ingest one semantic triple
  add(t) {
    const list = this.edges.get(t.cause) ?? [];
    list.push({
      to: t.effect,
      relation: t.relation,
      confidence: t.confidence,
      time: t.time,
    });
    this.edges.set(t.cause, list);
  }

  // simple counterfactual: remove node n and propagate
  counterfactual(n, depth = 2, visited= new Set()) {
    if (depth === 0 || visited.has(n)) return [];
    visited.add(n);
    const affected= [];
    for (const [src, outs] of this.edges) {
      outs.forEach(e => {
        if (e.to === n && e.confidence > 0.5) {
          affected.push(src, ...this.counterfactual(src, depth - 1, visited));
        }
      });
    }
    return affected;
  }
}