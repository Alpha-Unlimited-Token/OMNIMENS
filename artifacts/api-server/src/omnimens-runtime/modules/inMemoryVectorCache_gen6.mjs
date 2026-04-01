/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-01T22:02:34.281Z
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
 * A utility module for in-memory LRU caching of embedding vectors.
 * Provides fast storage and retrieval for embeddings during runtime.
 */

export class InMemoryVectorCache {
  constructor(maxSize = 100) {
    if (maxSize <= 0 || !Number.isInteger(maxSize)) {
      throw new Error('maxSize must be a positive integer.');
    }
    this.maxSize = maxSize;
    this.cache = new Map(); // Maintains insertion order for LRU logic
  }

  /**
   * Generates a unique hash key for a given input vector.
   * @param {number[]} vector - The embedding vector.
   * @returns {string} - A hash string representing the vector.
   */
  static generateKey(vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Input must be an array of numbers.');
    }
    const hash = createHash('sha256');
    hash.update(vector.join(','));
    return hash.digest('hex');
  }

  /**
   * Stores an embedding vector in the cache.
   * @param {number[]} vector - The embedding vector to store.
   * @param {*} value - The associated value to store with the vector.
   */
  set(vector, value) {
    const key = InMemoryVectorCache.generateKey(vector);

    if (this.cache.has(key)) {
      this.cache.delete(key); // Remove and re-add to update LRU order
    } else if (this.cache.size >= this.maxSize) {
      // Remove the least recently used item
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { vector, value });
  }

  /**
   * Retrieves the value associated with an embedding vector.
   * @param {number[]} vector - The embedding vector to retrieve.
   * @returns {*} - The associated value, or undefined if not found.
   */
  get(vector) {
    const key = InMemoryVectorCache.generateKey(vector);

    if (!this.cache.has(key)) {
      return undefined;
    }

    // Update LRU order by re-inserting the key
    const entry = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Checks if a vector exists in the cache.
   * @param {number[]} vector - The embedding vector to check.
   * @returns {boolean} - True if the vector exists, false otherwise.
   */
  has(vector) {
    const key = InMemoryVectorCache.generateKey(vector);
    return this.cache.has(key);
  }

  /**
   * Clears all entries in the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} - The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
    throw new Error('Both inputs must be arrays of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not have zero magnitude.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  if (!Array.isArray(vector) || vector.some(isNaN)) {
    throw new Error('Input must be an array of numbers.');
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude === 0) {
    throw new Error('Vector must not have zero magnitude.');
  }

  return vector.map((val) => val / magnitude);
}