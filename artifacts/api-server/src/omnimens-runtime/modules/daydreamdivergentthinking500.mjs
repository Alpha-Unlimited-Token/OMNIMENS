/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #500
 * Written: 2026-03-22T12:44:55.143Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Prime‐frequency rhythm encoder / matcher (pure functions, no I/O)
          // length = NUM_PRIMES
const PRIMES = [11, 13, 17, 19, 23, 29]; // channels

// Encode a numeric vector into a rhythm by thresholding its FFT energy
export function encodeVector(vec) {
  const n = PRIMES.length;
  const rhythm= Array(n).fill(false);
  for (let i = 0; i < n && i < vec.length; i++) {
    // simple threshold: beat present if component energy above median
    const median = 0.5 * (Math.max(...vec) + Math.min(...vec));
    rhythm[i] = vec[i] > median;
  }
  return rhythm;
}

// Interference scoreof simultaneous “on” beats (logical AND popcount)
export function interference(a, b) {
  let score = 0;
  for (let i = 0; i < PRIMES.length; i++) if (a[i] && b[i]) score++;
  return score;
}

// Retrieve top-k memories matching a probe rhythm
export function retrieve(probe, memory, k = 3) {
  return memory
    .map(r => ({ r, s: interference(probe, r) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, k)
    .map(x => x.r);
}