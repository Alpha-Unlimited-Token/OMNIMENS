/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_14824
 * Title: BROKEN PARADIGM  
   Intelligence = “step-by-step sy
 * Written: 2026-03-23T00:17:17.096Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Field-Resonance Cognition: minimal resonator
export type Vec = number[];
const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);

export function trainResonator(patterns: Vec[]): number[][] {
  const n = patterns[0].length;
  // Hebbian-like symmetric coupling matrix
  const W: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (const p of patterns) {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        W[i][j] += p[i] * p[j];
  }
  // zero out self-coupling
  for (let i = 0; i < n; i++) W[i][i] = 0;
  return W;
}

export function resonate(
  query: Vec,
  W: number[][],
  steps = 10,
  beta = 1
): Vec {
  let state = [...query]; // initial field
  const n = state.length;
  for (let t = 0; t < steps; t++) {
    const next = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      // field influence = weighted sum, squashed by tanh (oscillatory proxy)
      const influence = dot(W[i], state);
      next[i] = Math.tanh(beta * influence);
    }
    state = next;
  }
  return state; // final resonant mode (closest stored pattern)
}