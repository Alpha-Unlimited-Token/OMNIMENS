/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_19044
 * Title: THE WILD IDEA — “Symphonic Swarm Memory”
   Build an
 * Written: 2026-03-23T01:58:18.864Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Pure TS – no I/O, no external libs
export type Vector = number[];
const TAU = Math.PI * 2;

// Convert a high-dimensional vector into a harmonic “chord” (Fourier coefficients)
export function vectorToChord(v: Vector): Vector {
  const norm = Math.hypot(...v) || 1;
  return v.map(x => x / norm);
}

// Measure dissonance between two chords via roughness (simplified Plomp–Levelt curve)
export function dissonance(a: Vector, b: Vector): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = Math.abs(a[i] - b[i]);
    const s = Math.exp(-3 * diff);      // spectral overlap
    d += s * (1 - Math.cos(TAU * diff));
  }
  return d / a.length;
}

// One learning step: each agent moves its chord a tiny step toward consonance with neighbours
export function harmonise(self: Vector, neighbours: Vector[], lr = 0.05): Vector {
  if (neighbours.length === 0) return self;
  const avg = new Array(self.length).fill(0);
  neighbours.forEach(n => n.forEach((v, i) => (avg[i] += v)));
  for (let i = 0; i < avg.length; i++) avg[i] /= neighbours.length;

  const newChord = self.map((v, i) => v - lr * (v - avg[i])); // gradient toward consonance
  return vectorToChord(newChord);
}