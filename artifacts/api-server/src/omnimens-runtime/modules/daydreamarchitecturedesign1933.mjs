/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1933
 * Written: 2026-03-24T23:54:05.164Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// core_RSDE.ts



export function tanh(v) {
  return v.map(x => Math.tanh(x));
}

export function matVecMul(m, v) {
  return m.map(row => row.reduce((s, x, i) => s + x * v[i], 0));
}



/**
 * Advance reservoir one step and return new state.
 * Pure, side-effect-free.
 */
export function stepReservoir(
  res,
  input) {
  const preActivation = matVecMul(res.W, res.state)
      .map((x, i) => x + matVecMul(res.W_in, input)[i]);
  const updated = tanh(preActivation);
  // leaky integration
  const newState = updated.map((x, i) => (1 - res.leak) * res.state[i] + res.leak * x);
  return newState;
}

// Simple online centroid update (1 prototype shown)
export function updateCentroid(
  centroid,
  sample,
  lr = 0.05
) {
  return centroid.map((c, i) => c + lr * (sample[i] - c));
}