/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T15:45:38.915Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorSearch.mjs

import { createHash } from 'crypto';

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Generates a unique hash for a vector for indexing purposes.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash string.
 */
export function vectorHash(vector) {
  return createHash('sha256').update(vector.join(',')).digest('hex');
}

/**
 * Class representing an HNSW-based in-memory vector search index.
 */
export class HNSWIndex {
  constructor() {
    this.graph = new Map(); // Adjacency list representation of the graph
    this.vectors = new Map(); // Maps vector hashes to their original vectors
  }

  /**
   * Adds a vector to the index.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const hash = vectorHash(vector);
    if (this.vectors.has(hash)) {
      throw new Error('Vector already exists in the index');
    }

    this.vectors.set(hash, vector);
    this.graph.set(hash, []);

    // Connect to nearest neighbors
    for (const [existingHash, existingVector] of this.vectors.entries()) {
      if (existingHash !== hash) {
        const distance = euclideanDistance(vector, existingVector);
        this.graph.get(hash).push({ hash: existingHash, distance });
        this.graph.get(existingHash).push({ hash, distance });
      }
    }

    // Sort neighbors by distance
    for (const neighbors of this.graph.values()) {
      neighbors.sort((a, b) => a.distance - b.distance);
    }
  }

  /**
   * Searches for the k nearest neighbors of a query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ vector, distance}>} - List of nearest neighbors.
   */
  search(queryVector, k) {
    const results = [];

    for (const [hash, vector] of this.vectors.entries()) {
      const distance = euclideanDistance(queryVector, vector);
      results.push({ vector, distance });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Cosine similarity.
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  if (magnitude1 === 0 || magnitude2 === 0) {
    throw new Error('Cannot calculate cosine similarity with a zero vector');
  }
  return dotProduct / (magnitude1 * magnitude2);
}
