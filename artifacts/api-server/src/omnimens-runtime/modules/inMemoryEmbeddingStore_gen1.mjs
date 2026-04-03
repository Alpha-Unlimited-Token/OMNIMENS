/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingStore
 * Written: 2026-04-03T15:45:18.144Z
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
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Handle edge case where one or both vectors are zero vectors
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Stores embeddings in memory and performs efficient nearest neighbor searches.
 */
export class InMemoryEmbeddingStore {
  constructor() {
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - Unique identifier for the embedding.
   * @param {number[]} embedding - Vector representation.
   */
  addEmbedding(key, embedding) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    this.store.set(key, embedding);
  }

  /**
   * Searches for the nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search against.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{key, similarity}>} - Nearest neighbors sorted by similarity.
   */
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('Number of neighbors (k) must be greater than 0');
    }

    const results = [];

    for (const [key, embedding] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, embedding);
      results.push({ key, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity
      .slice(0, k); // Return top-k results
  }

  /**
   * Removes an embedding by key.
   * @param {string} key - Unique identifier for the embedding.
   */
  removeEmbedding(key) {
    if (!this.store.has(key)) {
      throw new Error(`Key '${key}' does not exist in the store.`);
    }
    this.store.delete(key);
  }

  /**
   * Clears all embeddings from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Generates a unique hash for a given vector.
 * @param {number[]} vector - The input vector.
 * @returns {string} - SHA-256 hash of the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}