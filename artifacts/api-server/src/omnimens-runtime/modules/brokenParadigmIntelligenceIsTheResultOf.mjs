/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_24837
 * Title: BROKEN PARADIGM  
   “Intelligence is the result of
 * Written: 2026-03-24T08:50:07.510Z
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
 * Compiled targets: javascript: OK (7 IR steps) | python: OK (7 IR steps) | c: OK (7 IR steps) | x86_64: OK (7 IR steps) | arm64: OK (7 IR steps) | avr: OK (7 IR steps)
 * Translation map version: 22
 */
// ResonantNet.ts




/**
 * Advance the resonance network by Δt.
 * k = coupling strength (0 = isolated, 1 = strong coherence)
 */
export function stepResonance(
  state,
  k,
  dt) {
  const { nodes } = state;
  const n = nodes.length;
  const newNodes= new Array(n);

  // global order parameter (magnitude R & mean angle Θ)
  let sumSin = 0, sumCos = 0;
  for (const o of nodes) {
    sumSin += Math.sin(o.phase);
    sumCos += Math.cos(o.phase);
  }
  const R = Math.hypot(sumSin, sumCos) / n;
  const theta = Math.atan2(sumSin, sumCos);

  // update each oscillator
  for (let i = 0; i < n; i++) {
    const o = nodes[i];
    const dPhi = o.naturalFreq + k * R * Math.sin(theta - o.phase);
    newNodes[i] = { phase: (o.phase + dPhi * dt) % (2 * Math.PI), naturalFreq: o.naturalFreq };
  }

  return { t: state.t + dt, nodes: newNodes };
}