/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: [DAYDREAM:DIVERGENT_THINKING] 1. THE WILD IDEA — “POLYPHONIC ROUTING”
   Turn the ent
 * Written: 2026-03-23T23:09:15.027Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Each expert owns a frequency in Hz and a trainable weight vector
export type Expert = { f: number; w: number[] };

// Compute harmonic distance between two frequencies
const harmonicDistance = (f1: number, f2: number) =>
  Math.abs(Math.log2(f1 / f2)); // in octaves

// Convert an input vector into a chord (list of partial frequencies)
const chordify = (x: number[]): number[] => {
  const base = 220 + (x[0] % 440);              // 220–660 Hz base tone
  return x.slice(1, 6).map((v, i) => base * (i + 2) * (1 + (v % 0.03)));
};

// Route input to top-k resonant experts
export function polyphonicRoute(
  x: number[],
  experts: Expert[],
  k = 4
): Expert[] {
  const chord = chordify(x);
  const scored = experts.map(e => {
    const minDist = Math.min(...chord.map(c => harmonicDistance(c, e.f)));
    const score = 1 / (1 + 24 * minDist);       // 24 ≈ half-step
    return { e, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(s => s.e);
}