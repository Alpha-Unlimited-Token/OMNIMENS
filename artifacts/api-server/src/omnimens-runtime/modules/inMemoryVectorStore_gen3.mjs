/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:00:19.845Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Computes Euclidean distance between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length.');
  }
  return Math.sqrt(vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0));
}

/**
 * Generates a unique hash for a vector (useful for indexing).
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash string.
 */
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class implementing an in-memory HNSW-based vector store.
 */
export class InMemoryVectorStore {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map();
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const id = vectorHash(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the store.');
    }

    const neighbors = this._findNearestNeighbors(vector);
    this.nodes.set(id, { vector, neighbors });

    // Update neighbors to include the new vector.
    for (const neighbor of neighbors) {
      const neighborNode = this.nodes.get(neighbor);
      neighborNode.neighbors.push(id);
      neighborNode.neighbors = neighborNode.neighbors
        .sort((a, b) => euclideanDistance(vector, this.nodes.get(a).vector) - euclideanDistance(vector, this.nodes.get(b).vector))
        .slice(0, this.maxNeighbors);
    }
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {number[]} vector - Query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {number[][]} - Array of nearest neighbor vectors.
   */
  findNearest(vector, k = 5) {
    const distances = Array.from(this.nodes.entries()).map(([id, { vector: storedVector }]) => ({
      id,
      distance: euclideanDistance(vector, storedVector)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(({ id }) => this.nodes.get(id).vector);
  }

  /**
   * Internal method to find nearest neighbors for a vector.
   * @param {number[]} vector - Query vector.
   * @returns {string[]} - Array of neighbor IDs.
   */
  _findNearestNeighbors(vector) {
    const distances = Array.from(this.nodes.entries()).map(([id, { vector: storedVector }]) => ({
      id,
      distance: euclideanDistance(vector, storedVector)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, this.maxNeighbors).map(({ id }) => id);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors.
 * @param {number} dimensions - Number of dimensions.
 * @param {number} count - Number of vectors to generate.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  return Array.from({ length: count }, () => Array.from({ length: dimensions }, () => Math.random()));
}