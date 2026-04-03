/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T21:51:05.032Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorSearchEngine.mjs

import { randomUUID } from 'crypto';

/**
 * Utility function to calculate Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Class representing an HNSW graph for approximate nearest neighbor search.
 */
export class HNSW {
  constructor(maxNodes = 100, maxEdgesPerNode = 10) {
    this.maxNodes = maxNodes;
    this.maxEdgesPerNode = maxEdgesPerNode;
    this.graph = new Map();
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const id = randomUUID();
    if (this.graph.size >= this.maxNodes) {
      throw new Error('Graph is at maximum capacity');
    }

    const neighbors = this._findNearestNeighbors(vector, this.maxEdgesPerNode);
    this.graph.set(id, { vector, neighbors });

    // Update neighbors to include this node.
    for (const neighborId of neighbors) {
      this.graph.get(neighborId).neighbors.push(id);
    }
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - Vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  search(queryVector, k = 1) {
    const distances = Array.from(this.graph.entries()).map(([id, { vector }]) => ({
      id,
      distance: euclideanDistance(queryVector, vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Finds the nearest neighbors for a given vector.
   * @param {number[]} vector - Vector to search for.
   * @param {number} maxNeighbors - Maximum number of neighbors to return.
   * @returns {string[]} - IDs of nearest neighbors.
   */
  _findNearestNeighbors(vector, maxNeighbors) {
    const distances = Array.from(this.graph.entries()).map(([id, { vector: existingVector }]) => ({
      id,
      distance: euclideanDistance(vector, existingVector)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, maxNeighbors).map(({ id }) => id);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Vector to normalize.
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
 * Utility function to generate random vectors for testing.
 * @param {number} dimensions - Number of dimensions for each vector.
 * @param {number} count - Number of vectors to generate.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  return Array.from({ length: count }, () => Array.from({ length: dimensions }, () => Math.random()));
}

/**
 * Example usage:
 * const hnsw = new HNSW();
 * const vectors = generateRandomVectors(3, 10);
 * vectors.forEach(vector => hnsw.addVector(vector));
 * const query = [0.1, 0.2, 0.3];
 * console.log(hnsw.search(query, 3));
 */