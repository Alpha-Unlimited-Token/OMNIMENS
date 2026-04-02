/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveMemoryManager
 * Written: 2026-04-02T13:34:10.693Z
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
 * Novel constructs: neural
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// adaptiveMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Compresses context data into a compact representation using hashing.
 * @param {string} context - The context string to compress.
 * @returns {string} - A hash representing the compressed context.
 */
export function compressContext(context) {
  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Decompresses context data by retrieving the original context from a cache.
 * @param {string} compressedContext - The hash of the compressed context.
 * @param {Map<string, string>} cache - A cache mapping hashes to original contexts.
 * @returns {string | null} - The original context, or null if not found.
 */
export function decompressContext(compressedContext, cache) {
  return cache.get(compressedContext) || null;
}

/**
 * Prioritizes contexts based on their importance weights.
 * @param {Array<{ context, importance}>} contexts - Array of contexts with importance weights.
 * @returns {Array<string>} - Sorted list of contexts by importance (highest first).
 */
export function prioritizeContexts(contexts) {
  return contexts
    .sort((a, b) => b.importance - a.importance)
    .map(item => item.context);
}

/**
 * Dynamically manages hierarchical memory by swapping detailed sub-contexts into active reasoning.
 * @param {Array<{ context, importance}>} contexts - Array of contexts with importance weights.
 * @param {Map<string, string>} cache - Cache for storing original contexts.
 * @returns {Array<string>} - Active contexts ready for reasoning.
 */
export function manageMemory(contexts, cache) {
  const prioritized = prioritizeContexts(contexts);
  const activeContexts = [];

  for (const context of prioritized) {
    const compressed = compressContext(context);
    cache.set(compressed, context);
    activeContexts.push(compressed);
  }

  return activeContexts;
}

/**
 * Retrieves active reasoning contexts from memory.
 * @param {Array<string>} activeContexts - Array of compressed context hashes.
 * @param {Map<string, string>} cache - Cache for storing original contexts.
 * @returns {Array<string>} - Decompressed active contexts.
 */
export function retrieveActiveContexts(activeContexts, cache) {
  return activeContexts.map(hash => decompressContext(hash, cache)).filter(Boolean);
}

// Example usage (not part of the module):
// const cache = new Map();
// const contexts = [
//   { context: 'Genetic algorithms are used for optimization.', importance: 8 },
//   { context: 'Neuroevolution evolves neural networks.', importance: 9 },
//   { context: 'Dynamic programming solves complex problems.', importance: 7 }
// ];
// const active = manageMemory(contexts, cache);
// console.log(retrieveActiveContexts(active, cache));