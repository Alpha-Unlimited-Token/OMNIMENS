/**
 * OMNIMENS Self-Authored Module
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1
 * Written: 2026-03-20T16:32:53.245Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

// Causal Simulation Fabric – minimal core
export type Vec = number[];
export interface SCU {
  cause: Vec;       // concatenated cause variables
  effect: Vec;      // concatenated effect variables
  w: number;        // causal strength
  ctx: Vec;         // context embedding
}

export function cosine(a: Vec, b: Vec): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export function assembleDCG(scus: SCU[], queryCtx: Vec, k = 20): SCU[] {
  // retrieve k most context-similar SCUs
  return scus
    .map(scu => [scu, cosine(scu.ctx, queryCtx)] as [SCU, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(pair => pair[0]);
}

export function simulate(scus: SCU[], initState: Vec, steps = 5): Vec {
  let state = [...initState];
  for (let t = 0; t < steps; t++) {
    for (const { cause, effect, w } of scus) {
      // simple linear causal influence
      const activation = cosine(cause, state);
      for (let i = 0; i < effect.length; i++)
        state[i] += w * activation * effect[i];
    }
  }
  return state;
}