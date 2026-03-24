/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #1792
 * Written: 2026-03-24T13:56:53.895Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/* Harmonic-Immune core loop */
          // Hertz values


const MUTATION_RATE = 0.1;
const SEMITONE = Math.pow(2, 1 / 12);

function affinity(m, r) {
  const len = Math.min(m.length, r.length);
  let score = 0;
  for (let i = 0; i < len; i++)
    score += 1 / (1 + Math.abs(Math.log2(m[i] / r[i]))); // consonance metric
  return score / len;
}

function mutate(m) {
  return m.map(p => (Math.random() < MUTATION_RATE ? p * SEMITONE ** (Math.random() * 2 - 1) : p));
}

export function step(pop, pathogen, clones = 4) {
  // 1. Evaluate affinities
  const ranked = pop
    .map(m => ({ m, f: affinity(m, pathogen) }))
    .sort((a, b) => b.f - a.f);
  // 2. Clone & mutate top responders
  const next= ranked.slice(0, pop.length / 2).flatMap(({ m }) =>
    Array.from({ length: clones }, () => mutate(m))
  );
  // 3. Preserve diversity (carry over some low-affinity)
  next.push(...ranked.slice(-pop.length / 4).map(({ m }) => m));
  return next.slice(0, pop.length); // fixed population size
}