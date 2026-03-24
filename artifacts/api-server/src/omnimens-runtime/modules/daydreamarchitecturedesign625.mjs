/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #625
 * Written: 2026-03-22T16:45:23.121Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Counterfactual Simulation Core – minimal skeleton




export class CausalGraph {
  nodes= new Map();

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  setEvidence(id, val) {
    const n = this.nodes.get(id);
    if (n) n.value = val;
  }

  // Pearl's do-operator: override structural function of target
  intervene(id, forcedValue) {
    const n = this.nodes.get(id);
    if (n) {
      n.func = () => forcedValue;
      n.value = forcedValue;
    }
  }

  // Topologically propagate values
  propagate() {
    const visited = new Set();
    const visit = (id) => {
      if (visited.has(id)) return;
      const n = this.nodes.get(id);
      if (!n) return;
      n.parents.forEach(visit);
      const inputs = n.parents.map(p => this.nodes.get(p)?.value ?? 0);
      if (inputs.length) n.value = n.func(inputs);
      visited.add(id);
    };
    this.nodes.forEach((_v, id) => visit(id));
  }

  query(id): number | undefined {
    return this.nodes.get(id)?.value;
  }
}