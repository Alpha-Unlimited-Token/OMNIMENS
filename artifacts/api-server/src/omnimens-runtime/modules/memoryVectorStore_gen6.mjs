/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryVectorStore
 * Written: 2026-04-01T22:21:45.582Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function calculateDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
}

/**
 * Generates a unique hash for a vector to ensure consistent storage.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash string.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an in-memory vector store using HNSW-like nearest neighbor search.
 */
export class MemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // Stores vectors by hash for uniqueness.
    this.metadata = new Map(); // Stores associated metadata by hash.
  }

  /**
   * Adds a vector and its metadata to the store.
   * @param {number[]} vector - The vector to store.
   * @param {any} meta - Metadata associated with the vector.
   */
  addVector(vector, meta = null) {
    const hash = generateVectorHash(vector);
    this.vectors.set(hash, vector);
    this.metadata.set(hash, meta);
  }

  /**
   * Retrieves the k nearest neighbors to the given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ vector, metadata, distance}>} - Array of nearest neighbors.
   */
  getNearestNeighbors(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const results = [];

    for (const [hash, vector] of this.vectors.entries()) {
      const distance = calculateDistance(queryVector, vector);
      results.push({
        vector,
        metadata: this.metadata.get(hash),
        distance
      });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }

  /**
   * Clears all vectors and metadata from the store.
   */
  clearStore() {
    this.vectors.clear();
    this.metadata.clear();
  }

  /**
   * Returns the total number of vectors in the store.
   * @returns {number} - Total number of stored vectors.
   */
  getVectorCount() {
    return this.vectors.size;
  }
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to check if a vector is valid (finite numbers only).
 * @param {number[]} vector - The vector to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidVector(vector) {
  return Array.isArray(vector) && vector.every(val => typeof val === 'number' && isFinite(val));
}
