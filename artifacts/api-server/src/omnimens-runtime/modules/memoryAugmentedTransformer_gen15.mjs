/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryAugmentedTransformer
 * Written: 2026-04-01T22:22:39.713Z
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
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (2 IR steps) | python: OK (2 IR steps) | c: OK (2 IR steps) | x86_64: OK (2 IR steps) | arm64: OK (2 IR steps) | avr: OK (2 IR steps)
 * Translation map version: 22
 */
// memoryAugmentedTransformer.mjs

import { createHash } from 'crypto';

/**
 * Hashes a key to create a fixed-length identifier for memory storage.
 * @param {string} key - The key to hash.
 * @returns {string} - A hashed key.
 */
export function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Memory slot structure to store key-context pairs with limited capacity.
 * Provides dynamic storage and retrieval for memory augmentation.
 */
export class MemoryAugmentedTransformer {
  constructor(maxSlots = 100) {
    this.maxSlots = maxSlots; // Maximum number of memory slots
    this.memory = new Map(); // Internal memory store
  }

  /**
   * Adds a key-context pair to memory, evicting the least recently used (LRU) if full.
   * @param {string} key - The key identifying the context.
   * @param {string} context - The associated context data.
   */
  addMemory(key, context) {
    const hashedKey = hashKey(key);

    // If key exists, update and move to the end (most recently used)
    if (this.memory.has(hashedKey)) {
      this.memory.delete(hashedKey);
    } else if (this.memory.size >= this.maxSlots) {
      // Evict the least recently used (first item in Map)
      const lruKey = this.memory.keys().next().value;
      this.memory.delete(lruKey);
    }

    this.memory.set(hashedKey, context);
  }

  /**
   * Retrieves context by key, moving it to the end (most recently used).
   * @param {string} key - The key to retrieve the context for.
   * @returns {string|null} - The retrieved context or null if not found.
   */
  getMemory(key) {
    const hashedKey = hashKey(key);

    if (!this.memory.has(hashedKey)) {
      return null; // Key not found
    }

    // Move to the end (most recently used)
    const context = this.memory.get(hashedKey);
    this.memory.delete(hashedKey);
    this.memory.set(hashedKey, context);

    return context;
  }

  /**
   * Clears all memory slots.
   */
  clearMemory() {
    this.memory.clear();
  }

  /**
   * Returns all stored key-context pairs as an array of objects.
   * @returns {Array<{ key, context}>} - All memory entries.
   */
  getAllMemory() {
    return Array.from(this.memory.entries()).map(([hashedKey, context]) => ({
      key: hashedKey,
      context
    }));
  }
}

/**
 * Utility function to perform weighted attention over memory contexts.
 * @param {string} query - The query string.
 * @param {Array<{ key, context}>} memoryEntries - The memory entries to attend over.
 * @returns {string|null} - The most relevant context or null if memory is empty.
 */
export function weightedAttention(query, memoryEntries) {
  if (!memoryEntries.length) return null;

  // Compute relevance scores based on simple string similarity (shared character count)
  const scores = memoryEntries.map(({ key, context }) => ({
    context,
    score: [...query].filter(char => key.includes(char)).length
  }));

  // Select the context with the highest score
  scores.sort((a, b) => b.score - a.score);
  return scores[0].context;
}

/**
 * Example usage of the memory-augmented transformer.
 */
export function exampleUsage() {
  const mat = new MemoryAugmentedTransformer(3);

  mat.addMemory('key1', 'This is the first context.');
  mat.addMemory('key2', 'Second context is here.');
  mat.addMemory('key3', 'Third context available.');

  // Retrieve a context
  const context = mat.getMemory('key1');

  // Add another memory, causing an eviction (LRU policy)
  mat.addMemory('key4', 'Fourth context, evicting the oldest.');

  // Perform weighted attention
  const relevantContext = weightedAttention('key4', mat.getAllMemory());

  return { context, relevantContext, allMemory: mat.getAllMemory() };
}