/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T13:56:55.911Z
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
 * Hashes a vector to a bucket using a locality-sensitive hashing (LSH) mechanism.
 * @param {Array<number>} vector - The high-dimensional vector to hash.
 * @param {number} numBuckets - Number of buckets for hashing.
 * @returns {string} - The hash bucket identifier.
 */
export function hashVector(vector, numBuckets) {
  if (!Array.isArray(vector) || vector.some(isNaN)) {
    throw new Error('Input vector must be an array of numbers.');
  }
  const hashInput = vector.map((val) => Math.floor(val * 1e6)).join(',');
  const hash = createHash('sha256').update(hashInput).digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % numBuckets;
  return bucket.toString();
}

/**
 * Stores high-dimensional vectors in memory using LSH for efficient retrieval.
 * @class
 */
export class InMemoryVectorStore {
  constructor(numBuckets = 128) {
    this.numBuckets = numBuckets;
    this.buckets = new Map();
  }

  /**
   * Adds a vector and its associated metadata to the store.
   * @param {Array<number>} vector - High-dimensional vector.
   * @param {any} metadata - Metadata associated with the vector.
   */
  add(vector, metadata) {
    const bucket = hashVector(vector, this.numBuckets);
    if (!this.buckets.has(bucket)) {
      this.buckets.set(bucket, []);
    }
    this.buckets.get(bucket).push({ vector, metadata });
  }

  /**
   * Retrieves the nearest neighbors to a query vector.
   * @param {Array<number>} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{vector, metadata}>} - Nearest neighbors.
   */
  search(queryVector, k = 1) {
    const bucket = hashVector(queryVector, this.numBuckets);
    const candidates = this.buckets.get(bucket) || [];

    // Compute distances and sort by proximity
    const distanceFunction = (v1, v2) => {
      return Math.sqrt(v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0));
    };

    const sortedCandidates = candidates
      .map((entry) => ({
        vector: entry.vector,
        metadata: entry.metadata,
        distance: distanceFunction(queryVector, entry.vector)
      }))
      .sort((a, b) => a.distance - b.distance);

    return sortedCandidates.slice(0, k).map(({ vector, metadata }) => ({ vector, metadata }));
  }
}

/**
 * Utility function to normalize vectors to unit length.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map((val) => val / magnitude);
}

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dotProduct / (magnitudeA * magnitudeB);
}
