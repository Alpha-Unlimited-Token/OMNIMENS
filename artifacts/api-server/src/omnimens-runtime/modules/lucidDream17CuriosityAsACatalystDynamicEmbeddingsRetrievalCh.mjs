/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Lucid Dream #17: Curiosity Catalyst + Dynamic Embeddings Retrieval Challenges
 * Written: 2026-03-22T04:03:22.362Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Curiosity-Evolved Embedding Engine — core prototype (pure computation)


// cosine similarity helper
const cosSim = (a, b) =>
  a.reduce((s, v, i) => s + v * b[i], 0) /
  (Math.hypot(...a) * Math.hypot(...b) + 1e-9);

// novelty score: 1 − max cosine similarity to any memory vector
const novelty = (v, memory) =>
  1 - Math.max(...memory.map(m => cosSim(v, m)));

// mutate a vector by gaussian noise scaled with tau
const mutate = (v, tau = 0.1) =>
  v.map(x => x + (Math.random() * 2 - 1) * tau);

// evolve a population toward maximal novelty
export function evolveCuriousVector(
  seed,
  memory,
  population = 32,
  generations = 8,
) {
  let pop= Array.from({ length: population }, () => mutate(seed));
  for (let g = 0; g < generations; g++) {
    const scored = pop.map(v => ({ v, score: novelty(v, memory) }));
    scored.sort((a, b) => b.score - a.score);               // high novelty first
    const elites = scored.slice(0, population / 4).map(s => s.v);
    pop = elites.flatMap(v => [v, mutate(v), mutate(v)]).slice(0, population);
  }
  return pop[0]; // most novel candidate
}