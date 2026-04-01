/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorMemoryStore
 * Written: 2026-04-01T22:21:44.188Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorMemoryStore.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for an input vector to use as a key.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Unique hash for the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * Class representing an HNSW-like graph for approximate nearest neighbor search.
 */
export class VectorMemoryStore {
  constructor() {
    this.nodes = new Map(); // Stores vectors and their connections.
  }

  /**
   * Add a vector to the memory store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const key = hashVector(vector);
    if (this.nodes.has(key)) return; // Avoid duplicates.

    const neighbors = this._findNearestNeighbors(vector, 5); // Find 5 nearest neighbors.
    this.nodes.set(key, { vector, neighbors });

    // Update neighbors to include this new vector.
    for (const neighbor of neighbors) {
      this.nodes.get(neighbor).neighbors.push(key);
    }
  }

  /**
   * Retrieve the nearest neighbors of a vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {number[][]} - Array of nearest neighbor vectors.
   */
  getNearestNeighbors(queryVector, k) {
    const nearestKeys = this._findNearestNeighbors(queryVector, k);
    return nearestKeys.map((key) => this.nodes.get(key).vector);
  }

  /**
   * Internal method to find nearest neighbors.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of neighbors to find.
   * @returns {string[]} - Array of keys for the nearest neighbors.
   */
  _findNearestNeighbors(queryVector, k) {
    const distances = [];

    for (const [key, { vector }] of this.nodes.entries()) {
      const distance = euclideanDistance(queryVector, vector);
      distances.push({ key, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map((entry) => entry.key);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map((val) => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing or initialization.
 * @param {number} dimensions - Number of dimensions for the vector.
 * @param {number} [min=-1] - Minimum value for each dimension.
 * @param {number} [max=1] - Maximum value for each dimension.
 * @returns {number[]} - Randomly generated vector.
 */
export function generateRandomVector(dimensions, min = -1, max = 1) {
  return Array.from({ length: dimensions }, () => Math.random() * (max - min) + min);
}

// Example usage:
// const store = new VectorMemoryStore();
// const vec1 = normalizeVector([1, 2, 3]);
// const vec2 = normalizeVector([4, 5, 6]);
// store.addVector(vec1);
// store.addVector(vec2);
// console.log(store.getNearestNeighbors([1, 2, 3], 1));