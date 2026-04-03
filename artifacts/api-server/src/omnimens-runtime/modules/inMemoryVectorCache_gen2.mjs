/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-03T09:44:06.724Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorCache.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given vector to use as a key in the cache.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash representing the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance between the two vectors.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * In-memory vector cache for storing and retrieving embeddings.
 * Supports approximate nearest neighbor searches using a simple linear scan.
 */
export const inMemoryVectorCache = {
  _cache: new Map(),

  /**
   * Stores a vector in the cache with an optional associated value.
   * @param {number[]} vector - The vector to store.
   * @param {*} value - Optional value associated with the vector.
   */
  store(vector, value = null) {
    const key = generateVectorHash(vector);
    this._cache.set(key, { vector, value });
  },

  /**
   * Retrieves the value associated with a vector from the cache.
   * @param {number[]} vector - The vector to retrieve.
   * @returns {*} - The associated value, or undefined if not found.
   */
  retrieve(vector) {
    const key = generateVectorHash(vector);
    return this._cache.get(key)?.value;
  },

  /**
   * Finds the nearest neighbor to a given vector in the cache.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} [k=1] - The number of nearest neighbors to return.
   * @returns {Array<{ vector, value: *, distance}>} - The nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (k < 1) {
      throw new Error('k must be at least 1.');
    }

    const neighbors = [];

    for (const { vector, value } of this._cache.values()) {
      const distance = calculateEuclideanDistance(queryVector, vector);
      neighbors.push({ vector, value, distance });
    }

    neighbors.sort((a, b) => a.distance - b.distance);
    return neighbors.slice(0, k);
  },

  /**
   * Clears the entire cache.
   */
  clear() {
    this._cache.clear();
  },

  /**
   * Returns the current size of the cache.
   * @returns {number} - The number of items in the cache.
   */
  size() {
    return this._cache.size;
  }
};