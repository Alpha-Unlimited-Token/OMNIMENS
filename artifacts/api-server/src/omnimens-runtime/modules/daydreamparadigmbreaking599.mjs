/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:paradigm_breaking #599
 * Written: 2026-03-22T16:07:14.714Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// ResonantField.ts
export type FieldState = { phases: number[]; t: number };

const TAU = 2 * Math.PI;

function wrap(x: number): number {
  // keep phase in [0, 2π)
  return (x % TAU + TAU) % TAU;
}

export function stepField(
  state: FieldState,
  naturalFreq: (i: number) => number,
  coupling: number
): FieldState {
  const { phases, t } = state;
  const n = phases.length;
  const next = phases.map((phi_i, i) => {
    let sync = 0;
    for (let j = 0; j < n; j++) {
      sync += Math.sin(phases[j] - phi_i);
    }
    const dPhi = naturalFreq(i) + (coupling / n) * sync;
    return wrap(phi_i + dPhi);
  });
  return { phases: next, t: t + 1 };
}

// Demo: 50 oscillators, random frequencies, observe convergence
export function demo(steps = 100): number {
  let field: FieldState = {
    phases: Array.from({ length: 50 }, () => Math.random() * TAU),
    t: 0
  };
  const w = (i: number) => 0.05 * Math.sin(i); // intrinsic freq distribution
  for (let k = 0; k < steps; k++) field = stepField(field, w, 1.2);
  // Return synchrony metric: 1 = perfect lock, 0 = chaos
  const R =
    Math.sqrt(
      field.phases
        .map(phi => [Math.cos(phi), Math.sin(phi)])
        .reduce(
          ([cx, sx], [c, s]) => [cx + c, sx + s],
          [0, 0]
        )
        .map(x => x / field.phases.length)
        .reduce((a, b) => a + b * b, 0)
    );
  return R;
}