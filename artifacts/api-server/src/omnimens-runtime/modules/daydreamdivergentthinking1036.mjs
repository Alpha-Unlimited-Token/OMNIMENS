/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #1036
 * Written: 2026-03-23T04:59:28.562Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

              // frequencies (Hz) of fundamentals
// external fitness (task + consonance)

// simple harmonic-mutation evolutionary step
export function evolveHarmonicAI(
    population,
    score,
    rng = Math.random
) {
    const next= [];
    const pickParent = () => population[Math.floor(rng() * population.length)];
    const mutate = (g) =>
        g.map(f => f * (1 + (rng() - 0.5) * 0.02));         // ±1% retune
    // roulette-wheel selection based on inverse dissonance (=fitness)
    const fitness = population.map(score);
    const total = fitness.reduce((a, b) => a + b, 0);
    for (let i = 0; i < population.length; i++) {
        let r = rng() * total, idx = 0;
        while (r > fitness[idx]) r -= fitness[idx++];
        next.push(mutate(population[idx]));
    }
    return next;
}