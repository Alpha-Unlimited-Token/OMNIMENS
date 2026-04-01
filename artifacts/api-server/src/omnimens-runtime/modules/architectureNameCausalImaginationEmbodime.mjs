/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_18566
 * Title: ARCHITECTURE NAME  
   Causal Imagination & Embodime
 * Written: 2026-03-23T00:17:05.296Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CIEM: ultra-light causal graph runner (pure computation)

// Run one simulation tick
function step(cmw) {
  const next = { ...cmw.state };
  for (const n of cmw.nodes) {
    next[n.key] = n.fn(cmw.state);
  }
  return next;
}

// Run imagination loop
export function simulate(
  cmw,
  ticks,
  stopCond = () => false
) {
  const history = [cmw.state];
  let current = cmw.state;
  for (let t = 0; t < ticks; t++) {
    current = step({ ...cmw, state: current });
    history.push(current);
    if (stopCond(current)) break;
  }
  return history;
}

// Simple counter-factual: swap a variable, re-simulate, diff trajectories
export function counterFactual(
  cmw,
  varKey,
  newVal,
  ticks = 10
) {
  const original = simulate(cmw, ticks);
  const mutated = { ...cmw, state: { ...cmw.state, [varKey]: newVal } };
  const alt = simulate(mutated, ticks);
  return { original, alt };
}
