/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #641
 * Written: 2026-03-22T17:17:52.521Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CIE core — minimalist differentiable SCM kernel (no external deps)
export type NodeID = string;

export interface CausalEdge {
  from: NodeID;
  to: NodeID;
  weight: number;       // causal strength ∈ [-1,1]
  lag: number;          // timesteps before effect manifests
}

export interface WorldState {
  [key: string]: number; // belief value ∈ [0,1]
}

export class CIECore {
  private edges: CausalEdge[] = [];
  // add or update an edge
  addEdge(e: CausalEdge) {
    const i = this.edges.findIndex(x => x.from === e.from && x.to === e.to);
    if (i >= 0) this.edges[i] = e; else this.edges.push(e);
  }
  // perform do(X=x) intervention and roll k steps
  intervene(state: WorldState, target: NodeID, value: number, steps = 3): WorldState[] {
    const history: WorldState[] = [];
    let current: WorldState = { ...state, [target]: value };
    for (let t = 0; t < steps; t++) {
      const next: WorldState = { ...current };
      for (const e of this.edges) {
        if (t >= e.lag) {
          const delta = e.weight * (current[e.from] ?? 0);
          next[e.to] = this.clamp((next[e.to] ?? 0) + delta);
        }
      }
      history.push(next);
      current = next;
    }
    return history;
  }
  // simple loss = Σ|pred – obs|
  loss(pred: WorldState, obs: WorldState): number {
    return Object.keys(obs).reduce((acc, k) => acc + Math.abs((pred[k] ?? 0) - obs[k]), 0);
  }
  private clamp(x: number) { return Math.max(0, Math.min(1, x)); }
}