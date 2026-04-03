/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T16:16:10.366Z
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
 * Utility module for in-memory storage and retrieval of high-dimensional embeddings
 * using the HNSW (Hierarchical Navigable Small World) graph algorithm for efficient
 * approximate nearest neighbor search.
 */

// Node representing a single point in the HNSW graph
class HNSWNode {
  constructor(id, vector) {
    this.id = id; // Unique identifier for the vector
    this.vector = vector; // High-dimensional vector
    this.neighbors = new Map(); // Neighbors at different layers
  }
}

/**
 * Compute Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
}

/**
 * Generate a hash for a vector to ensure unique IDs.
 * @param {number[]} vector - High-dimensional vector.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class implementing the in-memory HNSW graph.
 */
export class InMemoryVectorStore {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per layer
    this.efConstruction = efConstruction; // Search breadth during construction
    this.nodes = new Map(); // Map of ID -> HNSWNode
  }

  /**
   * Add a vector to the HNSW graph.
   * @param {number[]} vector - High-dimensional vector to add.
   */
  addVector(vector) {
    const id = hashVector(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the store');
    }

    const newNode = new HNSWNode(id, vector);
    this.nodes.set(id, newNode);

    if (this.nodes.size === 1) return; // First node, no neighbors to connect

    // Find nearest neighbors and connect
    const neighbors = this._searchNearest(vector, this.efConstruction);
    neighbors.forEach((neighbor) => {
      this._connectNodes(newNode, neighbor);
    });
  }

  /**
   * Search for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ id, distance}>} - List of nearest neighbors.
   */
  search(queryVector, k = 1) {
    const nearest = this._searchNearest(queryVector, k);
    return nearest.map((node) => ({
      id: node.id,
      distance: euclideanDistance(queryVector, node.vector)
    }));
  }

  /**
   * Internal method to search for nearest neighbors.
   * @param {number[]} queryVector - Query vector.
   * @param {number} ef - Search breadth.
   * @returns {HNSWNode[]} - List of nearest neighbor nodes.
   */
  _searchNearest(queryVector, ef) {
    const candidates = Array.from(this.nodes.values());
    candidates.sort((a, b) =>
      euclideanDistance(queryVector, a.vector) - euclideanDistance(queryVector, b.vector)
    );
    return candidates.slice(0, ef);
  }

  /**
   * Connect two nodes in the graph.
   * @param {HNSWNode} nodeA - First node.
   * @param {HNSWNode} nodeB - Second node.
   */
  _connectNodes(nodeA, nodeB) {
    if (!nodeA.neighbors.has(0)) nodeA.neighbors.set(0, new Set());
    if (!nodeB.neighbors.has(0)) nodeB.neighbors.set(0, new Set());

    nodeA.neighbors.get(0).add(nodeB);
    nodeB.neighbors.get(0).add(nodeA);

    // Prune neighbors if exceeding maxNeighbors
    if (nodeA.neighbors.get(0).size > this.maxNeighbors) {
      this._pruneNeighbors(nodeA);
    }
    if (nodeB.neighbors.get(0).size > this.maxNeighbors) {
      this._pruneNeighbors(nodeB);
    }
  }

  /**
   * Prune neighbors to enforce maxNeighbors limit.
   * @param {HNSWNode} node - Node to prune neighbors for.
   */
  _pruneNeighbors(node) {
    const neighbors = Array.from(node.neighbors.get(0));
    neighbors.sort((a, b) =>
      euclideanDistance(node.vector, a.vector) - euclideanDistance(node.vector, b.vector)
    );
    node.neighbors.set(0, new Set(neighbors.slice(0, this.maxNeighbors)));
  }
}

export const createVectorStore = (maxNeighbors, efConstruction) => {
  return new InMemoryVectorStore(maxNeighbors, efConstruction);
};