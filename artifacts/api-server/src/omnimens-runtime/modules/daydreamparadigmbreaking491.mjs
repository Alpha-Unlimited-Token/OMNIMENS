/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:paradigm_breaking #491
 * Written: 2026-03-22T12:29:55.630Z
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



export function createField({ nodes, coupling, dt = 0.05, k = 1 }: FieldCfg) {
  let phase= Array.from({ length: nodes }, () => Math.random() * Math.PI * 2);
  const ω: Vec = Array.from({ length: nodes }, () => Math.random() * 0.2 - 0.1); // intrinsic drift

  function step() {
    const newPhase = phase.map((θi, i) => {
      let sum = 0;
      for (let j = 0; j < nodes; j++) sum += coupling[i][j] * Math.sin(phase[j] - θi);
      return θi + (ω[i] + (k / nodes) * sum) * dt;
    });
    phase = newPhase;
    return phase;
  }

  function nudge(targets, amt) {
    targets.forEach(i => (phase[i] += amt));
  }

  function coherence() {
    const x = phase.reduce((s, θ) => s + Math.cos(θ), 0) / nodes;
    const y = phase.reduce((s, θ) => s + Math.sin(θ), 0) / nodes;
    return Math.sqrt(x * x + y * y); // 0-1 synchrony
  }

  return { step, nudge, coherence, getPhase: () => [...phase] };
}