/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #741
 * Written: 2026-03-22T19:54:45.701Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

type Func = (parents: number[]) => number;

interface Node {
  name: string;
  parents: string[];
  func: Func;          // causal mechanism g_i
}

export class SCM {
  private nodes: Record<string, Node> = {};
  private values: Record<string, number> = {};

  addNode(node: Node) {
    this.nodes[node.name] = node;
  }

  observe(varName: string, value: number) {
    this.values[varName] = value;
  }

  private topological(): string[] {
    const visited = new Set<string>(), order: string[] = [];
    const visit = (n: string) => {
      if (!visited.has(n)) {
        visited.add(n);
        for (const p of this.nodes[n].parents) visit(p);
        order.push(n);
      }
    };
    Object.keys(this.nodes).forEach(visit);
    return order;
  }

  private forward() {
    for (const n of this.topological())
      if (!(n in this.values))
        this.values[n] = this.nodes[n].func(this.nodes[n].parents.map(p => this.values[p]));
  }

  query(target: string, intervention?: { varName: string; value: number }): number {
    const backup = { ...this.values };
    if (intervention) this.values[intervention.varName] = intervention.value;
    this.forward();
    const result = this.values[target];
    this.values = backup; // restore factual world
    return result;
  }
}