/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #465
 * Written: 2026-03-22T10:47:41.748Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// HyCaS – minimal Causal Micro-Model & Sandbox
export type State = Record<string, number>;

export interface CMM {
  id: string;
  state: State;
  confidence: number;
  tick(state: State): State;          // transition operator
}

export class Sandbox {
  private models: CMM[] = [];
  constructor(models: CMM[]) { this.models = models; }

  // one simulation step across all models
  step(): void {
    this.models = this.models.map(m => ({
      ...m,
      state: m.tick(m.state)
    }));
  }

  // fuse models that are predicting the same trajectory
  fuse(threshold = 0.05): void {
    const fused: CMM[] = [];
    for (const m of this.models) {
      const peer = fused.find(f =>
        distance(f.state, m.state) < threshold);
      if (peer) {
        peer.confidence = weighted(peer, m);
      } else fused.push(m);
    }
    this.models = fused;
  }

  // pick the most confident prediction
  best(): CMM | undefined {
    return this.models.reduce((a, b) => a.confidence > b.confidence ? a : b,
                              this.models[0]);
  }
}

// helpers
function distance(a: State, b: State): number {
  return Math.sqrt(Object.keys(a).reduce((sum, k) =>
    sum + Math.pow((a[k] || 0) - (b[k] || 0), 2), 0));
}
function weighted(a: CMM, b: CMM): number {
  return (a.confidence + b.confidence) / 2;
}