/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #1340
 * Written: 2026-03-23T22:26:14.679Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Each gene = [pitch(0-11), duration(ms), velocity(0-1), operator(0-29)]

                   // 16 genes ≈ 1 bar
const OPS = 30;                         // “Translation Map v22”

function phaseError(g, bpm = 120) {
  const beat = 60000 / bpm;
  let t = 0, err = 0;
  for (const [, dur] of g) {            // ignore pitch for error calc
    const target = Math.round(t / beat) * beat;
    err += Math.abs(t - target);        // off-grid penalty
    t += dur;
  }
  return err / g.length;
}

export function evolveRhythmicGenome(
  pop, iters = 1000, temp = 1
) {
  for (let k = 0; k < iters; k++) {
    const [a, b] = pop.sort(() => 0.5 - Math.random()).slice(0, 2);
    const cross = a.map((g, i) => (Math.random() < 0.5 ? g : b[i])); // crossover
    if (Math.random() < 0.1) {                                       // mutate
      const idx = ~~(Math.random() * cross.length);
      cross[idx][3] = ~~(Math.random() * OPS);
    }
    const worst = pop.reduce((w, g) =>
      phaseError(g) > phaseError(w) ? g : w
    );
    if (
      phaseError(cross) + Math.random() * temp <
      phaseError(worst)
    )
      pop[pop.indexOf(worst)] = cross;                               // replace
    temp *= 0.999;                                                   // cooling
  }
  return pop.reduce((best, g) => (phaseError(g) < phaseError(best) ? g : best));
}