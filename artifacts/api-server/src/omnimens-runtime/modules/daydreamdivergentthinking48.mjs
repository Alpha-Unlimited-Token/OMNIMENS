/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #48
 * Written: 2026-03-21T03:16:37.279Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Sonic-Graph Cognition – minimal core (pure computation, no I/O)
export type Node = { ω: number; φ: number; neighbors: number[] }; // freq, phase
export type Graph = Node[];

// Kuramoto-like synchrony update
export function step(graph: Graph, K = 0.05, dt = 0.1): Graph {
  const next: Graph = graph.map(n => ({ ...n, φ: n.φ })); // clone
  graph.forEach((n, i) => {
    let sum = 0;
    n.neighbors.forEach(j => {
      const nj = graph[j];
      sum += Math.sin(nj.φ - n.φ);
    });
    const dφ = n.ω + (K / n.neighbors.length) * sum;
    next[i].φ += dφ * dt;
  });
  return next;
}

// Inject stimulus as detuning; returns new graph
export function injectStimulus(graph: Graph, target: number, deltaΩ: number): Graph {
  return graph.map((n, i) => i === target ? { ...n, ω: n.ω + deltaΩ } : n);
}

// Measure global “dissonance” (to be minimised)
export function dissonance(graph: Graph): number {
  let acc = 0;
  graph.forEach(n =>
    n.neighbors.forEach(j => {
      const diff = Math.sin(graph[j].φ - n.φ);
      acc += diff * diff;
    })
  );
  return acc / graph.length;
}