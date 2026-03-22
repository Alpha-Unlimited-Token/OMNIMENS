/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #248
 * Written: 2026-03-22T04:26:16.596Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// No external deps, pure computation, 24 LOC
type Vec = number[];
type Edge = [number, number];          // indices of connected notes
type Lattice = { pos: Vec[]; edges: Edge[] };

export function harmonicSpinStep(
  lat: Lattice,
  freqs: number[],                   // current frequencies (Hz) per node
  lr = 0.05
): number[] {
  const ratio = (a: number, b: number) => a / b;
  const consonanceError = (r: number) => {
    const ratios = [1, 5 / 4, 4 / 3, 3 / 2, 2]; // unison, M3, P4, P5, octave
    let min = Infinity;
    for (const ideal of ratios) min = Math.min(min, Math.abs(Math.log(r / ideal)));
    return min;                             // lower is more consonant
  };

  const grad = new Array(freqs.length).fill(0);
  for (const [i, j] of lat.edges) {
    const r = ratio(freqs[i], freqs[j]);
    const e = consonanceError(r);
    const dir = Math.sign(Math.log(r) - Math.log(1)); // push toward unison
    grad[i] += dir * e;
    grad[j] -= dir * e;
  }

  return freqs.map((f, k) => f * Math.exp(-lr * grad[k])); // update via exponent
}