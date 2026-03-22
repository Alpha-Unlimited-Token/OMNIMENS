/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_17096
 * Title: BROKEN PARADIGM  
“Intelligence = sequential symbol-
 * Written: 2026-03-22T18:17:21.931Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Harmonic Resonant Mesh — no sequential “program”; only coupled resonance
export type Mesh = { phase: number; freq: number }[];

/** create an N-node resonant mesh with random phases  */
export function createMesh(n: number, baseFreq = 0.02): Mesh {
  const rand = () => Math.random();
  return Array.from({ length: n }, () => ({
    phase: rand(),               // 0 … 1
    freq: baseFreq * (0.8 + rand()*0.4) // small natural variance
  }));
}

/** advance the mesh one Δt step using Kuramoto-style coupling */
export function tick(mesh: Mesh, K = 0.3, dt = 1): void {
  const N = mesh.length;
  const phases = mesh.map(n => n.phase);
  for (let i = 0; i < N; i++) {
    // global (all-to-all) coupling; local coupling is similar
    const sync = phases.reduce((s, p) => s + Math.sin(2*Math.PI*(p - phases[i])), 0) / N;
    const dφ = mesh[i].freq + K * sync;        // resonance pull
    mesh[i].phase = (mesh[i].phase + dφ * dt) % 1; // keep in [0,1)
  }
}

/** inject “stimulus” by nudging a subset of nodes’ phases */
export function stimulate(mesh: Mesh, idx: number[], energy = 0.25): void {
  idx.forEach(i => mesh[i].phase = (mesh[i].phase + energy) % 1);
}

/** readout: the emergent standing wave pattern */
export function fingerprint(mesh: Mesh): number[] {
  return mesh.map(n => Math.round(n.phase * 10) / 10); // coarse quantisation
}