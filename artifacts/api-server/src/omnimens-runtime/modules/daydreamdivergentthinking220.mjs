/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #220
 * Written: 2026-03-22T03:46:06.855Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Pure, side-effect-free causal-resonance step
 freq; amp};
 to; weight}; // causal strength

const TAU = Math.PI * 2;
const REF = 440; // reference Hz (A4)

/**
 * One relaxation tick: propagate resonance amplitudes across the graph.
 * @param nodes -- array of nodes (freq in Hz, amp in [0,1])
 * @param edges -- directed, weighted causal links
 * @param damp  -- 0..1, energy loss factor per tick
 * @returns new node set after one tick
 */
export function resonanceTick(
  nodes,
  edges,
  damp = 0.05
) {
  const id2idx = new Map(nodes.map((n, i) => [n.id, i]));
  const ampsNext = nodes.map(n => n.amp * (1 - damp));

  edges.forEach(e => {
    const i = id2idx.get(e.from)!, j = id2idx.get(e.to)!;
    const fi = nodes[i].freq, fj = nodes[j].freq;
    const phaseAlign = Math.cos(TAU * (fj - fi) / REF); // +1 consonant, −1 dissonant
    ampsNext[j] += nodes[i].amp * e.weight * phaseAlign;
  });

  // normalise amplitudes into [0,1]
  const max = Math.max(...ampsNext.map(Math.abs)) || 1;
  return nodes.map((n, k) => ({ ...n, amp: Math.min(1, Math.max(0, ampsNext[k] / max)) }));
}

/**
 * After several ticks, the node with highest amplitude ≙ inferred conclusion.
 */