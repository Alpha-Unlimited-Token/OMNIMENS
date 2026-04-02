/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-02T21:23:11.467Z
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
 * Utility function to calculate Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensionality.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Generates a unique hash for a vector to use as a key in the cache.
 * @param {number[]} vector - The vector to hash.
 * @returns {string} - A unique hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * In-memory vector cache for storing and retrieving high-dimensional embeddings.
 */
export const inMemoryVectorCache = {
  _cache: new Map(),

  /**
   * Stores a vector in the cache with an optional associated value.
   * @param {number[]} vector - The vector to store.
   * @param {*} value - Optional value associated with the vector.
   */
  store(vector, value = null) {
    const key = hashVector(vector);
    this._cache.set(key, { vector, value });
  },

  /**
   * Retrieves the closest vector(s) to the given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ vector, value, distance}>} - Array of nearest neighbors.
   */
  retrieveNearest(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const { vector, value } of this._cache.values()) {
      const distance = calculateEuclideanDistance(queryVector, vector);
      distances.push({ vector, value, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  },

  /**
   * Clears all vectors from the cache.
   */
  clear() {
    this._cache.clear();
  },

  /**
   * Returns the current size of the cache.
   * @returns {number} - Number of vectors in the cache.
   */
  size() {
    return this._cache.size;
  }
};

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}