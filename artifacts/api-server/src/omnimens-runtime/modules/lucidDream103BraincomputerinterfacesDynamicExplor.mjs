/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_17486
 * Title: Lucid Dream #103: brain_computer_interfaces + Dynamic Explor
 * Written: 2026-03-22T19:24:11.490Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: signal
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// Dynamic Exploration Beyond Training Distribution — core loop

       // external utility signal

// Euclidean distance between two vectors
function dist(a, b) {
  return Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
}

// Produce k novel candidates around a seed vector
function perturb(seed, k = 4, step = 0.3) {
  return Array.from({ length: k }, () =>
    seed.map(x => x + (Math.random() * 2 - 1) * step)
  );
}

/**
 * One self-improvement iteration.
 * memory: rolling bank of vectors
 * score:   task utility function (higher is better)
 * keep:    max memory size
 */
export function recurseImprove(
  memory,
  score,
  keep = 64
) {
  const candidates= [];
  for (const v of memory) candidates.push(...perturb(v));
  // Combine utility with novelty (1e-9 avoids div-by-zero)
  const rated = candidates.map(c => {
    const novelty = memory.reduce((m, v) => m + dist(c, v), 0) / memory.length;
    return { v: c, val: score(c) + Math.log(1 + novelty) };
  });
  rated.sort((a, b) => b.val - a.val);
  const survivors = rated.slice(0, keep).map(r => r.v);
  return survivors;
}