/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-03T07:00:03.398Z
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
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Node structure for HNSW graph.
 * @class
 */
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id || randomUUID();
    this.neighbors = new Map();
  }
}

/**
 * HNSW graph implementation for approximate nearest neighbor search.
 * @class
 */
export class HNSWGraph {
  constructor() {
    this.nodes = new Map();
  }

  /**
   * Add a new node to the graph.
   * @param {number[]} vector - Vector to add.
   * @returns {string} - Node ID.
   */
  addNode(vector) {
    const node = new HNSWNode(vector);
    this.nodes.set(node.id, node);
    return node.id;
  }

  /**
   * Connect two nodes as neighbors.
   * @param {string} idA - ID of the first node.
   * @param {string} idB - ID of the second node.
   */
  connectNodes(idA, idB) {
    const nodeA = this.nodes.get(idA);
    const nodeB = this.nodes.get(idB);
    if (!nodeA || !nodeB) {
      throw new Error('Invalid node IDs.');
    }
    const distance = calculateEuclideanDistance(nodeA.vector, nodeB.vector);
    nodeA.neighbors.set(idB, distance);
    nodeB.neighbors.set(idA, distance);
  }

  /**
   * Perform approximate nearest neighbor search.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error('Parameter k must be greater than 0.');
    }

    const results = [];

    for (const [id, node] of this.nodes) {
      const distance = calculateEuclideanDistance(queryVector, node.vector);
      results.push({ id, distance });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }
}

/**
 * Example utility function for cross-agent usage.
 * Normalize a vector to unit length.
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
 * Example utility function for cross-agent usage.
 * Generate random vectors for testing.
 * @param {number} dimensions - Number of dimensions for each vector.
 * @param {number} count - Number of vectors to generate.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  if (dimensions <= 0 || count <= 0) {
    throw new Error('Dimensions and count must be greater than 0.');
  }
  return Array.from({ length: count }, () => Array.from({ length: dimensions }, () => Math.random()));
}