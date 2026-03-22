/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #200
 * Written: 2026-03-22T03:16:06.319Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export type Wave = { f: number; p: number; a: number }; // frequency, phase, amplitude

// Simple cosine similarity for waves in complex plane
function waveDot(w1: Wave, w2: Wave): number {
  const re1 = w1.a * Math.cos(w1.p);
  const im1 = w1.a * Math.sin(w1.p);
  const re2 = w2.a * Math.cos(w2.p);
  const im2 = w2.a * Math.sin(w2.p);
  return re1 * re2 + im1 * im2; // inner product of phasors
}

export function resonate(query: Wave, memory: Wave[]): number {
  // Compute interference score: sum of dot products weighted by frequency proximity
  let bestIdx = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < memory.length; i++) {
    const m = memory[i];
    const freqAffinity = 1 / (1 + Math.abs(m.f - query.f)); // closer freq → stronger
    const phaseAffinity = waveDot(query, m);                 // phase alignment
    const score = freqAffinity * phaseAffinity;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx; // index of most resonant concept
}