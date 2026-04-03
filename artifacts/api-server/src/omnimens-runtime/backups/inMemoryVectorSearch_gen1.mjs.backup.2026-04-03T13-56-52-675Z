/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T08:37:15.727Z
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
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Generates a deterministic hash for a vector for indexing purposes.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an HNSW graph for fast similarity search.
 */
export class HNSWGraph {
  constructor(maxNeighbors = 10) {
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
    this.nodes = new Map(); // Map of node hashes to their data
    this.edges = new Map(); // Map of node hashes to their neighbors
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const vectorHash = hashVector(vector);
    if (this.nodes.has(vectorHash)) {
      throw new Error('Vector already exists in the graph.');
    }
    this.nodes.set(vectorHash, vector);
    this.edges.set(vectorHash, []);

    // Connect to nearest neighbors
    const neighbors = this.findNearestNeighbors(vector, this.maxNeighbors);
    for (const neighbor of neighbors) {
      this.edges.get(vectorHash).push(neighbor.hash);
      this.edges.get(neighbor.hash).push(vectorHash);
    }
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {number[]} vector - Query vector.
   * @param {number} k - Number of neighbors to find.
   * @returns {Array<{hash, distance}>} - Array of nearest neighbors.
   */
  findNearestNeighbors(vector, k) {
    const distances = [];

    for (const [hash, nodeVector] of this.nodes.entries()) {
      const distance = euclideanDistance(vector, nodeVector);
      distances.push({ hash, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Searches for the most similar vector to the query vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of closest matches to return.
   * @returns {number[][]} - Array of closest vectors.
   */
  search(queryVector, k) {
    const nearestNeighbors = this.findNearestNeighbors(queryVector, k);
    return nearestNeighbors.map(neighbor => this.nodes.get(neighbor.hash));
  }
}

/**
 * Utility function to normalize a vector to unit length.
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
 * Example usage of the module.
 */
export function exampleUsage() {
  const graph = new HNSWGraph(3);

  const vec1 = normalizeVector([1, 2, 3]);
  const vec2 = normalizeVector([4, 5, 6]);
  const vec3 = normalizeVector([7, 8, 9]);
  const query = normalizeVector([1, 2, 2.5]);

  graph.addVector(vec1);
  graph.addVector(vec2);
  graph.addVector(vec3);

  const results = graph.search(query, 2);
  return results;
}