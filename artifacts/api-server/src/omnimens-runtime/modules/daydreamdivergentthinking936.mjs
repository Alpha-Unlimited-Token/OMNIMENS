/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #936
 * Written: 2026-03-23T01:33:47.513Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Each concept is a small set of ints (Hz). Memory is an array of such chords.



// Cosine-based resonance score between two chords.
function resonance(a, b) {
  const shared = a.filter(f => b.includes(f)).length;
  const phaseBonus = Math.cos((a.reduce((s,x)=>s+x,0)-b.reduce((s,x)=>s+x,0))*Math.PI/180);
  return shared + phaseBonus;
}

// Store by simply pushing into memory.
export function store(memory, chord) {
  return [...memory, chord];
}

// Given a query chord, return the most resonant stored chord.
export function recall(memory, query): Chord | null {
  if (memory.length === 0) return null;
  let best = memory[0], bestScore = -Infinity;
  for (const m of memory) {
    const score = resonance(m, query);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

// Tiny demo usage (to be called by host, not here):
// mem = store(mem, [440,550,660]); recall(mem,[440,554]);