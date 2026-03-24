/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_17884
 * Title: ARCHITECTURE NAME  
   ICARE – Iterative Counterfact
 * Written: 2026-03-22T22:44:04.817Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */





export class SCM {
  nodes = {};
  values = {};

  addNode(node) {
    this.nodes[node.name] = node;
  }

  observe(varName, value) {
    this.values[varName] = value;
  }

  topological() {
    const visited = new Set(), order= [];
    const visit = (n) => {
      if (!visited.has(n)) {
        visited.add(n);
        for (const p of this.nodes[n].parents) visit(p);
        order.push(n);
      }
    };
    Object.keys(this.nodes).forEach(visit);
    return order;
  }

  forward() {
    for (const n of this.topological())
      if (!(n in this.values))
        this.values[n] = this.nodes[n].func(this.nodes[n].parents.map(p => this.values[p]));
  }

  query(target, intervention?: { varName; value}) {
    const backup = { ...this.values };
    if (intervention) this.values[intervention.varName] = intervention.value;
    this.forward();
    const result = this.values[target];
    this.values = backup; // restore factual world
    return result;
  }
}