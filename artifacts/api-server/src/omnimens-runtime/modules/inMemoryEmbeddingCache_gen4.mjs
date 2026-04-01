/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingCache
 * Written: 2026-04-01T22:18:38.527Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryEmbeddingCache.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given key.
 * @param {string} key - The key to hash.
 * @returns {string} - A hashed representation of the key.
 */
export function generateKeyHash(key) {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Creates an in-memory cache with LRU eviction policy.
 * @param {number} maxSize - Maximum number of items the cache can hold.
 * @returns {object} - An object with cache operations.
 */
export function createInMemoryEmbeddingCache(maxSize) {
  const cache = new Map();

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The key to retrieve.
   * @returns {any} - The cached value or undefined if not found.
   */
  function get(key) {
    const hashedKey = generateKeyHash(key);
    if (cache.has(hashedKey)) {
      const value = cache.get(hashedKey);
      // Move the accessed item to the end to mark it as recently used
      cache.delete(hashedKey);
      cache.set(hashedKey, value);
      return value;
    }
    return undefined;
  }

  /**
   * Adds or updates an item in the cache.
   * @param {string} key - The key to store.
   * @param {any} value - The value to store.
   */
  function set(key, value) {
    const hashedKey = generateKeyHash(key);
    if (cache.has(hashedKey)) {
      cache.delete(hashedKey);
    } else if (cache.size >= maxSize) {
      // Evict the least recently used item (first item in Map)
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(hashedKey, value);
  }

  /**
   * Checks if a key exists in the cache.
   * @param {string} key - The key to check.
   * @returns {boolean} - True if the key exists, false otherwise.
   */
  function has(key) {
    const hashedKey = generateKeyHash(key);
    return cache.has(hashedKey);
  }

  /**
   * Clears all items from the cache.
   */
  function clear() {
    cache.clear();
  }

  /**
   * Retrieves the current size of the cache.
   * @returns {number} - The number of items in the cache.
   */
  function size() {
    return cache.size;
  }

  return { get, set, has, clear, size };
}

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero-length');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero-length vector');
  }
  return vector.map(val => val / magnitude);
}