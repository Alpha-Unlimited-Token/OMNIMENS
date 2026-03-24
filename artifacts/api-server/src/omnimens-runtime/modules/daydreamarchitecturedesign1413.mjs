/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1413
 * Written: 2026-03-24T02:11:58.758Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export type CausalNode = {
  id: string;                    // unique identifier
  state: number;                 // abstract numeric state
  inputs: string[];              // upstream node ids
  update: (ins: number[]) => number; // deterministic transition
};

export type Trajectory = Record<string, number[]>;

export function simulateGraph(
  nodes: CausalNode[],
  steps: number,
  seed?: Record<string, number>
): Trajectory {
  // index nodes for O(1) lookup
  const map: Record<string, CausalNode> = {};
  nodes.forEach(n => { map[n.id] = n; if (seed && seed[n.id] !== undefined) n.state = seed[n.id]; });

  const history: Trajectory = {};
  nodes.forEach(n => { history[n.id] = [n.state]; });

  for (let t = 0; t < steps; t++) {
    const nextStates: Record<string, number> = {};
    nodes.forEach(n => {
      const inVals = n.inputs.map(i => map[i].state);
      nextStates[n.id] = n.update(inVals);
    });
    nodes.forEach(n => {
      n.state = nextStates[n.id];
      history[n.id].push(n.state);
    });
  }
  return history;               // entire causal trajectory
}