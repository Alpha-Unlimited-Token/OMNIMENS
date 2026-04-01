/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-01T22:09:00.620Z
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
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Generates a unique hash for a vector for indexing purposes.
 * @param {number[]} vector - The vector to hash.
 * @returns {string} - A unique hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class implementing an in-memory HNSW graph for vector similarity search.
 */
export class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Map of node hash -> { vector, neighbors }
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const vectorHash = hashVector(vector);
    if (this.nodes.has(vectorHash)) {
      throw new Error('Vector already exists in the graph.');
    }

    this.nodes.set(vectorHash, { vector, neighbors: new Map() });

    // Connect to nearest neighbors (basic implementation: brute force search for simplicity)
    for (const [otherHash, otherNode] of this.nodes) {
      if (otherHash !== vectorHash) {
        const distance = euclideanDistance(vector, otherNode.vector);
        this.nodes.get(vectorHash).neighbors.set(otherHash, distance);
        otherNode.neighbors.set(vectorHash, distance);
      }
    }
  }

  /**
   * Searches for the k-nearest neighbors of a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of neighbors to return.
   * @returns {Array<{ vector, distance}>} - The k-nearest neighbors.
   */
  search(queryVector, k) {
    const distances = [];

    for (const { vector } of this.nodes.values()) {
      const distance = euclideanDistance(queryVector, vector);
      distances.push({ vector, distance });
    }

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }
}

/**
 * Utility function to normalize a vector (scale to unit length).
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to calculate the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Cannot calculate cosine similarity with a zero vector.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
