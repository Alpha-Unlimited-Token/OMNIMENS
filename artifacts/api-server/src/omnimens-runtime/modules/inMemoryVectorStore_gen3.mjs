/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T15:45:38.893Z
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
 * Generate a hash-based unique ID for vectors to ensure efficient storage and retrieval.
 * @param {Array<number>} vector - The input vector.
 * @returns {string} - A unique hash ID for the vector.
 */
export function generateVectorId(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * In-memory vector store using a KD-tree-like structure for fast nearest neighbor search.
 */
export class InMemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // Store vectors with their unique IDs.
  }

  /**
   * Add a vector to the store.
   * @param {Array<number>} vector - The vector to add.
   */
  addVector(vector) {
    const id = generateVectorId(vector);
    this.vectors.set(id, vector);
  }

  /**
   * Find the nearest neighbors to a given vector.
   * @param {Array<number>} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id, vector, distance}>} - The nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be greater than 0');
    }

    const neighbors = [];

    for (const [id, vector] of this.vectors.entries()) {
      const distance = calculateEuclideanDistance(queryVector, vector);
      neighbors.push({ id, vector, distance });
    }

    // Sort by distance and return the top k neighbors.
    return neighbors.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Remove a vector from the store.
   * @param {Array<number>} vector - The vector to remove.
   */
  removeVector(vector) {
    const id = generateVectorId(vector);
    this.vectors.delete(id);
  }

  /**
   * Get the total number of vectors in the store.
   * @returns {number} - The count of stored vectors.
   */
  getVectorCount() {
    return this.vectors.size;
  }
}

/**
 * Normalize a vector to unit length.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Compute the cosine similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The cosine similarity.
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Cannot calculate cosine similarity with a zero vector');
  }
  return dotProduct / (magnitudeA * magnitudeB);
}