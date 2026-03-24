/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_15961
 * Title: THE WILD IDEA  
   “POLYPHONIC THOUGHT”: Treat every
 * Written: 2026-03-22T18:46:05.650Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Counterpoint-Evolution core (pure TS, no io, no eval, no require)
               // each number = token id


const consonant = (a, b) => (Math.abs(a - b) % 12) === 0;
const dissonance = (a, b) => !consonant(a, b);

function fitness(voices) {
  // reward alternating consonance/dissonance across time
  let fit = 0;
  for (let t = 0; t < voices[0].length; t++) {
    let cons = 0, diss = 0;
    for (let i = 0; i < voices.length; i++)
      for (let j = i + 1; j < voices.length; j++)
        (consonant(voices[i][t], voices[j][t]) ? cons++ : diss++);
    fit += Math.abs(cons - diss);            // maximal when balanced
  }
  return -fit;                               // lower imbalance = better
}

export function evolve(pop, steps = 100) {
  let best= { voices: pop[0], fit: fitness(pop[0]) };
  for (let s = 0; s < steps; s++) {
    const idx = Math.floor(Math.random() * pop.length);
    const mutant = pop[idx].map(v =>
      v.map(t => (Math.random() < 0.1 ? t + (Math.random() < .5 ? 1 : -1) : t))
    );
    const fit = fitness(mutant);
    if (fit < best.fit) best = { voices: mutant, fit };
    pop.push(mutant);
  }
  return best;
}