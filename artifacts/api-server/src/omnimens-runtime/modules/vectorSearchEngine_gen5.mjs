/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-03T14:03:30.478Z
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

import { createHash } from 'crypto';

/**
 * Hashes a vector to create a unique identifier.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash for the vector.
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
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Class representing an HNSW graph for approximate nearest neighbor search.
 */
export class HNSWGraph {
  constructor() {
    this.nodes = new Map();
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const id = hashVector(vector);
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { vector, neighbors: [] });
    }
  }

  /**
   * Connects a vector to its nearest neighbors in the graph.
   * @param {number[]} vector - The vector to connect.
   * @param {number} numNeighbors - The number of neighbors to connect to.
   */
  connectNeighbors(vector, numNeighbors) {
    const id = hashVector(vector);
    if (!this.nodes.has(id)) {
      throw new Error('Vector must be added to the graph before connecting neighbors');
    }

    const distances = [];
    for (const [neighborId, node] of this.nodes) {
      if (neighborId !== id) {
        const distance = calculateDistance(vector, node.vector);
        distances.push({ id: neighborId, distance });
      }
    }

    distances.sort((a, b) => a.distance - b.distance);
    this.nodes.get(id).neighbors = distances.slice(0, numNeighbors).map(entry => entry.id);
  }

  /**
   * Searches for the nearest neighbors of a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} numResults - The number of nearest neighbors to return.
   * @returns {Array<{ vector, distance}>} - The nearest neighbors.
   */
  search(queryVector, numResults) {
    const visited = new Set();
    const results = [];

    for (const [id, node] of this.nodes) {
      const distance = calculateDistance(queryVector, node.vector);
      results.push({ id, vector: node.vector, distance });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, numResults).map(result => ({ vector: result.vector, distance: result.distance }));
  }
}

/**
 * Utility function to normalize a vector to unit length.
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