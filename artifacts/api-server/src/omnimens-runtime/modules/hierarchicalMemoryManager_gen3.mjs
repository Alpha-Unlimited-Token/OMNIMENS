/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T00:10:12.890Z
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
 * A utility module for managing ultra-long context using a priority-based memory hierarchy.
 * Implements LRU caching and namespace tagging for efficient data retrieval.
 */

// Internal LRU Cache implementation
class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Utility Functions
/**
 * Generates a unique hash for a given namespace and key.
 * @param {string} namespace - The namespace to associate the key with.
 * @param {string} key - The key to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(namespace, key) {
  const hash = createHash('sha256');
  hash.update(`${namespace}:${key}`);
  return hash.digest('hex');
}

/**
 * Creates a hierarchical memory manager instance.
 * @param {number} primaryLimit - The size limit for primary memory.
 * @param {number} secondaryLimit - The size limit for secondary memory.
 * @returns {Object} - Memory manager with set, get, and delete methods.
 */
export function createMemoryManager(primaryLimit, secondaryLimit) {
  const primaryMemory = new LRUCache(primaryLimit);
  const secondaryMemory = new LRUCache(secondaryLimit);

  return {
    /**
     * Stores data in the memory hierarchy.
     * @param {string} namespace - The namespace for the data.
     * @param {string} key - The key for the data.
     * @param {any} value - The value to store.
     */
    set(namespace, key, value) {
      const hashedKey = generateHash(namespace, key);
      if (primaryMemory.has(hashedKey)) {
        primaryMemory.set(hashedKey, value);
      } else {
        if (primaryMemory.cache.size >= primaryMemory.limit) {
          const [evictedKey, evictedValue] = [...primaryMemory.cache][0];
          primaryMemory.delete(evictedKey);
          secondaryMemory.set(evictedKey, evictedValue);
        }
        primaryMemory.set(hashedKey, value);
      }
    },

    /**
     * Retrieves data from the memory hierarchy.
     * @param {string} namespace - The namespace for the data.
     * @param {string} key - The key for the data.
     * @returns {any} - The retrieved value, or undefined if not found.
     */
    get(namespace, key) {
      const hashedKey = generateHash(namespace, key);
      let value = primaryMemory.get(hashedKey);
      if (value === undefined) {
        value = secondaryMemory.get(hashedKey);
        if (value !== undefined) {
          primaryMemory.set(hashedKey, value);
        }
      }
      return value;
    },

    /**
     * Deletes data from the memory hierarchy.
     * @param {string} namespace - The namespace for the data.
     * @param {string} key - The key for the data.
     */
    delete(namespace, key) {
      const hashedKey = generateHash(namespace, key);
      primaryMemory.delete(hashedKey);
      secondaryMemory.delete(hashedKey);
    },

    /**
     * Clears all data from the memory hierarchy.
     */
    clear() {
      primaryMemory.clear();
      secondaryMemory.clear();
    }
  };
}

export const MAX_NAMESPACE_LENGTH = 100; // Example constant for cross-agent use
