/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #321
 * Written: 2026-03-22T06:45:28.583Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */









export function propagate(graph, state) {
  const next= { ...state };
  for (const { from, to, weight } of graph.edges) {
    if (from in state) {
      const influence = state[from] * weight;
      next[to] = (next[to] ?? 0) + influence;
      next[to] = Math.max(0, Math.min(1, next[to])); // clamp
    }
  }
  return next;
}

export function intervene(
  graph,
  base,
  intervention,
  steps = 3,
  samples = 100
) {
  let diffSum = 0;
  for (let i = 0; i < samples; i++) {
    let s= { ...base, ...intervention };
    for (let t = 0; t < steps; t++) s = propagate(graph, s);
    diffSum += Object.keys(base).reduce((acc, k) => acc + Math.abs(s[k] - base[k]), 0);
  }
  return diffSum / samples; // expected causal effect magnitude
}

export function updateEdgeWeight(edge, evidence, lr = 0.1) {
  const grad = evidence - edge.weight;
  const newWeight = Math.max(-1, Math.min(1, edge.weight + lr * grad));
  return { ...edge, weight: newWeight };
}