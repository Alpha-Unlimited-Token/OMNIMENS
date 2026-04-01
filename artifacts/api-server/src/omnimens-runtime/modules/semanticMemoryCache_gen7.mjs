/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryCache
 * Written: 2026-04-01T22:18:46.941Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticMemoryCache.mjs

import { createHash } from 'crypto';

/**
 * Compute the cosine similarity between two vectors.
 * @param {Float32Array} vecA - First vector.
 * @param {Float32Array} vecB - Second vector.
 * @returns {number} - Cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vector dimensions must match.');

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generate a unique hash for a given vector.
 * @param {Float32Array} vector - Input vector.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  for (const value of vector) {
    hash.update(value.toString());
  }
  return hash.digest('hex');
}

/**
 * SemanticMemoryCache class for storing and retrieving vectors.
 */
export class SemanticMemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Add a vector and its associated metadata to the cache.
   * @param {Float32Array} vector - Input vector.
   * @param {any} metadata - Metadata associated with the vector.
   */
  add(vector, metadata) {
    const key = hashVector(vector);
    this.store.set(key, { vector, metadata });
  }

  /**
   * Retrieve the top-N closest vectors to the query vector.
   * @param {Float32Array} queryVector - Query vector.
   * @param {number} topN - Number of closest matches to retrieve.
   * @returns {Array<{ similarity, metadata}>} - Top-N closest matches.
   */
  retrieve(queryVector, topN = 5) {
    const results = [];

    for (const { vector, metadata } of this.store.values()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ similarity, metadata });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Clear all stored vectors and metadata.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get the total number of stored vectors.
   * @returns {number} - Count of stored vectors.
   */
  size() {
    return this.store.size;
  }
}

/**
 * Normalize a vector to unit length.
 * @param {Float32Array} vector - Input vector.
 * @returns {Float32Array} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}

/**
 * Create a random vector for testing or initialization.
 * @param {number} dimensions - Number of dimensions.
 * @returns {Float32Array} - Random vector.
 */
export function createRandomVector(dimensions) {
  const vector = new Float32Array(dimensions);
  for (let i = 0; i < dimensions; i++) {
    vector[i] = Math.random() * 2 - 1; // Random values between -1 and 1
  }
  return normalizeVector(vector);
}
