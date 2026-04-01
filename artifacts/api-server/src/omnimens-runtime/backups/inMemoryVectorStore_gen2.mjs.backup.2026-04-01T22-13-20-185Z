/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:08:49.452Z
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
 * Computes the Euclidean distance between two vectors.
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
 * Generates a unique hash for a vector (used as an identifier).
 * @param {number[]} vector - The input vector.
 * @returns {string} - The hash of the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class implementing an in-memory HNSW graph for approximate nearest neighbor search.
 */
export class InMemoryVectorStore {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.graph = new Map(); // Node connections
    this.vectors = new Map(); // Vector storage
    this.maxNeighbors = maxNeighbors;
    this.efConstruction = efConstruction;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const id = hashVector(vector);
    if (this.vectors.has(id)) {
      throw new Error('Vector already exists in the store.');
    }

    this.vectors.set(id, vector);
    this.graph.set(id, []);

    if (this.graph.size > 1) {
      const nearestNeighbors = this.search(vector, this.efConstruction);
      for (const neighbor of nearestNeighbors) {
        this._connectNodes(id, neighbor.id);
      }
    }
  }

  /**
   * Searches for the k nearest neighbors of a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of neighbors to return.
   * @returns {Array<{id, distance}>} - The k nearest neighbors.
   */
  search(queryVector, k) {
    const visited = new Set();
    const candidates = [];
    const results = [];

    for (const [id, vector] of this.vectors.entries()) {
      const distance = euclideanDistance(queryVector, vector);
      candidates.push({ id, distance });
    }

    candidates.sort((a, b) => a.distance - b.distance);

    for (let i = 0; i < Math.min(k, candidates.length); i++) {
      results.push(candidates[i]);
      visited.add(candidates[i].id);
    }

    return results;
  }

  /**
   * Connects two nodes in the graph with bidirectional edges.
   * @param {string} id1 - The first node ID.
   * @param {string} id2 - The second node ID.
   * @*/
  _connectNodes(id1, id2) {
    const neighbors1 = this.graph.get(id1);
    const neighbors2 = this.graph.get(id2);

    if (!neighbors1.includes(id2)) {
      neighbors1.push(id2);
      if (neighbors1.length > this.maxNeighbors) {
        neighbors1.sort((a, b) => euclideanDistance(this.vectors.get(id1), this.vectors.get(a)) - euclideanDistance(this.vectors.get(id1), this.vectors.get(b)));
        neighbors1.pop();
      }
    }

    if (!neighbors2.includes(id1)) {
      neighbors2.push(id1);
      if (neighbors2.length > this.maxNeighbors) {
        neighbors2.sort((a, b) => euclideanDistance(this.vectors.get(id2), this.vectors.get(a)) - euclideanDistance(this.vectors.get(id2), this.vectors.get(b)));
        neighbors2.pop();
      }
    }
  }
}

/**
 * Utility to normalize a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
} 
