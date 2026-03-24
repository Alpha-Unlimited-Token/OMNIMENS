/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #856
 * Written: 2026-03-22T23:21:48.859Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: oscillator
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (10 IR steps) | python: OK (10 IR steps) | c: OK (10 IR steps) | x86_64: OK (10 IR steps) | arm64: OK (10 IR steps) | avr: OK (10 IR steps)
 * Translation map version: 22
 */
// Pure, dependency-free resonant update step
export function sonicValenceStep(
  state,            // phases of N oscillators  [0, 2π)
  inputSpectrum     // same length, magnitude of input frequencies
) {
  const N = state.length;
  const next= new Array(N);
  const kCouple = 0.02;       // coupling strength
  const kInput  = 0.05;       // attraction to input phase (=0)
  const twoPi   = 2 * Math.PI;

  // helper: wrap angle into [0,2π)
  const norm = (x) => (x % twoPi + twoPi) % twoPi;

  // 1. compute global field (mean phase) weighted by magnitude
  let s = 0, c = 0, magSum = 0;
  for (let i = 0; i < N; i++) {
    const mag = inputSpectrum[i] || 1;
    s += Math.sin(state[i]) * mag;
    c += Math.cos(state[i]) * mag;
    magSum += mag;
  }
  const globalPhase = Math.atan2(s, c);

  // 2. local update: nudge each oscillator toward both input (phase 0) and globalPhase
  for (let i = 0; i < N; i++) {
    const phase = state[i];
    const dθ = kInput * Math.sin(-phase) + kCouple * Math.sin(globalPhase - phase);
    next[i] = norm(phase + dθ);
  }
  return next;
}