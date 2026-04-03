/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingStore
 * Written: 2026-04-03T15:48:06.599Z
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
 * Generate a unique hash for a vector to store and retrieve it efficiently.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash for the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculate the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value (-1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * In-memory embedding store for vectors with fast similarity search.
 */
export const inMemoryEmbeddingStore = {
  _store: new Map(),

  /**
   * Add a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers');
    }

    const hash = generateVectorHash(vector);
    this._store.set(id, { vector, hash });
  },

  /**
   * Find the most similar vectors to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} topN - Number of top similar vectors to return.
   * @returns {Array<{ id, similarity}>} - Array of top similar vectors with their similarity scores.
   */
  findMostSimilar(queryVector, topN = 5) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers');
    }

    const similarities = [];

    for (const [id, { vector }] of this._store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ id, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  },

  /**
   * Remove a vector from the store by its ID.
   * @param {string} id - The ID of the vector to remove.
   */
  removeVector(id) {
    this._store.delete(id);
  },

  /**
   * Clear all vectors from the store.
   */
  clearStore() {
    this._store.clear();
  }
};