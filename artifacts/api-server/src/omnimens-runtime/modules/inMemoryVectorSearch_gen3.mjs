/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-01T22:08:42.573Z
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
 * Hashes a vector to a unique key for internal storage.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A hashed key representing the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * A class representing an HNSW graph for in-memory vector search.
 */
export class HNSW {
  constructor(maxNeighbors = 16) {
    this.graph = new Map();
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const key = hashVector(vector);
    if (this.graph.has(key)) return; // Avoid duplicates

    const neighbors = Array.from(this.graph.keys())
      .map(existingKey => ({
        key: existingKey,
        distance: euclideanDistance(vector, this.graph.get(existingKey).vector)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, this.maxNeighbors);

    this.graph.set(key, { vector, neighbors });

    // Update neighbors to include this vector
    neighbors.forEach(neighbor => {
      const neighborData = this.graph.get(neighbor.key);
      neighborData.neighbors.push({ key, distance: neighbor.distance });
      neighborData.neighbors.sort((a, b) => a.distance - b.distance);
      neighborData.neighbors = neighborData.neighbors.slice(0, this.maxNeighbors);
    });
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{ vector, distance}>} - The nearest neighbors.
   */
  search(queryVector, k = 5) {
    if (k <= 0) {
      throw new Error('k must be a positive integer');
    }

    const results = Array.from(this.graph.keys())
      .map(key => ({
        vector: this.graph.get(key).vector,
        distance: euclideanDistance(queryVector, this.graph.get(key).vector)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);

    return results;
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing.
 * @param {number} dimensions - The number of dimensions for the vector.
 * @param {number} count - The number of vectors to generate.
 * @returns {number[][]} - An array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  return Array.from({ length: count }, () =>
    Array.from({ length: dimensions }, () => Math.random())
  );
}

// Example usage (commented out for production):
// const hnsw = new HNSW();
// const vectors = generateRandomVectors(3, 10);
// vectors.forEach(vec => hnsw.addVector(vec));
// console.log(hnsw.search([0.5, 0.5, 0.5], 3));