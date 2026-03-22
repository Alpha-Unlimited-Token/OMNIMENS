/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #440
 * Written: 2026-03-22T09:50:00.281Z
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
 * Compiled targets: javascript: OK (5 IR steps) | python: OK (5 IR steps) | c: OK (5 IR steps) | x86_64: OK (5 IR steps) | arm64: OK (5 IR steps) | avr: OK (5 IR steps)
 * Translation map version: 22
 */
// Pure functional oscillator swarm step — NO external deps
export type Osc = { f: number; phi: number; w: number };   // frequency, phase, coupling weight
export type Swarm = Osc[];

/**
 * Advance the swarm by dt, synchronising phases via simple Kuramoto update.
 * Returns new swarm and global coherence metric (0-1).
 */
export function stepSwarm(s: Swarm, dt = 0.05): { next: Swarm; coherence: number } {
  const n = s.length;
  const sin = Math.sin, cos = Math.cos;
  let R_x = 0, R_y = 0;

  // Compute order parameter (mean phase vector)
  for (const o of s) { R_x += cos(o.phi); R_y += sin(o.phi); }
  const R = Math.hypot(R_x, R_y) / n;
  const psi = Math.atan2(R_y, R_x);

  // Update each oscillator’s phase toward global phase psi
  const next = s.map(o => {
    const dphi = o.f + o.w * Math.sin(psi - o.phi);
    return { ...o, phi: (o.phi + dphi * dt) % (2 * Math.PI) };
  });

  return { next, coherence: R };
}