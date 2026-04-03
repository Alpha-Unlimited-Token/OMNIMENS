/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-03T15:48:06.613Z
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
 * Utility function to compute cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to hash a vector for efficient storage/retrieval.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash of the vector.
 */
export function hashVector(vector) {
  const vectorString = vector.join(',');
  return createHash('sha256').update(vectorString).digest('hex');
}

/**
 * In-memory vector cache for storing embeddings and performing ANN search.
 */
class InMemoryVectorCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Add a vector to the cache.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - Embedding vector.
   */
  addVector(id, vector) {
    const hash = hashVector(vector);
    this.cache.set(hash, { id, vector });
  }

  /**
   * Find the nearest neighbors of a given vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id, similarity}>} - Nearest neighbors with similarity scores.
   */
  findNearestNeighbors(queryVector, k = 1) {
    const neighbors = [];

    for (const { id, vector } of this.cache.values()) {
      const similarity = cosineSimilarity(queryVector, vector);
      neighbors.push({ id, similarity });
    }

    neighbors.sort((a, b) => b.similarity - a.similarity);

    return neighbors.slice(0, k);
  }
}

/**
 * Create a new instance of the in-memory vector cache.
 * @returns {InMemoryVectorCache} - Instance of the vector cache.
 */
export function createVectorCache() {
  return new InMemoryVectorCache();
}

/**
 * Example usage:
 * const cache = createVectorCache();
 * cache.addVector('vector1', [0.1, 0.2, 0.3]);
 * cache.addVector('vector2', [0.4, 0.5, 0.6]);
 * const neighbors = cache.findNearestNeighbors([0.1, 0.2, 0.3], 1);
 * console.log(neighbors);
 */