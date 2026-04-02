/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: episodicMemoryManager
 * Written: 2026-04-02T14:53:42.111Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility to compress episodic memory entries using hashing.
 * @param {string} memory - The memory string to compress.
 * @returns {string} - Compressed memory hash.
 */
export function compressMemory(memory) {
  const hash = createHash('sha256');
  hash.update(memory);
  return hash.digest('hex');
}

/**
 * Utility to store and retrieve episodic memories with key-value mapping.
 */
export class EpisodicMemoryManager {
  constructor() {
    this.memoryStore = new Map();
  }

  /**
   * Stores a memory with a unique key.
   * @param {string} key - Unique identifier for the memory.
   * @param {string} memory - The memory string to store.
   */
  storeMemory(key, memory) {
    const compressed = compressMemory(memory);
    this.memoryStore.set(key, { memory, compressed });
  }

  /**
   * Retrieves a memory by its key.
   * @param {string} key - The key of the memory to retrieve.
   * @returns {object|null} - The memory object { memory, compressed } or null if not found.
   */
  retrieveMemory(key) {
    return this.memoryStore.get(key) || null;
  }

  /**
   * Searches for memories containing a specific substring.
   * @param {string} query - The substring to search for.
   * @returns {Array<object>} - List of matching memory objects.
   */
  searchMemories(query) {
    const results = [];
    for (const [key, value] of this.memoryStore.entries()) {
      if (value.memory.includes(query)) {
        results.push({ key, ...value });
      }
    }
    return results;
  }

  /**
   * Deletes a memory by its key.
   * @param {string} key - The key of the memory to delete.
   * @returns {boolean} - True if the memory was deleted, false if not found.
   */
  deleteMemory(key) {
    return this.memoryStore.delete(key);
  }
}

/**
 * Utility function to simulate retrieval-augmented generation.
 * @param {string} input - Input query or context.
 * @param {EpisodicMemoryManager} memoryManager - Instance of EpisodicMemoryManager.
 * @returns {string} - Generated response based on memories.
 */
export function retrievalAugmentedGeneration(input, memoryManager) {
  const relatedMemories = memoryManager.searchMemories(input);
  const context = relatedMemories.map(mem => mem.memory).join(' ');
  return `Response based on context: ${context}`;
}

/**
 * Utility to validate memory key format.
 * @param {string} key - The key to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMemoryKey(key) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(key);
}

/**
 * Utility to calculate memory store size.
 * @param {EpisodicMemoryManager} memoryManager - Instance of EpisodicMemoryManager.
 * @returns {number} - Total number of stored memories.
 */
export function memoryStoreSize(memoryManager) {
  return memoryManager.memoryStore.size;
}
