/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #260
 * Written: 2026-03-22T04:48:32.668Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Knot type: braid word encoded array; lower numbers = simpler crossings


// Agent state: its braid, curiosity level & role


function braidEnergy(braid) {
  return braid.reduce((e, c, i) => e + Math.abs(c) / (i + 1), 0);
}

function mutate(braid) {
  const idx = Math.floor(Math.random() * braid.length);
  const delta = Math.random() < 0.5 ? -1 : 1;
  const nb = [...braid];
  nb[idx] += delta;
  return nb;
}

export function orchestraStep(pop) {
  const globalEnergy = pop.reduce((s, a) => s + braidEnergy(a.braid), 0);
  return pop.map(a => {
    const newBraid = mutate(a.braid);
    const newEnergy = braidEnergy(newBraid);
    const curiosityGain = globalEnergy - newEnergy;          // tension released?
    const updatedCuriosity = 0.9 * a.curiosity + curiosityGain;
    const becomesConductor = !a.conductor && updatedCuriosity > 10;
    return {
      braid: newEnergy < braidEnergy(a.braid) ? newBraid : a.braid,
      curiosity: updatedCuriosity,
      conductor: a.conductor || becomesConductor
    };
  });
}