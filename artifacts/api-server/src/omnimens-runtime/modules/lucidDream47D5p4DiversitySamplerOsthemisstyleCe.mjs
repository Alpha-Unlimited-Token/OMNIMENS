/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_15198
 * Title: Lucid Dream #47: D5P4 diversity sampler + OS-Themis-style ce
 * Written: 2026-03-22T20:06:42.416Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Polyphonic Swarm – D5P4 core
// Pure, side-effect-free, no I/O, no dynamic code generation.

export function d5p4Sample<T>(
  items: T[],                       // candidate thoughts/world-states
  distance: (a: T, b: T) => number, // domain-specific dissimilarity
  k: number                         // how many diverse items to keep
): T[] {
  if (k <= 0 || items.length === 0) return [];
  // 1. Start with a random item to seed diversity.
  const selected: T[] = [items[Math.floor(Math.random() * items.length)]];
  // 2. Greedily add the item that maximizes min-distance to current set.
  while (selected.length < Math.min(k, items.length)) {
    let bestItem: T | null = null;
    let bestScore = -Infinity;
    for (const candidate of items) {
      if (selected.includes(candidate)) continue;
      const minDist = selected.reduce(
        (min, s) => Math.min(min, distance(candidate, s)),
        Infinity
      );
      if (minDist > bestScore) {
        bestScore = minDist;
        bestItem = candidate;
      }
    }
    if (bestItem !== null) selected.push(bestItem);
    else break; // no improvement possible
  }
  return selected;
}