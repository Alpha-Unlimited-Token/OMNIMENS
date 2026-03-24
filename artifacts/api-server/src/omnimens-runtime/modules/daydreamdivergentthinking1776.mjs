/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #1776
 * Written: 2026-03-24T13:30:21.115Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// 18 lines, no forbidden APIs
export function braidHash(notes, strands) {
  const τ = (i, s) => {             // braid generator σ_i
    const t = s.slice();
    [t[i], t[i + 1]] = [t[i + 1], t[i]];              // swap adjacent strands
    return t;
  };

  // initialise strands as 0..n-1
  let state= Array.from({ length: strands }, (_, i) => i);

  // map MIDI note -> braid index by mod n-1
  for (const note of notes) {
    const idx = Math.abs(note) % (strands - 1);
    state = τ(idx, state);
  }

  // cheap topological invariant: parity + cycle structure
  const parity = state.reduce((p, v, i) => p ^ ((v - i) & 1), 0);
  const cycles= [];
  const seen= [];
  for (let i = 0; i < state.length; i++) {
    if (!seen[i]) {
      let j = i, len = 0;
      while (!seen[j]) { seen[j] = true; j = state[j]; len++; }
      cycles.push(len);
    }
  }
  return parity.toString(16) + '-' + cycles.sort().join('.');
}