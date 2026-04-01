/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: redisVectorIndex
 * Written: 2026-04-01T22:21:40.282Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// redisVectorIndex.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for embedding keys.
 * @param {string} key - The key to hash.
 * @returns {string} - The hashed key.
 */
export function generateHashKey(key) {
  const hash = createHash('sha256');
  hash.update(key);
  return hash.digest('hex');
}

/**
 * Calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vector magnitude cannot be zero.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Create an in-memory vector index.
 * @returns {object} - The vector index object.
 */
export function createVectorIndex() {
  const index = new Map();

  return {
    /**
     * Add a vector to the index.
     * @param {string} key - Unique key for the vector.
     * @param {number[]} vector - High-dimensional embedding.
     */
    addVector(key, vector) {
      if (!Array.isArray(vector) || vector.some(isNaN)) {
        throw new Error('Vector must be an array of numbers.');
      }
      const hashedKey = generateHashKey(key);
      index.set(hashedKey, vector);
    },

    /**
     * Find the most similar vector in the index.
     * @param {number[]} queryVector - Query embedding.
     * @returns {object} - Closest match { key, similarity }.
     */
    findClosest(queryVector) {
      if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
        throw new Error('Query vector must be an array of numbers.');
      }

      let closestKey = null;
      let highestSimilarity = -Infinity;

      for (const [key, storedVector] of index.entries()) {
        const similarity = cosineSimilarity(queryVector, storedVector);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          closestKey = key;
        }
      }

      if (closestKey === null) {
        throw new Error('No vectors in the index.');
      }

      return { key: closestKey, similarity: highestSimilarity };
    },

    /**
     * Remove a vector from the index.
     * @param {string} key - Key of the vector to remove.
     */
    removeVector(key) {
      const hashedKey = generateHashKey(key);
      if (!index.delete(hashedKey)) {
        throw new Error('Key not found in index.');
      }
    },

    /**
     * Get all vectors in the index.
     * @returns {Array} - Array of { key, vector }.
     */
    getAllVectors() {
      return Array.from(index.entries()).map(([key, vector]) => ({ key, vector }));
    }
  };
}
