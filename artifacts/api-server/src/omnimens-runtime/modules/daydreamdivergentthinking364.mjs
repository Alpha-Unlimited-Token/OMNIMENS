/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #364
 * Written: 2026-03-22T07:50:26.618Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Harmonic Swarm step – NO external deps, NO eval/new Function/child_process
export type Osc = { f: number; phase: number; strength: number };
export type Swarm = Osc[];

// Helper to wrap phase into [0,2π)
const tau = 2 * Math.PI;
const wrap = (x: number) => (x % tau + tau) % tau;

// One simulation tick: inject goal chord ≈ target[], relax swarm
export function stepSwarm(
  swarm: Swarm,
  target: number[],        // frequencies to resonate with
  dt = 0.02,               // time increment
  kAttract = 0.1,          // attraction gain
  kRepel = 0.05            // repulsion (avoid exact sync -> diversity)
): Swarm {
  const avgPhase = (f: number) => {
    const s = swarm
      .filter(o => Math.abs(o.f - f) < 1e-6)
      .reduce((a, o) => a + Math.sin(o.phase), 0);
    const c = swarm
      .filter(o => Math.abs(o.f - f) < 1e-6)
      .reduce((a, o) => a + Math.cos(o.phase), 0);
    return Math.atan2(s, c);
  };
  return swarm.map(o => {
    const goalPull = target.includes(o.f) ? kAttract * (avgPhase(o.f) - o.phase) : 0;
    const diversityPush = kRepel * (Math.random() - 0.5);
    return {
      ...o,
      phase: wrap(o.phase + dt * (o.f + goalPull + diversityPush))
    };
  });
}