/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingVectorStore
 * Written: 2026-04-01T22:02:17.129Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash key for a vector to ensure unique and consistent storage.
 * @param {Array<number>} vector - The embedding vector.
 * @returns {string} - A unique hash for the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The cosine similarity value (-1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero-length or zero-magnitude.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * An in-memory vector store for efficient similarity search.
 */
export const vectorStore = {
  store: new Map(),

  /**
   * Adds a vector to the store with an associated ID.
   * @param {string} id - The unique identifier for the vector.
   * @param {Array<number>} vector - The embedding vector.
   */
  addVector(id, vector) {
    const hash = generateVectorHash(vector);
    this.store.set(hash, { id, vector });
  },

  /**
   * Searches for the most similar vectors to a given query vector.
   * @param {Array<number>} queryVector - The vector to search against.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{id, similarity}>} - The top K most similar vectors.
   */
  search(queryVector, topK = 5) {
    const results = [];

    for (const { id, vector } of this.store.values()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ id, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity
      .slice(0, topK); // Return top K results
  },

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.store.clear();
  }
};

/**
 * Normalizes a vector to unit length.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero-magnitude vector.');
  }
  return vector.map(value => value / magnitude);
}

/**
 * Utility to batch normalize a list of vectors.
 * @param {Array<Array<number>>} vectors - The list of vectors to normalize.
 * @returns {Array<Array<number>>} - The list of normalized vectors.
 */
export function batchNormalizeVectors(vectors) {
  return vectors.map(normalizeVector);
}