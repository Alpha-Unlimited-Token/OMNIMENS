/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #520
 * Written: 2026-03-22T13:14:55.154Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Pure, side-effect-free harmonic state update
        // Hz values, one per “neuron”
  amplitudes;     // 0..1
  motifs;       // saved sequences (memory)
};

const tau = 2 * Math.PI;

// Simple consonance metric between two frequencies
function consonance(f1, f2) {
  const ratio = f1 > f2 ? f1 / f2 : f2 / f1;
  return Math.exp(-Math.abs(Math.log2(ratio))); // 1 = unison, ↓ diverges
}

// Update state toward minimum dissonance given an input motif
export function harmonicStep(
  state,
  input          // incoming “query” motif (Hz)
) {
  const newPitches = state.pitches.map((p, i) => {
    const attract = input[i % input.length];
    const force = consonance(p, attract) - 0.5; // ± force
    return p * Math.exp(0.01 * force);          // micro-tonal shift
  });

  // Store motif if it lowered average dissonance
  const avgDis = newPitches.reduce(
    (acc, p, i) => acc + consonance(p, state.pitches[i]),
    0
  ) / newPitches.length;
  const motifs = avgDis > 0.6 ? [...state.motifs, input] : state.motifs;

  return { pitches: newPitches, amplitudes: state.amplitudes, motifs };
}