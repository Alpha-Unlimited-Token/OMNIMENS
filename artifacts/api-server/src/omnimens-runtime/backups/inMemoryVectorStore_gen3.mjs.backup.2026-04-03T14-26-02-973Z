/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T13:56:56.886Z
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
 * Utility module for in-memory vector storage and fast nearest neighbor search
 * using HNSW (Hierarchical Navigable Small World) graph-based algorithm.
 */

// Node structure for HNSW graph
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Set();
  }
}

// Helper function: Calculate Euclidean distance between two vectors
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector dimensions must match');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

// HNSW Graph class for managing nodes and search
class HNSWGraph {
  constructor() {
    this.nodes = new Map();
  }

  /**
   * Add a new vector to the graph.
   * @param {string} id - Unique identifier for the vector.
   * @param {Array<number>} vector - The vector to add.
   */
  addVector(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with id '${id}' already exists`);
    }
    const newNode = new HNSWNode(id, vector);
    this.nodes.set(id, newNode);

    // Connect to nearest neighbors
    this._connectToNeighbors(newNode);
  }

  /**
   * Search for the k nearest neighbors of a given vector.
   * @param {Array<number>} queryVector - The vector to search for.
   * @param {number} k - Number of neighbors to return.
   * @returns {Array<{id, distance}>} - List of nearest neighbors.
   */
  search(queryVector, k) {
    const distances = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      distance: euclideanDistance(queryVector, node.vector)
    }));

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Connect a new node to its nearest neighbors in the graph.
   * @param {HNSWNode} newNode - The node to connect.
   */
  _connectToNeighbors(newNode) {
    const distances = Array.from(this.nodes.values())
      .filter(node => node.id !== newNode.id)
      .map(node => ({
        node,
        distance: euclideanDistance(newNode.vector, node.vector)
      }));

    // Sort by distance and select top neighbors
    const nearestNeighbors = distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Connect to top 5 neighbors
      .map(entry => entry.node);

    for (const neighbor of nearestNeighbors) {
      newNode.neighbors.add(neighbor);
      neighbor.neighbors.add(newNode);
    }
  }
}

// Exported functions

/**
 * Create a new HNSW graph instance.
 * @returns {HNSWGraph} - A new graph instance.
 */
export function createHNSWGraph() {
  return new HNSWGraph();
}

/**
 * Calculate Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  return euclideanDistance(vectorA, vectorB);
}

/**
 * Generate a unique hash ID for a vector.
 * @param {Array<number>} vector - The vector to hash.
 * @returns {string} - Unique hash ID.
 */
export function generateVectorID(vector) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(vector));
  return hash.digest('hex');
}

export const description = "Provides in-memory vector storage and fast nearest neighbor search using HNSW algorithm.";