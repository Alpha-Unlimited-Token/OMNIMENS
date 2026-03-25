/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_27871
 * Title: ARCHITECTURE NAME  
   COGNITIVE CAUSAL SIMULATION C
 * Written: 2026-03-25T01:01:01.688Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/***** C²SC – minimal causal graph core *****/


   // key = hash(cause+effect)

const THRESHOLD = 5;             // memristor switching threshold
const MAX_WEIGHT = 255;

export function hashEdge(cause, effect) {
  return [...cause, effect].join(">");
}

export function updateGraph(
  g,
  cause,
  effect,
  delta) {
  const key = hashEdge(cause, effect);
  const e = g.get(key) ?? { cause, effect, weight: 0 };
  const proposed = e.weight + delta;
  // Memristor hysteresis: update only if change big enough
  if (Math.abs(delta) >= THRESHOLD) {
    e.weight = Math.max(0, Math.min(MAX_WEIGHT, proposed));
    g.set(key, e);
  }
  return g;
}

export function forwardChain(g, facts, steps = 4) {
  const known = new Set(facts);
  for (let s = 0; s < steps; s++) {
    for (const { cause, effect, weight } of g.values()) {
      if (weight === 0) continue;
      if (cause.every(c => known.has(c))) known.add(effect);
    }
  }
  return known;
}