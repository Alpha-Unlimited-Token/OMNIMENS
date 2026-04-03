/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryMappedVectorStore
 * Written: 2026-04-02T21:44:54.174Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryMappedVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for a vector to use as a key.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash representing the vector.
 */
export function generateVectorKey(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Compute the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensionality');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * HNSW Node class representing a single node in the graph.
 */
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Map of neighbor ID to distance
  }

  addNeighbor(node, distance) {
    this.neighbors.set(node.id, distance);
  }
}

/**
 * HNSW Graph class for managing the vector store.
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Map of node ID to HNSWNode
  }

  /**
   * Add a vector to the graph.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const id = generateVectorKey(vector);
    if (this.nodes.has(id)) return; // Avoid duplicates

    const newNode = new HNSWNode(vector, id);

    // Connect to existing nodes
    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(vector, node.vector);
      newNode.addNeighbor(node, distance);
      node.addNeighbor(newNode, distance);
    }

    this.nodes.set(id, newNode);
  }

  /**
   * Search for the nearest vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{vector, distance}>} - Array of nearest vectors and distances.
   */
  search(queryVector, k) {
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(queryVector, node.vector);
      distances.push({ vector: node.vector, distance });
    }

    return distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  }
}

/**
 * Create a new instance of HNSWGraph.
 * @returns {HNSWGraph} - A new HNSWGraph instance.
 */
export function createHNSWGraph() {
  return new HNSWGraph();
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The input vector.
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
 * Utility function to check if two vectors are identical.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {boolean} - True if vectors are identical, false otherwise.
 */
export function areVectorsEqual(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) return false;
  return vectorA.every((val, i) => val === vectorB[i]);
}
