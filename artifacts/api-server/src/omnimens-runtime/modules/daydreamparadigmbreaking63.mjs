/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:paradigm_breaking #63
 * Written: 2026-03-21T03:48:05.986Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Resonant Field update: vectors that are mutually similar pull each other
export function resonateField(
  vectors: number[][],   // arbitrary dimension, already L2-normalised
  steps = 10,
  similarityThreshold = 0.7
): number[][] {
  const dot = (a: number[], b: number[]) =>
    a.reduce((s, v, i) => s + v * b[i], 0);
  const add = (a: number[], b: number[], w: number) =>
    a.map((v, i) => v + w * b[i]);
  const norm = (v: number[]) => {
    const n = Math.hypot(...v) || 1;
    return v.map(x => x / n);
  };

  let field = vectors.map(v => [...v]); // copy
  for (let t = 0; t < steps; t++) {
    const next = field.map(v => v.slice());
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field.length; j++) {
        if (i === j) continue;
        const sim = dot(field[i], field[j]);
        if (sim > similarityThreshold) {
          // resonance: mutually amplify shared direction
          next[i] = add(next[i], field[j], sim);
        }
      }
      next[i] = norm(next[i]); // keep on unit sphere
    }
    field = next;
  }
  return field;
}