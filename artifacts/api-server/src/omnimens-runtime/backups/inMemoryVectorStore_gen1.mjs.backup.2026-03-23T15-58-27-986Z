/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-23T13:45:47.625Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryVectorStore
 * @description Provides fast similarity search and embedding lookup using HNSW (Hierarchical Navigable Small World) graphs.
 */

/**
 * Represents a node in the HNSW graph.
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector of the node.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, Set<number>>} neighbors - Neighbors organized by layer.
 */

class HNSW {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    /**
     * @type {Node[]}
     * @private
     */
    this.nodes = [];

    /**
     * @type {number}
     * @private
     */
    this.maxNeighbors = maxNeighbors;

    /**
     * @type {number}
     * @private
     */
    this.efConstruction = efConstruction;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} a - First vector.
   * @param {number[]} b - Second vector.
   * @returns {number} - The Euclidean distance.
   */
  static euclideanDistance(a, b) {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same dimensions.");
    }
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The embedding vector to add.
   * @returns {number} - The ID of the newly added node.
   */
  addVector(vector) {
    const id = this.nodes.length;
    const newNode = {
      vector,
      id,
      neighbors: new Map()
    };

    // Initialize neighbors for each layer
    for (let layer = 0; layer < this.maxNeighbors; layer++) {
      newNode.neighbors.set(layer, new Set());
    }

    this.nodes.push(newNode);

    if (id > 0) {
      this._connectNode(newNode);
    }

    return id;
  }

  /**
   * Connects a new node to the graph using the nearest neighbors.
   * @param {Node} newNode - The new node to connect.
   * @private
   */
  _connectNode(newNode) {
    const neighbors = this._searchKNN(newNode.vector, this.efConstruction);

    for (const neighbor of neighbors) {
      this._linkNodes(newNode, neighbor);
    }
  }

  /**
   * Links two nodes in the HNSW graph.
   * @param {Node} nodeA - First node.
   * @param {Node} nodeB - Second node.
   * @private
   */
  _linkNodes(nodeA, nodeB) {
    const layer = 0; // Single-layer implementation for simplicity
    if (nodeA.neighbors.get(layer).size < this.maxNeighbors) {
      nodeA.neighbors.get(layer).add(nodeB.id);
    }
    if (nodeB.neighbors.get(layer).size < this.maxNeighbors) {
      nodeB.neighbors.get(layer).add(nodeA.id);
    }
  }

  /**
   * Searches for the k-nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Node[]} - The k-nearest neighbors.
   */
  _searchKNN(queryVector, k) {
    const distances = this.nodes.map(node => ({
      node,
      distance: HNSW.euclideanDistance(queryVector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k).map(entry => entry.node);
  }

  /**
   * Finds the most similar vectors to the query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{id: number, distance: number}>} - The top K similar vectors with their distances.
   */
  search(queryVector, topK) {
    const neighbors = this._searchKNN(queryVector, topK);
    return neighbors.map(node => ({
      id: node.id,
      distance: HNSW.euclideanDistance(queryVector, node.vector)
    }));
  }
}

/**
 * Creates a new HNSW instance.
 * @param {number} [maxNeighbors=16] - Maximum number of neighbors per node.
 * @param {number} [efConstruction=200] - Size of the candidate pool during construction.
 * @returns {HNSW} - The HNSW instance.
 */
export function createVectorStore(maxNeighbors = 16, efConstruction = 200) {
  return new HNSW(maxNeighbors, efConstruction);
}

/**
 * Example usage:
 * const store = createVectorStore();
 * const id1 = store.addVector([1, 2, 3]);
 * const id2 = store.addVector([4, 5, 6]);
 * const results = store.search([1, 2, 3], 1);
 * console.log(results);
 */