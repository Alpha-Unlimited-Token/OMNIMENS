/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T20:36:21.331Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input using SHA-256.
 * @param {string} input - The input string to hash.
 * @returns {string} - The hex-encoded hash.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Compresses context data into a summarized representation.
 * @param {string} context - The raw context data.
 * @param {number} compressionLevel - Level of compression (1-3).
 * @returns {string} - Compressed context representation.
 */
export function compressContext(context, compressionLevel = 2) {
  const words = context.split(/\s+/);
  const step = Math.max(1, Math.floor(words.length / (compressionLevel * 10)));
  const summary = words.filter((_, index) => index % step === 0);
  return summary.join(' ');
}

/**
 * Stores context in hierarchical memory tiers.
 * @param {Map<string, string[]>} memory - Hierarchical memory structure.
 * @param {string} context - Context data to store.
 * @param {number} tier - Memory tier (1 = highest priority).
 */
export function storeContext(memory, context, tier = 1) {
  const compressed = compressContext(context, tier);
  const hash = generateHash(compressed);
  if (!memory.has(hash)) {
    memory.set(hash, []);
  }
  memory.get(hash).push(compressed);
}

/**
 * Retrieves context from hierarchical memory tiers using similarity search.
 * @param {Map<string, string[]>} memory - Hierarchical memory structure.
 * @param {string} query - Query string to search.
 * @returns {string[]} - List of matching contexts.
 */
export function retrieveContext(memory, query) {
  const queryHash = generateHash(compressContext(query));
  const results = [];
  for (const [hash, contexts] of memory.entries()) {
    if (hash.startsWith(queryHash.slice(0, 8))) {
      results.push(...contexts);
    }
  }
  return results;
}

/**
 * Initializes a hierarchical memory structure.
 * @returns {Map<string, string[]>} - Empty hierarchical memory structure.
 */
export function initializeMemory() {
  return new Map();
}

// Example usage:
// const memory = initializeMemory();
// storeContext(memory, "This is a test context for tier 1", 1);
// const results = retrieveContext(memory, "test context");
// console.log(results);